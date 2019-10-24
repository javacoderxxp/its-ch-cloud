package com.its.aa.server.web;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.its.aa.common.model.entity.AaRole;
import com.its.aa.common.model.entity.AaUser;
import com.its.aa.server.service.AaRoleService;
import com.its.sc.common.model.vo.WebResult;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;

import javax.management.relation.Role;
import java.util.List;

/**
 * <p>
 * 角色表 前端控制器
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Controller
@RequestMapping("/aaRole")
public class AaRoleController {

    @Autowired
    private AaRoleService aaRoleService;

    @RequestMapping(value = { "list", "" })
    public String list() {
        return "roleList";
    }

    @GetMapping(value = "allData")
    @ResponseBody
    public WebResult allData() {
        AaRole role = new AaRole();
        Wrapper<AaRole> queryWrapper = new QueryWrapper<AaRole>(role);
        List<AaRole> roleList = aaRoleService.list(queryWrapper);
        return WebResult.success().put("roleList", roleList);
    }

    @GetMapping(value = "pageData")
    @ResponseBody
    public WebResult pageData(@RequestParam int page, @RequestParam int limit,
                              String roleId, String roleName) {
        AaRole role = new AaRole();
        if(!StringUtils.isEmpty(roleId)) {
            role.setRoleId(roleId);
        }
        if(!StringUtils.isEmpty(roleName)) {
            role.setRoleName(roleName);
        }
        Wrapper<AaRole> queryWrapper = new QueryWrapper<AaRole>(role);
        IPage<AaRole> pageQuery = new Page<AaRole>(page, limit);
        Page<AaRole> pageInfo = (Page<AaRole>) aaRoleService.page(pageQuery,queryWrapper);
        return WebResult.success().put("page", pageInfo);
    }

    @GetMapping(value = "detail/{id}")
    @ResponseBody
    public WebResult detail(@PathVariable String id) {
        AaRole queryRole = new AaRole();
        queryRole.setId(id);
        AaRole role = aaRoleService.getRole(queryRole);
        return WebResult.success().put("role", role);
    }

    @PostMapping(value = "save")
    @ResponseBody
    public WebResult save(@RequestBody AaRole role) {
        int rslt = aaRoleService.saveRolePerMenus(role);
        return (rslt == 1) ? WebResult.success() : WebResult.error("保存错误");
    }

    /**
     * 逻辑删除
     * @param id
     * @return
     */
    @PostMapping(value = "delete/{id}")
    @ResponseBody
    public WebResult delete(@PathVariable String id) {
        AaRole role = aaRoleService.getById(id);
        role.setDelFlag("0");
        boolean rslt = aaRoleService.updateById(role);
        return (rslt == true) ? WebResult.success() : WebResult.error("删除失败");
    }

    /**
     * 物理删除
     * @param id
     * @return
     */
    @PostMapping(value = "purge/{id}")
    @ResponseBody
    public WebResult purge(@PathVariable String id) {
        boolean rslt = aaRoleService.removeById(id);
        return (rslt == true) ? WebResult.success() : WebResult.error("删除失败");
    }
}
