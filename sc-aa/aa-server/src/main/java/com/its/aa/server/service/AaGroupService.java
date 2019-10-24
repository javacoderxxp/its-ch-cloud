package com.its.aa.server.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.its.aa.common.model.entity.AaGroup;
import com.its.aa.common.model.vo.TreeNode;

import java.util.List;

/**
 * <p>
 * 组织表 服务类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface AaGroupService extends IService<AaGroup> {

    public List<TreeNode> findTreeNodeList(AaGroup groupQuery);

    public List<AaGroup> getAllTeams();

    public boolean saveGroupUser(AaGroup group);

    public boolean pergeGroup(AaGroup group);

    public AaGroup getGroup(AaGroup entity);

}
