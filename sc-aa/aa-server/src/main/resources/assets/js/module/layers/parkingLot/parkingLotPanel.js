define(function(require) {
	var htmlStr = require('text!./parkingLotPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(parkingLotParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#parkingLot-panel',
			data: {
				showList: false, //显示查询
				parkingLotQ: {}, //查询参数
				parkingLot: parkingLotParam
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.parkingLotQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.parkingLot = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "jcsj/parkingLot/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.parkingLot = rslt.parkingLot;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
					//表单验证
					$("#detailForm").validate({
						invalidHandler : function(){//验证失败的回调
							return false;
						},
						submitHandler : function(){//验证通过的回调
							var url = "jcsj/parkingLot/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.parkingLot),
								success: function(rslt){
									if(rslt.code == 200){
										alert('操作成功', function(index){
											vm.reload();
										});
									}else{
										alert(rslt.msg);
									}
								}
							});
							return false;//已经用AJAX提交了，需要阻止表单提交
						}
					});
				},
				del: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除(使失效)？', function(){
						$.ajax({
							type: "POST",
							url: "jcsj/parkingLot/delete/"+id,
							success: function(rslt){
								if(rslt.code == 200){
									alert('操作成功', function(index){
										$("#jqGrid").trigger("reloadGrid");
									});
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "jcsj/parkingLot/purge/"+id,
							success: function(rslt){
								if(rslt.code == 200){
									alert('操作成功', function(index){
										$("#jqGrid").trigger("reloadGrid");
									});
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				reload: function () {
					vm.showList = true;
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "parkingLotPanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {parkCode:vm.parkingLotQ.parkCode, parkName:vm.parkingLotQ.parkName};
		$("#jqGrid").jqGrid({
			url: "jcsj/parkingLot/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '编号', name: 'parkCode', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '名称', name: 'parkName', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '总泊位', name: 'parkCapacity', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '剩余泊位', name: 'seatIdle', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所在道路', name: 'szdl', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '是否收费', name: 'sfsf', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '面积', name: 'mj', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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