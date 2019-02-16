/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.records;

import java.util.Map;

/**
 * Inheriting from Record, this class is used by the data processor as an
 * 'in-between' state before saving to the database. As well as an extension point
 * for adding more types of records into the database programatically in the future.
 * Refer to the data processor class for further data on the key value pairs.
 */
public class MiscRecord extends Record{
	private Map<String, Object> properties;

	/**
	 * @return the properties
	 */
	public Map<String, Object> getProperties() {
		return properties;
	}

	/**
	 * @param properties the properties to set
	 */
	public void setProperties(Map<String, Object> properties) {
		this.properties = properties;
	}
}