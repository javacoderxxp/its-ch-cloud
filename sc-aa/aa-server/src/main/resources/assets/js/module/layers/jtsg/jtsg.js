define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/accident.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));

	var markers = [];//覆盖物列表
	var dataList = [];//数据列表
	
	//加载数据
	var loadData = function(data) {
		clear();
		if(data){
			dataList = data;//传入的数据
			applyDataToUI();
		}
	};
	//数据应用到视图
	var applyDataToUI = function() {
		for(var i = 0; i < dataList.length; i++){
			var data = dataList[i];
			if(data.shape){
				var lngLat = TUtils.str2Lnglat(data.shape);
				var marker = new IMAP.Marker(lngLat, markerOpts);
				marker.data = data;
				marker.addEventListener(IMAP.Constants.CLICK, markerClick);
				map.getOverlayLayer().addOverlay(marker, false);
				markers.push(marker);
			}
		}
		layer.msg('加载了 '+markers.length+" 个交通事故数据");
	};
	//清除数据
	var clear = function() {
		for (var i = 0; i < markers.length; i++) {
			map.getOverlayLayer().removeOverlay(markers[i]);
		}
		markers = [];
		dataList = [];
	};
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		var data = e.target.data;
		map.setCenter(e.lnglat,17);
		var msg = "案发地点："+data.afdz+"</br>时间："+data.fasj
			+"</br>办案警员："+data.jbr+"</br>详情："+data.jyaq;
		alert(msg);
	};
	
	return {
		loadData: loadData
	}
})