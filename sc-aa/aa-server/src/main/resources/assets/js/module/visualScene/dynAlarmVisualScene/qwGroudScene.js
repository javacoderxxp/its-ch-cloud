$(function () {
	initMap();
	loadGroups();
	var searchStr = location.search;
	 
	//由于searchStr属性值包括“?”，所以除去该字符
	searchStr = searchStr.substr(1);
	 
	//将searchStr字符串分割成数组，数组中的每一个元素为一个参数和参数值
	var searchs = searchStr.split("&");
	 
	//获得第一个参数和值
	vm.groudName = decodeURI(searchs[0].split("=")[1]);
	vm.groudId = searchs[1].split("=")[1];
	vm.sd = searchs[2].split("=")[1];

	var url= "../dynScene/getUser?pn="+66666677
	+"&gId="+vm.groudId;
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rstl){
	    	if(rstl.code === 200){
				vm.currentUser = rstl.currentUser;
				vm.query();
			}else{
				alert(rstl.msg);
			}
		}
	});
});



var dutyGridPolygon = null; 
/*var markerOpts = new IMAP.MarkerOptions();
markerOpts.anchor = IMAP.Constants.CENTER;*/
var jtsgMarkerOpts = new IMAP.MarkerOptions();
jtsgMarkerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
jtsgMarkerOpts.icon = new IMAP.Icon("../assets/images/accident.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
var polyline;
var tracemarkers=[];
var jtsgMarkers =[];
var vm = new Vue({
	el : '#imptDiv',
	data : {
		picN:'',
		mjjh:'',
		mjxm:'',
		groudId:'',
		groudName:'',
		sd:'',
		groupList:[],
		userList:[],
		workList:[],
		allGpsDevList:[],
		wList:{},
		dutyGrid:{},
		currentUser:{},
		dutyGridOtherList:[],
		taskList:[],
		rdList:[],
		newGridPolygon:'',
		zxjgTaskList:[],
		ytglList:[],
		validCatchList:[]
	},
	methods: {
		init97DateStart: function(it){
			WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd',onpicked:vm.query});
		},
		query: function () {
			var scheduleDt = $("#usd").text();
			if(scheduleDt){
				vm.sd=scheduleDt;
			}
			vm.cleanPlony();
			vm.clear();
			closeInfoWindow();
			loadGrid();
			qwWork();
			getAllPoliceControl();
			taskCount();
			loadZxjgTask();
			loadRoadSg();
			ytglTaks();
			validCatch();
		},
		repairdetail: function (longitude,latitude,data){
			if(longitude && latitude){
				var lnglat = new IMAP.LngLat(longitude,latitude);
				map.setCenter(lnglat);
				taskInfowindow(data);
			}else{
				alert("无点位信息");
			}
		},
		cleanPlony:function (){
			if(polyline){
				map.getOverlayLayer().removeOverlay(polyline);
			}
			for (var i = 0; i < tracemarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(tracemarkers[i]);
			}
			tracemarkers=[];
			vm.workList=[];
			vm.clearDutyGrid();
		},
		locateCurrentPos: function(status, longitude, latitude){
			if(status =='0' && longitude && latitude){
				var center = new IMAP.LngLat(longitude, latitude);
				map.setCenter(center,18);
			}
		},
		getDutyListByTeamId: function() {
			for(var i=0;i<vm.groupList.length; i++){
				if(vm.groupList[i].groupId == vm.groudId){
					vm.groudName=vm.groupList[i].groupName;
				}
			}
			vm.query();
		},
		highlightDutyGrid: function (dutyGrid) {//高亮显示某一个责任区
			for(var idx =0; idx < dutyGridPolygonOthers.length; idx++){
				var dutyGridPolygonOther = dutyGridPolygonOthers[idx];
				if(dutyGridPolygonOther.data.id == dutyGrid.id){
					var optNew = dutyGridPolygonOther.getAttribute();
					optNew.fillColor='#7FFF00';
					dutyGridPolygonOther.setAttribute(optNew);
					map.setCenter(dutyGridPolygonOther.getBounds().getCenter(), 14);
					setInfoWindow(dutyGrid,dutyGridPolygonOther.getBounds().getCenter(),false);
//					map.panTo(dutyGridPolygon.getBounds().getCenter());
				}else{
					var optOld= dutyGridPolygonOther.getAttribute();
					optOld.fillColor=dutyGridPolygonOther.data.fillColor;
					dutyGridPolygonOther.setAttribute(optOld);
				}
			}
		},
		applyDataToUI : function(dataList,region) {
			vm.clear();
			if(dataList){
				for(var i = 0; i < dataList.length; i++){
					var jtsg = dataList[i];
					if(jtsg.longitude !=null && jtsg.latitude !=null){
						var marker = new IMAP.Marker(new IMAP.LngLat(jtsg.longitude, jtsg.latitude), jtsgMarkerOpts);
						marker.data = jtsg;
						marker.addEventListener(IMAP.Constants.CLICK, function(e) {
	            			taskInfowindow(e.target.data);
	            	    });
						
						map.getOverlayLayer().addOverlay(marker, false);
						marker.setTitle(jtsg.eventId);
						jtsgMarkers.push(marker);
					}
				}
			}
			vm.showOnetrafficControl(region);
		},
		showOnetrafficControl: function (region) {
    		var polygonPath = polygonStr2Path(region);
        	var plo = new IMAP.PolylineOptions();
        	plo.strokeColor = "#ff0000";
        	plo.strokeOpacity = "1";
        	plo.strokeWeight = "6";
        	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
        	vm.newGridPolygon = new IMAP.Polyline(polygonPath, plo);
        	map.getOverlayLayer().addOverlay(vm.newGridPolygon, false);
        	var center = vm.newGridPolygon.getBounds().getCenter();
        	map.setCenter(center,14);
		},
		clear: function (){
			for (var i = 0; i < jtsgMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(jtsgMarkers[i]);
			}
			if(vm.newGridPolygon){//清除折线
				map.getOverlayLayer().removeOverlay(vm.newGridPolygon);
				vm.newGridPolygon = null;
			}
			jtmarkers =[];
		},
		clearDutyGrid: function(){
			if(dutyGridPolygon){
				map.getOverlayLayer().removeOverlay(dutyGridPolygon);
			}
			dutyGridPolygon = null; 
			vm.dutyGrid.shape='';
		},
		clearOtherDutyGrids: function(){
			for (var i = 0; i < dutyGridPolygonOthers.length; i++) {
				map.getOverlayLayer().removeOverlay(dutyGridPolygonOthers[i]);
			}
			for (var i = 0; i < infoLabelOthers.length; i++) {
				map.getOverlayLayer().removeOverlay(infoLabelOthers[i]);
			}
			for (var i = 0; i < infoLabelUsers.length; i++) {
				map.getOverlayLayer().removeOverlay(infoLabelUsers[i]);
			}
			for (var i = 0; i < pointsCluster.length; i++) {
				map.getOverlayLayer().removeOverlay(pointsCluster[i]);
			}
			
			infoLabelUsers = [];
			dutyGridPolygonOthers = [];
			infoLabelOthers = [];
		}
	}
});

var icon_police = new IMAP.Icon("../assets/images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
var opts = new IMAP.MarkerOptions();
opts.anchor = IMAP.Constants.BOTTOM_CENTER;
var infoLabelUsers = [];
var pointsCluster = [];
var marker;
//在线警员
var getAllPoliceControl = function(){
	var url = "../jw/gpsDevice/searchAllJWTInfo?groupName="+encodeURIComponent(vm.groudName);
	$.ajax({
		type: "GET",
	    url: url,
	    async :false,
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var dataList = rslt.gpsDeviceList;
	    		vm.allGpsDevList =[];
	    		for(var i = 0; i < dataList.length; i++){
					var police = dataList[i];
					if(police.status != '0'){
						continue;
					}
					vm.allGpsDevList.push(police);
					//第一次加载
					var point = new IMAP.Marker(new IMAP.LngLat(police.longitude, police.latitude), opts);
					point.setIcon(icon_police);
					point.data = police;
					map.getOverlayLayer().addOverlay(point, false);
					point.setTitle(police.policeName);
					pointsCluster.push(point);
					if(police.policeName){
						
					}else{
						police.policeName="无名称";	
					}
					var infoLabel = new IMAP.Label(police.policeName, {
						position : new IMAP.LngLat(police.longitude, police.latitude),// 基点位置
						offset: new IMAP.Pixel(0,-60),//相对于基点的位置
						anchor : IMAP.Constants.TOP_CENTER,
						fontSize : 15,
						fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
						fontColor : "#222222"
					});
					map.getOverlayLayer().addOverlay(infoLabel, false);
					infoLabelUsers.push(infoLabel);
				}
	    		if(vm.allGpsDevList.length ==0){
	    			vm.allGpsDevList.push({policeName:"无",policeNo:"无",status:"1"});
	    		}
			}else{
				alert(rslt.msg);
			}
		}
	});
};

