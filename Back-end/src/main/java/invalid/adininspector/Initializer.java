package invalid.adininspector.backend;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.util.Properties;
//TODO: we need to handle the service init properly 
//TODO: wait for services to start and then start the consumer
public class Initializer {
    // TODO: implement some argument parsing, probably here
    // diff between windows and linux is only the program that does execvp

    private static String installPath = "";

    public static void main(String[] args) {

        // TODO: use first arg ,the install path

        // load the properties file
        String rootPath = Thread.currentThread().getContextClassLoader().getResource("").getPath();
        URL testPath = Initializer.class.getClassLoader().getResource("");// ClassLoader.getSystemClassLoader().getResource(name)
        System.out.println(rootPath);
        System.out.println(testPath);

        String appConfigPath = rootPath + "config.properties";

        Properties appProps = new Properties();

        try {
            appProps.load(new FileInputStream(appConfigPath));
            installPath = appProps.getProperty("kafka_install_path");

        } catch (IOException e) {
            e.printStackTrace();
        }

        String[] cStartZookeeper = { "xterm", "-hold", "-e", "sudo " + installPath + "bin/zookeeper-server-start.sh "
                + installPath + "config/zookeeper.properties" };

        String[] cStartKafka = { "xterm", "-hold", "-e",
                "sudo " + installPath + "bin/kafka-server-start.sh " + installPath + "config/server.properties" };

        String[] cStartMongo = { "xterm", "-hold", "-e", "service mongod start" };

        String[] cStopZookeeper = { "xterm", "-e", installPath + "bin/zookeeper-server-stop.sh" };
        String[] cStopKafka = { "xterm", "-e", installPath + "bin/kafka-server-stop.sh" };

        String[] cStopMongo = { "xterm", "-hold", "-e", "service mongod start" };

        System.out.println("Starting consumer");
            MongoConsumer m = new MongoConsumer(appProps.getProperty("mongo_admin_user"),
            appProps.getProperty("mongo_admin_pass"),
            appProps.getProperty("mongo_database_name") );
        
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