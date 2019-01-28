package invalid.adininspector.dataprocessing;

import java.util.ArrayList;

import org.bson.Document;

import invalid.adininspector.records.Record;

public interface IAggregator {

    public ArrayList<Document> processData( ArrayList<Record> records);

    public Document getNewAggregatorDocument(long tstmp);
}
