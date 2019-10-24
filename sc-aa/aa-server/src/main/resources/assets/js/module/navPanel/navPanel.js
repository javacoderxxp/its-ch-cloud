define(function(require) {
	var navPanelHtml = require('text!./navPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var md5 = require('md5');
	var testword = "navPanel",
	transMarkers = [];
//	var currentUser = window.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
	var currentUser;
	function NavPanel(div) { //
		this._init(div);
		this.test = test;
	}
	
	function test(){
	}

	NavPanel.prototype._init = function(div) {
		var it = this;
		div.html(navPanelHtml);

		$.get("currentUser", function(rslt){
			if(rslt.currentUser){
				currentUser = window.currentUser = rslt.currentUser;
				loadVm();
				if(currentUser.group && currentUser.group.parent && currentUser.group.parent.groupId == "ddjg"){
					map.enableMenuItemTask(true);
				}
			}
		});
	}
	
	function loadVm(){
		var ctrlPanelApp = new Vue({
			el: '#ctrlPanelContent',
			data: {
				unReadNotifyCnt: 0,
				currentUser : currentUser,
				unCompletedTaskCnt:''
			},
			mounted:function(){
				setTimeout(function(){
					$('li.dropdown').mouseover(function() {
						$(this).addClass('open');
					}).mouseout(function() {
						$(this).removeClass('open');
					}); 
				}, 100);
			},
			methods: {
				clickMenu: function(href) {
					switch (href) {
					case 'constructionOccup':
						require(['panels/constOccupPanel/constOccup'],function(constOccup){
							constOccup.show();
						});
						break;
					case 'trafficControl':
						require(['panels/trafficControlPanel/trafficControl'],function(trafficControl){
							trafficControl.show();
						});
						break;
					case 'drawVideoRange':
						/*require(['panels/drawVideoRangePanel/drawVideoRange'],function(alarmTaskStatistics){
							alarmTaskStatistics.show();
						});
						break;*/
						require(['panels/drawVideoRangePanel/drawVideoRange'],function(drawVideoRange){
							drawVideoRange.show(false,null,null);
						});
						break;
					case 'vehicleFlow':
						require(['panels/vehicleFlow/vehicleFlow'],function(vehicleFlow){
							vehicleFlow.show();
						});
						break;
					case 'hikkkFlow':
						require(['panels/hikFlowCam/hikFlowCamPanel'],function(hikFlowCamPanel){
							hikFlowCamPanel.show();
						});
						break;
					case 'vehicleFlowReport':
						require(['panels/vehicleFlowReport/vehicleFlowReport'],function(vehicleFlowReport){
							vehicleFlowReport.show();
						});
						break;
					case 'roadCrossFlow':
						require(['panels/roadCrossFlow/roadCrossFlow'],function(roadCrossFlow){
							roadCrossFlow.show();
						});
						break;
					case 'dynAlarmVisualScene':
						require(['visualScene/dynAlarmVisualScene/initAlarmScene'],function(initAlarmScene){
							initAlarmScene.show('alarmScene');
						});
						break;
					case 'dynAlarmVisualSceneNew':
						require(['panels/punishWarning/punishWarning'],function(punishWarning){
							punishWarning.show();
						});
						break;
					case 'emergencyScene':
						require(['visualScene/dynAlarmVisualScene/initAlarmScene'],function(initAlarmScene){
							initAlarmScene.show('emergencyScene');
						});
						break;
					case 'securityGuardScene':
						require(['visualScene/dynAlarmVisualScene/initAlarmScene'],function(initAlarmScene){
							initAlarmScene.show('securityGuardScene');
						});
						break;
					case 'trafficCondConfirm':
						require(['panels/trafficCondConfirmPanel/trafficCondConfirm'],function(trafficCondConfirm){
							trafficCondConfirm.show();
						});
						break;
					case 'planManage':
						require(['panels/plan/planPanel'],function(planPanel){
							planPanel.show();
						});
						break;
					case 'quickGuard':
						require(['panels/quickGuard/quickGuard'],function(quickGuard){
							quickGuard.show();
						});
						break;
					case 'autoGuard':
						require(['panels/autoGuard/autoGuard'],function(autoGuard){
							autoGuard.show();
						});
						break;
					case 'autoGreenwave':
						require(['panels/autoGreenwave/autoGreenwave'],function(autoGreenwave){
							autoGreenwave.show();
						});
						break;
					case 'dutyGrid':
						require(['panels/dutyGridPanel/dutyGrid'],function(dutyGrid){
							dutyGrid.show();
						});
						break;
					case 'teamManage':
						require(['panels/teamManage/teamManagePanel'],function(teamManagePanel){
							teamManagePanel.show();
						});
						break;
					case 'scheduleArrange':
						require(['panels/scheduleArrange/scheduleArrange'],function(scheduleArrange){
							scheduleArrange.show();
						});
						break;
					case 'projectManage':
						require(['panels/pmPanel/pmPanel'],function(pmPanel){
							pmPanel.show();
						});
						break;
					case 'deviceStat':
						require(['panels/deviceStatPanel/deviceStat'],function(deviceStat){
							deviceStat.show();
						});
						break;
					case 'facilitiesStatistics':
						require(['panels/facilitiesRepairPanel/facilitiesStatistics'],function(facilitiesStatistics){
							facilitiesStatistics.show();
						});
						break;
					case 'facilitiesCount':
						require(['panels/facilitiesRepairPanel/facilitiesCount'],function(facilitiesCount){
							facilitiesCount.show();
						});
						break;
					case 'keyVehicle':
						require(['panels/keyVehiclePanel/keyVehicle'],function(keyVehicle){
							keyVehicle.show();
						});
						break;
					case 'vehicleTrace':
						require(['panels/vehicleTrace/vehicleTrace'],function(vehicleTrace){
							vehicleTrace.show(false);
						});
						break;
					case 'linkStatus':
						require(['panels/linkStatus/linkStatus'],function(linkStatus){
							linkStatus.show();
						});
						break;
					case 'pureVersion':
						require(['panels/purePanel/purePanel'],function(purePanel){
							purePanel.show();
						});
						break;
					case 'linkJamPanels':
						require(['panels/linkJamPanel/linkJam'],function(linkJamPanel){
							linkJamPanel.show();
						});
						break;
					case 'jtsgStatPanel':
						require(['panels/jtsgPanel/jtsgPanel'],function(jtsgPanel){
							jtsgPanel.show();
						});
						break;
					case 'rhPost':
						require(['panels/rhPost/rhPost'],function(rhPost){
							rhPost.show();
						});
						break;
					case 'vehPassTempBk':
						require(['panels/tempBk/tempBkPanel'],function(tempBkPanel){
							tempBkPanel.show();
						});
						break;
					case 'policeService':
						require(['panels/policeServicePanel/policeService'],function(policeServicePanel){
							policeServicePanel.show();
						});
						break;
					case 'violationPublish':
						require(['panels/violationPublishPanel/violationPublish'],function(policeServicePanel){
							policeServicePanel.show();
						});
						break;
					case 'violationCount':
						require(['panels/violationPublishPanel/violationCount'],function(policeServicePanel){
							policeServicePanel.show();
						});
						break;
					case 'jwTaskCount':
						require(['panels/violationPublishPanel/jwTaskCount'],function(policeServicePanel){
							policeServicePanel.show();
						});
						break;
					case 'parkingLot':
						require(['panels/parkingLotPanel/parkingLot'],function(parkingLotPanel){
							parkingLotPanel.show();
						});
						break;
					case 'aqxcPanel':
						require(['panels/aqxcPanel/aqxcPanel'],function(aqxcPanel){
							aqxcPanel.show();
						});
						break;
					case 'breakLaw15':
						require(['panels/djwf/djwfPanel'],function(djwfPanel){
							djwfPanel.show();
						});
						break;
					case 'oftenJamPanel':
						require(['panels/oftenJam/oftenJamPanel'],function(oftenJamPanel){
							oftenJamPanel.show();
						});
						break;
					case 'hiddenDangerPanel':
						require(['panels/hiddenDanger/hiddenDangerPanel'],function(hiddenDangerPanel){
							hiddenDangerPanel.show();
						});
						break;
					case 'facilitiesDate':
						require(['panels/facilitiesRepairPanel/facilitiesDate'],function(facilitiesDate){
							facilitiesDate.show();
						});
						break;
					case 'facilitiesOverdue':
						require(['panels/facilitiesRepairPanel/facilitiesOverdue'],function(facilitiesOverdue){
							facilitiesOverdue.show();
						});
						break;
					case 'quickRepair': 
						require(['panels/facilitiesRepairPanel/quickRepair'],function(quickRepair){
							quickRepair.show("",1);
						});
						break;
					case 'qwInspectSummary': 
						require(['qwInspect/initQwInspectSummary'],function(qwInspectSummary){
							qwInspectSummary.show();
						});
						break;
					case 'qwSchedule': 
						require(['qwSchedule/initQwSchedule'],function(qwSchedule){
							qwSchedule.show();
						});
						break;
					case 'qwZxxdSchedule': 
						require(['qwSchedule/initQwSchedule'],function(qwSchedule){
							qwSchedule.showZxxd();
						});
						break;
					case 'showQwGSS': 
						require(['qwSchedule/initQwSchedule'],function(qwSchedule){
							qwSchedule.showQwGSS();
						});
						break;
					case 'initQwWork': 
						require(['qwWorkData/initQwWork'],function(qwWorkPage){
							qwWorkPage.show();
						});
						break;
					case 'initQwdd': 
						require(['qwDayData/initQwdd'],function(qwDayDataPage){
							qwDayDataPage.show();
						});
						break;
					case 'jtzbPanel': 
						require(['../../domain/report/initWeeklyTrafficReport'],function(weeklyTrafficReport){
							weeklyTrafficReport.show();
						});
						break;
					case 'bzListPanel':
						require(['layers/bzPanel/bzListPanel'],function(bzListPanel){
							bzListPanel.show('');
						});
						break;
					case 'hikVFReport':
						require(['layers/hikFlowCam/hikVFReport'],function(hikVFReport){
							hikVFReport.show('');
						});
						break;
					case 'query_ptrw':
						require(['panels/missionSendPanel/missionSend'],function(missionSend){
							missionSend.showQueryPanel();
						})
						break;
					case 'menu_jsz':
						require(['layers/driverCard/driverCardPanel'],function(driverCardPanel){
							driverCardPanel.show('');
						})
						break;
					case 'qw_clgl':
						require(['panels/clgl/clglPanel'],function(clglPanel){
							clglPanel.show();
						})
						break;
					case 'jtssBzPanel':
						require(['panels/jtssBz/jtssBzPanel'],function(jtssBzPanel){
							jtssBzPanel.show();
						})
						break;
					case 'menu_zdqy':
						require(['layers/zdqy/zdqyPanel'],function(zdqyPanel){
							zdqyPanel.show({});
						})
						break;	
					case 'trafficFlowIndex':
						require(['panels/trafficFlowIndex/trafficFlowIndex'],function(trafficFlowIndex){
							trafficFlowIndex.show({});
						})
						break;	
					case 'historyJam':
						require(['panels/historyJam/historyJam'],function(historyJam){
							historyJam.show({});
						})
						break;
					case 'passPanel':
						require(['panels/passPanel/passPanel'],function(passPanel){
							passPanel.show();
						})
						break;
					case 'zdqyJsyPanel':
						require(['panels/zdqyJsy/zdqyJsyPanel'],function(zdqyJsyPanel){
							zdqyJsyPanel.show();
						});
						break;
					case 'zdqyClPanel':
						require(['panels/zdqyCl/zdqyClPanel'],function(zdqyClPanel){
							zdqyClPanel.show();
						});
						break;
					case 'jwtWorkPanel':
						require(['panels/jwtWork/jwtWorkPanel'],function(jwtWorkPanel){
							jwtWorkPanel.show();
						});
						break;
					case 'zdclglPanel':
						window.location.href =ctx+"cgs"
						break;
					case 'roadDraw':
						require(['panels/roadDrawPanel/roadDraw'],function(roadDraw){
							roadDraw.show();
						});
						break;
					case 'roadsgCount': 
						require(['panels/roadsgCountPanel/roadsgCount'],function(roadsgCount){
							roadsgCount.show();
						});
						break;
					case 'zxjgTaskPanel': 
						require(['panels/zxjgTask/zxjgTaskPanel'],function(zxjgTaskPanel){
							zxjgTaskPanel.show();
						});
						break;
					case 'clTaskPanel': 
						require(['panels/clTask/clTaskPanel'],function(clTaskPanel){
							clTaskPanel.show();
						});
						break;
					case 'ytglTaskSummary': 
						require(['zxjgYtglTask/zxjgYtglTask'],function(zxjgYtglTask){
							zxjgYtglTask.show();
						});
						break;
					case 'psPlanPanel': 
						require(['panels/psPlan/psPlanPanel'],function(psPlanPanel){
							psPlanPanel.show();
						});
						break;
					case 'jwtNoticePanel': 
						require(['panels/notice/noticePanel'],function(noticePanel){
							noticePanel.show();
						});
						break;
					case 'pressureIncidentPanel': 
						/*require(['panels/pressureIncident/pressureIncidentPanel'],function(pressureIncident){
							pressureIncident.show();
						});*/
						require(['riSchedule/initRiSchedule'],function(riSchedule){
							riSchedule.show();
						});
						break;
					case 'pIPanel': 
						require(['panels/pressureIncident/pressureIncidentPanel'],function(pressureIncident){
							pressureIncident.show();
						});
						break;
					case 'openWarningPage': 
						require(['visualScene/dynAlarmVisualScene/initAlarmScene'],function(initAlarmScene){
							initAlarmScene.show('alarmSceneNew');
						});
						break;
					case 'valideCatchPanel': 
						require(['panels/validCatch/validCatchPanel'],function(validCatchPanel){
							validCatchPanel.show();
						});
						break;
					case 'vpSame':
						require(['panels/violationPublishPanel/vpSame'],function(vpSame){
							vpSame.show();
						});
						break;
					default:
						break;
					}
				},
				hasRole: function(roleId) {
					return $.inArray(roleId,currentUser.roleIdList) >= 0;
				},
				showMenu: function(menuId) {
					/*return $.inArray(menuId,currentUser.menuIdList) >= 0;*/
					return true;
				},
				notify: function(){
					require(['panels/notify/notify'],function(notify){
						notify.show();
					});
				},
				checkMissons:function(){
					if(currentUser.group && currentUser.group.parent && currentUser.group.parent.groupId == "ddjg"){
						require(['panels/missionSendPanel/missionMonitorPanel'],function(missionMonitorPanel){
							missionMonitorPanel.show();
						});
						return;
					}
					require(['panels/missionSendPanel/missionPanel'],function(missionPanel){
						missionPanel.show();
					});
				},
				autoLoadMissons: function(){
					var that = this;
					if(currentUser.group && currentUser.group.parent && currentUser.group.parent.groupId == "ddjg"){
						var userId = currentUser.userId;
						if(userId){
							var url = "emer/mission/getUncompletedMissionsCnt?userId="+userId;
							$.get(url,function(rslt){
								if(rslt.cnt){
									that.unCompletedTaskCnt = rslt.cnt;
								}
							});
						}
						return;
					}
					if(currentUser && currentUser.group){
						var groupId = currentUser.group.groupId;
						if(groupId){
							var url = "emer/mission/getUnhandledMissionsCnt?groupId="+groupId;
							$.get(url,function(rslt){
								if(rslt.cnt){
									that.unCompletedTaskCnt = rslt.cnt;
								}
							});
						}
					}
				},
				autoLoadNotify: function(){
					$.get("sys/notify/unReadNotifyCnt",function(rslt){
						if(rslt.unReadNotifyCnt){
							$('#notifyBadge').css('backgroundColor', 'red');
							/*if(ctrlPanelApp.unReadNotifyCnt != rslt.unReadNotifyCnt){
							}else{
								$('#notifyBadge').css('backgroundColor', '#bbbbbb');
							}*/
							ctrlPanelApp.unReadNotifyCnt = rslt.unReadNotifyCnt;
						}
					});
				},
				updatePassword :function (){
					layer.open({
						type: 1,
						skin: 'layui-layer',
						title: "修改密码",
						area: ['460px', '240px'],
						shade: false,
						content: jQuery("#passwordLayer"),
						btn: ['修改','取消'],
						btn1: function (index) {
							var oldPassword = $("#oldPassword").val();
							var newPassword = $("#newPassword").val();
							var newPassword2 = $("#newPassword2").val();
							if(!oldPassword || !newPassword){
								alert("密码不能为空.");
								return;
							}
							if(newPassword != newPassword2){
								alert("两次新密码不一致.");
								return;
							}
							if(newPassword.length < 6){
								alert("密码至少为6位.");
								return;
							}

							oldPassword = md5(oldPassword).toUpperCase();
							newPassword = md5(newPassword).toUpperCase();
							var data = "password="+oldPassword+"&newPassword="+newPassword;
							$.ajax({
								type: "POST",
							    url: "aa/user/updatePassword?"+data,
							    data: data,
							    dataType: "json",
							    success: function(result){
									if(result.code == 200){
										layer.close(index);
										layer.alert('修改成功', function(index){
											location.reload();
										});
									}else{
										layer.alert(result.msg);
									}
								}
							});
				        }
					});
				},
				exit: function() {
					confirm("您确定要退出吗？", function(){
						window.location.href = "logout";
					});
				}
			}
		});
		
		ctrlPanelApp.autoLoadNotify();
		ctrlPanelApp.autoLoadMissons();
		
		setInterval(ctrlPanelApp.autoLoadNotify, 60000);//1分钟一次
		setInterval(ctrlPanelApp.autoLoadMissons, 60000);//1分钟一次
		vueEureka.set("ctrlPanelApp",{vue:ctrlPanelApp,description:"CtrlPanel的vue实例"});
	}
	
	
	return NavPanel;
})