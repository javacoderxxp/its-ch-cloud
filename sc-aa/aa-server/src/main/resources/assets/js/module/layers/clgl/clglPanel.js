define(function(require) {
	var htmlStr = require('text!./clglPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(clglParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#clgl-panel',
			data: {
				showList: false, //显示查询
				clglQ: {}, //查询参数
				clgl: clglParam
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.clglQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.clgl = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "qw/clgl/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.clgl = rslt.clgl;
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
							var url = "qw/clgl/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.clgl),
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
							url: "qw/clgl/delete/"+id,
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
							url: "qw/clgl/purge/"+id,
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
			description: "clglPanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {id:vm.clglQ.id};
		$("#jqGrid").jqGrid({
			url: "qw/clgl/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
								{ label: '逻辑主键', name: 'id', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '自动编号', name: 'xh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '号牌种类', name: 'hpzl', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '号牌号码', name: 'hphm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '处理序号', name: 'clxh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '强制报废日期', name: 'qzbfqz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '报修日期', name: 'bxzzrq', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '查收', name: 'bpcs', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '备注', name: 'bzcs', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '处理', name: 'clly', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '有效期止', name: 'yxqz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所有人', name: 'syr', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '住所详细地址', name: 'zsxxdz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '住址详细地址', name: 'zzxxdz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '手机号码', name: 'sjhm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车辆状态', name: 'zt', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '初次登记日期', name: 'ccdjrq', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属中队', name: 'groupId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属责任区', name: 'gridId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '点位', name: 'point', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/}
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