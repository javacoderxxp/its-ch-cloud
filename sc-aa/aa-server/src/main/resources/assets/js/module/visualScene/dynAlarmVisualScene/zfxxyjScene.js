var groupId,currentUser;
$(function () {
	currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
	if(!currentUser){
		alert("请确认登录");
		return;
	}
	if(currentUser.jjddUser){
		groupId = "ddjg";
	}
	if(currentUser.jjzdUser){
		groupId = currentUser.group.groupId;
	}
	
	//保活 获取当前用户信息
	setInterval(function(){
		$.get("../../../../../currentUser", function(rslt){
			if(rslt.currentUser){
				currentUser = rslt.currentUser;
				if(currentUser.jjddUser){
					groupId = "ddjg";
				}
				if(currentUser.jjzdUser){
					groupId = currentUser.group.groupId;
				}
			}
		});
	}, 20000);
	
	
	initMap();

	initFlowAlarm();
	initMore3Alarm();
	initMore80Alarm();
	initkeyVehUnhandle();
	
	setInterval(initFlowAlarm, 3*60*1000);
	setInterval(initMore3Alarm, 5*60*1000);
	setInterval(initMore80Alarm, 60*60*1000);
	setInterval(initkeyVehUnhandle, 60*60*1000);
	
	
	initRoadAlarm();
	setInterval(initRoadAlarm, 20*60*60*1000);
});


var app = new Vue({
	el : '#imptDiv',
	data : {
		notifyList:[],
		more3List:[],
		more80List:[],
		keyVehList:[],
		alarmRoad:[]
	}
});


