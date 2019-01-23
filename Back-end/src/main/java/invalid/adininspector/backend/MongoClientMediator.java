package invalid.adininspector.backend;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.MongoWriteException;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;

import org.bson.Document;
import org.w3c.dom.views.DocumentView;

import invalid.adininspector.backend.records.Record;

public class MongoClientMediator {

    private MongoClient client;
    private MongoDatabase db;

    public MongoClientMediator(String udid, String password, String dbName) {
        MongoCredential cred = MongoCredential.createCredential(udid, dbName, password.toCharArray());
        client = new MongoClient(new ServerAddress("localhost"), Arrays.asList(cred));
        // get access to the database. I still don't know if doing it like this is
        // ideal.
        db = client.getDatabase(dbName);
    }

    public void addRecordToCollection(Record record, String collection) {
        try {
            db.getCollection(collection).insertOne(record.getAsDocument());
        } catch (MongoWriteException ex) {
            //TODO: how to handle this
            System.out.println("an entry with this offset already exists %n at offset: " + record.get_id());
        }
    }

    public void addRecordsToCollection(Record[] records, String collection) {
        for (Record r : records) {
            addRecordToCollection(r, collection);
        }
    }

    public void ProcessCollection(String collection) {
        //DataProcessor
    }

    //TODO: potentially we should convert this to String[] for the hub
    //do we need this ? potentially not
    public MongoCollection<Document> getCollection(String collection) {
        return db.getCollection(collection);
    }

    //find returns a cursor to the first object so we simple return that one
    public String getStartRecord(String collection) {
        return db.getCollection(collection).find().first().toString();
    }

    //we sort descending by id and then get the first (last object)
    public String getEndRecord(String collection) {
        return db.getCollection(collection).find().sort(new Document("_id", -1)).first().toString();
    }

    //an int *should* suffice for now at least
    public int CollectionSize(String collection) {
        //count is deprecated, there's an estimation which should work fine but 
        return (int)db.getCollection(collection).countDocuments();
    }

    public String[] getRecordInRange(String collection, String key, String start,String end) {
        BasicDBObject query = new BasicDBObject();
        query.put(key , new BasicDBObject("$gt",  Integer.parseInt(start) )
            .append("$lt", Integer.parseInt(end)));
        
        return mongoIteratorToStringArray(db.getCollection(collection).find(query));
    }

    public long getRecordsInRangeSize(String collection, String key, String start,String end) {
        BasicDBObject query = new BasicDBObject();
        query.put(key , new BasicDBObject("$gt",  Integer.parseInt(start) )
            .append("$lt", Integer.parseInt(end)));
        
        return (int)db.getCollection(collection).countDocuments(query);
    }

    //get all names of all collections and put em in an Array.
    public String[] getAvailableCollections() {
        List<String> colls = new ArrayList<>();

         db.listCollectionNames().forEach((Consumer<String>) colls::add);

         //return colls.toArray(new String[colls.size()]);
         return mongoIteratorToStringArray(db.listCollectionNames());
    }


    private String[] mongoIteratorToStringArray(MongoIterable iterable)
    {
        List<String> colls = new ArrayList<>();

        //TODO: fix parametrization
        iterable.forEach((Consumer<String>) colls::add);

        return colls.toArray(new String[colls.size()]);
        
    }
}
