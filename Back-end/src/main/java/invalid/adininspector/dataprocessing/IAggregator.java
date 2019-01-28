package invalid.adininspector.dataprocessing;

import java.util.ArrayList;

import invalid.adininspector.records.Record;

public interface IAggregator {

    public ArrayList<Record> processData( ArrayList<Record> records);
}
