define(function(require) {
	var map = require('mainMap');
	var markerOpts = new IMAP.MarkerOptions();
	var iconB = new IMAP.Icon("./assets/images/yljhjg.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	markerOpts.icon= iconB;
	
	var markers = [];//覆盖物列表
	var dataList = [];//数据列表
	var infoLabel = null;
	var yljhjgPanel = require('./yljhjgPanel');
	/*gblMapObjs.yljhjgMarkers='';
	gblMapObjs.yljhjgDataCluster ='';*/
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
			$.ajax({
				url: "jtzt/yljhjg/allData",
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.yljhjgList;
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
			var pos = obj.zb.split(",");
			var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
			marker.data = obj;//marker绑定数据
			marker.addEventListener(IMAP.Constants.CLICK, markerClick);
			marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
			
			map.getOverlayLayer().addOverlay(marker, false);
			marker.setTitle(obj.mc);
			markers.push(marker);
		}
		gblMapObjs.yljhjgMarkers=markers;
		//创建聚合管理对象
		map.plugin(['IMAP.DataCluster'], function(){
			gblMapObjs.yljhjgDataCluster = new IMAP.DataCluster(map, markers, {
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
	        	gblMapObjs.yljhjgDataCluster.setMaxZoom(100,true);
	        }else{
	        	gblMapObjs.yljhjgDataCluster.setMaxZoom(0,true);
	        }
	    });
		layer.msg('加载了'+markers.length+"个医疗机构");	
	};
	//清除数据
	var clear = function() {
		//清除界面元素
		for(var i = 0; i < markers.length; i++){
			map.getOverlayLayer().removeOverlay(markers[i]);
		}
		//清除聚合图
		if(gblMapObjs.yljhjgDataCluster){
			gblMapObjs.yljhjgDataCluster.clearMarkers();
		}
		markers = [];
		gblMapObjs.yljhjgMarkers=[];
		//清除数据
		dataList = [];
	};
	//鼠标移入事件
	var markerMouseOver = function(e) {
		var marker = e.target;
	};
	//鼠标移出事件
	var markerMouseOut = function(e) {
		var marker = e.target;
	};
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		var yljhjg = marker.data;
		alert("医疗机构名称:"+yljhjg.mc);
	};
	
	//右击事件
	var rightClick = function(e) {
		var marker = e.target;
		var yljhjg = e.target.data;
		//右键菜单
		var contextMen = '<div class="self-menu"><span class="detailspan viewDtl" >查看详情</span>';
		CustomContextMenu.setContent(contextMen, e, 100, 30);
		$(".viewDtl").bind("click",function(){
			CustomContextMenu.close();
			yljhjgPanel.show(yljhjg);
		})
		
	};
	
	return {
		showLayer : showLayer
	}
})