package com.its.aa.server.model.repo;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.its.aa.common.model.entity.AaGroup;
import com.its.aa.common.model.vo.TreeNode;

import java.util.List;

/**
 * <p>
 * 组织表 Mapper 接口
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface AaGroupRepo extends BaseMapper<AaGroup> {
    public List<TreeNode> findTreeNodeList(AaGroup groupQuery);

    public List<AaGroup> getAllTeams();
}
