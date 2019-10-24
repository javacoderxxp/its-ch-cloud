define(function(require) {
	var htmlStr = require('text!./missionPanel.html');
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
				unsignList:  [],
				fkms:[],
				uncompletedList:[],
				completedList:[],
				showMissionType:'0',
				highlightPoint:null
			},
			methods: {
				loadMissions: function() {
					var that = this;
					if(currentUser && currentUser.group){
						var groupId = currentUser.group.groupId;
						var url = "emer/mission/getMissionsByGroup?groupId="+groupId;
						$.get(url,function(rslt){
							if(rslt.missionList){
								that.unsignList = [];
								that.uncompletedList =[];
								that.completedList =[];
								for(var x in rslt.missionList){
									var mission = rslt.missionList[x];
									if(mission.status=='0'){
										that.unsignList.push(mission);
									}else if(mission.status=='1'){
										that.uncompletedList.push(mission);
									}else if(mission.status=='2'){
										that.completedList.push(mission);
									}
								}
								that.drawMissions(rslt.missionList);
							}
						});
					}
				},
				signAndProcess:function(item){
					var that = this;
					if(item && item.id){
						item.status = "1";//已签收未完成
						item.signUser = currentUser.userId, //签收人
						item.signDt = TUtils.formatDateTime(new Date()); //签收时间
						var url = "emer/mission/save";
						$.ajax({
							  type: "POST",
							  url: url,
							  data: JSON.stringify(item),
							  dataType: "json",
							  contentType: "application/json; charset=utf-8",
							  cache: false,
							  success: function (msg) {
							      if(msg.code == 200){
							    	  layer.msg("任务签收成功");
							    	  that.loadMissions();
							      }
							  },
							  error:function(){
								  layer.msg("任务签收失败");
							  }
							});
					}
				},
				feedback:function(item){
					app.fkms = item;
					$("#descText").val("");
					if(item.fkDesc){
						$("#descText").val(item.fkDesc);
					}
					layer.open({
						type: 1,
						skin: 'layui-layer',
						title: ["任务反馈"],
						area: ['480px', '205px'],
						shade: false,
						content: jQuery("#postAlarmTaskDiv"),
						btn: []
					});
				},
				finishMission:function(item){
					var that = this;
					var fkd= $("#descText").val();
					var item =app.fkms;
					if(fkd){
						if(item && item.id){
							item.fkDesc=fkd;
							item.status = "2";//已完成
							item.finishUser = currentUser.userId, //完成人
							item.finishDt = TUtils.formatDateTime(new Date()); //完成时间
							var url = "emer/mission/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(item),
								dataType: "json",
								contentType: "application/json; charset=utf-8",
								cache: false,
								success: function (msg) {
									if(msg.code == 200){
										layer.closeAll();
										layer.msg("任务完成提交成功");
										that.loadMissions();
									}
								},
								error:function(){
									layer.msg("任务完成提交失败");
								}
							});
						}
					}else{
						alert("反馈内容不能为空！");
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
				loadMsgs:function(type){
					this.showMissionType = type;
				},
				drawMissions:function(missions){
					_drawMissions(missions);
				},
				clearMissionMarkers:function(){
					_clearMissionMarkers();
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
			description: ""
		});
		app.loadMissions();
		getMissionTimer = setInterval(app.loadMissions, 60000);
	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	var _drawMissions = function(missions){
		_clearMissionMarkers();
		for(var x in missions){
			var mission = missions[x];
			var pos = mission.shape.split(",");
			var lnglat = new IMAP.LngLat(pos[0], pos[1]);
			var opt;
			if(mission.status == '0'){
				opt = unsignedMissionOpts;
			}else if(mission.status == '1'){
				opt = uncompletedMissionOpts;
			}else if(mission.status == '2'){
				opt = completedMissionOpts;
			}
			if(opt){
				var marker = new IMAP.Marker(lnglat, opt);
				map.getOverlayLayer().addOverlay(marker, true);
				var arr = missionMarkerMap.get(mission.status);
				arr.push(marker);
			}
		}
	}
	
	var _clearMissionMarkers = function(){
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
	}
	
	var loadData = function(data){
		if(data){
			_drawMissions(data);
		}else{
			_clearMissionMarkers();
		}
	}
	
	return {
		show: show,
		hide: hide,
		loadData:loadData
	};
})