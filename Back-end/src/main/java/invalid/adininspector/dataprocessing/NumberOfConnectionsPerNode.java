package invalid.adininspector.dataprocessing;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.bson.BasicBSONObject;
import org.bson.Document;

import invalid.adininspector.records.PacketRecord;
import invalid.adininspector.records.Record;

public class NumberOfConnectionsPerNode implements IAggregator {

	private Long currentTstmp;
    private ArrayList<Map<String, Object>> connectionsMapList;
    private Document currentDocument;
    private long second = 1000;

    //we need to be able to do processing on more types of records, probably using specialist methods. instead of taking records we take packetrecords, or alarmrecords and so on.
    @Override
    public ArrayList<Document> processData(ArrayList<Record> records) {

        if (records == null)
            return null;

        ArrayList<Document> processedRecords = new ArrayList<>();

        // we know that the records are organized by time
        // we are only doing aggregation on packetRecords
        // get first timestamp
        currentTstmp = (long) Long.valueOf(((PacketRecord) records.get(0)).getTimestamp());

        System.out.println("START PROCESSING");

        currentDocument = getNewAggregatorDocument(currentTstmp);

        connectionsMapList = new ArrayList<>();

        records.forEach(record -> {

            PacketRecord r = (PacketRecord) record;

            //check if the current timestamp is smaller than it +1 second.
            int retval = Long.valueOf(r.getTimestamp()).compareTo(currentTstmp + second);

            if (retval > 0) {
                List<BasicBSONObject> connectionsHolder = new ArrayList<>();

                // convert each map into an object and add it to connectionsHolder
                for (Map<String, Object> map : connectionsMapList)
                    connectionsHolder.add(new BasicBSONObject(map));

                currentDocument.append("connections", connectionsHolder);

                // add it to our processed records
                processedRecords.add(currentDocument);


                //set new timestamp
                currentTstmp = Long.valueOf(r.getTimestamp());

                // create new objects for processing
                connectionsMapList = new ArrayList<>();
                currentDocument = getNewAggregatorDocument(currentTstmp);
            }

            if (retval <= 0) {
                Boolean destInMap = false;
                Boolean srcInMap = false;

                // check if existing maps have the dst and src and increment the ocunt if that's the case
                for (Map<String, Object> map : connectionsMapList) {
                
                    // is the mac already part of the map?
                    if (map.get("MAC").equals(r.getDestinationMACAddress())) {
                        destInMap = !destInMap;
                        // get the current count, add 1 and put it back into the map
                        int count = Integer.parseInt((String) map.get("count")) + 1;
                        
                        map.replace("count", Integer.toString(count));                        
                    }

                    // is the mac already part of the map?
                    if (map.get("MAC").equals(r.getSourceMACAddress())) {
                        srcInMap = !srcInMap;

                        int count = Integer.parseInt((String) map.get("count")) + 1;
                        map.replace("count", Integer.toString(count));
                    }

                }

                // we have not seen this dest before this second
                if (!destInMap) {
                    Map<String, Object> map = new HashMap<String, Object>();

                    // add it to the map
                    map.put("MAC", r.getDestinationMACAddress());
                    map.put("count", "1");

                    connectionsMapList.add(map);
                }

                // we have not seen this src before this second
                if (!srcInMap) {
                    Map<String, Object> map = new HashMap<String, Object>();

                    // add it to the map
                    map.put("MAC", r.getSourceMACAddress());
                    map.put("count", "1");

                    connectionsMapList.add(map);
                }

            } 

        });

        return processedRecords;
    }

    @Override
    public Document getNewAggregatorDocument(long tstmp) {
        Document d = new Document();

        d.append("date", Long.toString(tstmp));

        return d;
    }
}
