<!DOCTYPE html>
<html>
<head>
<title>权限管理</title>
<#include "./comm-header.html">
</head>
<body>
<div id="vue-app" v-cloak class="content-wrapper" style="margin-left: 0px;">
	<!-- Content Header (Page header) -->
	<section class="content-header">
		<h5>权限管理</h5>
		<ol class="breadcrumb">
			<li><a href="javascript:;" target="parent"><i class="fa fa-dashboard"></i> 首页</a></li>
			<li class="active">权限管理</li>
		</ol>
	</section>
	<!-- Main content -->
	<section class="content">
	<div v-show="showList">
		<div class="panel panel-default">
			<div class="form-horizontal">
				<div class="form-group">
					<div class="col-sm-1 control-label">权限名称</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" id="permissionNameQ" v-model="permissionQ.permissionName" placeholder="权限名称" htmlEscape="false" />
					</div>
				</div>
			</div>
		</div>
		<div class="grid-btn" style="margin-bottom: 10px">
			<a class="btn btn-info btn-sm" @click="query"><i class="fa fa-search"></i>&nbsp;查询</a>
			<a class="btn btn-info btn-sm" @click="add"><i class="fa fa-plus"></i>&nbsp;新增</a>
			<a class="btn btn-info btn-sm" @click="edit"><i class="fa fa-pencil-square-o"></i>&nbsp;修改</a>
			<a class="btn btn-info btn-sm" @click="clone"><i class="fa fa-pencil-square-o"></i>&nbsp;克隆</a>
			<a class="btn btn-info btn-sm" @click="purge"><i class="fa fa-times"></i>&nbsp;删除</a>
		</div>
		<table id="jqGrid"></table>
		<div id="jqGridPager"></div>
	</div>

	<div id="detailDiv" v-show="!showList" class="panel panel-default">
		<form id="detailForm" role="form" class="form-horizontal">
			<div class="form-group">
				<label class="col-sm-1 control-label">权限编号</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="permissionId" name="permissionId" v-model="permission.permissionId" placeholder="权限编号"
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			</div>
			<div class="form-group">
				<label class="col-sm-1 control-label">权限名称</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="permissionName" name="permissionName" v-model="permission.permissionName" placeholder="权限名称"
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
				<label class="col-sm-1 control-label">权限类型</label>
				<div class="col-sm-4">
			   	<select class="form-control" id="type" name="type" v-model="permission.type" required="required"/>
					<#--<option v-for="dict in permissionTypeDicts" v-bind:value="dict.value">
						{{dict.label}}
					</option>-->
					<option value="MENU">MENU</option>
					<option value="FUNCTION">FUNCTION</option>
					<option value="FILE">FILE</option>
				</select>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			</div>
			<div class="form-group">
				<label class="col-sm-1 control-label">访问地址</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="url" name="url" v-model="permission.url" placeholder="访问地址"
					htmlEscape="false" maxlength="100"/>
				</div>
				<label class="col-sm-1 control-label">访问地址描述</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="urlDesc" name="urlDesc" v-model="permission.urlDesc" placeholder="访问地址描述"
					htmlEscape="false" maxlength="100"/>
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
<script src="${rc.contextPath}/assets/js/domain/aa/permissionList.js?v=${.now?string('yyyyMMddhhmmssSSS')}"></script>
</body>
</html>