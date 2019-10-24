define(function(require) {
	var map = require('mainMap');
	var Vue = require('vue');
	var infoWindow;
	var icon_radio = new IMAP.Icon("./assets/images/350M.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var icon_radio_offline = new IMAP.Icon("./assets/images/350M1.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var opts = new IMAP.MarkerOptions();
	opts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var marker;
	var htmlStr = require('text!./policeControlPanel.html');
	var initPoint;
	var tracemarkers = [];
	var polylineTraceList = [];
	var cnt = 0;
	var infoLabelOthers = [];
	var points = new Map();//覆盖物列表
	var dataList = [];//数据列表
	gblMapObjs.radioDataCluster;//聚合图
	var infoLabel = null;
	/*
	 *显示 showLayer -> loadData -> apply data to ui  -> add business function to marker
	 *清除 clear ui -> clear data
	*/
	var policeControlApp;
	var searchVal;
	var timeInterval = 5000;
	var t2;  //计时器对象
	var timer_radio;
	var groupName;
	
	//入口方法
	var showLayer = function(isShow, paramDataList, paramGroupName) {
		clear();
		groupName = paramGroupName;
		if(isShow) {
			//地图上加载警力数据
			loadData(paramDataList);
			if(!t2){
				t2 = setInterval(function(){
					loadData(paramDataList);
				},timeInterval);
			}
			itsGlobal.showLeftPanel(htmlStr);
			policeControlApp = new Vue({
				el : '#policeControl-panel',
				data : {
					allGpsDevList: [],
					isJWT:false,
					isCar:false,
					isRadio:true
				},
				methods :{
					close: function(){
						itsGlobal.hideLeftPanel();
						clear();
					},
					showTrackSearch: function(gpsId,name){
						$.ajax({
							type: "GET",
						    url: "jw/gpsDevice/getGpsDeviceByGpsId?gpsId="+gpsId,
						    //async :false,
						    success: function(rslt){
						    	if(rslt.code == 200){
						    		var police = rslt.gpsDevice;
						    		police.ne=name;
						    		if(typeof(police.longitude)!="undefined"){
						    			var lnglat = new IMAP.LngLat(police.longitude, police.latitude);
						    			var point = new IMAP.Marker(lnglat, opts);
										police.status === '0'?point.setIcon(icon_radio):point.setIcon(icon_radio_offline);
										point.data = police;
										var e = {};
										e.target = point;
										trackSearch(e);
						    		}else{
						    			alert("该警员无点位信息！");
						    		}
								}else{
									alert(rslt.msg);
								}
							}
						});
					},
					locateCurrentPos: function(status, longitude, latitude){
						if(status =='0' && longitude && latitude){
							var center = new IMAP.LngLat(longitude, latitude);
							map.setCenter(center,18);
						}
					}
				}
			});
			
			//显示所有警力信息
			getAllPoliceControl();
		}else{
			clearInterval(t2);
			if(timer_radio){
				map.getOverlayLayer().removeOverlay(marker);
				clearInterval(timer_radio);
			}
			itsGlobal.hideLeftPanel();
			clear();
		}
		
		map.addEventListener(IMAP.Constants.ZOOM_END,function(){
	        var mZoom= map.getZoom();
	        if(infoLabelOthers){
		        if(mZoom>=14){
	    			for (var i = 0; i < infoLabelOthers.length; i++) {
	    				infoLabelOthers[i].visible(true);
	    			}
		        }else{
	    			for (var i = 0; i < infoLabelOthers.length; i++) {
	    				infoLabelOthers[i].visible(false);
	    			}
		        	
		        }
	        }
	    });
		
		$('#nameSearch').bind('input propertychange', function() {
			getAllPoliceControl();
		});
	};
	
	//加载数据
	var loadData = function(paramDataList) {
		if(paramDataList){
			dataList = paramDataList;//传入的数据
			applyDataToUI();
		}else{//主动查询的数据
			var url = "jw/gpsDevice/searchRadioInfo";
			if(groupName){
				url += "?groupName="+encodeURIComponent(groupName);
			}
			$.ajax({
				type: "GET",
			    url: url,
			    success: function(rstl){
			    	if(rstl.code === 200){
						dataList = rstl.gpsDeviceList;
						/*if(null === dataList || dataList.length === 0){
			        		layer.msg("无任何记录！");
			        		return;
			        	}*/
						applyDataToUI();

						var overoneEle = document.getElementById("overthree");
						if(overoneEle){
							overoneEle.style.overflowY="scroll";
						}
					}else{
						alert(rstl.msg);
					}
				}
			});
		}
	};
	
	var getAllPoliceControl = function(){
		var url = "jw/gpsDevice/searchRadioInfo";
		if(groupName){
			url += "?groupName="+encodeURIComponent(groupName);
		}
		$.ajax({
			type: "GET",
		    url: url,
		    async :false,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var allDevList = rslt.gpsDeviceList;
		    		policeControlApp.allGpsDevList = rslt.gpsDeviceList;
		    		
		    		searchVal = $('#nameSearch').val().trim();
		    		if(searchVal != ''){
		    			$.each(policeControlApp.allGpsDevList, function(i,item){
		    				if(item.radioName){
		    					if(item.radioName.indexOf(searchVal) == -1 ){
		    						item.isShow = false;
		    					}else{
		    						item.isShow = true;
		    					}
		    				}
		    			});
		    		}else{
		    			$.each(policeControlApp.allGpsDevList, function(i,item){
		        			item.isShow = true;
		    			});
		    		}
				}else{
					alert(rslt.msg);
				}
			}
		});
	};
	
	//数据应用到视图
	var applyDataToUI = function() {
		if(TUtils.isIE9Browser()){
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
							police.status === '0'?pointMarker.setIcon(icon_radio):pointMarker.setIcon(icon_radio_offline);
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
					var point = new IMAP.Marker(new IMAP.LngLat(police.longitude, police.latitude), opts);
					police.status === '0'?point.setIcon(icon_radio):point.setIcon(icon_radio_offline);
					point.data = police;
					point.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
					//point.setLabel(typeof(police.radioName)=='undefined'?'无信息':police.radioName, IMAP.Constants.RIGHT_TOP, new IMAP.Pixel(0,0));
					//point.addEventListener(IMAP.Constants.MOUSE_OVER, markerMouseOver);
					//point.addEventListener(IMAP.Constants.MOUSE_OUT, markerMouseOut);
					points.set(police.gpsId,point);
					map.getOverlayLayer().addOverlay(point, false);
					//point.setTitle(police.radioName);
					pointsCluster.push(point);
					if(police.radioName){
						
					}else{
						police.radioName="无名称";	
					}
					var infoLabel = new IMAP.Label(police.radioName, {
						position : new IMAP.LngLat(police.longitude, police.latitude),// 基点位置
						offset: new IMAP.Pixel(0,-60),//相对于基点的位置
						anchor : IMAP.Constants.TOP_CENTER,
						fontSize : 15,
						fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
						fontColor : "#222222"
					});
					map.getOverlayLayer().addOverlay(infoLabel, false);
					infoLabelOthers.push(infoLabel);
				}
				gblMapObjs.policeRsdioMarkers = pointsCluster;
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.radioDataCluster = new IMAP.DataCluster(map, pointsCluster, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.radioDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.radioDataCluster.setMaxZoom(0,true);
			        }
			    });
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
							police.status === '0'?pointMarker.setIcon(icon_radio):pointMarker.setIcon(icon_radio_offline);
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
					var point = new IMAP.Marker(new IMAP.LngLat(police.longitude, police.latitude), opts);
					police.status === '0'?point.setIcon(icon_radio):point.setIcon(icon_radio_offline);
					point.data = police;
					point.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
					//point.setLabel(typeof(police.radioName)=='undefined'?'无信息':police.radioName, IMAP.Constants.RIGHT_TOP, new IMAP.Pixel(0,0));
					//point.addEventListener(IMAP.Constants.MOUSE_OVER, markerMouseOver);
					//point.addEventListener(IMAP.Constants.MOUSE_OUT, markerMouseOut);
					points.set(police.gpsId,point);
					map.getOverlayLayer().addOverlay(point, false);
					//point.setTitle(police.radioName);
					pointsCluster.push(point);
					if(police.radioName){
						
					}else{
						police.radioName="无名称";	
					}
					var infoLabel = new IMAP.Label(police.radioName, {
						position : new IMAP.LngLat(police.longitude, police.latitude),// 基点位置
						offset: new IMAP.Pixel(0,-60),//相对于基点的位置
						anchor : IMAP.Constants.TOP_CENTER,
						fontSize : 15,
						fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
						fontColor : "#222222"
					});
					map.getOverlayLayer().addOverlay(infoLabel, false);
					infoLabelOthers.push(infoLabel);
				}
				gblMapObjs.policeRsdioMarkers = pointsCluster;
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.radioDataCluster = new IMAP.DataCluster(map, pointsCluster, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle //最小聚合数 
					});
				});
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.radioDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.radioDataCluster.setMaxZoom(0,true);
			        }
			    });
			}
		}
		
	};
	
	//清除数据
	var clear = function() {
		//清除界面
		if(TUtils.isIE9Browser()){
			if(points.size() >0){
				points.forEach(function(item,key,mapObj){
					map.getOverlayLayer().removeOverlay(item);
				});
			}
		}else{
			if(points.size >0){
				points.forEach(function(item,key,mapObj){
					map.getOverlayLayer().removeOverlay(item);
				});
			}
		}
		
		for (var i = 0; i < infoLabelOthers.length; i++) {
			map.getOverlayLayer().removeOverlay(infoLabelOthers[i]);
		}
		infoLabelOthers = [];
		
		//清除聚合图
		if(gblMapObjs.radioDataCluster){
			gblMapObjs.radioDataCluster.clearMarkers();
		}
		points=new Map();
		//清除数据
		gblMapObjs.policeRsdioMarkers =[];
		dataList = [];
		groupName = '';
		
		initPoint = null;
		cnt = 0;
		for(var j = 0; j < polylineTraceList.length; j++){
			map.getOverlayLayer().removeOverlay(polylineTraceList[j]);
		}
		for (var i = 0; i < tracemarkers.length; i++) {
			map.getOverlayLayer().removeOverlay(tracemarkers[i]);
		}
		//清除聚合图
		tracemarkers = [];
	};
	
	var closeInfoWindow = function(){
    	if (map && infoWindow) {
    		map.getOverlayLayer().removeOverlay(infoWindow);
    		infoWindow = null;
    	}
    };
    
