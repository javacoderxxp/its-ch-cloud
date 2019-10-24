define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;

	var markers = [];//覆盖物列表
	var dataList = [];//数据列表
	gblMapObjs.gajgDataCluster;//聚合图
	var gajgPanel = require('./gajgPanel');
	
	//入口方法
	var showLayer = function(isShow, paramDataList) {
		clear();
		if(isShow) {
			loadData(paramDataList)
		}
	};
	//加载数据
	var loadData = function(paramDataList) {
		if(paramDataList){
			dataList = paramDataList;//传入的数据
			applyDataToUI();
		}else{//主动查询的数据
			if( markers.length == 0) {
				var url = "jtzt/gajg/allData";
				$.ajax({
					type: "GET",
					url: url,
					success: function(rstl){
						if(rstl.code === 200){
							dataList = rstl.gajgList;
							applyDataToUI();
						}else{
							alert(rstl.msg);
						}
					}
				});
			} else {
				for(var i = 0; i < markers.length; i++) {
					var marker = markers[i];
					marker.show();
				}
			}
		}
	};
	//数据应用到视图
	var applyDataToUI = function() {
		for(var i = 0; i < dataList.length; i++){
			var gajg = dataList[i];
			if(gajg.zb){
				var pos = gajg.zb.split(",");
				markerOpts.icon = new IMAP.Icon("./assets/images/gajg.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
				var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
				marker.data = gajg;
				marker.addEventListener(IMAP.Constants.CLICK, markerClick);
				marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);

				map.getOverlayLayer().addOverlay(marker, false);
				marker.setTitle(gajg.mc);
				markers.push(marker);
			}
		}
		gblMapObjs.gajgMarkers = markers;
		//创建聚合管理对象
		map.plugin(['IMAP.DataCluster'], function(){
			gblMapObjs.gajgDataCluster = new IMAP.DataCluster(map, markers, {
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
				gblMapObjs.gajgDataCluster.setMaxZoom(100,true);
			}else{
				gblMapObjs.gajgDataCluster.setMaxZoom(0,true);
			}
		});
		layer.msg('加载了'+markers.length+"个公安机关点位");
	};
	//清除数据
	var clear= function() {
		//清除界面
		for (var i = 0; i < markers.length; i++) {
			map.getOverlayLayer().removeOverlay(markers[i]);
		}
		//清除聚合图
		if(gblMapObjs.gajgDataCluster){
			gblMapObjs.gajgDataCluster.clearMarkers();
//			dataCluster.setMap(null);
		}
		
		markers = [];
		gblMapObjs.gajgMarkers = [];
		//清除数据
		dataList = [];
	};
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		var gajg = e.target.data;
		map.setCenter(e.lnglat,18);
		alert('名称:'+gajg.mc);
	};
	//右击事件
	var rightClick = function(e) {
		var marker = e.target;
		var gajg = e.target.data;
		//右键菜单
		var contextMen = '<div class="self-menu"><span class="detailspan viewDtl" >查看详情</span>';
		CustomContextMenu.setContent(contextMen, e, 100, 30);
		$(".viewDtl").bind("click",function(){
			CustomContextMenu.close();
//			alert('设备编码:'+gajg.deviceId+"<br/>设备名称:"+gajg.deviceName);
			gajgPanel.show(gajg);
		})
		
	};
	return {
		showLayer: showLayer,
		clear : clear
	}
})