$(function () {
	sessionTimeOutConfig();
	
	var sumjing;
	var sumdu;
	var sumwei;
	var sumshi;
	//initPage();
	initMap();
	getNowWeather();
	initAllCharts();
	initWarnAlarm();
	initOnlinePoliceJwt();
	initOnlinePoliceDt();
	setInterval(getCurSysTime, 1000);//每秒一次
	setInterval(initWarnAlarm, 17000);//每17秒一次
	setInterval(initAllCharts, 48000);//8分钟一次
	setInterval(getNowWeather, 3600000);//1小时一次
	setInterval(initOnlinePoliceJwt, 53000); //53秒一次
	setInterval(initOnlinePoliceDt, 62000); //一分钟零2秒一次

	//------------
	//bb();
});

function sessionTimeOutConfig() {
	//全局配置超时重新登录
	$.ajaxSetup({
	    complete:function(xhr,textStatus){
	    	if(xhr.status==0){
	             alert("登录超时！请重新登录！");
	             window.location.href = getCtx()+"login";
	        }
	        if(xhr.responseText.indexOf('<title>登录</title>') != -1){
	             alert("登录超时！请重新登录！");
	             window.location.href = getCtx()+"login";
	        } 
	    }
	});
}

function getdataa() {
    show_num1(sumdu);
}
function getdatab() {
    show_num2(sumjing);
}
function getdatac() {
    show_num3(sumwei);
}
function getdatad() {
    show_num4(sumshi);
}

function show_num1(n) {
    var it = $("#total1 .t_num i");
    var len = String(n).length;
    for (var i = 0; i < len; i++) {
        if (it.length <= i) {
            $("#total1 .t_num").append("<i></i>");
        }
        var num = String(n).charAt(i);
        var y = -parseInt(num) * 30;
        var obj = $("#total1 .t_num i").eq(i);
        obj.animate({
            backgroundPosition: '(0 ' + String(y) + 'px)'
        }, 'slow', 'swing', function () { }
        );
    }
}
function show_num2(n) {
    var it = $("#total2 .t_num i");
    var len = String(n).length;
    for (var i = 0; i < len; i++) {
        if (it.length <= i) {
            $("#total2 .t_num").append("<i></i>");
        }
        var num = String(n).charAt(i);
        var y = -parseInt(num) * 30;
        var obj = $("#total2 .t_num i").eq(i);
        obj.animate({
            backgroundPosition: '(0 ' + String(y) + 'px)'
        }, 'slow', 'swing', function () { }
        );
    }
}
function show_num3(n) {
    var it = $("#total3 .t_num i");
    var len = String(n).length;
    for (var i = 0; i < len; i++) {
        if (it.length <= i) {
            $("#total3 .t_num").append("<i></i>");
        }
        var num = String(n).charAt(i);
        var y = -parseInt(num) * 30;
        var obj = $("#total3 .t_num i").eq(i);
        obj.animate({
            backgroundPosition: '(0 ' + String(y) + 'px)'
        }, 'slow', 'swing', function () { }
        );
    }
}
function show_num4(n) {
    var it = $("#total4 .t_num i");
    var len = String(n).length;
    for (var i = 0; i < len; i++) {
        if (it.length <= i) {
            $("#total4 .t_num").append("<i></i>");
        }
        var num = String(n).charAt(i);
        var y = -parseInt(num) * 30;
        var obj = $("#total4 .t_num i").eq(i);
        obj.animate({
            backgroundPosition: '(0 ' + String(y) + 'px)'
        }, 'slow', 'swing', function () { }
        );
    }
}
/*function aa(){
	NumbersAnimate.Target = $(".countup1");
	NumbersAnimate.Numbers = sumdu;
	NumbersAnimate.Duration = 1500;
	NumbersAnimate.Animate();
}
function bb(){
	NumbersAnimate.Target = $(".countup2");
	NumbersAnimate.Numbers = sumjing;
	NumbersAnimate.Duration = 1500;
	NumbersAnimate.Animate();
}
function cc(){
	NumbersAnimate.Target = $(".countup3");
	NumbersAnimate.Numbers = sumwei;
	NumbersAnimate.Duration = 1500;
	NumbersAnimate.Animate();
}
function dd(){
	NumbersAnimate.Target = $(".countup4");
	NumbersAnimate.Numbers = sumshi;
	NumbersAnimate.Duration = 1500;
	NumbersAnimate.Animate();
}*/

