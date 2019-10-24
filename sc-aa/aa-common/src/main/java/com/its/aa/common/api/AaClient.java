package com.its.aa.common.api;

import com.its.aa.common.api.fallback.AaClientFallback;
import com.its.aa.common.model.vo.UserVO;
import com.its.sc.common.model.vo.WebResult;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Primary;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @Author xiaxp
 * @Date 2019/7/2 18:04
 * @Description
 */
@Primary
@FeignClient(name = "aa",primary = false, qualifier = "aaClient",fallback=AaClientFallback.class)
public interface AaClient {
    /** 测试
     * @param token
     * @return
     */
    @PostMapping("/aa/verifyToken")
    public UserVO verifyToken(@RequestParam("token")String token) throws Exception;

    @PostMapping("/login")
    public WebResult login( @RequestParam("password") String password,
                            @RequestParam("username") String username);
}
