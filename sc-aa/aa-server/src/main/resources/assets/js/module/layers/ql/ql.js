define(function(require) {
	var map = require('mainMap');
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/ql.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var polyLines = [];//覆盖物列表
	var dataList = [];//数据列表
	var infoLabel = null;
	var qlPanel = require('./qlPanel');
	/*
	 *显示 showLayer -> loadData -> apply data to ui  -> add business function to marker
	 *清除 clear ui -> clear data
	*/
	//入口方法
	var showLayer = function(isShow, paramDataList) {
		clear();
		if(isShow) {
			loadData();
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
				url: "jtzt/ql/allData",
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.qlList;
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
			var lnglatQd =TUtils.str2Lnglat(obj.qd);
			var lnglatZd =TUtils.str2Lnglat(obj.zd);
			var polygonPath =new Array(lnglatQd,lnglatZd);
			var polyline = new IMAP.Polyline(polygonPath, {
				"strokeColor" : "#333333",
				"strokeOpacity" : 1,
				"strokeWeight" : 8,
				"strokeStyle" : "solid",
			});
			polyline.data = obj;
			polyline.addEventListener(IMAP.Constants.CLICK, polylineClick);
			polyline.addEventListener(IMAP.Constants.MOUSE_OVER, polylineMouseOver);
			polyline.addEventListener(IMAP.Constants.MOUSE_OUT, polylineMouseOut);
			polyLines.push(polyline);
		}
		gblMapObjs.qlPolyLines = polyLines;
		map.getOverlayLayer().addOverlays(polyLines, false);	
		layer.msg('加载了'+polyLines.length+"座桥梁");
	};
	//清除数据
	var clear = function() {
		//清除界面元素
		for(var i = 0; i < polyLines.length; i++){
			map.getOverlayLayer().removeOverlay(polyLines[i]);
		}
		polyLines = [];
		gblMapObjs.qlPolyLines = [];
		//清除数据
		dataList = [];
	};
	//鼠标移入事件
	var polylineMouseOver = function(e) {
		var polyline = e.target;
		var ql = polyline.data;
		var option = polyline.getAttribute();
		option.strokeWeight = 20;
		option.strokeColor = '#ff0000';
		polyline.setAttribute(option);
		
		var dispNm = ql.mc;
		if(!ql.mc){
			dispNm ='无名桥';
		}
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
		var ql = polyline.data;
		/*if(ql.mc){
			alert("桥梁名称:"+ql.mc);
		}else{
			alert("桥梁名称: 无名桥");
		}*/
		qlPanel.show(ql);
//		var lnglatZb =TUtils.str2Lnglat(ql.zb);
//		map.setCenter(lnglatZb,18);
	};
	
	return {
		showLayer : showLayer
	}
})