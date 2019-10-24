define(function(require) {
	var htmlStr = require('text!./lzdwPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(lzdwParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#lzdw-panel',
			data: {
				showList: false, //显示查询
				lzdwQ: {}, //查询参数
				lzdw: lzdwParam,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.lzdwQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.lzdw = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "jtzt/lzdw/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.lzdw = rslt.lzdw;
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
							var url = "jtzt/lzdw/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.lzdw),
								success: function(rslt){
									if(rslt.code === 200){
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
							url: "jtzt/lzdw/delete/"+id,
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
							url: "jtzt/lzdw/purge/"+id,
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
				reload: function (event) {
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
			description: "lzdwPanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {mc:vm.lzdwQ.mc};
		$("#jqGrid").jqGrid({
			url: "jtzt/lzdw/pageData",
			datatype: "json",
	        postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				//{ label: '编号', name: 'bh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '名称', name: 'mc', width: 135, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '拼音代码', name: 'pydm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '地址', name: 'dz', width: 130, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '主要负责人', name: 'zyfzr', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '联系电话', name: 'lxdh', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '单位传真', name: 'dwcz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '主管单位', name: 'zgdw', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '实景图片', name: 'sjtp', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '备注', name: 'bz', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '坐标', name: 'zb', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/}
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
			ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
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