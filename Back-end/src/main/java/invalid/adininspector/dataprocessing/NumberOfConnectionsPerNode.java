package invalid.adininspector.dataprocessing;

import java.util.ArrayList;

import invalid.adininspector.records.Record;

public class NumberOfConnectionsPerNode implements IAggregator {

	@Override
	public ArrayList<Record> processData( ArrayList<Record>  records) {
		return records;
	}

}
