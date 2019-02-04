# Root directory for Apache Tomcat webserver

## Running tomcat
1) edit starttomcat.sh: set CATALINA_HOME correctly for your system
2) run starttomcat.sh
(to stop it, execute "catalina.sh stop")


## Example session
1) open the url
http://localhost:8080/adininspector/websockclient2.html

2) In the "msg" text field enter a client request, e.g.:
{"cmd": "LOGIN_TOKEN", "id": 12}

3) click the "Echo" button
