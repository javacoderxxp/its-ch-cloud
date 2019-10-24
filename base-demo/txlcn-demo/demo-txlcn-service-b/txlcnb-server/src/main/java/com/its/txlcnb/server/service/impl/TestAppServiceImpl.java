package com.its.txlcnb.server.service.impl;

import com.its.sc.common.util.IdGenerator;
import com.its.txlcnb.common.model.entity.TestApp;
import com.its.txlcnb.server.model.repo.TestAppRepo;
import com.its.txlcnb.server.service.TestAppService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * <p>
 * 测试表 服务实现类
 * </p>
 *
 * @author xiaxp
 * @since 2019-10-11
 */
@Service
public class TestAppServiceImpl extends ServiceImpl<TestAppRepo, TestApp> implements TestAppService {

    @Override
    public String rpc(String value) {
        TestApp demo = new TestApp();
        demo.setAge(25);
        demo.setId(IdGenerator.getIdStr());
        demo.setName("service-b");
        demo.setStartWorkDt(LocalDate.now());
        this.save(demo);

        return "ok-service-b";
    }
}
