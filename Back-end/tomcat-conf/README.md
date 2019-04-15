### Configuration files for tomcat.
Most of these files are unchanged from the default, except the following:

### catalina.properties
Add the line
   java.security.egd=file:/dev/./urandom

This is needed because tomcat gathers entropy for encryption on startup.



### server.xml
If you want to run tomcat on the default http and https ports (80 and 443, respectively), use the file server.xml.

If you want to run tomcat on the ports 8080 and 8443, respectively), use the file server.xml-8443 and rename it to server.xml

