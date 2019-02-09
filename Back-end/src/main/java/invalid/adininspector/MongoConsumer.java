/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector;

//for GSON
import java.lang.reflect.Type;
//For polling
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.reflect.TypeToken;
import com.mongodb.MongoSecurityException;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;

import invalid.adininspector.dataprocessing.DataProcessor;
import invalid.adininspector.exceptions.LoginFailureException;
import invalid.adininspector.records.AlarmRecord;
import invalid.adininspector.records.PacketRecordDesFromKafka;
import invalid.adininspector.records.Record;



//project hasn't even started and we're already doing hacky shit
//TODO: convert Timestampo date value into a mongoDB timestamp object
//TODO: check if changing Timestamp into a number fixes the use
//TODO: test ignoring timestamp object and add our own timestamp object

/**
 * The Mongo Consumer, as the name implies, consumes all messages from all topics
 * in the Kafka messaging system. Once a message is found it is passed along to
 * the Mongo Client for further processing.
 */
public class MongoConsumer {

	/**
	 * An instance of the Mongo Client Mediator, created with the credentials from
	 * the config file.
	 */
	private MongoClientMediator clientMediator;

	private KafkaConsumer<String, String> consumer;

	// private String[] topics;
	List<String> topics;

	/**
	 * This constructor logs into the specified database with the specified
	 * credentials and, on success, initializes the MongoClient variable and
	 * calls listenForRecords().
	 *
	 * @param udid user name to login with
	 * @param pass password to login with
	 * @param dbName the database to login into
	 * @throws LoginFailureException - if login failed, e.g. wrong username or password
	 */
	public MongoConsumer(String udid, String pass, String dbName) throws LoginFailureException {


		if(dbName.isEmpty()){
			throw new LoginFailureException("dbName cannot be empty");
		}

		try {
			clientMediator = new MongoClientMediator(udid, pass, dbName);

		} catch (MongoSecurityException e) {

			// force the caller to handle the exception
			throw new LoginFailureException(e.getMessage());
		}



		Properties props = new Properties();
		props.put("bootstrap.servers", "localhost:9092");
		props.put("group.id", "test");
		props.put("enable.auto.commit", "true");
		props.put("auto.commit.interval.ms", "1000");
		props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
		props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
		props.put("auto.offset.reset", "earliest");
		//  props.put("max.poll.records","-1");

		consumer = new KafkaConsumer<>(props);

		// KafkaConsumer<String, String> consumer = new KafkaConsumer<String,
		// String>(props);

		// we do NOT subsrice to a topic, but initialize the first parition to the start
		// and read from here, assuring we'll read everything
		// this will be done once, all missing entries from kafka are added to the
		// appropriate collection

		Collection<TopicPartition> partitions = getAllTopicsPartitions();

		// TopicPartition topicPartition = new TopicPartition("test", 0);
		// List partitions = Arrays.asList(topicPartition);

		// manually assign the partition
		consumer.assign(partitions);
		consumer.seekToBeginning(partitions);

		ListenForRecords();
	}

	/**
	 * This Method first calls getAllTopics and uses the array of topics to poll
	 * the kafka server for new messages.
	 * If new messages are found then the messages are passed to the Mongo Mediator
	 * for adding them to the Database.
	 * If no new messages are found for a topic notify the Mongo Mediator that
	 * the collection tied to the topic is ready for pre-processing.
	 */
	// TODO: we SHOULD check if records already exist?
	// TODO: put ALL stored data in mongo before processing it.
	// TODO: differentiage between realm-time and stored data
	void ListenForRecords() {

		GsonBuilder builder = new GsonBuilder(); 

		// Register an adapter to manage the date types as long values 
		builder.registerTypeAdapter(Date.class, new JsonDeserializer<Date>() { 
			public Date deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
				return new Date(json.getAsJsonPrimitive().getAsLong()); 
			} 
		});



		Gson gson = builder.create();

		Boolean processRecords = true;
		Boolean addedRecords = false;

		Duration pollingTimeOut = Duration.ofMillis(1000);

		while (true) {

			ConsumerRecords<String, String> records = consumer.poll(pollingTimeOut);

			for (ConsumerRecord<String, String> record : records ) {

				// System.out.printf("offset = %d, key = %s, value = %s, partition = %d%n",
				// record.offset(), record.key(),record.value(), record.partition());

				// System.out.println(record.value());

				// TODO: fix this horrible hack // relegate it to the Mediator??? maybe?
				Type type = null;

				if(record.value().contains("Alarm"))
				{
					type = new TypeToken<AlarmRecord>() {}.getType();
				}
				else if (record.value().contains("L2"))
				{
					type = new TypeToken<PacketRecordDesFromKafka>() {}.getType();
				}
				else
				{
					System.out.println("Non recognized record type");
					continue;
				}

				//TODO: Tell ankush to fix his messy timestamp handling becuase mongo does not work with special chars
				String fixedRecord = record.value().replace("$","");

				// clientMediator.p(fixedRecord);

				// convert it into a java object
				Record incomingRecord = gson.fromJson(fixedRecord, type);
				// set the offset as ID in the DB

				incomingRecord.set_id(Long.toString(record.offset()));

				clientMediator.addRecordToCollection(incomingRecord, record.topic());

				if(addedRecords)
					System.out.println(record.value());

			}

			if (records.isEmpty() && processRecords) {
				// TODO: notify the mediator that data needs to be processed
				// System.out.println("Stored Records have been added, process them");

				DataProcessor.processData(getTopicsForProcessing(), clientMediator);

				//stop processing records
				processRecords = false;

				//System.out.println("all stored records have been processed");
			}
		}
	}

	/**
	 * Asks the kafka server service which topics exist.
	 *
	 * @return an array of strings containing all the available kafka topics.
	 */
	Collection<TopicPartition> getAllTopicsPartitions() {
		Collection<TopicPartition> kafkaTopics = new ArrayList<>();

		Map<String, List<PartitionInfo>> topicsMap;
		topicsMap = consumer.listTopics();

		System.out.println("******************************************");
		System.out.println("          L I S T    T O P I C S          ");
		System.out.println("******************************************\n");

		for (Map.Entry<String, List<PartitionInfo>> topic : topicsMap.entrySet()) {

			// __consumer_offsets is internal to kafka and should be ignored
			// TODO: ignore real-time data
			if (!topic.getKey().contentEquals("__consumer_offsets") && topic.getKey().contentEquals("motor")) {
				kafkaTopics.add(new TopicPartition(topic.getKey(), 0));
				System.out.println("Topic: " + topic.getKey());
			}
			//
			// System.out.println("Value: " + topic.getValue() + "\n");

		}

		return kafkaTopics;
	}


	/**
	 * This convenience method returns a list of all topics to process as strings,
	 * excluding internal Kafka topics and real-time data since the processing
	 * call is done elsewhere.
	 *
	 * @return a list of topic names
	 */
	ArrayList<String> getTopicsForProcessing() {
		ArrayList<String> kafkaTopics = new ArrayList<>();

		Map<String, List<PartitionInfo>> topicsMap;
		topicsMap = consumer.listTopics();


		for (Map.Entry<String, List<PartitionInfo>> topic : topicsMap.entrySet()) {

			// __consumer_offsets is internal to kafka and should be ignored we also need to ingore everything that isn't Packet Records
			//--> that means ignore everything that contains an underscore
			if (!topic.getKey().contentEquals("__consumer_offsets") ) {
				kafkaTopics.add(topic.getKey());
			}
			// System.out.println("Value: " + topic.getValue() + "\n");
		}

		return kafkaTopics;
	}
}
