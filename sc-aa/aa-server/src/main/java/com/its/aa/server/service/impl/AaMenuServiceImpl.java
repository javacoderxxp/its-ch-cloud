package com.its.aa.server.service.impl;

import com.its.aa.common.model.entity.AaMenu;
import com.its.aa.common.model.entity.AaRole;
import com.its.aa.server.model.repo.AaMenuRepo;
import com.its.aa.server.service.AaMenuService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>
 * 菜单表 服务实现类
 * </p>
 *
 * @author guzf
 * @since 2019-08-09
 */
@Service
public class AaMenuServiceImpl extends ServiceImpl<AaMenuRepo, AaMenu> implements AaMenuService {

    @Override
    public int deleteRoleMenu(AaRole role) {
        return baseMapper.deleteRoleMenu(role);
    }

    @Override
    public int addRoleMenu(AaRole role) {
        return baseMapper.addRoleMenu(role);
    }

    @Override
    public List<AaMenu> findRoleMenu(AaRole role) {
        return baseMapper.findRoleMenu(role);
    }
}
