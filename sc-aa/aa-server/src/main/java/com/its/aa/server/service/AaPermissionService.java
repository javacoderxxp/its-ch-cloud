package com.its.aa.server.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.its.aa.common.model.entity.AaPermission;
import com.its.aa.common.model.entity.AaRole;

import java.util.List;

/**
 * <p>
 * 权限表 服务类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface AaPermissionService extends IService<AaPermission> {
    public int deleteRolePermission(AaRole role);

    public int addRolePermission(AaRole role);

    public List<AaPermission> findRolePermission(AaRole role);
}
