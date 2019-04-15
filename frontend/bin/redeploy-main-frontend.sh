#!/bin/sh
cd /opt/tomcat/webapps/implementation/frontend 

#allow user to test local changes and skip the git pull:
if [ x$1 != "xn" ]
then
  git pull
fi
npm run build
mkdir -p /opt/tomcat/webapps/ROOT/main
mv dist/index.html /opt/tomcat/webapps/ROOT/main
cp -Rp dist/* /opt/tomcat/webapps/ROOT
chown -R tomcat:tomcat /opt/tomcat/webapps/ROOT/*

