define(function(require) {
	var htmlStr = require('text!./autoGuard.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var oldQ = '1';
	var vm = null,highlightPoint = null,selectedLine = null,originMarker = null, destinationMaker=null;
	//在地图中添加MouseTool插件
	var mousetool = null;
	var signalMarkerOpts = new IMAP.MarkerOptions();
	signalMarkerOpts.icon = new IMAP.Icon("./assets/images/signal.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	signalMarkerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var boxOpts = new IMAP.MarkerOptions();
	boxOpts.icon = new IMAP.Icon("./assets/images/box.png", new IMAP.Size(48, 48), new IMAP.Pixel(0, 0));
	boxOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var kdcOpt = new IMAP.MarkerOptions();
	kdcOpt.icon = new IMAP.Icon("./assets/images/kdc.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	kdcOpt.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var polylineOpt = new IMAP.PolylineOptions();
	polylineOpt.strokeColor = "#07b30e";
	polylineOpt.strokeOpacity = "1";
	polylineOpt.strokeWeight = "5";
	polylineOpt.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
	polylineOpt.arrow = true;
	
	var getKdcPosTimer = null;//获取开道车点位
	
	var getKdcPosWithOutLineIdTimer = null;//直接获取开道车点位Timer
	var centerDeviceId = null;
	
	kdcQuickGuardWindow = null;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#autoGuard-panel',
			data: {
				lineQ:{},
				showDetail: false,
				relatedSignalList:[],
				phaseList:[],
				lineShape:null,
				lineOverlay:null,
				crossId_nearPoint:[],
				signalOverlays:[],
				devList:[],
				_allSignal:[],
				splitPoints:[],
				description:"",
				guardName:"",
				lineStatus:"未执行",
				isEdit:false,
				lineId:"",
				kdcMarker:null,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0,
				kdcPosWOArr:[],
				relatedVideos:[],
				infoLabels:[],
				isDevCenter:false
			},
			methods: {
				openKdcGuardPage:function(){
					this.relatedVideos = [];
					this.findJWXLRelatedDev(selectedLine);
				},
				findJWXLRelatedDev:function(overlay){
					if(!overlay){
						return;
					}
					var pathArr = TUtils.lineToPoints(overlay,5);
					var promiseCombined = $.when(this.loadMatchConditionVideo(pathArr));
					promiseCombined.done(function(){
						vm.openGuardPage();
					});
				},
				openGuardPage:function(){
					var sigs = [],vis=[];
					for(var x in this.relatedSignalList){
						var sig = this.relatedSignalList[x].signal;
						sigs.push(sig);
					}
					for(var y in this.relatedVideos){
						var v = this.relatedVideos[y].video;
						vis.push(v);
					}
					console.info(vis);
					var signals = JSON.parse(JSON.stringify(sigs));
					
					var videos = JSON.parse(JSON.stringify(vis));
					
					if(kdcQuickGuardWindow){
						kdcQuickGuardWindow.close();
					}
					
					kdcQuickGuardWindow = window.open('assets/js/module/quickGuard/index.html','kdcQuickGuardWindow',
							'height=800px, innerHeight=800px,top=0,left=0,toolbar=yes,menubar=yes,scrollbars=no,resizable=yes,location=yes');
					var tryCnt = 0;
					var timer = setInterval(function(){
						if(kdcQuickGuardWindow && kdcQuickGuardWindow.PosindaLib && kdcQuickGuardWindow.PosindaLib.SignalUtils && kdcQuickGuardWindow.playVideoWithWindow){
							kdcQuickGuardWindow.removeCacheSignals();
							kdcQuickGuardWindow.PosindaLib.SignalUtils.clearSignalListApp();
							kdcQuickGuardWindow.PosindaLib.SignalUtils.addToHandleList(signals);
							
							var temp = "";
							var len = vm.relatedVideos.length;
							if(len>4){
								len = 4;
							}
							for(var i = 0; i < len; i++){
								var v = vm.relatedVideos[i].video;
								temp = temp + "," + v.deviceId;
							}
							var	tunnels = temp.substring(1);
							
							tryCnt ++;
							if(tryCnt>=10){
								clearInterval(timer);
							}
							
							kdcQuickGuardWindow.playVideoWithWindow(tunnels);
							kdcQuickGuardWindow.setVideoList(videos);
							clearInterval(timer);
						}else{
							tryCnt ++;
						}
						if(tryCnt>=10){
							clearInterval(timer);
						}
					}, 500);
				},
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
				//加载达到300米距离内的视频监控
				loadMatchConditionVideo:function(pathArr){
					var tmpUrl = "dev/videoCamera/allData?isGuardUsed=1";
					return $.ajax({
    					url: tmpUrl,
    					success: function(rslt){
    						if(rslt.code == 200){
    							var allVideo = rslt.videoCameraList;
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
    									if (dis <= 80) {
    										vm.addVideoToList(video);
    									}
    								}
    							}
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
				},
				checkKdcPos:function(){
					var check = document.getElementById("kdcPosCheck").checked;
					if(check){
						this.drawKdcPos();
					}else{
						this.clearKdcPos();
					}
				},
				drawKdcPos:function(){
					this.closeKdcPosWOTimer();
					getKdcPosWithOutLineIdTimer = setInterval(function(){
						$.ajax({
	    					url: "zhdd/autoGuardLine/getKdcPosWithOutLineId",
	    					success: function(rslt){
	    						if(rslt.code == 200){
	    							if(rslt.list && rslt.list.length>0){
	    								for(var i = vm.kdcPosWOArr.length - 1; i > 0; i--) {
	    									var mdata = vm.kdcPosWOArr[i].data;
	    									var isExist = false;
	    									for(var j = 0; j < rslt.list.length; j++) {
	    										var p = rslt.list[j];
	    										if(p.deviceId == mdata.deviceId){
	    											isExist = true;
	    											break;
	    										}
	    									}
	    									if(!isExist){
	    										map.getOverlayLayer().removeOverlay(vm.kdcPosWOArr[i]);
	    										vm.kdcPosWOArr.splice(i,1);
	    										for (var m = 0; m < vm.infoLabels.length; m++) {
													var label = vm.infoLabels[m];
													if(label.data.deviceId == mdata.deviceId){
														map.getOverlayLayer().removeOverlay(label);
														vm.infoLabels.splice(m,1);
														break;
													}
												}
	    									}
	    								}
	    								var insertArr = [];
	    								for(var i = 0; i < rslt.list.length; i++) {
	    									var p = rslt.list[i];
	    									var isExist = false;
	    									for(var j = 0; j < vm.kdcPosWOArr.length; j++) {
	    										var mdata = vm.kdcPosWOArr[j].data;
	    										if(p.deviceId == mdata.deviceId){
	    											isExist = true;
	    											var pos = p.shape.split(",");
	    											vm.kdcPosWOArr[j].data = p;
	    											vm.kdcPosWOArr[j].setPosition(new IMAP.LngLat(pos[0], pos[1]));
	    											
	    											for (var m = 0; m < vm.infoLabels.length; m++) {
														var label = vm.infoLabels[m];
														if(label.data.deviceId == p.deviceId){
															label.data = p;
															label.setPosition(new IMAP.LngLat(pos[0], pos[1]));
															break;
														}
													}
	    											
	    											break;
	    										}
											}
	    									if(!isExist){
	    										if(p.shape){
	    											var pos = p.shape.split(",");
	    											var locationAddr = new IMAP.LngLat(pos[0], pos[1]);
	    											var mk = new IMAP.Marker(locationAddr, kdcOpt);
	    											mk.data = p;
	    											
	    											var contextMen = '<div class="self-menu">'
	    												+'<span class="center2Device detailspan">设备跟踪</span>'
	    												+'</div>';
	    											//右击事件
	    											mk.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, function(e,b) {
	    												CustomContextMenu.setContent(contextMen,e,100,40);
	    												$(".center2Device").on( "click", function() {
	    													CustomContextMenu.close();
	    													var dev = e.target.data;
	    													centerDeviceId = dev.deviceId;
	    												});
	    											});
	    											
	    											insertArr.push(mk);
	    											map.getOverlayLayer().addOverlay(mk, true);
	    											
	    											var infoLabel = new IMAP.Label(p.deviceName, {
	    												position : locationAddr,// 基点位置
	    												offset: new IMAP.Pixel(0,-35),//相对于基点的位置
	    												anchor : IMAP.Constants.BOTTOM_CENTER,
	    												fontSize : 14,
	    												fontBold : true,// 在html5 marker的情况下，是否允许marker有背景
	    												fontColor : "#0066cc"
	    											});
	    											infoLabel.data = p;
	    											map.getOverlayLayer().addOverlay(infoLabel, false);
	    											vm.infoLabels.push(infoLabel);
	    										}
	    									}
	    								}
	    								
	    								vm.kdcPosWOArr = vm.kdcPosWOArr.concat(insertArr);
	    								
	    								if(centerDeviceId){
	    									for (var idx = 0; idx < vm.kdcPosWOArr.length; idx++) {
												var ele = vm.kdcPosWOArr[idx];
												if(ele.data.deviceId == centerDeviceId){
													var pos = ele.getPosition();
													if(pos){
														map.setCenter(pos);
													}
													break;
												}
											}
	    								}
	    								
	    							}else{
	    								layer.msg("5分钟内无开道车位置信息");
	    								vm.clearKdcPosMarker();
	    							}
	    						}else{
	    							alert(rslt.msg);
	    						}
	    					}
	    				});
					}, 1500);
				},
				clearKdcPos:function(){
					this.closeKdcPosWOTimer();
					this.clearKdcPosMarker();
					centerDeviceId = null;
				},
				clearKdcPosMarker:function(){
					if(this.kdcPosWOArr.length > 0){
						for (var i = 0; i < this.kdcPosWOArr.length; i++) {
							var ele = this.kdcPosWOArr[i];
							map.getOverlayLayer().removeOverlay(ele);
						}
						this.kdcPosWOArr = [];
					}
					for (var m = 0; m < this.infoLabels.length; m++) {
						var label = this.infoLabels[m];
						map.getOverlayLayer().removeOverlay(label);
					}
					this.infoLabels = [];
					centerDeviceId = null;
				},
				closeKdcPosWOTimer:function(){
					if(getKdcPosWithOutLineIdTimer){
						clearInterval(getKdcPosWithOutLineIdTimer);
						getKdcPosWithOutLineIdTimer = null;
					}
				},
				submitAutoGuardLine:function(){
					$("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
				        	vm.saveNewGuardLine();
				        }
					});
				},
				saveNewGuardLine:function(){
					if(vm.isDataRight()){
						var obj = {"guardName":vm.guardName,"shp":vm.lineShape,"desc":vm.description,"sigCtrlList":vm.relatedSignalList};
						var url = "zhdd/autoGuardLine/submitGuardLine";
						$.ajax({
							type: "POST",
						    url: url,
						    data: JSON.stringify(obj),
						    success: function(rslt){
						    	if(rslt.code === 200){
									layer.msg("警卫路线保存成功！");
									vm.goback();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				isDataRight:function(){
					var lineShape = vm.lineShape;
					var desc = vm.description;
					var guardName = vm.guardName;
					var sigCtrlList = vm.relatedSignalList;
					if(guardName == null ||guardName==""){
						alert("先添加警卫路线名称");
						return false;
					}
					if(lineShape == null ||lineShape==""){
						alert("先添加警卫路线");
						return false;
					}
					if(sigCtrlList == null ||sigCtrlList.length==0){
						alert("警卫路线相位设备为空，重新添加路线");
						return false;
					}
					return true;
				},
				drawAutoGuardLine:function(){
					this.clearShp();
					this.crossId_nearPoint = [];
					mousetool=new IMAP.PolylineTool();
					mousetool.arrow = true;//是否带箭头绘制
					mousetool.autoClose = true;//是否自动关闭绘制	
					map.addTool(mousetool);
					mousetool.open();
					map.setZoom(15);
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						map.setZoom(15);
						vm.lineOverlay = evt.overlay;
						vm.lineShape = TUtils.polygonPath2Str(evt.overlay.getPath());
						vm.loadAllSignals();
						mousetool.close();
						
						var shapes = vm.lineShape.split(" ");
						var originll = shapes[0].split(",");
						var destll = shapes[shapes.length-1].split(",");
						var originPos = new IMAP.LngLat(originll[0], originll[1]);
						var destinationPos = new IMAP.LngLat(destll[0], destll[1]);
						addOriginAndDestPos(originPos,destinationPos);
					},this);
				},
				loadAllSignals:function(){
					$.ajax({
    					url: "dev/signalCtrler/allData/",
    					success: function(rslt){
    						if(rslt.code == 200){
    							var allSignal = rslt.signalCtrlerList;
    							vm._allSignal = allSignal;
    							vm.findRelatedDevs();
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
				},
				findRelatedDevs:function(){
					var lineArr = this.lineOverlay.getPath();
					for(var i=0;i<lineArr.length-1;i++){
						var lnglat1 = lineArr[i];
						var lnglat2 = lineArr[i+1];
						var lnglatarr = [];
						lnglatarr.push(lnglat1);lnglatarr.push(lnglat2);
						var plo = new IMAP.PolylineOptions();
						var polyline = new IMAP.Polyline(lnglatarr, plo);
						var pathArr = TUtils.lineToPoints(polyline,5);
						var devs = this.addDevToList(pathArr);
						if(devs && devs.length>0){
							var itr = 0;
							if(this.devList.length>0){
								var lastDev = this.devList[this.devList.length-1];
								var aFirstDev = devs[0];
								if(lastDev.signal.crossId == aFirstDev.signal.crossId){
									itr = 1;
								}
							}
							for(var j=itr; j<devs.length;j++){
								this.devList.push(devs[j]);
							}
						}
					}
					this.calcPhaseByDevList();
				},
				calcPhaseByDevList:function(){
					var pre_cur_next_points = [];
					for(var i=0;i<this.devList.length;i++){
						var dev = this.devList[i];
						var pathInx = dev.index;
						var pre = null,next = null,p = this.splitPoints[pathInx];
						if(pathInx>=15){
							pre = this.splitPoints[pathInx-15];
						}else{
							pre = this.splitPoints[0];
						}
						if(pathInx<this.splitPoints.length-15){
							next = this.splitPoints[pathInx+15];
						}else{
							next = this.splitPoints[this.splitPoints.length-1];
						}
						pre_cur_next_points.push({pre:pre,cur:p,next:next,signal:dev.signal});
					}
					this.calcDegToPhase(pre_cur_next_points);
				},
				addDevToList:function(parr){
					var devs = [];
					var cnt = this.splitPoints.length;
					for(var i=0; i<parr.length; i++){
						var p1 = parr[i];
						this.splitPoints.push(p1);
						for (var d = 0; d < this._allSignal.length; d++) {
							var sig = this._allSignal[d];
							if(!sig.shape || sig.shape.indexOf(",") == -1){
								continue;
							}
							var pos = sig.shape.split(",");
							var lnglat = new IMAP.LngLat(pos[0], pos[1]);
							var dis = IMAP.Function.distanceByLngLat(lnglat,p1);
							if (dis <= 150) {
								var isHas = false;
								for(var j=0;j<devs.length;j++){
									var dev = devs[j];
									if(dev.signal.crossId == sig.crossId){
										isHas = true;
										if(dis<dev.dis){
											dev.dis = dis;
											dev.index = cnt+i;
										}
									}
								}
								if(!isHas){
									devs.push({"index":cnt+i,"signal":sig,"dis":dis});
								}
							}
						}
					}
					return devs;
				},
				calcDegToPhase:function(points){
					for(var i=0; i<points.length; i++){
						var po = points[i];
						
						var pre_pixel = map.lnglatToPixel(po.pre);
			            var cur_pixel = map.lnglatToPixel(po.cur);
			            var next_pixel = map.lnglatToPixel(po.next);
			            
			            var pre_cur_deg = IMAP.Function.getRotation(pre_pixel,cur_pixel);
			            var cur_next_deg = IMAP.Function.getRotation(cur_pixel,next_pixel);
			            var pre_next_deg = IMAP.Function.getRotation(pre_pixel,next_pixel);
			            var dir = this._getDrivenDirection(pre_cur_deg,cur_next_deg,pre_next_deg);
//			            var dir = this._getDrivenDirection(pre_cur_deg,null,null);
			            this.relatedSignalList.push({"signal":po.signal,"phaseId":dir});
			            var sig = po.signal;
						if(sig.shape && sig.shape.indexOf(",") != -1){
							var pos = sig.shape.split(",");
							var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), signalMarkerOpts);
							marker.data = sig;
							map.getOverlayLayer().addOverlay(marker, false);
							this.signalOverlays.push(marker);
						}
					}
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('.phaseselectpicker').selectpicker({
							noneSelectedText:'请选择一个相位',
							liveSearch: true,
							style: 'btn-default',
							size: 10,
							dropupAuto:false 
						});
					});
				},
				_getBigDirection : function(deg){
					var d1 = "";
					//角度0-360，与百度区别
					if((deg>=0 && deg<=45) || (deg>=315 && deg<360)){
						d1 = "20"; //西方向
					}else if(deg>45 && deg<135){
						d1 = "17"; //北方向
					}else if(deg>=135 && deg<=225){
						d1 = "18"; //东方向
					}else if(deg>225 && deg<315){
						d1 = "19"; //南方向
					}
					return d1;
				},
				_getDirection : function(deg,pre_cur){
					var d1 = "";
					//角度0-360，与百度区别
					if(deg>=25 && deg<=70){
						d1 = "2"; //北直行
					}if(deg>=0 && deg<=25){
						d1 = "14"; //西直行
					}else if(deg>70 && deg<125){
						d1 = "5"; //东左转
						var bd = this._getBigDirection(pre_cur);
						if(bd == "17"){
							d1 = "3"; //北右
						}
					}else if(deg>=125 && deg<=175){
						d1 = "6"; //东直行
					}else if(deg>175 && deg<215){
						d1 = "9"; //南左转
						var bd = this._getBigDirection(pre_cur);
						if(bd == "18"){
							d1 = "7"; //dong右
						}
					}else if(deg>=215 && deg<=265){
						d1 = "10"; //南直行
					}else if(deg>265 && deg<295){
						d1 = "13"; //西左转
						var bd = this._getBigDirection(pre_cur);
						if(bd == "19"){
							d1 = "11"; //南右
						}
					}else if(deg>=295 && deg<=340){
						d1 = "14"; //西直行
					}else if(deg>340 && deg<360){
						d1 = "1"; //北左转
						var bd = this._getBigDirection(pre_cur);
						if(bd == "20"){
							d1 = "15"; //西右
						}
					}
					return d1;
				},
				_getDrivenDirection : function(pre_cur,cur_next,pre_next){
//					var d1 = this._getDirection(pre_cur);
//					var d2 = this._getDirection(cur_next);
					var d3 = this._getDirection(pre_next,pre_cur);
					return d3;
				},
				removeFromSignalList:function(ind){
					var rdev = this.relatedSignalList[ind];
					var index = -1;
					for (var i = 0; i < this.signalOverlays.length; i++) {
						var m = this.signalOverlays[i];
						if(m.data.crossId == rdev.signal.crossId){
							index = i;
							break;
						}
					}
					if(index != -1){
						var m = this.signalOverlays[index];
						map.getOverlayLayer().removeOverlay(m);
						this.signalOverlays.splice(index,1);
					}
					this.relatedSignalList.splice(ind,1);
					this.signalleave();
				},
				signalenter:function(item){
					var pos = item.signal.shape.split(",");
					if(null == highlightPoint){
						highlightPoint = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), boxOpts);
						map.getOverlayLayer().addOverlay(highlightPoint, true);
					}else{
						highlightPoint.setPosition((new IMAP.LngLat(pos[0], pos[1])));
						highlightPoint.visible(true);
					}
				},
				signalleave:function(item){
					if(null != highlightPoint){
						highlightPoint.visible(false);
					}
				},
				add:function(){
					this.description = "";
					this.guardName = "";
					this.showDetail = true;
					$('#guardTab a[href="#detailTab"]').tab('show');
					this.clearShp();
					this.lineStatus = "未执行";
					this.isEdit = false;
				},
				goback:function(){
					this.showDetail = false;
					$('#guardTab a[href="#queryTab"]').tab('show');
					this.clearShp();
					this.description = "";
					this.guardName = "";
					this.lineStatus = "";
					this.isEdit = false;
					this.lineId = "";
					loadJqGrid();
					this.closeKdcPosTimer();
					this.checkKdcPos();
				},
				query: function() {
					/*var guardName = this.lineQ.guardName;
					var status = this.lineQ.status;*/
					loadJqGrid();
				},
				edit:function(){
					var id = TUtils.getSelectedRow();
					if(id){
						$.ajax({
						    url: "zhdd/autoGuardLine/getGuardLineData?lineId="+id,
						    success: function(rslt){
								if(rslt.code == 200){
									var line = rslt.line;
									var ctrl = rslt.ctrl;
									if(line.status == '1'){
										vm.lineStatus = "执行中";
										alert("自动警卫路线执行中，请勿修改！");
										vm.lineId = line.id;
										vm.startToGetKdcPos();
									}else if(line.status == '2'){
										vm.lineStatus = "已完成";
									}else{
										vm.lineStatus = "未执行";
									}
									vm.clearKdcPos();
									vm.clearShp();
									vm.lineId = line.id;
									vm.guardName = line.guardName;
									vm.description = line.description;
									vm.lineShape = line.shape;
									vm.isEdit = true;
									displayGuardLine(line.shape);
									for(var i=0; i<ctrl.length; i++){
										var cl = ctrl[i];
										vm.relatedSignalList.push({"signal":cl.signal,"phaseId":cl.phaseId});
										var sig = cl.signal;
										if(sig.shape && sig.shape.indexOf(",") != -1){
											var pos = sig.shape.split(",");
											var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), signalMarkerOpts);
											marker.data = sig;
											map.getOverlayLayer().addOverlay(marker, false);
											vm.signalOverlays.push(marker);
										}
									}
									
									vm.showDetail = true;
									require(['bootstrapSelect','bootstrapSelectZh'],function(){
										$('.phaseselectpicker').selectpicker({
											noneSelectedText:'请选择一个相位',
											liveSearch: true,
											style: 'btn-default',
											size: 10,
											dropupAuto:false 
										});
									});
									
									$('#guardTab a[href="#detailTab"]').tab('show');
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				startToGetKdcPos:function(){
					this.closeKdcPosTimer();
					getKdcPosTimer = setInterval(function(){
						if(vm.lineId && vm.lineId !=""){
							$.ajax({
		    					url: "zhdd/autoGuardLine/getKdcPos?lineId="+vm.lineId,
		    					success: function(rslt){
		    						if(rslt.code == 200){
		    							if(rslt.pos && rslt.pos.lng && rslt.pos.lat){
		    								if(vm.kdcMarker){
		    									var addr = new IMAP.LngLat(rslt.pos.lng, rslt.pos.lat)
		    									vm.kdcMarker.setPosition(addr);
		    									if(vm.isDevCenter){
		    										map.setCenter(addr);
		    									}
		    								}else{
		    									vm.kdcMarker = new IMAP.Marker(new IMAP.LngLat(rslt.pos.lng, rslt.pos.lat), kdcOpt);
			    								map.getOverlayLayer().addOverlay(vm.kdcMarker, true);
			    								
			    								var contextMen = '<div class="self-menu">'
    												+'<span class="center2Dev detailspan">设备跟踪</span>'
    												+'</div>';
			    								var contextMen2 = '<div class="self-menu">'
    												+'<span class="nocenter2Dev detailspan">取消跟踪</span>'
    												+'</div>';
    											//右击事件
			    								vm.kdcMarker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, function(e,b) {
    												if(vm.isDevCenter){
    													CustomContextMenu.setContent(contextMen2,e,100,40);
    												}else{
    													CustomContextMenu.setContent(contextMen,e,100,40);
    												}
    												$(".center2Dev").on( "click", function() {
    													CustomContextMenu.close();
    													vm.isDevCenter = true;
    												});
    												$(".nocenter2Dev").on( "click", function() {
    													CustomContextMenu.close();
    													vm.isDevCenter = false;
    												});
    											});
		    								}
		    							}
		    							if(rslt.msg){
		    								layer.msg(rslt.msg);
		    							}
		    						}else{
		    							alert(rslt.msg);
		    						}
		    					}
		    				});
						}
					}, 1000);
				},
				closeKdcPosTimer:function(){
					if(getKdcPosTimer){
						clearInterval(getKdcPosTimer);
						getKdcPosTimer = null;
					} 
					if(this.kdcMarker){
						map.getOverlayLayer().removeOverlay(this.kdcMarker);
						this.kdcMarker = null;
					}
				},
				close: function() {
					this.clearShp();
					this.clearKdcPos();
					itsGlobal.hideLeftPanel();
				},
				queryTab:function(){
					this.goback();
				},
				saveAutoGuardLine:function(){
					var url = "zhdd/autoGuardLine/updateGuardLine";
					if(this.lineStatus == "执行中"){
						alert("自动警卫路线执行中，请勿修改！");
						return;
					}
					if(this.isDataRight()){
						var obj = {"lineId":vm.lineId,"guardName":vm.guardName,"shp":vm.lineShape,"desc":vm.description,"sigCtrlList":vm.relatedSignalList};
						$.ajax({
							type: "POST",
						    url: url,
						    data: JSON.stringify(obj),
						    success: function(rslt){
						    	if(rslt.code === 200){
									alert("警卫路线更新成功！");
									vm.goback();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				deleteLine:function(){
					var id = TUtils.getSelectedRow();
					if(id){
						var rowData = $("#jqGrid").jqGrid('getRowData', id);
						if(rowData){
							if(rowData.status =='1'){
								alert("警卫线路执行中，请勿删除");
								return;
							}else{
								this.directDelLine(id);
							}
						}
					}
				},
				directDelLine:function(lineId){
					var url = "zhdd/autoGuardLine/purge/"+lineId;
					return $.ajax({
    					url: url,
    					success: function(rslt){
    						if(rslt.code == 200){
    							layer.msg("路线删除成功");
    							loadJqGrid();
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
				},
				openRelatedSignals:function(){
					var sigs = [];
					for(var x in this.relatedSignalList){
						var sig = this.relatedSignalList[x].signal;
						sigs.push(sig);
					}
					var signals = JSON.parse(JSON.stringify(sigs));
					signalCtrlWin = window.open('assets/js/module/signal/index.html','signalCtrlWindow');
					var timer = setInterval(function(){
						if(signalCtrlWin && signalCtrlWin.PosindaLib && signalCtrlWin.PosindaLib.SignalUtils){
							signalCtrlWin.removeCacheSignals();
							signalCtrlWin.PosindaLib.SignalUtils.clearSignalListApp();
							signalCtrlWin.PosindaLib.SignalUtils.addToHandleList(signals);
							clearInterval(timer);
						}
					}, 500);
				},
				clearShp:function(){
					if(this.lineOverlay){
						map.getOverlayLayer().removeOverlay(this.lineOverlay);
					}
					for (var i = 0; i < this.signalOverlays.length; i++) {
						var m = this.signalOverlays[i];
						map.getOverlayLayer().removeOverlay(m);
					}
					this.lineShape = null;
					this.lineOverlay = null;
					this.signalOverlays = [];
					this.devList=[];
					this.splitPoints = [];
					this.relatedSignalList=[];
					this.relatedVideos=[];
					if(null != highlightPoint){
						map.getOverlayLayer().removeOverlay(highlightPoint);
						highlightPoint = null;
					}
					clearLineAndOriginDestOverlay();
				}
			}
		});
		oldQ=1;
		loadJqGrid();
		loadPhaseSelect();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "auto-guard-panel的vue实例"
		});
	}
	var loadJqGrid = function() {
		var guardName = $("#guardNameQ").val();
		var status = $("#lineStatus").val();
		
		var url = "zhdd/autoGuardLine/pageData";
		var postDataTmp = {};
		if(guardName){
			postDataTmp.guardName = guardName;
		}
		if(status){
			postDataTmp.status = status;
		}
		
		if(TUtils.cmp(postDataTmp,oldQ)){
			oldQ = JSON.parse(JSON.stringify(postDataTmp));
			var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
			$.each(postData, function (k, v) {  
				delete postData[k];
			});
			//var page = $("#jqGrid").jqGrid('getGridParam','page');
			var page = $('#jqGrid').getGridParam('page');
			if(!page){
				page = 1;
			}
			$("#jqGrid").jqGrid('setGridParam',{ 
				postData: postDataTmp,
				page:page
			}).trigger("reloadGrid");
		}else{
			oldQ = JSON.parse(JSON.stringify(postDataTmp));
			$("#jqGrid").jqGrid('GridUnload');
			$("#jqGrid").jqGrid({
				url: url,
				datatype: "json",
				postData: postDataTmp,
				colModel: [
		           { label: 'id', name: 'id', width: 5, key: true, hidden:true },
		           { label: '警卫名称', name: 'guardName', width: 60, hidden:false , sortable:false/*, formatter: function(value, options, row){return value;}*/},
		           { label: '描述', name: 'description', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
		           { label: '路线状态', name: 'status', width: 50, sortable:false, formatter: function(value, options, row){
			        	   var result = "";
			        	   switch (value) {
			        	   case '0':
			        		   result = "未执行";
			        		   break;
			        	   case '1':
			        		   result = "执行中";
			        		   break;
			        	   case '2':
			        		   result = "已完成";
			        		   break;
			        	   default:
			        		   break;
			        	   }
			        	   return result;
		            }},
	        	   { label: 'status', name: 'status', width: 1, hidden:true,sortable:false/*, formatter: function(value, options, row){return value;}*/},
	        	   { label: '空间范围', name: 'shape', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
	        	   ],
	        	   viewrecords: true,
	        	   height: 300,
	        	   width:530,
	        	   rowNum: 15,
	        	   rowList : [15,30,50],
	        	   rownumbers: true, 
	        	   rownumWidth: 25, 
	        	   autowidth:false,
	        	   multiselect: false,
	        	   pager: "#jqGridPager",
	        	   jsonReader : {
	        		   root: "page.list",
	        		   page: "page.pageNum",
	        		   total: "page.pages",
	        		   records: "page.total"
	        	   },
	        	   prmNames : {
	        		   page:"page", 
	        		   rows:"limit", 
	        		   sort: "orderBy",
	        		   order: "orderFlag"
	        	   },
	        	   loadComplete: function(data) {//数据查询完毕
	        	   },
		   	        ondblClickRow: function(rowid, iRow, iCol, e){
			        	vm.edit();
			        },
	        	   gridComplete:function(){
	        		   //隐藏grid底部滚动条
	        		   $("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        	   },
	        	   ondblClickRow: function(rowid, iRow, iCol, e){
	        		   
	        	   },
	        	   onSelectRow: function(rowid){//选中某行
	        		   var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	        		   displayGuardLine(rowData.shape);
	        	   }
			});
		}
	};
	
	var displayGuardLine = function(lineShp){
		clearLineAndOriginDestOverlay();
		var lnglatarr = [];
		var shapes = lineShp.split(" ");
		for (var i = 0; i < shapes.length; i++) {
			var ele = shapes[i];
			var pos = ele.split(",");
			lnglatarr.push(new IMAP.LngLat(pos[0], pos[1]));
		}
		selectedLine = new IMAP.Polyline(lnglatarr, polylineOpt);
		map.getOverlayLayer().addOverlay(selectedLine, true);
		
		var originPos = lnglatarr[0];
		var destinationPos = lnglatarr[lnglatarr.length-1];
		addOriginAndDestPos(originPos,destinationPos);
	}
	var addOriginAndDestPos = function(originLnglat,destLnglat){
		var originPos = originLnglat;
		var destinationPos = destLnglat;
		var originOpts = new IMAP.MarkerOptions();
		originOpts.icon = new IMAP.Icon("./assets/images/origin.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
		originOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
		var destOpts = new IMAP.MarkerOptions();
		destOpts.icon = new IMAP.Icon("./assets/images/destination.png", new IMAP.Size(32, 33), new IMAP.Pixel(0, -1));
		destOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
		originMarker = new IMAP.Marker(originPos, originOpts);
		destinationMaker = new IMAP.Marker(destinationPos, destOpts);
		
		map.getOverlayLayer().addOverlay(originMarker, false);
		map.getOverlayLayer().addOverlay(destinationMaker, false);
	}
	var clearLineAndOriginDestOverlay = function(){
		if(null != selectedLine){
			map.getOverlayLayer().removeOverlay(selectedLine);
			selectedLine = null;
		}
		if(null != originMarker){
			map.getOverlayLayer().removeOverlay(originMarker);
			originMarker = null;
		}
		if(null != destinationMaker){
			map.getOverlayLayer().removeOverlay(destinationMaker);
			destinationMaker = null;
		}
	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	var loadPhaseSelect = function() {
		$.get("./sys/dict/getDictList?type=SIGNAL_CTRL_PHASE", function(r){
			if(r.code == 200){
				vm.phaseList = r.dictList;
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('.phaseselectpicker').selectpicker({
						noneSelectedText:'请选择一个相位',
						liveSearch: true,
						style: 'btn-default',
						size: 10,
						dropupAuto:false 
					});
				});
			}else{
				alert(r.msg);
			}
		});
		require(['bootstrapSelect','bootstrapSelectZh'],function(){
			$('#lineStatus').selectpicker({
				noneSelectedText:'请选择路线状态',
				liveSearch: true,
				style: 'btn-default',
				size: 10
			});
		});
	}
	
	return {
		show: show,
		hide: hide
	};
})