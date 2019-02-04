/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.exceptions;

public class LoginFailureException extends Exception {

    private static final long serialVersionUID = 1L;

    public LoginFailureException(String errorMessage) {
        super(errorMessage);
    }

}