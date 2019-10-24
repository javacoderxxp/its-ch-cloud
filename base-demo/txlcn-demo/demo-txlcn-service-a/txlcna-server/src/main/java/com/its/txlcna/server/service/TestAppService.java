package com.its.txlcna.server.service;

import com.its.txlcna.common.model.entity.TestApp;
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

    String execute(String value, String exFlag, String flag);
}
