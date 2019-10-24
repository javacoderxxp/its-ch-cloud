define(function(require) {
	var htmlStr = require('text!./quickGuard.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var mousetool = null;
	var signalMarkerOpts = new IMAP.MarkerOptions();
	signalMarkerOpts.icon = new IMAP.Icon("./assets/images/signal.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	signalMarkerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var videoMarkerOpts = new IMAP.MarkerOptions();
	videoMarkerOpts.icon = new IMAP.Icon("./assets/images/videoCamCloud.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	videoMarkerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/box.png", new IMAP.Size(48, 48), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#pure-panel',
			data: {
				showList: true,
				overlay:null,
				shape:'',
				relatedSignals:[],
				relatedVideos:[],
				signalMarkers:[],//标志点位
				videoMakers:[],
				highlightPoint:null,
				searchingDev:false,
				showListText:false,
				isGuardUsed: 1,//是否加载警卫视频
				showJamData:[]//警卫监控的点
			},
			methods: {
				addShape: function() {
					this.clearShape();
					mousetool=new IMAP.PolylineTool();
					mousetool.arrow = true;// 是否带箭头绘制
					mousetool.autoClose = true;//是否自动关闭绘制	
					map.addTool(mousetool);
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						vm.overlay = evt.overlay;
						vm.shape = TUtils.polygonPath2Str(evt.overlay.getPath());
						vm.findRelatedDevs();
						vm.showListText = true;
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
					var pathArr = TUtils.lineToPoints(this.overlay,5);
					var promiseCombined = $.when(this.loadMatchConditionSignal(pathArr),this.loadMatchConditionVideo(pathArr));
					promiseCombined.done(function(){
						vm.drawRelatedSignals();
						vm.drawRelatedVideos();
						vm.searchingDev = false;
					});
				},
				//加载达到150米距离内的信号机
				loadMatchConditionSignal:function(pathArr){
					return $.ajax({
    					url: "dev/signalCtrler/allData/",
    					success: function(rslt){
    						if(rslt.code == 200){
    							var allSignal = rslt.signalCtrlerList;
    							vm._allSignal = allSignal;
    							for (var t = 0; t < pathArr.length - 1; t++) {
    								var p1 = pathArr[t];
    								var p2 = pathArr[t + 1];
    								for (var d = 0; d < allSignal.length; d++) {
    									var sig = allSignal[d];
    									if(!sig.shape || sig.shape.indexOf(",") == -1){
    										continue;
    									}
    									var pos = sig.shape.split(",");
    									var dis = TUtils.getDisFromPoint2Line(new IMAP.LngLat(pos[0], pos[1]), p1, p2);
    									if (dis <= 150) {
    										vm.addSignalToList(sig);
    									}
    								}
    							}
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
				},
				//加载达到300米距离内的视频监控
				loadMatchConditionVideo:function(pathArr){
					var tmpUrl = "dev/videoCamera/allData?isGuardUsed="+vm.isGuardUsed;
					if(vm.isGuardUsed == 0){
						tmpUrl +="&cameraTpList=1,6,10"; //交警大队、科信、高点
					}
					return $.ajax({
    					url: tmpUrl,
    					success: function(rslt){
    						if(rslt.code == 200){
    							var allVideo = rslt.videoCameraList;
    							vm._allVideo = allVideo;
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
				//在地图上画出相关联的信号机
				drawRelatedSignals:function(){
					if(this.relatedSignals.length > 0){
						for (var i = 0; i < this.relatedSignals.length; i++) {
							var sig = this.relatedSignals[i].signal;
							if(sig.shape && sig.shape.indexOf(",") != -1){
								var pos = sig.shape.split(",");
								var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), signalMarkerOpts);
								marker.data = sig;
								map.getOverlayLayer().addOverlay(marker, true);
								this.signalMarkers.push(marker);
							}
						}
					}
				},
				//在地图上画出相关联的视频监控
				drawRelatedVideos:function(){
					if(this.relatedVideos.length > 0){
						for (var i = 0; i < this.relatedVideos.length; i++) {
							var v = this.relatedVideos[i].video;
							if(v.shape && v.shape.indexOf(",") != -1){
								var pos = v.shape.split(",");
								var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), videoMarkerOpts);
								marker.data = v;
								map.getOverlayLayer().addOverlay(marker, true);
								this.videoMakers.push(marker);
							}
						}
					}
				},
				//信号机添加到list,vue会自动生成Dom
				addSignalToList:function(signal){
					var flag = true;
					for (var i = 0; i < this.relatedSignals.length; i++) {
						var s = this.relatedSignals[i].signal;
						if(s.deviceId == signal.deviceId){
							flag = false;
							break;
						}
					}
					if(flag){
						this.relatedSignals.push({"signal":signal});
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
				openGuardPage:function(){
					var sigs = [],vis=[];
					for(var x in this.relatedSignals){
						var sig = this.relatedSignals[x].signal;
						sigs.push(sig);
					}
					for(var y in this.relatedVideos){
						var v = this.relatedVideos[y].video;
						vis.push(v);
					}
					var signals = JSON.parse(JSON.stringify(sigs));
					
					var videos = JSON.parse(JSON.stringify(vis));
					
					quickGuardWindow = window.open('assets/js/module/quickGuard/index.html','quickGuardWindow',
							'height=800px, innerHeight=800px,top=0,left=0,toolbar=yes,menubar=yes,scrollbars=no,resizable=yes,location=yes');
					var tryCnt = 0;
					var timer = setInterval(function(){
						if(quickGuardWindow && quickGuardWindow.PosindaLib && quickGuardWindow.PosindaLib.SignalUtils && quickGuardWindow.playVideoWithWindow){
							quickGuardWindow.removeCacheSignals();
							quickGuardWindow.PosindaLib.SignalUtils.clearSignalListApp();
							quickGuardWindow.PosindaLib.SignalUtils.addToHandleList(signals);
							
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
							
							quickGuardWindow.playVideoWithWindow(tunnels);
							quickGuardWindow.setVideoList(videos);
							clearInterval(timer);
						}else{
							tryCnt ++;
						}
						if(tryCnt>=10){
							clearInterval(timer);
						}
					}, 500);
				},
				openRelatedSignals:function(){
					var sigs = [];
					for(var x in this.relatedSignals){
						var sig = this.relatedSignals[x].signal;
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
				openRelatedVideos:function(){
					var len = this.relatedVideos.length;
					if(len > 0){
						if(len<=4){
							vm.playVideo(len);
						}else{
							layer.msg("视频监控较多，建议先打开前4个");
							layer.open({
								  content: '视频监控较多，建议先打开前4个'
								  ,btn: ['打开', '取消']
								  ,yes: function(index, layero){
									  vm.playVideo(4);
									  layer.close(index);
								  }
								  ,btn2: function(index, layero){
									  layer.close(index);
								  }
								  ,cancel: function(){}
							});
						}
					}
				},
				openOneVideo:function(index,item){
					this.playVideo(null,item);
				},
				playVideo:function(len,item){
					var tunnels = "";
					if(null == len){
						tunnels = item.video.deviceId;
					}else{
						var temp = "";
						for(var i = 0; i < len; i++){
							var v = this.relatedVideos[i].video;
							temp = temp + "," + v.deviceId;
						}
						tunnels = temp.substring(1);
					}
					/**/
					require(['layers/camera/camera'],function(camera){
						camera.playWinVideo(tunnels);
					});
						
					if(quickGuardWindow){
						quickGuardWindow.playVideoWithWindow(tunnels);
					}
				},
				//移除指定关联信号机
				removeFromSignalList:function(index){
					this.relatedSignals.splice(index,1);
					var m = this.signalMarkers[index];
					map.getOverlayLayer().removeOverlay(m);
					this.signalMarkers.splice(index,1);
				},
				//移除指定关联视频监控
				removeFromVideoList:function(index){
					this.relatedVideos.splice(index,1);
					var m = this.videoMakers[index];
					map.getOverlayLayer().removeOverlay(m);
					this.videoMakers.splice(index,1);
				},
				//在地图上高亮显示当前鼠标移入的设备
				deventer:function(item){
					var pos = item.shape.split(",");
					var center = new IMAP.LngLat(pos[0], pos[1]);
					if(null == this.highlightPoint){
						this.highlightPoint = new IMAP.Marker(center, markerOpts);
						map.getOverlayLayer().addOverlay(this.highlightPoint, false);
					}else{
						this.highlightPoint.setPosition(center);
						this.highlightPoint.visible(true);
					}
					map.setCenter(center);
				},
				//移出时，不高亮
				devleave:function(){
					if(null != this.highlightPoint){
						this.highlightPoint.visible(false);
					}
				},
				//清除相关设备
				clearShape: function () {
					for (var i = 0; i < this.signalMarkers.length; i++) {
						var m = this.signalMarkers[i];
						map.getOverlayLayer().removeOverlay(m);
					}
					for (var j = 0; j < this.videoMakers.length; j++) {
						var m = this.videoMakers[j];
						map.getOverlayLayer().removeOverlay(m);
					}
					
					this.signalMarkers =[];
					this.videoMakers =[];
					this.relatedSignals = [];
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
				close: function() {
					itsGlobal.hideLeftPanel();
					this.clearShape();
				},
				//显示所有的警卫监控 
				showJam:function(){
					//主动查询的数据
					$('#showJam').hide();
					$('#hiddenJam').show();
					var url = "dev/videoCamera/showAllData?time="+new Date().getTime();
					$.ajax({
						type: "GET",
					    url: url,
					    success: function(rstl){
					    	if(rstl.code === 200){
					    		//vm.showJamData = rstl.videoCameraList;
					    		var jamData = rstl.videoCameraList;
					    		for(var t = 0;t < jamData.length ; t++){
					    			var video = jamData[t];
					    			var pos = video.shape.split(",");
					    			var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), videoMarkerOpts);
									marker.data = video;
									map.getOverlayLayer().addOverlay(marker, true);
									//vm.showJamData.push(marker) 只是 定义一个vm的data 然后改变了就会重新渲染
									vm.showJamData.push(marker);
					    		}
					    	}else{
								alert(rstl.msg);
							}
						}
					});
				},
				//隐藏地图上的警卫监控
				closeJam:function(){
					$('#hiddenJam').hide();
					$('#showJam').show();
					for (var j = 0; j < vm.showJamData.length; j++) {
						var marker = vm.showJamData[j];
						map.getOverlayLayer().removeOverlay(marker);
					}
					vm.showJamData = [];
				}
			}
		});
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "purePanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
//		var postDataTmp = {};
//	        postData: postDataTmp,
	};
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})