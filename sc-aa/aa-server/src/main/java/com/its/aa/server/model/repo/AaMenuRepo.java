package com.its.aa.server.model.repo;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.its.aa.common.model.entity.AaMenu;
import com.its.aa.common.model.entity.AaRole;

import java.util.List;

/**
 * <p>
 * 菜单表 Mapper 接口
 * </p>
 *
 * @author guzf
 * @since 2019-08-09
 */
public interface AaMenuRepo extends BaseMapper<AaMenu> {

    /**
     * 获取某一角色的菜单列表
     * @param role
     * @return
     */
    public List<AaMenu> findRoleMenu(AaRole role);

    /**
     * 插入角色菜单关联数据
     * @param role
     * @return
     */
    public int addRoleMenu(AaRole role);

    /**
     * 删除角色菜单关联数据
     * @param role
     * @return
     */
    public int deleteRoleMenu(AaRole role);

}
