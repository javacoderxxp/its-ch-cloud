package com.its.txlcna.server.service.impl;

import com.codingapi.txlcn.common.util.Transactions;
import com.codingapi.txlcn.tc.annotation.LcnTransaction;
import com.codingapi.txlcn.tracing.TracingContext;
import com.its.sc.common.util.IdGenerator;
import com.its.txlcna.common.model.entity.TestApp;
import com.its.txlcna.server.model.repo.TestAppRepo;
import com.its.txlcna.server.service.TestAppService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.its.txlcnb.common.api.ServiceBClient;
import com.its.txlcnc.common.api.ServiceCClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.util.Date;
import java.util.Objects;

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

    @Autowired
    private ServiceBClient serviceBClient;
    @Autowired
    private ServiceCClient serviceCClient;

    @LcnTransaction
    @Transactional(rollbackFor = Exception.class)
    @Override
    public String execute(String value, String exFlag, String flag) {

        String dResp = serviceBClient.rpc(value);

        String eResp = serviceCClient.rpc(value);

        TestApp demo = new TestApp();
        demo.setAge(20);
        demo.setId(IdGenerator.getIdStr());
        demo.setName("demo");
        demo.setStartWorkDt(LocalDate.now());
        this.save(demo);

        // 置异常标志，DTX 回滚
        if (Objects.nonNull(exFlag)) {
            throw new IllegalStateException("by exFlag");
        }

        return dResp + " > " + eResp + " > " + "ok-service-a";
    }
}
