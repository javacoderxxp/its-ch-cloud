package com.its.gateway.filter;

import com.alibaba.fastjson.JSONObject;
import com.its.aa.common.api.AaClient;
import com.its.aa.common.model.vo.UserVO;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
@ConditionalOnExpression("'${aa.active}' == true")
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Autowired
    public AaClient aaClient;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();
        String token = request.getHeaders().getFirst("authToken");
        if(!StringUtils.isEmpty(token)) {
            try {
                UserVO user = aaClient.verifyToken(token);
                if(null==user && StringUtils.isBlank(user.getUsername())){
                    JSONObject message = new JSONObject();
                    message.put("statusCode", -1);
                    message.put("msg", "请重新登录");
                    byte[] bits = message.toJSONString().getBytes(StandardCharsets.UTF_8);
                    DataBuffer buffer = response.bufferFactory().wrap(bits);
                    response.setStatusCode(HttpStatus.UNAUTHORIZED);
                    //指定编码，否则在浏览器中会中文乱码
                    response.getHeaders().add("Content-Type", "text/plain;charset=UTF-8");
                    return response.writeWith(Mono.just(buffer));
                } else {
                    response.getHeaders().set("username", user.getUsername());
                    return chain.filter(exchange);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        //String token = getLoginUserId(exchange);
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
