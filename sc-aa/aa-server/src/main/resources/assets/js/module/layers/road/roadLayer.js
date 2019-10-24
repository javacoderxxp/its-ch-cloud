define(function(require) {
	var map = require('mainMap');
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/road_cross_marker.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var polyLines = [];//覆盖物列表
	var dataList = [];//数据列表
	var infoLabel = null;
	var roadPanel = require('./roadPanel');
	/*
	 *显示 showLayer -> loadData -> apply data to ui  -> add business function to marker
	 *清除 clear ui -> clear data
	*/
	//入口方法
	var showLayer = function(isShow, paramDataList) {
		clear();
		if(isShow) {
			loadData(paramDataList);
		}
	};
	//加载数据
	var loadData = function(paramDataList) {
		if(paramDataList){
			dataList = paramDataList;//传入的数据
			applyDataToUI();
		}else{//主动查询的数据
			layer.load();
			$.ajax({
				url: "jcsj/road/allData",
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.roadList;
						applyDataToUI();
					}else{
						alert(rslt.msg);
					}
				}
			});
		}
	};
	//数据应用到视图
	var applyDataToUI = function() {
		for(var i = 0; i < dataList.length; i++){
			var obj = dataList[i];
			if(obj.zb){
				var lngLatArray =TUtils.polygonStr2Path(obj.zb);
				var polyline = new IMAP.Polyline(lngLatArray, {
					"strokeColor" : "#003366",
					"strokeOpacity" : 1,
					"strokeWeight" : 10,
					"strokeStyle" : "solid",
				});
				polyline.data = obj;
				polyline.addEventListener(IMAP.Constants.CLICK, polylineClick);
				polyline.addEventListener(IMAP.Constants.MOUSE_OVER, polylineMouseOver);
				polyline.addEventListener(IMAP.Constants.MOUSE_OUT, polylineMouseOut);
				
				polyLines.push(polyline);
			}
		}
		gblMapObjs.roadPolyLines = polyLines;
		map.getOverlayLayer().addOverlays(polyLines, false);
		layer.msg('加载了'+polyLines.length+"条道路");
	};
	//清除数据
	var clear = function() {
		//清除界面元素
		for (var i = 0; i < polyLines.length; i++) {
			map.getOverlayLayer().removeOverlay(polyLines[i]);
		}
		polyLines = [];
		gblMapObjs.roadPolyLines = [];
		//清除数据
		dataList = [];
	};
	//鼠标移入事件
	var polylineMouseOver = function(e) {
		var polyline = e.target;
		var road = polyline.data;
		var option = polyline.getAttribute();
		option.strokeWeight = 20;
		option.strokeColor = '#ff0000';
		polyline.setAttribute(option);
		
		var dispNm = road.mc+"("+road.bh+")";
		if(!road.mc){
			dispNm ='无名路'+"("+road.bh+")";
		}
		infoLabel = new IMAP.Label(dispNm, {
			position : new IMAP.LngLat(e.lnglat.lng, e.lnglat.lat),// 基点位置
			anchor : IMAP.Constants.BOTTOM_CENTER,
			title : "label",
			fontColor : "#ff0000",
			fontSize : 12,
			fontBold : false
		});

		map.getOverlayLayer().addOverlay(infoLabel, false);
	};
	//鼠标移出事件
	var polylineMouseOut = function(e) {
		var polyline = e.target;
		var option = polyline.getAttribute();
		option.strokeWeight = 10;
		option.strokeColor = '#8B7B8B';
		polyline.setAttribute(option);
		
		map.getOverlayLayer().removeOverlay(infoLabel);
	};
	//单击事件
	var polylineClick = function(e) {
		var polyline = e.target;
		var road = polyline.data;
//		alert('道路编号:'+road.bh+"<br/>道路名称:"+road.mc);
		var lngLatArray = TUtils.polygonStr2Path(road.zb);
		map.setBestMap(lngLatArray);
		roadPanel.show(road);
	};
	
	return {
		showLayer : showLayer
	}
})