package com.its.txlcna.server.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author xiaxp
 * @Date 2019/7/2 15:51
 * @Description
 */

@RestController
@RequestMapping("/test")
public class TestController {

    @Value("${server.port}")
    private String port;

    @GetMapping("/echo/{msg}")
    public String echo(@PathVariable(value = "msg") String msg) throws InterruptedException {

        //模拟耗时
        Thread.sleep(10000);

        return "Hello Nacos, " + msg + " --- from port: " + port;
    }


}
