/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.dataprocessing;

import java.util.ArrayList;
import java.util.Date;

import org.bson.Document;

import invalid.adininspector.records.Record;

public interface IAggregator {

    public ArrayList<Document> processData( ArrayList<Record> records);

    public Document getNewAggregatorDocument(Date tstmp);
}
