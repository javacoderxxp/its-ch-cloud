package com.its.aa.server.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.its.aa.common.model.entity.AaGroup;
import com.its.aa.common.model.entity.AaUser;
import com.its.aa.common.model.vo.TreeNode;
import com.its.aa.server.model.repo.AaUserRepo;
import com.its.aa.server.service.AaGroupService;
import com.its.aa.server.service.AaRoleService;
import com.its.aa.server.service.AaUserService;
import com.its.sc.common.util.MD5Util;
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
 * 用户表 服务实现类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Service
public class AaUserServiceImpl extends ServiceImpl<AaUserRepo, AaUser> implements AaUserService {

    @Autowired
    private AaRoleService aaRoleService;

    @Autowired
    private AaGroupService aaGroupService;

    @Override
    public List<AaUser> getByUsername(String username) {
        return baseMapper.getByUser(username);
    }

    @Override
    public int deleteaaa(String id) {
        return 0;//aaUserRepo.deleteaaa(id);
    }

    @Override
    public List<TreeNode> findTreeNodeList(String groupId) {
        return null;
    }

    @Override
    public int deleteGroupUser(AaGroup group) {
        return baseMapper.deleteGroupUser(group);
    }

    @Override
    public int addGroupUser(AaGroup group) {
        return baseMapper.addGroupUser(group);
    }

    @Override
    public List<AaUser> findGroupUser(AaGroup group) {
        return baseMapper.findGroupUser(group);
    }

    @Override
    public List<AaUser> findUserList(AaUser user) {
        return baseMapper.findUserList(user);
    }

    @Override
    @Transactional(propagation=Propagation.REQUIRED,isolation=Isolation.DEFAULT, readOnly=false)
    public boolean saveUser(AaUser user) {
        // 删除角色
        aaRoleService.deleteUserRole(user);
        String passwordPage = user.getPassword();
        String passwordMD5 = StringUtils.upperCase(MD5Util.getMD5(passwordPage));
        if(StringUtils.isEmpty(user.getId())){
            user.setPassword(passwordMD5);
            user.setId(UUID.randomUUID().toString().replaceAll("-",""));
            if(null != user.getGroup() && !StringUtils.isEmpty(user.getGroup().getGroupId())) {
                user.setGroupId(user.getGroup().getGroupId());
            }
            this.save(user);
        } else {
            AaUser userDb = this.getById(user.getId());
            String passwordDB = userDb.getPassword();
            if(!passwordMD5.equalsIgnoreCase(passwordDB) && !passwordPage.equalsIgnoreCase(passwordDB)){//密码不相同说明密码改过了，用新密码
                user.setPassword(passwordMD5);
            }
            this.updateById(user);
        }

        // 增加角色
        if (null != user.getRoleList() && user.getRoleList().size() > 0) {
            aaRoleService.addUserRole(user);
        }
        return true;
    }

    @Override
    public AaUser getUser(AaUser entity) {
        AaUser user = this.getById(entity);
        if(null !=user){
            // 获取Group
            if(!StringUtils.isEmpty(user.getGroupId())){
                AaGroup groupQuery = new AaGroup();
                groupQuery.setGroupId(user.getGroupId());
                Wrapper<AaGroup> queryGw = new QueryWrapper<AaGroup>(groupQuery);
                user.setGroup(aaGroupService.getOne(queryGw));
            }
            // 获取角色
            user.setRoleList(aaRoleService.findUserRole(user));
        }
        return user;
    }

    @Override
    public int purge(AaUser entity) {
        AaUser user = getById(entity.getId());
        // 删除角色
        aaRoleService.deleteUserRole(user);
        if(null != user) {
            this.removeById(user.getId());
        }
        return 1;
    }
}
