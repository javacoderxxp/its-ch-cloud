package com.its.txlcna.server;

import com.codingapi.txlcn.tc.config.EnableDistributedTransaction;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;

/**
 * @Author xiaxp
 * @Date 2019/7/2 15:51
 * @Description
 */

@SpringBootApplication
@EnableDiscoveryClient
@MapperScan("com.its.*.server.model.repo")
@EnableFeignClients(basePackages = "com.its.**.api")
@ComponentScan(basePackages = "com.its")
@ServletComponentScan
@EnableDistributedTransaction
public class ServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServerApplication.class, args);
    }

}
