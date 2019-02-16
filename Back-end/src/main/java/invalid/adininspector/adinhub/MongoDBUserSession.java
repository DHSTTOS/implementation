package invalid.adininspector.adinhub;

import invalid.adininspector.MongoClientMediator;
import invalid.adininspector.exceptions.LoginFailureException;

/**
 * Encapsulates a user session for a connection to a MongoDB database.
 */
public class MongoDBUserSession implements IUserSession {

	private MongoClientMediator mongoClientMediator;

	/**
	 * Creates a new MongoDB session. Invoked by the factory method createUserSession(). 
	 */
	private MongoDBUserSession() {
		//mongoClientMediator = new MongoClientMediator(username, password);
	}

	/**
	 * Setter for mongoClientMediator.
	 * @param the new value
	 */
	private void setMongoClientMediator(MongoClientMediator m) {
		mongoClientMediator = m;
	}

	/**
	 * This factory method instantiates a new UserSession and logs in into the
	 * database using the given credentials.
	 * If login fails, return null.
	 * 
	 * @param username the username to login with
	 * @param password the password to login with
	 * @return the new IUserSession object with a logged-in database connection, or null
	 */
	public static IUserSession createUserSession(String username, String password) {
		MongoDBUserSession m = new MongoDBUserSession();
		try {
			m.setMongoClientMediator(new MongoClientMediator(username, password));
			m.getAvailableCollections(); // check if login succeeded
			return m;
		} catch (LoginFailureException e) {
			System.err.println("createUserSession: login failed; u: " + username + "pw: " + password);
			m = null;
			return null;
		}
	}

	/**
	 * Returns an array with the names of the collections available to the current user.
	 * 
	 * @return a string array with collection names
	 */
	public String[] getAvailableCollections() {
		return mongoClientMediator.getAvailableCollections();
	}

	/**
	 * Returns an array containing all records of this collection in json format
	 * in the order they have in the collection.
	 * 
	 * @param coll the collection to query
	 * @return an array of strings of the records of the specified collection in json format
	 */
	public String[] getCollection(String collection) {
		return mongoClientMediator.getCollection(collection);
	}

	/**
	 * Return the first record of the specified collection as json string.
	 * 
	 * @param coll the collection to query
	 * @return the first record of the specified collection as json string
	 */
	@Override
	public String getStartRecord(String collection) {
		return mongoClientMediator.getStartRecord(collection);
	}

	/**
	 * Return the last record of the specified collection as json string.
	 * 
	 * @param coll the collection to query
	 * @return the first record of the specified collection as json string
	 */
	@Override
	public String getEndRecord(String collection) {
		return mongoClientMediator.getEndRecord(collection);
	}

	/**
	 * Returns the number of records in the specified collection.
	 * 
	 * @param collection the collection to query
	 * @return the number of records
	 */
	public long getCollectionSize(String collection) {
		return mongoClientMediator.CollectionSize(collection);
	}


	/**
	 * Returns an array containing all records of the collection for which the
	 * specified key has the specified value.
	 * The records will be in the same order as they are in the collection and
	 * are strings in json format.
	 *
	 * @param collection the collection to query
	 * @param key the record key by which the records are filtered
	 * @param value the value to match with
	 * @return an array of records matching the value
	 */
	public String[] getRecord(String collection, String key, String value) {
		System.out.println("MongoDBUserSession.gR1: key: " + key + " value: " + value);
		String[] tmp = mongoClientMediator.getRecord(collection, key, value);
		System.out.println("MongoDBUserSession.gR2: size: " + tmp.length + " " + ((tmp.length > 0) ? tmp[0] : ""));
		return tmp;
	}


	/**
	 * Returns an array containing all records of the collection for which the
	 * value of the specified key is in the range [start, end). The records will
	 * be in the same order as they are in the collection and are strings in json
	 * format.
	 *
	 * @param collection the collection to query
	 * @param key the record key by which the records are filtered
	 * @param start the start of the range of key values
	 * @param end the exclusive end of the range of key values
	 * @return an array of records matching the filter range
	 */
	public String[] getRecordsInRange(String collection, String key, String start, String end) {
		System.out.println("MongoDBUserSession.gRIR1: key: " + key + " start: " + start + " end: " + end);
		String[] tmp = mongoClientMediator.getRecordsInRange(collection, key, start, end);
		System.out.println("MongoDBUserSession.gRIR2: size: " + tmp.length + " " + ((tmp.length > 0) ? tmp[0] : ""));
		return tmp;
	}

	/**
	 * Returns the number of records in the specified collection for which the value
	 * of the specified key is within the range [start, end).
	 * 
	 * @param collection the collection to query
	 * @param key the record key by which the records are filtered
	 * @param start the start of the range of key values
	 * @param end the exclusive end of the range of key values
	 * @return the number of records matching the filter range
	 */
	public long getRecordsInRangeSize(String collection, String key, String start, String end) {
		System.out.println("MongoDBUserSession.gRIRS1: key: " + key + " start: " + start + "end: " + end);
		long tmp = mongoClientMediator.getRecordsInRangeSize(collection, key, start, end);
		System.out.println("MongoDBUserSession.gRIRS2: size: " + tmp);
		return tmp;
	}
}
