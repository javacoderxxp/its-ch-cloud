define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/punish.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));

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
			if(data.longitude && data.latitude){
				var marker = new IMAP.Marker(new IMAP.LngLat(data.longitude, data.latitude), markerOpts);
				marker.data = data;
				marker.addEventListener(IMAP.Constants.CLICK, markerClick);
				map.getOverlayLayer().addOverlay(marker, false);
				var type = "一般处罚";
				if(data.type == "1"){
					type = "强制处罚";
				}
				marker.setTitle(type+"，处罚时间："+data.violatedDt+"，处理警员编号："+data.punisherNo);
				markers.push(marker);
			}
		}
		layer.msg('加载了 '+markers.length+" 个违法处罚数据");
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
		map.setCenter(e.lnglat,18);
		var type = "一般处罚";
		if(data.type == "1"){
			type = "强制处罚";
		}
		alert(type+"</br>处罚时间："+data.violatedDt+"</br>处理警员编号："+data.punisherNo+"</br>被罚者："+data.violatedName);
	};
	
	return {
		loadData: loadData
	}
})