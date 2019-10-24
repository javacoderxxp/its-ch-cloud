package com.its.aa.common.api.fallback;

import com.its.aa.common.api.AaClient;
import com.its.aa.common.model.vo.UserVO;
import com.its.sc.common.model.vo.WebResult;
import org.springframework.stereotype.Component;

/**
 * @Author xiaxp
 * @Date 2019/7/2 18:05
 * @Description
 */
@Component(value = "aaClientFallback")
public class AaClientFallback implements AaClient {

    @Override
    public UserVO verifyToken(String token) throws Exception {
        return null;
    }

    @Override
    public WebResult login(String password, String username) {
        return WebResult.error();
    }
}
