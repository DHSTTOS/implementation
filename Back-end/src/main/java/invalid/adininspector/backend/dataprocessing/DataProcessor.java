package invalid.adininspector.backend.dataprocessing;

import java.util.ArrayList;
import java.util.List;

import invalid.adininspector.backend.MongoClientMediator;

public class DataProcessor {

    //should be paratremit
    private static List<IAggregator> aggregators =  new ArrayList<IAggregator>();
    
    public static void processData(String collection, MongoClientMediator clientMediator)
    {
        for (IAggregator agg : aggregators) {
            
        }
        //aggregators.forEach((Consumer<String>) );
    }


}
