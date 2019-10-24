<!DOCTYPE html>
<html>
<head>
<title>用户管理</title>
<#include "./comm-header.html">
</head>
<body>
<div id="vue-app" v-cloak class="content-wrapper" style="margin-left: 0px;">
	<!-- Content Header (Page header) -->
	<section class="content-header">
		<h5>用户管理</h5>
		<ol class="breadcrumb">
			<li><a href="javascript:;" target="parent"><i class="fa fa-dashboard"></i> 首页</a></li>
			<li class="active">用户管理</li>
		</ol>
	</section>
	<!-- Main content -->
	<section class="content">
	<div v-show="showList">
		<div class="panel panel-default">
			<div class="form-horizontal">
				<div class="form-group">
					<div class="col-sm-1 control-label">用户编号</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" id="userIdQ" v-model="userQ.userId" placeholder="用户编号" htmlEscape="false" />
					</div>
					<div class="col-sm-1 control-label">用户名</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" id="userNameQ" v-model="userQ.userName" placeholder="用户名" htmlEscape="false" />
					</div>
					<div class="col-sm-1 control-label">警号</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" id="policeNoQ" v-model="userQ.policeNo" placeholder="警号" htmlEscape="false" />
					</div>
					<div class="col-sm-1 control-label">所属部门</div>
					<div class="column col-sm-2">
						<select class="form-control" id="groupIdQ" v-model="userQ.groupId" htmlEscape="false" >
							<option value="">所有</option>
							<option v-for="group in groupList" v-bind:value="group.groupId">
								{{group.groupName}}
							</option>
						</select>
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
			   	<label for="userId" class="col-sm-1 control-label">用户编号</label>
			   	<div class="col-sm-4">
				<input type="text" class="form-control" id="userId" name="userId" v-model="user.userId" placeholder="用户编号" 
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			   	<label for="userName" class="col-sm-1 control-label">姓名</label>
			   	<div class="col-sm-4">
				<input type="text" class="form-control" id="userName" name="userName" v-model="user.userName" placeholder="姓名" 
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			</div>
			   <div class="form-group">
			   	<label for="password" class="col-sm-1 control-label">密码</label>
			   	<div class="col-sm-4">
				<input type="password" class="form-control" id="password" name="password" v-model="user.password" placeholder="密码" 
					htmlEscape="false" required="required" maxlength="32"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			   	<label for="type" class="col-sm-1 control-label">类型</label>
			   	<div class="col-sm-4">
					<select class="form-control" id="type" name="type" v-model="user.type" htmlEscape="false" >
						<option value="JF">警辅</option>
						<option value="MJ">民警</option>
						<option value="QT">其他</option>
					</select>
				</div>
			</div>
			   <div class="form-group">
			   	<label for="sex" class="col-sm-1 control-label">性别</label>
			   	<div class="col-sm-4">
			   	<select class="form-control" iid="sex" name="sex" v-model="user.sex"/>
			   		<option value ="男">男</option>
			   		<option value ="女">女</option>
				</select>
				</div>
			   	<label for="policeNo" class="col-sm-1 control-label">警号</label>
			   	<div class="col-sm-4">
				<input type="text" class="form-control" id="policeNo" name="policeNo" v-model="user.policeNo" placeholder="警号" 
					htmlEscape="false" maxlength="20"/>
				</div>
			</div>
			   <div class="form-group">
			   	<label for="email" class="col-sm-1 control-label">邮箱</label>
			   	<div class="col-sm-4">
				<input type="email" class="form-control" id="email" name="email" v-model="user.email" placeholder="邮箱"  
					htmlEscape="false" maxlength="20"/>
				</div>
			   	<label for="phoneNum" class="col-sm-1 control-label">电话</label>
			   	<div class="col-sm-4">
				<input type="text" class="form-control" id="phoneNum" name="phoneNum" v-model="user.phoneNum" placeholder="电话" 
					htmlEscape="false" maxlength="20"/>
				</div>
			</div>
			   <div class="form-group">
			   	<label for="active" class="col-sm-1 control-label">登录激活</label>
			   	<div class="col-sm-4">
			   	<select class="form-control" iid="active" name="active" v-model="user.active" required="required"/>
			   		<option value ="1">是</option>
			   		<option value ="0">否</option>
				</select>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			</div>
			<div class="form-group">
			   	<label class="col-sm-1 control-label">所属部门</label>
			   	<div class="col-sm-4">
					<!-- 选择组织 -->
					<div id="groupLayer" style="display: none;">
						<ul id="groupTree" class="ztree"></ul>
					</div>
					<input type="text" class="form-control" id="user.group.groupName" name="user.group.groupName" v-model="user.group.groupName" placeholder="点击选择部门" htmlEscape="false"
						 style="cursor:pointer;" @click="groupTreeSelect" readonly="readonly"/>
					<input type="hidden" class="form-control" id="user.group.groupId" name="user.group.groupId" v-model="user.group.groupId" style="display: none;"/>
				</div>
			</div>
			<div class="form-group">
			   	<label class="col-sm-1 control-label">拥有角色</label>
			   	<div class="col-sm-4">
					<ul id="roleTree" class="ztree"></ul>
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
<script src="${rc.contextPath}/assets/js/domain/aa/userList.js?v=${.now?string('yyyyMMddhhmmssSSS')}"></script>
</body>
</html>