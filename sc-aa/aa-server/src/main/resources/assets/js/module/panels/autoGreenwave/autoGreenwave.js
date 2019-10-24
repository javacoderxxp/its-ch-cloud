define(function(require) {
	var htmlStr = require('text!./autoGreenwave.html');
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
	
	var lbkkMarkerOpts = new IMAP.MarkerOptions();
	lbkkMarkerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	lbkkMarkerOpts.icon = new IMAP.Icon("./assets/images/elecPolice.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	
		
	var getZdlbTimer = null;//获取开道车点位
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#autoGreenwave-panel',
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
				greenwaveName:"",
				carNo:"",
				lineStatus:"未执行",
				isEdit:false,
				lineId:"",
				isExec:false,
				kdcMarker:null,
				zdlbImgList:[],
				markers:[],
				vehPassLine:null,
				showLbkk:false,
				lbkkDevs:[],
				lbkkDevMarkers:[]
			},
			methods: {
				submitAutoGreenwaveLine:function(){
					$("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
				        	vm.saveNewGreenwaveLine();
				        }
					});
				},
				saveNewGreenwaveLine:function(){
					if(vm.isDataRight()){
						var sigCtrlList = vm.relatedSignalList;
						for(var i=0; i< sigCtrlList.length; i++){
							var sig = sigCtrlList[i];
							if(sig.phaseId == '1' || sig.phaseId == '2' || sig.phaseId == '3'){
								sig.jkfx = '0';
							}else if(sig.phaseId == '5' || sig.phaseId == '6' || sig.phaseId == '7'){
								sig.jkfx = '3';
							}else if(sig.phaseId == '9' || sig.phaseId == '10' || sig.phaseId == '11'){
								sig.jkfx = '2';
							}else if(sig.phaseId == '13' || sig.phaseId == '14' || sig.phaseId == '15'){
								sig.jkfx = '1';
							}
						}
						var obj = {"greenwaveName":vm.greenwaveName,"carNo":vm.carNo,"shp":vm.lineShape,"desc":vm.description,"sigCtrlList":sigCtrlList};
						
						var url = "zhdd/autoGreenwaveLine/submitGreenwaveLine";
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
					var greenwaveName = vm.greenwaveName;
					var carNo = vm.carNo;
					var sigCtrlList = vm.relatedSignalList;
					if(greenwaveName == null ||greenwaveName==""){
						alert("先添加自动绿波路线名称");
						return false;
					}
					if(carNo == null ||carNo==""){
						alert("先添加车牌号码");
						return false;
					}
					if(lineShape == null ||lineShape==""){
						alert("先添加自动绿波路线");
						return false;
					}
					if(sigCtrlList == null ||sigCtrlList.length==0){
						alert("自动绿波路线相位设备为空，重新添加路线");
						return false;
					}
					return true;
				},
				drawAutoGreenwaveLine:function(){
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
    					url: "dev/epLb/findSigCtrlerForGreenWave/",
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
					this.greenwaveName = "";
					this.showDetail = true;
					this.carNo = "";
					this.isExec = false;
					$('#greenwaveTab a[href="#detailTab"]').tab('show');
					this.clearShp();
					this.lineStatus = "未执行";
					this.isEdit = false;
				},
				goback:function(){
					this.showDetail = false;
					$('#greenwaveTab a[href="#queryTab"]').tab('show');
					this.clearShp();
					this.description = "";
					this.greenwaveName = "";
					this.carNo = "";
					this.lineStatus = "";
					this.isEdit = false;
					this.lineId = "";
					loadJqGrid();
					this.closeGetZdlbImgTimer();
					this.hideLbkkDevMarkers();
				},
				query: function() {
					/*var greenwaveName = this.lineQ.greenwaveName;
					var status = this.lineQ.status;*/
					loadJqGrid();
				},
				edit:function(){
					var id = TUtils.getSelectedRow();
					if(id){
						$.ajax({
						    url: "zhdd/autoGreenwaveLine/getGreenwaveLineData?lineId="+id,
						    success: function(rslt){
								if(rslt.code == 200){
									var line = rslt.line;
									var ctrl = rslt.ctrl;
									if(line.status == '1'){
										vm.lineStatus = "执行中";
										alert("自动绿波路线执行中，请勿修改！");
										vm.lineId = line.id;
										vm.isExec = true;
										vm.startToGetZdlbImg(); 
									}else if(line.status == '2'){
										vm.lineStatus = "已完成";
										vm.isExec = false;
									}else{
										vm.lineStatus = "未执行";
										vm.isExec = false;
									}
									vm.clearShp();
									vm.lineId = line.id;
									vm.carNo = line.carNo;
									vm.greenwaveName = line.greenwaveName;
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
											size: 10
										});
									});
									
									$('#greenwaveTab a[href="#detailTab"]').tab('show');
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				execAutoGreenwaveLine:function(){
					var url = "zhdd/autoGreenwaveLine/execGreenwaveLine?lineId="+vm.lineId+"&user="+currentUser.policeNo;
					if(this.isDataRight()){
						var obj = {"lineId":vm.lineId,"user":currentUser.policeNo};
						$.ajax({
							type: "GET",
						    url: url,
						    success: function(rslt){
						    	if(rslt.code === 200){
									alert("自动绿波执行成功！");
									vm.goback();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				closeAutoGreenwaveLine:function(){
					var url = "zhdd/autoGreenwaveLine/closeGreenwaveLine?lineId="+vm.lineId+"&user="+currentUser.policeNo;
					if(this.isDataRight()){
						var obj = {"lineId":vm.lineId,"user":currentUser.policeNo};
						$.ajax({
							type: "GET",
						    url: url,
						    success: function(rslt){
						    	if(rslt.code === 200){
									alert("自动绿波停止成功！");
									vm.goback();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				startToGetZdlbImg:function(){
					this.closeGetZdlbImgTimer();
					getZdlbTimer = setInterval(function(){
						if(vm.lineId && vm.lineId !=""){
							$.ajax({
		    					url: "zhdd/autoGreenwaveLine/getZdlbImg?lineId="+vm.lineId+"&carNo="+vm.carNo,
		    					success: function(rslt){
		    						if(rslt.code == 200){
		    							if(rslt.zdlbImg && rslt.zdlbImg.length>0){
		    								var newZdlbImgArr = [];
		    								for (var i = 0; i < rslt.zdlbImg.length; i++) {
		    									var ig = rslt.zdlbImg[i], isExist = false;
		    									if(ig && ig.plateNo == vm.carNo.trim()){
			    									for(var j=0;j<vm.zdlbImgList.length; j++){
			    										var existImg = vm.zdlbImgList[j];
			    										if(ig.fileName == existImg.fileName){
			    											isExist = true;
															break;
														}
			    									}
			    									if(!isExist){
			    										newZdlbImgArr.push(ig);
			    									}
		    									}
											}
		    								
		    								if(newZdlbImgArr.length > 0){
		    									vm.drawLinesAndMarker(rslt.zdlbImg,newZdlbImgArr);
		    								}
		    								
		    								vm.zdlbImgList = rslt.zdlbImg;
		    							}else{
		    								vm.clearLineAndMarkers();
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
				closeGetZdlbImgTimer:function(){
					if(getZdlbTimer){
						clearInterval(getZdlbTimer);
						getZdlbTimer = null;
					} 
					vm.zdlbImgList = [];
					this.clearLineAndMarkers();
				},
				drawLinesAndMarker:function(allImg,newZdlbImgArr){
					// 1. 画线
					var linelnglatarr = [];
					for (var i = 0; i < allImg.length; i++) {
						var im = allImg[i];
						if(im && im.ep && im.ep.shape){
							var pos = im.ep.shape.split(",");
							if(pos){
								linelnglatarr.push(new IMAP.LngLat(pos[0], pos[1]));
							}
						}
					}
					if(this.vehPassLine){
						map.getOverlayLayer().removeOverlay(this.vehPassLine);
					}
					this.vehPassLine = new IMAP.Polyline(linelnglatarr, polylineOpt);
					map.getOverlayLayer().addOverlay(this.vehPassLine, false); 
					// 2. 画点
					for (var j = 0; j < newZdlbImgArr.length; j++) {
						var newp = newZdlbImgArr[j];
						if(newp && newp.ep && newp.ep.shape){
							var pos = newp.ep.shape.split(",");
							if(pos){
								var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), kdcOpt);
								marker.data = newp;
								map.getOverlayLayer().addOverlay(marker, true); 
								vm.markers.push(marker);
								//marker点击出图片
								marker.addEventListener(IMAP.Constants.CLICK, function(e){
									var marker = e.target;
									var data = e.target.data;
									var tilte = data.plateNo +" - "+data.capTime;
									var img = "<img src='zhdd/autoGreenwaveLine/getPic?fileName="+encodeURIComponent(data.fileName)+"&rdm="+(new Date()).getTime()+"'>";
									layer.open({
									  type: 1,
									  skin: 'layui-layer-rim', //加上边框
									  area: ['700px', '550px'], //宽高
									  content: img,
									  title:tilte
									});
								});
							}
						}
					}
					
				},
				clearLineAndMarkers:function(){
					if(this.vehPassLine){
						map.getOverlayLayer().removeOverlay(this.vehPassLine);
					}
					if(this.markers.length>0){
						for (var i = 0; i < this.markers.length; i++) {
							var mk = this.markers[i];
							map.getOverlayLayer().removeOverlay(mk);
						}
					}
					this.vehPassLine = null;
					this.markers = [];
				},
				close: function() {
					this.clearShp();
					itsGlobal.hideLeftPanel();
				},
				queryTab:function(){
					this.goback();
				},
				saveAutoGreenwaveLine:function(){
					var url = "zhdd/autoGreenwaveLine/updateGreenwaveLine";
					if(this.lineStatus == "执行中"){
						alert("自动绿波路线执行中，请勿修改！");
						return;
					}
					if(this.isDataRight()){
						var obj = {"lineId":vm.lineId,"greenwaveName":vm.greenwaveName,"carNo":vm.carNo,"shp":vm.lineShape,"desc":vm.description,"sigCtrlList":vm.relatedSignalList};
						$.ajax({
							type: "POST",
						    url: url,
						    data: JSON.stringify(obj),
						    success: function(rslt){
						    	if(rslt.code === 200){
									alert("绿波路线更新成功！");
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
								alert("自动绿波线路执行中，请勿删除");
								return;
							}else{
								this.directDelLine(id);
							}
						}
					}
				},
				directDelLine:function(lineId){
					var url = "zhdd/autoGreenwaveLine/purge/"+lineId;
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
					if(null != highlightPoint){
						map.getOverlayLayer().removeOverlay(highlightPoint);
						highlightPoint = null;
					}
					clearLineAndOriginDestOverlay();
				},
				hideLbkkDevMarkers:function(){
					if(this.lbkkDevMarkers.length>0){
						for(var i=0;i<this.lbkkDevMarkers.length;i++){
							var marker = this.lbkkDevMarkers[i];
							map.getOverlayLayer().removeOverlay(marker);
						}
					}
					this.lbkkDevMarkers = [];
					this.showLbkk = false;
				},
				showLbkkDevMarkers:function(){
					this.lbkkDevMarkers = [];
					for(var i=0;i<this.lbkkDevs.length;i++){
						var dev = this.lbkkDevs[i];
						if(dev.shape){
							var pos = dev.shape.split(",");
							var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), lbkkMarkerOpts);
							marker.data = dev;
							map.getOverlayLayer().addOverlay(marker, false);
							marker.setTitle(dev.deviceName);
							vm.lbkkDevMarkers.push(marker);
						}
					}
					this.showLbkk = true;
				},
				showLbkkDevs:function(){
					if(!this.showLbkk){
						if(this.lbkkDevs.length == 0){
							var url = "dev/epLb/allData";
							$.get(url,function(data){
								if(data && data.list && data.list.length >0){
									vm.lbkkDevs = data.list;
									vm.showLbkkDevMarkers();
								}
							});
						}else{
							this.showLbkkDevMarkers();
						}
					}else{
						this.hideLbkkDevMarkers();
					}
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
		var greenwaveName = $("#greenwaveNameQ").val();
		var status = $("#lineStatus").val();
		
		var url = "zhdd/autoGreenwaveLine/pageData";
		var postDataTmp = {};
		if(greenwaveName){
			postDataTmp.greenwaveName = greenwaveName;
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
				           { label: '自动绿波名称', name: 'greenwaveName', width: 60, hidden:false , sortable:false/*, formatter: function(value, options, row){return value;}*/},
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
				        	   return result;}},
				        	   { label: '车牌号', name: 'carNo', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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
						size: 10
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