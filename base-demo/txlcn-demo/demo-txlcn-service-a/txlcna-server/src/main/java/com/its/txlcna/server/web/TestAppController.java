package com.its.txlcna.server.web;


import com.its.txlcna.server.service.TestAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

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

    @RequestMapping("/txlcn")
    @ResponseBody
    public String execute(@RequestParam("value") String value, @RequestParam(value = "ex", required = false) String exFlag
            , @RequestParam(value = "f", required = false) String flag) {
        return testAppService.execute(value, exFlag, flag);
    }
}
