define(function(require) {
	var htmlStr = require('text!./hikFlowPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	
	var show = function(hikFlowCam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#hikFlow-panel',
			data: {
				showList: true, //显示查询
				hikFlowQ: {sbip:hikFlowCam.ip,startDt: TUtils.formatDateTime000(new Date()), endDt: TUtils.formatDate(new Date())+" 23:59:59",}, //查询参数
//				hikFlowQ: {sbip:hikFlowCam.ip,startDt: "2018-11-09 00:00:00", endDt: "2018-11-09 23:59:59"}, //查询参数
				hikFlow: {},
				hikFlowCam:hikFlowCam,
				hikFlowCamList:[],
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.hikFlowQ = {};
				},
				reload: function () {
					vm.showList = true;
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.hikFlowQ.startDt = $("#startDtQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.hikFlowQ.endDt = $("#endDtQ").val()}});
				}
			}
		});
		loadHikCamList();
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "hikFlowPanel的vue实例"
		});
	}

    
	var loadHikCamList = function() {
	    $.get("dev/hikFlowCam/allData", function(r){
			if(r.code == 200){
				vm.hikFlowCamList = r.hikFlowCamList;
			}else{
				alert(r.msg);
			}
		});
	};
    
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = vm.hikFlowQ;
		$("#jqGrid").jqGrid({
//			url: "http://localhost:8700/sc-videoGateway/video/hikFlow/pageData",
			url: "http://192.168.14.4:8700/sc-videoGateway/video/hikFlow/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: 'IP', name: 'sbip', width:60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车道', name: 'cdh', width: 40, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '统计时刻', name: 'kssj', width: 140, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '时长', name: 'tjsj', width: 40, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '速度', name: 'sd', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车头时距', name: 'ctsj', width: 70, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车头间距', name: 'ctjj', width: 70, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '流量(小/中/大)', name: 'xxc', width: 100, sortable:false, formatter: function(value, options, row){
					return parseInt(row.xxc)+parseInt(row.zxc)+parseInt(row.dxc)+"("+row.xxc+"/"+row.zxc+"/"+row.dxc+")";
				}},
			],
			viewrecords: true,
			height: 290,
			rowNum: 15,
			rowList : [15,30,50],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth:true,
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
				var queryList = data.page.list;
			},
			gridComplete:function(){
				//隐藏grid底部滚动条
				$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
			}
		});
	};
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})