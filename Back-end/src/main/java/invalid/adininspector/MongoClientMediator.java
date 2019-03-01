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
import com.mongodb.client.model.Filters;

import org.bson.Document;

import invalid.adininspector.dataprocessing.DataProcessor;
import invalid.adininspector.exceptions.LoginFailureException;
import invalid.adininspector.records.AlarmRecord;
import invalid.adininspector.records.PacketRecordDesFromMongo;
import invalid.adininspector.records.Record;


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
	 * Converts the record to a bson document and uses t
     * he mongoAPI to insert it
	 * into the database.
	 * 
	 * @param record the record to add to the collection
	 * @param collection the name of the collection it should be added to.
	 */
	public void addRecordToCollection(Record record, String collection) {

		if(collection.equals("realTime"))
		{
			//check how many records are in the collection

			//TODO: bad practice magic var but whatevs
			int maxNumRecords = 60000;
			if(CollectionSize(collection) >= maxNumRecords)
			{
				Document filter = new Document("_id", db.getCollection(collection).find().first().get("_id"));

				//delete the first document a new one will be added at the end. 
				db.getCollection(collection).deleteOne(filter);

				//aggregation not longer up to date
			}

			DataProcessor.isRealTimeUptoDate = false;
		}

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
	 * Destroys a collection by name
	 * @param collection
	 */
	public void dropCollection(String collection)
	{
		//System.out.println("Droped " + collection);
		db.getCollection(collection).drop();
	}

	/**
	 * Takes a bson Document containing a record and uses the mongoAPI to insert
	 * it into the database.
	 *
	 * @param record a record to add to the collection
	 * @param collection name of the collection it should be added to.
	 */
	public void addRecordToCollection(Document record, String collection) {

		if(collection.equals("realTime"))
			DataProcessor.isRealTimeUptoDate = false;

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

		if(collection.isEmpty())
			return new String[0];

		//check if the user is trying to get a realTime aggregation and if it's up to date. if not then process it and return the updated version
		updateRTaggregation(collection);
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

		if(collection.isEmpty())
			return "";

		updateRTaggregation(collection);

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

		if(collection.isEmpty())
			return "";

		updateRTaggregation(collection);
		// we sort descending by id and then get the first (last object)
		return db.getCollection(collection).find().sort(new Document("_id", -1)).first().toJson();
	}

	/**
	 * Return the number of entries in the specifed collection as int.
	 *
	 * @param collection the collection to query
	 * @return the number of entries in the collection
	 */
	public long CollectionSize(String collection) {

		if(collection.isEmpty())
			return (long) 0.0;

		updateRTaggregation(collection);

		return db.getCollection(collection).countDocuments();
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
	public String[] getRecordsInRange(String collection, String key, Object start, Object end) {
		if(collection.isEmpty())
			return new String[0];

		//TODO: get type of field in mongo and cast start and end to this type
		updateRTaggregation(collection.split("_")[0]);

		BasicDBObject query = new BasicDBObject();

		if(key.equals("Timestamp"))
		{
			updateAggregation(collection.split("_")[0], key, new Date(Long.valueOf((String)start)), new Date(Long.valueOf((String)end)));

			query.put(key, new BasicDBObject("$gte", new Date(Long.valueOf((String)start))).append("$lt", new Date(Long.valueOf((String)end)) ));
		}
		else if(key.equals("_id"))
			query.put(key, new BasicDBObject("$gte", Long.valueOf((String)start)).append("$lt", Long.valueOf((String)end)));
		else
			query.put(key, new BasicDBObject("$gte", start).append("$lt", (end)));

		return mongoIteratorToStringArray(db.getCollection(collection).find(query));
	}


    /**
     * Matches records of a collection to a value
     * @param collection
     * @param key
     * @param equals
     * @return an array containing all collection entry where key = equals
     */
    public String[] getRecord(String collection, String key, Object equals)
    {		
		if(collection.isEmpty())
			return new String[0];

		updateRTaggregation(collection);

		//TODO: read the type from mongo and convert it to that
		if(key.equals("Timestamp"))
		{
			updateAggregation(collection.split("_")[0], key, new Date(Long.valueOf((String)equals)), new Date(Long.valueOf((String)equals)));
			equals = new Date(Long.valueOf((String)equals));
		}
		else if(key.equals("_id"))
		{
			//if it's not a long then make it one
			if(!equals.getClass().equals(Long.class))
				equals = Long.valueOf((String)equals);
		}
		
        return mongoIteratorToStringArray(db.getCollection(collection).find(Filters.eq(key,equals)));
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
	// public long getRecordsInRangeSize(String collection, String key, String start, String end) {
	// 	return getRecordsInRange(collection, key, start, end).length; //db.getCollection(collection).countDocuments(query);
	// }

	
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
		
		if(collection.isEmpty())
			return (long) 0.0;

        return getRecordsInRange(collection, key, start, end).length; 
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


	/**
	 * creates an empty collection in the database
	 * @param collection
	 */
	public void createEmptyCollection(String collection)
	{
		db.createCollection(collection);
	}
	
	// HELPER FUNCTIONS
	/**
	 * converts a mongoIterator to a string array
	 * @param iterable
	 * @return the iterator as an array
	 */
	private String[] mongoIteratorToStringArray(MongoIterable iterable) {
		List<String> colls = new ArrayList<>();

		iterable.forEach((Block<Document>) document -> colls.add(document.toJson()));

		return colls.toArray(new String[colls.size()]);
	}

	// TODO: figure out a way to make this less wasteful
	/**
	 * gets a collection and returns it as an ArrayList
	 * @param collectionName
	 * @return the collection as ArrayList
	 */
	public ArrayList<Record> getCollectionAsRecordsArrayList(String collectionName) {

		JsonDeserializer<Date> dateDeser = new JsonDeserializer<Date>() {
			@Override
			public Date deserialize(JsonElement json, Type typeOfT,
					JsonDeserializationContext context) throws JsonParseException {
				long time = json.getAsJsonObject().getAsJsonPrimitive("$date").getAsLong();
				Date d = new Date(time);
				return d;
			}
		};

		JsonDeserializer<Long> longDeser = new JsonDeserializer<Long>() {

			@Override
			public Long deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
					throws JsonParseException {
				return  json.getAsJsonObject().getAsJsonPrimitive("$numberLong").getAsLong();
			}
		
		};

		Gson gson = new GsonBuilder()
				.registerTypeAdapter(Date.class, dateDeser)
				.registerTypeAdapter(long.class, longDeser).create();

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

	/**
	 * get's the collection and truncates it in between a range
	 * @param collectionName
	 * @param key
	 * @param start
	 * @param end
	 * @return the collection truncated in between a range
	 */
	public ArrayList<Record> getCollectionAsRecordsArrayList(String collectionName, String key, Object start, Object end)
	{
		JsonDeserializer<Date> dateDeser = new JsonDeserializer<Date>() {
			@Override
			public Date deserialize(JsonElement json, Type typeOfT,
					JsonDeserializationContext context) throws JsonParseException {
				long time = json.getAsJsonObject().getAsJsonPrimitive("$date").getAsLong();
				Date d = new Date(time);
				return d;
			}
		};
		JsonDeserializer<Long> longDeser = new JsonDeserializer<Long>() {

			@Override
			public Long deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
					throws JsonParseException {
				return  json.getAsJsonObject().getAsJsonPrimitive("$numberLong").getAsLong();
			}
		
		};

		Gson gson = new GsonBuilder()
				.registerTypeAdapter(Date.class, dateDeser)
				.registerTypeAdapter(long.class, longDeser).create();



		ArrayList<Record> records = new ArrayList<>();

		Type collType = getCollectionType(collectionName);

		String[] recordsToConvert = start.equals(end) ? getRecord(collectionName, key, start) : getRecordsInRange(collectionName,key,start,end);

		if (recordsToConvert.length == 0)
			return new ArrayList<>();

		for (int i = 0; i < recordsToConvert.length; i++) {
			records.add(gson.fromJson(recordsToConvert[i], collType));
		}

		return records;

		
	}


	/**
	 * the Data processor to update the realTime aggregation 
	 * @param collection
	 */
	public void updateRTaggregation(String collection)
	{
		//check if the user is trying to get a realTime aggregation and if it's up to date. if not then process it and return the new one
		//if(collection.contains("realTime_"))
		//	if(!DataProcessor.isRealTimeUptoDate)
		if(!collection.contains("_"))
				DataProcessor.processData("realTime", this);
	}

	
	/**
	 * Calls the Data processor to update the realTime aggregation in between a date range
	 * @param collection
	 * @param key
	 * @param start
	 * @param end
	 */
	public void updateAggregation(String collection,String key, Object start, Object end)
	{
		//check if the user is trying to get a realTime aggregation and if it's up to date. if not then process it and return the new one
		if(!collection.contains("_"))
		//	if(!DataProcessor.isRealTimeUptoDate)
				DataProcessor.processDataInRange(collection, this,key,(Date)start,(Date)end);
	}
	
	/**
	 * Associates the name of a collection to it's Java type
	 * @param collectionName
	 * @return the java type associated to the collection
	 */
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

	public void p(Object line) {
		System.out.println(line);
	}
}