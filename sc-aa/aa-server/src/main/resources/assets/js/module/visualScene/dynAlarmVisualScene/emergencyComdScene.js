$(function () {
	
	initMap();
	initWarnAlarm();
	initAllDev();
	setInterval(initAllDev, 60000);//一分钟一次
	setInterval(initWarnAlarm, 15000);//每15秒一次
});

var app = new Vue({
	el : '#imptDiv',
	data : {
		warnAlarmList:[],
		allGpsDevList:[],
		allRadioDevList:[]
	}
});

var initAllDev = function(){
	getAllJwtDev();
	getAllRadioDev();
	initOnlinePoliceJwt();
	initOnlinePoliceDt();
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
	map = new IMAP.Map("mapContainer", mapOpt); //地图实例化
	map.plugin(['IMAP.Tool']);//下载插件

    //################################图盟蓝色路网图层################################
    var trafficLayer = new IMAP.TileLayer({
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
	}

    //地图控件
	var scale = new IMAP.ScaleControl({
		anchor : IMAP.Constants.LEFT_BOTTOM
	});
	scale.visible(true);
    return map;
}

var points = new Map();//覆盖物列表
var dataList = [];//数据列表
var jwtOpts = new IMAP.MarkerOptions();
jwtOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
//gblMapObjs.jwtDataCluster;//聚合图
var icon_police = new IMAP.Icon("../../../../images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
// 初始化在线警力信息
var initOnlinePoliceJwt = function(){
	clear();
	var url = "../../../../../jw/gpsDevice/searchAllJWTInfo";
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rstl){
	    	if(rstl.code === 200){
				dataList = rstl.gpsDeviceList;
				applyDataToUI();
			}else{
				alert(rstl.msg);
			}
		}
	});
};

var dTpoints = new Map();//覆盖物列表
var dTdataList = [];//数据列表
var dTOpts = new IMAP.MarkerOptions();
dTOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
//gblMapObjs.jwtDataCluster;//聚合图
var icon_dT = new IMAP.Icon("../../../../images/350M3.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
// 初始化在线警力信息
var initOnlinePoliceDt = function(){
	clear();
	var url = "../../../../../jw/gpsDevice/searchRadioInfo";
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rstl){
	    	if(rstl.code === 200){
	    		dTdataList = rstl.gpsDeviceList;
	    		dTapplyDataToUI();
			}else{
				alert(rstl.msg);
			}
		}
	});
};

var dTapplyDataToUI = function() {
	if(isIE9Browser()){
		if(dTpoints.size() >0){
			for(var i = 0; i < dTdataList.length; i++){
				var dT = dTdataList[i];
				if(dT.status != '0'){
					continue;
				}
				if(dTpoints.get(dT.gpsId)){
					var pointMarker = dTpoints.get(dT.gpsId);
					var lnglat=new IMAP.LngLat(dT.longitude,dT.latitude);
					if(lnglat){
						pointMarker.setIcon(icon_dT);
						pointMarker.setPosition(lnglat);
						pointMarker.data = dT;
					}
				}
			}
		}else{
			var pointsCluster = [];
			for(var i = 0; i < dTdataList.length; i++){
				var dT = dTdataList[i];
				if(dT.status != '0'){
					continue;
				}
				//第一次加载
				var point = new IMAP.Marker(new IMAP.LngLat(dT.longitude, dT.latitude), dTOpts);
				point.setIcon(icon_dT);
				point.data = dT;
				dTpoints.set(dT.gpsId,point);
				map.getOverlayLayer().addOverlay(point, false);
				point.setTitle(dT.radioName);
				pointsCluster.push(point);
			}
		}
	}else{
		if(dTpoints.size >0){
			for(var i = 0; i < dTdataList.length; i++){
				var dT = dTdataList[i];
				if(dT.status != '0'){
					continue;
				}
				if(dTpoints.get(dT.gpsId)){
					var pointMarker = dTpoints.get(dT.gpsId);
					var lnglat=new IMAP.LngLat(dT.longitude,dT.latitude);
					if(lnglat){
						pointMarker.setIcon(icon_dT);
						pointMarker.setPosition(lnglat);
						pointMarker.data = dT;
					}
				}
			}
		}else{
			var pointsCluster = [];
			for(var i = 0; i < dTdataList.length; i++){
				var dT = dTdataList[i];
				if(dT.status != '0'){
					continue;
				}
				//第一次加载
				var point = new IMAP.Marker(new IMAP.LngLat(dT.longitude, dT.latitude), dTOpts);
				point.setIcon(icon_dT);
				point.data = dT;
				dTpoints.set(dT.gpsId,point);
				map.getOverlayLayer().addOverlay(point, false);
				point.setTitle(dT.radioName);
				pointsCluster.push(point);
			}
		}
	}
	
};

