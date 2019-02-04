package invalid.adininspector.adinhub;

import java.util.HashMap;
import java.util.Map;

import javax.websocket.Session;

import com.google.gson.Gson;
import com.google.gson.JsonParseException;
import com.google.gson.JsonSyntaxException;

/**
 * This class handles client requests by parsing them, executing
 * the requested action and producing responses.
 * The requested action are executed by calls to the Hub object.
 */
public class ClientProtocolHandler {

	public enum Command {
		LOGIN("LOGIN") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				Map<String, Object> m = new HashMap<String, Object>();
				String username = (String)msgParsed.get("user");
				String password = (String)msgParsed.get("pwd");
				String res = hub.login(session, username, password);

				m.put("cmd", "SESSION");
				m.put("par", "LOGIN");
				if ((res == null) || res.equals("")) {
					m.put("status", "FAIL");
					m.put("token", "");
				} else {
					m.put("status", "OK");
					m.put("token", res);
				}
				return m;
			}
		},
		AUTH("AUTH") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String token = (String)msgParsed.get("token");
				boolean loggedIn = hub.loginWithToken(session, token);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "SESSION");
				m.put("par", "AUTH");
				m.put("status", loggedIn ? "OK" : "FAIL");
				return m;
			}
		},
		LOGOUT("LOGOUT") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				hub.logOut(session);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "SESSION");
				m.put("par", "LOGOUT");
				m.put("status", "OK");
				return m;
			}
		},
		GET_AV_COLL("GET_AV_COLL") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String[] collections = hub.getAvailableCollections(session);
				msgParsed.put("cmd", "LIST_COLL");
				msgParsed.put("par", collections);
				return msgParsed;
			}
		},
		
		GET_COLL("GET_COLL") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String[] data = hub.getCollection(session, collectionName);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "DATA");
				m.put("name", collectionName);
				m.put("key", "");
				m.put("data", data);
				return m;
			}
		},
		
		GET_START("GET_START") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String data = hub.getStartRecord(session, collectionName);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "DATASINGLE");
				m.put("name", collectionName);
				m.put("idx", "start");
				m.put("data", data);
				return m;
			}
		},

		GET_END("GET_END") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String data = hub.getEndRecord(session, collectionName);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "DATASINGLE");
				m.put("name", collectionName);
				m.put("idx", "end");
				m.put("data", data);
				return m;
			}
		},

		GET_ENDPOINTS("GET_ENDPOINTS") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String start = hub.getStartRecord(session, collectionName);
				String end = hub.getEndRecord(session, collectionName);
				//send augmented request back:
				msgParsed.put("cmd", "DATA_ENDPOINTS");
				msgParsed.put("name", collectionName);
				msgParsed.put("data", new String[]{start, end});
				return msgParsed;
			}
		},
		
		GET_COLL_SIZE("GET_COLL_SIZE") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				long size = hub.getCollectionSize(session, collectionName);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("cmd", "COLL_SIZE");
				m.put("name", collectionName);
				m.put("key", "");
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
				//send augmented request back:
				msgParsed.put("cmd", "DATA");
				msgParsed.put("name", collectionName);
				msgParsed.put("data", data);
				msgParsed.remove("par");
				return msgParsed;
			}
		},

		GET_RECORDS_RANGE_SIZE("GET_RECORDS_RANGE_SIZE") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String key = (String)msgParsed.get("key");
				String start = (String)msgParsed.get("start");
				String end = (String)msgParsed.get("end");
				long size = hub.getRecordsInRangeSize(session, collectionName, key, start, end);
				//send augmented request back:
				msgParsed.put("cmd", "COLL_SIZE");
				msgParsed.put("name", collectionName);
				msgParsed.put("par", size);
				return msgParsed;
			}
		};
		
		public final String command;
		
		Command(String command) {
			this.command = command;
		}
		abstract Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed);
	}
	
	private String cleanString(String message) {
		int len = message.length();
		if (len > 1000) len = 1000;
		return message.substring(0, len);
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
		Map<String,Object> msgParsed = null;
		try {
			msgParsed = new Gson().fromJson(message, Map.class);
			
		} catch (JsonSyntaxException e) {
			System.err.println("handleRequest() got non-JSON message: " + cleanString(message));
			return "";
		} catch (JsonParseException e) {
			System.err.println("handleRequest() got non-Map message: " + cleanString(message));
			return "";
		}

		if (msgParsed == null) {
			return "";
		} else if (!msgParsed.containsKey("cmd")) {
			System.err.println("handleRequest() got not conforming message: " + cleanString(message));
			return "";
		} else {
			String msgCommand = (String)msgParsed.get("cmd");

			for (Command c : Command.values()) {
				if (c.command.equals(msgCommand)) {
					Map <String, Object> m = c.execute(hub, session, msgParsed);
					Object id = msgParsed.get("id"); // id could be string or long
					if (id != null) {
						System.out.println("hR: id: " + id + " " + id.getClass().toString());
						m.put("id", id);
					} else
						m.put("id", 0);
					return new Gson().toJson(m);
				}
			}
			return "";
		}
	}
}
