package com.its.txlcnc.common.api;

import com.its.txlcnc.common.api.fallback.ServiceCFallback;
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
@FeignClient(name = "demo-txlcn-service-c", primary = false, qualifier = "serviceCClient", fallback = ServiceCFallback.class)
public interface ServiceCClient {
    @GetMapping("/testApp/rpc")
    String rpc(@RequestParam("value") String name);
}