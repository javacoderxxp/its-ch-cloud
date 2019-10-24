package com.its.kafka.demo;

import com.alibaba.fastjson.JSON;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

@SpringBootApplication
public class KafkaDemoApplication {


    public static void main(String[] args) {
        SpringApplication.run(KafkaDemoApplication.class, args);
    }


    @Component
    class StartPingService implements CommandLineRunner {
        public AtomicInteger count = new AtomicInteger(0);
        @Autowired
        private KafkaProducer kafkaProducer;

        @Override
        public void run(String... args) throws Exception {
            produceMsg();
        }

        private void produceMsg() throws InterruptedException {
            while(count.getAndIncrement() < 100000){
                if(count.get() % 100 == 0){
                    kafkaProducer.send(TopicConstant.DEMO, JSON.toJSONString(new Person("fail"+count.get(),count.get()/100000 *100)));
                }else{
                    kafkaProducer.send(TopicConstant.DEMO, JSON.toJSONString(new Person("abc"+count.get(),count.get()/100000 *100)));
                }
                Thread.sleep(ThreadLocalRandom.current().nextInt(100));
            }
        }
    }
}
