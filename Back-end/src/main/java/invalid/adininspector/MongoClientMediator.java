package invalid.adininspector;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Consumer;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.MongoWriteException;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;

import org.bson.Document;

import invalid.adininspector.records.Record;

public class MongoClientMediator {

    private MongoClient client;
    private MongoDatabase db;

    public MongoClientMediator(String udid, String password, String dbName) {
        
        ServerAddress serverAddr = new ServerAddress("localhost");

        p(udid+dbName+password);

        //ScramSha1 is the default auth method from Mongo
        MongoCredential cred = MongoCredential.createScramSha1Credential(udid,"admin", password.toCharArray());
        
    
        client = new MongoClient(serverAddr, Collections.singletonList(cred));

        // get access to the database. I still don't know if doing it like this is
        // ideal.
        db = client.getDatabase(dbName);

        //client.

    }

    public void addRecordToCollection(Record record, String collection) {
        try {
            db.getCollection(collection).insertOne(record.getAsDocument());
            p("inserting to: "+ collection + " at offset: " +record.get_id());
        } catch (MongoWriteException ex) {
            // TODO: how to handle this, skip?, overwrite? or compare and decide which one to keep?
            System.out.println("an entry with this offset already exists at offset: " + record.get_id());
        }
        catch(Exception e)
        {
            p(e.getCause());
        }
    }

    public void addRecordsToCollection(Record[] records, String collection) {
        for (Record r : records) {
            addRecordToCollection(r, collection);
        }
    }

    public void ProcessCollection(String collection) {
        // DataProcessor
      //  DataProcessor.processData(,this);
    }

    // do we need this ? potentially not
    private String[] getCollection(String collection) {
        return mongoIteratorToStringArray(db.getCollection(collection).find());
    }

    // find returns a cursor to the first object so we simple return that one
    public String getStartRecord(String collection) {
        return db.getCollection(collection).find().first().toString();
    }

    // we sort descending by id and then get the first (last object)
    public String getEndRecord(String collection) {
        return db.getCollection(collection).find().sort(new Document("_id", -1)).first().toString();
    }

    // an int *should* suffice for now at least
    public int CollectionSize(String collection) {
        // count is deprecated, there's an estimation which should work fine but
        return (int) db.getCollection(collection).countDocuments();
    }

    public String[] getRecordInRange(String collection, String key, String start, String end) {
        BasicDBObject query = new BasicDBObject();
        query.put(key, new BasicDBObject("$gt", Integer.parseInt(start)).append("$lt", Integer.parseInt(end)));

        return mongoIteratorToStringArray(db.getCollection(collection).find(query));
    }

    public long getRecordsInRangeSize(String collection, String key, String start, String end) {
        BasicDBObject query = new BasicDBObject();
        query.put(key, new BasicDBObject("$gt", Integer.parseInt(start)).append("$lt", Integer.parseInt(end)));

        return (int) db.getCollection(collection).countDocuments(query);
    }

    // get all names of all collections and put em in an Array.
    public String[] getAvailableCollections() {
        List<String> colls = new ArrayList<>();

        db.listCollectionNames().forEach((Consumer<String>) colls::add);

        for (int i = 0; i < colls.size(); i++) {
            System.out.println(colls.get(i));
        }
        // return colls.toArray(new String[colls.size()]);
        return mongoIteratorToStringArray(db.listCollectionNames());
    }


    //HELPER FUNCTIONS
    private String[] mongoIteratorToStringArray(MongoIterable iterable) {
        List<String> colls = new ArrayList<>();

        // TODO: fix parametrization
        iterable.forEach((Consumer<String>) colls::add);

        return colls.toArray(new String[colls.size()]);

    }

    //TODO: implement me
    private Record[] mongoIteratorToRecordArray(MongoIterable it)
    {
        return null;
    }
    void p(Object line) {
        System.out.println(line);
    }
}
