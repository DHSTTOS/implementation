package invalid.adininspector.adinhub;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Map;
import java.util.Vector;

import com.google.gson.Gson;

/**
 * Encapsulates a user session to a simulated database, for testing.
 */
public class MockMongoDBUserSession implements IUserSession {

	private Vector<String> dataset = new Vector<String>(100);
	
	/**
	 * Creates a new MongoDB session.
	 */
	public MockMongoDBUserSession() {
		InputStream is = this.getClass().getResourceAsStream("/jsonstreams.txt");
		try (BufferedReader br = new BufferedReader(new InputStreamReader(is)) ) {
			int counter = 0;
			for(String line = br.readLine(); line != null; line = br.readLine()) {
				//System.out.println("line" + counter + " " + line);
				counter++;
				dataset.add(line);
			}
			System.out.println("done reading file");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public IUserSession createUserSession(String username, String password) {
		return new MockMongoDBUserSession();
	}

	public String[] getAvailableCollections() {
		String[] coll = {"mockdataset"};
		return coll;
	}

	public String[] getCollection(String coll) {
		return dataset.toArray(new String[dataset.size()]);
	}

	@Override
	public String getStartRecord(String coll) {
		return dataset.firstElement();
	}

	@Override
	public String getEndRecord(String coll) {
		return dataset.lastElement();
	}

	public long getCollectionSize(String collection) {
		return dataset.size();
	}

	public String[] getRecordsInRange(String collection, String key, String start, String end) {
		if (dataset.size() == 0)
			return new String[]{};

		// assume that all data points (i.e. strings in dataset) have the same structure:
		Gson gson = new Gson();
		Map<String, Object> datapoint = gson.fromJson(dataset.firstElement(), Map.class);
		if (!datapoint.containsKey(key))
				return new String[]{};
		
		Vector<String> tmp = new Vector<String>(dataset.size()/10);
		for (String dataString : dataset) {
			datapoint = gson.fromJson(dataString, Map.class);
			// treat all values as strings for now
			String val = (String)datapoint.get(key);
			if ((val.compareTo(start) >=0) && (val.compareTo(end) < 0))
				tmp.add(dataString);
		}
		return tmp.toArray(new String[tmp.size()]);
	}

	public long getRecordsInRangeSize(String collection, String key, String start, String end) {
		return getRecordsInRange(collection, key, start, end).length;
	}
}
