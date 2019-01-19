package invalid.adininspector.backend;

import invalid.adininspector.backend.records.*;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;

import org.bson.Document;

public class MongoClientMediator {
    
    private MongoClient client;


    public MongoClientMediator(String udid,String password, String dbName)
    {  
        MongoClient mongoClient1 = new MongoClient();
    }

    public void addRecordToCollection(Record record, String collection)
    {
       
    }  

    public void addRecordToCollection(String[] records, String collection)
    {

    }

    public void ProcessCollection(String collection)
    {

    }
    
    public MongoCollection<Document> getCollection(String collection)
    {
        return null;

        
    }

    public String getStartRecord(String collection){return null;}
    public String getEndRecord(String collection){return null;}
    public int CollectionSize(String collection){return 0;}


    public String[] getRecordInRange(){return null;}
    public long getRecordsInRange(){return 0;}

    public String[] getAvailableCollections(){return null;}

    
}
