package invalid.adininspector.records;

//ankush's thing contains an object so this must also be a object
   public class Timestamp {
    //should be stored as UNIX timestamp? right??
    public String date;

    public Timestamp(String date) {
        this.date = date;
    }

    //TODO: fix for stupid broken variable in test data
    @Override
    public String toString() {
        return    date ; 
    }

    
}
