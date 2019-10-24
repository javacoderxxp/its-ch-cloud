package com.its.aa.server.web;


import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.google.common.collect.Lists;
import com.its.aa.common.model.entity.AaGroup;
import com.its.aa.common.model.entity.AaPermission;
import com.its.aa.common.model.entity.AaUser;
import com.its.aa.common.model.vo.TreeNode;
import com.its.aa.server.service.AaGroupService;
import com.its.aa.server.service.AaUserService;
import com.its.sc.common.model.vo.WebResult;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * <p>
 * 组织表 前端控制器
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Controller
@RequestMapping("/aaGroup")
public class AaGroupController {

    @Autowired
    private AaGroupService aaGroupService;

    @Autowired
    private AaUserService aaUserService;

    @RequestMapping(value = { "list", "" })
    public String list() {
        return "groupList";
    }

    @GetMapping(value = "allData")
    @ResponseBody
    public WebResult allData(@RequestParam(required = false) String zdFlag) {
        AaGroup groupQuery = new AaGroup();
        if(!StringUtils.isEmpty(zdFlag)){
            groupQuery.setZdFlag(zdFlag);
        }
        Wrapper<AaGroup> queryWrapper = new QueryWrapper<AaGroup>(groupQuery);
        List<AaGroup> groupList = aaGroupService.list(queryWrapper);
        return WebResult.success().put("groupList", groupList);
    }

    @GetMapping(value = "pageData")
    @ResponseBody
    public WebResult pageData(@RequestParam int page, @RequestParam int limit,
                              @RequestParam(required = false) String orderBy, @RequestParam(required = false) String orderFlag,
                              String groupId, String groupName) {
        AaGroup group = new AaGroup();
        if(!StringUtils.isEmpty(groupId)){
            group.setGroupId(groupId);
        }
        if(!StringUtils.isEmpty(groupName)){
            group.setGroupName(groupName);
        }
        Wrapper<AaGroup> queryWrapper = new QueryWrapper<AaGroup>(group);
        IPage<AaGroup> pageQuery = new Page<AaGroup>(page, limit);
        Page<AaGroup> pageInfo = (Page<AaGroup>) aaGroupService.page(pageQuery,queryWrapper);
        if(null != pageInfo && null != pageInfo.getRecords() && pageInfo.getRecords().size() > 0){
            for(int i = 0;i<pageInfo.getRecords().size();i++){
                AaGroup item = pageInfo.getRecords().get(i);
                if(!StringUtils.isEmpty(item.getParentId())){
                    AaGroup pGroup = new AaGroup();
                    pGroup.setGroupId(item.getParentId());
                    Wrapper<AaGroup> qw =  new QueryWrapper<AaGroup>(pGroup);
                    AaGroup pt = aaGroupService.getOne(qw);
                    item.setParent(pt);
                }
            }

        }
        return WebResult.success().put("page", pageInfo);
    }

    @RequestMapping(value = "detail/{id}")
    @ResponseBody
    public WebResult detail(@PathVariable String id) {
        AaGroup groupQuery = new AaGroup();
        groupQuery.setId(id);
        AaGroup group = aaGroupService.getGroup(groupQuery);
        if(null != group && !StringUtils.isEmpty(group.getParentId())){
            AaGroup pGroup = new AaGroup();
            pGroup.setGroupId(group.getParentId());
            Wrapper<AaGroup> qw =  new QueryWrapper<AaGroup>(pGroup);
            AaGroup pt = aaGroupService.getOne(qw);
            group.setParent(pt);
        }
        return WebResult.success().put("group", group);
    }

    @PostMapping(value = "save")
    @ResponseBody
    public WebResult save(@RequestBody AaGroup group) {
        if(null != group.getParent() && !StringUtils.isEmpty(group.getParent().getGroupId())){
            group.setParentId(group.getParent().getGroupId());
        }
        boolean rslt = aaGroupService.saveGroupUser(group);
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
        AaGroup group = aaGroupService.getById(id);
        group.setDelFlag("1");
        boolean rslt = aaGroupService.updateById(group);
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
        AaGroup groupQ = new AaGroup();
        groupQ.setId(id);
        boolean rslt = aaGroupService.pergeGroup(groupQ);
        return (rslt == true) ? WebResult.success() : WebResult.error("删除失败");
    }

