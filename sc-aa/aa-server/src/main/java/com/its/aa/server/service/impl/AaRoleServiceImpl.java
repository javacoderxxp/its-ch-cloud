package com.its.aa.server.service.impl;

import com.its.aa.common.model.entity.*;
import com.its.aa.server.model.repo.AaRoleRepo;
import com.its.aa.server.service.*;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * <p>
 * 角色表 服务实现类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Service
public class AaRoleServiceImpl extends ServiceImpl<AaRoleRepo, AaRole> implements AaRoleService {

    @Autowired
    private AaMenuService aaMenuService;

    @Autowired
    private AaRoleMenuService aaRoleMenuService;

    @Autowired
    private AaPermissionService aaPermissionService;

    @Autowired
    private AaRolePermissionService aaRolePermissionService;


    @Override
    @Transactional(propagation= Propagation.REQUIRED,isolation= Isolation.DEFAULT, readOnly=false)
    public int saveRolePerMenus(AaRole role) {
        // 删除权限
        aaPermissionService.deleteRolePermission(role);
        // 增加权限
        if (null != role.getPermissionList() && role.getPermissionList().size() > 0) {
            List<AaPermission> pList = role.getPermissionList();
            for(int i=0;i<pList.size();i++){
                AaPermission ap = pList.get(i);
                AaRolePermission item = new AaRolePermission();
                item.setId(UUID.randomUUID().toString().replaceAll("-",""));
                item.setRoleId(role.getRoleId());
                item.setPermissionId(ap.getPermissionId());
                aaRolePermissionService.save(item);
            }
        }

        // 删除菜单
        aaMenuService.deleteRoleMenu(role);
        // 增加菜单
        if (null != role.getMenuList() && role.getMenuList().size() > 0) {
            List<AaMenu> mList = role.getMenuList();
            for(int i = 0;i<mList.size();i++) {
                AaMenu am = mList.get(i);
                AaRoleMenu item = new AaRoleMenu();
                item.setId(UUID.randomUUID().toString().replaceAll("-",""));
                item.setRoleId(role.getRoleId());
                item.setMenuId(am.getMenuId());
                aaRoleMenuService.save(item);
            }
            /*aaMenuService.addRoleMenu(role);*/
        }
        if(StringUtils.isEmpty(role.getId())){
            role.setId(UUID.randomUUID().toString().replaceAll("-",""));
            baseMapper.insert(role);
        } else {
            baseMapper.updateById(role);
        }
        return 1;
    }

    @Override
    public AaRole getRole(AaRole role) {
       AaRole ar = this.getById(role.getId());
       if(null != ar) {
           //获取权限
           ar.setPermissionList(aaPermissionService.findRolePermission(ar));
           //获取菜单
           ar.setMenuList(aaMenuService.findRoleMenu(ar));
       }
       return ar;
    }

    @Override
    public int deleteUserRole(AaUser user) {
        return baseMapper.deleteUserRole(user);
    }

    @Override
    public int addUserRole(AaUser user) {
        return baseMapper.addUserRole(user);
    }

    @Override
    public List<AaRole> findUserRole(AaUser user) {
        return baseMapper.findUserRole(user);
    }
}