var applyDataToUI = function() {
	if(isIE9Browser()){
		if(points.size() >0){
			for(var i = 0; i < dataList.length; i++){
				var police = dataList[i];
				if(police.status != '0'){
					continue;
				}
				if(points.get(police.gpsId)){
					var pointMarker = points.get(police.gpsId);
					var lnglat=new IMAP.LngLat(police.longitude,police.latitude);
					if(lnglat){
						pointMarker.setIcon(icon_police);
						pointMarker.setPosition(lnglat);
						pointMarker.data = police;
					}
				}
			}
		}else{
			var pointsCluster = [];
			for(var i = 0; i < dataList.length; i++){
				var police = dataList[i];
				if(police.status != '0'){
					continue;
				}
				//第一次加载
				var point = new IMAP.Marker(new IMAP.LngLat(police.longitude, police.latitude), jwtOpts);
				point.setIcon(icon_police);
				point.data = police;
				points.set(police.gpsId,point);
				map.getOverlayLayer().addOverlay(point, false);
				point.setTitle(police.policeName);
				pointsCluster.push(point);
			}
		}
	}else{
		if(points.size >0){
			for(var i = 0; i < dataList.length; i++){
				var police = dataList[i];
				if(police.status != '0'){
					continue;
				}
				if(points.get(police.gpsId)){
					var pointMarker = points.get(police.gpsId);
					var lnglat=new IMAP.LngLat(police.longitude,police.latitude);
					if(lnglat){
						pointMarker.setIcon(icon_police);
						pointMarker.setPosition(lnglat);
						pointMarker.data = police;
					}
				}
			}
		}else{
			var pointsCluster = [];
			for(var i = 0; i < dataList.length; i++){
				var police = dataList[i];
				if(police.status != '0'){
					continue;
				}
				//第一次加载
				var point = new IMAP.Marker(new IMAP.LngLat(police.longitude, police.latitude), jwtOpts);
				point.setIcon(icon_police);
				point.data = police;
				points.set(police.gpsId,point);
				map.getOverlayLayer().addOverlay(point, false);
				point.setTitle(police.policeName);
				pointsCluster.push(point);
			}
		}
	}
	
};

//清除数据
var clear = function() {
	//清除界面
	if(isIE9Browser()){
		if(points.size() >0){
			points.forEach(function(item,key,mapObj){
				map.getOverlayLayer().removeOverlay(item);
			});
		}
		if(dTpoints.size() >0){
			dTpoints.forEach(function(item,key,mapObj){
				map.getOverlayLayer().removeOverlay(item);
			});
		}
	}else{
		if(points.size >0){
			points.forEach(function(item,key,mapObj){
				map.getOverlayLayer().removeOverlay(item);
			});
		}
		if(dTpoints.size >0){
			dTpoints.forEach(function(item,key,mapObj){
				map.getOverlayLayer().removeOverlay(item);
			});
		}
	}
	
	points=new Map();
	dTpoints=new Map();
	dataList = [];
	dTdataList = [];
};

// 警情信息一览
var initWarnAlarm = function(){
	/*var startDt = new Date();
	startDt.setHours(0);
	startDt.setMinutes(0);
	startDt.setSeconds(0);
	startDt = formatDateTime(startDt);*/
	var url = "../../../../../jw/policeTask/getLastedImportAlarmTask";
	$.ajax({
		type: "GET",
	    url: url,
	    async :false,
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var tb = document.getElementById('importantAlarmTB');
	    		$("#importantAlarmTB  tr").empty();
	    		if(rslt.alarmList && rslt.alarmList.length > 0){
	    			app.warnAlarmList = rslt.alarmList;
	    			$.each(rslt.alarmList, function(i,item){
						var r1=tb.insertRow(i);
						r1.id = i;
						var c1=r1.insertCell(0);
						c1.innerHTML="<span class='titleHL'>"+item.eventDtStr+" 【"+item.eventAddr+"】</span><br/><span>"+item.eventContent+"</span>";
					});
	    		}
	    		$("#importantAlarmTB  tr").addClass('pconcent');
	    		$("#importantAlarmTB  td").addClass('fa fa-caret-right');
	    		$("#importantAlarmTB").on('click', 'tr',function(){
	    			var alarm = app.warnAlarmList[$(this).attr('id')];
	    			drawAlarm(alarm);
	    		});
			}else{
				alert(rslt.msg);
			}
		}
	});
}

