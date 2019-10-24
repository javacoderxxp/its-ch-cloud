package com.its.kafka.demo;

import org.apache.kafka.common.protocol.types.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * @Author xiaxp
 * @Date 2019/10/23 11:45
 * @Description
 */
@Component
public class KafkaProducer {
    @Autowired
    private KafkaTemplate kafkaTemplate;

    public void send(String topic, String msg){
        kafkaTemplate.send(topic,msg);
    }
}
