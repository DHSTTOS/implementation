/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.dataprocessing;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import invalid.adininspector.MongoClientMediator;

/**
 * This class is a mediator for each one of our data aggregators used for
 * extraction of features from the raw data stored in mongoDB. We might want to
 * have multiple data processors for chaining different aggregators together or
 * to split up the work into multiple threads. This is dependent on further
 * performance testing.
 */
public class DataProcessor {
	/**
	 * A list containing all the aggregators to be applied on a collection.
	 */
	private static List<IAggregator> aggregators = new ArrayList<IAggregator>() {
		{
			add(new FlowRatePerSecond());
			add(new NumberOfConnectionsPerNode());
			add(new AddressesAndLinks());
			add(new NumberOfConnectionsPerMac());
		}
	};

	private static List<IAggregator> rangeAggregators = new ArrayList<IAggregator>() {
		{
			add(new AddressesAndLinks());
		}
	};

	public static boolean isRealTimeUptoDate = false;

	/**
	 * This method processes the specified collection of the specified
	 * MongoClientMediator by each of the aggregators registered in this class. For
	 * each aggregator it reads the collectoin, applies the aggregator's
	 * processData() method to the collection and stores the result in the same
	 * MongoClientMediator in a new collection whose name is the collection name
	 * followed by an underscore followed by the aggregator's name.
	 * 
	 * 
	 * @param collectionName - the record collection to process
	 * @param clientMediator - the clientMediator holding the specified collection
	 */
	public static void processData(String collectionName, MongoClientMediator clientMediator) {

		if (collectionName.equals("realTime"))
			isRealTimeUptoDate = true;

		System.out.println("processing: " + collectionName);

		for (IAggregator agg : aggregators) {

			//drop old collections
			clientMediator.dropCollection(collectionName + "_" + agg.getClass().getSimpleName());

			clientMediator.addRecordsToCollection(
					agg.processData(clientMediator.getCollectionAsRecordsArrayList(collectionName)),
					collectionName + "_" + agg.getClass().getSimpleName());
		}
	}

	//TODO: take objects not dates
	public static void processDataInRange(String collectionName, MongoClientMediator clientMediator, String key,
			Date start, Date end) {
		for (IAggregator agg : rangeAggregators) {
			//drop old collections
			clientMediator.dropCollection(collectionName + "_" + agg.getClass().getSimpleName());

			clientMediator.addRecordsToCollection(
					agg.processData(clientMediator.getCollectionAsRecordsArrayList(collectionName, key, start, end)),
					collectionName + "_" + agg.getClass().getSimpleName());

		}
	}

	/**
	 * This method processes the specified collections of the specified
	 * MongoClientMediator by each of the aggregators registered in this class. It
	 * calls processData(String, MongoClientMediator) for each of the specified
	 * collections.
	 * 
	 * 
	 * @param collectionNames - the collections to process
	 * @param clientMediator  - the clientMediator holding these collections
	 */
	public static void processData(ArrayList<String> collectionNames, MongoClientMediator clientMediator) {

		for (int i = 0; i < collectionNames.size(); i++) {
			processData(collectionNames.get(i), clientMediator);
		}
	}

	public static void createMockAggCollections(String collection, MongoClientMediator clientMediator) {
		for (IAggregator agg : aggregators) {
			clientMediator.createEmptyCollection(collection + "_" + agg.getClass().getSimpleName());
		}
	}

	public static void dropAggCollections(String collection, MongoClientMediator clientMediator) {
		for (IAggregator agg : aggregators) {
			clientMediator.dropCollection(collection + "_" + agg.getClass().getSimpleName());
		}
	}

	public static void redoAggregation(String collection, MongoClientMediator clientMediator) {
		dropAggCollections(collection, clientMediator);
		processData(collection, clientMediator);
	}
}