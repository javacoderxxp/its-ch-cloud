define(function(require) {
	var htmlStr = require('text!./drawVideoRange.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var queryResPolygons = []; //查询后绘制至地图的可视区域集合
	var queryAllPolygons = [];
	var chosenPolygons = [];//huangse
	var rangeApp = null;
	var markers = [];
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.editabled = false;
	markerOpts.icon = new IMAP.Icon("./assets/images/videoCamCloud.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var mousetool = null;
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.PolygonTool();
		mousetool.autoClose = true;//是否自动关闭绘制
		map.addTool(mousetool);
	});
	var show = function(comeFromMap,cam,marker) {
		itsGlobal.showLeftPanel(htmlStr);
		rangeApp = new Vue({
			el: '#pure-panel',
			data: {
				camList:[],
				selectedCam:"",
				chosenCamName:"",
				chosenCamId:"",
				drawControl:false,
				newVideoRangePolygon:null,
				finshedDraw:false,
				rangeList:[],
				showAllViews:true,
				hideAllViews:false,
				fromMap:false,
				fromMapCam:{},
				duiMarker:null,
				prePosition:"",
				cam:null,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			watch:{
				camList:'loadMultiselect'
			},
			methods: {
				loadMultiselect:function(cur,old){
					/*require(['bootstrapMultiselect'],function(){
						 $('#camSelectedId').multiselect({
							 	nonSelectedText:'请选择一个路口',
								enableFiltering: true,//搜索
								maxHeight:300
							});
					 });*/
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#camSelectedId').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				loadData:function(){
					
					$.ajax({
    					url: "dev/videoCamera/allData?cameraTp=1&withShape=1",
    					success: function(rslt){
    						if(rslt.code == 200){
    							rangeApp.camList = rslt.videoCameraList;
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
					
					if(comeFromMap){
						rangeApp.fromMap=comeFromMap;
						rangeApp.fromMapCam = cam;
						rangeApp.duiMarker = marker;
						rangeApp.searchRange();
					}
				},
				searchAllRanges:function(){
					rangeApp.clearMapPolygon();
					rangeApp.clearMapCam();
					rangeApp.drawControl=false;
					$.ajax({
					    url:'./video/range/allData',
					    success:function(dat){
					        if(dat.code == 200){
					        	for (var ind = 0; ind < dat.rangeList.length; ind++) {
									var oneData = dat.rangeList[ind];
									var region = oneData.range, polygonArr=[];
									var regionArr = region.split(" ");
									for (var t = 0; t < regionArr.length; t++) {
										var ele = regionArr[t];
										var lnglatStr = ele.split(",");
										polygonArr.push(new IMAP.LngLat(lnglatStr[0],lnglatStr[1]));
									}
						    		var polygon = new IMAP.Polygon(polygonArr, {
						    			"fillColor" : "#8B7D6B",
						    			"fillOpacity " : 0.8,
						    			"strokeColor  " : "#8B7B8B",
						    			"strokeOpacity" : 1,
						    			"strokeWeight" : 3,
						    			"strokeStyle" : "solid",
						    			});
						    		polygon.extData = oneData;
						    		queryAllPolygons.push(polygon);
								}
					        	map.getOverlayLayer().addOverlays(queryAllPolygons, false);
					        	rangeApp.showAllViews = false;
					        	rangeApp.hideAllViews = true;
					        }
					    },
					    error:function(xhr,textStatus){
					    	layer.msg("查询失败！");
					    }
					});
				},
				hideRanges:function(){
					if(rangeApp.newVideoRangePolygon){
	        			map.getOverlayLayer().removeOverlay(rangeApp.newVideoRangePolygon);
		        		rangeApp.newVideoRangePolygon=null;
	        		}
	        		if(queryAllPolygons&&queryAllPolygons.length>0){
	        			for(var i=0;i<queryAllPolygons.length;i++){
	        				map.getOverlayLayer().removeOverlay(queryAllPolygons[i]);
	        			}
	        			queryAllPolygons=[];
	        		}
	        		rangeApp.showAllViews = true;
		        	rangeApp.hideAllViews = false;
				},
				hideRangesWithMap:function(){
					rangeApp.hideRanges();
					if(rangeApp.fromMap){
						//可视域上图
		        		rangeApp.drawControl=true;
						rangeApp.applyRangesToUI(rangeApp.fromMapCam.deviceId);
					}
				},
				searchRange:function(){
					//alert($('#camSelectedId').val());
					if(rangeApp.fromMap){
						rangeApp.clearMapCam();
						rangeApp.clearMapPolygon();
						rangeApp.hideRanges();
						
						rangeApp.chosenCamName=rangeApp.fromMapCam.deviceName;
						rangeApp.chosenCamId=rangeApp.fromMapCam.deviceId;
						rangeApp.drawControl=true;
						
						//可视域上图
						rangeApp.applyRangesToUI(rangeApp.chosenCamId);
					} else {
						rangeApp.clearMapCam();
						rangeApp.clearMapPolygon();
						rangeApp.hideRanges();
						if("" == $('#camSelectedId').val()) {
							alert("清选择一个监控设备");
							return;
						}
						for(var i = 0; i < rangeApp.camList.length; i++){
							var cam = rangeApp.camList[i];
							if(!cam.shape){
								continue;
							}
							if(cam.deviceId == $('#camSelectedId').val()){
								rangeApp.chosenCamName=cam.deviceName;
								rangeApp.chosenCamId=cam.deviceId;
								rangeApp.drawControl=true;
								var pos = cam.shape.split(",");
								var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
								marker.data = cam;
								rangeApp.cam = cam;
								marker.addEventListener(IMAP.Constants.CLICK, rangeApp.markerClick);
								map.getOverlayLayer().addOverlay(marker, true);
								markers.push(marker);
								//可视域上图
								rangeApp.applyRangesToUI(rangeApp.chosenCamId);
								 $('#camSelectedId').val($('#camSelectedId').val())
								break;
							}
						}
					}
				},
				//单击事件
				markerClick : function(e) {
					var marker = e.target;
					var cam = e.target.data;
					var cameraIndexCode = cam.tunnel;
					require(['layers/camera/camera'],function(camera){
						camera.playWinVideo(cameraIndexCode);
					});
				},
				//将可视域上图
				applyRangesToUI:function(camId){
					$.ajax({
					    url:'./video/range/allData?deviceId='+camId+'&time='+new Date().getTime(),
					    cache: false,
					    success:function(dat){
					        if(dat.code == 200){
					        	rangeApp.clearMapPolygon();
					        	rangeApp.rangeList = dat.rangeList;
					        	for (var ind = 0; ind < rangeApp.rangeList.length; ind++) {
									var oneData = rangeApp.rangeList[ind];
									var region = oneData.range, polygonArr=[];
									var regionArr = region.split(" ");
									for (var t = 0; t < regionArr.length; t++) {
										var ele = regionArr[t];
										var lnglatStr = ele.split(",");
										polygonArr.push(new IMAP.LngLat(lnglatStr[0],lnglatStr[1]));
									}
						    		var polygon = new IMAP.Polygon(polygonArr, {
						    			"fillColor" : "#8B7D6B",
						    			"fillOpacity " : 0.8,
						    			"strokeColor  " : "#8B7B8B",
						    			"strokeOpacity" : 1,
						    			"strokeWeight" : 3,
						    			"strokeStyle" : "solid",
						    			});
						    		polygon.extData = oneData;
						    		queryResPolygons.push(polygon);
								}
					        	map.getOverlayLayer().addOverlays(queryResPolygons, false);
					        	
					        }
					    },
					    error:function(xhr,textStatus){
					    	layer.msg("查询失败！");
					    }
					});
				},
				addVideoRange:function(){
					var that = this;
					that.finshedDraw = false;
					if(that.newVideoRangePolygon){
						map.getOverlayLayer().removeOverlay(that.newVideoRangePolygon);
					}
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						that.newVideoRangePolygon = evt.overlay;
						that.finshedDraw = true;
						mousetool.close();
					},this);
				},
				saveVideoRange:function(){
					if(rangeApp.newVideoRangePolygon){
						var prePosition = this.prePosition;
						if(this.isPrePosExist(prePosition)){
							alert("预置位号："+prePosition+"已存在！");
							return;
						}
						if(null == prePosition || prePosition == ""){
							alert("预置位号：不能为空！");
							return;
						}
						if(!window.getVideoWin){
			        		alert("请先将视频页面打开");
			        		return;
			        	}
						var videoWin = getVideoWin();
			        	if(null == videoWin){
			        		alert("视频页面未打开");
			        		return;
			        	}
			        	var cameraIndexCode = "";
			        	if(rangeApp.cam){
			        	  cameraIndexCode = rangeApp.cam.tunnel;
			        	} else {
			        	  cameraIndexCode = rangeApp.chosenCamId;
			        	}
			        	var ret = videoWin.setPrePosition(cameraIndexCode,prePosition);
						var array = rangeApp.newVideoRangePolygon.getPath();
						var shp = "";
						if(array && array.length >0){
							for(var i=0;i<array.length;i++){
								shp+=array[i].toString()+" ";
							}
							shp=shp.substring(0,shp.length-1);
						}
						var data={};
						data.range = shp;
						data.deviceId = rangeApp.chosenCamId;
						data.prePosition = prePosition;
						$.ajax({
						    url:'./video/range/save',
						    type:'POST', 
						    async:false,
						    data:JSON.stringify(data),
						    dataType: "json",
							contentType: "application/json",    
						    success:function(dat){
						        if(dat.code == 200){
						        	layer.msg("添加成功！");
						        	rangeApp.finshedDraw = false;
						        	setTimeout(function(){
						        		rangeApp.clearMapPolygon();
						        		rangeApp.applyRangesToUI(rangeApp.chosenCamId);
						        	}, 500);
						        }
						    },
						    error:function(xhr,textStatus){
						    	layer.msg("添加失败！");
						    }
						});
					}
				},
				focusRange:function(id){
					if(queryResPolygons){
						for(var i=0;i<queryResPolygons.length;i++){
							var polygonData = queryResPolygons[i].extData;
							if(polygonData.id == id){
								var region = polygonData.range, polygonArr=[];
								var regionArr = region.split(" ");
								for (var t = 0; t < regionArr.length; t++) {
									var ele = regionArr[t];
									var lnglatStr = ele.split(",");
									polygonArr.push(new IMAP.LngLat(lnglatStr[0],lnglatStr[1]));
								}
								var polygon = new IMAP.Polygon(polygonArr, {
					    			"fillColor" : "#FFA500",
					    			"fillOpacity " : 0.8,
					    			"strokeColor  " : "#FFA500",
					    			"strokeOpacity" : 1,
					    			"strokeWeight" : 3,
					    			"strokeStyle" : "solid",
					    			});
								map.getOverlayLayer().addOverlays(polygon, false);
								setTimeout(function(){
					        		map.getOverlayLayer().removeOverlay(polygon);
					        	}, 2000);
								break;
							}
						}
					}
				},
				deleteRange:function(id){
					confirm('确定删除？', function(){
						$.ajax({
						    url:'./video/range/purge/'+id,
						    type:'POST', 
						    async:false,
						    success:function(dat){
						        if(dat.code == 200){
						        	layer.msg("删除成功！");
						        	rangeApp.finshedDraw = false;
						        	setTimeout(function(){
						        		rangeApp.clearMapPolygon();
						        		rangeApp.applyRangesToUI(rangeApp.chosenCamId);
						        	}, 500);
						        }
						    },
						    error:function(xhr,textStatus){
						    	layer.msg("删除失败！");
						    }
						});
					});
				},
				clearMapPolygon:function(){
					if(rangeApp.newVideoRangePolygon){
	        			map.getOverlayLayer().removeOverlay(rangeApp.newVideoRangePolygon);
		        		rangeApp.newVideoRangePolygon=null;
	        		}
	        		if(queryResPolygons&&queryResPolygons.length>0){
	        			for(var i=0;i<queryResPolygons.length;i++){
	        				map.getOverlayLayer().removeOverlay(queryResPolygons[i]);
	        			}
	        			queryResPolygons=[];
	        		}
				},
				clearMapCam:function(){
					if(markers && markers.length>0){
						for (var i = 0; i < markers.length; i++) {
		    				map.getOverlayLayer().removeOverlay(markers[i]);
		    			}
		    			markers = [];
					}
				},
				cancelAdd:function(){
					if(rangeApp.newVideoRangePolygon){
	        			map.getOverlayLayer().removeOverlay(rangeApp.newVideoRangePolygon);
		        		rangeApp.newVideoRangePolygon=null;
	        		}
					rangeApp.finshedDraw=false;
				},
				close: function() {
					itsGlobal.hideLeftPanel();
					rangeApp.clearMapPolygon();
					rangeApp.clearMapCam();
					rangeApp.hideRanges();
					map.getOverlayLayer().removeOverlay(rangeApp.duiMarker);
					rangeApp.duiMarker = null;
				},
				isPrePosExist:function(pos){
					var rslt = false;
					for(var i=0; i<this.rangeList.length;i++){
						var rg = this.rangeList[i];
						if(rg && rg.prePosition){
							if(rg.prePosition == pos){
								rslt = true;
								break;
							}
						}
					}
					return rslt;
				}
			}
		});
		vueEureka.set("leftPanel", {
			vue: rangeApp,
			description: "rangeApp的vue实例"
		});
		rangeApp.loadData();
		
		/*setTimeout(function(){
			 require(['bootstrapMultiselect'],function(){
				 $('#camSelectedId').multiselect({
						enableFiltering: true,//搜索
						maxHeight:300
					});
			 });
    	}, 0);*/
		
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}
	
	return {
		show: show,
		hide: hide
	};
})