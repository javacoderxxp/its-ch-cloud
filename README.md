#  its-ch-cloud

<p align="left">
  <img src='https://img.shields.io/badge/license-Apache%202-4EB1BA.svg' alt='License'/>
  <img src="https://img.shields.io/badge/Spring%20Boot-2.1.4.RELEASE-blue" alt="Downloads"/>
  <img src="https://img.shields.io/badge/Spring%20Cloud-Finchley.SR4-blue" alt="Downloads"/>
  <img src="https://img.shields.io/badge/Spring%20Cloud%20Alibaba-2.1.0.RELEASE-blue" alt="Downloads"/>
</p>

## 1. 项目介绍
* 前后端分离的企业级微服务架构
* 后端基于spring cloud alibaba构建
* 集成Nacos、Gateway、Sentinel、Feign、Elastic-job、Kafka、Hutool、guava、Skywalking等
&nbsp;

## 2. 项目总体架构图
![Alt text](https://gitee.com/YusHome/its-base/raw/master/its-ch-cloud.png "optional title")
&nbsp;

## 3. 功能介绍

* **统一认证功能**
  * 支持用户名、密码登录 🚀

* **分布式系统基础支撑**
  - 服务注册发现、配置中心 -- Nacos 🚀
  - 路由与负载均衡、限流 -- Spring Cloud Gateway 🚀
  - 服务降级与熔断 -- Sentinal 🚀
  - 统一日志中心 -- GrayLog  🚀
  - 统一分布式缓存、分布式锁 -- Redission 🚀
  - 分布式任务调度器 -- Elastic-job + Elastic-job-manager 🚀
  - 分布式Id生成器 -- IdGenerator 🚀
  - 分布式事务 -- Seata 🚀
  - 链路追踪 -- SkyWalking 🚀 
  - 消息队列 -- kafka 🚀
  
* **系统监控功能** 😢
  - 服务调用链监控、应用拓扑图 -- SkyWalking
  - 慢查询SQL监控 🚀
  - 应用吞吐量监控(qps、rt)
  - 服务降级、熔断监控 -- Sentinal 🚀
  - 微服务服务监控 -- Springboot Admin 🚀
  - 服务器监控 🚀
  - redis监控
  - mysql监控
  - oracle监控
  - nacos监控
  - prometheus监控
  
* **业务基础功能支撑**
  * 多租户(应用隔离) 🚀
  * 高性能方法级幂等性支持 😢
  * 数据库访问层自动实现crud操作 🚀
  * 代码生成器 🚀
  * 基于Hutool的各种便利开发工具 🚀
  * 网关聚合所有服务的Swagger接口文档 🚀
  * 统一跨域处理 🚀
  * 统一异常处理 🚀

&nbsp;

## 4. 模块说明

&nbsp;
## 5. 交流反馈
* 个人邮箱（xiaxp）：464602584@qq.com

&nbsp;
