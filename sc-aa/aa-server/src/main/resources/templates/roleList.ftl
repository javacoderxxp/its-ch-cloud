<!DOCTYPE html>
<html>
<head>
<title>角色管理</title>
<#include "./comm-header.html">
</head>
<body>
<div id="vue-app" v-cloak class="content-wrapper" style="margin-left: 0px;">
	<!-- Content Header (Page header) -->
	<section class="content-header">
		<h5>角色管理</h5>
		<ol class="breadcrumb">
			<li><a href="javascript:;" target="parent"><i class="fa fa-dashboard"></i> 首页</a></li>
			<li class="active">角色管理</li>
		</ol>
	</section>
	<!-- Main content -->
	<section class="content">
	<div v-show="showList">
		<div class="panel panel-default">
			<div class="form-horizontal">
				<div class="form-group">
					<div class="col-sm-1 control-label">角色编号</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" id="roleIdQ" v-model="roleQ.roleId" placeholder="角色编号" htmlEscape="false" />
					</div>
					<div class="col-sm-1 control-label">角色名称</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" id="roleNameQ" v-model="roleQ.roleName" placeholder="角色名称" htmlEscape="false" />
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
			   	<label class="col-sm-1 control-label">角色编号</label>
			   	<div class="col-sm-4">
				<input type="text" class="form-control" id="roleId" name="roleId" v-model="role.roleId" placeholder="角色1编号"
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			   	<label class="col-sm-1 control-label">角色名称</label>
			   	<div class="col-sm-4">
				<input type="text" class="form-control" id="roleName" name="roleName" v-model="role.roleName" placeholder="角色名称"
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			</div>
			<div class="form-group">
				<label class="col-sm-1 control-label">权限列表</label>
				<div class="col-sm-4">
					<ul id="permissionTree" class="ztree"></ul>
				</div>
			</div>
			<div class="form-group">
				<label class="col-sm-1 control-label">菜单列表</label>
			   	<div class="col-sm-4" style="height: 400px; overflow-y: auto">
					<ul id="menuTree" class="ztree"></ul>
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
<script src="${rc.contextPath}/assets/js/domain/aa/roleList.js?v=${.now?string('yyyyMMddhhmmssSSS')}"></script>
</body>
</html>