//工作汇总
var qwWork = function(){
	var url='../pubishSummary/summary?startDt=' + vm.sd +" 00:00:00"
	+"&endDt="+ vm.sd +" 23:59:59";
	$.ajax({
		url: url,
		type: 'GET',
		success: function(dat) {
			var wk = [];
			wk = dat.sumList;
			for(var i=0;i<wk.length;i++){
				if(wk[i].groupId == vm.groudId){
					vm.wList=wk[i];
				}
			}
			if(!vm.wList){
				vm.wList={xcCount:0,jfCount:0,fjCount:0,xrCount:0,bjfCount:0,qzpzCount:0,wtpzCount:0,cjCount:0};
			}
		},
		error: function(xhr, textStatus) {
			layer.msg("获取统计数据失败！");
		}
	});
}


//查控信息  一年的数据
var validCatch = function(){
	var str=vm.sd.substring(0,vm.sd.length-6);//截取后6位 留年
	var sDt = str + "-01-01 00:00:00";
	var eDt = str + "-12-31 23:59:59";
	var postDataTmp = {endDt:eDt,groupId:vm.groudId,startDt:sDt};
	$.ajax({
		type: "GET",
	    url: "../qw/validCatch/allData",
	    data: postDataTmp,
	    success: function(rslt){
	    	
			if(rslt.code == 200){
				vm.validCatchList = rslt.validCatchList;
			}else{
				alert(rslt.msg);
			}
		}
	});
	
}


