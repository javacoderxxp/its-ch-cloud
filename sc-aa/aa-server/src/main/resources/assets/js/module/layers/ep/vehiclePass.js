define(function(require) {
	var htmlStr = require('text!./vehiclePass.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	
	var show = function(ep) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#vehiclePass-app',
			data: {
				dataList:[],
				vehiclePassQ:{deviceId:'',startDt: TUtils.formatDateTime(TUtils.setDate(TUtils.addDate(new Date(),-1))), endDt: TUtils.formatDateTime(TUtils.setDate(new Date()))},
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reload: function () {
					loadJqGrid();
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){vm.vehiclePassQ.startDt = $("#startDtQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){vm.vehiclePassQ.endDt = $("#endDtQ").val()}});
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});

		/*require(['datetimepicker'],function(){
			$(".form_datetime").datetimepicker({language: "zh-CN", format: 'yyyy-mm-dd hh:ii:ss', autoclose: true});

			require(['datetimepicker'],function(){
				$('.form_datetime').datetimepicker({
					language: "zh-CN",
					format : "yyyy-mm-dd hh:ii:ss",//日期格式
					autoclose: true,
				}).on('changeDate', function (ev) {
					var startDt = $("#startDtQ").val();
					$("#endDtQ").datetimepicker('setStartDate', startDt);
					var endDt = $("#endDtQ").val();
					$("#startDtQ").datetimepicker('setEndDate', endDt);
				}).on('hide', function (ev) {
					vm.vehiclePassQ.startDt = $("#startDtQ").val();
					vm.vehiclePassQ.endDt = $("#endDtQ").val();
				});
			})
		})*/
		if(ep){
			vm.vehiclePassQ.deviceId = ep.deviceId;
			vm.vehiclePassQ.deviceName = ep.deviceName;
		}
		loadJqGrid();
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "vehiclePass的vue实例"
		});
	}
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');

		var postDataTmp = {deviceId: vm.vehiclePassQ.deviceId, plateNo: vm.vehiclePassQ.plateNo,
				startDt: vm.vehiclePassQ.startDt, endDt: vm.vehiclePassQ.endDt};
		$("#jqGrid").jqGrid({
			url: "video/vehiclePass/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '设备编号', name: 'deviceId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备名称', name: 'deviceName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车牌号', name: 'plateNo', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '抓拍时间', name: 'captureDt', width: 100, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车辆图片', name: 'vehicleImg', width: 40, sortable:false, formatter: function(value, options, row){
					return '<button class="btn btn-success btn-xs" onclick=\'window.open(\"'+value+'\","_blank")\'>车辆</button>';
				}},
				{ label: '车牌图片', name: 'plateImg', width: 40, sortable:false, formatter: function(value, options, row){
					return '<button class="btn btn-info btn-xs" onclick=\'window.open(\"'+value+'\","_blank")\'>车牌</button>';
				}},
				/*{ label: '车速', name: 'speed', width: 60, sortable:false, formatter: function(value, options, row){return value;}},*/
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
				//var x = rowData.latLng.split(',')[0];
				//var y = rowData.latLng.split(',')[1];
				//map.centerAndZoom(new BMap.Point(x,y), 19);
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