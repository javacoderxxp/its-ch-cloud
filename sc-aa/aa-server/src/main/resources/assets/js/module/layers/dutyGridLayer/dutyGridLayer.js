define(function(require) {
	var map = require('mainMap');
	var polygons = [];//覆盖物列表
	var dataList = [];//数据列表
	var infoLabel = null;
	
	var infoLabelAll = [];

	/*
	 *显示 showLayer -> loadData -> apply data to ui  -> add business function to marker
	 *清除 clear ui -> clear data
	*/
	//入口方法-加载数据
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
			var param = "";
			if(!currentUser.jjddUser){
//				param = "groupId="+currentUser.group.groupId;
			}
			var url = "qw/dutyGrid/findOtherList?"+param;
			$.ajax({
				url: url,
				success: function(r){
					layer.closeAll('loading');
					if(r.code == 200){
						dataList = r.dutyGridOtherList;
						applyDataToUI();
					}else{
						alert(r.msg);
					}
				}
			});
		}
	};
	//数据应用到视图
	var applyDataToUI = function() {
		if(dataList.length == 0){
			layer.msg("尚未添加勤务社区");
			return;
		}
		for(var idx =0; idx < dataList.length; idx++){
			var dutyGridTmp = dataList[idx];
			var polygonPathTmp = TUtils.polygonStr2Path(dutyGridTmp.shape);
			var polygonOpt = {
					'editabled': false,
					"fillColor" : '#6699cc',
					"fillOpacity " : 0.1,
					"strokeColor  " : '#8B7B8B',
					"strokeOpacity" : 0.5,
					"strokeWeight" : 1,
					"strokeStyle" : "solid",
				};
			polygonOpt.fillColor = dutyGridTmp.fillColor;
			var dutyGridPolygonTmp = new IMAP.Polygon(polygonPathTmp, polygonOpt);
			dutyGridPolygonTmp.data = dutyGridTmp;
			map.getOverlayLayer().addOverlay(dutyGridPolygonTmp, false);
			polygons.push(dutyGridPolygonTmp);
			
			var infoLabelTmp = new IMAP.Label("["+dutyGridTmp.group.groupName+"]"+dutyGridTmp.gridName+"<br/>("+dutyGridTmp.richUserNames+")", {
				position : dutyGridPolygonTmp.getBounds().getCenter(),// 基点位置
				offset: new IMAP.Pixel(0,-25),//相对于基点的位置
				anchor : IMAP.Constants.TOP_CENTER,
				fontSize : 10,
				fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
				fontColor : "#222222"
			});
			map.getOverlayLayer().addOverlay(infoLabelTmp, false);
			infoLabelAll.push(infoLabelTmp);
		}
		layer.msg('加载了'+polygons.length+"个责任区");

		map.addEventListener(IMAP.Constants.ZOOM_END,function(){
	        var mZoom= map.getZoom();
	        if(infoLabelAll){
		        if(mZoom>=14){
	    			for (var i = 0; i < infoLabelAll.length; i++) {
	    				infoLabelAll[i].visible(true);
	    			}
		        }else{
	    			for (var i = 0; i < infoLabelAll.length; i++) {
	    				infoLabelAll[i].visible(false);
	    			}
		        }
	        }
	    });
	};
	
	//清除数据
	var clear = function() {
		for (var i = 0; i < polygons.length; i++) {
			map.getOverlayLayer().removeOverlay(polygons[i]);
		}
		for (var i = 0; i < infoLabelAll.length; i++) {
			map.getOverlayLayer().removeOverlay(infoLabelAll[i]);
		}
		polygons = [];
		infoLabelAll = [];
	};
	
	//鼠标移入事件
	var polygonMouseOver = function(e) {
	};
	//鼠标移出事件
	var polygonMouseOut = function(e) {
	};
	//单击事件
	var polygonClick = function(e) {
	};
	
	return {
		showLayer: showLayer,
		clear : clear
	}
})