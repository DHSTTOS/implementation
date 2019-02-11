/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
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
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;

import org.bson.BsonTimestamp;
import org.bson.Document;

import invalid.adininspector.exceptions.LoginFailureException;
import invalid.adininspector.records.*;

/**
 * This class serves as a nexus between the users who want to get data out of the
 * database and the consumer and dataProcessor who want to add data into the
 * database. This class encapsulates the mongo client from the mongo API. This
 * means that any user wanting to sign in has to have valid credentials in the
 * database, effectively relegating UAC to mongoDB.
 */
public class MongoClientMediator {

	/**
	 * An instance of the Mongo Client from the official java API.
	 */
	private MongoClient client;
	private MongoDatabase db;

	/**
	 * Initializes the client variable, throws an error if the user is not found.
	 *
	 * @param udid the user name to login with
	 * @param password the password to login with
	 * @param dbName the database to login into
	 * @throws LoginFailureException - if login failed, e.g. wrong username or password
	 */
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

		//    String[] a = getRecordInRange("motor", "Timestamp","1548428021051", "1648428021051");

		//     System.out.println("got " + a.length + " records");

		//    for (String var : a) {
		//        p(var);
		//    }


	}

	/**
	 * Login into the "AdinInspector" database. Throws an error if the user is not found.
	 *
	 * @param udid user name to login with
	 * @param password password to login with
	 * @throws LoginFailureException - if login failed, e.g. wrong username or password
	 */
	public MongoClientMediator(String udid, String password) throws LoginFailureException {
		this(udid, password, "AdinInspector");
	}

	/**
	 * Converts the record to a bson document and uses the mongoAPI to insert it
	 * into the database.
	 * 
	 * @param record the record to add to the collection
	 * @param collection the name of the collection it should be added to.
	 */
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

	/**
	 * Takes a bson Document containing a record and uses the mongoAPI to insert
	 * it into the database.
	 *
	 * @param record a record to add to the collection
	 * @param collection name of the collection it should be added to.
	 */
	public void addRecordToCollection(Document record, String collection) {
		try {
			// p(record.getAsDocument());
			db.getCollection(collection).insertOne(record);
			//  p("inserting to: " + collection);
		} catch (MongoWriteException ex) {
			// TODO: how to handle this, skip?, overwrite? or compare and decide which one
			// to keep?
			// System.out.println("an entry with this offset already exists ");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * For each one of the members of the array call addRecordToCollection.
	 *
	 * @param records list of Documents containing a record each to be added to the specified collection
	 * @param collection name of the collection it should be added to.
	 */
	public void addRecordsToCollection(ArrayList<Document> records, String collection) {

		if(records == null) return;

		for(Document doc: records)
		{
			addRecordToCollection(doc, collection);
		}
	}

	/**
	 * For each one of the members of the array call addRecordToCollection.
	 *
	 * @param records array of records to be added to the specified collection
	 * @param collection name of the collection it should be added to.
	 */
	public void addRecordsToCollection(Record[] records, String collection) {
		for (Record r : records) {
			addRecordToCollection(r, collection);
		}
	}

	/**
	 * Signal the data processor to start the processing of a collection.
	 *
	 * @param collection name of the collection to process
	 */
	public void ProcessCollection(String collection) {
		// DataProcessor
		// DataProcessor.processData(,this);
	}

	// do we need this ? potentially not
	/**
	 * Returns all entries of the specified collection as strings.
	 *
	 * @param collection the collection to query
	 * @return array of all record of the specified collection as strings
	 */
	public String[] getCollection(String collection) {
		return mongoIteratorToStringArray(db.getCollection(collection).find());
	}

	/**
	 * Return the first entry of the specified collection as a string in JSON format.
	 *
	 * @param collection the collection to query
	 * @return the first record of the collection
	 */
	public String getStartRecord(String collection) {
		// find returns a cursor to the first object so we simple return that one
		//TODO: check if collection is null

		MongoCollection<Document> coll = db.getCollection(collection);

		return db.getCollection(collection).find().first().toJson();
	}

	/**
	 * Return the last entry of the specified collection as a string in JSON format.
	 *
	 * @param collection the collection to query
	 * @return the last record of the collection
	 */
	public String getEndRecord(String collection) {
		// we sort descending by id and then get the first (last object)
		return db.getCollection(collection).find().sort(new Document("_id", -1)).first().toJson();
	}

	/**
	 * Return the number of entries in the specifed collection as int.
	 *
	 * @param collection the collection to query
	 * @return the number of entries in the collection
	 */
	public int CollectionSize(String collection) {
		// an int *should* suffice for now at least
		// count is deprecated, there's an estimation which should work fine but it's
		// not gonna be accurate
		return (int) db.getCollection(collection).countDocuments();
	}

	// public String[] getRecordInRange(String collection, String key, String start, String end) {
	//     BasicDBObject query = new BasicDBObject();
	//     query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

	//     return mongoIteratorToStringArray(db.getCollection(collection).find(query));
	// }



	/**
	 * Return all records of this collection for which the value of the specified
	 * record key is in the range specified by start (inclusive) and end (exclusive).
	 * Records are returned as strings in JSON format.
	 * This Method is very general to allow for flexibility. For example by
	 * letting the key be SourceIPaddresses or a Timestamp.
	 *
	 * @param collection name of the collection to query
	 * @param key record key used for filtering
	 * @param start the start value of the range
	 * @param end the end value of the range
	 * @return String array containing all entries of the collection within that range
	 */
	public String[] getRecordInRange(String collection, String key, Object start,Object end) {
		//TODO: get type of field in mongo and cast start and end to this type

		BasicDBObject query = new BasicDBObject();

		if(key.equals("Timestamp"))
		{
			System.out.println("OMG TIMESTAMP!");
			query.put(key, new BasicDBObject("$gte", new Date(Long.valueOf((String)start))).append("$lt", new Date(Long.valueOf((String)end)) ));

		}
		else
			query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

		return mongoIteratorToStringArray(db.getCollection(collection).find(query));
	}

	
	/**
	 * Returns the number of elements matching the range as long
	 *
	 * @param collection name of the collection to query
	 * @param key record key used for filtering
	 * @param start the start value of the range
	 * @param end the end value of the range
	 * @return the number of elements matching the range as int
	 */
	public long getRecordsInRangeSize(String collection, String key, String start, String end) {
		BasicDBObject query = new BasicDBObject();
		query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

		return db.getCollection(collection).countDocuments(query);
	}

	
	/**
	 * Returns the number of elements matching the range as long
	 *
	 * @param collection name of the collection to query
	 * @param key record key used for filtering
	 * @param start the start value of the range
	 * @param end the end value of the range
	 * @return the number of elements matching the range as int
	 */
	public long getRecordsInRangeSize(String collection, String key, Object start, Object end) {
		BasicDBObject query = new BasicDBObject();
		query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

		return db.getCollection(collection).countDocuments(query);
	}


	/**
	 * Returns an array with the names of the collections available to the current user.
	 *
	 * @return String array with collection names
	 */
	public String[] getAvailableCollections() {
		// get all names of all collections and put em in an Array.
		List<String> colls = new ArrayList<>();

		db.listCollectionNames().forEach((Consumer<String>) colls::add);

		for (int i = 0; i < colls.size(); i++) {
			//System.out.println(colls.get(i));
		}
		return colls.toArray(new String[colls.size()]); //mongoIteratorToStringArray(db.listCollectionNames());
	}

	
	// HELPER FUNCTIONS
	private String[] mongoIteratorToStringArray(MongoIterable iterable) {
		List<String> colls = new ArrayList<>();

		iterable.forEach((Block<Document>) document -> colls.add(document.toJson()));

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
			return new ArrayList<>();

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