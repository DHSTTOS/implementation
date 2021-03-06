/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package com.PSE.BackEnd;

import invalid.adininspector.records.*;
import org.bson.Document;
import org.junit.*;
import org.junit.rules.ExpectedException;

import invalid.adininspector.MongoClientMediator;
import invalid.adininspector.exceptions.LoginFailureException;
import invalid.adininspector.dataprocessing.*;

import static org.junit.Assert.*;

import java.util.*;

//TODO: test things!
@Ignore // needs a database to connect to
public class DataProcessorTest {


    @Test
    //basically if nothing breaks. we good.
    public void testProcessingUnexistingCollection()
    {
        DataProcessor.processData("notExsist", getMCM());

        assertTrue( "we did not add anythingcollection",getMCM().getCollection("notExsists").length == 0 );

    }

    public MongoClientMediator getMCM() {
        try {
            return new MongoClientMediator("admin", "admin", "AdinInspector");
        } catch (LoginFailureException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            return null;
        }
    }
}