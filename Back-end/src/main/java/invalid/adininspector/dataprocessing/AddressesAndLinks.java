package invalid.adininspector.dataprocessing;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.bson.Document;

import invalid.adininspector.records.PacketRecordDesFromMongo;
import invalid.adininspector.records.Record;

public class AddressesAndLinks implements IAggregator {

    private ArrayList<Map<String, Object>> connectionsMapList;

    private ArrayList<Map<String, Object>> linksMapList;

    @Override
    public ArrayList<Document> processData(ArrayList<Record> records) {

        if (records == null)
            return null;

        int id = 0;

        ArrayList<Document> processedRecords = new ArrayList<>();

        Document doc = getNewAggregatorDocument(null);


        connectionsMapList = new ArrayList<>();
        linksMapList = new ArrayList<>();

        records.forEach(record -> {

            PacketRecordDesFromMongo r = (PacketRecordDesFromMongo) record;

            // create the map for the connections
            Map<String, Object> srcConMap = new HashMap<String, Object>();
            Map<String, Object> destConMap = new HashMap<String, Object>();


            ArrayList< Map<String, Object>> conNodeMapList = new ArrayList<>();

            ArrayList< Map<String, Object>> conLinkMapList = new ArrayList<>();

            //map for destConMap
            if (!r.getL4Protocol().isEmpty()) {
                srcConMap.put("id", r.getSourcePort());
                srcConMap.put("type", "L4");
                srcConMap.put("Protocol", r.getL4Protocol());

                destConMap.put("id", r.getDestinationPort());
                destConMap.put("type", "L4");
                destConMap.put("Protocol", r.getL4Protocol());

                conNodeMapList.add(nodeMap(r.getSourcePort(),"L4", r.getL4Protocol()));
                conNodeMapList.add(nodeMap(r.getDestinationPort(), "L4", r.getL4Protocol()));

                //ip -> port * 2
                conLinkMapList.add(linkMap(r.getSourceIPAddress(), r.getSourcePort()));
                conLinkMapList.add(linkMap(r.getDestinationIPAddress(), r.getDestinationPort()));
                //mac -> ip * 2
                conLinkMapList.add(linkMap(r.getSourceMACAddress(), r.getSourceIPAddress()));
                conLinkMapList.add(linkMap(r.getDestinationMACAddress(), r.getDestinationIPAddress()));

                //port -> port
                conLinkMapList.add(linkMap(r.getSourcePort(), r.getDestinationPort()));

                //conLinkMap.put();
            } 
            if (!r.getL3Protocol().isEmpty()) {
                srcConMap.put("id", r.getSourceIPAddress());
                srcConMap.put("type", "L3");
                srcConMap.put("Protocol", r.getL3Protocol());

                destConMap.put("id", r.getDestinationIPAddress());
                destConMap.put("type", "L3");
                destConMap.put("Protocol", r.getL3Protocol());


                conNodeMapList.add(nodeMap(r.getSourceIPAddress(),"L3", r.getL3Protocol()));
                conNodeMapList.add(nodeMap(r.getDestinationIPAddress(), "L3", r.getL3Protocol()));
                
                //mac -> ip * 2
                conLinkMapList.add(linkMap(r.getSourceMACAddress(), r.getSourceIPAddress()));
                conLinkMapList.add(linkMap(r.getDestinationMACAddress(), r.getDestinationIPAddress()));

                //ip -> ip
                conLinkMapList.add(linkMap(r.getSourceIPAddress(), r.getDestinationIPAddress()));

            } 
             
            if(!r.getL3Protocol().isEmpty() && !r.getL4Protocol().isEmpty()){
                // srcConMap.put("id", r.getSourceMACAddress());
                // srcConMap.put("type", "L2");
                // srcConMap.put("Protocol", r.getL2Protocol());

                // destConMap.put("id", r.getDestinationMACAddress());
                // destConMap.put("type", "L2");
                // destConMap.put("Protocol", r.getL2Protocol());

                //172.16.10.49
                //conneciton mac to mac
                conLinkMapList.add(linkMap(r.getSourceMACAddress(), r.getDestinationMACAddress()));
            }


            conNodeMapList.add(nodeMap(r.getSourceMACAddress(),"L2", r.getL2Protocol()));
            conNodeMapList.add(nodeMap(r.getDestinationMACAddress(), "L2", r.getL2Protocol()));

            //System.out.println(r.getSourceMACAddress() + " > "+ r.getDestinationMACAddress());

            //System.out.println(r.getL2Protocol() + " " + r.getL3Protocol() + " " + r.getL4Protocol());
            //System.out.println(conLinkMapList.size());


            //connectionsMapList.conta
            // create map for the Links

            boolean destInMap = false;
            boolean srcInMap = false;

            //check if we've seen this before
            for (Map<String, Object> map : connectionsMapList) {

                // //both are in map. move on
                // if(destInMap && srcInMap)
                //     break;

                // if(map.equals(srcConMap))
                //     srcInMap = true;
                // if(map.equals(destConMap))
                //     destInMap = true;
                for (Map<String,Object> n : conNodeMapList) {
                    if(n.containsKey("invalid"))
                        continue;

                    if (n.equals(map))
                        {
                            n.put("invalid", 0);
                            //l.keySet().contains("invalid");
                        }
                }


            }

            // if(!destInMap)
            // {
            //     connectionsMapList.add(destConMap);
            //     System.out.println("added dest");
            // }
            // if(!srcInMap)
            // {
            //     connectionsMapList.add(srcConMap);
            //     System.out.println("added src");
            // }
            for (Map<String, Object> map : linksMapList) {
                
                if(conLinkMapList.isEmpty())
                    return;

                for (Map<String,Object> l : conLinkMapList) {

                    if(l.containsKey("invalid"))
                        continue;

                    if (l.equals(map))
                    {
                        l.put("invalid", 0);
                        //l.keySet().contains("invalid");
                    }
                }
                
            }

            for (Map<String,Object> l : conLinkMapList) {
                if(l.containsKey("invalid"))
                    continue;
                // if( l.get("source").equals("0.0.0.0") || l.get("target").equals("0.0.0.0"))
                //     continue;

                // if( l.get("source").equals("255.255.255.255") || l.get("target").equals("255.255.255.255"))
                //     continue;
                    
                    //System.out.println("added " + l.toString());
                linksMapList.add(l);
            }

            for (Map<String,Object> n : conNodeMapList) {
                if(n.containsKey("invalid"))
                    continue;
                // if( l.get("source").equals("0.0.0.0") || l.get("target").equals("0.0.0.0"))
                //     continue;

                // if( l.get("source").equals("255.255.255.255") || l.get("target").equals("255.255.255.255"))
                //     continue;
                    
                    //System.out.println("added " + l.toString());
                    connectionsMapList.add(n);
            }
            
            
        });

        System.out.println("conns: " + connectionsMapList.size());

        doc.put("nodes", connectionsMapList);
        doc.put("links", linksMapList);

        processedRecords.add(doc);
        
        
        return processedRecords;
    }

    @Override
    public Document getNewAggregatorDocument(Date tstmp) {
        Document d = new Document();

        // one collection with 1 object
        d.append("_id", 0);

        return d;
    }

    private Map<String,Object> linkMap(String src,String dest)
    {

         return new HashMap<String,Object>() {{
            put("source", src);
            put("target", dest);
        }};
    
    }

    private Map<String,Object> nodeMap(String id,String type,String protocol)
    {
         return new HashMap<String,Object>() {{
            put("id", id);
            put("type", type);
            put("Protocol", protocol);
        }};
    }

}