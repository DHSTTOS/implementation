package invalid.adininspector.adinhub;

import javax.websocket.OnOpen;
import javax.websocket.server.ServerEndpoint;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;

import javax.websocket.*;

/**
 * This class implements the network handlers for the WebSocket connection to
 * the client.
 * It also has wrapper methods that delegate the database access commands to the
 * appropriate IUserSession object.
 */
@ServerEndpoint("/adinhubsoc2")
public class Hub {
	/**
	 * The strategy object we call for the actual parsing of the client requests.
	 */
	private ClientProtocolHandler requestHandler;

	/**
	 * Map login tokens to the websocket session in which they were requested
	 * and provided by the server. 
	 */
	private static Map<String, IUserSession> loginTokens;

	/**
	 * Map a websocket connection to a IUserSession (i.e. a database connection).
	 */
	private static Map<Session, IUserSession> sessions;

	/**
	 * The default constructor.
	 */
	public Hub() {
		requestHandler = new ClientProtocolHandler();
		loginTokens = new HashMap<String, IUserSession>();
		sessions = new HashMap<Session, IUserSession>();
		System.out.println("hub started");
	}

	/**
	 * Event handler for the start of websocket connection.
	 * 
	 * @param session the current session
	 */
	@OnOpen
	public void handleOpen(Session session) {
		System.out.println("hub open, session: " + session);
		session.setMaxIdleTimeout(-1);
	}

	/**
	 * Event handler for closing a connection.
	 * 
	 * @param session the current session
	 */
	@OnClose
	public void handleClose(Session session) {
		System.out.println("close, session: " + session);
	}

	/**
	 * Event handler for receiving a message. The message is passed
	 * to the ClientProtocolHandler.
	 * 
	 * @param message the message that we received from the client
	 * @param session the current session
	 * @return the response for the client
	 */
	@OnMessage
	public String handleMessage(String message, Session session) {
		System.out.println("message from client1: " + message);
		String echoMsg = requestHandler.handleRequest(this, session, message);
		System.out.println("answer to client   1: " + echoMsg);
		return echoMsg;                       
	}

	/**
	 * Event handler for errors/exceptions during communication.
	 * 
	 * @param session the current session
	 * @param t the exception that occurred
	 */
	@OnError
	public void handleError(Session session, Throwable t) {
		System.out.println("error, session: " + session);
		t.printStackTrace();
	}


	/**
	 * If the username and password are valid, log the user in and create a new
	 * IUserSession object for the database session, register it, and return an
	 * authentication token for it.
	 * If the login fails, return an empty string.
	 * 
	 * @param session the current websocket session
	 * @param username the username to login with
	 * @param password the password to login with
	 * 
	 * @return a token to identify the IUserSession
	 */
	public String login(Session session, String username, String password) {
		IUserSession dbUserSession = createUserSession(session, username, password);
		if (dbUserSession == null)
			return "";

		long tokenValue = new Random().nextLong();
		String token = Long.toString(tokenValue);
		sessions.put(session, dbUserSession);	// needed for single-ws-session case
		loginTokens.put(token, dbUserSession);
		System.out.println("l #registered keys: "  + loginTokens.keySet().size());
		for (String key : loginTokens.keySet()) {
			System.out.println("registered key: " + key);
		}
		System.out.println("login: this " + this);
		return token;
	}

	/**
	 * Instantiate a new IUserSession and log in into the database 
	 * using the given credentials.
	 * If the login was successful it returns an IUserSession object for a logged
	 * in database session, otherwise null.
	 * 
	 * NOTE: This method is currently hardcoded to instantiate a MongoDBUserSession
	 * object; it could be made more flexible by using the factory or abstract
	 * factory design pattern.
	 * 
	 * @param session the websocket session
	 * @param username the username to login with
	 * @param password the password to login with
	 * @return a new IUserSession object for a logged in database session

	 */
	public IUserSession createUserSession(Session session, String username, String password) {
		IUserSession dbUserSession = MongoDBUserSession.createUserSession(username, password);
		return dbUserSession;
	}

	/**
	 * Login with the given authentication token.
	 * 
	 * @param session the current, "main" websocket session
	 * @param token the token to authenticate this session with
	 *
	 * @return true if login/authentication successful
	 */
	public boolean authenticate(Session session, String token) {
		System.out.println("lWT: this " + this);
		System.out.println("lWT #registered keys: "  + loginTokens.keySet().size());
		for (String key : loginTokens.keySet()) {
			System.out.println("lWT: registered key: " + key);
		}
		boolean isLoggedIn = loginTokens.containsKey(token);
		System.out.println("lWT: " + token + " " + isLoggedIn);
		if (isLoggedIn) {
			IUserSession dbUserSession = loginTokens.get(token);

			// remove the sessions entry for the login websocket session:
			for (Session oldSession : sessions.keySet()) {
				if (sessions.get(oldSession).equals(dbUserSession))
					sessions.remove(oldSession);
			}

			sessions.put(session, dbUserSession);	// register the current ("work") session
			return true;
		}
		return false;
	}

