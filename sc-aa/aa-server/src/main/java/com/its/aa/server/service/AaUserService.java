package com.its.aa.server.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.its.aa.common.model.entity.AaGroup;
import com.its.aa.common.model.entity.AaUser;
import com.its.aa.common.model.vo.TreeNode;

import java.util.List;

/**
 * <p>
 * 用户表 服务类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface AaUserService extends IService<AaUser> {
    public List<AaUser> getByUsername(String username);

    public int deleteaaa(String id);

    public List<TreeNode> findTreeNodeList(String groupId);

    public int deleteGroupUser(AaGroup group);

    public int addGroupUser(AaGroup group);

    public List<AaUser> findGroupUser(AaGroup group);

    public List<AaUser> findUserList(AaUser user);

    public boolean saveUser(AaUser user);

    public AaUser getUser(AaUser entity);

    public int purge(AaUser entity);
}

