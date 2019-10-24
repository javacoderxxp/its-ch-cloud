define(function(require) {
	var map = require('mainMap');
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/location.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));

	var signalingLines = [];//覆盖物列表
	var dataList = [];//数据列表
	//gblMapObjs.signalingDataCluster;//聚合图
	var signalingPanel = require('./signalingPanel');
	var setIntervalgtime;//定时器
	/*
	 *显示 showLayer -> loadData -> apply data to ui  -> add business function to marker
	 *清除 clear ui -> clear data
	*/
	//入口方法
	var showLayer = function(isShow, paramDataList) {
		clear();
		if(isShow) {
			loadData(paramDataList);
			if(setIntervalgtime){
				clearInterval(setIntervalgtime);
			}
			setIntervalgtime=setInterval(function(){loadData(paramDataList)},60000); 
		}else {
			if(setIntervalgtime){
				clearInterval(setIntervalgtime);
			}
		}
	};
	//加载数据
	var loadData = function(paramDataList) {
		if(paramDataList){
			dataList = paramDataList;//传入的数据
			applyDataToUI();
		}else{//主动查询的数据
			layer.load();
			var url = "phone/signaling/allData";
			$.ajax({
				type: "GET",
				url: url,
				success: function(rslt){
					layer.closeAll('loading');
					if(rslt.code == 200){
						dataList = rslt.signalingList;
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
			var signaling = dataList[i];
			if(signaling.description){
				var pos = signaling.description.split(",");
				if(pos.length < 4 || (pos.length%2) != 0){
					continue;
				}
				var lnglatarr = [];
				for(var j=0; j<pos.length; j+=2){
					lnglatarr.push(new IMAP.LngLat(pos[j],pos[j+1]));
				}
				var plo = new IMAP.PolylineOptions();
				if(signaling.state == 2){
					plo.strokeColor = "#FFA500";
				}else if(signaling.state == 3){
					plo.strokeColor = "#ff0000";
				}
				plo.strokeOpacity = "1";
				plo.strokeWeight = "5";
				plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;//虚线
				plo.editabled = false;
				plo.strokeStyle = "1"
				var polyline = new IMAP.Polyline(lnglatarr, plo);
				polyline.data = signaling;
				map.getOverlayLayer().addOverlay(polyline, false);
				signalingLines.push(polyline);
			}
		}
		gblMapObjs.signalingLines = signalingLines;

		layer.msg('加载了'+dataList.length+"个手机信令");
	};
	//清除数据
	var clear = function() {
		//清除界面
		for (var i = 0; i < signalingLines.length; i++) {
			map.getOverlayLayer().removeOverlay(signalingLines[i]);
		}
		
		signalingLines = [];
		gblMapObjs.signalingLines = [];
		//清除数据
		dataList = [];
	};
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		var signaling = e.target.data;
		map.setCenter(e.lnglat,18);
		alert('编码:'+signaling.id);
	};
	//右击事件
	var rightClick = function(e) {
		var marker = e.target;
		var signaling = e.target.data;
		//右键菜单
		var contextMen = '<div class="self-menu"><span class="detailspan viewDtl" >查看详情</span>';
		CustomContextMenu.setContent(contextMen, e, 100, 30);
		$(".viewDtl").bind("click",function(){
			CustomContextMenu.close();
			signalingPanel.show(signaling);
		})
		
	};
	return {
		showLayer: showLayer,
		clear : clear
	}
})