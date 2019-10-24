package com.its.aa.server.service.impl;

import com.its.aa.common.model.entity.AaPermission;
import com.its.aa.common.model.entity.AaRole;
import com.its.aa.server.model.repo.AaPermissionRepo;
import com.its.aa.server.service.AaPermissionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>
 * 权限表 服务实现类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Service
public class AaPermissionServiceImpl extends ServiceImpl<AaPermissionRepo, AaPermission> implements AaPermissionService {

    @Override
    public int deleteRolePermission(AaRole role) {
        return baseMapper.deleteRolePermission(role);
    }

    @Override
    public int addRolePermission(AaRole role) {
        return baseMapper.addRolePermission(role);
    }

    @Override
    public List<AaPermission> findRolePermission(AaRole role) {
        return baseMapper.findRolePermission(role);
    }
}