/*  //鼠标移入事件
	var markerMouseOver = function(e) {
		var marker = e.target;
		var police = marker.data;
		
		infoLabel = new IMAP.Label(typeof(police.radioName)=='undefined'?'无信息':police.radioName, {
			position : new IMAP.LngLat(e.lnglat.lng, e.lnglat.lat),// 基点位置
			offset: new IMAP.Pixel(0,-25),//相对于基点的位置
			anchor : IMAP.Constants.BOTTOM_CENTER,
			title : "label",
			fontColor : "#ff0000",
			fontSize : 12,
			fontBold : false// 在html5 marker的情况下，是否允许marker有背景
		});
		map.getOverlayLayer().addOverlay(infoLabel, false);
	}
	
	//鼠标移出事件
	var markerMouseOut = function(e) {
		map.getOverlayLayer().removeOverlay(infoLabel);
		infoLabel = null;
	}*/
	
    var rightClick = function(e) {
		//右键菜单
		var contextMen = '<div class="self-menu">'
			+'<span class="detailspan trackSearch">轨迹查询</span><span class="detailspan devTrack">设备跟踪</span></div>';
		var contextMen_offline = '<div class="self-menu">'
			+'<span class="detailspan trackSearch">轨迹查询</span></div>';
		var police = e.target.data;
		if(police.status == '0'){
			CustomContextMenu.setContent(contextMen,e,100,60);
			$(".detailRadio").bind("click",function(){
				CustomContextMenu.close();
				detailRadio(e);
			})
			
			$(".trackSearch").bind( "click", function() {
				CustomContextMenu.close();
				trackSearch(e);
			});
			
			$(".devTrack").bind( "click", function() {
				CustomContextMenu.close();
				devTrackFn(e);
			});
		}else{
			CustomContextMenu.setContent(contextMen_offline,e,100,30);
			$(".detailRadio").bind("click",function(){
				CustomContextMenu.close();
				detailRadio(e);
			})
			
			$(".trackSearch").bind( "click", function() {
				CustomContextMenu.close();
				trackSearch(e);
			});
		}
	}
    
    //设备跟踪
    var devTrackFn = function(e){
    	if(t2){
    		clearInterval(t2);
    	}
    	clear();
    	marker = e.target;
    	map.getOverlayLayer().addOverlay(marker, true);
    	if(!timer_radio){
    		timer_radio = setInterval(function(){
        		synDevLoaction(e);
    		},timeInterval);
    	}
    }
    
    //获取单个设备的实时设备位置信息
    var synDevLoaction = function(e){
    	var police = e.target.data;
    	var url = "jw/gpsDevice/getGpsDeviceByGpsId?gpsId="+police.gpsId;
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rstl){
		    	if(rstl.code === 200){
					var gpsDevice = rstl.gpsDevice;
					if(gpsDevice){
						var lnglat=new IMAP.LngLat(gpsDevice.longitude,gpsDevice.latitude);
						if(lnglat){
							map.setCenter(lnglat);
							marker.setPosition(lnglat);
						}
						
						if(null == initPoint){
							initPoint = gpsDevice;
						}else if(initPoint.longitude != gpsDevice.longitude || initPoint.latitude != gpsDevice.latitude){
							drawLine(initPoint,gpsDevice);
							initPoint = gpsDevice;
						}
					}
				}else{
					alert(rstl.msg);
				}
			}
		});
    }
    
    var drawLine = function(prePoint,curPoint){
    	var markerOpts = new IMAP.MarkerOptions();
    	markerOpts.anchor = IMAP.Constants.CENTER;
    	markerOpts.icon = new IMAP.Icon("./assets/images/350M.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
    	var polylineTrace;
    	var inglatarr = [];
    	var preLnglat = new IMAP.LngLat(prePoint.longitude, prePoint.latitude)
		var curLnglat = new IMAP.LngLat(curPoint.longitude, curPoint.latitude)
    	inglatarr.push(preLnglat);		
    	inglatarr.push(curLnglat);
    			
		var marker = new IMAP.Marker(preLnglat, markerOpts);
		map.getOverlayLayer().addOverlay(marker, false);
		marker.setLabel("["+(cnt = cnt+1)+"] "+prePoint.gpsUpdateDt, IMAP.Constants.BOTTOM_CENTER, new IMAP.Pixel(0,-25));
		tracemarkers.push(marker);
		var opt = new IMAP.PolylineOptions();
		opt.strokeColor = "#ff0000";
		opt.strokeOpacity = "1";
		opt.strokeWeight = "3";
		opt.strokeStyle = IMAP.Constants.OVERLAY_LINE_DASHED;//虚线
		opt.editabled = true;
		opt.strokeStyle = "1";
		opt.arrow = true
		polylineTrace = new IMAP.Polyline(inglatarr, opt);
		map.getOverlayLayer().addOverlay(polylineTrace, false);
		polylineTraceList.push(polylineTrace);
    }
    
    //轨迹查询
    var trackSearch = function(e){
    	require(['layers/policeControl/trackSearch'],function(track){
    		if(t2){
        		clearInterval(t2);
        	}
    		var fromGroup = groupName;
        	clear();
        	marker = e.target;
        	map.getOverlayLayer().addOverlay(marker, true);
    		track.showLayer(marker, 'Radio', fromGroup);
		});
    }
    
	//单击事件
	var detailRadio = function(e) {
		var police = e.target.data;
		
		var content = '<div style="width: 320px;border: solid 1px silver;">'
			   +'<div style="position: relative;background: none repeat scroll 0 0 #F9F9F9;    border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;">'
	    +'<div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;line-height: 31px;padding: 0 10px;">警力信息</div>'
	    +'<img class="tt" src="./assets/images/close.png" style="position: absolute;top: 10px;right: 10px;transition-duration: 0.25s;"/>'
	   +'</div><div style="font-size: 12px;padding: 6px;line-height: 20px;background-color: white;height:100px;">电台编号：'+(typeof(police.deviceId)=='undefined'?'':police.deviceId)
		+'<br />警员编号：'+(typeof(police.policeNo)=='undefined'?'':police.policeNo)+'<br />警员姓名：'+(typeof(police.policeName)=='undefined'?'':police.policeName)
		+'<br />电台状态：'+(police.status==0?'在线':'离线')+'<br /></div>'
		+'<div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;"></div></div>'
		infoWindow = new IMAP.InfoWindow(content,{
			size:new IMAP.Size(322,103),
			position:new IMAP.LngLat(police.longitude,police.latitude),
			//autoPan:false,
			offset: new IMAP.Pixel(300,90),
			anchor:IMAP.Constants.BOTTOM_CENTER,
			type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
		});
		map.getOverlayLayer().addOverlay(infoWindow);
		infoWindow.autoPan(true);
		
		$(".tt").on( "click", function() {
			closeInfoWindow();
			CustomContextMenu.close();
		});
		$(".delPolice").on( "click", function() {
			CustomContextMenu.close();
			closeInfoWindow();
			// 删除操作。
			var url = "jw/gpsDevice/deleteByCondition?policeNum="+police.callNo+"&type=3";
			$.ajax({
				type: "POST",
			    url: url,
			    success: function(rstl){
			    	if(rstl.code === 200){
						alert("已删除"+ police.callNo);
						showLayer(true);
					}else{
						alert(rstl.msg);
					}
				}
			});
		});
	};
	
	return {
		showLayer:showLayer,
		clear : clear
	}
})