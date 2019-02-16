/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.records;

import org.bson.BsonTimestamp;
import org.bson.Document;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Every message that comes from kafka and needs to be added to the database has
 * its own Record class that inherit from this one.
 * Every single class that inherits needs to be able to, using reflection,
 * convert itself into a Bson Document where every variable is a key Value pair
 * of the name of the variable and its associated value.
 *
 * Records are anything that can go into the mongoDb, on conversion from the dissector
 * TODO: handle maps properly, convert classes to maps and reuse the handling.
 */
public abstract class Record {

	// every record has to have an id. if none is provided then mongo takes the Java object ID
	protected long _id;

	// serialize all variables (in order ) of a Record into a Bson document for
	// mongoDB
	/**
	 * This function checks for every variable, gets its name and value as a
	 * string and adds it to the document that it eventually returns.
	 * 
	 * @return a Document, containing every variable of any class inheriting from this one.
	 */
	public Document getAsDocument() {
		Document doc = new Document();

		// append the id first
		doc.append("_id", _id);

		for (Field var : this.getClass().getDeclaredFields()) {
			try {
				Method m = this.getClass().getDeclaredMethod("get" + var.getName());
				if (var.getType() == String.class) //if we get a string, cast the getter. EASY
					doc.append(var.getName(), m.invoke(this));
				else if(var.getType() == Timestamp.class) //STUPID HACK FOR ANKUSH'S IDIOTIC TIMESTAMP HANDLING
				{
					//TODO: Fix this
					Map<String, Date> rightHereMap = new HashMap<String, Date>();
					rightHereMap.put("date", (Date)m.invoke(this));



					doc.append(var.getName(), m.invoke(this));

				}
				else 
				{
					System.out.println("Data type of field not supported: " + var.getType().getSimpleName() 
							+ " of " + this.getClass().getSimpleName() );
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

	/**
	 * Setter for _id
	 * @param _id the new value for atribute _id
	 */
	public void set_id(long _id) {
		this._id = _id;
	}

	/**
	 * Getter for _id
	 * @return the value of attribute _id
	 */
	public long get_id() {
		return _id;
	}

}
