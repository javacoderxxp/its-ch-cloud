package com.its.aa.server.model.repo;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.its.aa.common.model.entity.AaRole;
import com.its.aa.common.model.entity.AaUser;

import java.util.List;

/**
 * <p>
 * 角色表 Mapper 接口
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface AaRoleRepo extends BaseMapper<AaRole> {

    public int deleteUserRole(AaUser user);

    public int addUserRole(AaUser user);

    public List<AaRole> findUserRole(AaUser user);

}
