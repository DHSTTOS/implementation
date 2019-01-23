package invalid.adininspector.adinhub;
import com.mongodb.DB;
import com.mongodb.Mongo;
import com.mongodb.MongoClient;

/**
 * Encapsulates a user session for a connection to a MongoDB database.
 *
 */
public class MongoDBUserSession implements IUserSession {

	// private MongoClientMediator mongoClientMediator;
	
	/**
	 * Creates a new MongoDB session.
	 */
	public MongoDBUserSession() {
		//mongoClientMediator = new MongoClientMediator();
	}

	public IUserSession createUserSession(String username, String password) {
		// TODO login using mongoClientMediator; 
		return null;
	}

	public String[] getAvailableCollections() {
		//return mongoClientMediator.getAvailableCollections();
		return null;
	}

	public String[] getCollection(String collection) {
		//return mongoClientMediator.getCollection(collection);
		return null;
	}

	@Override
	public String getStartRecord(String collection) {
		//return mongoClientMediator.getStartRecord(collection);
		return null;
	}

	@Override
	public String getEndRecord(String coll) {
		//return mongoClientMediator.getEndRecord(collection);
		return null;
	}
	
	public long getCollectionSize(String collection) {
		//return mongoClientMediator.getCollectionSize(collection);
		return 0;
	}

	public String[] getRecordsInRange(String collection, String key, String start, String end) {
		//return mongoClientMediator.getRecordsInRange(collection, key, start, end);
		return null;
	}

	public long getRecordsInRangeSize(String collection, String key, String start, String end) {
		//return mongoClientMediator.getRecordsInRangeSize(collection, key, start, end);
		return 0;
	}
}
