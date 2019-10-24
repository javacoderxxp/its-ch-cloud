define(function(require) {
	var Vue = require('vue');
	var htmlStr = require('text!./signalListPanel.html');
	var map = require('mainMap');
	var purePanelApp = null, allSignal = [], highlightPoint = null;
	var tool = new IMAP.PolylineTool();
	tool.arrow = true;// 是否带箭头绘制
	tool.autoClose = true;// 是否自动关闭绘制
	tool.strokeWeight = 5; // 折线宽度
	tool.strokeColor = "#32CD32"; // 折线颜色
	map.addTool(tool);
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/box.png", new IMAP.Size(48, 48), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.CENTER;
	var signalCtrlWin = null;
	
	var closeSignalCtrlWin = window.closeSignalCtrlWin = function(a){
		if(null != signalCtrlWin) {
			signalCtrlWin.close();
			signalCtrlWin=null;
		}
	}
	//关闭窗口
	$(window).unload(function(){
		closeSignalCtrlWin();
	});
	
	var loadPanelApp = function() {
		var selectedDevListPanel = $("#selectedDevListPanel");
		selectedDevListPanel.html(htmlStr);
		selectedDevListPanel.fadeIn().css("display", "inline-block");
		purePanelApp = new Vue({
			el : '#signal_list_panel_app',
			data : {
				signalList : [],
				newCompletedPolyline : null
			},
			methods : {
				onUpdate: function (event) {
				    this.signalList.splice(event.newIndex, 0, this.list.splice(event.oldIndex, 1)[0]);
				},
				drawLineToSelect : function() {
					require(["./signal"],function(signal){
						signal.markersClickEventEnable(false);
					});
					this.signalList = [];
					var that = this;
					if (that.newCompletedPolyline) {
						map.getOverlayLayer().removeOverlay(that.newCompletedPolyline);
					}
					tool.open();
					tool.addEventListener(IMAP.Constants.ADD_OVERLAY, function(evt) {
						that.newCompletedPolyline = evt.overlay;
						that.findAccordingSignal();
						tool.close();
						require(["./signal"],function(signal){
							signal.markersClickEventEnable(true);
						});
					}, this);
				},
				signalenter:function(item){
					var pos = item.shape.split(",");
					if(null == highlightPoint){
						highlightPoint = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
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
				close : function() {
					selectedDevListPanel.hide();
					this.signalList = [];
					if(this.newCompletedPolyline){
						map.getOverlayLayer().removeOverlay(this.newCompletedPolyline);
					}
					if(null != highlightPoint){
						map.getOverlayLayer().removeOverlay(highlightPoint);
					}
				},
				confirm:function(){
					signalCtrlWin = null;
					var signals = JSON.parse(JSON.stringify(this.signalList));
				
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
				removeFromList:function(index){
					this.signalList.splice(index,1);
				},
				findAccordingSignal : function() {
					var pathArr = TUtils.lineToPoints(this.newCompletedPolyline,10);
					for (var t = 0; t < pathArr.length - 1; t++) {
						var p1 = pathArr[t];
						var p2 = pathArr[t + 1];
						for (var d = 0; d < allSignal.length; d++) {
							var marker = allSignal[d];
							var pos = marker.getPosition();
							var dis = TUtils.getDisFromPoint2Line(pos, p1, p2);
							if (dis <= 150) {
								this.addSignalToList(marker.data);
							}
						}
					}
				},
				addSignalToList:function(signal){
					//TODO 过滤掉离线的信号机
					var flag = true;
					for (var i = 0; i < this.signalList.length; i++) {
						var s = this.signalList[i];
						if(s.deviceId == signal.deviceId){
							flag = false;
							break;
						}
					}
					if(flag){
						//过滤大为信号机
						if(signal.type != "大为"){
							this.signalList.push(signal);
						}
					}
				},
				init : function() {
					selectedDevListPanel.show();
					this.signalList = [];
					if (this.newCompletedPolyline) {
						map.getOverlayLayer().removeOverlay(this.newCompletedPolyline);
					}
					this.newCompletedPolyline = null;
				},
				remove:function(e){
				}
			}
		});
		vueEureka.set("selectedSignalListPanel", {
			vue : purePanelApp,
			description : "selectedSignalList的vue实例"
		});
	}
	var addSignal = function(signal) {
		if (!purePanelApp) {
			loadPanel();
		}
		if (signal) {
			purePanelApp.addSignalToList(signal);
		}
		if(signalCtrlWin){
			if(signal.type != "大为"){
				var t = [];t.push(signal);
				signalCtrlWin.PosindaLib.SignalUtils.addToHandleList(t);
			}else{
				layer.msg("大为信号机接口未通，暂不支持");
			}
		}else{
			purePanelApp.confirm();
		}
	}

	var closePanel = function() {
		if (purePanelApp) {
			purePanelApp.close();
		}
		allSignal = [];
	}

	var loadPanel = function(allSignals) {
		if (!purePanelApp) {
			loadPanelApp();
		} else {
			purePanelApp.init();
		}
		allSignal = allSignals;
	}
	return {
		loadPanel : loadPanel,
		addSignal : addSignal,
		closePanel : closePanel
	}
})