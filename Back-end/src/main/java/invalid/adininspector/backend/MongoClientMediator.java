package invalid.adininspector.backend;

import invalid.adininspector.backend.records.*;

import java.util.Arrays;

import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;

public class MongoClientMediator {

    private MongoClient client;
    private MongoDatabase db;

    public MongoClientMediator(String udid, String password, String dbName) {
        MongoCredential cred = MongoCredential.createCredential(udid, dbName, password.toCharArray());
        client = new MongoClient(new ServerAddress("localhost"), Arrays.asList(cred));
        db = client.getDatabase(dbName);
    }

    public void addRecordToCollection(Record record, String collection) {
        db.getCollection(collection).insertOne(record.getAsDocument());
    }

    public void addRecordsToCollection(String[] records, String collection) {

    }

    public void ProcessCollection(String collection) {

    }

    public MongoCollection<Document> getCollection(String collection) {
        return null;
    }

    public String getStartRecord(String collection) {
        return null;
    }

    public String getEndRecord(String collection) {
        return null;
    }

    public int CollectionSize(String collection) {
        return 0;
    }

    public String[] getRecordInRange() {
        return null;
    }

    public long getRecordsInRange() {
        return 0;
    }

    public String[] getAvailableCollections() {
        return null;
    }

}
