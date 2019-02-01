package com.PSE.BackEnd;

import org.junit.*;
import org.junit.rules.ExpectedException;

import invalid.adininspector.MongoConsumer;
import invalid.adininspector.exceptions.LoginFailureException;

import static org.junit.Assert.*;
 
import java.util.*;

//TODO: test things!
public class MongoConsumerTests {

    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @Test
    public void testLoginEmptyDbName() throws LoginFailureException {
        exception.expect(LoginFailureException.class);
        new MongoConsumer("","","");
    }
    
    @Test
    public void testLoginBadCredentials() throws LoginFailureException {
        exception.expect(LoginFailureException.class);
        new MongoConsumer("fake","McMoustache","AdinInspector");
    }

}
