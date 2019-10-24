package com.its.parking.server.job;

import com.dangdang.ddframe.job.api.ShardingContext;
import com.dangdang.ddframe.job.api.simple.SimpleJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @Author xiaxp
 * @Date 2019/7/2 17:31
 * @Description
 */
@Slf4j
@Component
public class MySimpleJob implements SimpleJob {
    @Override
    public void execute(ShardingContext context) {
        log.info(String.format("------Thread ID: %s, 任务总片数: %s, " +
                        "当前分片项: %s,当前参数: %s," +
                        "当前任务名称: %s,当前任务参数: %s,"+
                        "当前任务的id: %s"
                ,
                //获取当前线程的id
                Thread.currentThread().getId(),
                //获取任务总片数
                context.getShardingTotalCount(),
                //获取当前分片项
                context.getShardingItem(),
                //获取当前的参数
                context.getShardingParameter(),
                //获取当前的任务名称
                context.getJobName(),
                //获取当前任务参数
                context.getJobParameter(),
                //获取任务的id
                context.getTaskId()
        ));

        String shardParamter = context.getShardingParameter();
        log.info("分片参数："+shardParamter);
        int value = Integer.parseInt(shardParamter);
        for (int i = 0; i <= 30; i++) {
            if (i % 2 == value) {
                try {
                    Thread.sleep(1500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                String time = new SimpleDateFormat("HH:mm:ss").format(new Date());
                log.info(time + ":开始执行简单任务" + i +", shardParamter: "+shardParamter);
            }
        }
    }
}
