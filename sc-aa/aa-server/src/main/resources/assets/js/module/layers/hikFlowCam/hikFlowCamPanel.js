define(function(require) {
	var htmlStr = require('text!./hikFlowCamPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(hikFlowCamParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#hikFlowCam-panel',
			data: {
				showList: false, //显示查询
				hikFlowCamQ: {}, //查询参数
				hikFlowCam: hikFlowCamParam
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.hikFlowCamQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.hikFlowCam = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "dev/hikFlowCam/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.hikFlowCam = rslt.hikFlowCam;
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
							var url = "dev/hikFlowCam/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.hikFlowCam),
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
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "dev/hikFlowCam/purge/"+id,
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
			description: "hikFlowCamPanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = vm.hikFlowCamQ;
		$("#jqGrid").jqGrid({
			url: "dev/hikFlowCam/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '点位名称', name: 'dwmc', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '方向', name: 'fx', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '相机IP地址', name: 'ip', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '网关', name: 'wg', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '坐标', name: 'shape', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/}
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
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
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