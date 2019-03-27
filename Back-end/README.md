# Backend

## Notes on dependencies and configuration files

In order to run this code there are 2 dependencies that need to met.

1. MongoDB 4.0.6

The Mongo service needs to be running and a user account with read/write for all collections and databases as well as a AdinInspector Database and an authentication database under an 'admin' database.

A [dump](https://docs.mongodb.com/manual/reference/program/mongodump/) containing all relevant databases and the provided test datasets can be found on the root directory of the implementation under dump/. To export it you can use the [mongorestore](https://docs.mongodb.com/manual/reference/program/mongorestore/#bin.mongorestore) utility 

2. Kafka 2.1.0 

Installation instructions for Kafka can be found [here](https://kafka.apache.org/quickstart)

The programm needs the Kafka server to be up and the Kafka server needs Zookeper to be started.

## Notes On how to build

To build the back-end, use maven with build goals "clean compile assembly:single".
This should produce the file target/adininspector-backend-0.0.1-SNAPSHOT-jar-with-dependencies.jar and bundle all necessary dependencies with it.

> For more details please refer to the [documents](https://github.com/DHSTTOS/documents) repository.

## Credits
[Mario Gonzalez](https://github.com/mgonzalez01) - Database Management storage, provision and communication with Kafka

[Philipp Mergenthaler](https://github.com/pm8008) - Client-Server Communication, Data Visualization


