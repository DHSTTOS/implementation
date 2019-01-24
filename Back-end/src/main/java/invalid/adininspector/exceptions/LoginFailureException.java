package invalid.adininspector.exceptions;

public class LoginFailureException extends Exception {

    private static final long serialVersionUID = 1L;

    public LoginFailureException(String errorMessage) {
        super(errorMessage);
    }

}