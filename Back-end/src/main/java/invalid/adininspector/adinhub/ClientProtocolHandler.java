package invalid.adininspector.adinhub;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.websocket.Session;

import com.google.gson.Gson;
import com.google.gson.JsonParseException;
import com.google.gson.JsonSyntaxException;

import invalid.adininspector.exceptions.LoginFailureException;

/**
 * This class handles client requests by parsing them, executing the requested
 * action and producing a response. The requested actions are typically executed
 * by calls to the appropriate methods in the Hub object. The relation between
 * the Hub class and this class is basically the strategy design pattern with a
 * single strategy.
 */
public class ClientProtocolHandler {

	/**
	 * A Command object holds a client command and a method that implements the response to it.
	 *
	 */
	enum Command {
		LOGIN("LOGIN") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				Map<String, Object> m = new HashMap<String, Object>();
				String username = (String)msgParsed.get("user");
				String password = (String)msgParsed.get("pwd");
				String res = null;
				try {
					res = hub.login(session, username, password);
				} catch (LoginFailureException e) {
					e.printStackTrace();
					m.put("cmd", "SESSION");
					m.put("par", "LOGIN");
					m.put("status", "FAIL");
					m.put("token", "");
					m.put("msg", e.getMessage());
				}

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
				boolean loggedIn = hub.authenticate(session, token);
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

		GET_COLL_GROUPS("GET_COLL_GROUPS") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				List<List<String>> collectionGroups = hub.getCollectionGroups(session);
				msgParsed.put("cmd", "LIST_COLL_GROUPS");
				msgParsed.put("par", collectionGroups);
				return msgParsed;
			}
		},

		GET_COLL_GROUP_DATA("GET_COLL_GROUP_DATA") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				List<HashMap<String, Object>> collectionGroup = hub.getCollectionGroupData(session, collectionName);
				msgParsed.put("cmd", "DATAGROUP");
				msgParsed.put("name", collectionName);
				msgParsed.put("par", collectionGroup);
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

		GET_RECORD("GET_RECORD") {
			public Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed) {
				String collectionName = (String)msgParsed.get("par");
				String key = (String)msgParsed.get("key");
				String value = (String)msgParsed.get("value");
				String[] data = hub.getRecord(session, collectionName, key, value);
				//send augmented request back:
				msgParsed.put("cmd", "DATASINGLE");
				msgParsed.put("name", collectionName);
				msgParsed.put("data", data);
				msgParsed.remove("par");
				return msgParsed;
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
		/**
		 * Take a request (parsed into a string) and construct the response by
		 * calling the appropriate hub method(s).
		 * 
		 * @param hub the hub object holding the database connection
		 * @param session the websocket session
		 * @param msgParsed the request as key-value map
		 * @return the response as key-value map
		 */
		abstract Map<String, Object> execute(Hub hub, Session session, Map<String,Object> msgParsed);
	}

	private String cleanString(String message) {
		final int MAXLEN = 800;
		if (message.length() > MAXLEN) {
			return message.substring(0, MAXLEN);
		} else {
			return message;
		}
	}

	/**
	 * Parse the message from the client, call the specific method to handle this
	 * request and construct the response message which is then send via the hub
	 * to the client.
	 * 
	 * @param hub the hub for database access
	 * @param session the current websocket session
	 * @param message the client request to handle
	 */
	String handleRequest(Hub hub, Session session, String message) {
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