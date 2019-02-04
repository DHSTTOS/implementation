/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.dataprocessing;

import java.util.ArrayList;
import java.util.List;

import invalid.adininspector.MongoClientMediator;
import invalid.adininspector.records.Record;

public class DataProcessor {
    private static List<IAggregator> aggregators =  new ArrayList<IAggregator>(){{
        add(new FlowRatePerSecond());
        add(new NumberOfConnectionsPerNode());
        add(new AddressesAndLinks());
    }};
    
    //TODO: compute and store the name of the aggregated collection
    public static void processData(String collectionName, MongoClientMediator clientMediator){
        

        for (IAggregator agg : aggregators) {
            
            clientMediator.p("calculating : " + agg.getClass().getSimpleName() + " for: " + collectionName);

            clientMediator.addRecordsToCollection(agg.processData(clientMediator.getCollectionAsRecordsArrayList(collectionName)), collectionName + "_" + agg.getClass().getSimpleName());
            
            clientMediator.p("FINISHED");
            
        }
    }

      //TODO: compute and store the name of the aggregated collection
      public static void processData(ArrayList<String> collectionNames, MongoClientMediator clientMediator){

       for (int i = 0; i < collectionNames.size(); i++) {
           processData(collectionNames.get(i), clientMediator);
       }
    }
}