//源头管理 一个月的数据
var ytglTaks = function(){
	var str=vm.sd.substring(0,vm.sd.length-2);//截取后2位
	var d=getCountDays(vm.sd+" 00:00:01");
	var sDt = str + "01 00:00:00";
	var eDt = str + d +" 23:59:59";
	var postDataTmp = {endDt:eDt,groupId:vm.groudId,startDt:sDt};
	$.ajax({
		type: "GET",
	    url: "../ytgl/task/allData",
	    data: postDataTmp,
	    success: function(rslt){
	    	
			if(rslt.code == 200){
				vm.ytglList = rslt.taskList;
			}else{
				alert(rslt.msg);
			}
		}
	});
	
}

var markers=[];
//警情汇总
var taskCount = function(){
	if(markers.length != 0) {
		for(var i = 0; i < markers.length; i++) {
			var marker = markers[i];
			map.getOverlayLayer().removeOverlay(marker);
		}
		markers = [];
	}
	var url = "../jw/policeTask/searchTaskByCondition?rdm=1"+ "&startDt=" + vm.sd +" 00:00:00"+ "&endDt=" + vm.sd +" 23:59:59" + "&alarmTeam=" + vm.groudId;
	$.get(url, function(r){
    	if(r.code == 200){
    		vm.taskList=r.list;
    		if(vm.taskList.length == 0){
    			vm.taskList=[{eventDtStr:"无",eventContent:"无",eventRst:"无"}]
    		}
    		if(r.list && r.list.length>0){
    			for(var j =0; j<r.list.length; j++){
    				var rr = r.list[j];
    				if(rr.longitude && rr.latitude){
    				}else{
    					continue;
    				}
    				var opts=new IMAP.MarkerOptions();
    				var ms;
            		opts.anchor = IMAP.Constants.BOTTOM_CENTER;
            		opts.icon=new IMAP.Icon("../assets/images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
            		var lnglat=new IMAP.LngLat(rr.longitude, rr.latitude);
        			ms=new IMAP.Marker(lnglat, opts);
        			map.getOverlayLayer().addOverlay(ms, false);
        			ms.data = rr;
            		ms.addEventListener(IMAP.Constants.CLICK, function(e) {
            			taskInfowindow(e.target.data);
            	    });
            		
            		markers.push(ms);
    			}
    		}
    	}else{
    		alert(r.msg);
    	}
    });
}

var taskInfowindow = function(data){
	var pos = new IMAP.LngLat(data.longitude, data.latitude);
	var content = '<div style="width: 320px;border: solid 1px silver;">'
		   +'<div style="position: relative;background: none repeat scroll 0 0 #F9F9F9;    border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;">'
 +'<div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;line-height: 31px;padding: 0 10px;">信息</div>'
 +'<img  class="tt" src="../assets/images/close.png" style="position: absolute;top: 10px;right: 10px;transition-duration: 0.25s;" />'
 +'</div><div style="font-size: 12px;padding: 6px;line-height: 20px;background-color: white;height:115px;"><b>时间:&nbsp;&nbsp;</b>'+(typeof(data.eventDtStr)=='undefined'?'':data.eventDtStr)
	+'<br /><b>地点:&nbsp;&nbsp;</b>'+(typeof(data.eventAddr)=='undefined'?'':data.eventAddr)+'<br /><b>详情:&nbsp;&nbsp;</b>'+(typeof(data.eventContent)=='undefined'?'':data.eventContent)
	+'</div>'
	+'<div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;"></div></div>'
	infowindow = new IMAP.InfoWindow(content,{
		size:new IMAP.Size(322,103),
		position:pos,
		//autoPan:false,
		offset: new IMAP.Pixel(300,90),
		anchor:IMAP.Constants.BOTTOM_CENTER,
		type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
	});
	
	map.getOverlayLayer().addOverlay(infowindow);
	infowindow.autoPan(true);
	$(".tt").on( "click", function() {
		if (map && infowindow) {
    		map.getOverlayLayer().removeOverlay(infowindow);
    		infowindow = null;
    	}
	});
}

//事故分析 七天的数据
var loadRoadSg = function() {
	vm.rdList =[];
	layer.load();
	var postDataTmp = {endDt:vm.sd+" 23:59:59",groupId:vm.groudId};
	$.ajax({
		type: "GET",
	    url: "../jtzx/roaddraw/RoadSgCountPage",
	    data: postDataTmp,
	    success: function(rslt){
	    	
			if(rslt.code == 200){
				vm.rdList = rslt.rdList;
				layer.closeAll('loading');
			}else{
				alert(rslt.msg);
				layer.closeAll('loading');
			}
		}
	});
	
}


//任务排查  一个月的数据
var loadZxjgTask = function() {
	var str=vm.sd.substring(0,vm.sd.length-2);//截取后2位
	var d=getCountDays(vm.sd+" 00:00:01");
	var sDt = str + "01 00:00:00";
	var eDt = str + d +" 23:59:59";
	var postDataTmp = {endDt:eDt,groupId:vm.groudId,startDt:sDt};
	$.ajax({
		type: "GET",
	    url: "../qw/zxjgTask/allData",
	    data: postDataTmp,
	    success: function(rslt){
	    	
			if(rslt.code == 200){
				vm.zxjgTaskList = rslt.zxjgTaskList;/*
				if(rslt.zxjgTaskList.length == 0){
					vm.zxjgTaskList =[{taskTitle:}]
				}*/
			}else{
				alert(rslt.msg);
			}
		}
	});
	
}

var map;
var marker;
var infowindow;
//初始化地图
var initMap = function(){

	//初始化地图
	var mapOpt = {
		minZoom : 9, // 地图最小缩放级别
		maxZoom : 20, // 地图最大缩放级别
		zoom : 14,// 设置地图初始化级别
		center : new IMAP.LngLat(121.128187, 31.464808),// 设置地图中心点坐标
		animation : true
	};
	if(itsEnv != 'prod'){
		mapOpt.zoom = 9;
	}else{
		mapOpt.zoom = 14;
	}
	if(itsEnv != 'prod'){
		//SIT 不添加 tileUrl
	}else{
		mapOpt.tileUrl = ["http://{s}/v3/tile?z={z}&x={x}&y={y}",[host+":25333", host+":25333"]];
	}
	map = new IMAP.Map("mapContainer", mapOpt); //地图实例化
	L.DomUtil.enableTextSelection();//解决地图不能选择的问题
	map.plugin(['IMAP.Tool']);//下载插件

    //################################图盟蓝色路网图层################################
	/*var trafficLayer = new IMAP.TileLayer({
    	minZoom: 9,
        maxZoom: 18,
        tileSize: 256
    });

	if(itsEnv != 'prod'){
	    trafficLayer.setTileUrlFunc(function(x, y, z) {
	    	return 'http://114.215.146.210:25033/v3/tile?z={z}&x={x}&y={y}'.replace("{x}", x).replace("{y}", y).replace("{z}", z);
	    });
	    map.addLayer(trafficLayer);
	}else{
	    trafficLayer.setTileUrlFunc(function(x, y, z) {
	        return 'http://'+ host +':25033/v3/tile?z={z}&x={x}&y={y}'.replace("{x}", x).replace("{y}", y).replace("{z}", z);
	    });
	    map.addLayer(trafficLayer);
	    //实时路况
		var trafficStatusLayer = new IMAP.TileLayer({
			maxZoom:18,
			minZoom:1,
			tileSize : 256
		});
		trafficStatusLayer.setTileUrlFunc(function(x,y,z){
			 //add time chuo _dc= new Date().getTime() ; 每次取到最新的
			 var url = "http://" + host +":8883/tile?lid=traffic&get=map&cache=off&x={x}&y={y}&z={z}&_dc="+new Date().getTime();
			 return url.replace("{x}",x).replace("{y}",y).replace("{z}",z);
		});
		map.addLayer(trafficStatusLayer);
	}*/

    //地图控件
	var scale = new IMAP.ScaleControl({
		anchor : IMAP.Constants.LEFT_BOTTOM
	});
	scale.visible(true);

	
	//创建右键菜单
	var contextMenu = new IMAP.ContextMenu(false);
	var menuItem = new IMAP.MenuItem("地图复位");
	menuItem.setCallback(function(lnglat) {
		var center = new IMAP.LngLat(121.128187,31.464808);
		map.setCenter(center,14);
    });
	contextMenu.addItem(menuItem);
	map.addContextMenu(contextMenu);
	
	var menuItem = new IMAP.MenuItem("勤务社区台账");
	menuItem.setCallback(function(lnglat) {
		//openSummaryWin(lnglat);
		window.opener.itsGlobal.OpenMenuQwSummary(lnglat);
	});
	contextMenu.addItem(menuItem);
	
	map.addEventListener(IMAP.Constants.CLICK, function(e) {
//		e.lnglat.lng = '121.1219501495';
//		e.lnglat.lat = '31.4594914434';
		if(e.lnglat.lng.length> 10){
			e.lnglat.lng = 	e.lnglat.lng.substring(0,10);
		}
		if(e.lnglat.lat.length> 9){
			e.lnglat.lat = 	e.lnglat.lat.substring(0,9);
		}
	});
	map.selfRemoveRightClickMaker = function(){
		if(marker){
			map.getOverlayLayer().removeOverlay(marker, false);
			marker = null;
		}
	}
    return map;
}


var loadGroups = function() {
    $.get("../aa/group/allData?ran="+getRandomNum()+"&zdFlag="+1, function(r){
		if(r.code == 200){
			vm.groupList = r.groupList;
		}else{
			alert(r.msg);
		}
	});
}


var closeInfoWindow = function(){
	map.getOverlayLayer().removeOverlay(infowindow);
}
var setInfoWindow = function(data,lnglat,ishow){
	var title="勤务社区详情";
	var content = '<div style="width: 320px; border: solid 1px silver;"><div style="position: relative;background: none repeat scroll 0 0 #F9F9F9; '
		+' border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;"><div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;'
		+'line-height: 31px;padding: 0 10px;">勤务社区详情</div><img src="../assets/images/close2.gif" style="position: absolute;'
		+'top: 10px;right: 10px;transition-duration: 0.25s;"'
		+' onclick="closeInfoWindow()"></div><div style="font-size: 12px;color: #212121;padding: 6px;line-height: 20px;background-color: #f5f5f5;'
		+'height:300px;opacity: 0.8;">'
		+'<span>编号:&nbsp;&nbsp;&nbsp;</span>'+data.gridId+'<br><span>名称:&nbsp;&nbsp;&nbsp;</span>'+data.gridName+'<br>'
		+'<span>警员:&nbsp;&nbsp;&nbsp;</span>'+data.userNames +'<br><span  style="float:left;">详情: &nbsp;&nbsp;&nbsp;</span><div  style="float:left;"><textarea rows="10" cols="30">'+data.detailInfo
		+'</textarea></div></div><div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;">'
		+'</div></div>';
	infowindow = new IMAP.InfoWindow(content,{
		size : new IMAP.Size(322,305),
		position:lnglat,
		autoPan : false,
		offset : new IMAP.Pixel(-20, -30),
		anchor:IMAP.Constants.LEFT_CENTER,
		type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
	});
	map.getOverlayLayer().addOverlay(infowindow);
	/*if(!ishow){
		infowindow.visible(false);
	}else{
		infowindow.visible(true);
	}*/
	infowindow.autoPan(true);
}
var dutyGridPolygonOthers = [];
var infoLabelOthers = [];
var loadGrid = function(){
	vm.clearOtherDutyGrids();
	$.get("../qw/dutyGrid/findOtherList?groupId="+vm.groudId, function(r){
		if(r.code == 200){
			vm.dutyGridOtherList = r.dutyGridOtherList;
			for(var idx =0; idx < vm.dutyGridOtherList.length; idx++){
				var dutyGridOther = vm.dutyGridOtherList[idx];
				var polygonPathOther = polygonStr2Path(dutyGridOther.shape);
				var polygonOpt = {
						'editabled': false,
						"fillColor" : '#6699cc',
						"fillOpacity " : 0.5,
						"strokeColor  " : '#8B7B8B',
						"strokeOpacity" : 1,
						"strokeWeight" : 2,
						"strokeStyle" : "solid",
					};
				polygonOpt.fillColor = dutyGridOther.fillColor;
				var dutyGridPolygonOther = new IMAP.Polygon(polygonPathOther, polygonOpt);
				dutyGridPolygonOther.data = dutyGridOther;
				dutyGridPolygonOther.addEventListener(IMAP.Constants.MOUSE_DOWN, function(e){
	    			//alert("test");
	    			var center = e.target.getBounds().getCenter();
	    			map.setCenter(center);
					var data = e.target.data;
					setInfoWindow(data,center,false);
	    		});
				map.getOverlayLayer().addOverlay(dutyGridPolygonOther, false);
				dutyGridPolygonOthers.push(dutyGridPolygonOther);
				
				var infoLabel = new IMAP.Label(dutyGridOther.group.groupName+"<br/>("+dutyGridOther.gridName+")", {
					position : dutyGridPolygonOther.getBounds().getCenter(),// 基点位置
					offset: new IMAP.Pixel(0,-25),//相对于基点的位置
					anchor : IMAP.Constants.TOP_CENTER,
					fontSize : 12,
					fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
					fontColor : "#222222"
				});
				map.getOverlayLayer().addOverlay(infoLabel, false);
				infoLabelOthers.push(infoLabel);
			}
		}else{
			alert(r.msg);
		}
	});
	
}
//获得随机时间
var getRandomNum = function(){
	return (new Date()).getTime();
}

//字符串转面积点数组
var polygonStr2Path = function(polygonStr) {
	var lngLatArray= [];
	if(polygonStr){
		polygonStr= polygonStr.trim();
		var polygonArr = polygonStr.split(" ");
		for (var i = 0; i < polygonArr.length; i++) {
			var lnglatStr = polygonArr[i];
			var lnglatArr = lnglatStr.split(",");
			lngLatArray.push(new IMAP.LngLat(lnglatArr[0],lnglatArr[1]));
		}
	}
	return lngLatArray;
}
function getCountDays(str) {
	var day = str.split(' ');
    //获取日期部分的年月日
    var days = day[0].split('-');
    //获取时间部分的 时分秒
    var mi = day[day.length - 1].split(':');
   var date = new Date();
   //给date赋值  年月日
   date.setUTCFullYear(days[0], days[1] - 1, days[2]);
   //给date赋值 时分秒  首先转换utc时区 ：+8      
   date.setUTCHours(mi[0] - 8, mi[1], mi[2]);
   var curMonth = date.getMonth();
   date.setMonth(curMonth + 1);
   date.setDate(0);
   return date.getDate();
}
