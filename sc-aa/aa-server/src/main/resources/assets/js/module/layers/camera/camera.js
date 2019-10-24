define(function(require) {
	var map = require('mainMap');
	var rightMarker = null;
	
	var markers = [];
	var trafficMarkers = [];
	var safeMarkers = [];
	var schoolMarkers = [];
	var cityMarkers = [];
	var socialMarkers = [];
	var kexinMarkers = [];
	var otherMarkers = [];
	var win_video=null;
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;

	var dataList = [];//数据列表
	var trafficDataList = [];//数据列表
	var safeDataList = [];//数据列表
	var schoolDataList = [];//数据列表
	var cityDataList = [];//数据列表
	var socialDataList = [];//数据列表
	var kexinDataList = [];//数据列表
	var otherdataList = [];//数据列表
	
	var gaokongDL=[],gaokongClu,gaokongMarkers=[];
	//派出所
	var banqiaoDL=[],chengxiDL=[],chengzhongDL=[],gangquDL=[],gongjiaoDL=[],
	hengjinDL=[],jincangDL=[],jinlangDL=[],kaifaquDL=[],kejiaoDL=[],liuheDL=[],
	liujiagangDL=[],luduDL=[],shaxiDL=[],shuangfengDL=[],yuewangDL=[];
	
	/*var banqiaoClu,chengxiClu,chengzhongClu,gangquClu,gongjiaoClu,
	hengjinClu,jincangClu,jinlangClu,kaifaquClu,kejiaoClu,liuheClu,
	liujiagangClu,luduClu,shaxiClu,shuangfengClu,yuewangClu;*/
	
	var banqiaoMarkers=[],chengxiMarkers=[],chengzhongMarkers=[],gangquMarkers=[],gongjiaoMarkers=[],
	hengjinMarkers=[],jincangMarkers=[],jinlangMarkers=[],kaifaquMarkers=[],kejiaoMarkers=[],liuheMarkers=[],
	liujiagangMarkers=[],luduMarkers=[],shaxiMarkers=[],shuangfengMarkers=[],yuewangMarkers=[];
	gblMapObjs.cameraMarkers = [];
	
	/*var cameraCluster;//聚合图
	var trafficDataCluster;//聚合图
	var safeDataCluster;//聚合图
	var schoolDataCluster;//聚合图
	var cityDataCluster;//聚合图
	var socialDataCluster;//聚合图
	var kexinDataCluster;//聚合图
	var otherDataCluster;//聚合图
*/	var infoLabel = null;
	
	var closeVideoWin = window.closeVideoWin = function(a){
		if(null != win_video) {
			win_video.close();
			win_video=null;
		}
	}
	
	var getVideoWin = window.getVideoWin = function(){
		return win_video;
	}
	//关闭窗口
	$(window).unload(function(){
		closeVideoWin();
	});
	//入口方法
	var showLayer = function(isShow, paramDataList,tp) {
		if(!tp){
			clear();
		} else {
			clearSpe(tp);
		}
		
		if(isShow) {
			loadData(paramDataList,tp)
		}
	};
	
	//加载数据
	var loadData = function(paramDataList,tp) {
		if(paramDataList){
			dataList = paramDataList;//传入的数据
    		applyDataToUI();
		}else{//主动查询的数据
				var url = "dev/videoCamera/allData?cameraTp="+tp+"&time="+new Date().getTime();
				$.ajax({
					type: "GET",
				    url: url,
				    success: function(rstl){
				    	if(rstl.code === 200){
				    		if(!tp){
				    			dataList = rstl.videoCameraList;
				    		} else {
				    			switch(tp)
				    			{
				    				case "1":
					    				trafficDataList = rstl.videoCameraList;
					    				break;
				    				case "3":
					    				safeDataList = rstl.videoCameraList;
					    				break;
				    				case "4":
				    					schoolDataList = rstl.videoCameraList;
				    					break;
				    				case "5":
				    					cityDataList = rstl.videoCameraList;
				    					break;
				    				case "6":
				    					socialDataList = rstl.videoCameraList;
				    					break;
				    				case "7":
				    					kexinDataList = rstl.videoCameraList;
				    					break;
				    				case "8":
				    					otherdataList = rstl.videoCameraList;
				    					break;
				    				case "10":
				    					gaokongDL = rstl.videoCameraList;
				    					break;
				    				case "21":
				    					banqiaoDL = rstl.videoCameraList;
							    		break;	
							    	case "22":
							    		chengxiDL = rstl.videoCameraList;
							    		break;	
							    	case "23":
							    		chengzhongDL = rstl.videoCameraList;
							    		break;	
							    	case "24":
							    		gangquDL = rstl.videoCameraList;
							    		break;	
							    	case "25":
							    		gongjiaoDL = rstl.videoCameraList;
							    		break;
							    	case "26":
							    		hengjinDL = rstl.videoCameraList;
							    		break;
							    	case "27":
							    		jincangDL = rstl.videoCameraList;
							    		break;
							    	case "28":
							    		jinlangDL = rstl.videoCameraList;
							    		break;
							    	case "29":
							    		kaifaquDL = rstl.videoCameraList;
							    		break;
							    	case "210":
							    		kejiaoDL = rstl.videoCameraList;
							    		break;
							    	case "211":
							    		liuheDL = rstl.videoCameraList;
							    		break;
							    	case "212":
							    		liujiagangDL = rstl.videoCameraList;
							    		break;
							    	case "213":
							    		luduDL = rstl.videoCameraList;
							    		break;
							    	case "214":
							    		shaxiDL = rstl.videoCameraList;
							    		break;
							    	case "215":
							    		shuangfengDL = rstl.videoCameraList;
							    		break;
							    	case "216":
							    		yuewangDL = rstl.videoCameraList;
							    		break;
				    			    default:
				    			    	break;
				    			}
				    		}
				    		applyDataToUI(tp);
						}else{
							alert(rstl.msg);
						}
					}
				});
		}
	};
	
	//数据应用到视图
	var applyDataToUI = function(tp) {
		var dataListn = [];
		if(!tp){
			dataListn = dataList;
		} else {
			switch(tp)
			{
			case "1":
				dataListn = trafficDataList;
				break;
			case "3":
				dataListn = safeDataList;
				break;
			case "4":
				dataListn = schoolDataList;
				break;
			case "5":
				dataListn = cityDataList;
				break;
			case "6":
				dataListn = socialDataList;
				break;
			case "7":
				dataListn = kexinDataList;
				break;
			case "8":
				dataListn = otherdataList;
				break;	
			case "10":
				dataListn = gaokongDL;
				break;	
			case "21":
				dataListn = banqiaoDL;
	    		break;	
	    	case "22":
	    		dataListn = chengxiDL;
	    		break;	
	    	case "23":
	    		dataListn =chengzhongDL;
	    		break;	
	    	case "24":
	    		dataListn =gangquDL;
	    		break;	
	    	case "25":
	    		dataListn =gongjiaoDL;
	    		break;
	    	case "26":
	    		dataListn =hengjinDL;
	    		break;
	    	case "27":
	    		dataListn =jincangDL;
	    		break;
	    	case "28":
	    		dataListn =jinlangDL;
	    		break;
	    	case "29":
	    		dataListn =kaifaquDL;
	    		break;
	    	case "210":
	    		dataListn =kejiaoDL;
	    		break;
	    	case "211":
	    		dataListn =liuheDL;
	    		break;
	    	case "212":
	    		dataListn =liujiagangDL;
	    		break;
	    	case "213":
	    		dataListn =luduDL;
	    		break;
	    	case "214":
	    		dataListn =shaxiDL;
	    		break;
	    	case "215":
	    		dataListn =shuangfengDL;
	    		break;
	    	case "216":
	    		dataListn =yuewangDL;
	    		break;
			default:
				break;
			}
		}
		for(var i = 0; i < dataListn.length; i++){
			var cam = dataListn[i];
			if(!cam.shape || cam.shape.trim() ==','){
				continue;
			}
			var pos = cam.shape.split(",");
			markerOpts.icon = new IMAP.Icon( cam.status == 0 ? "./assets/images/videoCamCloud.png" : "./assets/images/videoCamCloudOffline.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
			if(cam.description == "i"){
				markerOpts.icon = new IMAP.Icon( cam.status == 0 ? "./assets/images/Imporvideo.png" : "./assets/images/Imporvideo1.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
			}
			var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
			marker.data = cam;
			marker.addEventListener(IMAP.Constants.CLICK, markerClick);
			//marker.addEventListener(IMAP.Constants.MOUSE_OVER, markerMouseOver);
			//marker.addEventListener(IMAP.Constants.MOUSE_OUT, markerMouseOut);
				//右击事件
				marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, function(e,b) {
					var marker = e.target;
					var cameraObj = e.target.data;
					var isGuardUsed = "";
					if(cameraObj.guardUsed == 0){
						isGuardUsed = "设为警卫调取监控";
					} else {
						isGuardUsed = "取消警卫调取监控";
					}
					var contextMen = '<div class="self-menu">'
						+'<span class="drawCamera detailspan">可视域</span>'
						+'<span class="guradUsed detailspan">'+isGuardUsed+'</span>'
						+'<span class="querzCamera detailspan">信息维护</span>'
						+'<span class="keepCamera detailspan">设备报修</span>'
						+'<span class="deleteVideoDevice detailspan">设备删除</span></div>';
					
					if(cam.organization == 1){
						CustomContextMenu.setContent(contextMen,e,100,60);
						$(".querzCamera").on( "click", function() {
							CustomContextMenu.close();
							var Camera = e.target.data;
							require(['layers/camera/cameraListPanel'],function(cameraListPanel){
								cameraListPanel.show(Camera.id);
							});
						});
						$(".keepCamera").on( "click", function() {
							CustomContextMenu.close();
							var Camera = e.target.data;
							require(['panels/facilitiesRepairPanel/facilitiesRepair'],function(facilitiesRepair){
								facilitiesRepair.show(Camera.deviceId,2,Camera.shape);
							});
						});
					}else{
						CustomContextMenu.setContent(contextMen,e,100,30);
						$(".querzCamera").hide();
						$(".keepCamera").hide();
					}
					$(".deleteVideoDevice").on( "click", function() {
						CustomContextMenu.close();
						var camera = e.target.data;
						layer.confirm('删除监控： '+camera.deviceName+"?", {
							  btn: ['确定','取消'], //按钮
							  yes:function(index){
								  layer.close(index);
								  //逻辑删除
								  if (camera.id) {
									var url = "dev/videoCamera/delete/" + camera.id;
									$.ajax({
										type : "POST",
										url : url,
										success : function(rstl) {
											if (rstl.code === 200) {
												layer.msg(camera.deviceName+"  删除成功");
											} else {
												layer.msg(rstl.msg);
											}
										}
									});
								}
							  }
						});
					});
					$(".guradUsed").on( "click", function() {
						CustomContextMenu.close();
						var camera = e.target.data;
						if(camera){
							var url = "dev/videoCamera/setGuardUsed?id=" + camera.id +"&guardUsed="+camera.guardUsed;
							$.ajax({
								type: "GET",
								url: url,
								success: function(rstl){
									if(rstl.code === 200){
										layer.msg("操作成功");
										if(camera.guardUsed == 0){
											camera.guardUsed = 1;
										}else{
											camera.guardUsed = 0;
										}
									}else{
										alert(rstl.msg);
									}
								}
							});
						}
					});
					$(".drawCamera").on( "click", function(e) {
						if(rightMarker){
							map.getOverlayLayer().removeOverlay(rightMarker);
							rightMarker = null;
						}
						var camera =CustomContextMenu.overlay.data;
						var pos = camera.shape.split(",");
						
						var markerOpts = new IMAP.MarkerOptions();
						markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
						markerOpts.icon = new IMAP.Icon( "./assets/images/right.png", new IMAP.Size(32, 16), new IMAP.Pixel(16, 0));
						var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
						marker.setZIndex(99999);
						
						map.getOverlayLayer().addOverlay(marker, true);
						rightMarker = marker;
						
						require(['panels/drawVideoRangePanel/drawVideoRange'],function(drawVideoRange){
							layer.msg("添加可视域需要打开相应的视频！");
							drawVideoRange.show(true,camera,marker);
						});
						CustomContextMenu.close();
					});
				});
			
			
			map.getOverlayLayer().addOverlay(marker, false);
			marker.setTitle(cam.deviceName+"("+cam.deviceId+")");
			if(!tp){
				markers.push(marker);
				gblMapObjs.cameraMarkers.push(marker);
			} else {
				
				switch(tp)
				{
				case "1":
					trafficMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
					break;
				case "3":
					safeMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
					break;
				case "4":
					schoolMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
					break;
				case "5":
					cityMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
					break;
				case "6":
					socialMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
					break;
				case "7":
					kexinMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
					break;
				case "8":
					otherMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
					break;
				case "10":
					gaokongMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
					break;	
				case "21":
					banqiaoMarkers.push(marker);
					gblMapObjs.cameraMarkers.push(marker);
		    		break;	
		    	case "22":
		    		chengxiMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;	
		    	case "23":
		    		chengzhongMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;	
		    	case "24":
		    		gangquMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;	
		    	case "25":
		    		gongjiaoMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "26":
		    		hengjinMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "27":
		    		jincangMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "28":
		    		jinlangMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "29":
		    		kaifaquMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "210":
		    		kejiaoMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "211":
		    		liuheMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "212":
		    		liujiagangMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "213":
		    		luduMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "214":
		    		shaxiMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "215":
		    		shuangfengMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
		    	case "216":
		    		yuewangMarkers.push(marker);
		    		gblMapObjs.cameraMarkers.push(marker);
		    		break;
				default:
					break;
				}
			}
		}
		
		var markersLength  = 0;
		//创建聚合管理对象
		if(!tp){
			map.plugin(['IMAP.DataCluster'], function(){
				gblMapObjs.cameraCluster = new IMAP.DataCluster(map, markers, {
					maxZoom: 0, //比例尺级别
					gridSize: 80, //网格缓冲的像素值，默认为60。
					zoomOnClick: true, //点击放大
					minimumClusterSize: 2,//最小聚合数 
					styles: dataClusterStyle 
				});
			});
			markersLength = markers.length;
			//当前地图级别大于18是  取消聚合图   全部显示
			map.addEventListener(IMAP.Constants.ZOOM_END,function(){
		        var mZoom= map.getZoom();
		        if(mZoom>=18){
		        	gblMapObjs.cameraCluster.setMaxZoom(100,true);
		        }else{
		        	gblMapObjs.cameraCluster.setMaxZoom(0,true);
		        }
		    });
		} else {
			switch(tp)
			{
			case "1":
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.trafficDataCluster = new IMAP.DataCluster(map, trafficMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				markersLength = trafficMarkers.length;
				//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.trafficDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.trafficDataCluster.setMaxZoom(0,true);
			        }
			    });
				break;
			case "3":
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.safeDataCluster = new IMAP.DataCluster(map, safeMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				markersLength = safeMarkers.length;
				//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.safeDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.safeDataCluster.setMaxZoom(0,true);
			        }
			    });
				break;
			case "4":
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.schoolDataCluster = new IMAP.DataCluster(map, schoolMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				markersLength = schoolMarkers.length;
				//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.schoolDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.schoolDataCluster.setMaxZoom(0,true);
			        }
			    });
				break;
			case "5":
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.cityDataCluster = new IMAP.DataCluster(map, cityMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				markersLength = cityMarkers.length;
				//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.cityDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.cityDataCluster.setMaxZoom(0,true);
			        }
			    });
				break;
			case "6":
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.socialDataCluster = new IMAP.DataCluster(map, socialMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				markersLength = socialMarkers.length;
				//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.socialDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.socialDataCluster.setMaxZoom(0,true);
			        }
			    });
				break;
			case "7":
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.kexinDataCluster = new IMAP.DataCluster(map, kexinMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = kexinMarkers.length;
				//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.kexinDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.kexinDataCluster.setMaxZoom(0,true);
			        }
			    });
				break;
			case "8":
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.otherDataCluster = new IMAP.DataCluster(map, otherMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = otherMarkers.length;
				//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.otherDataCluster.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.otherDataCluster.setMaxZoom(0,true);
			        }
			    });
				break;
			case "10":
				//不需要聚合
