package invalid.adininspector.backend.dataprocessing;

import invalid.adininspector.backend.records.Record;

public interface IAggregator {

    public Record[] processData(Record[] records);
}
