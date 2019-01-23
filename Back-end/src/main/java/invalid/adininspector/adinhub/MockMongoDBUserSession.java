package invalid.adininspector.adinhub;
import com.mongodb.DB;
import com.mongodb.Mongo;
import com.mongodb.MongoClient;

/**
 * Encapsulates a user session for a connection to a MongoDB database.
 *
 */
public class MockMongoDBUserSession implements IUserSession {

	private String[] dataset = {
			"\"SourceIPAddress\": \"\"," + 
					"\"PacketID\": 1," + 
					"\"DestinationIPAddress\": \"\"," +
					"\"Timestamp\": {\"$date\": 1541425229623}"};

	/**
	 * Creates a new MongoDB session.
	 */
	public MockMongoDBUserSession() {
	}

	public IUserSession createUserSession(String username, String password) {
		return new MockMongoDBUserSession();
	}

	public String[] getAvailableCollections() {
		String[] coll = {"dataset1"};
		return coll;
	}

	public String[] getCollection(String coll) {
		return dataset;
	}

	@Override
	public String getStartRecord(String coll) {
		// TODO Auto-generated method stub
		return dataset[0];
	}

	@Override
	public String getEndRecord(String coll) {
		return dataset[dataset.length - 1];
	}

	public long getCollectionSize(String collection) {
		return dataset.length;
	}

	public String[] getRecordsInRange(String collection, String key, String start, String end) {
		return dataset;
	}

	public long getRecordsInRangeSize(String collection, String key, String start, String end) {
		// TODO Auto-generated method stub
		return dataset.length;
	}
}
