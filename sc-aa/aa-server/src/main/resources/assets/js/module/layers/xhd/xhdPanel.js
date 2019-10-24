define(function(require) {
	var htmlStr = require('text!./xhdPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(xhdParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#xhd-panel',
			data: {
				showList: false, //显示查询
				xhdQ: {}, //查询参数
				xhd: xhdParam,
				crossList:[],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.xhdQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.xhd = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "jtss/xhd/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.xhd = rslt.xhd;
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
							var url = "jtss/xhd/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.xhd),
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
							url: "jtss/xhd/delete/"+id,
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
							url: "jtss/xhd/purge/"+id,
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
		loadCrosses();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "xhdPanel的vue实例"
		});
	}

	var loadCrosses = function() {
		$.ajax({
			url: "jcsj/cross/allData",
			success: function(rslt){
				layer.closeAll('loading');
				if(rslt.code == 200){
					vm.crossList = rslt.crossList;
					vm.crossList.unshift({mc:'所有', bh:''});
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('.selectpickerLk').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		$("#jqGrid").jqGrid({
			url: "jtss/xhd/pageData",
			datatype: "json",
			postData: vm.xhdQ,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '编号', name: 'bh', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '名称', name: 'mc', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '路口号', name: 'crossId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '安装方位', name: 'azfw', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '备注', name: 'bz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '杆件编号', name: 'gjbh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '坐标', name: 'zb', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '角度', name: 'jd', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/}
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
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
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