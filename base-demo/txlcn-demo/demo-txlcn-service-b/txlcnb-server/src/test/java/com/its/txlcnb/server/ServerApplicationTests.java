package com.its.txlcnb.server;

import com.its.sc.common.util.CodeGenerater;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class ServerApplicationTests {

    @Test
    public void contextLoads() {
    }

    @Test
    public void test5() {
        CodeGenerater.generate(
                "jdbc:mysql://localhost:3306/wxdc?serverTimeZone=Asia/Shanghai&useUnicode=true&useSSL=false&characterEncoding=utf8&nullCatalogMeansCurrent=true",
                "com.mysql.cj.jdbc.Driver", "admin", "123456",
                "xiaxp",
                "com.its.txlcnb",
                "t_", "t_test_app");
    }
}
