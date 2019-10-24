package com.its.aa.server.model.repo;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.its.aa.common.model.entity.AaPermission;
import com.its.aa.common.model.entity.AaRole;

import java.util.List;

/**
 * <p>
 * 权限表 Mapper 接口
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface AaPermissionRepo extends BaseMapper<AaPermission> {

    /**
     * 获取某一角色的权限列表
     * @param role
     * @return
     */
    public List<AaPermission> findRolePermission(AaRole role);

    /**
     * 插入角色权限关联数据
     * @param role
     * @return
     */
    public int addRolePermission(AaRole role);

    /**
     *  删除角色权限关联数据
     * @param role
     * @return
     */
    public int deleteRolePermission(AaRole role);
}
