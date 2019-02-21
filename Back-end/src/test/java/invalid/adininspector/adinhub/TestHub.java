package invalid.adininspector.adinhub;

import static org.junit.Assert.*;

import javax.websocket.Session;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import invalid.adininspector.exceptions.LoginFailureException;

import static org.mockito.Mockito.*;

/**
 * Test those methods of Hub that are not simply pass-through.
 * NOTE: these tests require Hub to access MockMongoDBUserSession().
 *
 */
public class TestHub {
	private static Hub hub = null;
	private static Session session = null;
	
	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
		hub = new Hub();
	}

	@Before
	public void setUp() throws Exception {
		//hub = new Hub();
	}

	@After
	public void tearDown() throws Exception {
	}

	@Test
	public void testLogin() {
		String token = null;
		try {
			token = hub.login(session, "admin", "admin");
		} catch (LoginFailureException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		assertNotNull(token);
	}

	@Test
	public void testLoginTokenSuccess() {
		String token = null;
		try {
			token = hub.login(session, "admin", "admin");
		} catch (LoginFailureException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		assertNotNull(token);
		boolean loggedIn = hub.authenticate(session, token);
		assertTrue(loggedIn);
	}
	
	@Test
	public void testLoginTokenFail() {
		String token = null;
		try {
			token = hub.login(session, "foo", "bar");
		} catch (LoginFailureException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		assertNull(token);
		boolean loggedIn = hub.authenticate(session, "invalid_token");
		assertFalse(loggedIn);
	}

	@Test
	public void testLogout() {
		String token = null;
		try {
			token = hub.login(session, "admin", "admin");
		} catch (LoginFailureException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		assertNotNull(token);
		String[] res;
		//res = hub.getAvailableCollections(session);
		//assertEquals(1, res.length);
		//assertEquals("mockdataset", res[0]);
		hub.logOut(session);
		res = hub.getAvailableCollections(session);
		assertNull(res);
	}
}
