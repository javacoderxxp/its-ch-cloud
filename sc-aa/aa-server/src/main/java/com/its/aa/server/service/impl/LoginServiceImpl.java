package com.its.aa.server.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.its.aa.common.model.entity.*;
import com.its.aa.common.model.vo.UserVO;
import com.its.aa.server.model.repo.AaRoleRepo;
import com.its.aa.server.service.*;
import com.its.aa.server.util.JWTUtils;
import com.its.sc.common.util.MD5Util;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.*;

/**
 * <p>
 * 角色表 服务实现类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Service
@Slf4j
public class LoginServiceImpl extends ServiceImpl<AaRoleRepo, AaRole> implements LoginService {

    @Autowired
    private AaUserService aaUserService;

    @Override
    public boolean checkUsernameAndPwd(String username, String password) {
        List<AaUser> userList = aaUserService.getByUsername(username);
        if(null != userList && userList.size()>0 ){
            AaUser item  = userList.get(0);
            if(MD5Util.getMD5(password).equals(item.getPassword())) {
                return true;
            }
        }
        return false;
    }

    @Override
    public String getToken(@RequestParam("token")String username) {
        //存入JWT的payload中生成token
        Map claims = new HashMap<String, Integer>();
        claims.put("admin_username", username);
        String subject = "admin";
        String token = null;
        try {
            //该token过期时间为12h
            token = JWTUtils.createJWT(claims, subject, 1000 * 60 * 60 * 12);
        } catch (Exception e) {
            throw new RuntimeException("创建Token失败");
        }
        return token;
    }

    @Override
    public UserVO verifyToken(String token) throws Exception {
        Claims c = JWTUtils.parseJWT(token);
        if(null != c) {
            String sub = (String) c.get("sub");
            String username = (String) c.get("admin_username");
            //秒为单位
            Integer loginl = (Integer) c.get("iat");
            //秒为单位
            Integer expl = (Integer) c.get("exp");
            log.info("sub:"+ sub +"----- username :" + username + "-----login1:"+ loginl + "------expl:" + expl);

            if(expl < (System.currentTimeMillis()/1000)) {
                return null;
            }
            Map<String,String> userMap = new HashMap<>();
            UserVO user = new UserVO();
            user.setUsername(username);
            return user;
        }
        return null;
    }
}
