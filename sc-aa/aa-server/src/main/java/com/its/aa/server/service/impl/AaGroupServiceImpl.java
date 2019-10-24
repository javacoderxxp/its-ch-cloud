package com.its.aa.server.service.impl;

import com.its.aa.common.model.entity.AaGroup;
import com.its.aa.common.model.vo.TreeNode;
import com.its.aa.server.model.repo.AaGroupRepo;
import com.its.aa.server.service.AaGroupService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.its.aa.server.service.AaUserService;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * <p>
 * 组织表 服务实现类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Service
public class AaGroupServiceImpl extends ServiceImpl<AaGroupRepo, AaGroup> implements AaGroupService {

    @Autowired
    private AaUserService aaUserService;

    @Override
    public List<TreeNode> findTreeNodeList(AaGroup groupQuery) {
        return baseMapper.findTreeNodeList(groupQuery);
    }

    @Override
    public List<AaGroup> getAllTeams() {
        return baseMapper.getAllTeams();
    }

    @Override
    @Transactional(propagation= Propagation.REQUIRED,isolation= Isolation.DEFAULT, readOnly=false)
    public boolean saveGroupUser(AaGroup group) {
        aaUserService.deleteGroupUser(group);
        if(null != group.getUserList() && group.getUserList().size() > 0){
            aaUserService.addGroupUser(group);
        }
        if(StringUtils.isEmpty(group.getId())){
            group.setId(UUID.randomUUID().toString().replaceAll("-",""));
            this.save(group);
        } else {
            this.updateById(group);
        }
        return true;
    }

    @Override
    public boolean pergeGroup(AaGroup group) {
        AaGroup gp = this.getById(group);
        if(null != gp) {
            // 删除用户和组织关联
            aaUserService.deleteGroupUser(gp);
        }
        return this.removeById(gp);
    }

    @Override
    public AaGroup getGroup(AaGroup entity) {
        AaGroup group = this.getById(entity.getId());
        if(null != group) {
            group.setUserList(aaUserService.findGroupUser(group));
        }
        return group;
    }
}
