package com.its.duty.server.web;

import com.its.sc.common.model.vo.WebResult;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.concurrent.TimeUnit;

/**
 * @Author xiaxp
 * @Date 2019/10/8 17:26
 * @Description
 */
@Slf4j
@RestController
@RequestMapping("redisson/bucket")
public class RedisTestController {
    @Resource
    private RedissonClient redissonClient;

    @GetMapping("get/{key}")
    public WebResult get(@PathVariable String key) {
        RBucket<String> bucket = redissonClient.getBucket(key);
        String value = bucket.get();
        long keyCount = redissonClient.getKeys().count();
        return WebResult.success("success").put("keyCount", keyCount).put("value", value);
    }

    @GetMapping("set/{key}/{value}")
    public WebResult put(@PathVariable String key, @PathVariable String value) {
        redissonClient.getBucket(key).set(value, 120, TimeUnit.SECONDS);
        long keyCount = redissonClient.getKeys().count();
        return WebResult.success().put("keyCount", keyCount);
    }

    @GetMapping("lockset/{key}/{value}")
    public WebResult lockset(@PathVariable String key, @PathVariable String value) {
        RLock lock = redissonClient.getLock("anyLock");
        boolean res = false;
        try {
            // 尝试加锁，最多等待30秒，上锁以后10秒自动解锁
            res = lock.tryLock(5, 10, TimeUnit.SECONDS);
            if (res) {
                redissonClient.getBucket(key).set(value, 120, TimeUnit.SECONDS);
                Thread.sleep(8000);
                return WebResult.success("it is ok");
            }
        } catch (InterruptedException e) {
            log.error(e.getMessage());
            return WebResult.error("it is lock now, key: " + key + ", value: " + value);
        } finally {
            if (res) {
                lock.unlockAsync();
            }
        }
        return WebResult.error("it is lock now");
    }
}
