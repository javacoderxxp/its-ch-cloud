define(function(require) {
	var htmlStr = require('text!./planPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('bootstrapTypeahead');
	require('my97Datepicker');
	var planPanelApp = null;
	var oldQ ='1';
	//在地图中添加MouseTool插件
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
        
		planPanelApp = new Vue({
			el: '#plan-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			
			data: {
				planConfirmed: false,
				showSceneForm: false,
				planQ: {}, //查询参数
				plan: {shape:''},
				newShapeArea: null,
				sceneList:[],
				scene: {shape:'', sceneName:'', startDt:'', endDt:'', sceneDetail:''},
				sceneOverlay:null,
				relatedSignals:[],
				relatedVideos:[],
				signalMarkers:[],
				videoMakers:[],
				highlightPoint:null,
				searchingDev:false,
				planExecute:false,
				isGuardUsed: 1,//是否加载警卫视频
				showVideoType:true,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0  //判断当前用户是否有中队管理员权限，如果没有，只能进行查询操作。
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#casetype').selectpicker({
							noneSelectedText:'请选择预案类型',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#casetype1').selectpicker({
							noneSelectedText:'请选择预案类型',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				//画空间范围，线或面
				addShape: function () {
					this.clearShape();
					
					if(!this.plan.type){
						alert("预案类型不能为空");
					}else{
						if('jwxl'==this.plan.type){
							mousetool=new IMAP.PolylineTool();
							mousetool.arrow = true;//是否带箭头绘制
						}else{
							mousetool=new IMAP.PolygonTool();
						}
						mousetool.autoClose = true;//是否自动关闭绘制	
						map.addTool(mousetool);
						mousetool.open();
						mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
							planPanelApp.sceneOverlay = evt.overlay;
							planPanelApp.scene.shape = TUtils.polygonPath2Str(evt.overlay.getPath());
							planPanelApp.findRelatedDevs();
							mousetool.close();
						},this);
					}
				},
				//查找相关的设备
				findRelatedDevs:function(){
					if(null != this.sceneOverlay &&　'' != this.scene.shape){
						this.searchingDev = true;
						//先判断类型
						if('jwxl'==this.plan.type){
							//警卫路线：线, 距离线150米内的信号机，距离线300米内的视频监控
							this.findJWXLRelatedDev();
						}else{
							//其他：面，距离面150米内或在面范围内的信号机，距离面300米内或在面范围内的视频监控
							this.findOtherRelatedDev();
						}
					}
				},
				//加载达到150米距离内的信号机
				loadMatchConditionSignal:function(pathArr){
					return $.ajax({
    					url: "dev/signalCtrler/allData/",
    					success: function(rslt){
    						if(rslt.code == 200){
    							var allSignal = rslt.signalCtrlerList;
    							planPanelApp._allSignal = allSignal;
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
    										planPanelApp.addSignalToList(sig);
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
					var tmpUrl = "dev/videoCamera/allData?isGuardUsed="+planPanelApp.isGuardUsed;
					if(planPanelApp.isGuardUsed == 0){
						tmpUrl +="&cameraTpList=1,6,10"; //交警大队、科信、高点
					}
					return $.ajax({
    					url: tmpUrl,
    					success: function(rslt){
    						if(rslt.code == 200){
    							var allVideo = rslt.videoCameraList;
    							planPanelApp._allVideo = allVideo;
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
    										planPanelApp.addVideoToList(video);
    									}
    								}
    							}
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
				},
				//查找警卫路线相关的设备
				findJWXLRelatedDev:function(){
					var pathArr = TUtils.lineToPoints(this.sceneOverlay,5);
					var promiseCombined = $.when(this.loadMatchConditionSignal(pathArr),this.loadMatchConditionVideo(pathArr));
					promiseCombined.done(function(){
						planPanelApp.drawRelatedSignals();
						planPanelApp.drawRelatedVideos();
						planPanelApp.searchingDev = false;
					});
				},
				//查找其他预案类型的相关的设备
				findOtherRelatedDev:function(){
					var pathArr = TUtils.lineToPoints(this.sceneOverlay,5);
					var polygonPath = this.sceneOverlay.getPath();
					var promiseCombined = $.when(this.loadMatchConditionSignal(pathArr),this.loadMatchConditionVideo(pathArr));
					promiseCombined.done(function(){
						for (var i = 0; i < planPanelApp._allSignal.length; i++) {
							var sig = planPanelApp._allSignal[i];
							if(!sig.shape || sig.shape.indexOf(",") == -1){
								continue;
							}
							var pos = sig.shape.split(",");
							var lnglat = new IMAP.LngLat(pos[0], pos[1]);
							if(IMAP.Function.containsLngLat(lnglat,polygonPath)){
								planPanelApp.addSignalToList(sig);
							}
						}
						for (var j = 0; j < planPanelApp._allVideo.length; j++) {
							var v = planPanelApp._allVideo[j];
							if(!v.shape || v.shape.indexOf(",") == -1){
								continue;
							}
							var pos1 = v.shape.split(",");
							var lnglat1 = new IMAP.LngLat(pos1[0], pos1[1]);
							if(IMAP.Function.containsLngLat(lnglat1,polygonPath)){
								planPanelApp.addVideoToList(v);
							}
						}
						planPanelApp.drawRelatedSignals();
						planPanelApp.drawRelatedVideos();
						planPanelApp.searchingDev = false;
					});
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
				query: function() {
					var type = this.planQ.type;
					var planName = this.planQ.planName;
					loadJqGrid(type,planName);
				},
				//编辑预案
				edit: function (pid) {
					planPanelApp.planConfirmed = false;
					var id = null,isExec=true;
					if(pid && !(pid instanceof MouseEvent)){
						id = pid;
//						planPanelApp.planConfirmed = true;
						isExec = true;
					}else{
						id = TUtils.getSelectedRow();
						planPanelApp.planExecute = false;
//						planPanelApp.planConfirmed = false;
						isExec = false;
					}
					if(id == null){
						return ;
					}
					$.ajax({
					    url: "zhdd/plan/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								planPanelApp.plan = rslt.plan;
								planPanelApp.showSceneForm = false;
								planPanelApp.clearShape();
								planPanelApp.getAndShowPlanScene();
								$('#casetype1').selectpicker('val', planPanelApp.plan.type);
								planPanelApp.planConfirmed = isExec;
							}else{
								alert(rslt.msg);
							}
						}
					});
					$('#planManagerTab a[href="#detailTab"]').tab('show');
				},
				//保存预案
				save: function () {
				    $("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							var url = "zhdd/plan/savePlan";
							var plan = planPanelApp.plan;
							var startDt = $("#planStartDt").val();
							var endDt = $("#planEndDt").val();
							var planStartDt = new Date(startDt.replace(/-/g,"/"));
							var planEndDt = new Date(endDt.replace(/-/g,"/"));
							
							if(planStartDt<=planEndDt){
								plan.startDt = startDt;
								plan.endDt = endDt;
								$.ajax({
									type: "POST",
								    url: url,
								    data: JSON.stringify(plan),
								    success: function(rslt){
								    	if(rslt.code === 200){
											layer.msg('预案保存成功');
											planPanelApp.plan = rslt.plan;
											planPanelApp.planConfirmed = true;
											planPanelApp.reload();
										}else{
											alert(rslt.msg);
										}
									}
								});
							}else{
								layer.msg("结束时间必须在开始时间之后");
							}
				        }
					});
				},
				//删除预案
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定清除？', function(){
						$.ajax({
							type: "POST",
						    url: "zhdd/plan/purge/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									alert('操作成功', function(index){
										$("#jqGrid").trigger("reloadGrid");
									});
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				//重新加载预案列表
				reload: function () {
					loadJqGrid();
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
					if(this.sceneOverlay){
						map.getOverlayLayer().removeOverlay(this.sceneOverlay);
						this.scene.shape='';
						this.sceneOverlay = null;
					}
					if(this.highlightPoint){
						map.getOverlayLayer().removeOverlay(this.highlightPoint);
						this.highlightPoint = null;
					}
					this.searchingDev = false;
				},
				//切换到添加场景页面
				addScene: function () {
					this.showSceneForm = true;
					this.plan.startDt = $("#planStartDt").val();
					this.plan.endDt = $("#planEndDt").val();
					this.isGuardUsed=1;
					this.showVideoType=true;
					
					this.clearShape();
					this.scene = {shape:'', sceneName:'', startDt:'', endDt:'', sceneDetail:''};
				},
				//当前场景添加到预案中
				addSceneToPlan:function(){
					var startDt = $("#sceneStartDt").val();
					var endDt = $("#sceneEndDt").val();
					if(''!=this.scene.shape){
						if(''==startDt || ''==endDt){
							alert("请填写起止时间");
							return;
						}
						if(''==this.scene.sceneName){
							alert("请填写场景名称");
							return;
						}
						//判断场景的起止时间是否在预案的时间范围内
						var planStartDt = new Date(this.plan.startDt.replace(/-/g,"/"));
						var planEndDt = new Date(this.plan.endDt.replace(/-/g,"/"));
						var sceneStartDt = new Date(startDt.replace(/-/g,"/"));
						var sceneEndDt = new Date(endDt.replace(/-/g,"/"));
						
						if(sceneStartDt>=planStartDt && sceneEndDt<=planEndDt){
							this.scene.startDt = startDt;
							this.scene.endDt = endDt;
							var dtd = $.Deferred();
							$.when(planPanelApp.saveScene(dtd))
								.done(function(){ 
									planPanelApp.saveSceneRelatedDevs();
								});
						}else{
							alert("场景起止时间必须在预案起止时间范围内！");
						}
					}else{
						alert("请添加空间范围");
					}
				},
				//保存场景
				saveScene:function(dtd){
					this.scene.planId = this.plan.planId;
					$.ajax({
						type: "POST",
					    url: "zhdd/plan/saveScene",
					    data: JSON.stringify(this.scene),
					    success: function(rslt){
					    	if(rslt.code === 200){
								layer.msg('预案保存成功');
								planPanelApp.scene = rslt.scene;
								planPanelApp.reload();
								dtd.resolve(); 
							}else{
								alert(rslt.msg);
							}
						}
					});
					return dtd;
				},
				//保存场景相关的设备信息
				saveSceneRelatedDevs:function(){
					var sceneId = this.scene.sceneId;
					var devs = [];
					for (var i = 0; i < this.relatedSignals.length; i++) {
						var sig = this.relatedSignals[i].signal;
						devs.push({
							sceneId:sceneId,
							type:'0',
							sort:i,
							deviceId:sig.version?sig.crossId:sig.deviceId,
							presetContent:''
						});
					}
					for (var j = 0; j < this.relatedVideos.length; j++) {
						var v = this.relatedVideos[j].video;
						devs.push({
							sceneId:sceneId,
							type:'1',
							sort:j,
							deviceId:v.version?v.tunnel:v.deviceId,
							presetContent:''
						});
					}
					$.ajax({
						type: "POST",
					    url: "zhdd/plan/saveSceneDevs",
					    data: JSON.stringify(devs),
					    success: function(rslt){
					    	if(rslt.code === 200){
								layer.msg('场景相关设备保存成功');
								planPanelApp.back2Plan();
								planPanelApp.scene = {shape:'', overlay:null};
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				//显示已有的场景列表
				getAndShowPlanScene:function(){
					if(this.plan.planId && ''!=this.plan.planId){
						$.ajax({
	    					url: "zhdd/plan/getAllSceneByPlanId/"+this.plan.planId + "?rdm="+new Date().getTime(),
	    					success: function(rslt){
	    						if(rslt.code == 200){
	    							if(rslt.sceneList && rslt.sceneList.length>0){
	    								planPanelApp.sceneList = rslt.sceneList;
	    							}else{
	    								planPanelApp.sceneList = [];
	    							}
	    						}else{
	    							alert(rslt.msg);
	    						}
	    					}
	    				});
					}
				},
				//编辑场景
				editScene:function(item){
					this.showSceneForm = true;
					this.scene = item;
					this.isGuardUsed=1;
					this.showVideoType=true;
					var overlay = null;
					var lnglatarr = [];
					var shapes = this.scene.shape.split(" ");
					for (var i = 0; i < shapes.length; i++) {
						var ele = shapes[i];
						var pos = ele.split(",");
						lnglatarr.push(new IMAP.LngLat(pos[0], pos[1]));
					}
					if(this.plan.type == "jwxl"){
						// 线
						var plo = new IMAP.PolylineOptions();
						plo.strokeColor = "#ff0000";
						plo.strokeOpacity = "1";
						plo.strokeWeight = "5";
						plo.strokeStyle = "1";
						plo.arrow = true;
						overlay = new IMAP.Polyline(lnglatarr, plo);
					}else{
						// 面
						var pgo = new IMAP.PolygonOptions();
						pgo.fillColor = "#ffffff";
						pgo.fillOpacity = "1";
						pgo.strokeColor = "#ff0000";
						pgo.strokeOpacity = "1";
						pgo.strokeWeight = "3";
						pgo.strokeStyle = "solid";
						overlay = new IMAP.Polygon(lnglatarr, pgo);
					}
					map.getOverlayLayer().addOverlay(overlay, false);
					this.sceneOverlay = overlay;
					this.loadSceneRelatedDev();
				},
				//加载场景相关的设备
				loadSceneRelatedDev:function(){
					var sceneId = this.scene.sceneId;
					if(sceneId){
						$.ajax({
	    					url: "zhdd/plan/getRelatedDevBySceneId/"+sceneId + "?rdm="+new Date().getTime(),
	    					success: function(rslt){
	    						if(rslt.code == 200){
	    							if(rslt.devs && rslt.devs.length>0){
	    								var signalList =[], videoList = [];
	    								for (var t = 0; t < rslt.devs.length; t++) {
	    									var dev = rslt.devs[t];
	    									if(dev.type == "0"){
	    										signalList.push({signal:dev});
	    									}else if(dev.type == "1"){
	    										videoList.push({video:dev});
	    									}
										}
	    								planPanelApp.relatedSignals = signalList;
										planPanelApp.relatedVideos = videoList;
										planPanelApp.drawRelatedSignals();
										planPanelApp.drawRelatedVideos();
	    							}
	    						}else{
	    							alert(rslt.msg);
	    						}
	    					}
	    				});
					}
				},
				//删除场景
				deleteScene:function(index,item){
					this.sceneList.splice(index,1);
					var id  = item.id;
					var sceneId = item.sceneId == null ? "":item.sceneId;
					if(id && ''!=id){
						$.ajax({
	    					url: "zhdd/plan/purgeScene/"+id +"/"+sceneId+"?rdm="+new Date().getTime(),
	    					success: function(rslt){
	    						if(rslt.code == 200){
	    							layer.msg("删除成功");
	    						}else{
	    							alert(rslt.msg);
	    						}
	    					}
	    				});
					}
				},
				startScene:function(item){
					this.editScene(item);
					this.showVideoType = false;
				},
				//返回方案
				back2Plan: function () {
					this.showSceneForm = false;
					this.clearShape();
					this.getAndShowPlanScene();
				},
				resetPlan:function(){
					this.clearShape();
					this.scene = {shape:'', sceneName:'', startDt:'', endDt:'', sceneDetail:''};
					this.planConfirmed = false;
					this.showSceneForm = false;
					this.planExecute = false;
					this.plan = {shape:''};
					this.sceneList = [];
				},
				addNewPlan:function(){
					this.resetPlan();
					$('#planManagerTab a[href="#detailTab"]').tab('show');
				},
				openRelatedSignals:function(){
					if(this.relatedSignals.length > 0){
						var sigs = [];
						for(var x in this.relatedSignals){
							var sig = this.relatedSignals[x].signal;
							sig.crossId = sig.deviceId;
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
					}
				},
				openRelatedVideos:function(){
					var len = this.relatedVideos.length;
					if(len > 0){
						if(len<=4){
							planPanelApp.playVideo(len);
						}else{
							layer.msg("视频监控较多，建议先打开前4个");
							layer.open({
								  content: '视频监控较多，建议先打开前4个'
								  ,btn: ['打开', '取消']
								  ,yes: function(index, layero){
									  planPanelApp.playVideo(4);
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
					require(['layers/camera/camera'],function(camera){
						camera.playWinVideo(tunnels);
					});
				},
				back2query:function(){
					this.resetPlan();
					$('#planManagerTab a[href="#queryTab"]').tab('show');
				},
				close: function() {
					itsGlobal.hideLeftPanel();
					this.resetPlan();
				},
				setPlanDateStart:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){planPanelApp.plan.startDt = $("#planStartDt").val()}});
				},
				setPlanDateEnd:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){planPanelApp.plan.endDt = $("#planEndDt").val()}});
				},
				setSceneDateStart:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){planPanelApp.scene.startDt = $("#sceneStartDt").val()}});
				},
				setSceneDateEnd:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){planPanelApp.scene.endDt = $("#sceneEndDt").val()}});
				},
				openGuardPage:function(){
					var sigs = [],vis=[];
					for(var x in this.relatedSignals){
						var sig = this.relatedSignals[x].signal;
						sig.crossId = sig.deviceId;
						sigs.push(sig);
					}
					for(var y in this.relatedVideos){
						var v = this.relatedVideos[y].video;
						//预案中视频存库 deviceId对应的就是tunnel,type为1
						v.tunnel = v.deviceId;
						vis.push(v);
					}
					var signals = JSON.parse(JSON.stringify(sigs));
					
					var videos = JSON.parse(JSON.stringify(vis));
					
					quickGuardWindow = window.open('assets/js/module/quickGuard/index.html','planGuardWindow',
							'height=800px, innerHeight=800px,top=0,left=0,toolbar=yes,menubar=yes,scrollbars=no,resizable=yes,location=yes');
					var tryCnt = 0;
					var timer = setInterval(function(){
						if(quickGuardWindow && quickGuardWindow.PosindaLib && quickGuardWindow.PosindaLib.SignalUtils && quickGuardWindow.playVideoWithWindow){
							quickGuardWindow.removeCacheSignals();
							quickGuardWindow.PosindaLib.SignalUtils.clearSignalListApp();
							quickGuardWindow.PosindaLib.SignalUtils.addToHandleList(signals);
							
							var temp = "";
							var len = planPanelApp.relatedVideos.length;
							if(len>4){
								len = 4;
							}
							for(var i = 0; i < len; i++){
								var v = planPanelApp.relatedVideos[i].video;
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
			}
		});
		oldQ=1;
		$(function () { $("[data-toggle='tooltip']").tooltip(); });
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: planPanelApp,
			description: "planPanel的vue实例"
		});
	}

	var loadJqGrid = function(type,planName) {
		var url = "zhdd/plan/pageData";
		if(!type){
			type ="all";
		}
		url = url + "/" + type;
		
		var postDataTmp = {};
		if(planName){
			postDataTmp = {"planName":planName};
		}
		
		if(TUtils.cmp(postDataTmp,oldQ)){
			oldQ ={"planName":planName};
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
			oldQ ={"planName":planName};
			$('#jqGrid').jqGrid('GridUnload');
			$("#jqGrid").jqGrid({
				url: url,
				datatype: "json",
				postData: postDataTmp,
				colModel: [
				           { label: 'id', name: 'id', width: 5, key: true, hidden:true },
				           { label: '预案编号', name: 'planId', width: 60, hidden:true , sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '预案名称', name: 'planName', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '预案详情', name: 'planDetail', width: 145, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '预案类型', name: 'type', width: 50, sortable:false, formatter: function(value, options, row){
				        	   var result = "";
				        	   switch (value) {
				        	   case 'jwxl':
				        		   result = "警卫线路";
				        		   break;
				        	   case 'tfsj':
				        		   result = "突发事件";
				        		   break;
				        	   case 'jtgz':
				        		   result = "交通管制";
				        		   break;
				        	   case 'dxhd':
				        		   result = "大型活动";
				        		   break;
				        	   default:
				        		   break;
				        	   }
				        	   return result;}},
				        	   { label: '开始日期', name: 'startDt', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				        	   { label: '结束日期', name: 'endDt', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				        	   { label: '操作', width: 30, sortable:false, formatter: function(value, options, row){
				        		   return "<button data-toggle='tooltip' title='执行预案' data-placement='right' type='button' data-pid="+ row.id +" class='btn btn-link btn-sm plan-execute-btn'><span class='glyphicon glyphicon-play' aria-hidden='true'></span></button>";}},
				        		   { label: '空间范围', name: 'shape', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				        		   ],
				        		   viewrecords: true,
				        		   height: 390,
				        		   width:630,
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
				        			   $('.plan-execute-btn').bind("click",function(){
				        				   var id = $(this).data("pid");
				        				   planPanelApp.edit(id,true);
				        				   planPanelApp.planExecute = true;
				        			   })
				        		   },
				        		   gridComplete:function(){
				        			   //隐藏grid底部滚动条
				        			   $("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
				        		   },
				        		   ondblClickRow: function(rowid, iRow, iCol, e){
				        			   planPanelApp.edit();
				        		   },
				        		   onSelectRow: function(rowid){//选中某行
				        			   var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				        		   }
			});
		}
		
	};
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})