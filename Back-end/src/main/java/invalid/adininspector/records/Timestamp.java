package invalid.adininspector.records;

import java.util.Date;

//ankush's thing contains an object so this must also be a object
public class Timestamp {
    // should be stored as UNIX timestamp? right??
    public Date a;
    public Date date;

    public Timestamp(Date date) {
        this.date = date;
       
    }

    //TODO: fix for stupid broken variable in test data
    public Date getDate() {
        return    date ; 

    }

    
}