var drawAlarm = function(alarm){
	if(marker){
		map.getOverlayLayer().removeOverlay(marker);
	}
	
	if(typeof(alarm.longitude)=='undefined'){
		layer.msg("该警情无位置信息！");
		return;
	}
	
	var opts=new IMAP.MarkerOptions();
	opts.anchor = IMAP.Constants.BOTTOM_CENTER;
	opts.icon=new IMAP.Icon("../../../../images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
	var lnglat=new IMAP.LngLat(alarm.longitude, alarm.latitude);
	if(lnglat){
		map.setCenter(lnglat);
		marker=new IMAP.Marker(lnglat, opts);
		map.getOverlayLayer().addOverlay(marker, true);
		marker.data = alarm;
	}
	if (!marker) {return;}
	marker.addEventListener(IMAP.Constants.CLICK, function(e) {
		var pos = new IMAP.LngLat(e.target.data.longitude, e.target.data.latitude);
		var innerHtml = '<div style="padding:0px 0px 0px 4px;"><b><i>报警时间:</i></b> '+e.target.data.eventDtStr+'<br><b><i>案发地址:</i></b> '+e.target.data.eventAddr
		+'<br><b><i>警情详情:</i></b> '+ e.target.data.eventContent+'</div>';
		infowindow = new IMAP.InfoWindow(innerHtml,{
			size:new IMAP.Size(300,170),
			offset:new IMAP.Pixel(-5,-35),
			title:e.target.data.eventAbsDesc,
			visible:true,
			position:pos
		});
		
		map.getOverlayLayer().addOverlay(infowindow);
		infowindow.autoPan(true);
    });
}

var getAllJwtDev = function(){
	//layer.load();
	$.ajax({
		type: "GET",
	    url: "../../../../../jw/gpsDevice/searchAllJWTInfo",
	    async :false,
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		app.allGpsDevList = rslt.gpsDeviceList;
			}else{
				alert(rslt.msg);
			}
		}
	});
};

var getAllRadioDev = function(){
	$.ajax({
		type: "GET",
	    url: "../../../../../jw/gpsDevice/searchRadioInfo",
	    async :false,
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var allDevList = rslt.gpsDeviceList;
	    		app.allRadioDevList = rslt.gpsDeviceList;
			}else{
				alert(rslt.msg);
			}
		}
	});
};

var formatDate = function(DateIn) {
	var Year = 0;
	var Month = 0;
	var Day = 0;

	var CurrentDate = "";
	// 初始化时间
	Year = DateIn.getFullYear();
	Month = DateIn.getMonth() + 1;
	Day = DateIn.getDate();

	CurrentDate = Year + "-";
	if (Month >= 10) {
		CurrentDate = CurrentDate + Month + "-";
	} else {
		CurrentDate = CurrentDate + "0" + Month + "-";
	}
	if (Day >= 10) {
		CurrentDate = CurrentDate + Day;
	} else {
		CurrentDate = CurrentDate + "0" + Day;
	}
	return CurrentDate;
}

var formatDateTime = function(date) {
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }
	    
    var hours = date.getHours();
	var mins = date.getMinutes();
	var secs = date.getSeconds();
	var msecs = date.getMilliseconds();
	if (hours < 10){
		hours = "0" + hours;
	}
	if (mins < 10){
		mins = "0" + mins;
	}
	if (secs < 10){
		secs = "0" + secs;
	}
	if (msecs < 10){
		secs = "0" + msecs;  
	}
    
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + day
            + " " + hours + seperator2 + mins + seperator2 + secs;
    return currentdate;
}

var addDate = function(date, n) {
	date.setDate(date.getDate() + n);
	return date;
}

var setDate = function(date) {
	currentFirstDate = new Date(date);
	return date;
}

var isIE9Browser = function(){
	var isIE = false;
	var userAgent = navigator.userAgent.toLowerCase();
	if(!!window.ActiveXObject || "ActiveXObject" in window){
		var reIE = new RegExp("msie (\\d+\\.\\d+);");
		reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if(fIEVersion == 9) {
        	isIE = true;
        }  
	}
	return isIE;
};