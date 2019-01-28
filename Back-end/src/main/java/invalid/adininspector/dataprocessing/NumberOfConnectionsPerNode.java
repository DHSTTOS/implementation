package invalid.adininspector.dataprocessing;

import java.util.ArrayList;

import org.bson.Document;

import invalid.adininspector.records.Record;

public class NumberOfConnectionsPerNode implements IAggregator {

	@Override
	public ArrayList<Document> processData(ArrayList<Record> records) {
		return null;
	}

	@Override
	public Document getNewAggregatorDocument(long tstmp) {
		return null;
	}

}
