package invalid.adininspector.adinhub;

import static org.junit.Assert.*;

import javax.websocket.Session;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * NOTE: these tests require Hub to access MockMongoDBUserSession().
 */
public class TestClientProtocolHandler {
	private static ClientProtocolHandler cph;
	private static Hub hub = null;
	private static Session session = null;

	
	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
	}

	@Before
	public void setUp() throws Exception {
		hub = new Hub();
		cph = new ClientProtocolHandler();
	}

	@After
	public void tearDown() throws Exception {
	}

	// Don't test for now because we need to handle the random token correctly
	public void testLogin() {
		String response = cph.handleRequest(hub, session,
				"{\"cmd\": \"LOGIN\", \"user\": \"foo\", \"pwd\": \"swordfish\", \"id\": \"12\"}");
		assertEquals("{\"par\":\"-2032461221211193280\",\"cmd\":\"SESSION\",\"id\":\"12\",\"status\":\"OK\"}", response);
	}

	// Don't test for now because we need to handle the random token correctly
	@Test
	public void testAvailableCollections() {
		String response = cph.handleRequest(hub, session,
				"{\"cmd\": \"LOGIN\", \"user\": \"foo\", \"pwd\": \"swordfish\", \"id\": \"12\"}");
		//assertEquals("{\"par\":\"-2032461221211193280\",\"cmd\":\"SESSION\",\"id\":\"12\",\"status\":\"OK\"}", response);
		response = cph.handleRequest(hub, session,
				"{\"cmd\": \"GET_AV_COLL\", \"id\": \"12\"}");
		assertEquals("{\"par\":[\"mockdataset\"],\"cmd\":\"LIST_COL\",\"id\":\"12\"}", response);
		
		
	}

}
