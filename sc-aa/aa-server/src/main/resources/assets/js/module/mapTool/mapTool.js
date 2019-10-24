define(function(require) {
	var mapToolHtml = require('text!./mapTool.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var tool = null;
	var rlnglats =[];
	var googleLayer = null;
	var trafficStatusLayer =null;
	var jgfwLayer =null;
	var laneLayer =null;
	var showToolBtns =true;
	var epMarkers = [];//电警标注
	var highlightIcon = new IMAP.Icon("./assets/images/highlight.gif", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	
	var videoMarkerOpts = new IMAP.MarkerOptions();
	videoMarkerOpts.icon = new IMAP.Icon("./assets/images/videoCamCloud.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	videoMarkerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	function MapTool(div) { //
		this._init(div);
	}
	
	MapTool.prototype._init = function(div) {
		var it = this;
		div.html(mapToolHtml);
		var mapToolApp = new Vue({
			el: '#mapToolContent',
			data: {
				address:"公安",
				overlayQ:"",
				matchLnglats: null,
				loopIdx:0,
				circleShowDevice :"",
				ciecleShowDeviceItem:{},
				carStartPnt:"",
				carEndPnt:"",
				relatedVideos:[],
				videoMakers:[],
				showListText:false,
				isGuardUsed: 1//是否加载警卫视频
			},
			methods: {
				lineSearchVideo: function() {
					this.clearShape();
					mousetool=new IMAP.PolylineTool();
					mousetool.arrow = true;
					mousetool.autoClose = true;//是否自动关闭绘制	
					map.addTool(mousetool);
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						mapToolApp.overlay = evt.overlay;
						mapToolApp.shape = TUtils.polygonPath2Str(evt.overlay.getPath());
						mapToolApp.findRelatedDevs();
						mapToolApp.showListText = true;
						mousetool.close();
					},this);
				},
				findRelatedDevs:function(){
					if(null != this.overlay &&　'' != this.shape){
						this.searchingDev = true;
						this.findJWXLRelatedDev();
					}
				},
				//查找警卫路线相关的设备
				findJWXLRelatedDev:function(){
					layer.load();
					var pathArr = TUtils.lineToPoints(this.overlay,5);
					var minMaxLngLat = TUtils.getMinMaxLngLat(this.overlay);
					if(pathArr && minMaxLngLat){
						var pMid = TUtils.getMidPoint(minMaxLngLat[0],minMaxLngLat[1]);
						var radio = TUtils.getDistance(minMaxLngLat[0],minMaxLngLat[1])+150;
						var promiseCombined = $.when(this.loadMatchConditionVideo(pathArr, pMid,radio));
						promiseCombined.done(function(){
							mapToolApp.drawRelatedVideos();
							mapToolApp.searchingDev = false;
						});
					}
				},
				//加载达到300米距离内的视频监控
				loadMatchConditionVideo:function(pathArr, pMid, radio){
					var tmpUrl = "dev/videoCamera/allData?isGuardUsed=0&cameraTpList=1,6,10"; //交警大队、科信、高点
//					tmpUrl = "dev/videoCamera/allData";
					return $.ajax({
					    url:'./map/map/findVideoInCycle?lnglat='+pMid+'&radius='+radio,
					    success:function(rslt){
					        if(rslt.code == 200){
					        	var allVideo = rslt.mapPoiContainer.videoCameraList
					        	mapToolApp._allVideo = allVideo;
    							for (var t = 0; t < pathArr.length - 1; t++) {
    								var p1 = pathArr[t];
    								var p2 = pathArr[t + 1];
    								for (var d = 0; d < allVideo.length; d++) {
    									var video = allVideo[d];
    									if(!video.shape || video.shape.indexOf(",") == -1){
    										continue;
    									}
    									var pos = video.shape.split(",");
    									var dis = TUtils.getDisFromPoint2Line(new IMAP.LngLat(pos[0], pos[1]), p1, p2);
    									if ((video.type == 10 && dis <= 150) || (video.type !=10 && dis <= 50)) {
    										mapToolApp.addVideoToList(video); 
    									}
    								}
    							}
    							layer.closeAll('loading');
						    	layer.msg("查询完成！");
					        }else{
						    	layer.msg("查询失败！");
					        }
					    }
					});
					/*return $.ajax({
    					url: tmpUrl,
    					success: function(rslt){
    						if(rslt.code == 200){
    							var allVideo = rslt.videoCameraList;
    							mapToolApp._allVideo = allVideo;
    							for (var t = 0; t < pathArr.length - 1; t++) {
    								var p1 = pathArr[t];
    								var p2 = pathArr[t + 1];
    								for (var d = 0; d < allVideo.length; d++) {
    									var video = allVideo[d];
    									if(!video.shape || video.shape.indexOf(",") == -1){
    										continue;
    									}
    									var pos = video.shape.split(",");
    									var dis = TUtils.getDisFromPoint2Line(new IMAP.LngLat(pos[0], pos[1]), p1, p2);
    									if (dis <= 300) {
    										mapToolApp.addVideoToList(video);
    									}
    								}
    							}
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});*/
				},
				//在地图上画出相关联的视频监控
				drawRelatedVideos:function(){
					if(this.relatedVideos.length > 0){
						for (var i = 0; i < this.relatedVideos.length; i++) {
							var v = this.relatedVideos[i].video;
							if(v.shape && v.shape.indexOf(",") != -1){
								var pos = v.shape.split(",");
								var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), videoMarkerOpts);
								marker.addEventListener(IMAP.Constants.CLICK, mapToolApp.openOneVideo);
								marker.data = v;
								map.getOverlayLayer().addOverlay(marker, true);
								marker.setTitle(v.deviceName+"("+v.deviceId+")");
								this.videoMakers.push(marker);
							}
						}
					}
				},
				//视频监控添加到list,vue会自动生成Dom
				addVideoToList:function(v){
					var flag = true;
					for (var i = 0; i < this.relatedVideos.length; i++) {
						var s = this.relatedVideos[i].video;
						if(s.deviceId == v.deviceId){
							flag = false;
							break;
						}
					}
					if(flag){
						this.relatedVideos.push({"video":v});
					}
				},
				//清除相关设备
				clearShape: function () {
					mapToolApp.clearAllOverlays();
					for (var j = 0; j < this.videoMakers.length; j++) {
						var m = this.videoMakers[j];
						map.getOverlayLayer().removeOverlay(m);
					}
					this.videoMakers =[];
					this.relatedVideos = [];
					if(this.overlay){
						map.getOverlayLayer().removeOverlay(this.overlay);
						this.shape='';
						this.overlay = null;
					}
					if(this.highlightPoint){
						map.getOverlayLayer().removeOverlay(this.highlightPoint);
						this.highlightPoint = null;
					}
					this.searchingDev = false;
					this.showListText = false;
				},
				openOneVideo:function(e){
					var v =e.target.data;
					var tunnels = v.deviceId;
					require(['layers/camera/camera'],function(camera){
						camera.playWinVideo(tunnels);
					});
				},
			    toggleDrawMarker: function() {
			    	tool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/marker.png"), new IMAP.Size(24, 26)));
					tool.follow=true;
					tool.autoClose=true;
					tool.title="点击左键标注点位";
					map.addTool(tool);
					tool.open();
			    },
				toggleDrawPolyline: function() {
			    	tool=new IMAP.PolylineTool();
			    	tool.arrow = true;//是否带箭头绘制
					tool.autoClose = true;//是否自动关闭绘制	
					map.addTool(tool);
					tool.open();
			    },
			    toggleDrawPolygon: function() {
			    	tool=new IMAP.PolygonTool();
			    	tool.arrow = true;//是否带箭头绘制
					tool.autoClose = true;//是否自动关闭绘制	
					map.addTool(tool);
					tool.open();
			    },
			    toggleDrawRect: function() {
			    	tool=new IMAP.RectangleTool();
			    	tool.arrow = true;//是否带箭头绘制
					tool.autoClose = true;//是否自动关闭绘制	
					map.addTool(tool);
					tool.open();
			    },
			    toggleDrawCircle: function() {
			    	tool=new IMAP.CircleTool();
			    	tool.arrow = true;//是否带箭头绘制
					tool.autoClose = true;//是否自动关闭绘制	
					map.addTool(tool);
					tool.open();
			    },
			    toggleDrawClose: function() {
			    	if(tool){
			    		tool.close();
			    	}
			    },
				//兴趣点搜索
			    poiSearch: function() {
			    	if(map) {
	                    var keyword = mapToolApp.address, city = "太仓市";
	                    map.plugin(['IMAP.PoiSearch'], function() {
	                        poiSearch = new IMAP.PoiSearch({
	                            panel: "poiResultDiv",
	                            map: map,
	                            pageSize: 8,
	                            scope: "all"
	                        });
	                        poiSearch.setPageNumber(0);
	                        poiSearch.search(keyword, city, mapToolApp.poiRsltCallback);
	                    });
	                }
			    },
			    poiRsltCallback: function(status, data) {
	                /*for(var i = 0; i < data.results.length; i++) {
	                	mapToolApp.getPoiAddress(data.results[i], i);
	                };*/
//	                $('#panel_search_paseNoDiv').hide();
	            },
			    getPoiAddress: function(item, index) {
			    	var poiApiUrl = 'http://114.215.146.210:25001/as/rgeo/simple?';
			    	var mapAk ='a38637152661536811426544710c5a2c';
		    		if(itsEnv == 'prod'){
		    			poiApiUrl = 'http://192.168.15.4:25001/as/rgeo/simple?'
		    			mapAk ='96afef81bcb8de97f2687b41d6f4d07a';
					}
	                $.ajax({
	                    type: "GET",
	                    url: poiApiUrl,
	                    data: {
	                        location: item.location.lng + ',' + item.location.lat,
	                        ak: mapAk
	                    },
	                    dataType: "jsonp",
	                    success: function(res) {
	                        var address = res.result[0].formatted_address;
	                        var _add = $('#poiResultDiv tr').eq(index).find('td').eq(1).find('p').eq(1).html()
	                        address += _add.substr(3, _add.length)
	                        $('#poiResultDiv tr').eq(index).find('td').eq(1).find('p').eq(1).html('地址：' + address)
	                    }
	                });
	            },
				//地理解析
			    toGeocoder: function() {
					map.plugin(['IMAP.Geocoder'], function(){
						var geocoder=new IMAP.Geocoder({city:"太仓市", pois:false});
						geocoder.getLocation(mapToolApp.address,function(status,results){
							if(status==0){
								var marker;
								var datas=results.results, plnglat,lnglat,marker;
								for(var i=0,l=datas.length;i<l;++i){
									plnglat=datas[i].location;
									lnglat=new IMAP.LngLat(plnglat.lng,plnglat.lat);
									marker=mapToolApp.addUserMarker(lnglat);
								}
								if(marker){
									map.panTo(rlnglats[0]);
//									map.setBestMap(rlnglats);
								}
							}else{
								alert("未能找到相应地址！");
							}
						});
					});
			    },
				//逆地理解析
			    fromGeocoder :function(){
			    	//121.13372,31.46506
					map.plugin(['IMAP.Geocoder'], function(){
						if(mapToolApp.address && mapToolApp.address.indexOf(",") != -1){
							var lng = mapToolApp.address.split(",")[0];
							var lat = mapToolApp.address.split(",")[1];
							var lnglat=new IMAP.LngLat(lng,lat);
							var geocoder=new IMAP.Geocoder({city:"苏州", pois:true});
							geocoder.getAddress(lnglat, function(status,results){
								var marker=mapToolApp.addUserMarker(lnglat);
								map.panTo(lnglat);
							});
						}else{
							alert("请输入合法的经纬度,格式:  经度,纬度");
						}
					});
				},
				//marker定位 todo
				locateMarker :function(){
					if(mapToolApp.address){//定位
						mapToolApp.matchLnglats = [];
						if(gblMapObjs.signalMarkers){
							for (var i = 0; i < gblMapObjs.signalMarkers.length; i++) {
								var marker = gblMapObjs.signalMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.deviceName){
										if(bindData.deviceName.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.deviceName;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.cameraMarkers){
							for (var i = 0; i < gblMapObjs.cameraMarkers.length; i++) {
								var marker = gblMapObjs.cameraMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.deviceName){
										if(bindData.deviceName.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.deviceName;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.epMarkers){
							for (var i = 0; i < gblMapObjs.epMarkers.length; i++) {
								var marker = gblMapObjs.epMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.deviceName){
										if(bindData.deviceName.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.deviceName;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.bzMarkers){
							for (var i = 0; i < gblMapObjs.bzMarkers.length; i++) {
								var marker = gblMapObjs.bzMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc){
										if(bindData.mc.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.mc;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.crossMarkers){
							for (var i = 0; i < gblMapObjs.crossMarkers.length; i++) {
								var marker = gblMapObjs.crossMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc){
										if(bindData.mc.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.mc;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.roadPolyLines){
							for (var i = 0; i < gblMapObjs.roadPolyLines.length; i++) {
								var polyLine = gblMapObjs.roadPolyLines[i];
								if(polyLine.data){
									var bindData = polyLine.data;
									if(bindData.mc){
										if(bindData.mc.indexOf(mapToolApp.address) > -1){
											var option = polyLine.getAttribute();
											option.strokeWeight = 20;
											option.strokeColor = '#A020F0';
											polyLine.setAttribute(option);

											var lnglat = polyLine.getPath()[0];//取一个点用做定位
											lnglat.dispTitle = bindData.mc;
											mapToolApp.matchLnglats.push(lnglat);
//											map.setBestMap(polyLine.getPath());
										}
									}
								}
							}
						}
						if(gblMapObjs.roadLinkPolyLines){
							for (var i = 0; i < gblMapObjs.roadLinkPolyLines.length; i++) {
								var polyLine = gblMapObjs.roadLinkPolyLines[i];
								if(polyLine.data){
									var bindData = polyLine.data;
									if(bindData.mc){
										if(bindData.mc.indexOf(mapToolApp.address) > -1){
											var option = polyLine.getAttribute();
											option.strokeWeight = 20;
											option.strokeColor = '#A020F0';
											polyLine.setAttribute(option);
											
											var lnglat = polyLine.getPath()[0];//取一个点用做定位
											lnglat.dispTitle = bindData.mc;
											mapToolApp.matchLnglats.push(lnglat);
//											map.setBestMap(polyLine.getPath());
										}
									}
								}
							}
						}
						if(gblMapObjs.lanePolyLines){
							for (var i = 0; i < gblMapObjs.lanePolyLines.length; i++) {
								var polyLine = gblMapObjs.lanePolyLines[i];
								if(polyLine.data){
									var bindData = polyLine.data;
									if(bindData.bh){
										if(bindData.bh.indexOf(mapToolApp.address) > -1){
											var option = polyLine.getAttribute();
											option.strokeWeight = 20;
											option.strokeColor = '#A020F0';
											polyLine.setAttribute(option);
											
											var lnglat = polyLine.getPath()[0];//取一个点用做定位
											lnglat.dispTitle = bindData.bh;
											mapToolApp.matchLnglats.push(lnglat);
//											map.setBestMap(polyLine.getPath());
										}
									}
								}
							}
						}
						if(gblMapObjs.gajgMarkers){
							for (var i = 0; i < gblMapObjs.gajgMarkers.length; i++) {
								var marker = gblMapObjs.gajgMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc){
										if(bindData.mc.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.mc;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.yljhjgMarkers){
							for (var i = 0; i < gblMapObjs.yljhjgMarkers.length; i++) {
								var marker = gblMapObjs.yljhjgMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc.indexOf(mapToolApp.address) > -1){
										marker.setIcon(highlightIcon);
										var lnglat = marker.getPosition();
										lnglat.dispTitle = bindData.mc;
										mapToolApp.matchLnglats.push(lnglat);
									}
								}
							}
						}
						if(gblMapObjs.xfjgMarkers){
							for (var i = 0; i < gblMapObjs.xfjgMarkers.length; i++) {
								var marker = gblMapObjs.xfjgMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc.indexOf(mapToolApp.address) > -1){
										marker.setIcon(highlightIcon);
										var lnglat = marker.getPosition();
										lnglat.dispTitle = bindData.mc;
										mapToolApp.matchLnglats.push(lnglat);
									}
								}
							}
						}
						if(gblMapObjs.sfzMarkers){ 
							for (var i = 0; i < gblMapObjs.sfzMarkers.length; i++) {
								var marker = gblMapObjs.sfzMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc.indexOf(mapToolApp.address) > -1){
										marker.setIcon(highlightIcon);
										var lnglat = marker.getPosition();
										lnglat.dispTitle = bindData.mc;
										mapToolApp.matchLnglats.push(lnglat);
									}
								}
							}
						}
						if(gblMapObjs.lzdwMarkers){ 
							for (var i = 0; i < gblMapObjs.lzdwMarkers.length; i++) {
								var marker = gblMapObjs.lzdwMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc.indexOf(mapToolApp.address) > -1){
										marker.setIcon(highlightIcon);
										var lnglat = marker.getPosition();
										lnglat.dispTitle = bindData.mc;
										mapToolApp.matchLnglats.push(lnglat);
									}
								}
							}
						}
						if(gblMapObjs.jyzMarkers){ 
							for (var i = 0; i < gblMapObjs.jyzMarkers.length; i++) {
								var marker = gblMapObjs.jyzMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc.indexOf(mapToolApp.address) > -1){
										marker.setIcon(highlightIcon);
										var lnglat = marker.getPosition();
										lnglat.dispTitle = bindData.mc;
										mapToolApp.matchLnglats.push(lnglat);
									}
								}
							}
						}
						if(gblMapObjs.crkMarkers){
							for (var i = 0; i < gblMapObjs.crkMarkers.length; i++) {
								var marker = gblMapObjs.crkMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc){
										if(bindData.mc.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.mc;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.fhssMarkers){
							for (var i = 0; i < gblMapObjs.fhssMarkers.length; i++) {
								var marker = gblMapObjs.fhssMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.mc){
										if(bindData.mc.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.mc;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.qlPolyLines){
							for (var i = 0; i < gblMapObjs.qlPolyLines.length; i++) {
								var polyLine = gblMapObjs.qlPolyLines[i];
								if(polyLine.data){
									var bindData = polyLine.data;
									if(bindData.mc){
										if(bindData.mc.indexOf(mapToolApp.address) > -1){
											var option = polyLine.getAttribute();
											option.strokeWeight = 20;
											option.strokeColor = '#A020F0';
											polyLine.setAttribute(option);
											
											var lnglat = polyLine.getPath()[0];//取一个点用做定位
											lnglat.dispTitle = bindData.mc;
											mapToolApp.matchLnglats.push(lnglat);
//											map.setBestMap(polyLine.getPath());
										}
									}
								}
							}
						}
						
						if(gblMapObjs.policeCarMarkers){
							for (var i = 0; i < gblMapObjs.policeCarMarkers.length; i++) {
								var marker = gblMapObjs.policeCarMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.plateNo){
										if(bindData.plateNo.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.plateNo;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.policeRsdioMarkers){
							for (var i = 0; i < gblMapObjs.policeRsdioMarkers.length; i++) {
								var marker = gblMapObjs.policeRsdioMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.radioName){
										if(bindData.radioName.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.radioName;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						if(gblMapObjs.policeJwtMarkers){
							for (var i = 0; i < gblMapObjs.policeJwtMarkers.length; i++) {
								var marker = gblMapObjs.policeJwtMarkers[i];
								if(marker.data){
									var bindData = marker.data;
									if(bindData.policeName){
										if(bindData.policeName.indexOf(mapToolApp.address) > -1){
											marker.setIcon(highlightIcon);
											var lnglat = marker.getPosition();
											lnglat.dispTitle = bindData.policeName;
											mapToolApp.matchLnglats.push(lnglat);
										}
									}
								}
							}
						}
						
						if(mapToolApp.matchLnglats){
							if(mapToolApp.matchLnglats.length == 1){
								map.setCenter(mapToolApp.matchLnglats[0],18);
							}else{
								map.setBestMap(mapToolApp.matchLnglats);
							}
							layer.msg('找到'+mapToolApp.matchLnglats.length+"个匹配对象");
						}
					}else{
						mapToolApp.matchLnglats = null;
					}
				},
				nextMarker :function(){
					if(mapToolApp.loopIdx >= mapToolApp.matchLnglats.length){
						mapToolApp.loopIdx = 0;
					}
					var matchLnglat = mapToolApp.matchLnglats[mapToolApp.loopIdx];
					layer.msg(matchLnglat.dispTitle);
					map.setCenter(matchLnglat,18);
					mapToolApp.loopIdx++;
				},
			    //地理编码搜索返回执行函数
			    addUserMarker :function(lnglat){
					var icon=new IMAP.Icon("./assets/images/point.png",{"size":{"width":24,"height":36},"offset":{x:0,y:0}});
					var opt={"icon":icon};
					var marker=new IMAP.Marker(lnglat, opt);
					map.getOverlayLayer().addOverlay(marker);
					rlnglats.push(lnglat);
					return marker;
				},
			    //测量距离
			    toggleDistance:function () {
			    	tool=new IMAP.DistanceTool();
					map.addTool(tool);
					tool.title="左键双击结束测距";
					tool.autoClose = true;
					tool.open();
			    },
			    //测量面积
			    toggleArea:function () {
			    	tool=new IMAP.AreaTool();
					map.addTool(tool);
					tool.title="左键双击结束测面";
					tool.autoClose = true;
					tool.open();
			    },
			    toggleGoogleLayer: function(event) {
			    	var tar = event.currentTarget;
			    	if(googleLayer){
			        	$(tar).removeClass('btn-primary');
				    	googleLayer.setMap();
				    	googleLayer = null;
			    	}else{
			        	$(tar).addClass('btn-primary');
				    	googleLayer = new IMAP.TileLayer({
				    		tileSize: 256,
				    		maxZoom: 20,
				    		minZoom: 11,
				    	});
				    	googleLayer.setTileUrlFunc(function(x,y,z){
				    		var url = "http://mt1.google.cn/vt/lyrs=m@180000000&hl=zh-CN&gl=cn&src=app&s=Gal&z=" + z + "&x=" + x + "&y=" +y;//矢量图
				    		url = "http://mt3.google.cn/vt/lyrs=s@110&hl=zh-CN&gl=cn&src=app&s=Gal&z=" + z + "&x=" + x + "&y=" +y;//影像图
							if(itsEnv == 'prod'){
								url = "http://192.168.14.4:81/gmap/vt/lyrs=s@110&hl=zh-CN&gl=cn&src=app&s=Gal&z=" + z + "&x=" + x + "&y=" +y;//影像图
							}
//				    		url = "http://mt1.google.cn/vt/imgtp=png32&lyrs=h@177000000&hl=zh-CN&gl=cn&src=app&s=Gal&z=" + z + "&x=" + x + "&y=" +y;//影像叠加层
				    		return url;
				    	});
				    	googleLayer.setMap(map);
			    	}
			    },
			    //路况
			    toggleTrafficStatus: function(event) {
			    	var tar = event.currentTarget;
					if(itsEnv == 'prod'){
						if(trafficStatusLayer){
							$(tar).removeClass('btn-primary');
							trafficStatusLayer.setMap();
							trafficStatusLayer = null;
						}else{
							$(tar).addClass('btn-primary');
							mapToolApp.addTrafficStatusLayer();
						}
					}
			    },
			    addTrafficStatusLayer : function () {
					if(itsEnv == 'prod'){
						trafficStatusLayer = new IMAP.TileLayer({
							maxZoom:18,
							minZoom:1,
							tileSize : 256
						});
						trafficStatusLayer.setTileUrlFunc(function(x,y,z){
							//add time chuo _dc= new Date().getTime() ; 每次取到最新的
							var url = "http://" + host +":8883/tile?lid=traffic&get=map&cache=off&x={x}&y={y}&z={z}&_dc="+new Date().getTime();
							return url.replace("{x}",x).replace("{y}",y).replace("{z}",z);
						});
						map.addLayer(trafficStatusLayer);
					}
				},
			    //测绘地图
			    toggleCHDT: function(event) {
			    	var tar = event.currentTarget;
			        if(laneLayer){
			        	$(tar).removeClass('btn-primary');
			        	laneLayer.setMap();
			        	laneLayer = null;
			        }else{
			        	$(tar).addClass('btn-primary');
			        	layer.msg('缩放18级以上可查看高精车道图');
			        	mapToolApp.addCHDTLayer();
			        }
			    },
			    addCHDTLayer : function () {
		        	//################################测绘车道级别图层################################
		        	laneLayer = new IMAP.TileLayer({
		        		tileSize: 256,
		        		maxZoom: 20,
		        		minZoom: 19,
		        	});
		        	//laneLayer.setOpacity(0.5)

		        	
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
		        	map.addLayer(laneLayer);
				},
			    //加工范围
			    toggleJGFW: function(event) {
			    	var tar = event.currentTarget;
			        if(jgfwLayer){
			        	$(tar).removeClass('btn-primary');
			        	jgfwLayer.setMap();
			        	jgfwLayer = null;
			        }else{
			        	$(tar).addClass('btn-primary');
			        	/*不要加载这个图层！！！*/
			        	//################################测绘加工进展地图################################
			        	jgfwLayer = new IMAP.TileLayer({
			        		tileSize: 256,
			        		maxZoom: 14,
			        		minZoom: 13,
			        	});
			        	jgfwLayer.setTileUrlFunc(function(x,y,z){
			        		return ("http://192.168.15.6:6080/arcgis/rest/services/MAP/QH_JZ/MapServer/tile/" + z + "/" + y + "/" + x );
			        	});
			        	map.addLayer(jgfwLayer);
			        }
			    },
			    hideToolBar: function(event) {
			    	if(showToolBtns){
			    		$("#mapToolPanel").animate({height:'0px'}, 200);
			    		$("#mapToolBtns").hide(200);
			    		$('#mapToolHideBtnimg').css('background','url("./assets/images/slider-down.png") no-repeat');
//			    		$('#mapToolHideBtn').removeClass('fa-chevron-up');
//			    		$('#mapToolHideBtn').addClass('fa-chevron-down');
			    		showToolBtns = false;
			    	}else{
			    		$("#mapToolPanel").animate({height:'32px'}, 200);
			    		$("#mapToolBtns").show(200);
			    		$('#mapToolHideBtnimg').css('background','url("./assets/images/slider-up.png") no-repeat');
//			    		$('#mapToolHideBtn').removeClass('fa-chevron-down');
//			    		$('#mapToolHideBtn').addClass('fa-chevron-up');
			    		showToolBtns = true;
			    	}
			    },
			    //复位
				resetLocation: function(){
					var center = new IMAP.LngLat(121.128187,31.464808);
					map.setCenter(center,14);
			    },
			    carDriving: function(){
					if(!mapToolApp.carStartPnt){
						layer.msg("请在地图上标注起点");
						tool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/marker.png"), new IMAP.Size(24, 24)));
						tool.follow=true;
						tool.autoClose=true;
						tool.title="点击左键标注起点";
						tool.addEventListener(IMAP.Constants.ADD_OVERLAY, function(evt) {
							mapToolApp.carStartPnt = evt.overlay.getPosition();
						}, this);
						map.addTool(tool);
						tool.open();
						return;
					}else if(!mapToolApp.carEndPnt){
						layer.msg("请在地图上标注终点");
						tool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/marker.png"), new IMAP.Size(24, 24)));
						tool.follow=true;
						tool.autoClose=true;
						tool.title="点击左键标注终点";
						tool.addEventListener(IMAP.Constants.ADD_OVERLAY, function(evt) {
							mapToolApp.carEndPnt = evt.overlay.getPosition();
							layer.msg("计算导航线路");
							mapToolApp.plan();
						}, this);
						map.addTool(tool);
						tool.open();
						return;
					}else {
						mapToolApp.carStartPnt = "";
						mapToolApp.carEndPnt = "";
						layer.msg("导航起点和终点已经清除！");
					}
			    },
	            //导航路径规划
			    plan : function() {
	                map.plugin(['IMAP.Driving'], function() {
	                    var drivingSearch = new IMAP.Driving({
	                        panel: "poiResultDiv",
	                        map: map
	                    });
//	                    drivingSearch.setWaypoints([new IMAP.LngLat(warPoint[0], warPoint[1])]);
//	                    drivingSearch.setAvoidPolygons([lnglatarr]);
	                    drivingSearch.search(new IMAP.LngLat(mapToolApp.carStartPnt.lng, mapToolApp.carStartPnt.lat), 
	                    		new IMAP.LngLat(mapToolApp.carEndPnt.lng, mapToolApp.carEndPnt.lat), function() {
	                        //绘制避让区域面
	                        var layer = map.getOverlayLayer();
//	                        layer.addOverlay(avoidpolygons);
//	                        layer.addOverlay(avoidLabel);
	                    });
	                });
	            },
	            toggleSJXL:function(e){
	            	var tar = $(e.currentTarget);
			    	if(tar.hasClass("btn-primary")){
			    		tar.removeClass('btn-primary');
			        	require(['layers/signaling/signaling'],function(signaling){
			        		signaling.showLayer(false);
		    			});
			    	}else{
			    		tar.addClass('btn-primary');
			        	require(['layers/signaling/signaling'],function(signaling){
			        		signaling.showLayer(true);
		    			});
			    	}
	            },
				clearAllOverlays :function(lnglat){
					$('#poiResultDiv').html('');
					mapToolApp.carStartPnt = "";
					mapToolApp.carEndPnt = "";
					map.getOverlayLayer().clear();
					if(gblMapObjs.signalDataCluster){
		    			require(['layers/signal/signalListHandler'],function(signalListHandler){
		    				signalListHandler.closePanel();
		    			});
	    				gblMapObjs.signalDataCluster.clearMarkers();
	    			}
					if(gblMapObjs.signalMarkers){
						gblMapObjs.signalMarkers = [];
					}
					
					if(gblMapObjs.epDataCluster){
						gblMapObjs.epDataCluster.clearMarkers();
					}
					if(gblMapObjs.epMarkers){
						gblMapObjs.epMarkers = [];
					}
					
					if(gblMapObjs.bzDataCluster){
	    				gblMapObjs.bzDataCluster.clearMarkers();
	    			}
					if(gblMapObjs.bzMarkers){
						gblMapObjs.bzMarkers = [];
					}
					
					if(gblMapObjs.crossDataCluster){
						gblMapObjs.crossDataCluster.clearMarkers();
					}
					if (gblMapObjs.crossMarkers) {
						gblMapObjs.crossMarkers=[];
					}

					if (gblMapObjs.roadPolyLines) {
						gblMapObjs.roadPolyLines=[];
					}

					if (gblMapObjs.roadLinkPolyLines) {
						gblMapObjs.roadLinkPolyLines=[];
					}
					
					if (gblMapObjs.lanePolyLines) {
						gblMapObjs.lanePolyLines=[];
					}
					
					if (gblMapObjs.cameraCluster) {
						gblMapObjs.cameraCluster.clearMarkers();
					}
					
					if (gblMapObjs.trafficDataCluster) {
						gblMapObjs.trafficDataCluster.clearMarkers();
					}
					if (gblMapObjs.safeDataCluster) {
						gblMapObjs.safeDataCluster.clearMarkers();
					}
					if (gblMapObjs.schoolDataCluster) {
						gblMapObjs.schoolDataCluster.clearMarkers();
					}
					if (gblMapObjs.cityDataCluster) {
						gblMapObjs.cityDataCluster.clearMarkers();
					}
					if (gblMapObjs.socialDataCluster) {
						gblMapObjs.socialDataCluster.clearMarkers();
					}
					if (gblMapObjs.kexinDataCluster) {
						gblMapObjs.kexinDataCluster.clearMarkers();
					}
					if (gblMapObjs.otherDataCluster) {
						gblMapObjs.otherDataCluster.clearMarkers();
					}
					if (gblMapObjs.banqiaoClu) {
						gblMapObjs.banqiaoClu.clearMarkers();
					}
					if (gblMapObjs.chengxiClu) {
						gblMapObjs.chengxiClu.clearMarkers();
					}
					if (gblMapObjs.chengzhongClu) {
						gblMapObjs.chengzhongClu.clearMarkers();
					}
					if (gblMapObjs.gangquClu) {
						gblMapObjs.gangquClu.clearMarkers();
					}
					if (gblMapObjs.gongjiaoClu) {
						gblMapObjs.gongjiaoClu.clearMarkers();
					}
					if (gblMapObjs.hengjinClu) {
						gblMapObjs.hengjinClu.clearMarkers();
					}
					if (gblMapObjs.jincangClu) {
						gblMapObjs.jincangClu.clearMarkers();
					}
					if (gblMapObjs.jinlangClu) {
						gblMapObjs.jinlangClu.clearMarkers();
					}
					if (gblMapObjs.kaifaquClu) {
						gblMapObjs.kaifaquClu.clearMarkers();
					}
					if (gblMapObjs.kejiaoClu) {
						gblMapObjs.kejiaoClu.clearMarkers();
					}
					if (gblMapObjs.liuheClu) {
						gblMapObjs.liuheClu.clearMarkers();
					}
					if (gblMapObjs.liujiagangClu) {
						gblMapObjs.liujiagangClu.clearMarkers();
					}
					if (gblMapObjs.luduClu) {
						gblMapObjs.luduClu.clearMarkers();
					}
					if (gblMapObjs.shaxiClu) {
						gblMapObjs.shaxiClu.clearMarkers();
					}
					if (gblMapObjs.shuangfengClu) {
						gblMapObjs.shuangfengClu.clearMarkers();
					}
					if (gblMapObjs.yuewangClu) {
						gblMapObjs.yuewangClu.clearMarkers();
					}
					if(gblMapObjs.jwtDataCluster){
						gblMapObjs.jwtDataCluster.clearMarkers();
					}
					if(gblMapObjs.policeCarDataCluster){
						gblMapObjs.policeCarDataCluster.clearMarkers();
					}
					if(gblMapObjs.radioDataCluster){
						gblMapObjs.radioDataCluster.clearMarkers();
					}
					if(gblMapObjs.yljhjgDataCluster){
						gblMapObjs.yljhjgDataCluster.clearMarkers();
					}
					if(gblMapObjs.sfzDataCluster){
						gblMapObjs.sfzDataCluster.clearMarkers();
					}
					if(gblMapObjs.xfjgDataCluster){
						gblMapObjs.xfjgDataCluster.clearMarkers();
					}
					if(gblMapObjs.lzdwDataCluster){
						gblMapObjs.lzdwDataCluster.clearMarkers();
					}
					if(gblMapObjs.jyzDataCluster){
						gblMapObjs.jyzDataCluster.clearMarkers();
					}

					if(gblMapObjs.crkDataCluster){
						gblMapObjs.crkDataCluster.clearMarkers();
					}
					if (gblMapObjs.crkMarkers) {
						gblMapObjs.crkMarkers=[];
					}

					if(gblMapObjs.fhssDataCluster){
						gblMapObjs.fhssDataCluster.clearMarkers();
					}
					if (gblMapObjs.fhssMarkers) {
						gblMapObjs.fhssMarkers=[];
					}

					if(gblMapObjs.gajgDataCluster){
						gblMapObjs.gajgDataCluster.clearMarkers();
					}
					if (gblMapObjs.gajgMarkers) {
						gblMapObjs.gajgMarkers=[];
					}

					if (gblMapObjs.qlPolyLines) {
						gblMapObjs.qlPolyLines=[];
					}
					if (gblMapObjs.jyzMarkers) {
						gblMapObjs.jyzMarkers=[];
					}
					if (gblMapObjs.lzdwMarkers) {
						gblMapObjs.lzdwMarkers=[];
					}
					if (gblMapObjs.sfzMarkers) {
						gblMapObjs.sfzMarkers=[]; 
					}
					if (gblMapObjs.xfjgMarkers) {
						gblMapObjs.xfjgMarkers=[];
					}
					if (gblMapObjs.yljhjgMarkers) {
						gblMapObjs.yljhjgMarkers=[];
					}
					if (gblMapObjs.policeRsdioMarkers) {
						gblMapObjs.policeRsdioMarkers=[];
					}
					if (gblMapObjs.policeJwtMarkers) {
						gblMapObjs.policeJwtMarkers=[];
					}
					if (gblMapObjs.policeCarMarkers) {
						gblMapObjs.policeCarMarkers=[];
					}
					require(['layerPanel/layerPanel'],function(layerPanel){
						layerPanel.clearTreeNodes();
					});
					mapToolApp.matchLnglats = null;
				},
				getDeviceShowMenu : function(){
					$.ajax({
						type: "GET",
					    url: "./sys/parameter/allData",
					    async: false,
					    success: function(rslt){
							if(rslt.code == 200){
								var list = rslt.parameterList;
								if(null != list && list.length > 0) {
									for(var i=0;i<list.length;i++){
										var item = list[i];
										if("circle.device.show" == item.key){
											mapToolApp.ciecleShowDeviceItem=item;
											mapToolApp.circleShowDevice = item.value;
											if(mapToolApp.circleShowDevice && mapToolApp.circleShowDevice != ""){
												var devices = mapToolApp.circleShowDevice.split(",");
												for(var i=0;i<devices.length;i++){
													var item = devices[i];
													switch(item)
													{
													case "signal":
													  $("#signalShowCheckBox").attr("checked",'true');
													  break;
													case "video":
													  $("#videoShowCheckBox").attr("checked",'true');
													  break;
													case "vms":
													  $("#vmsShowCheckBox").attr("checked",'true');
														  break;
													case "police":
													  $("#policeShowCheckBox").attr("checked",'true');
														  break;
													case "ep":
														  $("#epShowCheckBox").attr("checked",'true');
															  break;
													case "bz":
														  $("#bzShowCheckBox").attr("checked",'true');
															  break;
													}
												}
											}
											break;
										} 
									}
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				updateDevCheck : function(){
					var id_array=new Array();  
					$('input[name="deviceCheckbox"]:checked').each(function(){  
					    id_array.push($(this).val());//向数组中添加元素  
					}); 
					mapToolApp.ciecleShowDeviceItem.value=id_array.toString();
					var url = "./sys/parameter/save";
					$.ajax({
						type: "POST",
					    url: url,
					    data: JSON.stringify(mapToolApp.ciecleShowDeviceItem),
					    success: function(rslt){
					    	if(rslt.code === 200){
							}else{
								alert(rslt.msg);
							}
						}
					});
				}
			}
		});
		
		mapToolApp.addTrafficStatusLayer();
		mapToolApp.addCHDTLayer();
		$('#poi_search_txt').focus();
		
		vueEureka.set("mapToolApp",{vue:mapToolApp,description:""});
	}
	return MapTool;
})

	//下侧滑块效果
function leftSilder(){
	/**
	 * 滑过显示,滑出隐藏
	 */
	//two
	var boxs = document.getElementById('sideBarTableft');
	var b3 = window.getComputedStyle? window.getComputedStyle(boxs).left : boxs.currentStyle.left;
	var hid=true;
	$('#sideBarTableft').click(function(){
		if(hid){
			$("#realtimeAlarm-panel").animate({
		        opacity: "hide"
		       }, "slow");
			document.getElementById('realtimeAlarm-panel').style.left=0;
			$(this).css('background','url("./assets/images/slide-kai.png") no-repeat');
			//hide();
		}else{
			document.getElementById('realtimeAlarm-panel').style.display = 'block';
			document.getElementById('realtimeAlarm-panel').style.left=b3;
			$(this).css('background','url("./assets/images/slide-sou.png") no-repeat');
		}
		hid=!hid
	});

}