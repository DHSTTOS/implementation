#!/bin/sh
catalina.sh stop
# cp ../target/adininspector-backend-0.0.1-SNAPSHOT.jar webapps/adininspector/WEB-INF/lib/adininspector-backend-0.0.1-SNAPSHOT.jar
cp ../target/adininspector-backend-0.0.1-SNAPSHOT-jar-with-dependencies.jar webapps/adininspector/WEB-INF/lib/
./starttomcat.sh
