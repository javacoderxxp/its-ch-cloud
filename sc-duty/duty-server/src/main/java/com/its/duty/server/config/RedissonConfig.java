package com.its.duty.server.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**
 * @Author xiaxp
 * @Date 2019/10/8 18:00
 * @Description
 */
@Configuration
@ConditionalOnProperty(value = "spring.redis.open",havingValue = "true")
public class RedissonConfig {

}