//				map.plugin(['IMAP.DataCluster'], function(){
//					gaokongClu = new IMAP.DataCluster(map, gaokongMarkers, {
//						maxZoom: 0, //比例尺级别
//						gridSize: 0, //网格缓冲的像素值，默认为60。
//						zoomOnClick: true, //点击放大
//						minimumClusterSize: 1 //最小聚合数 
//					});
//				});
				for (var i = 0; i < gaokongMarkers.length; i++) {
					map.getOverlayLayer().addOverlay(gaokongMarkers[i], false);
				}
				markersLength = gaokongMarkers.length;
				break;	
			case "21":
				map.plugin(['IMAP.DataCluster'], function(){
					gblMapObjs.banqiaoClu = new IMAP.DataCluster(map, banqiaoMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				markersLength = banqiaoMarkers.length;
				//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.banqiaoClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.banqiaoClu.setMaxZoom(0,true);
			        }
			    });
	    		break;	
	    	case "22":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.chengxiClu = new IMAP.DataCluster(map, chengxiMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = chengxiMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.chengxiClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.chengxiClu.setMaxZoom(0,true);
			        }
			    });
	    		break;	
	    	case "23":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.chengzhongClu = new IMAP.DataCluster(map, chengzhongMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = chengzhongMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.chengzhongClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.chengzhongClu.setMaxZoom(0,true);
			        }
			    });
	    		break;		
	    	case "24":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.gangquClu = new IMAP.DataCluster(map, gangquMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = gangquMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.gangquClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.gangquClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "25":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.gongjiaoClu = new IMAP.DataCluster(map, gongjiaoMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				markersLength = gongjiaoMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.gongjiaoClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.gongjiaoClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "26":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.hengjinClu = new IMAP.DataCluster(map, hengjinMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = hengjinMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.hengjinClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.hengjinClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "27":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.jincangClu = new IMAP.DataCluster(map, jincangMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle 
					});
				});
				markersLength = jincangMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.jincangClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.jincangClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "28":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.jinlangClu = new IMAP.DataCluster(map, jinlangMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle  
					});
				});
				markersLength = jinlangMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.jinlangClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.jinlangClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "29":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.kaifaquClu = new IMAP.DataCluster(map, kaifaquMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = kaifaquMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.kaifaquClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.kaifaquClu.setMaxZoom(0,true);
			        }
			    });
				
	    		break;
	    	case "210":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.kejiaoClu = new IMAP.DataCluster(map,kejiaoMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle  
					});
				});
				markersLength = kejiaoMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.liuheClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.liuheClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "211":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.liuheClu = new IMAP.DataCluster(map, liuheMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = liuheMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.liuheClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.liuheClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "212":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.liujiagangClu = new IMAP.DataCluster(map,liujiagangMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = liujiagangMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.liujiagangClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.liujiagangClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "213":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.luduClu = new IMAP.DataCluster(map, luduMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = luduMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.luduClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.luduClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "214":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.shaxiClu = new IMAP.DataCluster(map, shaxiMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle 
					});
				});
				markersLength = shaxiMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.shaxiClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.shaxiClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "215":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.shuangfengClu = new IMAP.DataCluster(map, shuangfengMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数 
						styles: dataClusterStyle  
					});
				});
				markersLength = shuangfengMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.shuangfengClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.shuangfengClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
	    	case "216":
	    		map.plugin(['IMAP.DataCluster'], function(){
	    			gblMapObjs.yuewangClu = new IMAP.DataCluster(map, yuewangMarkers, {
						maxZoom: 0, //比例尺级别
						gridSize: 80, //网格缓冲的像素值，默认为60。
						zoomOnClick: true, //点击放大
						minimumClusterSize: 2,//最小聚合数
						styles: dataClusterStyle  
					});
				});
				markersLength = yuewangMarkers.length;
	    		//当前地图级别大于18是  取消聚合图   全部显示
				map.addEventListener(IMAP.Constants.ZOOM_END,function(){
			        var mZoom= map.getZoom();
			        if(mZoom>=18){
			        	gblMapObjs.yuewangClu.setMaxZoom(100,true);
			        }else{
			        	gblMapObjs.yuewangClu.setMaxZoom(0,true);
			        }
			    });
	    		break;
			default:
				break;
			}
		}
		
		layer.msg('加载了'+markersLength+"台监控设备");
	};
	
	//清除数据
	var clear= function() {
		//清除界面
		for (var i = 0; i < markers.length; i++) {
			map.getOverlayLayer().removeOverlay(markers[i]);
		}
		//清除聚合图
		if(gblMapObjs.cameraCluster){
			gblMapObjs.cameraCluster.clearMarkers();
		}
		markers = [];
		gblMapObjs.cameraMarkers = [];
		//清除数据
		dataList = [];
	};
	
	var clearSpe = function(tp){
//		gblMapObjs.cameraMarkers = [];
		if(tp == "1") {
			for (var i = 0; i < trafficMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(trafficMarkers[i]);
			}
			//清除聚合图
			if(gblMapObjs.trafficDataCluster){
				gblMapObjs.trafficDataCluster.clearMarkers();
			}
			trafficMarkers = [];
			//清除数据
			trafficDataList = [];
	    } else if(tp == "2"){
	    	
	    } else if(tp=="3"){
	    	for (var i = 0; i < safeMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(safeMarkers[i]);
			}
			if(gblMapObjs.safeDataCluster){
				gblMapObjs.safeDataCluster.clearMarkers();
			}
			safeMarkers = [];
			safeDataList = [];
	    } else if(tp =="4"){
	    	for (var i = 0; i < schoolMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(schoolMarkers[i]);
			}
			if(gblMapObjs.schoolDataCluster){
				gblMapObjs.schoolDataCluster.clearMarkers();
			}
			schoolMarkers = [];
			schoolDataList = [];
	    } else if(tp=="5") {
	    	for (var i = 0; i < cityMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(cityMarkers[i]);
			}
			if(gblMapObjs.cityDataCluster){
				gblMapObjs.cityDataCluster.clearMarkers();
			}
			cityMarkers = [];
			cityDataList = [];
	    } else if(tp =="6"){
	    	for (var i = 0; i < socialMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(socialMarkers[i]);
			}
			if(gblMapObjs.socialDataCluster){
				gblMapObjs.socialDataCluster.clearMarkers();
			}
			socialMarkers = [];
			socialDataList = [];
	    } else if(tp == "7") {
	    	for (var i = 0; i < kexinMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(kexinMarkers[i]);
			}
			if(gblMapObjs.kexinDataCluster){
				gblMapObjs.kexinDataCluster.clearMarkers();
			}
			kexinMarkers = [];
			kexinDataList = [];
	    } else if(tp == "8") {
	    	for (var i = 0; i < otherMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(otherMarkers[i]);
			}
			if(gblMapObjs.otherDataCluster){
				gblMapObjs.otherDataCluster.clearMarkers();
			}
			otherMarkers = [];
			otherDataList = [];
	    } else if(tp == "10") {
	    	for (var i = 0; i < gaokongMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(gaokongMarkers[i]);
			}
			/*if(banqiaoClu){//不需要聚合图
				gaokongClu.clearMarkers();
			}*/
			gaokongMarkers = [];
			gaokongDL = [];
	    }else if(tp == "21") {
	    	for (var i = 0; i < banqiaoMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(banqiaoMarkers[i]);
			}
			if(gblMapObjs.banqiaoClu){
				gblMapObjs.banqiaoClu.clearMarkers();
			}
			banqiaoMarkers = [];
			banqiaoDL = [];
	    }else if(tp == "22") {
	    	for (var i = 0; i < chengxiMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(chengxiMarkers[i]);
			}
			if(gblMapObjs.chengxiClu){
				gblMapObjs.chengxiClu.clearMarkers();
			}
			chengxiMarkers = [];
			chengxiDL = [];
	    }else if(tp == "23") {
	    	for (var i = 0; i < chengzhongMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(chengzhongMarkers[i]);
			}
			if(gblMapObjs.chengzhongClu){
				gblMapObjs.chengzhongClu.clearMarkers();
			}
			chengzhongMarkers = [];
			chengzhongDL = [];
	    }else if(tp == "24") {
	    	for (var i = 0; i < gangquMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(gangquMarkers[i]);
			}
			if(gblMapObjs.gangquClu){
				gblMapObjs.gangquClu.clearMarkers();
			}
			gangquMarkers = [];
			gangquDL = [];
	    }else if(tp == "25") {
	    	for (var i = 0; i < gongjiaoMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(gongjiaoMarkers[i]);
			}
			if(gblMapObjs.gongjiaoClu){
				gblMapObjs.gongjiaoClu.clearMarkers();
			}
			gongjiaoMarkers = [];
			gongjiaoDL = [];
	    }else if(tp == "26") {
	    	for (var i = 0; i < hengjinMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(hengjinMarkers[i]);
			}
			if(gblMapObjs.hengjinClu){
				gblMapObjs.hengjinClu.clearMarkers();
			}
			hengjinMarkers = [];
			hengjinDL = [];
	    }else if(tp == "27") {
	    	for (var i = 0; i < jincangMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(jincangMarkers[i]);
			}
			if(gblMapObjs.jincangClu){
				gblMapObjs.jincangClu.clearMarkers();
			}
			jincangMarkers = [];
			jincangDL = [];
	    }else if(tp == "28") {
	    	for (var i = 0; i < jinlangMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(jinlangMarkers[i]);
			}
			if(gblMapObjs.jinlangClu){
				gblMapObjs.jinlangClu.clearMarkers();
			}
			jinlangMarkers = [];
			jinlangDL = [];
	    }else if(tp == "29") {
	    	for (var i = 0; i < kaifaquMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(kaifaquMarkers[i]);
			}
			if(gblMapObjs.kaifaquClu){
				gblMapObjs.kaifaquClu.clearMarkers();
			}
			kaifaquMarkers = [];
			kaifaquDL = [];
	    }else if(tp == "210") {
	    	for (var i = 0; i < kejiaoMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(kejiaoMarkers[i]);
			}
			if(gblMapObjs.kejiaoClu){
				gblMapObjs.kejiaoClu.clearMarkers();
			}
			kejiaoMarkers = [];
			kejiaoDL = [];
	    }else if(tp == "211") {
	    	for (var i = 0; i < liuheMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(liuheMarkers[i]);
			}
			if(gblMapObjs.liuheClu){
				gblMapObjs.liuheClu.clearMarkers();
			}
			liuheMarkers = [];
			liuheDL = [];
	    }else if(tp == "212") {
	    	for (var i = 0; i < liujiagangMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(liujiagangMarkers[i]);
			}
			if(gblMapObjs.liujiagangClu){
				gblMapObjs.liujiagangClu.clearMarkers();
			}
			liujiagangMarkers = [];
			liujiagangDL = [];
	    }else if(tp == "213") {
	    	for (var i = 0; i < luduMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(luduMarkers[i]);
			}
			if(gblMapObjs.luduClu){
				gblMapObjs.luduClu.clearMarkers();
			}
			luduMarkers = [];
			luduDL = [];
	    }else if(tp == "214") {
	    	for (var i = 0; i < shaxiMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(shaxiMarkers[i]);
			}
			if(gblMapObjs.shaxiClu){
				gblMapObjs.shaxiClu.clearMarkers();
			}
			shaxiMarkers = [];
			shaxiDL = [];
	    }else if(tp == "215") {
	    	for (var i = 0; i < shuangfengMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(shuangfengMarkers[i]);
			}
			if(gblMapObjs.shuangfengClu){
				gblMapObjs.shuangfengClu.clearMarkers();
			}
			shuangfengMarkers = [];
			shuangfengDL = [];
	    }else if(tp == "216") {
	    	for (var i = 0; i < yuewangMarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(yuewangMarkers[i]);
			}
			if(gblMapObjs.yuewangClu){
				gblMapObjs.yuewangClu.clearMarkers();
			}
			yuewangMarkers = [];
			yuewangDL = [];
	    }
	};
	
	//鼠标移入事件
	var markerMouseOver = function(e) {
		var marker = e.target;
		var camera = marker.data;
		
		infoLabel = new IMAP.Label(camera.deviceName+"("+camera.deviceId+")", {
			position : new IMAP.LngLat(e.lnglat.lng, e.lnglat.lat),// 基点位置
			offset: new IMAP.Pixel(0,-25),//相对于基点的位置
			anchor : IMAP.Constants.BOTTOM_CENTER,
			title : "label",
			fontColor : "#ff0000",
			fontSize : 12,
			fontBold : false// 在html5 marker的情况下，是否允许marker有背景
		});
		map.getOverlayLayer().addOverlay(infoLabel, false);
	};
	//鼠标移出事件
	var markerMouseOut = function(e) {
		var marker = e.target;
		var camera = marker.data;
		map.getOverlayLayer().removeOverlay(infoLabel);
	};
	//单击事件
	var markerClick = function(e) {
		var marker = e.target;
		var cam = e.target.data;
		var cameraIndexCode = cam.tunnel;
		playWinVideo(cameraIndexCode);
	};
	
	var playWinVideo = function(cameraIndexCode){
		var iWidth = screen.availWidth - 10;
		var iHeight = screen.availHeight - 40;
		var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
		var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
		if(win_video == null) {
			win_video = window.open(
					'assets/js/module/video/videoPlay.html?cameraId='+cameraIndexCode,
					'videoCtrlwindow',
					'height=' + iHeight + ', innerHeight=' + iHeight +
					',width=' + iWidth + ', innerWidth=' + iWidth +
					',top=0,left=0,toolbar=yes,menubar=yes,scrollbars=no,resizable=yes,location=yes');
		} else {
			win_video.playVideoWithWindow(cameraIndexCode);
		}
	};
	
	var playRangeVideo = function(ranges){
		var iWidth = screen.availWidth - 10;
		var iHeight = screen.availHeight - 40;
		var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
		var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
		if(ranges != null && ranges.length > 0) {
			var posion = ""
			for(var i=0;i<ranges.length;i++){
				posion += ranges[i].tunnel+','+ranges[i].prePosition+';'
			}
			posion = posion.substr(0,posion.length-1);
			if(win_video == null) {
				win_video = window.open(
						'assets/js/module/video/videoPlay.html?cameraId=-1&posion='+posion,
						'videoCtrlwindow',
						'height=' + iHeight + ', innerHeight=' + iHeight +
						',width=' + iWidth + ', innerWidth=' + iWidth +
						',top=0,left=0,toolbar=yes,menubar=yes,scrollbars=no,resizable=yes,location=yes');
			} else {
				win_video.playVideoWithRan(posion);
			}
		}
	};
	
	return {
		showLayer: showLayer,
		closeVideoWin:closeVideoWin,
		win_video:win_video,
		playWinVideo:playWinVideo,
		playRangeVideo:playRangeVideo,
		clear:clear
		}
})