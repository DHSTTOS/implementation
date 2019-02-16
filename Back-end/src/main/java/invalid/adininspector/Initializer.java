
/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector;

import java.io.IOException;
import java.util.Properties;

import invalid.adininspector.exceptions.LoginFailureException;

//TODO: we need to handle the service init properly 
//TODO: wait for services to start and then start the consumer

/**
 * This class reads the config.properties file and starts the zookeper, kafa,
 * and MongoDB services.
 */
public class Initializer {
	// TODO: implement some argument parsing, probably here
	// diff between windows and linux is only the program that does execvp

	private static String installPath = "";

	/**
	 * App entry point.
	 * We load the config.properties file and use the path provided to start the zookeeper,
	 * kafka and mongodb services

	 * @param args - command line arguments
	 */
	public static void main(String[] args) {

		// TODO: fix me!
		// load the properties file


		String rootPath = "";//Thread.currentThread().getContextClassLoader().getResource("").getPath();
		// URL testPath = "";//Initializer.class.getClassLoader().getResource("");

		System.out.println(rootPath);
		//System.out.println(testPath);

		String appConfigPath = rootPath + "config.properties";

		Properties appProps = new Properties();

		// try {
		//     //appProps.load(new FileInputStream(appConfigPath));
		//     //installPath = appProps.getProperty("kafka_install_path");

		// } catch (IOException e) {
		//     e.printStackTrace();
		// }

		String[] cStartZookeeper = { "xterm", "-hold", "-e", "sudo " + installPath + "bin/zookeeper-server-start.sh "
				+ installPath + "config/zookeeper.properties" };

		String[] cStartKafka = { "xterm", "-hold", "-e",
				"sudo " + installPath + "bin/kafka-server-start.sh " + installPath + "config/server.properties" };

		String[] cStartMongo = { "xterm", "-hold", "-e", "service mongod start" };

		String[] cStopZookeeper = { "xterm", "-e", installPath + "bin/zookeeper-server-stop.sh" };
		String[] cStopKafka = { "xterm", "-e", installPath + "bin/kafka-server-stop.sh" };

		String[] cStopMongo = { "xterm", "-hold", "-e", "service mongod start" };

		System.out.println("Starting consumer");
		try {
			// MongoConsumer m = new MongoConsumer(appProps.getProperty("mongo_admin_user"),
			//         appProps.getProperty("mongo_admin_pass"), appProps.getProperty("mongo_database_name"));
			MongoConsumer m = new MongoConsumer("admin", "admin", "AdinInspector");


		} catch (LoginFailureException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		try {
			System.in.read();

			// TODO: route tcpdump for real-time
			// Process t = new ProcessBuilder("/bin/bash", "-c", "tcpdump").start();

			Process zookeper = new ProcessBuilder(cStartZookeeper).start();

			Process kafka = new ProcessBuilder(cStartKafka).start();

			new ProcessBuilder(cStartMongo).start();

			// TODO: a proper way to close the application
			//System.in.read();





			// this does not run in the editor cause app it's a kill -9 which sucks major
			// ass
			Runtime.getRuntime().addShutdownHook(new Thread(() -> {
				System.out.println("hook me up!");
				try {
					// stop Kafka and wait for it to stop
					new ProcessBuilder(cStopKafka).start();
					kafka.waitFor();

					new ProcessBuilder(cStopMongo).start();

					// stop zookeper
					new ProcessBuilder(cStopZookeeper).start();
					zookeper.waitFor();

				} catch (IOException e) {
					e.printStackTrace();
				} catch (InterruptedException e) {
					e.printStackTrace();
				}

			}));

			System.out.println("Application Terminating ...");
		} catch (Exception ex) {

			// TODO: I dunno, smthn?
			System.out.println(ex.toString());
		}
	}
}