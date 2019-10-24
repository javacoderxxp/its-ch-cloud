$(function () {
	var app = null;
	initMap();
	initAllCharts();
	initVideo();
	setInterval(initAllCharts, 60000); //一分钟一次
});

var initAllCharts = function(){
	initOnlinePoliceDt();
	initOnlinePoliceJwt();
	getAllJwtDev();
}

var initVideo = function(){
	$('#PlayViewOCX').attr('width',$('.centermap').width());
	$('#PlayViewOCX').attr('height',window.screen.height - $('.centermap').height());
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.SetOcxMode(0);
}

var videoMarkerOpts = new IMAP.MarkerOptions();
videoMarkerOpts.icon = new IMAP.Icon("../../../../images/videoCamCloud.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
videoMarkerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
var markerOpts = new IMAP.MarkerOptions();
markerOpts.icon = new IMAP.Icon("../../../../images/box.png", new IMAP.Size(48, 48), new IMAP.Pixel(0, 0));
markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
app = new Vue({
	el : '#imptDiv',
	data : {
		allGpsDevList:[],
		overlay:null,
		shape:'',
		relatedVideos:[],
		videoMakers:[],
		highlightPoint:null,
		searchingDev:false,
		showListText:false
	},
	methods: {
		addShape: function() {
			this.clearShape();
			mousetool=new IMAP.PolylineTool();
			mousetool.autoClose = true;//是否自动关闭绘制	
			map.addTool(mousetool);
			mousetool.open();
			mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
				app.overlay = evt.overlay;
				app.shape = polygonPath2Str(evt.overlay.getPath());
				app.findRelatedDevs();
				app.showListText = true;
				mousetool.close();
			},this);
		},
		findRelatedDevs:function(){
			if(null != this.overlay &&　'' != this.shape){
				this.searchingDev = true;
				this.findJWXLRelatedDev();
			}
		},
		//查找警卫路线相关的设备
		//加载达到300米距离内的视频监控
		findJWXLRelatedDev:function(){
			var pathArr = lineToPoints(this.overlay,5);
			$.ajax({
				url: "../../../../../dev/videoCamera/allData",
				success: function(rslt){
					if(rslt.code == 200){
						var allVideo = rslt.videoCameraList;
						for (var t = 0; t < pathArr.length - 1; t++) {
							var p1 = pathArr[t];
							var p2 = pathArr[t + 1];
							for (var d = 0; d < allVideo.length; d++) {
								var video = allVideo[d];
								if(!video.shape || video.shape.indexOf(",") == -1){
									continue;
								}
								var pos = video.shape.split(",");
								var dis = getDisFromPoint2Line(new IMAP.LngLat(pos[0], pos[1]), p1, p2);
								if (dis <= 200) {
									app.addVideoToList(video);
								}
							}
						}
					}else{
						alert(rslt.msg);
					}
				}
			}).done(function(){
				app.drawRelatedVideos();
				app.searchingDev = false;
			});
		},
		//在地图上画出相关联的视频监控
		drawRelatedVideos:function(){
			if(this.relatedVideos.length > 0){
				for (var i = 0; i < this.relatedVideos.length; i++) {
					var v = this.relatedVideos[i].video;
					if(v.shape && v.shape.indexOf(",") != -1){
						var pos = v.shape.split(",");
						var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), videoMarkerOpts);
						marker.data = v;
						map.getOverlayLayer().addOverlay(marker, true);
						this.videoMakers.push(marker);
					}
				}
			}
		},
		//视频监控添加到list,vue会自动生成Dom
		addVideoToList:function(v){
			var flag = true;
			for (var i = 0; i < this.relatedVideos.length; i++) {
				var s = this.relatedVideos[i].video;
				if(s.deviceId == v.deviceId){
					flag = false;
					break;
				}
			}
			if(flag){
				this.relatedVideos.push({"video":v});
			}
		},
		openRelatedVideos:function(){
			var len = this.relatedVideos.length;
			if(len > 0){
				if(len<=4){
					app.playVideo(len);
				}else{
					layer.msg("视频监控较多，建议先打开前4个");
					layer.open({
						  content: '视频监控较多，建议先打开前4个'
						  ,btn: ['打开', '取消']
						  ,yes: function(index, layero){
							  app.playVideo(4);
							  layer.close(index);
						  }
						  ,btn2: function(index, layero){
							  layer.close(index);
						  }
						  ,cancel: function(){}
						});
				}
			}
		},
		openOneVideo:function(index,item){
			this.playVideo(null,item);
		},
		playVideo:function(len,item){
			/*var tunnels = "";
			if(null == len){
				tunnels = item.video.deviceId;
			}else{
				var temp = "";
				for(var i = 0; i < len; i++){
					var v = this.relatedVideos[i].video;
					temp = temp + "," + v.deviceId;
				}
				tunnels = temp.substring(1);
			}*/
			//TODO:  调用视频窗口
			/*require(['layers/camera/camera'],function(camera){
				camera.playWinVideo(tunnels);
			});*/
			$.ajax({
				url: '/sc-itsweb/dev/videoCamera/getPreviewParam?cameraIndexCode=' +item.video.tunnel,
				type: 'GET',
				async: false,
				success: function(dat) {
					var OCXobj = document.getElementById("PlayViewOCX");
					var i = OCXobj.StartTask_Preview_FreeWnd(dat.replace(/[\\]/g, ""));
					
				},
				error: function(xhr, textStatus) {
					layer.msg("获取预览xml失败！");
				}
			});
		},
		//移除指定关联视频监控
		removeFromVideoList:function(index){
			this.relatedVideos.splice(index,1);
			var m = this.videoMakers[index];
			map.getOverlayLayer().removeOverlay(m);
			this.videoMakers.splice(index,1);
		},
		//在地图上高亮显示当前鼠标移入的设备
		deventer:function(item){
			var pos = item.shape.split(",");
			var center = new IMAP.LngLat(pos[0], pos[1]);
			if(null == this.highlightPoint){
				this.highlightPoint = new IMAP.Marker(center, markerOpts);
				map.getOverlayLayer().addOverlay(this.highlightPoint, false);
			}else{
				this.highlightPoint.setPosition(center);
				this.highlightPoint.visible(true);
			}
			map.setCenter(center);
		},
		//移出时，不高亮
		devleave:function(){
			if(null != this.highlightPoint){
				this.highlightPoint.visible(false);
			}
		},
		//清除相关设备
		clearShape: function () {
			/*for (var i = 0; i < this.signalMarkers.length; i++) {
				var m = this.signalMarkers[i];
				map.getOverlayLayer().removeOverlay(m);
			}*/
			for (var j = 0; j < this.videoMakers.length; j++) {
				var m = this.videoMakers[j];
				map.getOverlayLayer().removeOverlay(m);
			}
			//this.signalMarkers =[];
			this.videoMakers =[];
			//this.relatedSignals = [];
			this.relatedVideos = [];
			if(this.overlay){
				map.getOverlayLayer().removeOverlay(this.overlay);
				this.shape='';
				this.overlay = null;
			}
			if(this.highlightPoint){
				map.getOverlayLayer().removeOverlay(this.highlightPoint);
				this.highlightPoint = null;
			}
			this.searchingDev = false;
			this.showListText = false;
		}
	}
});

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
	
	// 地图菜单
	var contextMenu = new IMAP.ContextMenu(false);
	var menuItem = new IMAP.MenuItem("绘制警卫路线");
	menuItem.setCallback(function(lnglat) {
		app.addShape();
	});
	contextMenu.addItem(menuItem);
	/*menuItem = new IMAP.MenuItem("清除警卫路线");
	menuItem.setCallback(function(lnglat) {
		alert("cancel");
	});
	contextMenu.addItem(menuItem);*/
	map.addContextMenu(contextMenu);
    return map;
};

