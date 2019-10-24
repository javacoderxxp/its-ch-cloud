package com.its.aa.server.web;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.its.aa.common.model.entity.AaPermission;
import com.its.aa.common.model.entity.AaRole;
import com.its.aa.server.service.AaPermissionService;
import com.its.sc.common.model.vo.WebResult;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

/**
 * <p>
 * 权限表 前端控制器
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Controller
@RequestMapping("/aaPermission")
public class AaPermissionController {

    @Autowired
    private AaPermissionService aaPermissionService;

    @RequestMapping(value = { "list", "" })
    public String list() {
        return "permissionList";
    }

    @GetMapping(value = "allData")
    @ResponseBody
    public WebResult allData() {
        AaPermission permission = new AaPermission();
        Wrapper<AaPermission> queryWrapper = new QueryWrapper<AaPermission>(permission);
        List<AaPermission> permissionList = aaPermissionService.list(queryWrapper);
        return WebResult.success().put("permissionList", permissionList);
    }

    @GetMapping(value = "pageData")
    @ResponseBody
    public WebResult pageData(@RequestParam int page, @RequestParam int limit,
                              @RequestParam(required = false) String orderBy, @RequestParam(required = false) String orderFlag,
                              String permissionName) {
        AaPermission permission = new AaPermission();
        permission.setPermissionName(permissionName);
        Wrapper<AaPermission> queryWrapper = new QueryWrapper<AaPermission>(permission);
        IPage<AaPermission> pageQuery = new Page<AaPermission>(page, limit);
        Page<AaPermission> pageInfo = (Page<AaPermission>) aaPermissionService.page(pageQuery,queryWrapper);
        return WebResult.success().put("page", pageInfo);
    }

    @RequestMapping(value = "detail/{id}")
    @ResponseBody
    public WebResult detail(@PathVariable String id) {
        AaPermission permissionQuery = new AaPermission();
        permissionQuery.setId(id);
        AaPermission permission = aaPermissionService.getById(id);
        return WebResult.success().put("permission", permission);
    }

    @PostMapping(value = "save")
    @ResponseBody
    public WebResult save(@RequestBody AaPermission permission) {
        boolean rslt = false;
        if(StringUtils.isEmpty(permission.getId())){
            permission.setId(UUID.randomUUID().toString().replaceAll("-",""));
            rslt = aaPermissionService.save(permission);
        } else{
            rslt = aaPermissionService.updateById(permission);
        }
        return (rslt == true) ? WebResult.success() : WebResult.error("保存错误");
    }

    /**
     * 逻辑删除 将del_flag设置为1
     * @param id
     * @return
     */
    @PostMapping(value = "delete/{id}")
    @ResponseBody
    public WebResult delete(@PathVariable String id) {
        AaPermission permission = aaPermissionService.getById(id);
        permission.setDelFlag("1");
        boolean rslt = aaPermissionService.updateById(permission);
        return (rslt == true) ? WebResult.success() : WebResult.error("删除失败");
    }

    /**
     * 物理删除
     * @param id
     * @return
     */
    @RequestMapping(value = "purge/{id}", method = RequestMethod.POST)
    @ResponseBody
    public WebResult purge(@PathVariable String id) {
        boolean rslt = aaPermissionService.removeById(id);
        return (rslt == true) ? WebResult.success() : WebResult.error("删除失败");
    }

}
