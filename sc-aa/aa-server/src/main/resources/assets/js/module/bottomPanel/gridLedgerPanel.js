define(function(require) {
	var htmlStr = require('text!./gridLedgerPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var dutyGridRst = null;
	var dutyGridPolygon = null; 
	var marker;
	var win_taizhangSummary = null;
	var lnglat =null;
	
	var show = function(lnglatParam) {
		lnglat = lnglatParam;
		loadData();
	}
	
	var loadData = function() {
		openSummaryWin();
		
		var url =  "qw/dutyGrid/getDutyGridByPoint?lnglat="+lnglat;
		$.ajax({
		    url: url,
		    success: function(rslt){
				if(rslt.code == 200){
					dutyGridRst = rslt.dutyGrid;
					if(!dutyGridRst){
						layer.msg("该位置不属于任何一个责任区！");
						return;
					}
					applyDataToUI();
				}else{
					//alert(rslt.msg);
				}
			}
		});
	};
	
	var applyDataToUI = function() {
		var bottomPanel = $("#taizhangPanel");
		bottomPanel.html(htmlStr);
		/*bottomPanel.fadeIn().css("display","inline-block");*/
		vm = new Vue({
			el: '#gridLedger-panel',
			data: {
				showList: true,
				dutyGrid: dutyGridRst,
				parkingLotList:[],
			},
			methods: {
				showDutyGrid: function () {
					vm.clearDutyGrid();
		    		var polygonPath = TUtils.polygonStr2Path(vm.dutyGrid.shape);
					dutyGridPolygon = new IMAP.Polygon(polygonPath, TConfig.V.dutyGridPolygonOpt);
					dutyGridPolygon.data = vm.dutyGrid;
		        	map.getOverlayLayer().addOverlay(dutyGridPolygon, true);
//		        	vm.openSummaryWin();
				},
				clearDutyGrid: function(){
					if(dutyGridPolygon){
						map.getOverlayLayer().removeOverlay(dutyGridPolygon);
						dutyGridPolygon = null; 
					}
				},
				showParkingLots: function () {
					layer.load();
					$.ajax({
						url: "jcsj/parkingLot/findListInPolygon?polygon="+vm.dutyGrid.shape,
						success: function(rslt){
							if(rslt.code == 200){
								layer.closeAll('loading');
								vm.parkingLotList = rslt.parkingLotList;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				locateParkingLot : function(zb) {
					if(zb){
						var lnglat = TUtils.str2Lnglat(zb);
						vm.showMarker(lnglat, "./assets/images/parkingLot.png");
						map.setCenter(lnglat);
					}
				},
				showMarker: function(lnglat, iconUrl){
					vm.clearMarker();
					var markerOpts = new IMAP.MarkerOptions();
					markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
					markerOpts.icon = new IMAP.Icon(iconUrl, new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
					marker = new IMAP.Marker(lnglat, markerOpts);
					map.getOverlayLayer().addOverlay(marker, false);
				},
				clearMarker: function(){
					if(marker){
						map.getOverlayLayer().removeOverlay(marker);
						marker = null;
					}
				},
				close: function() {
					vm.clearDutyGrid();
					vm.clearMarker();
					$("#bottomPanel").hide();
				}
			}
		});
		vm.showDutyGrid();
		
		vueEureka.set("bottomPanel", {
			vue: vm,
			description: "bottomPanel"
		});
	};

	var openSummaryWin = function() {
		var iWidth = window.screen.availWidth - 10;
		var iHeight = window.screen.availHeight - 40;
		var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
		var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
		if(win_taizhangSummary){
			win_taizhangSummary.close();
		}
		win_taizhangSummary = window.open(
			'qw/main/summary?lnglat='+lnglat,
			'taizhangSummaryWin',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=0,left=0,toolbar=yes,menubar=yes,scrollbars=no,resizable=yes,location=yes');
	}
	
	var hide = function() {
		$("#bottomPanel").hide();
	};
	var clearGrid = function(){
		if(dutyGridPolygon){
			map.getOverlayLayer().removeOverlay(dutyGridPolygon);
			dutyGridPolygon = null; 
		}
	};
	return {
		show: show,
		hide: hide,
		clearGrid:clearGrid
	};
})