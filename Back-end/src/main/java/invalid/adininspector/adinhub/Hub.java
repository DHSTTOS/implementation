package invalid.adininspector.adinhub;

import javax.websocket.OnOpen;
import javax.websocket.server.ServerEndpoint;

import java.util.ArrayList;

import javax.websocket.*;

/**
 * This class implements the network handlers for the websocket connection
 * to the client and access methods for a database connection.
 */
@ServerEndpoint("/adinhubsoc")
public class Hub {
	/**
	 * The strategy object we call for the actual parsing of the client requests.
	 */
	private ClientProtocolHandler requestHandler;

	/**
	 * The database we use during a user session.
	 */
	private IUserSession database;
	
    /**
     * Event handler for the start of websocket connection.
     * 
     * @param session the current session
     */
    @OnOpen
    public void handleOpen(Session session) {
	System.out.println("open, session: " + session);
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
    	System.out.println("message from client: " + message);
    	String echoMsg = "Echo from the server : " + message; 
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
	 * Instantiate a new UserSession and log in into the database 
	 * using the given credentials.
	 * 
	 * @param udid - the user id to login with
	 * @param password the password
	 */
	public void UserSession(int udid, String password) {}
	
	/**
	 * Returns an array with the names of the collections available to the current user.
	 * 
	 * @return an array with collection names
	 */
	public String[] getAvailableCollections() {
		return null;
	}
	
	/**
	 * Returns the number of records in the specified collection.
	 * 
	 * @param collection the collection to query
	 * 
	 * @return the number of records
	 */
	public long getCollectionSize(String collection) {
		return 0;
	}
	
	
	/**
	 * Returns the record with the given id from the given collecton.
	 * 
	 * @param collection the collection to query
	 * @param id identifier of the record to return 
	 * @return the record with the specified identifier in this collection
	 */
	public String getEntryOf(String collection, String id) {
		return null;
	}
	
	/**
	 * Returns an array containing all records of this collection in the order
	 * they have in the collection.
	 * 
	 * @param coll the collection to query
	 * @return an array of the records of the specified collection
	 */
	public String[] getCollection(String coll){
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
	public String[] getCollectionInRange(String key, String start,String end) {
		return null;
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
	public long getCollectionInRangeSize(String key, String start, String end) {
		return 0;
	}
}

