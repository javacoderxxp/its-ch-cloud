<!DOCTYPE html>
<html>
<head>
<title>用户信息</title>
<#include "./comm-header.html">
</head>
<body>
<div id="vue-app" v-cloak class="content-wrapper" style="margin-left: 0px;">
	<!-- Content Header (Page header) -->
	<section class="content-header">
		<h5>用户信息</h5>
		<ol class="breadcrumb">
			<li><a href="javascript:;" target="parent"><i class="fa fa-dashboard"></i> 首页</a></li>
			<li class="active">用户信息</li>
		</ol>
	</section>
	<!-- Main content -->
	<section class="content">
	  <div class="row">
		<div class="col-md-3">

		  <!-- Profile Image -->
		  <div class="box box-primary">
			<div class="box-body box-profile">
			  <img class="profile-user-img img-responsive img-circle" src="${rc.contextPath}/assets/dist/img/avatar.png" alt="User profile picture">
			  <h3 class="profile-username text-center">${Session.currentUser.userName}</h3>
			  <p class="text-muted text-center">管理员</p>
			  <strong><i class="fa fa-map-marker margin-r-5"></i>地点<p class="text-muted">江苏， 苏州</p></strong>
			  <hr>
			  <strong><i class="fa fa-pencil margin-r-5"></i>部门<p class="text-muted">${Session.currentUser.group.groupName}</p></strong>
			</div>
			<!-- /.box-body -->
		  </div>
		  <!-- /.box -->
		</div>
		
		<div class="col-md-9">
		  <div class="nav-tabs-custom">
			<ul class="nav nav-tabs">
			  <li class="active"><a href="#settings" data-toggle="tab">个人信息</a></li>
			</ul>
			<div class="tab-content">
			  <div class="active tab-pane" id="settings">
				<form class="form-horizontal">
				  <div class="form-group">
					<label for="userId" class="col-sm-2 control-label">用户编号</label>
					<div class="col-sm-10">
					  <input type="text" class="form-control" id="userId" name="userId" readonly="readonly" value="${Session.currentUser.userId}">
					</div>
				  </div>
				  <div class="form-group">
					<label for="userName" class="col-sm-2 control-label">姓名</label>
					<div class="col-sm-10">
					  <input type="email" class="form-control" id="userName" name="userName" readonly="readonly" value="${Session.currentUser.userName}">
					</div>
				  </div>
				  <div class="form-group">
					<label for="email" class="col-sm-2 control-label">邮箱</label>
					<div class="col-sm-10">
					  <input type="email" class="form-control" id="email" name="email" readonly="readonly" value="${Session.currentUser.email!''}">
					</div>
				  </div>
				  <div class="form-group">
					<label for="phoneNum" class="col-sm-2 control-label">电话</label>
					<div class="col-sm-10">
					  <input type="text" class="form-control" id="phoneNum" name="phoneNum" readonly="readonly" value="${Session.currentUser.phoneNum!''}">
					</div>
				  </div>
				  <div class="form-group">
					<label for="policeNo" class="col-sm-2 control-label">警号</label>
					<div class="col-sm-10">
					  <input type="text" class="form-control" id="policeNo" name="policeNo" readonly="readonly" value="${Session.currentUser.policeNo!''}">
					</div>
				  </div>
				  <div class="form-group">
					<div class="col-sm-12">
					</div>
				  </div>
				  <!-- 
				  <div class="form-group">
					<div class="col-sm-offset-2 col-sm-10">
					  <button type="submit" class="btn btn-danger">提交</button>
					</div>
				  </div>
				   -->
				</form>
			  </div>
			  
			  <div class="tab-pane" id="timeline">
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	</section>
</body>
</html>