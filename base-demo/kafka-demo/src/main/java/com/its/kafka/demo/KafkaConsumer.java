package com.its.kafka.demo;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.KafkaListener;

import java.util.Optional;

/**
 * @Author xiaxp
 * @Date 2019/10/23 11:29
 * @Description
 */
@Configuration
@Slf4j
public class KafkaConsumer {

    @KafkaListener(id = "demoGroup", topics = TopicConstant.DEMO, concurrency = "2")
    public void listen(ConsumerRecord<?, ?> record){
        Optional<?> kafkaMessage = Optional.ofNullable(record.value());
        if(kafkaMessage.isPresent()){
            String msg = (String)kafkaMessage.get();
            log.info("Received: "+msg);
            Person person = JSON.parseObject(msg,Person.class);
            if (person.getName().startsWith("fail")) {
                throw new RuntimeException("failed");
            }
        }
    }

    @KafkaListener(id = "demoDltGroup", topics = TopicConstant.DEMO_DLT)
    public void dltListen(Person person){
        log.info("Received From DLT: "+person);
    }

    public static void main(String[] args) {
        Person person = new Person("aaaa",333);
        String msg = JSON.toJSONString(person);
        System.out.println(msg);
        Person p = JSON.parseObject(msg,Person.class);
        System.out.println(p);
    }
}
