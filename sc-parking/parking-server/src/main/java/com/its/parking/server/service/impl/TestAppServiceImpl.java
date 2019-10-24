package com.its.parking.server.service.impl;

import com.its.parking.server.model.entity.TestApp;
import com.its.parking.server.model.repo.TestAppRepo;
import com.its.parking.server.service.TestAppService;
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
