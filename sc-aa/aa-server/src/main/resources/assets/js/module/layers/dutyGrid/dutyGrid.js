define(function(require) {
	var map = require('mainMap');
	
	var dutyGridPolygons = [],infoLabels = [];//覆盖物列表
	var data = null;
	//加载数据
	var loadData = function(dat) {
		clear();
		if(dat){
			data = dat;//传入的数据
			applyDataToUI();
		}
	};
	//数据应用到视图
	var applyDataToUI = function() {
		if(!data){
			return;
		}
		
		var url = "qw/dutyGrid/getDutyAreaByGroupIdAndGridId?groupId="+data.groupId+"&gridId="+data.gridId;
	    $.get(url, function(r){
			if(r.code == 200){
				var dutyAreaList = r.dutyAreaList;
				for(var i =0; i < dutyAreaList.length; i++){
					var dg = dutyAreaList[i];
					var polygon = TUtils.polygonStr2Path(dg.shape);
					var polygonOpt = {
						"editable": false,
						"fillColor" : dg.fillColor,
						"fillOpacity " : 0.5,
						"strokeColor  " : '#8B7B8B',
						"strokeOpacity" : 1,
						"strokeWeight" : 2,
						"strokeStyle" : "solid"};
					var dutyGridPolygon = new IMAP.Polygon(polygon, polygonOpt);
					dutyGridPolygon.data = dg;
					map.getOverlayLayer().addOverlay(dutyGridPolygon, true);
					dutyGridPolygons.push(dutyGridPolygon);
					
					/*
					var infoLabel = new IMAP.Label(dg.group.groupName+"["+dg.gridId+"]<br/>"+dg.userNames, {
						position : dutyGridPolygon.getBounds().getCenter(),// 基点位置
						offset: new IMAP.Pixel(0,-25),//相对于基点的位置
						anchor : IMAP.Constants.BOTTOM_CENTER,
						fontSize : 8,
						fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
						fontColor : "#222222"
					});
					map.getOverlayLayer().addOverlay(infoLabel, false);
					infoLabels.push(infoLabel);
					*/
				}
			}else{
				alert(r.msg);
			}
		});
	};
	//清除数据
	var clear = function() {
		for (var i = 0; i < dutyGridPolygons.length; i++) {
			map.getOverlayLayer().removeOverlay(dutyGridPolygons[i]);
		}
		for (var i = 0; i < infoLabels.length; i++) {
			map.getOverlayLayer().removeOverlay(infoLabels[i]);
		}
		
		require(['bottomPanel/gridLedgerPanel'],function(grid){
			grid.clearGrid();
        });
		
		infoLabels = [];
		dutyGridPolygons = [];
	};
	
	return {
		loadData: loadData
	}
})