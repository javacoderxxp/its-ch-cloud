<!DOCTYPE html>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />

<link rel="shortcut icon" href="${rc.contextPath}/favicon.ico" />
<link rel="stylesheet" href="${rc.contextPath}/assets/css/app.css" />
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap/css/bootswatch.css" />
<!--
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap/css/bootstrap.min.css">
-->
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jqgrid/css/ui.jqgrid.css" />
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jqgrid/css/theme/smoothness/jquery-ui.theme.css" />
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jqgrid/css/theme/redmond/jquery-ui-1.8.16.custom.css" />
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap-select/css/bootstrap-select.css" />
<!-- 
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap-multiselect/css/bootstrap-multiselect.css" />
-->
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css">
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap-switch/css/bootstrap3/bootstrap-switch.min.css">
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/ztree/css/metroStyle/metroStyle.css">
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/font-awesome/css/font-awesome.min.css">	

<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap-step/css/bs-is-fun.css" />
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/fullcalendar/fullcalendar.min.css">
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/fullcalendar/fullcalendar.print.css" media='print'>

<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jQuery-File-Upload/css/jquery.fileupload.css" />
<!-- <link rel="stylesheet" href="${rc.contextPath}/assets/plugins/jquery-wheel-menu/wheelmenu.css" />
<link rel="stylesheet" href="${rc.contextPath}/assets/css/mapTuli.css"/> -->

<link rel="stylesheet" href="${rc.contextPath}/assets/css/silder-right.css"/>
<link rel="stylesheet" href="${rc.contextPath}/assets/css/tanpannel.css"/>
<link rel="stylesheet" href="${rc.contextPath}/assets/plugins/bootstrap-duallistbox/bootstrap-duallistbox.min.css" />
<!--<link rel="stylesheet" href="${rc.contextPath}/assets/css/rightpannel.css"/>-->
<style type="text/css"> 
.error {
	color: red;
 }
 .imap-overlay-pane div {
    box-sizing: unset !important;
}
 </style>
<script type="text/javascript">
var itsEnv = window.itsEnv = 'sit'; //sit, prod
var host = "";
if(itsEnv == 'prod'){
	host = "192.168.15.4";
}
</script>
<script src="http://114.215.146.210:25001/as/webapi/js/auth?v=1.0&t=jsmap&ak=a38637152661536811426544710c5a2c"></script>
<!-- SIT 
-->
<!-- PROD
<script src="http://192.168.15.4:25001/as/webapi/js/auth?v=1.0&t=jsmap&ak=96afef81bcb8de97f2687b41d6f4d07a"></script>
-->
 
 <!--[if lt IE 9]> <![endif]-->
<script type="text/javascript" src="${rc.contextPath}/assets/plugins/loadMap.js"></script>
<script type="text/javascript">
var ctx = '${rc.contextPath}/';
</script>
<title>智能交通服务管理平台</title>
</head>

<body>
    <!-- 菜单栏 -->
	<div id="navPanel"></div>
    <!-- 工具栏 -->
	<#--<div id="mapToolPanel" class="mapToolPanel" style="height: 32px;line-height: 32px;"></div>-->
    <!-- 地图容器 -->
	<div id="container"></div>
    <!-- 左侧表单面板 -->
	<div id="leftPanel"></div>
    <!-- 左侧实时警情面板 -->
	<#--<div id="realtimeAlarmPanel"></div>-->
    <!-- 右侧图层面板 -->
	<div id="layerPanel"></div>
    <!-- 右侧信号机列表面板 -->
    <#--<div id="selectedDevListPanel"></div>-->
    <!-- 底部图层面板 -->
	<div id="bottomPanel"></div>
    <!-- 全局弹出层 -->
    <div id="globalPopupPanel"></div>
    
    <!-- 兴趣点查询结果 -->
	<div id="poiRsltPanel">
		<div style='font-family: "Microsoft Yahei","Helvetica Neue",Helvetica,Arial,sans-serif;color: #565656;font-size: 12px;
			line-height: 22px;word-wrap: break-word;background-color: #fff;'>
            <div id="title" class="planTitle" index="0"></div>
			<div id="poiResultDiv" style="background: #fff;">
			</div>
		</div>
	</div>
    <!-- 右下角坐标 -->
	<div id="lnglatWidgetPanel">
		<input id="mapLevel" type="text" class="rightcoordinate" style="border-radius: 3px;"/>
		<input id="mapLngLat" type="text" class="coordinate" style="border-radius: 3px;"/>
	</div>
    <!-- 公司标志 -->
	<div id="posindaPanel">
		<a href="http://www.posinda.com"><img alt="ponsinda" src="./assets/images/posinda.png" width="60px" height="15px">
		&nbsp;江苏普信达智能交通有限公司&nbsp;</a>
	</div>
    <div id="mapTuliPanel" style="display: none">
    </div>
	
    <!-- <div id="jtywWidgetPanel"></div> -->
    <!-- <bgsound loop="1" autostart="false" id="alarmAlert" > -->
    <#--<audio preload="preload" id="alarmAlert" >
        <source src="./assets/audio/xjq.mp3" type="audio/mp3">
    </audio>-->
    <#--<audio preload="preload" id="jtydAlert" >
        <source src="./assets/audio/jtyd.mp3" type="audio/mp3">
    </audio>-->
	<script type="text/javascript" src="${rc.contextPath}/assets/plugins/requirejs/require.js?v=${.now?string('yyyyMMddhhmmssSSS')}" 
		data-main="${rc.contextPath}/assets/js/module/main.js?v=${.now?string('yyyyMMddhhmmssSSS')}" charset="utf-8"></script>
	
	<#--<div id="taizhangPanel" style="display: none">台账panel</div>-->
</body>

</html>