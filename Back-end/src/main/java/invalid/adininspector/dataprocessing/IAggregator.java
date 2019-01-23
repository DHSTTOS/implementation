package invalid.adininspector.dataprocessing;

import invalid.adininspector.records.Record;

public interface IAggregator {

    public Record[] processData(Record[] records);
}
