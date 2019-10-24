define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/location.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));

	var polyLines = [];//覆盖物列表
	var dataList = [];//数据列表
	var infoLabel = null;
	var lanePanel = require('./lanePanel');
	
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
			var url = "jcsj/lane/allData";
			$.ajax({
				type: "GET",
				url: url,
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.laneList;
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
					"strokeColor" : "#666633",
					"strokeOpacity" : 1,
					"strokeWeight" : 5,
					"strokeStyle" : "solid",
				});
				polyline.data = obj;
				polyline.addEventListener(IMAP.Constants.CLICK, polylineClick);
				polyline.addEventListener(IMAP.Constants.MOUSE_OVER, polylineMouseOver);
				polyline.addEventListener(IMAP.Constants.MOUSE_OUT, polylineMouseOut);
				
				polyLines.push(polyline);
			}
		}
		gblMapObjs.lanePolyLines = polyLines;
		map.getOverlayLayer().addOverlays(polyLines, false);
		layer.msg('加载了'+polyLines.length+"条车道");	
	};
	//清除数据
	var clear = function() {
		//清除界面
		for (var i = 0; i < polyLines.length; i++) {
			map.getOverlayLayer().removeOverlay(polyLines[i]);
		}
		polyLines = [];
		gblMapObjs.lanePolyLines = [];
		//清除数据
		dataList = [];
	};
	//鼠标移入事件
	var polylineMouseOver = function(e) {
		var polyline = e.target;
		var lane = polyline.data;
		var option = polyline.getAttribute();
		option.strokeWeight = 20;
		option.strokeColor = '#ff0000';
		polyline.setAttribute(option);
		
		var dispNm = lane.cdzx+"("+lane.bh+")";
		infoLabel = new IMAP.Label(dispNm, {
			position : new IMAP.LngLat(e.lnglat.lng, e.lnglat.lat),// 基点位置
			anchor : IMAP.Constants.BOTTOM_CENTER,
			title : "label",
			fontColor : "#ff0000",
			fontSize : 12,
			fontBold : false// 在html5 marker的情况下，是否允许marker有背景
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
		var lane = polyline.data;
		var lngLatArray = TUtils.polygonStr2Path(lane.zb);
		map.setBestMap(lngLatArray);
		lanePanel.show(lane);
	};
	return {
		showLayer: showLayer,
		clear : clear
	}
})