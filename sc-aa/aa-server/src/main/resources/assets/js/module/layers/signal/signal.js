define(function(require) {
	var Vue = require('vue');
	var map = require('mainMap');
	//var htmlStr = require('text!./signalEditPanel.html');

	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/signal.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.CENTER;
	
	var markerOpts1 = new IMAP.MarkerOptions();
	markerOpts1.icon = new IMAP.Icon("./assets/images/signal1.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts1.anchor = IMAP.Constants.CENTER;
	
	var markerOpts2 = new IMAP.MarkerOptions();
	markerOpts2.icon = new IMAP.Icon("./assets/images/signal2.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts2.anchor = IMAP.Constants.CENTER;
	
	var markers = [], rightContMenu = null;//覆盖物列表
	var infoLabel = null;
	gblMapObjs.signalDataCluster;//聚合图
	
	var contextMenu = new IMAP.ContextMenu(false);
	var menuItem = new IMAP.MenuItem("编辑信息");
	menuItem.setCallback(function(a,b,c) {
		map.zoomIn(lnglat);
	});
	contextMenu.addItem(menuItem);
	
	//设置信号机点击状态是否可用
	var markersClickEventEnable = function(enable){
		for (var i = 0; i < markers.length; i++) {
			var mrk = markers[i];
			if(enable){
				mrk.addEventListener(IMAP.Constants.CLICK, signalApp.markerClick);
			}else{
				mrk.removeEventListener(IMAP.Constants.CLICK);
			}
		}
	}
	
	//入口方法
	var showLayer = function(isShow, paramDataList) {
		signalApp.clear();
		if (isShow) {
			signalApp.loadData(paramDataList);
			require(['./signalListHandler'],function(signalListHandler){
				signalListHandler.loadPanel(markers);
			});
		}
	};
	
    var signalApp = new Vue({
    	el:'#signal-app',
    	data:{
    		title: null,
    		signalCtrlerQ: {}, //查询参数
    		signalCtrler: {},
    		signalCtrlerList:[]
    	},
    	methods: {
    		loadData: function (paramDataList) {
    			if(paramDataList){
					signalApp.signalCtrlerList = paramDataList;
					signalApp.applyDataToUI();
    			}else{
    				$.ajax({
    					url: "dev/signalCtrler/allData/",
    					success: function(rslt){
    						if(rslt.code == 200){
    							signalApp.signalCtrlerList = rslt.signalCtrlerList;
    							signalApp.applyDataToUI();
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
    			}
    		},
    		applyDataToUI : function() {
				for (var i = 0; i < signalApp.signalCtrlerList.length; i++) {
					var signalCtrler = signalApp.signalCtrlerList[i];
					if(signalCtrler.shape){
						var pos = signalCtrler.shape.split(",");
						var opt = markerOpts;
						if(signalCtrler.status == '1'){
							opt = markerOpts1;
						}else if(signalCtrler.status == '2'){
							opt = markerOpts2;
						}
						var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), opt);
						marker.data = signalCtrler;
						//事件
						marker.addEventListener(IMAP.Constants.CLICK, signalApp.markerClick);
//						marker.addEventListener(IMAP.Constants.MOUSE_OVER, signalApp.markerMouseOver);
//						marker.addEventListener(IMAP.Constants.MOUSE_OUT, signalApp.markerMouseOut);
						var contextMen = '<div class="self-menu">'
							+'<span class="querzSignal detailspan">信息维护</span>'
							+'<span class="keepSignal detailspan">设备报修</span>'
							+'</div>';
						//右击事件
						marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, function(e,b) {
							CustomContextMenu.setContent(contextMen,e,100,60);
							$(".querzSignal").on( "click", function() {
								CustomContextMenu.close();
								var signal = e.target.data;
								require(['panels/facilitiesManagePanel/facilitiesManage'],function(facilitiesManage){
									facilitiesManage.show(signal.id);
								});
							});
							/*$(".editSignal").on( "click", function() {
								//CustomContextMenu.close();
								var signal = e.target.data;
								require(['layers/signal/signalEditPanel'],function(signalEditPanel){
									signalEditPanel.show(signal.id);
								});
							});*/
							
							$(".keepSignal").on( "click", function() {
								CustomContextMenu.close();
								var signal = e.target.data;
								//alert(signal.shape);
								require(['panels/facilitiesRepairPanel/facilitiesRepair'],function(facilitiesRepair){
									facilitiesRepair.show(signal.deviceId,1,signal.shape);
								});
							});
						});
	
						map.getOverlayLayer().addOverlay(marker, false);
						marker.setTitle(signalCtrler.deviceName+"("+signalCtrler.deviceId+")");
						markers.push(marker);
					}
				}
				gblMapObjs.signalMarkers = markers;
				/*
				//创建聚合管理对象
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.signalDataCluster = new IMAP.DataCluster(map, markers, {
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
			        	gblMapObjs.signalDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.signalDataCluster.setMaxZoom(0,true);
			        }
			    });*/
				layer.msg('加载了'+signalApp.signalCtrlerList.length+"台信号机");
    		},
    		clear: function() {
    			//清除界面
    			for (var i = 0; i < markers.length; i++) {
    				map.getOverlayLayer().removeOverlay(markers[i]);
    			}
    			//清除聚合图
    			if(gblMapObjs.signalDataCluster){
    				gblMapObjs.signalDataCluster.clearMarkers();
    			}
    			markers = [];
				gblMapObjs.signalMarkers = [];
    			//清除数据
    			signalApp.signalCtrler = {};
    			signalApp.signalCtrlerList = [];
    			require(['./signalListHandler'],function(signalListHandler){
    				signalListHandler.closePanel();
    			});
    		},
    		//鼠标移入事件
    		markerMouseOver : function(e) {
    			var marker = e.target;
    			var signal = marker.data;
    			
    			infoLabel = new IMAP.Label(signal.deviceName+"("+signal.deviceId+")", {
    				position : new IMAP.LngLat(e.lnglat.lng, e.lnglat.lat),// 基点位置
    				offset: new IMAP.Pixel(0,-25),//相对于基点的位置
    				anchor : IMAP.Constants.BOTTOM_CENTER,
    				title : "label",
    				fontColor : "#ff0000",
    				fontSize : 12,
    				fontBold : false
    			});
    			map.getOverlayLayer().addOverlay(infoLabel, false);
    		},
    		//鼠标移出事件
    		 markerMouseOut : function(e) {
    			var marker = e.target;
    			var cross = marker.data;
    			map.getOverlayLayer().removeOverlay(infoLabel);
    		},
    		markerClick: function (e) {
    			var marker = e.target;
				var signal = e.target.data;
				require(['./signalListHandler'],function(signalListHandler){
					signalListHandler.addSignal(signal);
				});
    		},
    		add: function () {
    			signalApp.title="新增";
    			signalApp.signalCtrler = {isNewRecord:true};
    		},
    		save: function () {
    		    //表单验证
    		    $("#detailForm").validate({
    		        invalidHandler : function(){//验证失败的回调
    		            return false;
    		        },
    		        submitHandler : function(){//验证通过的回调
    					var url = "dev/signalCtrler/save";
    					$.ajax({
    						type: "POST",
    					    url: url,
    					    data: JSON.stringify(signalApp.signalCtrler),
    					    success: function(rslt){
    					    	if(rslt.code === 200){
    					    		itsGlobal.hideLeftPanel();
        							alert('操作成功');
        							signalApp.load();
    							}else{
    								alert(rslt.msg);
    							}
    						}
    					});
    		            return false;//已经用AJAX提交了，需要阻止表单提交
    		        }
    			});
    		},
    		del: function () {
	    		var r=confirm("确定删除？");
	    		if (r==true){
    				$.ajax({
    					type: "POST",
    				    url: "dev/signalCtrler/delete/"+signalApp.signalCtrler.id,
    				    success: function(rslt){
    						if(rslt.code == 200){
    							itsGlobal.hideLeftPanel();
    							alert('操作成功');
    							signalApp.load();
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
    			}
    		},
			close: function() {//关闭面板
				itsGlobal.hideLeftPanel();
			}
    	}
    });
    
    var clear = function(){
    	signalApp.clear();
    }

	return {
		showLayer : showLayer,
		clear : clear,
		markersClickEventEnable:markersClickEventEnable
	}
})