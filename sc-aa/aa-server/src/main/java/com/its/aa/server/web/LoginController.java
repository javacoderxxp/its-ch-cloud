package com.its.aa.server.web;


import com.its.aa.server.service.LoginService;
import com.its.sc.common.model.vo.WebResult;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * <p>
 * 测试表 前端控制器
 * </p>
 *
 * @author xiaxp
 * @since 2019-08-01
 */
@Controller
public class LoginController {

    @Autowired
    private LoginService loginService;

    @PostMapping(value = "/login")
    @ResponseBody
    public WebResult login(
            @RequestParam("password") String password,
            @RequestParam("username") String username
    ) throws Exception {
        boolean isRight = loginService.checkUsernameAndPwd(username, password);
        if (isRight) {
            //获取新token，过期时间为12h
            String token = loginService.getToken(username);
            //OnlineCount.getInstance().insertToken(token);

            Map map = new HashMap<String, Integer>();
            map.put("username", username);
            map.put("token", token);
            return WebResult.success().put("map",map);
        }
        return WebResult.error("用户名或密码错误，请重新输入");
    }

    @RequestMapping(value = "admin")
    public String list() {
        return "sys-default";
    }

    @GetMapping(value = "/onlineSessionPage")
    public String onlineSessionPage() {
        return "sessionList";
    }

   /* @PostMapping(value="/verifyToken")
    @ResponseBody
    public boolean verifyToken(String token) throws Exception {
        return loginService.verifyToken(token);

    }*/
}
