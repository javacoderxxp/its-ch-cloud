package com.its.parking.server.web;

import com.its.duty.common.api.DutyClient;
import com.its.parking.server.service.TestAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
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
@RefreshScope
public class TestController {

    @Autowired
    private DutyClient dutyClient;

    private TestAppService testAppService;
    @Value("${env:'undefined000'}")
    private String env;

    @GetMapping("/echo/{msg}")
    public String echo(@PathVariable(value = "msg") String msg){
        return dutyClient.echo(msg);
    }

    @GetMapping("/echo2/{msg}")
    public String echo2(@PathVariable(value = "msg") String msg){
        return "Hello echo2, "+ msg + ". From Env : "+ env;
    }
}
