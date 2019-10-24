define(function(require) {
	var htmlStr = require('text!./noticePanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#notice-panel',
			data: {
				showList: true, //显示查询
				noticeQ:{startDt: TUtils.formatDateTime000(new Date()), endDt: TUtils.formatDate(new Date())+" 23:59:59"},
				notice: {}
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.noticeQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.notice = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "jw/notice/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.notice = rslt.notice;
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
							var url = "jw/notice/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.notice),
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
							url: "jw/notice/delete/"+id,
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
							url: "jw/notice/purge/"+id,
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
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.noticeQ.startDt = $("#startDtQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.noticeQ.endDt = $("#endDtQ").val()}});
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
			description: "noticePanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = vm.noticeQ;
		$("#jqGrid").jqGrid({
			url: "jw/notice/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '通知标题', name: 'title', width: 60, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '通知时间', name: 'publishDt', width: 140, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '发布者', name: 'publisher', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '通知内容', name: 'content', width: 300, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '图片数', name: 'pictureCount', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '通知对象', name: 'policesNos', width: 120, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			],
			viewrecords: true,
			height: 290,
			rowNum: 15,
			rowList : [15,30,50],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth:false,
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