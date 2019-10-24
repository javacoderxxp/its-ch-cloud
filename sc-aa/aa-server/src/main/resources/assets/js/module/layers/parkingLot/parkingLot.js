define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/parkingLot.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));

	var markers = [];//覆盖物列表
	var dataList = [];//数据列表
	//gblMapObjs.parkingLotDataCluster;//聚合图
	var parkingLotPanel = require('./parkingLotPanel');
	var infoLabelOthers = [];
	
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
			var url = "jcsj/parkingLot/allData";
			$.ajax({
				type: "GET",
				url: url,
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.parkingLotList;
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
			var parkingLot = dataList[i];
			if(parkingLot.zb){
				var pos = parkingLot.zb.split(",");
				var percent = parkingLot.seatIdle*1.0/parkingLot.parkCapacity;
				if(percent > 0.8){
					markerOpts.icon = new IMAP.Icon("./assets/images/parkingLot_g.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}else if(percent > 0.2){
					markerOpts.icon = new IMAP.Icon("./assets/images/parkingLot_y.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}else {
					markerOpts.icon = new IMAP.Icon("./assets/images/parkingLot_r.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}
				var markerPnt = new IMAP.LngLat(pos[0], pos[1]);
				var marker = new IMAP.Marker(markerPnt, markerOpts);
				marker.data = parkingLot;
				marker.addEventListener(IMAP.Constants.CLICK, markerClick);
				marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);

				map.getOverlayLayer().addOverlay(marker, false);
				marker.setTitle(parkingLot.parkName+"("+parkingLot.seatIdle+"/"+parkingLot.parkCapacity+")[更新时刻:"+parkingLot.updateDt+"]");
				markers.push(marker);
				
				var infoLabel = new IMAP.Label(parkingLot.parkName+"("+parkingLot.seatIdle+"/"+parkingLot.parkCapacity+")", {
					position : markerPnt,// 基点位置
					offset: new IMAP.Pixel(0,-25),//相对于基点的位置
					anchor : IMAP.Constants.BOTTOM_CENTER,
					fontSize : 8,
					fontBold : true,// 在html5 marker的情况下，是否允许marker有背景
					fontColor : "#0066cc"
				});
				map.getOverlayLayer().addOverlay(infoLabel, false);
				infoLabelOthers.push(infoLabel);
			}
		}
		gblMapObjs.parkingLotMarkers = markers;
		/*//创建聚合管理对象
		map.plugin(['IMAP.DataCluster'], function(){
			gblMapObjs.parkingLotDataCluster = new IMAP.DataCluster(map, markers, {
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
				gblMapObjs.parkingLotDataCluster.setMaxZoom(100,true);
			}else{
				gblMapObjs.parkingLotDataCluster.setMaxZoom(0,true);
			}
		});*/
		layer.msg('加载了'+markers.length+"个停车场");
	};
	//清除数据
	var clear = function() {
		//清除界面
		for (var i = 0; i < markers.length; i++) {
			map.getOverlayLayer().removeOverlay(markers[i]);
		}
		//清除聚合图
		if(gblMapObjs.parkingLotDataCluster){
			gblMapObjs.parkingLotDataCluster.clearMarkers();
//			dataCluster.setMap(null);
		}
		for (var i = 0; i < infoLabelOthers.length; i++) {
			map.getOverlayLayer().removeOverlay(infoLabelOthers[i]);
		}
		
		markers = [];
		gblMapObjs.parkingLotMarkers = [];
		//清除数据
		dataList = [];
	};
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		var parkingLot = e.target.data;
		map.setCenter(e.lnglat,18);
		alert(parkingLot.parkName+"("+parkingLot.seatIdle+"/"+parkingLot.parkCapacity+")<br/>[更新时刻:"+parkingLot.updateDt+"]");
	};
	//右击事件
	var rightClick = function(e) {
		var marker = e.target;
		var parkingLot = e.target.data;
		//右键菜单
		var contextMen = '<div class="self-menu"><span class="detailspan viewDtl" >查看详情</span>';
		CustomContextMenu.setContent(contextMen, e, 100, 30);
		$(".viewDtl").bind("click",function(){
			CustomContextMenu.close();
			parkingLotPanel.show(parkingLot);
		})
		
	};
	return {
		showLayer: showLayer,
		clear : clear
	}
})