/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.dataprocessing;

import java.util.ArrayList;
import java.util.Date;

import org.bson.Document;

import invalid.adininspector.records.Record;

/**
 * This interface is the building block for every aggregator to be applied to data.
 *
 * Its main method processes a list of records and produces a (usually much shorter)
 * list of bson Documents with aggregated data.
 */
public interface IAggregator {

    /**
     * This method takes a list of records (usually representing one data point,
     * i.e. one network packet each) and produces a list of bson Documents with
     * aggregated data.
     * Specific implementation left to the classes implementing this interface.
     * 
     * @param records - the records to be processed
     * @return aggregated data as bson Document
     */
    public ArrayList<Document> processData( ArrayList<Record> records);

    /**
     * A helper routine that creates a new bson Document with default key-value pairs set.
     * @param tstmp - the timestamp for this document
     * @return a new bson Document 
     */
    public Document getNewAggregatorDocument(Date tstmp);
}
