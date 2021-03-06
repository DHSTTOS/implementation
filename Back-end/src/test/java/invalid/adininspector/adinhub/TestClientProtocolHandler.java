package invalid.adininspector.adinhub;

import static org.junit.Assert.*;

import java.util.Map;

import javax.websocket.Session;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import static org.mockito.Mockito.*;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;

import com.google.gson.Gson;
import com.google.gson.JsonParseException;
import com.google.gson.JsonSyntaxException;

import invalid.adininspector.exceptions.LoginFailureException;

/**
 * NOTE: these tests require Hub to access MockMongoDBUserSession().
 */
public class TestClientProtocolHandler {
	private static ClientProtocolHandler cph;
	@Mock
	private static Hub hub;

	@Mock Session session;
	
	@Rule public MockitoRule mockitoRule = MockitoJUnit.rule();
	
	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
	}

	@Before
	public void setUp() throws Exception {
		//hub = new Hub();
		cph = new ClientProtocolHandler();
	}

	@After
	public void tearDown() throws Exception {
	}

	@Test   // needs to use a mock object for the database
	public void testLogin() {
		try {
			when(hub.login(session, "admin", "admin")).thenReturn("{\"cmd\": \"SESSION\", \"status\": \"OK\"}");
		} catch (LoginFailureException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		String response = cph.handleRequest(hub, session,
				"{\"cmd\": \"LOGIN\", \"user\": \"admin\", \"pwd\": \"admin\", \"id\": \"12\"}");
		Map<String,Object> msgParsed = null;
		try {
			msgParsed = new Gson().fromJson(response, Map.class);

		} catch (JsonSyntaxException e) {
			System.err.println("handleRequest() got non-JSON message: " + response);
			return;
		} catch (JsonParseException e) {
			System.err.println("handleRequest() got non-Map message: " + response);
			return;
		}
		assertEquals("SESSION", msgParsed.get("cmd"));
		assertEquals("LOGIN", msgParsed.get("par"));
		assertEquals("OK", msgParsed.get("status"));
		assertEquals("12", msgParsed.get("id"));
}

	//@Test   // needs proper mock object
	public void testAvailableCollections() {
		String response = cph.handleRequest(hub, session,
				"{\"cmd\": \"LOGIN\", \"user\": \"foo\", \"pwd\": \"swordfish\", \"id\": \"12\"}");
		response = cph.handleRequest(hub, session,
				"{\"cmd\": \"GET_AV_COLL\", \"id\": \"12\"}");
		assertEquals("{\"cmd\":\"LIST_COLL\",\"id\":\"12\",\"par\":[\"mockdataset\"]}", response);
	}

}
