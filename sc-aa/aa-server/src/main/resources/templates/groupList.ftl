<!DOCTYPE html>
<html>
<head>
<title>部门管理</title>
<#include "./comm-header.html">
<!-- 
 -->
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap-duallistbox/bootstrap-duallistbox.min.css">
<script src="${rc.contextPath}/assets/plugins/bootstrap-duallistbox/jquery.bootstrap-duallistbox.js"></script>
</head>
<body>
<div id="vue-app" v-cloak class="content-wrapper" style="margin-left: 0px;">
	<!-- Content Header (Page header) -->
	<section class="content-header">
		<h5>部门管理</h5>
		<ol class="breadcrumb">
			<li><a href="javascript:;" target="parent"><i class="fa fa-dashboard"></i> 首页</a></li>
			<li class="active">部门管理</li>
		</ol>
	</section>
	<!-- Main content -->
	<section class="content">
	<div v-show="showList">
		<div class="panel panel-default">
			<div class="form-horizontal">
				<div class="form-group">
					<div class="col-sm-1 control-label">部门编号</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" id="groupIdQ" v-model="groupQ.groupId" placeholder="部门编号" htmlEscape="false" />
					</div>
					<div class="col-sm-1 control-label">部门名称</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" id="groupNameQ" v-model="groupQ.groupName" placeholder="部门名称" htmlEscape="false" />
					</div>
				</div>
			</div>
		</div>
		<div class="grid-btn" style="margin-bottom: 10px">
			<a class="btn btn-info btn-sm" @click="query"><i class="fa fa-search"></i>&nbsp;查询</a>
			<a class="btn btn-info btn-sm" @click="add"><i class="fa fa-plus"></i>&nbsp;新增</a>
			<a class="btn btn-info btn-sm" @click="edit"><i class="fa fa-pencil-square-o"></i>&nbsp;修改</a>
			<a class="btn btn-info btn-sm" @click="purge"><i class="fa fa-times"></i>&nbsp;删除</a>
		</div>
		<table id="jqGrid"></table>
		<div id="jqGridPager"></div>
	</div>

	<div id="detailDiv" v-show="!showList" class="panel panel-default">
		<form id="detailForm" role="form" class="form-horizontal">
			<div class="form-group">
			   	<label for="groupId" class="col-sm-1 control-label">部门编号</label>
			   	<div class="col-sm-4">
				<input type="text" class="form-control" id="groupId" name="groupId" v-model="group.groupId" placeholder="部门编号"
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			</div>
			<div class="form-group ">
			   	<label for="groupName" class="col-sm-1 control-label">部门名称</label>
			   	<div class="col-sm-4">
				<input type="text" class="form-control" id="groupName" name="groupName" v-model="group.groupName" placeholder="部门名称"
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			   	<label for="parent" class="col-sm-1 control-label">上级部门</label>
			   	<div class="col-sm-4">
				<div id="groupLayer" style="display: none;">
					<ul id="groupTree" class="ztree"></ul>
				</div>
				<input type="text" class="form-control" id="group.parent.groupName" name="group.parent.groupName" v-model="group.parent.groupName" placeholder="点击选择上级部门" htmlEscape="false"
					style="cursor:pointer;" @click="popupGroupTree" readonly="readonly"/>
				<input type="hidden" class="form-control" id="group.parent.groupId" name="group.parent.groupId" v-model="group.parent.groupId" style="display: none;"/>
				</div>
			</div>
			<div class="form-group">
			   	<label class="col-sm-1 control-label">中队标识</label>
			   	<div class="col-sm-4">
					<label class="radio-inline"> <input type="radio" name="zdFlag" v-model="group.zdFlag" value="1">是</label> 
					<label class="radio-inline"> <input type="radio" name="zdFlag" v-model="group.zdFlag" value="0">否</label> 
				</div>
                <#--<label for="groupName" class="col-sm-1 control-label">六合一平台编码</label>
                <div class="col-sm-4">
                <input type="text" class="form-control" id="groupName" name="groupName"  v-model="group.organizeId"  placeholder="32058517..."
                    htmlEscape="false" maxlength="20"/>
                </div>-->
			</div>
			<div class="form-group">
			   	<label for="groupUsers" class="col-sm-1 control-label">成员列表</label>
			   	<div class="col-sm-5" id="groupUserListCol">
				</div>
			</div>
			<div class="form-group">
			   	<div class="col-sm-12 col-md-offset-1 ">
				<button type="submit" class="btn btn-primary btn-sm" @click="save">提交</button>
				&nbsp;&nbsp;
				<input type="button" class="btn btn-warning btn-sm" @click="reload" value="返回"/>
				</div>
			</div>
		</form>
	</div>
	</section>
</div>
<script src="${rc.contextPath}/assets/js/domain/aa/groupList.js?v=${.now?string('yyyyMMddhhmmssSSS')}"></script>
</body>
</html>