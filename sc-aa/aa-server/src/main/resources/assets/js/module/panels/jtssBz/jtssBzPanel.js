define(function(require) {
	var htmlStr = require('text!./jtssBzPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#jtss-panel',
			data: {
				showList: true, //显示查询
				bzList:[],
				coutss:0,
				groupListQ:[]
			},
			methods: {
				query: function (groupId) {
					loadJqGrid(groupId);
					$("#editB").show();
				},
				reset: function () {
					vm.clglQ = {};
				},
				reload: function () {
					loadJqGrid('');
					$("#editB").hide();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				},
			}
		});
		loadJqGrid('');
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "jtssBzPanel的vue实例"
		});
	}
	
	var loadJqGrid = function(groupId) {
		$.ajax({
		    url: "./jtss/bz/getJtssBzCount",
		    data: {"groupId" : groupId},
		    success: function(rslt){
				if(rslt.code == 200){
					vm.coutss=0;
					vm.bzList = rslt.bzList;
					for(var i=0;i<vm.bzList.length;i++){
						vm.coutss=parseInt(vm.coutss)+parseInt(vm.bzList[i].couts);
					}
				}else{
					alert(rslt.msg);
				}
			}
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