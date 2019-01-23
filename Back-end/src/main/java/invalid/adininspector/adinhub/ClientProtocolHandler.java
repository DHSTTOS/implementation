package invalid.adininspector.adinhub;

import javax.websocket.Session;

/**
 * This class handles client requests by parsing them, executing
 * the requested action and producing responses.
 * The requested action are executed by calls to the Hub object.
 */
public class ClientProtocolHandler {

		/**
		 * Parse the message from the client, call the corresponding method of the hub
		 * and construct the response message which is then send via the hub
		 * to the client.
		 * 
		 * @param hub the hub for database access
		 * @param session the current session
		 * @param message the client request to handle
		 */
		void handleRequest(Hub hub, Session session, String message) {
	}
}