var NumbersAnimate = {
		Target: null,
		Numbers: 0,
		Duration: 500,
		Animate: function () {
			var array = NumbersAnimate.Numbers.toString().split("");
			//遍历数组
			for (var i = 0; i < array.length; i++) {
				var currentN = array[i];
				//数字append进容器
				var t = $("<span></span>");
				$(t).append("<span class=\"childNumber\">" + array[i] + "</span>");
				$(t).css("margin-left", 10 * i + "px");
				$(NumbersAnimate.Target).append(t);
				//生成滚动数字,根据当前数字大小来定
				for (var j = 0; j <= currentN; j++) {
					var tt;
					if (j == currentN) {
						tt = $("<span class=\"main\"><span>" + j + "</span></span>");
					} else {
						tt = $("<span class=\"childNumber\">" + j + "</span>");
					}
					$(t).append(tt);
					$(tt).css("margin-top", (j + 1) * 20 + "px");
				}
				$(t).animate({
					marginTop: -((parseInt(currentN) + 1) * 20) + "px"
				}, NumbersAnimate.Duration, function () {
					$(this).find(".childNumber").remove();
				});
			}
		},
		ChangeNumber: function (numbers) {
			var oldArray = NumbersAnimate.Numbers.toString().split("");
			var newArray = numbers.toString().split("");
			for (var i = 0; i < oldArray.length; i++) {
				var o = oldArray[i];
				var n = newArray[i];
				if (o != n) {
					var c = $($(".main")[i]);
					var num = parseInt($(c).html());
					var top = parseInt($($(c).find("span")[0]).css("marginTop").replace('px', ''));

					for (var j = 0; j <= n; j++) {
						var nn = $("<span>" + j + "</span>");
						if (j == n) {
							nn = $("<span>" + j + "</span>");
						} else {
							nn = $("<span class=\"yy\">" + j + "</span>");
						}
						$(c).append(nn);
						$(nn).css("margin-top", (j + 1) * 20 + top + "px");
					}
					var margintop = parseInt($(c).css("marginTop").replace('px', ''));
					$(c).animate({
						marginTop: -((parseInt(n) + 1) * 20) + margintop + "px"
					}, NumbersAnimate.Duration, function () {
						$($(this).find("span")[0]).remove();
						$(".yy").remove();
					});
				}
			}
			NumbersAnimate.Numbers = numbers;
		},

		RandomNum: function (m, a) {
			var Range = a - m;
			var Rand = Math.random();
			return (m + Math.round(Rand * Range));
		}
	}

var initAllCharts = function(){
	//initOnlinePoliceDt();
	//initOnlinePoliceJwt();
	initViolateByTeam();
	initEchartByPolice();
	findAllDevCnt();
	initDynData();
	violateTypeStatistics();
//	statisticsJtsgType();
	statisticsHistoryJam();
	statisticsJlOnline();
	initDevOnlineChart();
	statisticsGpsDevHour2OnlineCnt();
//	statisticsAvaSchedule();
	//-------------
	
}


var app = new Vue({
	el : '#imptDiv',
	data : {
		teamList:[], //任务结果
		alarmStatics:{},
		warnAlarmList:[],
		importantAlarmList:[],
		nameArray:[],
		valueArray:[],
		richiValueArray:[],
		devOnlineRate:{signal:"",ep:"",cam:"",vms:""}
	}
});

//初始化页面
/*var initPage = function(){
	$.get("../../../../../jw/policeTask/getAllTeams", function(r){
    	if(r.code == 200){
    		app.teamList = r.teamList;
    	}else{
    		alert(r.msg);
    	}
    });
	
	//下拉框改变值触发事件
	$("#teamSelected").change(function(){
		initWarnAlarm();
	});
}*/

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

var jwtPoints = new Map();
var jwtDataList = [];
var jwtInfoLabels = [];//jwt标签列表
var jwtOpts = new IMAP.MarkerOptions();
jwtOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
var icon_police = new IMAP.Icon("../../../../images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
// 初始化在线警力信息
var initOnlinePoliceJwt = function(){
	clear();
	var url = "../../../../../jw/gpsDevice/searchAllJWTInfo";
	url += "?groupName="+encodeURIComponent('所有部门');
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rstl){
	    	if(rstl.code === 200){
				jwtDataList = rstl.gpsDeviceList;
				//因为设备需要定时刷新点位，所以不加下面的信息提示
				/*if(null === jwtDataList || jwtDataList.length === 0){
	        		layer.msg("无任何记录！");
	        		return;
	        	}*/
				jwtApplyDataToUI();
			}else{
				//alert(rstl.msg);
			}
		}
	});
};

var dtPoints = new Map();//覆盖物列表
var dtDataList = [];//数据列表
var dtInfoLabels = [];//radio标签列表
var dTOpts = new IMAP.MarkerOptions();
dTOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
var icon_dT = new IMAP.Icon("../../../../images/350M3.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
// 初始化在线警力信息
var initOnlinePoliceDt = function(){
	clear();
	var url = "../../../../../jw/gpsDevice/searchRadioInfo";
	url += "?groupName="+encodeURIComponent('所有部门');
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rstl){
	    	if(rstl.code === 200){
	    		dtDataList = rstl.gpsDeviceList;
	    		dtApplyDataToUI();
			}else{
				//alert(rstl.msg);
			}
		}
	});
};

var jwtApplyDataToUI = function() {
	//第一次加载
	if((isIE9Browser() && jwtPoints.size() == 0) || (!isIE9Browser() && jwtPoints.size == 0)){
		for(var i = 0; i < jwtDataList.length; i++){
			var police = jwtDataList[i];
			if(police.status != '0'){
				continue;
			}
			var labelName = police.policeName;
			if(!labelName){
				labelName = police.policeNo;	
			}
			var point = new IMAP.Marker(new IMAP.LngLat(police.longitude, police.latitude), jwtOpts);
			point.setIcon(icon_police);
			point.data = police;
			map.getOverlayLayer().addOverlay(point, false);
			point.setTitle(labelName);
			jwtPoints.set(police.gpsId,point);
			
			var infoLabel = new IMAP.Label(labelName, {
				position : new IMAP.LngLat(police.longitude, police.latitude),// 基点位置
				offset: new IMAP.Pixel(0,-60),//相对于基点的位置
				anchor : IMAP.Constants.TOP_CENTER,
				fontSize : 15,
				fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
				fontColor : "#222222"
			});
			map.getOverlayLayer().addOverlay(infoLabel, false);
			jwtInfoLabels.push(infoLabel);
		}
	}
	//定时任务加载
	if((isIE9Browser() && jwtPoints.size() > 0) || (!isIE9Browser() && jwtPoints.size > 0) ){
		for(var i = 0; i < jwtDataList.length; i++){
			var police = jwtDataList[i];
			if(police.status != '0'){
				continue;
			}
			if(jwtPoints.get(police.gpsId)){
				var pointMarker = jwtPoints.get(police.gpsId);
				var lnglat=new IMAP.LngLat(police.longitude,police.latitude);
				if(lnglat){
					pointMarker.setIcon(icon_police);
					pointMarker.setPosition(lnglat);
					pointMarker.data = police;
				}
			}
		}
	}
};

