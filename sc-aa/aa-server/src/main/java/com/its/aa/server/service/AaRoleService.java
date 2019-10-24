package com.its.aa.server.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.its.aa.common.model.entity.AaRole;
import com.its.aa.common.model.entity.AaUser;

import java.util.List;

/**
 * <p>
 * 角色表 服务类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface AaRoleService extends IService<AaRole> {
    public int saveRolePerMenus(AaRole role);

    public AaRole getRole(AaRole role);

    public int deleteUserRole(AaUser user);

    public int addUserRole(AaUser user);

    public List<AaRole> findUserRole(AaUser user);
}