    @RequestMapping(value = "detailByParam")
    @ResponseBody
    public WebResult detailByParam(@RequestParam String groupId) {
        AaGroup groupQuery = new AaGroup();
        groupQuery.setGroupId(groupId);
        Wrapper<AaGroup> queryWrapper = new QueryWrapper<AaGroup>(groupQuery);
        AaGroup group = aaGroupService.getOne(queryWrapper);
        return WebResult.success().put("group", group);
    }

    @GetMapping(value = "candidateGroupUserList")
    @ResponseBody
    public WebResult candidateGroupUserList(@RequestParam(required = false) String groupId) {
        AaUser userQ = new AaUser();
        Wrapper<AaUser> queryWrapper = new QueryWrapper<AaUser>(userQ);
        //所有的用户
        List<AaUser> allUserList = aaUserService.list(queryWrapper);
        //未分配部门或者已经在部门中
        List<AaUser> candidateGroupUserList = new ArrayList<AaUser>();
        if(null != allUserList && allUserList.size() > 0){
            for(int i =0 ;i <allUserList.size(); i++){
                AaUser tmpUser = allUserList.get(i);
                if(null == tmpUser.getGroup() || StringUtils.isBlank(tmpUser.getGroup().getGroupId())){//未分配部门
                    candidateGroupUserList.add(tmpUser);
                }else if(StringUtils.isNotBlank(groupId) && groupId.equals(tmpUser.getGroup().getGroupId())){//已分配部门且与传入的部门编号相同
                    candidateGroupUserList.add(tmpUser);
                }
            }
        }
        return WebResult.success().put("candidateGroupUserList", candidateGroupUserList);
    }

    @GetMapping(value = "zdGroupTree")
    @ResponseBody
    public WebResult zdGroupTree(@RequestParam(required=false) String groupId, @RequestParam(required=false) String pId) {
        List<TreeNode> treeNodeList = Lists.newArrayList();

        AaGroup groupQuery = new AaGroup();
        AaGroup parent = new AaGroup();
        parent.setGroupId("xqjjdd");
        groupQuery.setParent(parent);
        groupQuery.setZdFlag("1");
        treeNodeList = aaGroupService.findTreeNodeList(groupQuery);
        if(null !=treeNodeList && treeNodeList.size()>0){
            for(TreeNode treeNode: treeNodeList){
                treeNode.setpId(pId);
            }
        }
        return WebResult.success().put("treeNodeList", treeNodeList);
    }

    @GetMapping(value = "groupUserTree")
    @ResponseBody
    public WebResult groupUserTree(@RequestParam(required=false) String groupId) {
        List<TreeNode> treeNodeList = Lists.newArrayList();

        AaGroup groupQuery = new AaGroup();
        groupQuery.setGroupId(groupId);
        List<TreeNode> groupTreeNodeList = aaGroupService.findTreeNodeList(groupQuery);
        List<TreeNode> userTreeNodeList = aaUserService.findTreeNodeList(groupId);
        treeNodeList.addAll(userTreeNodeList);
        treeNodeList.addAll(groupTreeNodeList);
        return WebResult.success().put("treeNodeList", treeNodeList);
    }

    /**
     * 获取警情所有中队信息
     */
    @RequestMapping(value = "getAllTeams", method = RequestMethod.GET)
    @ResponseBody
    public WebResult getAllTeams(){
        try {
            List<AaGroup> teamList = aaGroupService.getAllTeams();
            return WebResult.success().put("teamList", teamList);
        } catch (Exception e) {
            e.printStackTrace();
            return WebResult.error();
        }
    }

    /*@RequestMapping(value = "allDataWithShape", method = RequestMethod.GET)
    @ResponseBody
    public WebResult allDataWithShape(@RequestParam(required = false) String zdFlag) {
        Group groupQuery = new Group();
        groupQuery.setZdFlag(zdFlag);
        List<Group> groupList = groupService.findListWithShape(groupQuery);
        return WebResult.success().put("groupList", groupList);
    }*/
}
