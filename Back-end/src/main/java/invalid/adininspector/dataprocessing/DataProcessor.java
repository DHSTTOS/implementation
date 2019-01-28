package invalid.adininspector.dataprocessing;

import java.util.ArrayList;
import java.util.List;

import invalid.adininspector.MongoClientMediator;
import invalid.adininspector.records.Record;

public class DataProcessor {
    private static List<IAggregator> aggregators =  new ArrayList<IAggregator>(){{
        add(new FlowRatePerSecond());
        add(new NumberOfConnectionsPerNode());
    }};
    
    //TODO: compute and store the name of the aggregated collection
    public static void processData(String collectionName, MongoClientMediator clientMediator){
        

        for (IAggregator agg : aggregators) {
            
            clientMediator.p("calculating : " + agg.getClass().getSimpleName());

            agg.processData(clientMediator.getCollectionAsRecordsArrayList(collectionName)).forEach(rec -> 
            {
                //TODO: give em back to the mediator for storage
                //clientMediator.p(rec.toString());

            });
            
            clientMediator.p(collectionName + "_" + agg.getClass().getSimpleName());
            
        }
    }

      //TODO: compute and store the name of the aggregated collection
      public static void processData(ArrayList<String> collectionNames, MongoClientMediator clientMediator){

       for (int i = 0; i < collectionNames.size(); i++) {
           processData(collectionNames.get(i), clientMediator);
       }
    }
}
