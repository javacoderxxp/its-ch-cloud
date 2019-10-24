define(function(require) {
	var htmlStr = require('text!./signalingPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(signalingParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#signaling-panel',
			data: {
				showList: false, //显示查询
				signalingQ: {}, //查询参数
				signaling: signalingParam
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.signalingQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.signaling = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "phone/signaling/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.signaling = rslt.signaling;
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
							var url = "phone/signaling/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.signaling),
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
							url: "phone/signaling/delete/"+id,
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
							url: "phone/signaling/purge/"+id,
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
			description: "signalingPanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {id:vm.signalingQ.id};
		$("#jqGrid").jqGrid({
			url: "phone/signaling/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
								{ label: '逻辑主键', name: 'id', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '创建日期', name: 'createDt', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '创建者', name: 'createBy', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '更新日期', name: 'updateDt', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '更新者', name: 'updateBy', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '版本', name: 'version', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '删除标记 ', name: 'delFlag', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '路段编号', name: 'roadSegId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '状态', name: 'state', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '描述', name: 'description', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '开始时间', name: 'dateTime', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '起点', name: 'startPoint', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '终点', name: 'endPoint', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/}
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