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
		hub = new Hub();
		cph = new ClientProtocolHandler();
	}

	@Before
	public void setUp() throws Exception {
	}

	@After
	public void tearDown() throws Exception {
	}

	@Test
	public void test() {
		cph.handleRequest(hub, session,
				"{\"cmd\": \"LOGIN\", \"user\": \"foo\", \"pwd\": \"swordfish\", \"id\": \"12\"}");
		fail("Not yet implemented");
	}

}
