package com.its.aa.server.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.its.aa.common.model.entity.AaMenu;
import com.its.aa.common.model.entity.AaRole;

import java.util.List;

/**
 * <p>
 * 菜单表 服务类
 * </p>
 *
 * @author guzf
 * @since 2019-08-09
 */
public interface AaMenuService extends IService<AaMenu> {
    public int deleteRoleMenu(AaRole role);

    public int addRoleMenu(AaRole role);

    public List<AaMenu> findRoleMenu(AaRole role);
}
