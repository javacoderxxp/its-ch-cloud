package com.its.duty.server.config;

import com.dangdang.ddframe.job.reg.zookeeper.ZookeeperConfiguration;
import com.dangdang.ddframe.job.reg.zookeeper.ZookeeperRegistryCenter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @Author xiaxp
 * @Date 2019/7/2 15:51
 * @Description
 */
@Configuration
@ConditionalOnExpression("'${regCenter.serverList}'.length() > 0")
public class RegistryCenterConfig {

    @Bean
    public ZookeeperRegistryCenter regCenter(@Value("${regCenter.serverList}")String serverList,
                                             @Value("${regCenter.namespace}")String namespace,
                                             @Value("${regCenter.sessionTimeoutMilliseconds}")int sessionTimeoutMilliseconds) {
        ZookeeperConfiguration zookper = new ZookeeperConfiguration(serverList, namespace);
        zookper.setSessionTimeoutMilliseconds(sessionTimeoutMilliseconds);
        ZookeeperRegistryCenter regCenter = new ZookeeperRegistryCenter(zookper);
        regCenter.init();
        return regCenter;
    }

    public static void main(String[] args) {
        ZookeeperRegistryCenter regCenter = new ZookeeperRegistryCenter(new ZookeeperConfiguration("localhost:2181", "elastic-job-demo"));
        regCenter.init();
    }

}
