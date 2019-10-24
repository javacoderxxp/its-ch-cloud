define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/aqxc.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));

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
				markers.push(marker);
			}
		}
		layer.msg('加载了 '+markers.length+" 个安全宣传数据");
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
		map.setCenter(e.lnglat,16);
		var policeName = "";
		if(data.policeName == "1"){
			policeName = "宣传民警："+data.policeName+"，编号："+data.policeNo;
		}
		alert(policeName+"</br>宣传时间："+data.qwRecordDt+"</br>宣传内容："+data.qwTypeDesc);
	};
	
	return {
		loadData: loadData
	}
})