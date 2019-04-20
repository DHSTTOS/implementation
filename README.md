  <a href="https://adin-frontend.netlify.com">
    <img alt="Logo" src="https://adin-frontend.netlify.com/logo.svg" width="80"
 />
  </a>
</p>

<h1 align="center">
  Drawing How Stuff Talk To Other Stuff
</h1>

DHSTTOS (Drawing How Stuff Talks To Other Stuff) project is part of the ADIN (Anomaly Detection in Industrial Networks) suite.

DHSTTOS mainly consists of 2 sub-projects: the [frontend](frontend) and [backend](Back-end). 

A walkthrough screencast of the frontend can be found [here](https://youtu.be/Vt3kImBWPbI).

## Deployment/Installation 

### Tested software environment
(With front-end and back-end on the same server)
Ubuntu 18.04.1 LTS

```
default-jdk 2:1.10-63ubuntu1\~02 amd64  
default-jdk-headless 2:1.10-63ubuntu1\~02 amd64  
openjdk-11-jdk:amd64 10.0.2+13-1ubuntu0.18.04.4 amd64  
openjdk-11-jdk-headless:amd64     10.0.2+13-1ubuntu0.18.04.4 amd64  
openjdk-11-jre:amd64 10.0.2+13-1ubuntu0.18.04.4 amd64  
openjdk-11-jre-headless:amd64 10.0.2+13-1ubuntu0.18.04.4 amd64  
  
kafka_2.12-2.1.0   
zookeeper 3.4.10-3--1  
  
mongodb-org 4.0.5 amd64  
mongodb-org-mongos 4.0.5 amd64  
mongodb-org-server 4.0.5 amd64  
mongodb-org-shell 4.0.5 amd64  
mongodb-org-tools 4.0.5 amd64  
  
tomcat 8

nodejs 10.15.0
```
  
### Alternative software environment

(With frontend and back-end on the same server)  

- FreeBSD 13.0-CURRENT  
- openjdk8-8.192.26  
- kafka-2.1.0  
- zookeeper-3.4.12  
- mongodb36-3.6.6_2  
- tomcat9-9.0.13  

You will also need [node.js 10+ (with npm 6+)](https://nodejs.org/en/) to build the frontend modules. Consider using [nvm](https://github.com/creationix/nvm) to manage multiple node installations on your system.


### Configuration of the webserver
The following setup uses one webserver for both the frontend (the website that the user accesses) and the back-end (the database accessed from the frontend javascript program).

#### Backend dependencies

##### 1. `MongoDB  <= 4.0.6`

The Mongo service needs to be running and a user account with read/write for all collections and databases as well as a AdinInspector Database and an authentication database under an 'admin' database.

A [dump](https://docs.mongodb.com/manual/reference/program/mongodump/) containing all relevant databases and the provided test datasets can be found on this directory under dump/.

To export it you can use the [mongorestore](https://docs.mongodb.com/manual/reference/program/mongorestore/#bin.mongorestore) utility.

Make sure that the mongo service is running, if not run `sudo service mongod start`

i.e. `run mongorestore -u "ADMINUSER" -p "PASS"` on the same directory as the dump/ directory.

##### 2. Kafka 2.1.0

Installation instructions for Kafka can be found [here](https://kafka.apache.org/quickstart)

The programm needs the Kafka server to be up and the Kafka server needs Zookeper to be started.

Navigate to the kafka installation directory.

**start zookeper** : 

  `sudo bin/zookeeper-server-start.sh config/zookeeper.properties`

**start Kafka** : 

  `sudo bin/kafka-server-start.sh config/server.properties`

##### 3. Apache Tomcat server

**Installing Tomcat**:
  
see e.g.

 https://www.digitalocean.com/community/tutorials/install-tomcat-9-ubuntu-1804

**Configuring Tomcat**:
  
This may vary depending on the specific underlying OS.
On digital ocean's droplet hooking tomcat up to the systemd demon resulted in the server aborting and restarting in a loop.
Starting tomcat manually instead works.


Change to the tomcat base directory (when following the tutorial above from digitalocean, this will be `/opt/tomcat`).

```bash
cd conf
# edit the file catalina.properties to append the following line:
java.security.egd=file:/dev/./urandom
```

Copy the file `Back-end/tomcat-conf/server.xml`
to `/opt/tomcat/conf/server.xml`

This file is set up to make use of a certificate in `/etc/letsencrypt/` to enable https connections, i.e. SSL encryption.
Tomcat will still run without such a certificate, but only `http://` connections will be available.

You can get a certificate from e.g. [Let's Encrypt](https://letsencrypt.org/getting-started/).



#### Building the .jar file (the servlet) from the java source

Fetch the repository, then run the following commands:

```bash
cd implementation/Back-end
mvn clean compile assembly:single
```

This will produce the file `target/adininspector-backend-0.0.1-SNAPSHOT-jar-with-dependencies.jar` and bundle all necessary dependencies with it.



#### Installing the webapps/adininspector content

**step 1**

- copy `adininspector-backend-0.0.1-SNAPSHOT-jar-with-dependencies.jar`
  from `implementation/Back-end/target/`
  to `/opt/tomcat/webapps/adininspector/WEB-INF/lib/`

- optional, for testing: copy `websockclient2.html` to `webapps/adininspector/`
  (this is a tool for low-level testing of the websocket connection to the server and the database access)

**step 2**

- use git to check out
   https://github.com/DHSTTOS/implementation/
into `/opt/tomcat/webapps/implementation`
Make sure the following two directories exist now:

```
/opt/tomcat/webapps/implementation/frontend
/opt/tomcat/webapps/implementation/login-frontend
```

**step 3**

Adjust the following two files to use the correct address for your host:
in `frontend/src/stores/user.js`
the line

```js
wsEndpointURL =
  'wss://adininspector.currno.de/adininspector/adinhubsoc2';
```

and in `login-frontend/src/components/UserForm.js`
the line

```js
placeholder="wss://adininspector.currno.de/adininspector/adinhubsoc2"
```

(the path `'/adininspector/adinhubsoc2'` should stay unchanged.)

If you are using the http protocol (i.e. if you haven't set up a ssl certificate) you also have to replace `wss:` with `ws:` in those two lines.

**step 4**

now, as root, run these two scripts:

```
frontend/bin/redeploy-login.sh
frontend/bin/redeploy-main-frontend.sh
```

to build and bundle the javascript source code.

#### Starting the Apache Tomcat server

If tomcat only uses ports > 1024 (e.g. 8080) you can run it as user tomcat:

```bash
sudo -u tomcat bash
cd /opt/tomcat
./bin/catalina.sh start
```

otherwise (when using the default http and https ports) run it as root:

```bash
sudo bash
cd /opt/tomcat
./bin/catalina.sh start
```

To check if it started successfully, check the main log file, `./logs/catalina.out` , for a line like this:  
```
18-Feb-2019 19:50:36.430 INFO [main] org.apache.catalina.startup.Catalina.start Server startup in [81,226] milliseconds
```

to stop the tomcat server:

```bash
./bin/catalina.sh stop
```

#### Frontend dependencies / development

0. `cd` into frontend sub directory
1. Install dependencies with `npm i` (please don't use `yarn`)
1. Run `npm run build` to create an optimized production build or run `npm start` to spin up a local dev server. In which case http://localhost allows you to connecto to an unencryptes WebScocket endpoint.

Because we allow the user to enter their own WebSocket endpoint of DHSTTOS back
end, this web application can be hosted anywhere. One thing to notice is that f
or most browsers, if the user loads this app from a server which enforces HTTPS
 (eg. vanilla Netlify), they won't be able to connect to an unencrypted WebSock
et endpoint via `ws://` protocol, so `wss://` is required.

### Firewall

If a firewall is installed, open the following ports for incoming connections:
80 and 443 (for http and https)

Although we recommend against SSH'ing into the server to make changes to the frontend remotely, if you want access the frontend dev servers on the remote server, you will also need to open port `1234` and `3000`.

Optionally, for the development environment, also open:
8080 and 8433 (for http and https)


## Notes On How To Contribute to the frontend

This Frontend uses [React](https://reactjs.org/tutorial/tutorial.html) for all the UI elements, [MobX](https://mobx.js.org/getting-started.html) for state management, [D3v5](https://d3js.org/#introduction), D3v2 (only for the node-link diagram) and [Nivo](https://nivo.rocks/) for rendering the diagrams.

All the diagram components are placed inside [`/src/components/Diagram`](src/components/Diagram) directory.

Before creating a PR, please run `npm run format` to do an autoformat, so that we can keep the code style consistent throughout the project.

The [`/src/libs`](src/libs) should contain _ONLY_ static helper functions or classes. Do _not_ invoke any methods or functions on the root level of any files there, as it might create a dependency loop/deadlock situation. (Due to the scripting nature of JS, you can imagine everything is wrapped inside an invisible `main()` function. The engine executes every single line when it runs through the source code.)

State management is handled with MobX in a observer/reactive manner. Access and mutate the state anywhere inside the project via simply referencing the corresponding class attributes inside [`/stores`](src/stores) or reassigning values to them.

Most of the development of the node-link diagram was happening inside [`../misc/network_demo`](https://github.com/DHSTTOS/implementation/tree/master/misc/network_demo), but we have already migrated everything there into [`/src/components/Diagram/NodeLinkBlock.js`](src/components/Diagram/NodeLinkBlock.js).

If you have access to our server, log in as root (I know 😅) and run `boom` to rebuild and redeploy both the login page and this app based on the latest master branch, in order to test the complete frontend suite.

## License

The source code of the Frontend is licensed under [BSD 4-Clause "Original" license](LICENSE).

For other modules of the DHSTTOS platform (eg. the backend server code), please refer to the respective license documents in their own subdirectories.
## Credits

[Klevia Ulqinaku](https://github.com/klevia) - Login Page UI, Data Visualization

[Philipp Mergenthaler](https://github.com/pm8008) - Client-Server Communication, Data Visualization

[Xiaoru Li](https://github.com/hexrcs) - Original UI design, Main Page UI, Data Visualization, Client-Server Communication, Project Logo Design

[Mario Gonzalez](https://github.com/mgonzalez01) - Database Management storage, provision and communication with Kafka

[Philipp Mergenthaler](https://github.com/pm8008) - Client-Server Communication, Data Visualization


