package com.its.txlcnb.common.api;

import com.its.txlcnb.common.api.fallback.ServiceBFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Primary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * @Author xiaxp
 * @Date 2019/10/11 15:50
 * @Description
 */
@Primary
@FeignClient(name = "demo-txlcn-service-b", primary = false, qualifier = "serviceBClient", fallback = ServiceBFallback.class)
public interface ServiceBClient {
    @GetMapping("/testApp/rpc")
    String rpc(@RequestParam("value") String name);
}