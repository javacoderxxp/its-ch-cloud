package com.its.aa.server.service.impl;

import com.its.aa.common.model.entity.TestApp;
import com.its.aa.server.model.repo.TestAppRepo;
import com.its.aa.server.service.TestAppService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 测试表 服务实现类
 * </p>
 *
 * @author xiaxp
 * @since 2019-08-01
 */
@Service
public class TestAppServiceImpl extends ServiceImpl<TestAppRepo, TestApp> implements TestAppService {

}
