package com.its.aa.server.web;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.its.aa.common.model.entity.AaMenu;
import com.its.aa.common.model.entity.AaPermission;
import com.its.aa.server.service.AaMenuService;
import com.its.sc.common.model.vo.WebResult;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

/**
 * <p>
 * 菜单表 前端控制器
 * </p>
 *
 * @author guzf
 * @since 2019-08-09
 */
@Controller
@RequestMapping("/aaMenu")
public class AaMenuController {

    @Autowired
    private AaMenuService aaMenuService;

    @RequestMapping(value = { "list", "" })
    public String list() {
        return "menuList";
    }

    @GetMapping(value = "allData")
    @ResponseBody
    public WebResult allData() {
        AaMenu menu = new AaMenu();
        Wrapper<AaMenu> queryWrapper = new QueryWrapper<AaMenu>(menu);
        List<AaMenu> menuList = aaMenuService.list(queryWrapper);
        if(null!=menuList && menuList.size() > 0) {
            for(int i=0;i<menuList.size();i++){
                AaMenu item = menuList.get(i);
                if(!StringUtils.isBlank(item.getParentId()) && !("0").equals(item.getParentId())){
                    item.setParent(new AaMenu());
                    item.getParent().setMenuId(item.getParentId());
                    AaMenu menuQueryP = new AaMenu();
                    menuQueryP.setMenuId(item.getParentId());
                    Wrapper<AaMenu> queryWrapperP = new QueryWrapper<AaMenu>(menuQueryP);
                    AaMenu parent = aaMenuService.getOne(queryWrapperP);
                    item.getParent().setMenuName(parent.getMenuName());
                    item.setPId(item.getParent().getMenuId());
                }
            }
        }
        return WebResult.success().put("menuList", menuList);
    }

    @GetMapping(value = "pageData")
    @ResponseBody
    public WebResult pageData(@RequestParam int page, @RequestParam int limit,
                              @RequestParam(required = false) String orderBy, @RequestParam(required = false) String orderFlag,
                              String menuName, String sort, String active) {
        AaMenu menu = new AaMenu();
        menu.setMenuName(menuName);
        menu.setSort(sort);
        menu.setActive(active);
        Wrapper<AaMenu> queryWrapper = new QueryWrapper<AaMenu>(menu);
        IPage<AaMenu> pageQuery = new Page<AaMenu>(page, limit);
        Page<AaMenu> pageInfo = (Page<AaMenu>) aaMenuService.page(pageQuery,queryWrapper);
        if(null != pageInfo && null != pageInfo.getRecords() && pageInfo.getRecords().size() > 0){
            for(int i=0;i<pageInfo.getRecords().size();i++) {
                AaMenu item = pageInfo.getRecords().get(i);
                if(!StringUtils.isBlank(item.getParentId()) && !("0").equals(item.getParentId())){
                    item.setParent(new AaMenu());
                    item.getParent().setMenuId(item.getParentId());
                    AaMenu menuQueryP = new AaMenu();
                    menuQueryP.setMenuId(item.getParentId());
                    Wrapper<AaMenu> queryWrapperP = new QueryWrapper<AaMenu>(menuQueryP);
                    AaMenu parent = aaMenuService.getOne(queryWrapperP);
                    item.getParent().setMenuName(parent.getMenuName());
                    item.setPId(item.getParent().getMenuId());
                }
            }
        }
        return WebResult.success().put("page", pageInfo);
    }

    @RequestMapping(value = "detail/{id}")
    @ResponseBody
    public WebResult detail(@PathVariable String id) {
        AaMenu menuQuery = new AaMenu();
        menuQuery.setId(id);
        AaMenu menu = aaMenuService.getById(id);
        if(null != menu && !StringUtils.isEmpty(menu.getParentId())) {
            menu.setParent(new AaMenu());
            AaMenu menuQueryP = new AaMenu();
            menuQueryP.setMenuId(menu.getParentId());
            Wrapper<AaMenu> queryWrapper = new QueryWrapper<AaMenu>(menuQueryP);
            menu.getParent().setMenuId(menu.getParentId());
            AaMenu parent = aaMenuService.getOne(queryWrapper);
            menu.getParent().setMenuName(parent.getMenuName());
            menu.setPId(menu.getParent().getMenuId());
        }
        return WebResult.success().put("menu", menu);
    }

    @PostMapping(value = "save")
    @ResponseBody
    public WebResult save(@RequestBody AaMenu menu) {
        boolean rslt = false;
        if(StringUtils.isEmpty(menu.getId())){
            menu.setId(UUID.randomUUID().toString().replaceAll("-",""));
            rslt = aaMenuService.save(menu);
        } else{
            rslt = aaMenuService.updateById(menu);
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
        AaMenu menu = aaMenuService.getById(id);
        menu.setDelFlag("1");
        boolean rslt = aaMenuService.updateById(menu);
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
        boolean rslt = aaMenuService.removeById(id);
        return (rslt == true) ? WebResult.success() : WebResult.error("删除失败");
    }

    @RequestMapping(value =  "icon")
    public String menuIcon() {
        return "icon";
    }
}
