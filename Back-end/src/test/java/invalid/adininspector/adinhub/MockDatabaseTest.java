package invalid.adininspector.adinhub;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

public class MockDatabaseTest {

	static IUserSession session = null;

	@BeforeClass
	public static void setUpSession() throws Exception {
		session = new MockMongoDBUserSession().createUserSession("skroob", "12345");
		assertNotNull(session);
	}

	@After
	public void tearDownStuff() throws Exception {
	}


	@Test
	public void testGetAvailableCollections() {
		String[] colls = session.getAvailableCollections();
		assertEquals(1, colls.length);
		assertEquals("mockdataset", colls[0]);
	}

	@Test
	public void testGetCollectionSize() {
		assertEquals(1510, session.getCollectionSize("mockdataset"));
	}

	@Test
	public void testGetRecordsInRange() {
		assertEquals(new String[]{}, session.getRecordsInRange("mockdataset", "foo", "bar", "baz"));
	}

	@Test
	public void testGetRecordsInRange_SourceMACAddress() {
		String[] res = session.getRecordsInRange("mockdataset", "SourceMACAddress", "f8:ca:b8:59:07:a4", "f8:ca:b8:59:07:a5");
		assertEquals(412, res.length);
	}

	public void testGetRecordsInRange_Timestamp() {
		String[] res = session.getRecordsInRange("mockdataset", "Timestamp", "{\"$date\": 154142522900}", "{\"$date\": 154142522999}");
		assertEquals(5, res.length);
	}
}
