<!DOCTYPE html>
<html>
<head>
<title>空白页</title>
<#include "./comm-header.html">
</head>
<body>
	<div id="vue-app" v-cloak class="content-wrapper" style="margin-left: 0px;">
		<section class="content-header">
			<h5>空白页</h5>
			<ol class="breadcrumb">
				<li><a href="javascript: parent.location.reload();"><i class="fa fa-dashboard"></i> 首页</a></li>
				<li class="active">空白页</li>
			</ol>
		</section>
		<!-- Main content -->
		<section class="content"></section>
	</div>
	<script type="text/javascript">
		var vm = new Vue({
			el : '#vue-app',
			data : {

			},
			methods : {

			}
		});
	</script>
</body>
</html>