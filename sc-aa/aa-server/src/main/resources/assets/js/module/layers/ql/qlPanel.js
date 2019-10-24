define(function(require) {
	var htmlStr = require('text!./qlPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(qlParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#ql-panel',
			data: {
				showList: false, //显示查询
				qlQ: {}, //查询参数
				ql: qlParam,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.qlQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.ql = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "jtzt/ql/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.ql = rslt.ql;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				clone: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "jtzt/ql/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="克隆";
								vm.showList = false;
								vm.ql = rslt.ql;
								vm.ql.id='';
								vm.ql.isNewRecord=true;
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
							var url = "jtzt/ql/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.ql),
								success: function(rslt){
									if(rslt.code === 200){
										alert('操作成功', function(index){
											vm.reload();
											//layer.closeAll('page');
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
							url: "jtzt/ql/delete/"+id,
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
							url: "jtzt/ql/purge/"+id,
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
			description: "purePanel的vue实例"
		});
	}
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');

		var postDataTmp = {mc:vm.qlQ.mc};
		$("#jqGrid").jqGrid({
			url: "jtzt/ql/pageData",
			postData: postDataTmp,
			datatype: "json",
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '桥梁名称', name: 'mc', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '桥梁等级', name: 'dj', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '道路', name: 'dl', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属辖区', name: 'ssxq', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '起点', name: 'qd', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '终点', name: 'zd', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			],
			viewrecords: true,
			height: 290,
			rowNum: 15,
			rowList : [15,30,50],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth: false,
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