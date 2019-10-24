package com.its.txlcnb.server.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.its.txlcnb.common.model.entity.TestApp;

/**
 * <p>
 * 测试表 服务类
 * </p>
 *
 * @author xiaxp
 * @since 2019-10-11
 */
public interface TestAppService extends IService<TestApp> {

    String rpc(String value);
}