var polygonPath2Str = function(lngLatArray) {
	var polygonStr ="";
	for(var i =0 ;i< lngLatArray.length; i++){
		polygonStr += lngLatArray[i].lng+","+ lngLatArray[i].lat+" "
	}
	return polygonStr.trim();
}

var lineToPoints = function(line,intervalMeter){
	var points = line.getPath();
	var resultPs = [];
	resultPs.push(points[0]);
	for (var ind = 0; ind < points.length-1; ind++) {
		var p1 = points[ind];
		var p2 = points[ind+1];
		var currentCount = 0,
		init_pos = map.lnglatToPixel(p1),
		target_pos = map.lnglatToPixel(p2),
		count = Math.round(_getDistance(init_pos, target_pos) / intervalMeter);
		while(currentCount < count){
			currentCount++;
            var x = _linear(init_pos.x, target_pos.x, currentCount, count),
                y = _linear(init_pos.y, target_pos.y, currentCount, count),
                pos = map.pixelToLnglat(new IMAP.Pixel(x, y));
            resultPs.push(pos);
		}
	}
	return resultPs;
};

var _getDistance = function(pxA, pxB) {
    return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
};

var _linear = function(initPos, targetPos, currentCount, count) {
    var b = initPos, c = targetPos - initPos, t = currentCount,
    d = count;
    return c * t / d + b;
};

//计算点到一条线段（两端点）的距离
var getDisFromPoint2Line = function(targetP, pa, pb) {
	var a = IMAP.Function.distanceByLngLat(pb, targetP);
	var b = IMAP.Function.distanceByLngLat(pa, targetP);
	var c = IMAP.Function.distanceByLngLat(pa, pb);
	if (a * a >= b * b + c * c)
		return b;
	if (b * b >= a * a + c * c)
		return a;
	var l = (a + b + c) / 2;
	var s = Math.sqrt(l * (l - a) * (l - b) * (l - c)); // 海伦公式求面积
	return 2 * s / c;
};

var points = new Map();//覆盖物列表
var dataList = [];//数据列表
var jwtOpts = new IMAP.MarkerOptions();
jwtOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
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
	//清除数据
	//gblMapObjs.policeJwtMarkers =[];
	dataList = [];
	dTdataList = [];
};

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