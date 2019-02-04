#!/bin/sh
# The path to tomcat's installation directory. This directory should contain a subdirectory bin and a management script called bin/catalina.sh :
export CATALINA_HOME=/usr/local/apache-tomcat-9.0

# The base directory for a tomcat instance with both configuration files for tomcat and the webapps directory with the actual content:
#export CATALINA_BASE=/home/p/pse/implementation-e/Back-end/tomcat-webcontent
export CATALINA_BASE=$PWD

export JAVA_HOME=/usr/local/openjdk8
export PATH=$PATH:$CATALINA_HOME/bin

# tomcat needs these directories; create them since git ignores empty dirs:
mkdir logs
mkdir temp
mkdir work

catalina.sh start