var dtApplyDataToUI = function() {
	//第一次加载
	if((isIE9Browser() && dtPoints.size() == 0) || (!isIE9Browser() && dtPoints.size == 0) ){
		for(var i = 0; i < dtDataList.length; i++){
			var dT = dtDataList[i];
			if(dT.status != '0'){
				continue;
			}
			var labelName = dT.radioName;
			if(!labelName){
				labelName = "无名称";	
			}
			var point = new IMAP.Marker(new IMAP.LngLat(dT.longitude, dT.latitude), dTOpts);
			point.setIcon(icon_dT);
			point.data = dT;
			map.getOverlayLayer().addOverlay(point, false);
			point.setTitle(labelName);
			dtPoints.set(dT.gpsId,point);

			var infoLabel = new IMAP.Label(labelName, {
				position : new IMAP.LngLat(dT.longitude, dT.latitude),// 基点位置
				offset: new IMAP.Pixel(0,-60),//相对于基点的位置
				anchor : IMAP.Constants.TOP_CENTER,
				fontSize : 15,
				fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
				fontColor : "#222222"
			});
			map.getOverlayLayer().addOverlay(infoLabel, false);
			dtInfoLabels.push(infoLabel);
		}
	}
	//定时任务加载
	if((isIE9Browser() && dtPoints.size() > 0) || (!isIE9Browser() && dtPoints.size > 0)){
		for(var i = 0; i < dtDataList.length; i++){
			var dT = dtDataList[i];
			if(dT.status != '0'){
				continue;
			}
			if(dtPoints.get(dT.gpsId)){
				var pointMarker = dtPoints.get(dT.gpsId);
				var lnglat=new IMAP.LngLat(dT.longitude,dT.latitude);
				if(lnglat){
					pointMarker.setIcon(icon_dT);
					pointMarker.setPosition(lnglat);
					pointMarker.data = dT;
				}
			}
		}
	}
	
};

//清除数据
var clear = function() {
	//清除界面
	if((isIE9Browser() && jwtPoints.size() > 0) || (!isIE9Browser() && jwtPoints.size > 0)){
		jwtPoints.forEach(function(item,key,mapObj){
			map.getOverlayLayer().removeOverlay(item);
		});

		if(jwtInfoLabels.length >0){
			for (var i = 0; i < jwtInfoLabels.length; i++) {
				map.getOverlayLayer().removeOverlay(jwtInfoLabels[i]);
			}
		}
		jwtInfoLabels = [];
	}
	if((isIE9Browser() && dtPoints.size() > 0) || (!isIE9Browser() && dtPoints.size > 0)){
		dtPoints.forEach(function(item,key,mapObj){
			map.getOverlayLayer().removeOverlay(item);
		});
		
		if(dtInfoLabels.length >0){
			for (var i = 0; i < dtInfoLabels.length; i++) {
				map.getOverlayLayer().removeOverlay(dtInfoLabels[i]);
			}
		}
		dtInfoLabels = [];
	}

	
	//清除聚合图
	/*if(gblMapObjs.jwtDataCluster){
		//dataCluster.clearMarkers();
		gblMapObjs.jwtDataCluster.clearMarkers();
	}*/
	jwtPoints=new Map();
	dtPoints=new Map();
	//清除数据
	//gblMapObjs.policeJwtMarkers =[];
	jwtDataList = [];
	dtDataList = [];
};

