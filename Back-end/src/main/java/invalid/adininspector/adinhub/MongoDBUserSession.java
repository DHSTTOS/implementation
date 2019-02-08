package invalid.adininspector.adinhub;

import invalid.adininspector.MongoClientMediator;
import invalid.adininspector.exceptions.LoginFailureException;

/**
 * Encapsulates a user session for a connection to a MongoDB database.
 *
 */
public class MongoDBUserSession implements IUserSession {

	private MongoClientMediator mongoClientMediator;

	/**
	 * Creates a new MongoDB session.
	 * @throws LoginFailureException 
	 */
	private MongoDBUserSession() {
		//mongoClientMediator = new MongoClientMediator(username, password);
	}

	private void setMongoClientMediator(MongoClientMediator m) {
		mongoClientMediator = m;
	}
	
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

	public String[] getAvailableCollections() {
		return mongoClientMediator.getAvailableCollections();
	}

	public String[] getCollection(String collection) {
		//return mongoClientMediator.getCollection(collection);
		throw new NoSuchMethodError("abort in MongoDBUsersession.getCollection() because it's not implemented in MongoClientMediator");
	}

	@Override
	public String getStartRecord(String collection) {
		return mongoClientMediator.getStartRecord(collection);
	}

	@Override
	public String getEndRecord(String collection) {
		return mongoClientMediator.getEndRecord(collection);
	}

	public long getCollectionSize(String collection) {
		return mongoClientMediator.CollectionSize(collection);
	}

	public String[] getRecordsInRange(String collection, String key, String start, String end) {
		return mongoClientMediator.getRecordInRange(collection, key, start, end);
	}

	public long getRecordsInRangeSize(String collection, String key, String start, String end) {
		return mongoClientMediator.getRecordsInRangeSize(collection, key, start, end);
	}
}
