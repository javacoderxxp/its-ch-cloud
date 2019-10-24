define(function(require) {
	var htmlStr = require('text!./notifyPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var notifyPanelApp = null;
	var ctrlPanelApp = vueEureka.get("ctrlPanelApp");
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		notifyPanelApp = new Vue({
			el: '#pure-panel',
			data: {
				showNotifyType: '1',
				newNotifyList:  [],
				unProcessNotifyList: [],
				processedNotifyList: [],
			},
			methods: {
				loadMsgs: function(status) {
					$.get("sys/notify/allData?status="+status,function(rslt){
						if(rslt.notifyList){
							switch (status) {
							case '1':
								notifyPanelApp.showNotifyType = status;
								notifyPanelApp.newNotifyList = rslt.notifyList;
								
								$('#notifyBtnRead').removeClass('btn-primary');
								$('#notifyBtnFinish').removeClass('btn-primary');
								$('#notifyBtnNew').addClass('btn-primary');
								break;
							case '2':
								notifyPanelApp.showNotifyType = status;
								notifyPanelApp.unProcessNotifyList = rslt.notifyList;
								
								$('#notifyBtnNew').removeClass('btn-primary');
								$('#notifyBtnFinish').removeClass('btn-primary');
								$('#notifyBtnRead').addClass('btn-primary');
								break;
							case '3':
								notifyPanelApp.showNotifyType = status;
								notifyPanelApp.processedNotifyList = rslt.notifyList;
								
								$('#notifyBtnRead').removeClass('btn-primary');
								$('#notifyBtnNew').removeClass('btn-primary');
								$('#notifyBtnFinish').addClass('btn-primary');
								break;
							default:
								break;
							}
						}
					});
				},
				loadMsgsCnt: function(status) {//只显示数量，不高亮显示，不切换tab
					$.get("sys/notify/allData?status="+status,function(rslt){
						if(rslt.notifyList){
							switch (status) {
							case '1':
//								notifyPanelApp.newNotifyList = rslt.notifyList;
								break;
							case '2':
								notifyPanelApp.unProcessNotifyList = rslt.notifyList;
								break;
							case '3':
								notifyPanelApp.processedNotifyList = rslt.notifyList;
								break;
							default:
								break;
							}
						}
					});
				},
				readOrProcess: function(notifyId, status) {
					$.ajax({
						type: "POST",
					    url: "sys/notify/readOrProcess?notifyId="+notifyId+"&status="+status,
					    success: function(rslt){
							if(rslt.code == 200){
//								notifyPanelApp.loadMsgs('1');
//								notifyPanelApp.loadMsgsCnt('1');
								notifyPanelApp.loadMsgsCnt('2');
								notifyPanelApp.loadMsgsCnt('3');
								if(status == '2'){
								}else{
									alert('已处理');
								}
							}else{
							}
						}
					});
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		notifyPanelApp.loadMsgs('1');
		notifyPanelApp.loadMsgsCnt('2');
		notifyPanelApp.loadMsgsCnt('3');
		
		vueEureka.set("leftPanel", {
			vue: notifyPanelApp,
			description: ""
		});
	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})