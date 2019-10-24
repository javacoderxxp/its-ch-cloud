package com.its.duty.common.api.fallback;

import com.its.duty.common.api.DutyClient;
import org.springframework.stereotype.Component;

/**
 * @Author xiaxp
 * @Date 2019/7/2 18:05
 * @Description
 */
@Component(value = "dutyClientFallback")
public class DutyClientFallback implements DutyClient {
    @Override
    public String echo(String msg) {
        return "服务器分了个神";
    }
}
