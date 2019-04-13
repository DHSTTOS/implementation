/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.dataprocessing;

import java.util.List;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.bson.BasicBSONObject;
import org.bson.Document;

import invalid.adininspector.records.PacketRecordDesFromMongo;
import invalid.adininspector.records.Record;

/**
 * Implements IAggregator. This calculates the outgoing and incoming connections.
 * A record processed by this aggregator is stored in a collection as follows:
 * Name of collection: collectionName\_FlowratePerSec
 * structure of record as json:
 * {
 *   "date" : \{" date" " Unix_Timestamp  } 
 *   rounded down to the second this record points to.
 *   Connections : [
 *     { Port: "portNumer", count : "Number" }
 *     { Port: "portNumer", count : "Number" }
 *     ...
 *   ] This array has an entry per port if the port communicated that second. 
 *     Precomputing this allows us to stream whenever the client needs the
 *     information for a specific node.
 *
 */
public class NumberOfConnectionsPerNode implements IAggregator {

	private Date currentTstmp;
    private ArrayList<Map<String, Object>> connectionsMapList;
    private Document currentDocument;
    private long second = 1000;
    private long id;
    

    /**
     * Calculate the outgoing and incoming connections.
     *
     * TODO: we need to be able to do processing on more types of records, probably using specialist methods. instead of taking records we take packetrecords, or alarmrecords and so on.
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
        currentTstmp = Date.from( ((PacketRecordDesFromMongo) records.get(0)).getTimestamp().toInstant().truncatedTo(ChronoUnit.SECONDS) );

        currentDocument = getNewAggregatorDocument(currentTstmp);

        connectionsMapList = new ArrayList<>();

 
        Map<String, Object> layerMap = new HashMap<String, Object>();

        layerMap.put("count","0");
        layerMap.put("Layer","L2");
        connectionsMapList.add(layerMap);
        
        layerMap = new HashMap<String, Object>();

        layerMap.put("count","0");
        layerMap.put("Layer","L3");
        connectionsMapList.add(layerMap);

        layerMap = new HashMap<String, Object>();

        layerMap.put("count","0");
        layerMap.put("Layer","L4");
        connectionsMapList.add(layerMap);

        records.forEach(record -> {

            PacketRecordDesFromMongo r = (PacketRecordDesFromMongo) record;

            //check if the current timestamp is smaller than it +1 second.
            int retval = Long.valueOf(r.getTimestamp().getTime()).compareTo(currentTstmp.getTime() + second);

            //get which layer the packet belongs to
            String layer = r.getL4Protocol().isEmpty() ? r.getL3Protocol().isEmpty() ?  r.getL2Protocol().isEmpty() ? "?":"L2" :"L3" :"L4";

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

                
                Map<String, Object> map = new HashMap<String, Object>();

                map.put("count","0");
                map.put("Layer","L2");
                connectionsMapList.add(map);
                
                map = new HashMap<String, Object>();

                map.put("count","0");
                map.put("Layer","L3");
                connectionsMapList.add(map);

                map = new HashMap<String, Object>();

                map.put("count","0");
                map.put("Layer","L4");
                connectionsMapList.add(map);
            }

            //within the same second
            if (retval <= 0) {
                Boolean layerInMap = false;

                //check if communication in this layer has been observed this second
                for (Map<String, Object> map : connectionsMapList) {
                    
                    if(map.get("Layer").equals(layer))
                    {
                        layerInMap = !layerInMap;

                        int count = Integer.parseInt((String) map.get("count")) + 1;
                        map.replace("count", Integer.toString(count));
                    }
                }

                if(!layerInMap)
                {
                    Map<String, Object> map = new HashMap<String, Object>();

                    map.put("Layer",layer);
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
