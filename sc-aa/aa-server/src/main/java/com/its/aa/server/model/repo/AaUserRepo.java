package com.its.aa.server.model.repo;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.its.aa.common.model.entity.AaGroup;
import com.its.aa.common.model.entity.AaUser;
import com.its.aa.common.model.vo.TreeNode;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * <p>
 * 用户表 Mapper 接口
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface AaUserRepo extends BaseMapper<AaUser> {
    /**
     * 根据用户名获取用户
     * @param username
     * @return
     */
    public List<AaUser> getByUser(@Param("username")String username);

    public List<TreeNode> findTreeNodeList(String groupId);

    public int deleteGroupUser(AaGroup group);

    public int addGroupUser(AaGroup group);

    public List<AaUser> findGroupUser(AaGroup group);

    public List<AaUser> findUserList(AaUser user);
//    public int deleteaaa(@Param("id")String id);
}
