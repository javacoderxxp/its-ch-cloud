define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/location.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));

	var markers = [];//覆盖物列表
	var dataList = [];//数据列表
	//gblMapObjs.driverCardDataCluster;//聚合图
	var driverCardPanel = require('./driverCardPanel');
	
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
			var url = "qw/driverCard/allData";
			$.ajax({
				type: "GET",
				url: url,
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.driverCardList;
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
			var driverCard = dataList[i];
			if(driverCard.zb){
				var pos = driverCard.zb.split(",");
				var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
				marker.data = driverCard;
				marker.addEventListener(IMAP.Constants.CLICK, markerClick);
				marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);

				map.getOverlayLayer().addOverlay(marker, false);
				marker.setTitle(driverCard.id);
				markers.push(marker);
			}
		}
		gblMapObjs.driverCardMarkers = markers;
		//创建聚合管理对象
		map.plugin(['IMAP.DataCluster'], function(){
			gblMapObjs.driverCardDataCluster = new IMAP.DataCluster(map, markers, {
				maxZoom: 0, //比例尺级别
				gridSize: 80, //网格缓冲的像素值，默认为60。
				zoomOnClick: true, //点击放大
				minimumClusterSize: 2,//最小聚合数 
				styles: dataClusterStyle
			});
		});
		//当前地图级别大于18是  取消聚合图   全部显示
		map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			var mZoom= map.getZoom();
			if(mZoom>=18){
				gblMapObjs.driverCardDataCluster.setMaxZoom(100,true);
			}else{
				gblMapObjs.driverCardDataCluster.setMaxZoom(0,true);
			}
		});
		layer.msg('加载了'+dataList.length+"个驾驶证表");
	};
	//清除数据
	var clear = function() {
		//清除界面
		for (var i = 0; i < markers.length; i++) {
			map.getOverlayLayer().removeOverlay(markers[i]);
		}
		//清除聚合图
		if(gblMapObjs.driverCardDataCluster){
			gblMapObjs.driverCardDataCluster.clearMarkers();
//			dataCluster.setMap(null);
		}
		
		markers = [];
		gblMapObjs.driverCardMarkers = [];
		//清除数据
		dataList = [];
	};
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		var driverCard = e.target.data;
		map.setCenter(e.lnglat,18);
		alert('编码:'+driverCard.id);
	};
	//右击事件
	var rightClick = function(e) {
		var marker = e.target;
		var driverCard = e.target.data;
		//右键菜单
		var contextMen = '<div class="self-menu"><span class="detailspan viewDtl" >查看详情</span>';
		CustomContextMenu.setContent(contextMen, e, 100, 30);
		$(".viewDtl").bind("click",function(){
			CustomContextMenu.close();
			driverCardPanel.show(driverCard);
		})
		
	};
	return {
		showLayer: showLayer,
		clear : clear
	}
})