define(function(require) {
	var Vue = require('vue');
	var map = require('mainMap');
	//var htmlStr = require('text!./bzEditPanel.html');

	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/bztp.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.CENTER;
	
	var markers = [], rightContMenu = null;//覆盖物列表
	var infoLabel = null;
	gblMapObjs.bzDataCluster;//聚合图
	
	//入口方法
	var showLayer = function(isShow, type, paramDataList) {
		bzApp.clear();
		if (isShow) {
			bzApp.loadData(type, paramDataList);
		}
	};
	
    var bzApp = new Vue({
    	el:'#bz-app',
    	data:{
    		title: null,
    		bzCtrlerQ: {}, //查询参数
    		bzCtrler: {},
    		type: '',
    		bzCtrlerList:[]
    	},
    	methods: {
    		loadData: function (type, paramDataList) {
    			bzApp.type = type;
    			if(paramDataList){
					bzApp.bzCtrlerList = paramDataList;
					bzApp.applyDataToUI();
    			}else{
    				layer.load();
    				var mapBounds = TUtils.mapBounds2Str(map.getBounds());
    				$.ajax({
    					url: "./jtss/bz/allData?lb="+type+"&mapBounds="+mapBounds+"&xs=-1",
    					success: function(rslt){
    						layer.closeAll('loading');
    						if(rslt.code == 200){
    							bzApp.bzCtrlerList = rslt.bzList;
    							bzApp.applyDataToUI();
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
    			}
    		},
    		applyDataToUI : function() {
				for (var i = 0; i < bzApp.bzCtrlerList.length; i++) {
					var bzCtrler = bzApp.bzCtrlerList[i];
					if(bzCtrler.zb){
						var pos = bzCtrler.zb.split(",");
						switch (bzApp.type) {
						case '指示标志/指路标志':
							markerOpts.icon = new IMAP.Icon("./assets/images/bz_zs.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
							break;
						case '禁令标志':
							markerOpts.icon = new IMAP.Icon("./assets/images/bz_jl.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
							break;
						case '警告标志':
							markerOpts.icon = new IMAP.Icon("./assets/images/bz_jg.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
							break;
						case '辅助标志':
							markerOpts.icon = new IMAP.Icon("./assets/images/bz_fz.png", new IMAP.Size(32, 18), new IMAP.Pixel(0, 0));
							break;
						case '旅游区标志':
							markerOpts.icon = new IMAP.Icon("./assets/images/bz_lyq.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
							break;
						case '其他标志':
							markerOpts.icon = new IMAP.Icon("./assets/images/bz_qt.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
							break;
						default:
							break;
						}
						
						
						var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
						marker.data = bzCtrler;
						//事件
						marker.addEventListener(IMAP.Constants.CLICK, bzApp.markerClick);
						var contextMen = '<div class="self-menu">'
							/*+'<span class="querzbz detailspan">信息维护</span>'*/
							+'<span class="keepbz detailspan">设施报修</span></div>';
						//右击事件
						marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, function(e,b) {
							CustomContextMenu.setContent(contextMen,e,100,60);
							/*$(".querzbz").on( "click", function() {
								CustomContextMenu.close();
								var bz = e.target.data;
								require(['layers/bzPanel/bzListPanel'],function(bzListPanel){
									bzListPanel.show(bz.id);
								});
							});*/
							
							$(".keepbz").on( "click", function() {
								CustomContextMenu.close();
								var bz = e.target.data;
								require(['panels/facilitiesRepairPanel/facilitiesRepair'],function(facilitiesRepair){
									facilitiesRepair.show(bz.bh,4,bz.zb);
								});
							});
						});
						map.getOverlayLayer().addOverlay(marker, false);
						marker.setTitle(bzCtrler.mc+"("+bzCtrler.bh+")");
	
						markers.push(marker);
					}
				}
				gblMapObjs.bzMarkers = markers;
				//创建聚合管理对象
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.bzDataCluster = new IMAP.DataCluster(map, markers, {
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
			        	gblMapObjs.bzDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.bzDataCluster.setMaxZoom(0,true);
			        }
			    });
				
				layer.msg('加载了'+bzApp.bzCtrlerList.length+"个交通标志");
    		},
    		clear: function() {
    			//清除界面
    			for (var i = 0; i < markers.length; i++) {
    				map.getOverlayLayer().removeOverlay(markers[i]);
    			}
    			//清除聚合图
    			if(gblMapObjs.bzDataCluster){
    				gblMapObjs.bzDataCluster.clearMarkers();
    			}
    			markers = [];
				gblMapObjs.bzMarkers = [];
    			//清除数据
    			bzApp.bzCtrler = {};
    			bzApp.bzCtrlerList = [];
    		},
    		markerClick: function (e) {
    			var marker = e.target;
				var bz = e.target.data;
				map.setCenter(e.lnglat,19);
				alert('名称:'+bz.mc);
    		},
			close: function() {//关闭面板
				itsGlobal.hideLeftPanel();
			}
    	}
    });

    var clear = function(){
    	bzApp.clear();
    }
    
	return {
		showLayer : showLayer,
		clear : clear
	}
})