package invalid.adininspector.adinhub;

import javax.websocket.OnOpen;
import javax.websocket.server.ServerEndpoint;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.websocket.*;

/**
 * This class implements the network handlers for the websocket connection
 * to the client and access methods for a database connection.
 */
@ServerEndpoint("/adinhubsoc")
public class Hub {
	
	
	/**
	 * The database to use
	 */
	IUserSession database;
	
	/**
	 * The strategy object we call for the actual parsing of the client requests.
	 */
	private ClientProtocolHandler requestHandler;

	/**
	 * Map login tokens to the websocket session in which they were requested
	 * and provided by the server. 
	 */
	private Map<String, Session> loginTokens;

	/**
	 * Map a websocket connection to a IUserSession (i.e. a database connection).
	 */
	private Map<Session, IUserSession> sessions;
	
	public Hub() {
		database = new MockMongoDBUserSession();
		requestHandler = new ClientProtocolHandler();
		loginTokens = new HashMap<String, Session>();
		sessions = new HashMap<Session, IUserSession>();
	}
	
    /**
     * Event handler for the start of websocket connection.
     * 
     * @param session the current session
     */
    @OnOpen
    public void handleOpen(Session session) {
	System.out.println("open, session: " + session);
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
    	//System.out.println("message from client: " + message);
    	String echoMsg = requestHandler.handleRequest(this, session, message);
    	//System.out.println("answer to client    : " + echoMsg);
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
     * This method is provided for the two-session-login scheme.
     * It takes a username and password to log into the database.
     * If successful, register the IUserSession and return a token to identify
     * it. Otherwise return an empty string.
     * 
     * @param session the login websocket session
     * @param username the username to login with
     * @param password the password to login with
     * 
     * @return a token to identify the IUserSession
     */
    String loginForToken(Session session, String username, String password) {
    	IUserSession dbSession = null;
    	String token = "";
    	return token;
    }
    
	/**
	 * Instantiate a new UserSession and log in into the database 
	 * using the given credentials.
	 * 
	 * @param udid - the user id to login with
	 * @param password the password
	 */
	public void createUserSession(int udid, String password) {}
	
	/**
	 * Returns an array with the names of the collections available to the current user.
	 * 
	 * @return an array with collection names
	 */
	public String[] getAvailableCollections(Session session) {
		return null;
	}
	
	
	/**
	 * Returns an array containing all records of this collection in the order
	 * they have in the collection.
	 * 
	 * @param coll the collection to query
	 * @return an array of the records of the specified collection
	 */
	public String[] getCollection(Session session, String collection){
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got reqeust for non-loggedin session" + session);
			return null; // XXX return empty array?
		}
		return userSession.getCollection(collection);
	}

	/**
	 * Returns a JSON string representation of the first record of the specified collection. 
	 * 
	 * @param coll the collection to query
	 * @return the first record of the collection as a JSON string
	 */
	public String getStartRecord(Session session, String collection){
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got reqeust for non-loggedin session" + session);
			return ""; // XXX return null?
		}
		return userSession.getStartRecord(collection);
	}

	/**
	 * Returns a JSON string representation of the first record of the specified collection. 
	 * 
	 * @param coll the collection to query
	 * @return the last record of the collection as a JSON string
	 */
	public String getEndRecord(Session session, String collection){
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got reqeust for non-loggedin session" + session);
			return ""; // XXX return null?
		}
		return userSession.getEndRecord(collection);
	}


	/**
	 * Returns the number of records in the specified collection.
	 * 
	 * @param collection the collection to query
	 * 
	 * @return the number of records
	 */
	public long getCollectionSize(Session session, String collection) {
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got reqeust for non-loggedin session" + session);
			return 0;
		}
		return userSession.getCollectionSize(collection);
	}
	
	
	/**
	 * Returns the record with the given id from the given collecton.
	 * 
	 * @param collection the collection to query
	 * @param id identifier of the record to return 
	 * @return the record with the specified identifier in this collection
	 */
	public String getEntryOf(Session session, String collection, String id) {
		return null;
	}

	/**
	 * Returns an array containing all records of this collection for which the
	 * value of the specified key is in the range [start, end). The records will
	 * be in the same order as they are in the collection.
	 * 
	 * @param key the record key by which the records are filtered
	 * @param start the start of the range of key values
	 * @param end the exclusive end of the range of key values
	 * @return an array of records matching the filter range
	 */
	public String[] getRecordsInRange(Session session, String collection, String key, String start,String end) {
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got reqeust for non-loggedin session" + session);
			return null; // XXX return empty array?
		}
		return userSession.getRecordsInRange(collection, key, start, end);
	}
	
	/**
	 * Returns the number of records in the specified collection for which the value
	 * of the specified key is within the range [start, end).
	 * 
	 * @param key the record key by which the records are filtered
	 * @param start the start of the range of key values
	 * @param end the exclusive end of the range of key values
	 * @return the number of records matching the filter range
	 */
	public long getRecordsInRangeSize(Session session, String collection, String key, String start, String end) {
		IUserSession userSession = sessions.get(session);
		if (userSession == null) {
			System.err.println("got reqeust for non-loggedin session" + session);
			return 0; // XXX return empty array?
		}
		return userSession.getRecordsInRangeSize(collection, key, start, end);
	}
}