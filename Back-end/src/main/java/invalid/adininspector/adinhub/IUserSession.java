package invalid.adininspector.adinhub;

/**
 * An IUserSession object encapsulates a data base session.
 * On instantiation an IUserSession connects to a database using
 * the given user id and password and uses this connection for
 * all following data base access.
 */
public interface IUserSession {

	/**
	 * Instantiate a new UserSession and log in into the database 
	 * using the given credentials.
	 * 
	 * @param udid the user id to login with
	 * @param password the password
	 */
	public IUserSession createUserSession(String username, String password);
	
	/**
	 * Returns an array with the names of the collections available to the current user.
	 * 
	 * @return an array with collection names
	 */
	public String[] getAvailableCollections();
	
	/**
	 * Returns an array containing all records of this collection in the order
	 * they have in the collection.
	 * 
	 * @param coll the collection to query
	 * @return an array of the records of the specified collection
	 */
	public String[] getCollection(String coll);

	/**
	 * Return the first record of a collection.
	 * 
	 * @param coll the collection to query
	 * @return the first record of the specified collection
	 */
	public String getStartRecord(String coll);
	
	/**
	 * Return the first record of a collection.
	 * 
	 * @param coll the collection to query
	 * @return the first record of the specified collection
	 */
	public String getEndRecord(String coll);

	
	/**
	 * Returns the number of records in the specified collection.
	 * 
	 * @param collection the collection to query
	 * 
	 * @return the number of records
	 */
	public long getCollectionSize(String collection);
	
	
	
	
	/**
	 * Returns an array containing all records of the collection for which the
	 * value of the specified key is in the range [start, end). The records will
	 * be in the same order as they are in the collection.
	 * 
	 * @param collection the collection to query
	 * @param key the record key by which the records are filtered
	 * @param start the start of the range of key values
	 * @param end the exclusive end of the range of key values
	 * @return an array of records matching the filter range
	 */
	public String[] getRecordsInRange(String collection, String key, String start,String end);
	
	/**
	 * Returns the number of records in the specified collection for which the value
	 * of the specified key is within the range [start, end).
	 * 
	 * @param collection the collection to query
	 * @param key the record key by which the records are filtered
	 * @param start the start of the range of key values
	 * @param end the exclusive end of the range of key values
	 * @return the number of records matching the filter range
	 */
	public long getRecordsInRangeSize(String collection, String key, String start, String end);
}
