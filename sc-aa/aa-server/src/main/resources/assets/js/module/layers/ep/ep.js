define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;

	var markers = [];//覆盖物列表
	var dataList = [];//数据列表
	gblMapObjs.epDataCluster;//聚合图
	var epPanel = require('./epPanel');
	var vehiclePass = require('./vehiclePass');
	
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
				var url = "dev/ep/allData";
				$.ajax({
					type: "GET",
					url: url,
					success: function(rstl){
						if(rstl.code === 200){
							dataList = rstl.epList;
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
			var ep = dataList[i];
			if(ep.shape){
				var pos = ep.shape.split(",");
				markerOpts.icon = new IMAP.Icon( ep.status == 0 ? "./assets/images/elecPolice.png" : "./assets/images/elecPoliceOffline.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
				marker.data = ep;
				//marker.addEventListener(IMAP.Constants.MOUSE_OVER, markerMouseOver);
				//marker.addEventListener(IMAP.Constants.MOUSE_OUT, markerMouseOut);
				marker.addEventListener(IMAP.Constants.CLICK, markerClick);
				marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);

				map.getOverlayLayer().addOverlay(marker, false);
				marker.setTitle(ep.deviceName+"("+ep.deviceId+")");
				markers.push(marker);
			}
		}
		gblMapObjs.epMarkers = markers;
		/*//创建聚合管理对象
		map.plugin(['IMAP.DataCluster'], function(){
			gblMapObjs.epDataCluster = new IMAP.DataCluster(map, markers, {
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
				gblMapObjs.epDataCluster.setMaxZoom(100,true);
			}else{
				gblMapObjs.epDataCluster.setMaxZoom(0,true);
			}
		});*/
		layer.msg('加载了'+markers.length+"台卡口电警");
	};
	//清除数据
	var clear= function() {
		//清除界面
		for (var i = 0; i < markers.length; i++) {
			map.getOverlayLayer().removeOverlay(markers[i]);
		}
		//清除聚合图
		if(gblMapObjs.epDataCluster){
			gblMapObjs.epDataCluster.clearMarkers();
//			dataCluster.setMap(null);
		}
		
		markers = [];
		gblMapObjs.epMarkers = [];
		//清除数据
		dataList = [];
		vehiclePass.hide();
	};
	//鼠标移入事件
	/*var markerMouseOver = function(e) {
		var marker = e.target;
		var ep = marker.data;
		marker.setLabel(ep.deviceName+"("+ep.deviceId+")", {
			anchor: IMAP.Constants.BOTTOM_CENTER,
			offset: new IMAP.Pixel(0,-25),//相对于基点的位置
			fontColor : "#ff0000",
			fontSize : 12,
			fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
			visible : true
		});
	};
	//鼠标移出事件
	var markerMouseOut = function(e) {
		var marker = e.target;
		var ep = marker.data;
		//var infoLabel = marker.getLabel();
		//marker.removeLabel();
	};*/
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		var ep = e.target.data;
		map.setCenter(e.lnglat,18);
		alert('设备编码:'+ep.deviceId+"<br/>设备名称:"+ep.deviceName);
	};
	//右击事件
	var rightClick = function(e) {
		var marker = e.target;
		var ep = e.target.data;
		var isRestriction = "";
		var isImportant = "";
		if(ep.restriction == 0){
			isRestriction = "禁止过车照片开放";
		}else{
			isRestriction = "开启过车照片开放";
		}
		if(ep.important == '0'){
			isImportant = "设置为重点卡口";
		} else {
			isImportant = "取消重点卡口";
		}
		//右键菜单
		var contextMen = '<div class="self-menu">'
			+'<span class="detailspan viewDtl" >查看详情</span>'
			+'<span class="detailspan queryVehPass">查询过车</span>'
			+'<span class="detailspan epRestriction">'+isRestriction+'</span>'
			+'<span class="detailspan epImportant">'+isImportant+'</span>'
			+'<span class="detailspan maintainEp">设备报修</span>'
			+'</div>';
		CustomContextMenu.setContent(contextMen, e, 100, 60);
		$(".viewDtl").bind("click",function(){
			CustomContextMenu.close();
//			alert('设备编码:'+ep.deviceId+"<br/>设备名称:"+ep.deviceName);
			epPanel.show(ep);
		})
		
		$(".queryVehPass").bind( "click", function() {
			CustomContextMenu.close();
			vehiclePass.show(ep);
		});
		
		if("" != isRestriction){
			$(".epRestriction").bind( "click", function() {
				CustomContextMenu.close();
				openOrRestrictionEp(ep);
			});
		}
		
		if("" != isImportant){
			$(".epImportant").bind( "click", function() {
				CustomContextMenu.close();
				setOrCancelImportantEp(ep);
			});
		}
		
		if("" != isImportant){
			$(".maintainEp").bind( "click", function() {
				CustomContextMenu.close();
				var ep = e.target.data;
				require(['panels/facilitiesRepairPanel/facilitiesRepair'],function(facilitiesRepair){
					facilitiesRepair.show(ep.deviceId,6,ep.shape);
				});
			});
		}
	};
	
	var openOrRestrictionEp = function(ep){
		if(ep){
			var url = "dev/ep/updateRestrictionStatus/" + ep.id +"?isOpen="+ep.restriction;
			$.ajax({
				type: "GET",
				url: url,
				success: function(rstl){
					if(rstl.code === 200){
						layer.msg("操作成功");
						if(ep.restriction == 0){
							ep.restriction=1;
						}else{
							ep.restriction=0;
						}
					}else{
						alert(rstl.msg);
					}
				}
			});
		}
	}
	
	var setOrCancelImportantEp = function(ep){
		if(ep){
			var url = "dev/ep/updateImportantStatus/" + ep.id +"?isImportant="+ep.important;
			$.ajax({
				type: "GET",
				url: url,
				success: function(rstl){
					if(rstl.code === 200){
						layer.msg("操作成功");
						if(ep.important == '0'){
							ep.important='1';
						}else{
							ep.important='0';
						}
					}else{
						alert(rstl.msg);
					}
				}
			});
		}
	}
	
	return {
		showLayer: showLayer,
		clear : clear
	}
})