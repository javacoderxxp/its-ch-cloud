<!DOCTYPE html>
<html>
<head>
<title>在线用户管理</title>
<#include "../common/comm-header.html">
</head>
<body>
<div id="vue-app" v-cloak class="content-wrapper" style="margin-left: 0px;">
	<!-- Content Header (Page header) -->
	<section class="content-header">
		<h5>在线用户管理</h5>
		<ol class="breadcrumb">
			<li><a href="javascript:;" target="parent"><i class="fa fa-dashboard"></i>首页</a></li>
			<li class="active">在线用户管理</li>
		</ol>
	</section>
	<!-- Main content -->
	<section class="content">
	<div>
		<div class="grid-btn" style="margin-bottom: 10px">
			<a class="btn btn-info btn-sm" @click="query"><i class="fa fa-search"></i>&nbsp;查询</a>
			有效在线人数: <strong>{{validCnt}}</strong> <!-- ,  超时用户数: {{invalidCnt}} -->
		</div>
		<div class="panel panel-default">
			<div role="form" class="form-horizontal">
				<div class="form-group">
					<div class="col-sm-12 control-label">
					    <div style="height: 500px; overflow-y: scroll">
							<table class="table table-striped">
							    <thead>
							    <tr>
							        <th>序号</th>
							        <th>用户</th>
							        <th>客户端IP</th>
							        <th>登录时刻</th>
							        <th>最后访问时刻</th>
							        <th>过期时刻</th>
							        <th>剩余时间(秒)</th>
							        <th>操作</th>
							    </tr>
							    </thead>
							    <tbody>
							    <tr v-for="(session,index) in sessionList">
							    	<template v-if="session.user">
							    	<td style="text-align: left;">{{index+1}}</td>
							    	<td style="text-align: left;">{{session.user.userName}}</td>
							    	<td style="text-align: left;">{{session.host}}</td>
							    	<td style="text-align: left;">{{session.startTimestamp}}</td>
							    	<td style="text-align: left;">{{session.lastAccessTime}}</td>
							    	<td style="text-align: left;">{{session.expiryTime}}</td>
							    	<td style="text-align: left;">{{session.timeLeft/1000.0}}</td>
							    	<td style="text-align: left;">
								    	<a href="javascript:;" class="btn btn-sm btn-danger" @click="kickout(session.id)">踢出</a>
							    	</td>
							    	</template>
							    </tr>
							    </tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	</section>
</div>
<script src="${rc.contextPath}/assets/js/domain/aa/sessionList.js?v=20171226054535341"></script>
</body>
</html>