define(function(require) {
	var Vue = require('vue');
	var map = require('mainMap');
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.editabled = false;
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	//图标列表
	var markers = [];
	var infoLabel = null;
	//表单
	var showLayer = function(isShow, paramDataList) {
		vmsApp.clear();
		if (isShow) {
			vmsApp.loadData(paramDataList);
		}
	};
	
    var vmsApp = new Vue({
    	el:'#vms-app',
    	data:{
    		title: null,
    		vms: {},
    		vmsList:[]
    	},
    	methods: {
    		loadData: function (paramDataList) {
    			if(paramDataList){
    				vmsApp.vmsList = paramDataList;//传入的数据
    				vmsApp.applyDataToUI();
    			}else{//主动查询的数据
    				$.ajax({
    					url: "vms/getAllVms",
    					success: function(rslt){
    						if(rslt.code == 200){
    							vmsApp.vmsList = rslt.vmsList;
    							vmsApp.applyDataToUI();
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
    			}
    		},
    		
    		//数据应用到视图
    		applyDataToUI : function() {
    			for(var i = 0; i < vmsApp.vmsList.length; i++){
					var vms = vmsApp.vmsList[i];
					if(!vms.shape){
						continue;
					}
					var pos = vms.shape.split(",");
					markerOpts.icon = new IMAP.Icon(vms.status == "0"?"./assets/images/vms.png":"./assets/images/vms1.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
					var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
					marker.data = vms;
					//事件
					marker.addEventListener(IMAP.Constants.CLICK, vmsApp.markerClick);
//					marker.addEventListener(IMAP.Constants.MOUSE_OVER, vmsApp.markerMouseOver);
//					marker.addEventListener(IMAP.Constants.MOUSE_OUT, vmsApp.markerMouseOut);
					//右击事件
					marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, vmsApp.markerRightClick);

					map.getOverlayLayer().addOverlay(marker, false);
					marker.setTitle(vms.vmsName+"("+vms.vmsId+")");
					markers.push(marker);
				}
    			layer.msg('加载了'+vmsApp.vmsList.length+"个诱导屏");
    		},
    		//鼠标移入事件
    		markerMouseOver : function(e) {
    			var marker = e.target;
    			var vms = marker.data;
    			
    			infoLabel = new IMAP.Label(vms.vmsName+"("+vms.vmsId+")", {
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
    		//单击事件
    		markerClick : function(e) {
    			var marker = e.target;
    			var vms = e.target.data;
				vmsApp.vms = e.target.data;
				if(vmsApp.vms.status == '1'){//离线不可点
    				return;
    			}
				
				require(['layers/vmsClick'],function(vmsClick){
					vmsClick.show(vms);
				});
				
    		},
    		//右击事件
    		markerRightClick : function(e) {
    			var marker = e.target;
    			var vms = e.target.data;
				//右键菜单
				
    			var contextMen = '<div class="self-menu"><span id="openScreenButton" class="detailspan" >开屏</span><span id="closeScreenButton" class="detailspan" >关屏</span>'
    				+'<span id="clearScreenButton" class="detailspan">清屏</span>'
    				+'<span class="querzvms detailspan">信息维护</span><span class="keepvms detailspan">设备报修</span></div>';
    			
    			CustomContextMenu.setContent(contextMen,e,100,60);
				$("#openScreenButton").on( "click", function() {
					$.ajax({
						type: "POST",
						url: "vms/powerOnOff?vmsId="+CustomContextMenu.overlay.data.vmsId+"&flag=1",
						async :false,
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功');
							}else{
								alert(rslt.msg);
							}
						}
					});
					  CustomContextMenu.close();
				});
				$("#closeScreenButton").on( "click", function() {
					$.ajax({
						type: "POST",
						url: "vms/powerOnOff?vmsId="+CustomContextMenu.overlay.data.vmsId+"&flag=0",
						async :false,
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功');
							}else{
								alert(rslt.msg);
							}
						}
					});
					  CustomContextMenu.close();
				});
				
				$("#clearScreenButton").on( "click", function() {
					$.ajax({
						type: "POST",
						url: "vms/clearScreen?vmsId="+CustomContextMenu.overlay.data.vmsId,
						async :false,
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功');
							}else{
								alert(rslt.msg);
							}
						}
					});
					  CustomContextMenu.close();
				});
				
				$(".querzvms").on( "click", function() {
					CustomContextMenu.close();
					var vms = e.target.data;
					require(['layers/vmsCtrlHtml/vmsListPanel'],function(vmsListPanel){
						vmsListPanel.show(vms.id);
					});
				});
				/*$("#editvms").on( "click", function() {
					var vms = e.target.data;
					require(['layers/vmsCtrlHtml/vmsListPanel'],function(vmsListPanel){
						vmsListPanel.show(vms.id,false);
					});
				});*/
				
				$(".keepvms").on( "click", function() {
					CustomContextMenu.close();
					var vms = e.target.data;
					require(['panels/facilitiesRepairPanel/facilitiesRepair'],function(facilitiesRepair){
						facilitiesRepair.show(vms.vmsId,3,vms.shape);
					});
				});
    		},
    		clear: function() {
    			//清除界面
    			for (var i = 0; i < markers.length; i++) {
    				map.getOverlayLayer().removeOverlay(markers[i]);
    			}
    			markers = [];
    			//清除数据
    			vmsApp.vms = {};
    			vmsApp.vmsList = [];
    			require(['layers/vmsClick'],function(vmsClick){
					vmsClick.hide();
				});
    		},
    	}
    });
    
    var clear = function (){
    	vmsApp.clear();
    }
	return {
		showLayer : showLayer,
		clear : clear
	}
})