package com.its.aa.server.web;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.its.aa.common.model.entity.AaGroup;
import com.its.aa.common.model.entity.AaUser;
import com.its.aa.server.service.AaGroupService;
import com.its.aa.server.service.AaUserService;
import com.its.sc.common.model.vo.WebResult;
import com.its.sc.common.util.MD5Util;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * <p>
 * 用户表 前端控制器
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Controller
@RequestMapping("/aaUser")
@RefreshScope
public class AaUserController {

    @Autowired
    private AaUserService aaUserService;

    @Autowired
    private AaGroupService aaGroupService;

    @RequestMapping(value = { "list", "" })
    public String list() {
        return "userList";
    }

    @GetMapping(value = "allData")
    @ResponseBody
    public WebResult allData(@RequestParam(required = false) String groupId, @RequestParam(required = false) String type) {
        AaUser userQuery = new AaUser();
        AaGroup groupQuery = new AaGroup();
        groupQuery.setGroupId(groupId);
        userQuery.setGroup(groupQuery);
        List<AaUser> userList =  aaUserService.findUserList(userQuery);
        return WebResult.success().put("userList", userList);
    }

    @GetMapping(value = "pageData")
    @ResponseBody
    public WebResult pageData(@RequestParam int page, @RequestParam int limit,
                              @RequestParam(required = false) String orderBy, @RequestParam(required = false) String orderFlag,
                              String userId, String userName, String policeNo, String groupId) {
        AaUser userQuery = new AaUser();
        if(!StringUtils.isEmpty(groupId)){
            userQuery.setGroupId(groupId);
        }
        if(!StringUtils.isEmpty(userId)){
            userQuery.setUserId(userId);
        }
        if(!StringUtils.isEmpty(userName)){
            userQuery.setUserName(userName);
        }
        if(!StringUtils.isEmpty(policeNo)){
            userQuery.setPoliceNo(policeNo);
        }
        Wrapper<AaUser> queryWrapper = new QueryWrapper<AaUser>(userQuery);
        IPage<AaUser> pageQuery = new Page<AaUser>(page, limit);
        Page<AaUser> pageInfo = (Page<AaUser>) aaUserService.page(pageQuery,queryWrapper);
        if(null != pageInfo && null != pageInfo.getRecords() && pageInfo.getRecords().size() > 0){
            for(int i=0;i<pageInfo.getRecords().size();i++){
                AaUser item = pageInfo.getRecords().get(i);
                if(!StringUtils.isEmpty(item.getGroupId())){
                    AaGroup groupQuery = new AaGroup();
                    groupQuery.setGroupId(item.getGroupId());
                    Wrapper<AaGroup> queryGw = new QueryWrapper<AaGroup>(groupQuery);
                    AaGroup group = aaGroupService.getOne(queryGw);
                    item.setGroup(group);
                }
            }
        }
        return WebResult.success().put("page", pageInfo);
    }

    @GetMapping(value = "detail/{id}")
    @ResponseBody
    public WebResult detail(@PathVariable String id) {
        AaUser userQuery = new AaUser();
        userQuery.setId(id);
        AaUser user = aaUserService.getUser(userQuery);
        return WebResult.success().put("user",user);
    }

    @PostMapping(value = "save")
    @ResponseBody
    public WebResult save(@RequestBody AaUser user) {
        if(StringUtils.isBlank(user.getUserId()) || StringUtils.isBlank(user.getUserName())){
            return  WebResult.error("用户编号或用户名不能为空！");
        }
        if(StringUtils.isEmpty(user.getId()) && null != aaUserService.getByUsername(user.getUserName()) && aaUserService.getByUsername(user.getUserName()).size() > 0){
            return WebResult.error("用户名已存在");
        }


        boolean rslt = aaUserService.saveUser(user);
        return (rslt == true) ? WebResult.success() : WebResult.error("保存失败");
    }

    /**
     * 逻辑删除del_flag置0
     * @param id
     * @return
     */
    @PostMapping(value = "delete/{id}")
    @ResponseBody
    public WebResult delete(@PathVariable String id) {
        AaUser user = aaUserService.getById(id);
        user.setDelFlag("1");
        boolean rslt = aaUserService.updateById(user);
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
        AaUser user = new AaUser();
        user.setId(id);
        int rslt = aaUserService.purge(user);
        return (rslt == 1) ? WebResult.success() : WebResult.error("删除失败");
    }

    @RequestMapping(value = { "profile"})
    public String profile() {
        return "userProfile";
    }

    @PostMapping(value = "/updatePassword")
    @ResponseBody
    public WebResult updatePassword(String username, String password, String newPassword) {
        List<AaUser> userList = aaUserService.getByUsername(username);
        if(null == userList || userList.size() < 1){
            return WebResult.error("用户名不正确");
        }else if(StringUtils.upperCase(MD5Util.getMD5(password)).equalsIgnoreCase(userList.get(0).getPassword())){
            AaUser user = userList.get(0);
            user.setPassword(StringUtils.upperCase(MD5Util.getMD5(newPassword)));
            boolean rslt = aaUserService.save(user);
            return (rslt == true) ? WebResult.success() : WebResult.error("密码修改失败");
        }else{
            return WebResult.error("旧密码不正确");
        }
    }
}