var initRoadAlarm = function(){
	if(groupId){
		var url = "../../../../../jtzx/roaddraw/getRoadSgAlarm?buffer=100";
		if("ddjg" != groupId){
			url += ("&groupId=" + groupId);
		}
		url += ("&rdm="+new Date().getTime());
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var tb = document.getElementById('accidentRoadTB');
		    		$("#accidentRoadTB").empty();
		    		if(rslt.alarmRoad){
		    			app.alarmRoad = [];
		    			$.each(rslt.alarmRoad, function(date,item){
							if(item && item instanceof Array && item.length>0){
								for(var i =0; i<item.length; i++){
									var im = item[i];
									im.riqi = date;
									app.alarmRoad.push(im);
								}
							}
						});
		    			$('#roadBadge')[0].innerHTML=app.alarmRoad.length;
		    			$("#noAccidentRoadAlarmDiv").hide();
		    			app.alarmRoad.reverse();
		    			$.each(app.alarmRoad, function(i,item){
							var r1=tb.insertRow(i);
							r1.id = i;
							var c1=r1.insertCell(0);
							c1.innerHTML="<span class='titleH'>【"+item.groupName+"】    "+item.riqi+ "   "+item.mc+"</span><span class='margin-left-30'>超出事故路段常值，事故量："+item.sgCnt+"，路段常值： "+item.constant+"</span>";
						});
		    		}
		    		$("#accidentRoadTB  tr").addClass('pconcent');
		    		$("#accidentRoadTB  td").addClass('fa fa-caret-right');
		    		$("#accidentRoadTB tr").on('click',function(){
		    			var alarm = app.alarmRoad[$(this).attr('id')];
		    			drawRoadAlarmLine(alarm);
		    		});
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
}

var initFlowAlarm = function(){
	if(groupId){
		var url = "../../../../../sys/notify/findNotifyLastNMin?type=5";
		if("ddjg" != groupId){
			url += ("&groupId=" + groupId);
		}
		url += ("&rdm="+new Date().getTime());
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var tb = document.getElementById('realTimeAlarmTB');
		    		$("#realTimeAlarmTB").empty();
		    		if(rslt.notifyList && rslt.notifyList.length > 0){
		    			app.notifyList = rslt.notifyList;
		    			$('#flowBadge')[0].innerHTML=rslt.notifyList.length;
		    			$("#noflowAlarmDiv").hide();
		    			$.each(rslt.notifyList, function(i,item){
							var r1=tb.insertRow(i);
							r1.id = i;
							var c1=r1.insertCell(0);
							c1.innerHTML="<span class='titleHL'>"+item.title+"</span><br/><span>"+item.content+"</span>";
						});
		    		}
		    		$("#realTimeAlarmTB  tr").addClass('pconcent');
		    		$("#realTimeAlarmTB  td").addClass('fa fa-caret-right');
		    		$("#realTimeAlarmTB tr").on('click',function(){
		    			var alarm = app.notifyList[$(this).attr('id')];
		    			drawFlowAlertMarker(alarm);
		    		});
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
}

var initMore3Alarm = function(){
	if(groupId){
		var url = "../../../../../qw/violationPunish/getMoreThan3InFiveMin?groupId="+groupId+"&rdm="+new Date().getTime();
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var tb = document.getElementById('fiveMinMoreThan3TB');
		    		$("#fiveMinMoreThan3TB").empty();
		    		if(rslt.list && rslt.list.length > 0){
		    			app.more3List = rslt.list;
		    			$('#more3Badge')[0].innerHTML=rslt.list.length;
		    			$.each(rslt.list, function(i,item){
							var r1=tb.insertRow(i);
							r1.id = i;
							var c1=r1.insertCell(0);
							c1.innerHTML="<span class='titleH'>【"+item.punisherNo+"-"+item.policeName+"】     "+item.groupName+"</span><br/><span>"+item.startDt+"~"+item.endDt+"，处理违法 "+item.cnt+" 起</span>";
						});
		    		}
		    		$("#fiveMinMoreThan3TB  tr").addClass('pconcent');
		    		$("#fiveMinMoreThan3TB  td").addClass('fa fa-caret-right');
		    		$("#fiveMinMoreThan3TB tr").on('click',function(){
		    			var alarm = app.more3List[$(this).attr('id')];
//		    			console.info(alarm);
		    		});
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
}

var initMore80Alarm = function(){
	if(groupId){
		var url = "../../../../../qw/violationPunish/getMoreThan80InOneDay?groupId="+groupId+"&rdm="+new Date().getTime();
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var tb = document.getElementById('dayMoreThan80TB');
		    		$("#dayMoreThan80TB").empty();
		    		if(rslt.list && rslt.list.length > 0){
		    			app.more80List = rslt.list;
		    			$('#more80Badge')[0].innerHTML=rslt.list.length;
		    			$.each(rslt.list, function(i,item){
							var r1=tb.insertRow(i);
							r1.id = i;
							var c1=r1.insertCell(0);
							c1.innerHTML=item.day + " <span class='titleH'>【"+item.punisherNo+"-"+item.policeName+"】     "+item.groupName+"</span>     处理违法 "+item.cnt+" 起<br/>";
						});
		    		}
		    		$("#dayMoreThan80TB  tr").addClass('pconcent');
		    		$("#dayMoreThan80TB  td").addClass('fa fa-caret-right');
		    		$("#dayMoreThan80TB tr").on('click',function(){
		    			var alarm = app.more80List[$(this).attr('id')];
//		    			console.info(alarm);
		    		});
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
}

var initkeyVehUnhandle = function(){
	if(groupId){
		var url = "../../../../../cljg/keyVehicle/findKeyVehUnhandlePunish?rdm="+new Date().getTime();
		if("ddjg" != groupId){
			url += ("&groupId=" + groupId);
		}
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var tb = document.getElementById('keyVehUnhandleTB');
		    		$("#keyVehUnhandleTB").empty();
		    		if(rslt.keyVehicleList && rslt.keyVehicleList.length > 0){
		    			app.keyVehList = rslt.keyVehicleList;
		    			$('#notifyBadge')[0].innerHTML=rslt.keyVehicleList.length;
		    			var html = "<tbody>";
		    			$.each(rslt.keyVehicleList, function(i,item){
							var innerHTML="<tr id='veh_"+i+"' class='pconcent'><td class='fa fa-caret-right'><span class='titleH'>【"+item.plateNo+"】     -"+item.plateType+"    "+item.type+"</span><br/><span>"+item.company+"  单位性质："+item.dwxz+"<br/>电话："+item.companyPhoneNo+" </span></td></tr>";
							html += innerHTML;
		    			});
		    			html += "</tbody>";
		    			tb.innerHTML=html;
		    		}
		    		$("#keyVehUnhandleTB  tr").addClass('pconcent');
		    		$("#keyVehUnhandleTB  td").addClass('fa fa-caret-right');
		    		$("#keyVehUnhandleTB tr").on('click',function(){
		    			var alarm = app.keyVehList[$(this).attr('id')];
//		    			console.info(alarm);
		    		});
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
}

var map;
var marker;
var line;
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

var flowOpts = new IMAP.MarkerOptions();
flowOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
var icon_flow = new IMAP.Icon("../../../../images/flowalert.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
var clearFlowMarkerTimer = null;
var drawFlowAlertMarker = function(data){
	if(data.shape && data.shape.indexOf(",")>1){
		if(clearFlowMarkerTimer){
			clearInterval(clearFlowMarkerTimer);
		}
		clearFlowMarker();
		var pos = data.shape.split(",");
		marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), flowOpts);
		marker.data = data;
		marker.setIcon(icon_flow);
		map.getOverlayLayer().addOverlay(marker, true);
		marker.setTitle(data.policeName);
		
		clearFlowMarkerTimer = setTimeout(clearFlowMarker, 4000);
	}else{
		alert("无相关位置信息");
	}
}

var clearRoadLineTimer = null;
var drawRoadAlarmLine = function(data){
	if(data && data.region){
		if(clearRoadLineTimer){
			clearInterval(clearRoadLineTimer);
		}
		clearFlowMarker();
		
		var lngLatArray= [];
		var polygonStr= data.region.trim();
		var polygonArr = polygonStr.split(" ");
		for (var i = 0; i < polygonArr.length; i++) {
			var lnglatStr = polygonArr[i];
			var lnglatArr = lnglatStr.split(",");
			lngLatArray.push(new IMAP.LngLat(lnglatArr[0],lnglatArr[1]));
		}
		
    	var plo = new IMAP.PolylineOptions();
    	plo.strokeColor = "#ff0000";
    	plo.strokeOpacity = "1";
    	plo.strokeWeight = "3";
    	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
    	plo.editabled = true;
    	plo.strokeStyle = "1";
    	line = new IMAP.Polyline(lngLatArray, plo);
    	map.getOverlayLayer().addOverlay(line, true);
    	
		
		clearFlowMarkerTimer = setTimeout(clearFlowMarker, 5000);
	}
}
var clearFlowMarker = function(){
	if(marker){
		map.getOverlayLayer().removeOverlay(marker);
		marker = null;
	}
	if(line){
		map.getOverlayLayer().removeOverlay(line);
		line = null;
	}
}