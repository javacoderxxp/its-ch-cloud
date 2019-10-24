package com.its.duty.common.api;

import com.its.duty.common.api.fallback.DutyClientFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Primary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * @Author xiaxp
 * @Date 2019/7/2 18:04
 * @Description
 */
@Primary
@FeignClient(name = "duty",primary = false, qualifier = "dutyClient", fallback = DutyClientFallback.class)
public interface DutyClient {
    /** 测试
     * @param msg
     * @return
     */
    @GetMapping("/test/echo/{msg}")
    public String echo(@PathVariable(value = "msg") String msg);
}
