package invalid.adininspector.records;

import org.bson.Document;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

//Records are anything that can go into the mongoDb, on coversion from the dissector
public abstract class Record {

    // every record has to have a
    protected String _id;

    // serialize all variables (in order ) of a Record into a Bson document for
    // mongoDB
    public Document getAsDocument() {
        Document doc = new Document();

        // append the id first
        doc.append("_id", _id);

        for (Field var : this.getClass().getDeclaredFields()) {
            try {
                Method m = this.getClass().getDeclaredMethod("get" + var.getName());
                if (!var.getName().contentEquals("Timestamp"))
                    doc.append(var.getName(), m.invoke(this));
                else {
                    //TODO: FIX THIS STUPID HACK FOR ANKUSH'S IDIOTIC TIMESTAMP HANDLING
                    Map<String, String> rightHereMap = new HashMap<String, String>();
                    rightHereMap.put("date", (String)m.invoke(this));
                        

                    doc.append(var.getName(), rightHereMap);

                }
            } catch (NoSuchMethodException e) {
                System.out.println("no getter method for variable: " + var.getName());
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                // should never trigger cause this is called from childs
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                // object this always exists so should never trigger either
                e.printStackTrace();
            }
        }
        return doc;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String get_id() {
        return _id;
    }

}
