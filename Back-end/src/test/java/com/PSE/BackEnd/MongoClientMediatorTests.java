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

import static org.junit.Assert.*;

import java.util.*;

//TODO: test things!
public class MongoClientMediatorTests {

    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @Test
    public void testLoginEmptyDbName() throws LoginFailureException {
        exception.expect(LoginFailureException.class);
        new MongoClientMediator("", "", "");
    }

    @Test
    public void testLoginBadCredentials() throws LoginFailureException {
        exception.expect(LoginFailureException.class);
        new MongoClientMediator("fake", "McMoustache");
    }

    @Test
    public void testAddingNullRecord() {
        MongoClientMediator mcm = getMCM();

        mcm.addRecordToCollection(((Document) null), "dasdsa");
    }

    @Test
    public void testGettingUnexistentCollection()
    {
        String[] o = getMCM().getCollection("fsdafsafsadfdsafsda");

        
        assertTrue("is zero", o.length == 0);
    }

    @Test
    public void testGetCollectionToStringArrayUnexistent() {
        ArrayList<Record> o =   getMCM().getCollectionAsRecordsArrayList("fjdshlkjfhlkf");

        assertTrue("is zero", o.size() == 0);

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
