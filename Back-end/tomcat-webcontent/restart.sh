#!/bin/sh
catalina.sh stop
cp ../target/adininspector-backend-0.0.1-SNAPSHOT.jar webapps/adininspector/WEB-INF/lib/adininspector-backend-0.0.1-SNAPSHOT.jar
./starttomcat.sh
