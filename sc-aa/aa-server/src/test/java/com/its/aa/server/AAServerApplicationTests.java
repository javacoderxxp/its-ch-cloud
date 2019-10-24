package com.its.aa.server;

import com.its.aa.server.AAServerApplication;
import com.its.aa.server.service.AaUserService;
import com.its.sc.common.util.CodeGenerater;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = AAServerApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AAServerApplicationTests {
    @Autowired
    private AaUserService aaUserService;
    /*@Test
    public void contextLoads() {
    }
*/
    @Test
    public void test5(){
        CodeGenerater.generate(
                "jdbc:mysql://localhost:3306/lukou?serverTimeZone=Asia/Shanghai&useUnicode=true&useSSL=false&characterEncoding=utf8&nullCatalogMeansCurrent=true",
                "com.mysql.cj.jdbc.Driver","root","",
                "guzf",
                "com.its.aa",
                "T_", "t_aa_menu");
    }

    @Test
    public void test6(){
        aaUserService.getByUsername("ahq");
    }
}