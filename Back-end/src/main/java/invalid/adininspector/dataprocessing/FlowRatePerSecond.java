/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.dataprocessing;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.BasicBSONObject;
import org.bson.Document;

import invalid.adininspector.records.PacketRecordDesFromMongo;
import invalid.adininspector.records.Record;

/**
 * Implements IAggregator. This calculates, per port, the outgoing and incoming
 * connections per second.
 *
 * A record processed by this aggregator is stored in a collection as follows:
 * Name of collection: collectionName\_FlowratePerSec
 * structure of record as json:
 * {
 *   "date" : \{" date" " Unix_Timestamp  } 
 *   rounded down to the second this record points to.
 *   Connections : [
 *     { Port: "portNumer", "InOut" : " In/Out ", count : "Number" }
 *     { Port: "portNumer", "InOut" : " In/Out ", count : "Number" }
 *     ...
 *   ] This array has an entry per port if the port communicated that second. 
 *     Precomputing this allows us to stream whenever the client needs the
 *     information for a specific node.
 * }
 *
 * TODO: this is terribly inneficient a better way would be to create a new record derivate and use the getAsDocument() function,
 *
 */
public class FlowRatePerSecond implements IAggregator {

    private Date currentTstmp;
    private ArrayList<Map<String, Object>> connectionsMapList;
    private Document currentDocument;
    private long second = 1000;
    private long id = 0;

    /**
     * Calculates, per port, the outgoing and incoming connections per second.
     *
     * TODO:  we need to be able to do processing on more types of records, probably specialist methods.
     *
     * @see invalid.adininspector.dataprocessing.IAggregator#processData(java.util.ArrayList)
     *
     * @param records - the records to be processed
     * @return aggregated data as bson Document
     */
    @Override
    public ArrayList<Document> processData(ArrayList<Record> records) {

        if (records.size() == 0)
                    return new ArrayList<>();
        
        //reset the id
        id = 0;
        

        ArrayList<Document> processedRecords = new ArrayList<>();

        // we know that the records are organized by time
        // we are only doing aggregation on packetRecords
        // get first timestamp
        currentTstmp =  Date.from( ((PacketRecordDesFromMongo) records.get(0)).getTimestamp().toInstant().truncatedTo(ChronoUnit.SECONDS) );

        currentDocument = getNewAggregatorDocument(currentTstmp);

        connectionsMapList = new ArrayList<>();

        records.forEach(record -> {

            PacketRecordDesFromMongo r = (PacketRecordDesFromMongo) record;

            //check if the current timestamp is smaller than it +1 second.
            int retval = Long.valueOf(r.getTimestamp().getTime()).compareTo(currentTstmp.getTime() + second);

            if (retval > 0) {
                List<BasicBSONObject> connectionsHolder = new ArrayList<>();

                // convert each map into an object and add it to connectionsHolder
                for (Map<String, Object> map : connectionsMapList)
                    connectionsHolder.add(new BasicBSONObject(map));

                currentDocument.append("connections", connectionsHolder);

                // add it to our processed records
                processedRecords.add(currentDocument);


                //set new timestamp
                currentTstmp = Date.from(currentTstmp.toInstant().plus(1,ChronoUnit.SECONDS));

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
                    if (map.get("MAC").equals(r.getDestinationMACAddress()) && map.get("In/Out").equals("Out")) {
                        destInMap = !destInMap;
                        // get the current count, add 1 and put it back into the map
                        int count = Integer.parseInt((String) map.get("count")) + 1;
                        
                        map.replace("count", Integer.toString(count));

                        
                    }

                    // is the mac already part of the map?
                    if (map.get("MAC").equals(r.getSourceMACAddress()) && map.get("In/Out").equals("In")) {
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
                    map.put("In/Out", "Out");
                    map.put("count", "1");

                    connectionsMapList.add(map);
                }

                // we have not seen this src before this second
                if (!srcInMap) {
                    Map<String, Object> map = new HashMap<String, Object>();

                    // add it to the map
                    map.put("MAC", r.getSourceMACAddress());
                    map.put("In/Out", "In");
                    map.put("count", "1");

                    connectionsMapList.add(map);
                }

            } 

        });

        return processedRecords;
    }

    /**
     * A helper routine that creates a new bson Document with default key-value pairs set.
     * @see invalid.adininspector.dataprocessing.IAggregator#getNewAggregatorDocument(java.util.Date)
     *
     * @param tstmp - the timestamp for this document
     * @return a new bson Document 
     */
    @Override
    public Document getNewAggregatorDocument(Date tstmp) {
        Document d = new Document();

        d.append("date", (tstmp));
        d.append("_id", id);
        id++;

        return d;
    }

}