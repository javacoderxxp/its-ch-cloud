package com.its.txlcnb.common.api.fallback;

import com.its.txlcnb.common.api.ServiceBClient;

/**
 * @Author xiaxp
 * @Date 2019/10/11 15:51
 * @Description
 */
public class ServiceBFallback implements ServiceBClient {
    @Override
    public String rpc(String name) {
        return "服务器分了个神";
    }
}
