package com.PSE.BackEnd;

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
        new MongoClientMediator("","","");
    }
    
    @Test
    public void testLoginBadCredentials() throws LoginFailureException {
        exception.expect(LoginFailureException.class);
        new MongoClientMediator("fake","McMoustache");
    }

    @Test
    public void testAddingNullRecord()
    {
        MongoClientMediator mcm = getMCM();

        //mcm.addRecordToCollection((Object)null, "");
    }

    public MongoClientMediator getMCM()
    {
        try {
            return new MongoClientMediator("admin", "admin", "AdinInspector");
        } catch (LoginFailureException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            return null;
        }
    }
}
