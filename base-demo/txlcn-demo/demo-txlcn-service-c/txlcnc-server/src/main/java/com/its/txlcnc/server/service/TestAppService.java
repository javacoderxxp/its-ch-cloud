package com.its.txlcnc.server.service;

import com.its.txlcnc.common.model.entity.TestApp;
import com.baomidou.mybatisplus.extension.service.IService;

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
