define(function(require) {
	var htmlStr = require('text!./violationCount.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('my97Datepicker');
	var publishApp = null;
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		
		publishApp = new Vue({
			el: '#violationPublish-panel',
			data: {
				publishQ:{startTime: TUtils.formatDateTime000(new Date()), endTime: TUtils.formatDate(new Date())+" 23:59:59"},
				punishList:[],
				showDetail:false,
				heatmapOverlay:null,
				userList:[],
				groupList:[],
				gId:'',
				tCounts:0
			},
			methods: {
				query: function () {
					publishApp.publishQ.startTime = $("#startTime").val();
					publishApp.publishQ.endTime = $("#endTime").val();
					$.ajax({
						type: "GET",
					    url: "./qw/violationPunish/genViolateCount",
					    data: {startDt:publishApp.publishQ.startTime,endDt:publishApp.publishQ.endTime,
					    	zdId:publishApp.publishQ.zdId,punisherNo:publishApp.publishQ.punisherNo},
			            dataType: "json",
					    success: function(rstl){
					    	if(rstl.code === 200){
					    		publishApp.punishList = rstl.punishList;
					    		publishApp.tCounts =0;
					    		for(var i = 0;i<publishApp.punishList.length;i++){
					    			publishApp.tCounts =Number(publishApp.tCounts)+Number(publishApp.punishList[i].comments);
								}
							}else{
								alert(rstl.msg);
							}
						}
					});
				},
				getDutyListByTeamId: function() {
					if(publishApp.publishQ.zdId){
						publishApp.gId=publishApp.publishQ.zdId;
					}else{
						publishApp.gId='';
					}
					initPage();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		initPage();
		loadGroups();
		publishApp.query();
		vueEureka.set("leftPanel", {
			vue: publishApp,
			description: "publish的vue实例"
		});
	};
	
	var initPage = function(){
		 $.get("aa/user/allData?groupId="+publishApp.gId+"&type=MJ", function(r){
				if(r.code == 200){
					publishApp.userList = r.userList;
					if(publishApp.userList){
						var refreshpunisherNo = setInterval(function(){
							$('#punisherNo').selectpicker('refresh');
							var a = $('#punisherNo option').text();
							var arr = $('#ze_ren_qu div li a');
							if(arr.length <=1){
								clearInterval(refreshpunisherNo);
								//$("#punisherNo").selectpicker('val', gid);
							}else{
								var b = arr[1].innerText;
								if(!b){
									clearInterval(refreshpunisherNo);
									return;
								}
								if(a.indexOf(b)>=0){
									clearInterval(refreshpunisherNo);
									//$("#punisherNo").selectpicker('val', gid);
								}
							}
						}, 10);
					}
					publishApp.userList.unshift({userName:'所有'});
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#punisherNo').selectpicker({
							noneSelectedText:'请选择',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				}else{
					alert(r.msg);
				}
			});
		
	}

	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				publishApp.groupList = r.groupList;
				publishApp.groupList.unshift({groupName:'所有'});
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
				});
			}else{
				alert(r.msg);
			}
		});
	}
	
	return {
		show : show,
		hide : hide
	};
})