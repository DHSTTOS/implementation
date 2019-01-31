package invalid.adininspector;

import java.lang.reflect.Type;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.function.Consumer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.google.gson.reflect.TypeToken;
import com.mongodb.BasicDBObject;
import com.mongodb.Block;
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.MongoSecurityException;
import com.mongodb.MongoWriteException;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;

import org.bson.BsonTimestamp;
import org.bson.Document;

import invalid.adininspector.exceptions.LoginFailureException;
import invalid.adininspector.records.*;

public class MongoClientMediator {

    private MongoClient client;
    private MongoDatabase db;

    public MongoClientMediator(String udid, String password, String dbName) throws LoginFailureException {
       
        if(dbName.isEmpty())
            throw new LoginFailureException("dbName cannot be empty");

        //TODO: might not be the localhost
        ServerAddress serverAddr = new ServerAddress("localhost");

        //TODO: bad practice to use magic var for the database name
        // ScramSha1 is the default auth method from Mongo
        // we always use the admin database to check users. so mongoCredential is tied to admin
        MongoCredential cred = MongoCredential.createScramSha1Credential(udid, "admin", password.toCharArray());

        try {
            client = new MongoClient(serverAddr, Collections.singletonList(cred));

            // get access to the database. I still don't know if doing it like this is
            // ideal.
            db = client.getDatabase(dbName);

            BasicDBObject ping = new BasicDBObject("ping", "1");
            db.runCommand(ping);
        } catch (MongoSecurityException e) {

            // force the caller to handle the exception
            throw new LoginFailureException(e.getMessage());
        }
    }

    public MongoClientMediator(String udid, String password) throws LoginFailureException {
        this(udid, password, "AdinInspector");
    }

    public void addRecordToCollection(Record record, String collection) {

        try {
            // p(record.getAsDocument());
            db.getCollection(collection).insertOne(record.getAsDocument());
            //p("inserting to: " + collection + " at offset: " + record.get_id());
        } catch (MongoWriteException ex) {
            // TODO: how to handle this, skip?, overwrite? or compare and decide which one
            // to keep?
            //System.out.println("an entry with this offset already exists at offset: " + record.get_id());
        } 
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    // we do not necessarly need a record for aggregated records.
    public void addRecordToCollection(Document record, String collection) {
        try {
            // p(record.getAsDocument());
            db.getCollection(collection).insertOne(record);
          //  p("inserting to: " + collection);
        } catch (MongoWriteException ex) {
            // TODO: how to handle this, skip?, overwrite? or compare and decide which one
            // to keep?
            //System.out.println("an entry with this offset already exists ");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // we do not necessarly need a record for aggregated records. we can pass documents along
    public void addRecordsToCollection(ArrayList<Document> records, String collection) {

        if(records == null) return;

        for(Document doc: records)
        {
            addRecordToCollection(doc, collection);
        }
    }

    public void addRecordsToCollection(Record[] records, String collection) {
        for (Record r : records) {
            addRecordToCollection(r, collection);
        }
    }

    public void ProcessCollection(String collection) {
        // DataProcessor
        // DataProcessor.processData(,this);
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
        // count is deprecated, there's an estimation which should work fine but it's
        // not gonna be accurate
        return (int) db.getCollection(collection).countDocuments();
    }

    public String[] getRecordInRange(String collection, String key, String start, String end) {
        BasicDBObject query = new BasicDBObject();
        query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

        return mongoIteratorToStringArray(db.getCollection(collection).find(query));
    }

    public long getRecordsInRangeSize(String collection, String key, String start, String end) {
        BasicDBObject query = new BasicDBObject();
        query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

        return (int) db.getCollection(collection).countDocuments(query);
    }







    public String[] getRecordInRange(String collection, String key, Object start,Object end) {
        BasicDBObject query = new BasicDBObject();
        query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

        return mongoIteratorToStringArray(db.getCollection(collection).find(query));
    }

    public long getRecordsInRangeSize(String collection, String key, Object start, Object end) {
        BasicDBObject query = new BasicDBObject();
        query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

        return (int) db.getCollection(collection).countDocuments(query);
    }







    // get all names of all collections and put em in an Array.
    public String[] getAvailableCollections() {
        List<String> colls = new ArrayList<>();

        db.listCollectionNames().forEach((Consumer<String>) colls::add);

        for (int i = 0; i < colls.size(); i++) {
            System.out.println(colls.get(i));
        }
        return mongoIteratorToStringArray(db.listCollectionNames());
    }

    // HELPER FUNCTIONS
    private String[] mongoIteratorToStringArray(MongoIterable iterable) {
        List<String> colls = new ArrayList<>();

        iterable.forEach((Block<Document>) document -> colls.add(document.toJson().toString()));

        return colls.toArray(new String[colls.size()]);
    }

    // TODO: figure out a way to make this less wasteful
    public ArrayList<Record> getCollectionAsRecordsArrayList(String collectionName) {


        JsonSerializer<Date> ser = new JsonSerializer<Date>() {
            @Override
            public JsonElement serialize(Date src, Type typeOfSrc, JsonSerializationContext 
                       context) {
              return src == null ? null : new JsonPrimitive(src.getTime());
            }
          };
          
          JsonDeserializer<Date> deser = new JsonDeserializer<Date>() {
            @Override
            public Date deserialize(JsonElement json, Type typeOfT,
                 JsonDeserializationContext context) throws JsonParseException {
                    long time = json.getAsJsonObject().getAsJsonPrimitive("$date").getAsLong();
                    Date d = new Date(time);
                    return d;
            }
          };
          
          Gson gson = new GsonBuilder()
             .registerTypeAdapter(Date.class, ser)
             .registerTypeAdapter(Date.class, deser).create();


        // GsonBuilder builder = new GsonBuilder(); 

        // builder.registerTypeAdapter(Date.class, new JsonDeserializer<Date>() { 
        //     public Date deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        //        return new Date(json.getAsJsonPrimitive().getAsLong()); 
        //     } 
        //  });
        
        // Gson gson = builder.create();

        ArrayList<Record> records = new ArrayList<>();

        Type collType = getCollectionType(collectionName);

        String[] recordsToConvert = getCollection(collectionName);

        if (recordsToConvert.length == 0)
            return null;

        for (int i = 0; i < recordsToConvert.length; i++) {

            // p(recordsToConvert[i] + " of Type : " + collType.getTypeName());

            records.add(gson.fromJson(recordsToConvert[i], collType));
        }

        return records;
    }

    // Might be useful for the upper layers
    public Type getCollectionType(String collectionName) {
        Type type = null;

        if (collectionName.contains("Alarm"))
            type = new TypeToken<AlarmRecord>() {
            }.getType();
        else
            type = new TypeToken<PacketRecordDesFromMongo>() {
            }.getType();

        return type;
    }

    // TODO: implement me
    private Record[] mongoIteratorToRecordArray(MongoIterable it) {
        return null;
    }

    public void p(Object line) {
        System.out.println(line);
    }
}