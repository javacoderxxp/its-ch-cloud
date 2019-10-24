package com.its.transaction;

import com.codingapi.txlcn.tm.config.EnableTransactionManagerServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @author xiaxp
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableTransactionManagerServer
public class TransactionManagerApplication {
    public static void main(String[] args) {
        SpringApplication.run(TransactionManagerApplication.class, args);
    }
}
