package com.its.txlcnb.server.web;


import com.its.txlcnb.server.service.TestAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;

/**
 * <p>
 * 测试表 前端控制器
 * </p>
 *
 * @author xiaxp
 * @since 2019-10-11
 */
@Controller
@RequestMapping("/testApp")
public class TestAppController {

    @Autowired
    private TestAppService testAppService;

    @GetMapping("/rpc")
    @ResponseBody
    public String rpc(@RequestParam("value") String value, HttpServletRequest servletRequest) {
        return testAppService.rpc(value);
    }
}
