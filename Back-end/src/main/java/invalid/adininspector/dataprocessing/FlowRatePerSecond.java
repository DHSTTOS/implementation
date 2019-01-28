package invalid.adininspector.dataprocessing;

import java.util.ArrayList;

import invalid.adininspector.MongoClientMediator;
import invalid.adininspector.records.PacketRecord;
import invalid.adininspector.records.Record;

public class FlowRatePerSecond implements IAggregator {

    @Override
    public ArrayList<Record> processData( ArrayList<Record>  records) {
        
        if(records == null)
            return null;

        System.out.println("FLOWRATE CALLED");

        ArrayList<Record> processedRecords = new ArrayList<>();

        //we know that the records are organized by time
        //we are only doing aggregation on packetRecords
        Long timeStamp = Long.MIN_VALUE;

        records.forEach(record -> {
           //PacketRecord r = record;


        });
        return records;
    }

    
}
