define(function(require) {
	var htmlStr = require('text!./missionMonitorPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var app = null;
	var getMissionTimer = null;
	var missionMarkerMap = new Map();
	var completedMissionOpts = new IMAP.MarkerOptions();
	completedMissionOpts.icon = new IMAP.Icon("./assets/images/completedMission.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	completedMissionOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var uncompletedMissionOpts = new IMAP.MarkerOptions();
	uncompletedMissionOpts.icon = new IMAP.Icon("./assets/images/uncompletedMission.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	uncompletedMissionOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var unsignedMissionOpts = new IMAP.MarkerOptions();
	unsignedMissionOpts.icon = new IMAP.Icon("./assets/images/unsignedMission.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	unsignedMissionOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/box32.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var show = function() {
		if(!currentUser){
			return;
		}
		itsGlobal.showLeftPanel(htmlStr);
		app = new Vue({
			el: '#pure-panel',
			data: {
				unFinishedList:[],
				finishedList:[],
				showMissionType:'1',
				highlightPoint:null
			},
			methods: {
				loadMissions: function() {
					var that = this;
					if(currentUser && currentUser.group){
						var userId = currentUser.userId;
						var url = "emer/mission/getMissionsByPublisher?publisher="+userId;
						$.get(url,function(rslt){
							if(rslt.missionMap){
								that.unFinishedList = rslt.missionMap.unFinishedList;
								that.finishedList = rslt.missionMap.finishedList;
								that.drawMissions();
							}
						});
					}
				},
				locateMission:function(item){
					var that = this;
					if(item && item.shape){
						var pos = item.shape.split(",");
						var center = new IMAP.LngLat(pos[0], pos[1]);
						
						if(null == this.highlightPoint){
							this.highlightPoint = new IMAP.Marker(center, markerOpts);
							map.getOverlayLayer().addOverlay(this.highlightPoint, true);
						}else{
							this.highlightPoint.setPosition(center);
							this.highlightPoint.visible(true);
						}
						map.setCenter(center,16);
					}
				},
				drawMissions:function(){
					this.clearMissionMarkers();
					for(var x in this.unFinishedList){
						var mission = this.unFinishedList[x];
						var pos = mission.shape.split(",");
						var lnglat = new IMAP.LngLat(pos[0], pos[1]);
						var opt;
						if(mission.status == '0'){
							opt = unsignedMissionOpts;
						}else if(mission.status == '1'){
							opt = uncompletedMissionOpts;
						}
						if(opt){
							var marker = new IMAP.Marker(lnglat, opt);
							map.getOverlayLayer().addOverlay(marker, true);
							var arr = missionMarkerMap.get(mission.status);
							arr.push(marker);
						}
					}
					for(var x in this.finishedList){
						var mission = this.finishedList[x];
						var pos = mission.shape.split(",");
						var lnglat = new IMAP.LngLat(pos[0], pos[1]);
						var opt = completedMissionOpts;
						if(opt){
							var marker = new IMAP.Marker(lnglat, opt);
							map.getOverlayLayer().addOverlay(marker, true);
							var arr = missionMarkerMap.get(mission.status);
							arr.push(marker);
						}
					}
				},
				loadMsgs:function(type){
					this.showMissionType = type;
				},
				clearMissionMarkers:function(){
					var unsign = missionMarkerMap.get("0");
					var uncompleted = missionMarkerMap.get("1");
					var completed = missionMarkerMap.get("2");
					if(unsign){
						for(var i in unsign){
							var one = unsign[i];
							map.getOverlayLayer().removeOverlay(one);
						}
					}
					if(uncompleted){
						for(var i in uncompleted){
							var one = uncompleted[i];
							map.getOverlayLayer().removeOverlay(one);
						}
					}
					if(completed){
						for(var i in completed){
							var one = completed[i];
							map.getOverlayLayer().removeOverlay(one);
						}
					}
					missionMarkerMap = new Map();
					missionMarkerMap.set("0",[]);
					missionMarkerMap.set("1",[]);
					missionMarkerMap.set("2",[]);
				},
				close: function() {
					itsGlobal.hideLeftPanel();
					if(null!=getMissionTimer){
						clearInterval(getMissionTimer);
						getMissionTimer = null;
					}
					if(this.highlightPoint){
						map.getOverlayLayer().removeOverlay(this.highlightPoint);
						this.highlightPoint = null;
					}
					this.clearMissionMarkers();
				}
			}
		});
		vueEureka.set("leftPanel", {
			vue: app,
			description: "发送的任务列表"
		});
		app.loadMissions();
		getMissionTimer = setInterval(app.loadMissions, 120000);
	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})