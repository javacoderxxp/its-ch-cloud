package com.its.aa.server.web;

import com.its.aa.common.model.vo.UserVO;
import com.its.aa.server.service.LoginService;
import com.its.sc.common.model.vo.WebResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/aa")
public class AaControler {

    @Autowired
    private LoginService loginService;

    @PostMapping(value="/verifyToken")
    @ResponseBody
    public UserVO verifyToken(String token) throws Exception {
        UserVO user = loginService.verifyToken(token);
        return user;
    }
}
