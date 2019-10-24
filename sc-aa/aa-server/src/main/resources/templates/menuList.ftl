<!DOCTYPE html>
<html>
<head>
<title>菜单管理</title>
<#include "./comm-header.html">
</head>
<body>
<div id="vue-app" v-cloak class="content-wrapper" style="margin-left: 0px;">
	<!-- Content Header (Page header) -->
	<section class="content-header">
		<h5>菜单管理</h5>
		<ol class="breadcrumb">
			<li><a href="javascript:;" target="parent"><i class="fa fa-dashboard"></i> 首页</a></li>
			<li class="active">菜单管理</li>
		</ol>
	</section>
	<!-- Main content -->
	<section class="content">
	<div v-show="showList">
		<div class="panel panel-default">
			<div class="form-horizontal">
				<div class="form-group">
					<div class="col-sm-1 control-label">菜单名称</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" v-model="menuQ.menuName" placeholder="菜单名称" htmlEscape="false" />
					</div>
					<div class="col-sm-1 control-label">排序</div>
					<div class="column col-sm-2">
						<input type="text" class="form-control" v-model="menuQ.sort" placeholder="排序" htmlEscape="false" />
					</div>
					<div class="col-sm-1 control-label">可见性</div>
					<div class="column col-sm-2">
						<select class="form-control" v-model="menuQ.active" htmlEscape="false" >
							<option value="">所有</option>
							<option value="1">是</option>
							<option value="0">否</option>
						</select>
					</div>
				</div>
			</div>
		</div>
		<div class="grid-btn" style="margin-bottom: 10px">
			<a class="btn btn-info btn-sm" @click="query"><i class="fa fa-search"></i>&nbsp;查询</a>
			<a class="btn btn-info btn-sm" @click="add"><i class="fa fa-plus"></i>&nbsp;新增</a>
			<a class="btn btn-info btn-sm" @click="edit"><i class="fa fa-pencil-square-o"></i>&nbsp;修改</a>
			<a class="btn btn-info btn-sm" @click="clone"><i class="fa fa-clone"></i>&nbsp;克隆</a>
			<a class="btn btn-info btn-sm" @click="purge"><i class="fa fa-times"></i>&nbsp;删除</a>
		</div>
		<table id="jqGrid"></table>
		<div id="jqGridPager"></div>
	</div>

	<div id="detailDiv" v-show="!showList" class="panel panel-default">
		<form id="detailForm" role="form" class="form-horizontal">
			<div class="form-group">
				<label class="col-sm-1 control-label">菜单编号</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="menuId" name="menuId" v-model="menu.menuId" placeholder="菜单编号"
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
				<label class="col-sm-1 control-label">菜单名称</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="menuName" name="menuName" v-model="menu.menuName" placeholder="菜单名称"
					htmlEscape="false" required="required" maxlength="20"/>
				<span class="help-inline"><font color="red">*</font> </span>
				</div>
			</div>
			<div class="form-group">
				<label class="col-sm-1 control-label">上级菜单</label>
				<div class="col-sm-4">
				<div id="menuLayer" style="display: none;">
					<ul id="menuTree" class="ztree"></ul>
				</div>
				<input type="text" class="form-control" id="menu.parent.menuName" name="menu.parent.menuName" v-model="menu.parent.menuName" placeholder="点击选择上级菜单" htmlEscape="false"
					style="cursor:pointer;" @click="menuTreeSelect" readonly="readonly"/>
				<input type="hidden" class="form-control" id="menu.parent.menuId" name="menu.parent.menuId" v-model="menu.parent.menuId" style="display: none;"/>
				</div>
				<!-- 
				<label class="col-sm-1 control-label">类型</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="type" name="type" v-model="menu.type" placeholder="类型" htmlEscape="false"/>
				</div> 
				-->
			</div>
			<div class="form-group">
				<label class="col-sm-1 control-label">菜单事件</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="href" name="href" v-model="menu.href" placeholder="菜单事件" 
					htmlEscape="false" maxlength="100"/>
				</div>
				<label class="col-sm-1 control-label">菜单图标</label>
				<div class="col-sm-2">
					<input type="text" class="form-control" id="icon" name="icon" v-model="menu.icon" placeholder="菜单图标" 
						htmlEscape="false" maxlength="50"/>
				</div>
				<label class="col-sm-1 control-label" style="text-align: left">图标预览&nbsp;&nbsp;<i :class="menu.icon" style="font-size: 20px; color: #2196fc"></i></label>
				<div class="col-sm-1">
					<a class="btn btn-xs btn-warning" href="./aaMenu/icon" target="blank"><i class="fa fa-hand-pointer-o"></i>&nbsp;图标示例</a>
				</div>
			</div>
			<div class="form-group">
				<label class="col-sm-1 control-label">排序</label>
				<div class="col-sm-4">
				<input type="text" class="form-control" id="sort" name="sort" v-model="menu.sort" placeholder="排序" 
					htmlEscape="false" maxlength="5"/>
				</div>
				<label class="col-sm-1 control-label">可见性</label>
				<div class="col-sm-4">
				<select class="form-control" id="active" name="active" v-model="menu.active" htmlEscape="false" >
					<option value="1">是</option>
					<option value="0">否</option>
				</select>
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
<script src="${rc.contextPath}/assets/js/domain/aa/menuList.js?v=${.now?string('yyyyMMddhhmmssSSS')}"></script>
</body>
</html>