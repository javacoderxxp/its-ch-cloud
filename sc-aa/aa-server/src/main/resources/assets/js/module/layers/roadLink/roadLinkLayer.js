define(function(require) {
	var map = require('mainMap');
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/road_cross_marker.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var polyLines = [];//覆盖物列表
	var dataList = [];//数据列表
	var infoLabel = null;
	var roadLinkPanel = require('./roadLinkPanel');
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
				url: "jcsj/roadLink/allData",
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.roadLinkList;
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
					"strokeColor" : "#339966",
					"strokeOpacity" : 1,
					"strokeWeight" : 10,
					"strokeStyle" : "solid",
				});
				polyline.data = obj;
				polyline.addEventListener(IMAP.Constants.CLICK, polylineClick,null,true);
				polyline.addEventListener(IMAP.Constants.MOUSE_OVER, polylineMouseOver,null,true);
				polyline.addEventListener(IMAP.Constants.MOUSE_OUT, polylineMouseOut,null,true);
				
				polyLines.push(polyline);
			}
		}
		gblMapObjs.roadLinkPolyLines = polyLines;
		map.getOverlayLayer().addOverlays(polyLines, false);
		layer.msg('加载了'+polyLines.length+"条路段");	
	};
	//清除数据
	var clear = function() {
		//清除界面
		for (var i = 0; i < polyLines.length; i++) {
			map.getOverlayLayer().removeOverlay(polyLines[i]);
		}
		polyLines = [];
		gblMapObjs.roadLinkPolyLines = [];
		//清除数据
		dataList = [];
	};
	//鼠标移入事件
	var polylineMouseOver = function(e) {
		var polyline = e.target;
		var roadLink = polyline.data;
		var dispNm = roadLink.mc+"("+roadLink.bh+")";
		if(!roadLink.mc){
			dispNm ='无名路段'+"("+roadLink.bh+")";
		}
		
		infoLabel = new IMAP.Label(dispNm, {
			position : new IMAP.LngLat(e.lnglat.lng, e.lnglat.lat),// 基点位置
			anchor : IMAP.Constants.BOTTOM_CENTER,
			title : "label",
			fontColor : "#ff0000",
			fontSize : 12,
			fontBold : false
		});
		var polyline = e.target;
		var roadLink = polyline.data;
		var option = polyline.getAttribute();
		option.strokeWeight = 20;
		option.strokeColor = '#ff0000';
		polyline.setAttribute(option);
		
		
		map.getOverlayLayer().addOverlay(infoLabel, false);
		e.stop=true;
	};
	//鼠标移出事件
	var polylineMouseOut = function(e) {
		map.getOverlayLayer().removeOverlay(infoLabel);
		var polyline = e.target;
		var option = polyline.getAttribute();
		option.strokeWeight = 10;
		option.strokeColor = '#8B7B8B';
		polyline.setAttribute(option);
		e.stop=true;
	};
	//单击事件
	var polylineClick = function(e) {
		var polyline = e.target;
		var roadLink = polyline.data;
//		alert('路段编号:'+roadLink.bh+"<br/>路段名称:"+roadLink.mc);
		var lngLatArray = TUtils.polygonStr2Path(roadLink.zb);
		map.setBestMap(lngLatArray);
		roadLinkPanel.show(roadLink);
	};
	
	return {
		showLayer : showLayer
	}
	
})