	/**
	 * Logout.
	 * @param session the current websocket session
	 */
	public void logOut(Session session) {
		IUserSession dbUserSession = sessions.get(session);
		if (dbUserSession == null) {
			System.err.println("logOut(): got request for non-logged-in session" + session);
			return;
		}

		sessions.remove(session);
		// remove the token entry for this session:
		Iterator<String> tokenSet = loginTokens.keySet().iterator();
		for(; tokenSet.hasNext();) {
			String token = tokenSet.next();
			if (loginTokens.get(token).equals(dbUserSession)) {
				tokenSet.remove();
			}
		}

		// The session will ultimately be closed when the garbage collection
		// removes it:
		dbUserSession = null;
	}

	/**
	 * Returns an array with the names of the collections available to the current user.
	 * 
	 * @param session the current websocket session
	 * @return an array with collection names
	 */
	public String[] getAvailableCollections(Session session) {
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got request for non-logged-in session" + session);
			return null; // XXX return empty array?
		}
		return userSession.getAvailableCollections();
	}


	/**
	 * Returns an array containing all records of this collection in the order
	 * they have in the collection.
	 * 
	 * @param session the current websocket session
	 * @param collection the collection to query
	 * @return an array of the records of the specified collection
	 */
	public String[] getCollection(Session session, String collection){
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got request for non-logged-in session" + session);
			return null; // XXX return empty array?
		}
		return userSession.getCollection(collection);
	}

	/**
	 * Returns a JSON string representation of the first record of the specified collection. 
	 * 
	 * @param session the current websocket session
	 * @param collection the collection to query
	 * @return the first record of the collection as a JSON string
	 */
	public String getStartRecord(Session session, String collection){
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got request for non-logged-in session" + session);
			return ""; // XXX return null?
		}
		return userSession.getStartRecord(collection);
	}

	/**
	 * Returns a JSON string representation of the last record of the specified collection. 
	 * 
	 * @param session the current websocket session
	 * @param collection the collection to query
	 * @return the last record of the collection as a JSON string
	 */
	public String getEndRecord(Session session, String collection){
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got request for non-logged-in session" + session);
			return ""; // XXX return null?
		}
		return userSession.getEndRecord(collection);
	}


	/**
	 * Returns the number of records in the specified collection.
	 * 
	 * @param session the current websocket session
	 * @param collection the collection to query
	 * 
	 * @return the number of records
	 */
	public long getCollectionSize(Session session, String collection) {
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got request for non-logged-in session" + session);
			return 0;
		}
		return userSession.getCollectionSize(collection);
	}


	/**
	 * Returns the record with the given id from the given collecton.
	 * 
	 * @param session the current websocket session
	 * @param collection the collection to query
	 * @param id identifier of the record to return 
	 * @return the record with the specified identifier in this collection
	 */
	public String getEntryOf(Session session, String collection, String id) {
		return null;
	}

	/**
	 * Returns an array containing all records of the specified collection for
	 * which the value of the specified key is in the range [start, end).
	 * The records will be in the same order as they are in the collection.
	 * 
	 * @param session the current websocket session
	 * @param collection the collection to query
	 * @param key the record key by which the records are filtered
	 * @param start the start of the range of key values
	 * @param end the exclusive end of the range of key values
	 * @return an array of records matching the filter range
	 */
	public String[] getRecordsInRange(Session session, String collection, String key, String start,String end) {
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got request for non-logged-in session" + session);
			return null; // XXX return empty array?
		}
		return userSession.getRecordsInRange(collection, key, start, end);
	}

	/**
	 * Returns the number of records in the specified collection for which the
	 * value of the specified key is within the range [start, end).
	 * 
	 * @param session the current websocket session
	 * @param collection the collection to query
	 * @param key the record key by which the records are filtered
	 * @param start the start of the range of key values
	 * @param end the exclusive end of the range of key values
	 * @return the number of records matching the filter range
	 */
	public long getRecordsInRangeSize(Session session, String collection, String key, String start, String end) {
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got request for non-logged-in session" + session);
			return 0; // XXX return empty array?
		}
		return userSession.getRecordsInRangeSize(collection, key, start, end);
	}
}
