define(function(require) {
	var htmlStr = require('text!./dahuaEpPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(dahuaEpParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#dahuaEp-panel',
			data: {
				showList: false, //显示查询
				dahuaEpQ: {}, //查询参数
				dahuaEp: dahuaEpParam,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.dahuaEpQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.dahuaEp = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "dev/dahuaEp/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.dahuaEp = rslt.dahuaEp;
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
							var url = "dev/dahuaEp/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.dahuaEp),
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
							url: "dev/dahuaEp/delete/"+id,
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
							url: "dev/dahuaEp/purge/"+id,
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
			description: "dahuaEpPanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {id:vm.dahuaEpQ.id};
		$("#jqGrid").jqGrid({
			url: "dev/dahuaEp/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
								{ label: '逻辑主键', name: 'id', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '创建日期', name: 'createDt', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '创建人员', name: 'createBy', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '更新日期', name: 'updateDt', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '更新人员', name: 'updateBy', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '版本', name: 'version', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '删除标记', name: 'delFlag', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备编码', name: 'deviceId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '通道序号', name: 'channelSeq', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备名称', name: 'deviceName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备IP地址', name: 'ipAddress', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '拍摄方向', name: 'psfx', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备所在路口方向', name: 'lkfx', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '类型', name: 'type', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '用途', name: 'usedFor', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '路口号', name: 'crossId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '路段号', name: 'linkId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '空间信息', name: 'shape', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备运行状态', name: 'status', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '描述', name: 'description', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '安装时间', name: 'installDt', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '生产厂家', name: 'manuId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '流量上限阈值', name: 'flowUpperLimit', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '早高峰均值', name: 'morningPeakMean', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '晚高峰均值', name: 'eveningPeakMean', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '白天平峰均值', name: 'dayOffPeakMean', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '夜晚平峰均值', name: 'nightOffPeakMean', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/}
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