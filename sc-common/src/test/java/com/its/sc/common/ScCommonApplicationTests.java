package com.its.sc.common;

import com.its.sc.common.util.CodeGenerater;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class ScCommonApplicationTests {

    @Test
    public void contextLoads() {

    }
    @Test
    public void test4(){
        CodeGenerater.generate(
                "jdbc:oracle:thin:@192.168.1.4:1521:orcl",
                "oracle.jdbc.OracleDriver","itssip","itssip",
                "xiaxp",
                "com.its.parking",
                "T_", "T_QW_GPS","T_QW_PUNISH");
    }

    @Test
    public void test5(){
        CodeGenerater.generate(
                "jdbc:mysql://localhost:3306/wxdc?serverTimeZone=Asia/Shanghai&useUnicode=true&useSSL=false&characterEncoding=utf8&nullCatalogMeansCurrent=true",
                "com.mysql.cj.jdbc.Driver","itssip","itssip",
                "xiaxp",
                "com.its.parking",
                "T_", "T_QW_GPS","T_QW_PUNISH");
    }
}
