/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.records;

import java.util.Date;

/**
 * Helper class to represent a timestamp object as it is used in the raw data
 * format of the ADIN framework. In the raw data, they key "timestamp" maps to
 * an object {"$date", timestamp} and to handle data with MongoDB and bson we
 * need this corresponding class/object type.
 */
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
