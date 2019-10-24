<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
  <link rel="shortcut icon" href="${rc.contextPath}/favicon.ico" />
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap/css/bootswatch.css" />
  <!-- 
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap/css/bootstrap.min.css">
   -->
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/font-awesome/css/font-awesome.min.css">
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/ionicons/ionicons.min.css">
  <link rel="stylesheet" href="${rc.contextPath}/assets/dist/css/AdminLTE.min.css">
  <link rel="stylesheet" href="${rc.contextPath}/assets/dist/css/skins/skin-blue.min.css">
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jquery-ui/jquery-ui.min.css">
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jquery-ui/jquery-ui.theme.min.css">
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/pace/pace.css">
  
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jQueryTab/css/style.css" />
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jQueryTab/css/tabstyle-min.css" />
  <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jquery-contextmenu/jquery.contextmenu.css" />

  <link rel="stylesheet" href="${rc.contextPath}/assets/dist/css/backstagemange.css" />
  
  
  <title>智能交通服务管理平台</title>
  <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
  <![endif]-->
  <style>
  body{position:fixed;
  width: 100%;
  height: 100%;
  }
  
  
  </style>
</head>
<!--
BODY TAG OPTIONS:
=================
Apply one or more of the following classes to get the
desired effect
|---------------------------------------------------------|
| SKINS         | skin-blue                               |
|               | skin-black                              |
|               | skin-purple                             |
|               | skin-yellow                             |
|               | skin-red                                |
|               | skin-green                              |
|---------------------------------------------------------|
|LAYOUT OPTIONS | fixed                                   |
|               | layout-boxed                            |
|               | layout-top-nav                          |
|               | sidebar-collapse                        |
|               | sidebar-mini                            |
|---------------------------------------------------------|
-->
<body class="hold-transition skin-blue sidebar-mini">
<div class="wrapper">

  <!-- Main Header -->
  <#include "sys-header.ftl">
  <!-- Left side column. contains the logo and sidebar -->
  <#include "sys-sideBar.ftl">

  <!-- Content Wrapper. Contains page content -->
  <!-- 
   -->
  <div class="content-wrapper" >
	<div id="tabPanel">
	    <!--菜单HTML Start-->
        <div id="page-tab">
            <button class="tab-btn" id="page-prev"></button>
            <nav id="page-tab-content">
                <div id="menu-list">
                </div>
            </nav>
            <button class="tab-btn" id="page-next"></button>
            <div id="page-operation">
				<div id="menu-all">
					<ul id="menu-all-ul">
					</ul>
				</div>
            </div>
        </div>
		<!--菜单HTML End-->
		<!--iframe Start (根据页面顶部占用高度，自行调整高度数值)-->
        <div id="page-content" style="height: 880px;">
        </div>
		<!--iframe End-->
	</div>
  </div>
  <!-- 模板 
  <#include "sys-mustache.html">
  -->
  <!-- Main Footer 
  <#include "sys-footer.html">
  -->

  <!-- Control Sidebar -->
</div>
<!-- ./wrapper -->

<!-- REQUIRED JS SCRIPTS -->

<script src="${rc.contextPath}/assets/plugins/jQuery/jquery-2.2.3.min.js"></script>
<script src="${rc.contextPath}/assets/plugins/jquery-ui/jquery-ui.min.js"></script>
<script src="${rc.contextPath}/assets/plugins/bootstrap/js/bootstrap.min.js"></script>
<script src="${rc.contextPath}/assets/plugins/layer/layer.js"></script>
<script src="${rc.contextPath}/assets/dist/js/app.js"></script>
<script src="${rc.contextPath}/assets/plugins/pace/pace.min.js"></script>

<script src="${rc.contextPath}/assets/plugins/mustache/mustache.min.js"></script>
<script src="${rc.contextPath}/assets/js/frame/frame-header.js"></script>
<script src="${rc.contextPath}/assets/plugins/jQueryTab/js/tab.js"></script>
<script src="${rc.contextPath}/assets/plugins/jquery-contextmenu/jquery.contextmenu.js"></script>
<!-- Optionally, you can add Slimscroll and FastClick plugins.
     Both of these plugins are recommended to enhance the
     user experience. Slimscroll is required when using the
     fixed layout. -->
</body>
</html>