package com.its.kafka.demo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

/**
 * @Author xiaxp
 * @Date 2019/10/23 11:29
 * @Description
 */
@Data
@ToString
@AllArgsConstructor
public class Person {
    private String name;
    private int age;
}
