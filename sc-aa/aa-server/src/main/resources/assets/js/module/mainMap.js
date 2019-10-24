define(function(){
	var marker = null; //右键位置
	var tool;//地图工具
	var contextMenuPositon = null, nearByResInfoWin = null,circleEditor = null,findCircle=null,centerMarker = null;
	//圆形范围搜索
	var globalPoiCycle, mapPoiContainer; //全局范围数据容器

	try{
		var markerOpts = new IMAP.MarkerOptions();
		markerOpts.icon = new IMAP.Icon("./assets/images/locate.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
		markerOpts.anchor = IMAP.Constants.CENTER;
		//初始化地图
		var mapOpt = {
			minZoom : 11, // 地图最小缩放级别
			maxZoom : 20, // 地图最大缩放级别
			zoom : 14,// 设置地图初始化级别
			center : new IMAP.LngLat(121.128187, 31.464808),// 设置地图中心点坐标
			animation : true
		};

		if(itsEnv != 'prod'){
			//SIT 不添加 tileUrl
		}else{
			mapOpt.tileUrl = ["http://{s}/v3/tile?z={z}&x={x}&y={y}",[host+":25333", host+":25333"]];
		}
		
		var map = new IMAP.Map("container", mapOpt); //地图实例化
		L.DomUtil.enableTextSelection();//解决地图不能选择的问题
		map.plugin(['IMAP.Tool']);//下载插件
		/*
		//################################测绘车道级别图层################################
		var laneLayer = new IMAP.TileLayer({
			tileSize: 256,
			maxZoom: 20,
			minZoom: 18,
		});
		
		if(itsEnv != 'prod'){
			laneLayer.setTileUrlFunc(function(x,y,z){
				//SIT
				return ("http://58.210.9.131/arcgis/rest/services/CS/TCS_ZNJT/MapServer/tile/" + z + "/" + y + "/" + x );
			});
		}else{
			laneLayer.setTileUrlFunc(function(x,y,z){
				//PROD
				return ("http://192.168.15.6:6080/arcgis/rest/services/MAP/TCS_ZNJT/MapServer/tile/" + z + "/" + y + "/" + x );
			});
		}
		map.addLayer(laneLayer);;
		*/
	    
		//地图控件
		var scale = new IMAP.ScaleControl({
			anchor : IMAP.Constants.LEFT_BOTTOM
		});
		scale.visible(true);
		map.addControl(scale);
		
		//地图工具
		
		//创建右键菜单
		var contextMenu = new IMAP.ContextMenu(false);
		var menuItem = new IMAP.MenuItem("圈选搜索");
		menuItem.setCallback(function(lnglat) {
			tool=new IMAP.CircleTool();
			tool.autoClose = true;//是否自动关闭绘制
			map.addTool(tool);
			tool.open();
			tool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
				if(globalPoiCycle){
					map.getOverlayLayer().removeOverlay(globalPoiCycle);
					globalPoiCycle = null;
				}
				globalPoiCycle = evt.overlay;
				$.ajax({
					url: "map/map/findPoiInCycle?lng="+globalPoiCycle.getCenter().lng+"&lat="+globalPoiCycle.getCenter().lat+"&radius="+globalPoiCycle.getRadius(),
					async: false,
					success: function(rslt){
						if(rslt.code == 200){
							var devices = "";
							$.ajax({
								type: "GET",
							    url: "./sys/parameter/allData",
							    async: false,
							    success: function(rslt){
									if(rslt.code == 200){
										var list = rslt.parameterList;
										if(list && list.length > 0) {
											for(var i = 0;i<list.length;i++) {
												var item = list[i];
												if(item.key == "circle.device.show"){
													devices = item.value;
													break;
												}
											}
										}
									}else{
										alert(rslt.msg);
									}
								}
							});
							mapPoiContainer = rslt.mapPoiContainer;
							var cycleInnerObjCnt = 0 ;
							if(null == devices || "" == devices) {
								layer.msg('请先选择想要圈选的设备设施类型');
								return;
							}
							if(mapPoiContainer.signalCtrlerList){
								require(['layers/signal/signal'],function(signal){
									signal.clear();
									if(devices.indexOf("signal") > -1){
										signal.showLayer(true, mapPoiContainer.signalCtrlerList);
										cycleInnerObjCnt += mapPoiContainer.signalCtrlerList.length;
									}
								});
								if(devices.indexOf("signal") > -1){
									cycleInnerObjCnt += mapPoiContainer.signalCtrlerList.length;
								}
							}
							if(mapPoiContainer.videoCameraList){
								require(['layers/camera/camera'],function(camera){
									camera.clear();
									if(devices.indexOf("video") > -1){
										camera.showLayer(true, mapPoiContainer.videoCameraList);
										cycleInnerObjCnt += mapPoiContainer.videoCameraList.length;
									}
								});
								if(devices.indexOf("video") > -1){
									cycleInnerObjCnt += mapPoiContainer.videoCameraList.length;
								}
							}
							if(mapPoiContainer.vmsList){
								require(['layers/vms'],function(vms){
									vms.clear();
									if(devices.indexOf("vms") > -1){
										vms.showLayer(true, mapPoiContainer.vmsList);
										cycleInnerObjCnt += mapPoiContainer.vmsList.length;
									}
								});
								if(devices.indexOf("vms") > -1){
									cycleInnerObjCnt += mapPoiContainer.vmsList.length;
								}
							}
							if(mapPoiContainer.gpsJwtList){
								require(['layers/policeControl/policeJwt'],function(jwt){
									jwt.clear();
									if(devices.indexOf("police") > -1){
										cycleInnerObjCnt += mapPoiContainer.gpsJwtList.length;
										jwt.showLayer(true, mapPoiContainer.gpsJwtList, null);
									}
								});
								if(devices.indexOf("police") > -1){
									cycleInnerObjCnt += mapPoiContainer.gpsJwtList.length;
								}
							}
							if(mapPoiContainer.epList){
								require(['layers/ep/ep'],function(ep){
									ep.clear();
									if(devices.indexOf("ep") > -1){
										cycleInnerObjCnt += mapPoiContainer.epList.length;
										ep.showLayer(true, mapPoiContainer.epList);
									}
								});
								if(devices.indexOf("ep") > -1){
									cycleInnerObjCnt += mapPoiContainer.epList.length;
								}
							}
							if(mapPoiContainer.bzList){
								require(['layers/bzPanel/bz'],function(bz){
									bz.clear();
									if(devices.indexOf("bz") > -1){
										bz.showLayer(true, '', mapPoiContainer.bzList);
									}
								});
								if(devices.indexOf("bz") > -1){
									cycleInnerObjCnt += mapPoiContainer.bzList.length;
								}
							}
							layer.msg('半径'+globalPoiCycle.getRadius()+'米范围内查询到'+cycleInnerObjCnt+'个对象');
						}else{
							alert(rslt.msg);
						}
					}
				});
//				globalPoiCycle.editable(true);
//				globalPoiCycle.addEventListener(IMAP.Constants.DRAG_END,function(evt){
//				},this);
			},this);

		});
		contextMenu.addItem(menuItem);
		var menuItem = new IMAP.MenuItem("可视域监控");
		menuItem.setCallback(function(lnglat) {
			$.ajax({
			    url:'./video/range/getRangeByPoint?point='+lnglat,
			    success:function(dat){
			        if(dat.code == 200){
			        	var deviceIds =[];
			        	var devices =[];
			        	var tunnels="";
			        	var ranges = dat.rangeList;
			        	var existFlag=false;
			        	if(dat.rangeList != null & dat.rangeList.length > 0){
			        		existFlag = true;
			        		for (var ind = 0; ind < dat.rangeList.length; ind++) {
			        			deviceIds.push(dat.rangeList[ind].deviceId);
							}
			        		
			        		$.ajax({
								type: "GET",
							    url: "./dev/videoCamera/getTunnelsByDeviceIds?deviceIds="+deviceIds,
							    success: function(rstl){
							    	
							    	if(rstl.code === 200){
							    		if(rstl.videoList != null && rstl.videoList.length > 0){
							    			var list = [];
							    			var rsize = 0;
							    			rsize = ranges.length <= 4?ranges.length:4;
							    			for(var i=0; i<rstl.videoList.length;i++ ){
							    				var item = rstl.videoList[i];
							    				for(var j=0; j<rsize;j++ ){
							    					var itemj = ranges[j]
							    					if(itemj.deviceId == item.deviceId){
							    						var nitem = {};
							    						nitem.tunnel = item.tunnel;
							    						if(null == itemj.prePosition || "" == itemj.prePosition){
							    							nitem.prePosition="";
							    						} else {
							    							nitem.prePosition=itemj.prePosition;
							    						}
							    						list.push(nitem);
							    					}
							    				}
							    			}
							    			
							    			
							    			require(['layers/camera/camera'],function(camera){
												camera.playRangeVideo(list);
											});
							    		}
							    		
									}else{
										alert(rstl.msg);
									}
								}
							});
			        	} else {
			        		layer.msg("该点位未添加可视域");
			        	}
			        	
			        	/*if(!existFlag){
			        		layer.msg("该点位未添加可视域");
						} else {
							$.ajax({
								type: "GET",
							    url: "./dev/videoCamera/getTunnelsByDeviceIds?deviceIds="+deviceIds,
							    success: function(rstl){
							    	if(rstl.code === 200){
							    		alert("aa");
							    		require(['layers/camera/camera'],function(camera){
											camera.playWinVideo(rstl.tunnels);
										});
									}else{
										alert(rstl.msg);
									}
								}
							});
						}*/
			        }
			    },
			    error:function(xhr,textStatus){
			    	layer.msg("查询失败！");
			    }
			});
		});
		contextMenu.addItem(menuItem);
		var menuItem = new IMAP.MenuItem("周边监控");
		menuItem.setCallback(function(lnglat) {
			$.ajax({
			    url:'./map/map/findVideoInCycle?lnglat='+lnglat+'&radius=100',
			    success:function(rslt){
			        if(rslt.code == 200){
			        	var tunnels="";
			        	var videoCameraList = rslt.mapPoiContainer.videoCameraList
			        	for (var ind = 0; ind < videoCameraList.length; ind++) {
							var oneData = videoCameraList[ind];
							tunnels = tunnels+","+oneData.tunnel;
						}
			        	if(!tunnels){
			        		layer.msg("该点范围内无监控设备");
						} else {
							require(['layers/camera/camera'],function(camera){
								camera.clear();
								camera.showLayer(true, videoCameraList);
								camera.playWinVideo(tunnels);
							});
						}
			        }else{
				    	layer.msg("查询失败！");
			        }
			    },
			    error:function(xhr,textStatus){
			    	layer.msg("查询失败！");
			    }
			});
		});
		contextMenu.addItem(menuItem);
		contextMenu.addSeparator(3);
		var menuItemTask = new IMAP.MenuItem("创建任务指令");
		menuItemTask.setCallback(function(pos) {
			if(marker){
				marker.setPosition(pos);
			}else{
				marker = new IMAP.Marker(pos, markerOpts);
			}
			map.getOverlayLayer().addOverlay(marker, false);
			require(['./panels/missionSendPanel/missionSend'],function(missionSend){
				missionSend.show(pos);
			})
	    });
		menuItemTask.enabled(false);
		contextMenu.addItem(menuItemTask);
		var menuItem = new IMAP.MenuItem("创建维修单");
		menuItem.setCallback(function(lnglat) {
			require(['panels/facilitiesRepairPanel/quickRepair'],function(quickRepair){
				quickRepair.show(lnglat);
			});
		});
		contextMenu.addItem(menuItem);
		var menuItem = new IMAP.MenuItem("勤务社区台账");
		menuItem.setCallback(function(lnglat) {
			var gridLedgerPanel = require(['./bottomPanel/gridLedgerPanel'],function(gridLedgerPanel){
	            gridLedgerPanel.show(lnglat);
	        });
		});
		contextMenu.addItem(menuItem);
		contextMenu.addSeparator(6);
		var menuItem = new IMAP.MenuItem("拉框放大");
		menuItem.setCallback(function(lnglat) {
	    	var zoomInTool=new IMAP.ZoomTool(IMAP.Constants.TOOL_ZOOM_IN);
			map.addTool(zoomInTool);
			zoomInTool.autoClose = true;
			zoomInTool.open();
		});
		contextMenu.addItem(menuItem);
		var menuItem = new IMAP.MenuItem("拉框缩小");
		menuItem.setCallback(function(lnglat) {
	    	var zoomInTool=new IMAP.ZoomTool(IMAP.Constants.TOOL_ZOOM_OUT);
			map.addTool(zoomInTool);
			zoomInTool.autoClose = true;
			zoomInTool.open();
		});
		contextMenu.addItem(menuItem);
		var menuItem = new IMAP.MenuItem("地图复位");
		menuItem.setCallback(function(lnglat) {
			var center = new IMAP.LngLat(121.128187,31.464808);
			map.setCenter(center,14);
	    });
		contextMenu.addItem(menuItem);
		
		contextMenu.addSeparator(9);
		var clearJwtMenuItem = new IMAP.MenuItem("清除周边警力标记");
		clearJwtMenuItem.setCallback(function(lnglat) {
			require(['layers/alarmTask/realtimeAlarm'],function(realtimeAlarm){
				realtimeAlarm.clearJwtMarkers();
			});
	    });
		contextMenu.addItem(clearJwtMenuItem);
		var clearJwtMenuItem = new IMAP.MenuItem("创建道路设施");
		clearJwtMenuItem.setCallback(function(lnglat) {
			require(['layers/roadFacilities/roadFacilitiesPanel'],function(roadFacilities){
				var rfs={shape:lnglat};
				roadFacilities.show(rfs,true);
			});
	    });
		contextMenu.addItem(clearJwtMenuItem);
		
		
		map.addContextMenu(contextMenu);
		//创建事件
		map.addEventListener(IMAP.Constants.CLICK, function(e) {
//			e.lnglat.lng = '121.1219501495';
//			e.lnglat.lat = '31.4594914434';
			if(e.lnglat.lng.length> 10){
				e.lnglat.lng = 	e.lnglat.lng.substring(0,10);
			}
			if(e.lnglat.lat.length> 9){
				e.lnglat.lat = 	e.lnglat.lat.substring(0,9);
			}
			document.getElementById("mapLngLat").value =e.lnglat;
			document.getElementById("mapLevel").value =map.getZoom();
		});
		
		map.enableMenuItemTask = function(enabled){
			menuItemTask.enabled(enabled);
		}
		map.selfRemoveRightClickMaker = function(){
			if(marker){
				map.getOverlayLayer().removeOverlay(marker, false);
				marker = null;
			}
		}
		map.addEventListener(IMAP.Constants.MOUSE_DOWN, function(e) {
			CustomContextMenu.close();
		});

		map.addEventListener(IMAP.Constants.ZOOM_END, function(e) {
			document.getElementById("mapLevel").value =map.getZoom();
			if(map.getZoom() >18){
				layer.msg('注意:当前缩放级别大于18级，将显示高精度车道图，仅在太仓城区范围内有效');
			}
		});

		var CustomContextMenu = window.CustomContextMenu = CustomContextMenu||{};
			CustomContextMenu.setContent = function(content, event, width, height){
			CustomContextMenu.infowindow = new IMAP.InfoWindow(content,{
				size : new IMAP.Size(width,height),
				position: event.lnglat,
				autoPan : false,
				offset : new IMAP.Pixel(width*1.55,height*2),
				anchor:IMAP.Constants. RIGHT_BOTTOM,
				type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
			});
			CustomContextMenu.overlay = event.target;
			map.getOverlayLayer().addOverlay(CustomContextMenu.infowindow);
			CustomContextMenu.infowindow.autoPan(true);
		}
		CustomContextMenu.close = function(){
			map.getOverlayLayer().removeOverlay(CustomContextMenu.infowindow);
			CustomContextMenu.overlay = null;
			CustomContextMenu.infowindow = null
		}
	} catch (err){
		setTimeout(function(){
			alert("地图加载失败，请联系管理员");
		}, 1000);
	}
    return map;
})