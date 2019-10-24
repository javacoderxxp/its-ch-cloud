package com.its.txlcnc.common.api.fallback;


import com.its.txlcnc.common.api.ServiceCClient;

/**
 * @Author xiaxp
 * @Date 2019/10/11 15:51
 * @Description
 */
public class ServiceCFallback implements ServiceCClient {
    @Override
    public String rpc(String name) {
        return "服务器分了个神";
    }
}
