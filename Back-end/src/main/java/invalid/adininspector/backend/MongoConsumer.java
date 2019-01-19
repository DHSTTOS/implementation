package invalid.adininspector.backend;

//for GSON
import java.lang.reflect.Type;
//For polling
import java.time.Duration;

import invalid.adininspector.backend.records.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;

//project hasn't even started and we're already doing hacky shit

public class MongoConsumer {

    private MongoClientMediator mongoMediator;

    private KafkaConsumer<String, String> consumer;

    private Duration pollingTimeOut = Duration.ofMillis(100);

    private String[] topics;


    public MongoConsumer(String udid,String pass, String database )
    {
        mongoMediator = new MongoClientMediator("", "","");
     
    }

    //TODO: should we check if records already exist?
    void ListenForRecords()
    {

        while (true) {

            ConsumerRecords<String, String> records = consumer.poll(pollingTimeOut);


            for (ConsumerRecord<String, String> record : records) {
                System.out.printf("offset = %d, key = %s, value = %s, partition = %d%n", record.offset(), record.key(), record.value(), record.partition());

                Type type = new TypeToken<PacketRecord>() {}.getType();
                Gson gson = new Gson();

                //convert it into a java object
                PacketRecord incomingRecord = gson.fromJson(record.value(), type);
                //set the offset as ID in the DB
                incomingRecord.set_id(Long.toString(record.offset()));

                mongoMediator.addRecordToCollection(incomingRecord,record.topic());
            }
        }
    }
}
