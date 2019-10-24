<style>
.sysLogo {
	margin-top: 5px;
	background-image: url(${rc.contextPath}/assets/images/logo.png);
	width: 40px;
	height: 40px;
	background-size: contain;
	float: left;
	border-radius:20px
}
.sysTitle {
	margin-left: 5px;
	font-size: 20px;
}
.navbar-brand {
    float: left;
    height: 50px;
    padding: 12px 0 2px 2px;
    font-size: 18px;
    line-height: 20px;
    }
 p {
     margin: 0 0 0px; 
}
</style>
  <header class="main-header">
    <!-- Logo -->
    <!--<a href="${rc.contextPath}/admin" class="logo" style="padding:0px 10px 0px 10px ">
		<span class="logo-mini"><div class="sysLogo"></div></span>
		<span class="logo-lg">
			<div class="sysLogo"></div>
			<div class="sysTitle">交通服务管理平台</div>
		</span>
    </a>-->
			
    <!-- Header Navbar -->
    <nav class="navbar navbar-static-top" role="navigation">
      <!-- Sidebar toggle button-->
		<#--<div class="backgroundimg onerow"></div>-->
		<div class="navbar-brand" style="color:#fff;margin-left: 10px;font-size: 16px;">
			<p>苏州工业园区测绘地理信息有限公司</p>
			<p style="color:#fff;margin-left: 25px;font-size: 14px">系统管理平台</p>
		</div>
		
		<div class="onerow">
	      <a href="#" class="sidebar-toggle onerow" data-toggle="offcanvas" role="button">
	        <span class="sr-only">切换</span>
	      </a>
	    </div>
      <!-- 
      <div style="float: left; color: rgb(255, 255, 255); padding-top: 10px; font-size: 18px;">
      	 <a href="javascript:;" class="menu-item btn btn-primary" data-src="${rc.contextPath}/bmap"><font class="fa fa-globe">&nbsp;</font>地图首页</a>
      </div>
       -->
      <#--<div style="float: left; color: rgb(255, 255, 255); padding-top: 14px; font-size: 18px; ">
      	 <a href="${rc.contextPath}/" class="btn btn-primary btn-sm" style="border-radius:5px; border-color: white"><font class="fa fa-globe">&nbsp;</font>首页</a>
      </div>-->
      <div id="sysdate" style="float: left; color: rgb(255, 255, 255); padding-top: 20px; padding-left:10px; font-family: KaiTi; font-size: 14px;">
      </div>
      <!--<form class="navbar-form navbar-left" role="search">
        <div class="form-group">
          <input type="text" class="form-control" id="navbar-search-input" placeholder="Search">
        </div>
      </form>-->
      <!-- Navbar Right Menu -->
      <div class="navbar-custom-menu">
        <ul class="nav navbar-nav">
          <!-- Notifications Menu 
          <li class="dropdown notifications-menu">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
              <i class="fa fa-bell-o"></i>
              <span class="label label-warning" id="notificationsCnt">0</span>
            </a>
            <ul class="dropdown-menu" id="notificationsContent" style="width: 320px">
			</ul>
          </li>
          -->
          <!-- User Account Menu -->
          <li class="dropdown user user-menu">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
              <img src="${rc.contextPath}/assets/dist/img/avatar.png" class="user-image" alt="User Image">
              <span class="hidden-xs">
				<#if Session.currentUser?exists>
					${Session.currentUser.userName}(${Session.currentUser.userId})
				<#else>  
					匿名用户
				</#if>
              </span>
            </a>
            <ul class="dropdown-menu">
              <li class="header">
              </li>
              <!-- Menu Body -->
              <li class="user-body">
                <div class="row">
                  <div class="col-xs-4 text-center">
                    <a href="javascript:;">在线</a>
                  </div>
                </div>
              </li>
	          <!-- Menu Footer-->
	          <li class="user-footer">
	            <div class="pull-right">
	              <a href="${rc.contextPath}/logout" class="btn btn-default btn-flat">登出</a>
	            </div>
	          </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  </header>