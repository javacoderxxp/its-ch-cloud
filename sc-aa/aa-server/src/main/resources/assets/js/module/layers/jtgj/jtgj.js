define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/location.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));

	var polygons = [];//覆盖物列表
	var dataList = [];//数据列表
	var infoLabel = null;
	var jtgjPanel = require('./jtgjPanel');
	var jgjzLayer;

	//入口方法-加载切片图
	var showLayer = function(isShow, paramDataList) {
		clear();
		if(isShow) {
			//################################测绘加工中队范围图################################
			jgjzLayer = new IMAP.TileLayer({
				tileSize: 256,
				minZoom: 11,
				maxZoom: 20,
			});
			jgjzLayer.setOpacity(0.9);
			if(itsEnv != 'prod'){
				jgjzLayer.setTileUrlFunc(function(x,y,z){
					//SIT
					return ("http://58.210.9.131/arcgis/rest/services/CS/XQ/MapServer/tile/" + z + "/" + y + "/" + x );
				});
			}else{
				jgjzLayer.setTileUrlFunc(function(x,y,z){
					//PROD
					return ("http://192.168.15.6:6080/arcgis/rest/services/MAP/TCS_ZDXQ/MapServer/tile/" + z + "/" + y + "/" + x );
				});
			}
			map.addLayer(jgjzLayer);
		}
	};
	//清除数据
	var clear = function() {
		if(jgjzLayer){
			jgjzLayer.setMap();
			jgjzLayer = null;
		}
	};
	
	/*
	 *显示 showLayer -> loadData -> apply data to ui  -> add business function to marker
	 *清除 clear ui -> clear data
	*/
	//入口方法-加载数据
	var showLayer1 = function(isShow, paramDataList) {
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
			var url = "jtzt/jtgj/allData";
			$.ajax({
				type: "GET",
				url: url,
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.jtgjList;
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
				var polygon = new IMAP.Polygon(lngLatArray, {
					"strokeColor" : "#cfe7b4",
					"strokeOpacity" : 0.5,
					"strokeWeight" : 5,
					"strokeStyle" : "solid",
					"fillColor" : obj.ys,
					"fillOpacity" : 0.5,
					"editabled" :false,
				});
				polygon.data = obj;
//				polygon.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, polygonClick);
				polygon.addEventListener(IMAP.Constants.MOUSE_OVER, polygonMouseOver);
				polygon.addEventListener(IMAP.Constants.MOUSE_OUT, polygonMouseOut);
				
				polygons.push(polygon);
			}
		}
		gblMapObjs.jtgjPolygons = polygons;
		map.getOverlayLayer().addOverlays(polygons, false);
		layer.msg('加载了'+polygons.length+"个中队");
	};
	//清除数据
	var clear1 = function() {
		//清除界面
		for (var i = 0; i < polygons.length; i++) {
			map.getOverlayLayer().removeOverlay(polygons[i]);
		}
		polygons = [];
		gblMapObjs.jtgjPolygons = [];
		//清除数据
		dataList = [];
	};
	//鼠标移入事件
	var polygonMouseOver = function(e) {
		var polygon = e.target;
		var jtgj = polygon.data;
		var option = polygon.getAttribute();
		option.strokeColor = "white";
		option.fillColor = '#ff0000';
		polygon.setAttribute(option);
		
		var dispNm = jtgj.mc;
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
	var polygonMouseOut = function(e) {
		var polygon = e.target;
		var jtgj = polygon.data;
		var option = polygon.getAttribute();
		option.strokeColor = "#cfe7b4";
		option.fillColor = jtgj.ys;
		polygon.setAttribute(option);
		
		map.getOverlayLayer().removeOverlay(infoLabel);
	};
	//单击事件
	var polygonClick = function(e) {
		var polygon = e.target;
		var jtgj = polygon.data;
		var lngLatArray = TUtils.polygonStr2Path(jtgj.zb);
		map.setBestMap(lngLatArray);
		jtgjPanel.show(jtgj);
	};
	return {
		showLayer: showLayer,
		clear : clear
	}
})