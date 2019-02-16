/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.exceptions;

/**
 * Exceptions of this class are thrown by MongoClientMediator and
 * MongoClientConsumer when login into the mongo database was not possible;
 * usually due to invalid username or password.
 */
public class LoginFailureException extends Exception {

	private static final long serialVersionUID = 1L;

	/**
	 * Constructs an instance of LoginFailureException with the specified detail message.
	 * @param errorMessage - the detailed error message
	 */
	public LoginFailureException(String errorMessage) {
		super(errorMessage);
	}
}
