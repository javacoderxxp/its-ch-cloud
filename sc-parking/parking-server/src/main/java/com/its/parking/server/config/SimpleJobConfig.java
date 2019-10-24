package com.its.parking.server.config;

import com.dangdang.ddframe.job.api.simple.SimpleJob;
import com.dangdang.ddframe.job.config.JobCoreConfiguration;
import com.dangdang.ddframe.job.config.simple.SimpleJobConfiguration;
import com.dangdang.ddframe.job.lite.api.JobScheduler;
import com.dangdang.ddframe.job.lite.config.LiteJobConfiguration;
import com.dangdang.ddframe.job.lite.spring.api.SpringJobScheduler;
import com.dangdang.ddframe.job.reg.zookeeper.ZookeeperRegistryCenter;
import com.its.parking.server.job.MySimpleJob;
import org.springframework.beans.factory.annotation.Autowired;
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
public class SimpleJobConfig {

    @Autowired
    private ZookeeperRegistryCenter regCenter;

    @Autowired
    private MySimpleJob mySimpleJob;

    @Bean(initMethod = "init")
    public JobScheduler mySimpleJobScheduler(final SimpleJob mySimpleJob,
                                             @Value("${simpleJob.cron}") final String cron,
                                             @Value("${simpleJob.shardingTotalCount}") final int shardingTotalCount,
                                             @Value("${simpleJob.shardingItemParameters}") final String shardingItemParameters) {
        return new SpringJobScheduler(mySimpleJob, regCenter,
                getLiteJobConfiguration(mySimpleJob.getClass(), cron, shardingTotalCount, shardingItemParameters)
        );
    }

    private LiteJobConfiguration getLiteJobConfiguration(final Class<? extends SimpleJob> jobClass, final String cron, final int shardingTotalCount, final String shardingItemParameters) {
        return LiteJobConfiguration.newBuilder(new SimpleJobConfiguration(JobCoreConfiguration.newBuilder(
                jobClass.getName(), cron, shardingTotalCount).shardingItemParameters(shardingItemParameters).build(), jobClass.getCanonicalName())).overwrite(true).build();
    }
}
