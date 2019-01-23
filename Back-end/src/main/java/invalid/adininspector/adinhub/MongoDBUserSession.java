package invalid.adininspector.adinhub;

import invalid.adininspector.MongoClientMediator;

/**
 * Encapsulates a user session for a connection to a MongoDB database.
 *
 */
public class MongoDBUserSession implements IUserSession {

	private MongoClientMediator mongoClientMediator;
	
	/**
	 * Creates a new MongoDB session.
	 */
	public MongoDBUserSession(String username, String password) {
		// TODO: correct db name
		mongoClientMediator = new MongoClientMediator(username, password);
	}

	public IUserSession createUserSession(String username, String password) {
		MongoDBUserSession m = new MongoDBUserSession(username, password);
		try {
			m.getAvailableCollections();
		} catch (Exception e) {	// TOODO: narrow this down to the mongodb exception
			System.err.println("createUserSession: login failed; u: " + username + "pw: " + password);
			m = null;
			return null;
		}
		return m;
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
