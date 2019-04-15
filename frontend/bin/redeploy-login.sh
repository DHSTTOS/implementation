#!/bin/sh
cd /opt/tomcat/webapps/implementation/login-frontend 

#allow user to test local changes and skip the git pull:
if [ x$1 != "xn" ]
then
  git pull
fi

npm run build
mkdir -p /opt/tomcat/webapps/ROOT/
cp -Rp dist/* /opt/tomcat/webapps/ROOT/
chown -R tomcat:tomcat /opt/tomcat/webapps/ROOT/*

