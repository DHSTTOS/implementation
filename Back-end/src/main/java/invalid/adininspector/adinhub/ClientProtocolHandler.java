package invalid.adininspector.adinhub;

import java.util.HashMap;
import java.util.Map;

import javax.websocket.Session;

import com.google.gson.Gson;

/**
 * This class handles client requests by parsing them, executing
 * the requested action and producing responses.
 * The requested action are executed by calls to the Hub object.
 */
public class ClientProtocolHandler {

	public enum Command {
		LOGIN_TOKEN("LOGIN_TOKEN") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				return null;
			}
		},
		GET_AV_COLL("GET_AV_COLL") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String[] collections = hub.getAvailableCollections(session);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "LIST_COL");
				m.put("par", collections);
				return m;
			}
		},
		
		GET_COLL("GET_COLL") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String[] data = hub.getCollection(session, collectionName);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "DATA");
				m.put("par", data);
				return m;
			}
		},
		
		GET_START("GET_START") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String data = hub.getStartRecord(session, collectionName);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "DATA");
				m.put("par", data);
				return m;
			}
		},

		GET_END("GET_END") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String data = hub.getEndRecord(session, collectionName);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "DATA");
				m.put("par", data);
				return m;
			}
		},

		GET_COLL_SIZE("GET_COLL_SIZE") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				long size = hub.getCollectionSize(session, collectionName);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "COLL_SIZE");
				m.put("par", size);
				return m;
			}
		},

		GET_RECORDS_RANGE("GET_RECORDS_RANGE") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String key = (String)msgParsed.get("key");
				String start = (String)msgParsed.get("start");
				String end = (String)msgParsed.get("end");
				String[] data = hub.getRecordsInRange(session, collectionName, key, start, end);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "DATA");
				m.put("par", data);
				return m;
			}
		},

		GET_RECORDS_RANGE_SIZE("GET_RECORDS_RANGE_SIZE") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String key = (String)msgParsed.get("key");
				String start = (String)msgParsed.get("start");
				String end = (String)msgParsed.get("end");
				long size = hub.getRecordsInRangeSize(session, collectionName, key, start, end);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "COLL_SIZE");
				m.put("par", size);
				return m;
			}
		};
		
		public final String command;
		
		Command(String command) {
			this.command = command;
		}
		abstract Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed);
	}
	
	/**
	 * Parse the message from the client, call the corresponding method of the hub
	 * and construct the response message which is then send via the hub
	 * to the client.
	 * 
	 * @param hub the hub for database access
	 * @param session the current session
	 * @param message the client request to handle
	 */
	String handleRequest(Hub hub, Session session, String message) {
		Gson gson = new Gson();
		//gson.fromJson(message, Integer.class);
		Map<String,Object> msgParsed = new Gson().fromJson(message, Map.class);
		if (!msgParsed.containsKey("cmd")) {
			return "";
		} else {
			String msgCommand = (String)msgParsed.get("cmd");

			for (Command c : Command.values()) {
				if (c.command.equals(msgCommand)) {
					Map <String, Object> m = c.execute(hub, session, msgParsed);
					String id = (String)msgParsed.get("id");
					m.put("id", id);
					return new Gson().toJson(m);
				}
			}
			return "";
		}
	}
}
