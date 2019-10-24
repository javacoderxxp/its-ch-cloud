define(function(require) {
	var map = require('mainMap');
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/350M.png", new IMAP.Size(17, 31), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var markers = [];//覆盖物列表
	var dataList = [];//数据列表
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
			var obj = {};
			obj.shape = "121.128187, 31.464808";
			dataList.push(obj);
			applyDataToUI();
		}
	};
	//数据应用到视图
	var applyDataToUI = function() {
		for(var i = 0; i < dataList.length; i++){
			var obj = dataList[i];
			var pos = obj.shape.split(",");
			var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
//			marker.setLabel("329922", IMAP.Constants.BOTTOM_CENTER, new IMAP.Pixel(0,0));
			marker.data = obj;//marker绑定数据
			marker.addEventListener(IMAP.Constants.CLICK, markerClick);
			
			map.getOverlayLayer().addOverlay(marker, false);
			markers.push(marker);
		}
	};
	//清除数据
	var clear = function() {
		//清除界面元素
		for(var i = 0; i < markers.length; i++){
			map.getOverlayLayer().removeOverlay(markers[i]);
		}
		markers = [];
		//清除数据
		dataList = [];
	};
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		alert('点击了marker');
	};
	
	return {
		showLayer : showLayer
	}
})