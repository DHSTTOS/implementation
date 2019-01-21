package invalid.adininspector.backend;

//for GSON
import java.lang.reflect.Type;
//For polling
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

import invalid.adininspector.backend.records.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;

//project hasn't even started and we're already doing hacky shit

public class MongoConsumer {

    private MongoClientMediator mongoMediator;

    private KafkaConsumer<String, String> consumer;

    private Duration pollingTimeOut = Duration.ofMillis(100);

    // private String[] topics;
    List<String> topics;

    public MongoConsumer(String udid, String pass, String dbName) {

        mongoMediator = new MongoClientMediator(udid, pass, dbName);

        Properties props = new Properties();
        props.put("bootstrap.servers", "localhost:9092");
        props.put("group.id", "test");
        props.put("enable.auto.commit", "true");
        props.put("auto.commit.interval.ms", "1000");
        props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        props.put("auto.offset.reset", "earliest");

        consumer = new KafkaConsumer<>(props);

        // KafkaConsumer<String, String> consumer = new KafkaConsumer<String,
        // String>(props);

        // we do NOT subsrice to a topic, but initialize the first parition to the start
        // and read from here, assuring we'll read everything
        // this will be done once, all missing entries from kafka are added to the
        // appropriate collection.

        Collection<TopicPartition> partitions = getAllTopics();

        // TopicPartition topicPartition = new TopicPartition("test", 0);
        // List partitions = Arrays.asList(topicPartition);

        // manually assign the partition
        consumer.assign(partitions);
        consumer.seekToBeginning(partitions);

        ListenForRecords();
    }

    // TODO: should we check if records already exist?
    void ListenForRecords() {

        Gson gson = new Gson();

        while (true) {

            ConsumerRecords<String, String> records = consumer.poll(pollingTimeOut);

            for (ConsumerRecord<String, String> record : records) {
                //System.out.printf("offset = %d, key = %s, value = %s, partition = %d%n", record.offset(), record.key(),record.value(), record.partition());

                //System.out.println(record.value());

                Type type = new TypeToken<PacketRecord>() {
                }.getType();

                // convert it into a java object
                try {
                    PacketRecord incomingRecord = gson.fromJson(record.value(), type);
                    // set the offset as ID in the DB

                    incomingRecord.set_id(Long.toString(record.offset()));

                    // mongoMediator.addRecordToCollection(incomingRecord,record.topic());

                } catch (Exception e) {
                    System.out.println("Not impplemented type for record: " + record.value());
                }

            }
        }
    }

    Collection<TopicPartition> getAllTopics() {
        Collection<TopicPartition> kafkaTopics = new ArrayList<>();

        Map<String, List<PartitionInfo>> topicsMap;
        topicsMap = consumer.listTopics();

        System.out.println("******************************************");
        System.out.println("          L I S T    T O P I C S          ");
        System.out.println("******************************************\n");

        for (Map.Entry<String, List<PartitionInfo>> topic : topicsMap.entrySet()) {

            // __consumer_offsets is internal to kafka and should be ignored
            if (!topic.getKey().contentEquals("__consumer_offsets")) {
                kafkaTopics.add(new TopicPartition(topic.getKey(), 0));
                System.out.println("Topic: " + topic.getKey());
            }
            //
            // System.out.println("Value: " + topic.getValue() + "\n");

        }

        return kafkaTopics;
    }
}