// 警情信息一览
var initWarnAlarm = function(){
	/*var startDt = new Date();
	startDt.setHours(0);
	startDt.setMinutes(0);
	startDt.setSeconds(0);
	startDt = formatDateTime(startDt);*/
	var url = "../../../../../jw/policeTask/getLastedAlarmTask?random="+new Date().getTime();
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var tb = document.getElementById('realTimeAlarmTB');
	    		$("#realTimeAlarmTB").empty();
	    		if(rslt.alarmList && rslt.alarmList.length > 0){
	    			app.warnAlarmList = rslt.alarmList;
	    			 var c1='';
	    			$.each(rslt.alarmList, function(i,item){
//						var r1=tb.insertRow(i);
//						r1.id = i;
//						var c1=r1.insertCell(0);
						if(item.eventLevel == '1'){
							c1=c1+"<li><span class='titleH'>"+item.eventDtStr+" 【"+item.eventAddr+"】</span><br/><span>"+item.eventContent+"</span></li>";
						}else{
							c1=c1+"<li><span class='titleHL'>"+item.eventDtStr+" 【"+item.eventAddr+"】</span><br/><span>"+item.eventContent+"</span></li>";
						}
					});
					$("#realTimeAlarmTB").html(c1);
					gundong();
	    		}
	    		$("#realTimeAlarmTB  li").addClass('pconcent');
	    		$("#realTimeAlarmTB  li").addClass('fa fa-caret-right');
	    		$("#realTimeAlarmTB").on('click', 'li',function(){
	    			var alarm = app.warnAlarmList[$(this).attr('id')];
	    			drawAlarm(alarm);
	    		});
			}else{
				//alert(rslt.msg);
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

//设备状态统计
var findAllDevCnt = function(){
	var url = "../../../../../dynScene/calAllDevOnlineCnt";
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		if(rslt.alarmStatics){
	    			app.alarmStatics = rslt.alarmStatics;
	    			//$("#testId").attr("data-percent",rslt.alarmStatics.signalOnlinePercent);
	    			app.devOnlineRate.signal = rslt.alarmStatics.signalOnlinePercent;
	    			app.devOnlineRate.ep = rslt.alarmStatics.epOnlinePercent;
	    			app.devOnlineRate.cam = rslt.alarmStatics.camOnlinePercent;
	    			app.devOnlineRate.vms = rslt.alarmStatics.vmsOnlinePercent;
	    		}
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

//事故类型统计
var statisticsHistoryJam = function(){
	var startDt = formatDateTime000(setDate(addDate(new Date(),-30)));
	var endDt = formatDateTime(new Date());
	var vLdlx='';
	var url = "../../../../../jtzx/linkJam/getLatest7DayJam?startDt="+startDt+"&endDt="+endDt+"&vLdlx="+vLdlx;
	$.ajax({
		url: url,
		type: 'GET',
		success: function(rslt){
			if(rslt.code == 200){
				var nameArray = [];
				var valueArray = [];
			    if(rslt.chartVOList && rslt.chartVOList.length>0) {
				    for(x in rslt.chartVOList){
				    	if(x >= 8){
				    		break;
				    	}
				    	nameArray.push(rslt.chartVOList[x].name);
				    	valueArray.push(rslt.chartVOList[x].value);
				    }
				    chartOpt = {
					    tooltip : {
					        trigger: 'axis'
					    },
					    grid:{
					    	top:10,
					    },
					    xAxis : [
					        {
					            type : 'category',
					            data : nameArray, 
					            axisLabel: {
			    	                interval: 0,
			    	                rotate: 90,
			    	                fontSize: 10
			    	            },
			    	            splitLine:{show: false},//去除网格线
			    	            offset:0
					        }
					    ],
					    yAxis : [
					        {
					            type : 'value',
			    	            splitLine:{show: false},//去除网格线
					        }
					    ],
				        series: [
				        	{
				        		smooth:true,
					            type: 'bar',
					            barWidth : 15,
					            barCateGoryGap:5,
					            data: valueArray
					        }
				        ]
					};
		    		var chartTmp = echarts.init(document.getElementById('shiGuDiv'), 'walden');
	    			chartTmp.setOption(chartOpt);
				}
			}else{
				//alert(rslt.msg);
			}
		},
		error: function(r1, r2, r3){
			
		}
	});
}

//统计各中队违法数据
var initViolateByTeam = function(){
	$.ajax({
		type: "GET",
	    url: "../../../../../qw/violationPunish/getPunishStatByTeam",
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var punishList = rslt.punishList;
	    		if(punishList && punishList.length>0) {
	    			var myChart = echarts.init(document.getElementById('weifaDiv'), 'walden');
					/*var nameArray1 = [];
					var valueArray1 = [];
				    for(x in punishList){
				    	nameArray1.push(punishList[x].groupName);
				    	valueArray1.push(punishList[x].totalViolatedCnt);
				    }*/
	    			var option = {};
		    		option = {
		    			/* pie */
		    			tooltip : {
	    			        trigger: 'item',
	    			        formatter: "{a} <br/>{b} : {c} ({d}%)"
	    			    },
	    			    series : [
	    			        {
	    			            name: '违法总数',
	    			            type: 'bar',
	    			            type: 'pie',
	    			            radius : '55%',
	    			            center: ['50%', '60%'],
	    			            data:[
					                {value:punishList[0].totalViolatedCnt, name:punishList[0].groupName},
					                {value:punishList[1].totalViolatedCnt, name:punishList[1].groupName},
					                {value:punishList[2].totalViolatedCnt, name:punishList[2].groupName},
					                {value:punishList[3].totalViolatedCnt, name:punishList[3].groupName},
					                {value:punishList[4].totalViolatedCnt, name:punishList[4].groupName},
					                {value:punishList[5].totalViolatedCnt, name:punishList[5].groupName},
					                {value:punishList[6].totalViolatedCnt, name:punishList[6].groupName},
					                {value:punishList[7].totalViolatedCnt, name:punishList[7].groupName}
					            ],
	    			            itemStyle: {
	    			                emphasis: {
	    			                    shadowBlur: 10,
	    			                    shadowOffsetX: 0,
	    			                    shadowColor: 'rgba(0, 0, 0, 0.5)'
	    			                }
	    			            }
	    			        }
				        	
	    			    ],
					    /*tooltip : {
					        trigger: 'axis'
					    },
					    grid:{
					    	top:10,
					    },
	    			    xAxis : [
					        {
					            type : 'category',
					            data : nameArray1, 
					            axisLabel: {
			    	                interval: 0,
			    	                rotate: 45,
			    	                fontSize: 10
			    	            },
			    	            splitLine:{show: false},//去除网格线
			    	            offset:0
					        }
					    ],
					    yAxis : [
					        {
					            type : 'value',
			    	            splitLine:{show: false},//去除网格线
					        }
					    ],
				        series: [
				        	{
				        		smooth:true,
					            type: 'bar',
					            data: valueArray1
					        }
				        ]*/
		    		};
		    	    myChart.setOption(option);
	    		}
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

//统计警员统计工作量
var initEchartByPolice = function(){
	// init echart
	$.ajax({
		type: "GET",
	    url: "../../../../../jw/policeTask/calAlarmByPolice?timeUnit=DAY&startDt="+formatDate(new Date()),
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var alarmStaticsByPolice = rslt.alarmStaticsByPolice;
	    		/*if(typeof(alarmStaticsByPolice) == 'undefined') {
	    			var myChart = echarts.init(document.getElementById('byPeopleDiv'), 'walden');
	    			var option = {};
	    			myChart.setOption(option);
	    			return;
	    		}*/
	    		// 基于准备好的dom，初始化echarts实例
	    	    var myChart = echarts.init(document.getElementById('byPeopleDiv'), 'walden');
	    	    var option = {};
	    	    if(alarmStaticsByPolice.nameList.length>0){
	    	    	// 指定图表的配置项和数据
		    		option = {
	    			    /*title : {
	    			        text: '警员工作量统计',
	    			        x:'center'
	    			    },*/
	    			    tooltip : {
	    			        trigger: 'item',
	    			        formatter: "{a} <br/>{b} : {c} ({d}%)"
	    			    },
	    			   /* legend: {
	    			        type: 'scroll',
	    			        orient: 'horizontal',
	    			        right: 10,
	    			        top: 20,
	    			        bottom: 0,
	    			        data: alarmStaticsByPolice.nameList
	    			    },*/
	    			    series : [
	    			        {
	    			            name: '姓名',
	    			            type: 'pie',
	    			            radius : '55%',
	    			            center: ['40%', '50%'],
	    			            data: alarmStaticsByPolice.valueList,
	    			            itemStyle: {
	    			                emphasis: {
	    			                    shadowBlur: 10,
	    			                    shadowOffsetX: 0,
	    			                    shadowColor: 'rgba(0, 0, 0, 0.5)'
	    			                }
	    			            }
	    			        }
	    			    ]
	    			};
	    	    }
	    	    // 使用刚指定的配置项和数据显示图表。
	    	    myChart.setOption(option);
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

//今日XX数统计
var upHtml = '<img style="width:16px;height:16px" src="../../../../images/upupred.gif"/>';
var downHtml = '<img style="width:16px;height:16px" src="../../../../images/downdown.gif"/>';

var initDynData = function(){
	var url = "../../../../../dynScene/calAllDynData";
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var dynDataVO = rslt.dynDataVO;
	    		//今日过车总数(分大华过车、世跃过车)
	    		$("#vehPassTotal").html(dynDataVO.trafficFlowTotal);  //活跃过车数
	    		$("#vehPassSY").html(dynDataVO.trafficFlowShiyue);
	    		$("#vehPassDH").html(dynDataVO.trafficFlowDahua);
	    		$("#alertVeh").html(dynDataVO.alertVehTotalCnt);
	    		//上周历史平均过车总数(分大华过车、世跃过车)
	    		$("#vehPassWeekAvgSY").html(dynDataVO.shiyueAvgFlowCnt);
	    		$("#vehPassWeekAvgDH").html(dynDataVO.dahuaAvgFlowCnt);
	    		//今日拥堵数
	    		$(".countup1").html("");
	    		/**/
	    		$("#todayJamVal").html(dynDataVO.totalJamCnt);
	    		sumdu=dynDataVO.totalJamCnt;
	    		getdataa();
	    		setInterval('getdataa()', 3000);
	    		$("#yesterdayJamVal").html(dynDataVO.yesTotalJamCnt+(dynDataVO.totalJamCnt<=dynDataVO.yesTotalJamCnt?downHtml:upHtml));
	    		$("#lastWeekJamVal").html(dynDataVO.lastWeekTotalJamCnt+(dynDataVO.totalJamCnt<=dynDataVO.lastWeekTotalJamCnt?downHtml:upHtml));
	    		//今日警情总数
	    		$(".countup2").html("");
	    		$("#todayAlarmVal").html(dynDataVO.totalAlarmCnt);
	    		sumjing=dynDataVO.totalAlarmCnt;
	    		getdatab();
	    		setInterval('getdatab()', 3000);
	    		$("#yesterdayAlarmVal").html(dynDataVO.yesTotalAlarmCnt+(dynDataVO.totalAlarmCnt<=dynDataVO.yesTotalAlarmCnt?downHtml:upHtml));
	    		$("#lastWeekAlarmVal").html(dynDataVO.lastWeekTotalAlarmCnt+(dynDataVO.totalAlarmCnt<=dynDataVO.lastWeekTotalAlarmCnt?downHtml:upHtml));
	    		//今日违法总数
	    		$(".countup3").html("");
	    		$("#todayViolateVal").html(dynDataVO.totalViolatedCnt);
	    		sumwei=dynDataVO.totalViolatedCnt;
	    		getdatac();
	    		setInterval('getdatac()', 3000);
	    		$("#yesterdayViolateVal").html(dynDataVO.yesTotalViolatedCnt+(dynDataVO.totalViolatedCnt<=dynDataVO.yesTotalViolatedCnt?downHtml:upHtml));
	    		$("#lastWeekViolateVal").html(dynDataVO.lastWeekTotalViolatedCnt+(dynDataVO.totalViolatedCnt<=dynDataVO.lastWeekTotalViolatedCnt?downHtml:upHtml));
	    		//今日事故总数
	    		$(".countup4").html("");
	    		$("#todayAccidentVal").html(dynDataVO.totalJtsgCnt);
	    		sumshi=dynDataVO.totalJtsgCnt;
	    		getdatad();
	    		setInterval('getdatad()', 3000);
	    		$("#yesterdayAccidentVal").html(dynDataVO.yesTotalJtsgCnt+(dynDataVO.totalJtsgCnt<=dynDataVO.yesTotalJtsgCnt?downHtml:upHtml));
	    		$("#lastWeekAccidentVal").html(dynDataVO.lastWeekTotalJtsgCnt+(dynDataVO.totalJtsgCnt<=dynDataVO.lastWeekTotalJtsgCnt?downHtml:upHtml));
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

//违法类型统计
var violateTypeStatistics = function(){
	$.ajax({
		type: "GET",
	    url: "../../../../../qw/violationPunish/violatedByReasonStatistics",
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var punishVO = rslt.punishVO;
	    		/*if(punishVO.violatedTypeList == null ) {
	    			var myChart = echarts.init(document.getElementById('weifaTypeDiv'));
	    			var option = {};
	    			myChart.setOption(option);
	    			return;
	    		}*/
	    		// 基于准备好的dom，初始化echarts实例
	    	    var myChart = echarts.init(document.getElementById('weifaTypeDiv'), 'walden');
	    	    var option = {};
	    	    if(punishVO.violatedTypeList.length>0){
	    	    	 // 指定图表的配置项和数据
	    	    	option = {
    	    			series: [
    	    		        {
    	    		            name: '',
    	    		            type: 'funnel',
    	    		            left: '5',
    	    		            top: 0,
    	    		            bottom: 0,
    	    		            sort: 'ascending',
    	    		            width: '60%',
    	    		            label: {
    	    		                normal: {
    	    		                    formatter: '{b}'
    	    		                },
    	    		                emphasis: {
    	    		                    position:'inside',
    	    		                    formatter: '{b}'
    	    		                }
    	    		            },
    	    		            labelLine: {
    	    		                normal: {
    	    		                    show: false
    	    		                }
    	    		            },
    	    		            itemStyle: {
    	    		                normal: {
    	    		                    opacity: 0.7
    	    		                }
    	    		            },
    	    		            data: [
    	    		                {value: 15, name: punishVO.violatedTypeList[0]},
    	    		                {value: 30, name: punishVO.violatedTypeList[1]},
    	    		                {value: 45, name: punishVO.violatedTypeList[2]},
    	    		                {value: 60, name: punishVO.violatedTypeList[3]},
    	    		                {value: 75, name: punishVO.violatedTypeList[4]},
    	    		                {value: 90, name: punishVO.violatedTypeList[5]}
    	    		            ]
    	    		        },
    	    		        {
    	    		            name: '',
    	    		            type: 'funnel',
    	    		            left: '5',
    	    		            top: 0,
    	    		            bottom: 0,
    	    		            sort: 'ascending',
    	    		            width: '60%',
    	    		            maxSize: '80%',
    	    		            label: {
    	    		                normal: {
    	    		                    position: 'inside',
    	    		                    formatter: '{c}',
    	    		                    textStyle: {
    	    		                        color: '#fff'
    	    		                    }
    	    		                },
    	    		                emphasis: {
    	    		                    position:'inside',
    	    		                    formatter: '{b}: {c}'
    	    		                }
    	    		            },
    	    		            itemStyle: {
    	    		                normal: {
    	    		                    opacity: 0.5,
    	    		                    borderColor: '#fff',
    	    		                    borderWidth: 2
    	    		                }
    	    		            },
    	    		            data: [
    	    		            	{value: punishVO.violatedTypeValList[0], name: punishVO.violatedTypeList[0]},
    	    		            	{value: punishVO.violatedTypeValList[1], name: punishVO.violatedTypeList[1]},
    	    		                {value: punishVO.violatedTypeValList[2], name: punishVO.violatedTypeList[2]},
    	    		                {value: punishVO.violatedTypeValList[3], name: punishVO.violatedTypeList[3]},
    	    		                {value: punishVO.violatedTypeValList[4], name: punishVO.violatedTypeList[4]},
    	    		                {value: punishVO.violatedTypeValList[5], name: punishVO.violatedTypeList[5]}
    	    		            ]
    	    		        }
    	    		    ]
    	    		};

	    	    }
	    	    // 使用刚指定的配置项和数据显示图表。
	    	    myChart.setOption(option);
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

//事故类型统计
var statisticsJtsgType = function(){
	$.ajax({
		type: "GET",
	    url: "../../../../../qw/jtsg/findJtsgStatByZdSummary",
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var chartVOList = rslt.chartVOList;
	    		app.nameArray = [];
	    		app.valueArray = [];
	    		app.richiValueArray = [];
			    for(x in chartVOList){
			    	if(x >=10){//前10
			    		break;
			    	}
			    	app.nameArray.push(chartVOList[x].name);
			    	app.valueArray.push(chartVOList[x].value);
			    	app.richiValueArray.push({value: chartVOList[x].value, name: chartVOList[x].name});
			    }
	    		var myChart = echarts.init(document.getElementById('shiGuDiv'), 'walden');
				var option = {
					/*title : {
				        x: 'left',
				        text: '中队事故统计'
				    },*/
				    tooltip : {
				        trigger: 'axis'
				    },
				    grid: {
				    	top: '5%',
				        left: '3%',
				        right: '4%',
				        bottom: '10%',
				        containLabel: true
				    },
				    xAxis : [
				        {
				            type : 'category',
				            data : app.nameArray, 
				            axisLabel: {
				            	textStyle:{
				                fontSize:12 // 让字体变大
				           },
		    	                interval: 0,
		    	                rotate: 30
		    	            },
		    	            splitLine: {
		    	                show: false
		    	            }
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value',
		    	            splitLine: {
		    	                show: false
		    	            }
				        }
				    ],
			        series: [
			        	{
				            type: 'bar',
				            data: app.valueArray
				        }
			        ]
				};
	    	    // 使用刚指定的配置项和数据显示图表。
	    	    myChart.setOption(option);
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

//统计各中队警情状态
var statisticsJlOnline = function(){
	$.ajax({
		type: "GET",
	    url: "../../../../../jw/policeTask/alarmTodayStatusSummary",
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var alarmTodaySummary = rslt.alarmTodaySummary;
	    		// 基于准备好的dom，初始化echarts实例
	    		var myChart = echarts.init(document.getElementById('jqTodayDiv'), 'walden');
    			var option = {};
	    		if(alarmTodaySummary.teamList == null ) {
	    			myChart.setOption(option);
	    			return;
	    		}
	    	    // 指定图表的配置项和数据
	    		option = {
    			    tooltip : {
    			        trigger: 'axis',
    			        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
    			            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
    			        }
    			    },
    			    legend: {
    			        data: ['已分配', '未分配']
    			    },
    			    grid: {
    			        left: '3%',
    			        right: '4%',
    			        bottom: '3%',
    			        containLabel: true
    			    },
    			    yAxis:  {
    			        type: 'value',
    			        splitLine: {
	    					show: false
	    				}
    			    },
    			    xAxis: {
    			        type: 'category',
    			        splitLine: {
	    					show: false
	    				},
	    				axisLabel: {
	    					textStyle:{
				                fontSize:12 // 让字体变大
				           },
	    	                interval: 0,
	    	                rotate: 30
	    	            },
    			        data: alarmTodaySummary.teamList
    			    },
    			    series: [
    			        {
    			            name: '已分配',
    			            type: 'bar',
    			            stack: '总量',
    			            label: {
    			                normal: {
    			                    show: true,
    			                    position: 'insideRight'
    			                }
    			            },
    			            data: alarmTodaySummary.process
    			        },
    			        {
    			            name: '未分配',
    			            type: 'bar',
    			            stack: '总量',
    			            fontSize : 12,
    			            label: {
    			                normal: {
    			                    show: true,
    			                    position: 'insideRight'
    			                }
    			            },
    			            data: alarmTodaySummary.unprocess
    			        }
    			    ]
    			};
	    		
	    		/*
	    		option = {
    			    tooltip: {
    			        trigger: 'axis',
    			        axisPointer: {
    			            type: 'shadow'
    			        }
    			    },
    			    legend: {
    			        data: ['已分配', '未分配']
    			    },
    			    grid: {
    			        left: '3%',
    			        right: '4%',
    			        bottom: '3%',
    			        containLabel: true
    			    },
    			    yAxis: {
    			        type: 'value',
    			        boundaryGap: [0, 0.01],
    			        splitLine: {
	    					show: false
	    				}
    			    },
    			    xAxis: {
    			        type: 'category',
    			        splitLine: {
	    					show: false
	    				},
	    				axisLabel: {
	    	                interval: 0,
	    	                rotate: 20
	    	            },
    			        data: alarmTodaySummary.teamList
    			    },
    			    series: [
    			        {
    			            name: '已分配',
    			            type: 'bar',
    			            data: alarmTodaySummary.process
    			        },
    			        {
    			            name: '未分配',
    			            type: 'bar',
    			            data: alarmTodaySummary.unprocess
    			        }
    			    ]
    			};*/
	    	    // 使用刚指定的配置项和数据显示图表。
	    	    myChart.setOption(option);
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

//统计各中队警务通在线数量
var initDevOnlineChart = function(){
    // 指定图表的配置项和数据
	$.ajax({
		type: "GET",
	    url: "../../../../../jw/gpsDevice/devOnlineRealtimeCnt",
	    success: function(rslt){
	    	if(rslt.code === 200){
	    		var gpsDevice = rslt.gpsDevice;
	    		var myDevChart = echarts.init(document.getElementById('jlDevOnlineDiv'), 'walden');
	    		var option = {};
	    		if(gpsDevice.teamList.length >0){
	    			option = {
    	    			tooltip: {
    	    				trigger: 'axis'
    	    			},
    	    			/*legend: {
    	    				orient: 'vertical',
    	    				x:'left',
    	    				width:'70',
    	    				top:'30',
    	    				data:['警务通']//['警务通','警车']
    	    			},*/
    	    			grid: {
    	    				left: '50',
    	    				right: '4%',
    	    				top: '3%',
    	    				containLabel: true
    	    			},
    	    			xAxis: {
    	    				axisLabel: {
		    					textStyle:{
					                fontSize:12 // 让字体变大
					           },
	    	                interval: 0,
	    	                rotate: 10
		    	            },
    	    				type: 'category',
    	    				boundaryGap: false,
    	    				splitLine: {
    	    					show: false
    	    				},
    	    				data: gpsDevice.teamList
    	    			},
    	    			yAxis: {
    	    				type: 'value',
    	    				splitLine: {
    	    					show: false
    	    				}
    	    			},
    	    			series: [
    	    				{
    	    					name:'电台',
    	    					type:'line',
    	    					stack: '总量',
    	    					data:gpsDevice.valueList
    	    				}/*,
    	    				{
    	    					name:'警车',
    	    					type:'line',
    	    					stack: '总量',
    	    					data:[220, 182, 191, 234, 290, 330, 310]
    	    				}*/
    	    			]
    	    		};
	    		}
	    		myDevChart.setOption(option);
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

var statisticsGpsDevHour2OnlineCnt = function(){
	var echartUrl = getCtx()+"jw/gpsDevice/gpsDevHour2OnlineCnt?wantedHours="+2+"&totalHours="+7*24;
	$.ajax({
		url: echartUrl,
		success: function(rslt){
			if(rslt.code == 200){
				var chartTmp = echarts.init(document.getElementById('gpsOnlineDiv'), 'walden');
		    	chartTmp.setOption(getPieOpt("2H见警率", rslt.wantedCnt, rslt.totalCnt, '2小时上线', '2小时离线'));
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

var statisticsAvaSchedule= function(){
	var echartUrl = getCtx()+"qw/schedule/findAvaSchedule";
	$.ajax({
		url: echartUrl,
		success: function(rslt){
			if(rslt.code == 200){
				var chartTmp = echarts.init(document.getElementById('arrangeDiv'), 'walden');
		    	chartTmp.setOption(getPieOpt("月排班率", rslt.wantedCnt, rslt.totalCnt, '已排班', '未排班'));
			}else{
				//alert(rslt.msg);
			}
		}
	});
}

var getPieOpt = function(title, value0, value1, name0, name1) {
	var chartOpt = {
			title : {
		        x: 'center',
	        	text: title+"("+value0+"/"+value1+")",
	        	textStyle: {
	        		color:'#cae5fb',
	                fontSize: 10
	            },
		    },
	    tooltip: {
	        trigger: 'item',
	        formatter: "{b}: {c} ({d}%)"
	    },
	    series: [
	        {
	            type:'pie',
	            radius: ['50%', '70%'],
	            label: {
	                normal: {
	                    show: false,
	                    position: 'center'
	                }
	            },
	            labelLine: {
	                normal: {
	                    show: false
	                }
	            },
	            data:[
	            	{value: value0, name:name0,itemStyle: {color: '#000000'}}, 
	                {value: (value1 - value0), name:name1},
	            ]
	        }
	    ]
	};
	return chartOpt;
}

//获取天气信息
var getNowWeather = function(){
	$.ajax({
		type: "GET",
	    url: "../../../../../dynScene/getWeather",
	    //dataType: "json",
	    success: function(rslt){
	    	if(rslt.weather){
	    		var obj = $.parseJSON(rslt.weather);
				var weather = obj.HeWeather5[0];
				if(weather.status !== "ok")
					return;
				$("#weatherImg").attr("src","../../../../images/weather/"+weather.now.cond.code+".png");
				
				var title = "<h4 style='color: aqua;'>"+weather.now.tmp
				+"℃  / "+ weather.now.cond.txt +"</h4>湿度："+weather.now.hum
				+" %<br>降水量："+weather.now.pcpn
				+" mm<br>风力："+weather.now.wind.sc
				+" 级<br>风向："+weather.now.wind.dir
				+"<br>能见度："+weather.now.vis+" km";
				$("#weatherTitle").html(title);
				$("#weatherTitle").hide();
				$("#weatherDiv").mouseover(function(){
					$("#weatherTitle").show();
				});
				$("#weatherDiv").mouseout(function(){
					$("#weatherTitle").hide();
				});
				
				$("#weatherRpt").html(weather.now.tmp +"℃ ");
				var weatherLal = "<b><I>当前天气</I></b>："+weather.now.tmp+"℃；风力："+weather.now.wind.sc+" 级；风向："+weather.now.wind.dir+"；能见度： "+weather.now.vis+" km";
				$("#weatherSpan").html(weatherLal);
				
	    	}
		}
	});
}

var getCurSysTime = function(){
	var mydate = new Date();
	var myyear=mydate.getFullYear(); 
	var mymonth=mydate.getMonth()+1;//注：月数从0~11为一月到十二月 
	var mydat=mydate.getDate(); 
	var myhours=mydate.getHours(); 
	var myminutes=mydate.getMinutes(); 
	var myseconds=mydate.getSeconds() 
	var myday=mydate.getDay()//注:0-6对应为星期日到星期六 
	var xingqi 
	switch(myday) 
	{ 
		case 0:xingqi="星期日";break; 
		case 1:xingqi="星期一";break; 
		case 2:xingqi="星期二";break; 
		case 3:xingqi="星期三";break; 
		case 4:xingqi="星期四";break; 
		case 5:xingqi="星期五";break; 
		case 6:xingqi="星期六";break; 
		default:xingqi="系统错误！" 
	} 
	
	$("#curSysTimeSpan").html(myyear+" 年 "+mymonth+" 月 "+mydat+" 日  "+myhours+" 时 "+myminutes+" 分 "+myseconds+" 秒  "+ xingqi);
}

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

formatDateTime000 = function(date) {
    var seperator1 = "-";
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }
    
    var formattedDate = date.getFullYear() + seperator1 + month + seperator1 + day
            + " 00:00:00";
    return formattedDate;
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

var getCtx = function (){
    //获取当前网址，如： http://localhost:8080/a/b.jsp
    var wwwPath = window.document.location.href;
    //获取主机地址之后的目录，如： /a/b.jsp
    var pathName = window.document.location.pathname;
    var pos = wwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8080
    var localhostPath = wwwPath.substring(0, pos);
    //获取带"/"的项目名，如：/ems
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
    //获取项目的basePath   http://localhost:8080/ems/
    var basePath=localhostPath+projectName+"/";
    return basePath;
};
//gundong  
function gundong(){
	$(function () {
    //获得当前<ul>
    var $uList = $(".scroll-box");
    var timer = null;
    //触摸清空定时器
    $uList.hover(function() {
        clearInterval(timer);
	    },
	    function() { //离开启动定时器
	        timer = setInterval(function() {
	            scrollList($uList);
	        },2000);
	    }).trigger("mouseleave"); //自动触发触摸事件
	    //滚动动画
	    function scrollList(obj) {
	        //获得当前<li>的高度
	        var scrollHeight = $("ul li:first").height();
	        var str="20px";
	        var	scrollHeight1 =scrollHeight+str;
	        //滚动出一个<li>的高度
	        $uList.stop().animate({
	            marginTop: -scrollHeight1
	        },
	        1500,
	        function() {
	            //动画结束后，将当前<ul>marginTop置为初始值0状态，再将第一个<li>拼接到末尾。
	            $uList.css({
	                marginTop: 0
	            }).find("li:first").appendTo($uList);
	        });
	    }
	});
}
