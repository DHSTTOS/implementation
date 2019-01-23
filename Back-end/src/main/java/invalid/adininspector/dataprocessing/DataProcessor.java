package invalid.adininspector.dataprocessing;

import java.util.ArrayList;
import java.util.List;

import invalid.adininspector.MongoClientMediator;
import invalid.adininspector.records.Record;

public class DataProcessor {

    
    private static List<IAggregator> aggregators =  new ArrayList<IAggregator>();
    
    //TODO: compute and store the name of the aggregated collection
    public static void processData(Record[] records, MongoClientMediator clientMediator)
    {
        for (IAggregator agg : aggregators) {
            clientMediator.addRecordsToCollection( agg.processData(records),"Name");
        }
    }
}
