#!/bin/sh
/opt/tomcat/bin/catalina.sh stop
cp ~p/adininspector-backend-0.0.1-SNAPSHOT-jar-with-dependencies.jar /opt/tomcat/webapps/adininspector/WEB-INF/lib/
chown -R tomcat:tomcat /opt/tomcat/webapps/adininspector/WEB-INF/lib/
sudo -u tomcat /opt/tomcat/starttomcat.sh
