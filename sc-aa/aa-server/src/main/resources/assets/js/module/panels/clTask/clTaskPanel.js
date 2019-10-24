define(function(require) {
	var htmlStr = require('text!./clTaskPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	var chartTmp
	
	var show = function(zxjgTaskParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#zxjgTask-panel',
			data: {
				showList: true, //显示查询
				showStat: false, //显示统计
				showDetail:true, //显示详情
				zxjgTaskQ: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :''),taskType:'',approveStatus:'',startDt:'', endDt:'',overdue:'0'}, //查询参数
				zxjgTask: {},
				task: {},
				groupList:[],
				plateTypeDicts:[],
				nameArray:[],
				valueArray:[],
				value1Array:[],
//				richiValueArray:[],
				chartTitle:'',
				charOpt:{},
				rowds:{}
			},
			methods: {
				query: function () {
					vm.reload();
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.zxjgTask = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					if(vm.rowds.source =="qw"){
						$.ajax({
							url: "qw/zxjgTask/detail/"+id,
							success: function(rslt){
								if(rslt.code == 200){
									vm.title="编辑";
									vm.showList = false;
									vm.showDetail =true;
									vm.zxjgTask = rslt.zxjgTask;
								}else{
									alert(rslt.msg);
								}
							}
						});
					}else{
						$.ajax({
							url: "ytgl/task/detail/"+id,
							success: function(rslt){
								if(rslt.code == 200){
									vm.title="编辑";
									vm.showList = false;
									vm.showDetail =false;
									vm.task = rslt.task;
									//vm.getDutyListByTeamId2();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				save: function () {
					//表单验证
					$("#detailForm").validate({
						invalidHandler : function(){//验证失败的回调
							return false;
						},
						submitHandler : function(){//验证通过的回调
							var url = "qw/zxjgTask/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.zxjgTask),
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
				approve: function (status) {
					vm.zxjgTask.approveStatus = status;
					var url = "qw/zxjgTask/approve";
					$.ajax({
						type: "POST",
						url: url,
						data: JSON.stringify(vm.zxjgTask),
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
				},
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "qw/zxjgTask/purge/"+id,
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
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.zxjgTaskQ.startDt = $("#startDtQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.zxjgTaskQ.endDt = $("#endDtQ").val()}});
				},
				cancelBack:function(){
					vm.showList = true;
					vm.showStat=false;
					reloadJqGrid();
				},
				reload: function () {
					vm.showList = true;
					vm.showStat=false;
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		loadGroups();
		loadPlateTypes();
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "zxjgTaskPanel的vue实例"
		});
	}

	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				vm.teamList =r.groupList;
				vm.groupList = JSON.parse(JSON.stringify(r.groupList));
				vm.groupList.unshift({groupName:'所有'});
			}else{
				alert(r.msg);
			}
		});
	}

	var loadPlateTypes = function() {
	    $.get("sys/dict/getDictList?type=PLATE_TYPE", function(r){
			if(r.code == 200){
				vm.plateTypeDicts = r.dictList;
			}else{
				alert(r.msg);
			}
		});
	};
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = vm.zxjgTaskQ;
		$("#jqGrid").jqGrid({
			url: "qw/zxjgTask/zxjgYtglTaskPageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '标题', name: 'taskTitle', width: 150, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车牌', name: 'plateNo', width: 90, sortable:true},
				{ label: '中队', name: 'groupName', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				/*{ label: '责任区', name: 'gridName', width: 80, sortable:false, formatter: function(value, options, row){return value;}},*/
				{ label: '类型', name: 'taskType', width: 80, sortable:false, formatter: function(value, options, row){
					return getTaskTypeDesc(value);
				}},
				{ label: '来源', name: 'source',  hidden:true },
				{ label: '截止时间', name: 'endDt', width: 140, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '照片', name: 'taskPicCount', width: 40, sortable:false, formatter: function(value, options, row){
					if(value >0){
						return "<a class='gotoCheckPic' data-taskid='"+row.id+"' data-sourceid='"+row.source+"' style='color:red;cursor: pointer;'>"+value+"</a>";
					}else{
						return value;
					}
				}},
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
				$('.gotoCheckPic').bind('click',function(){
					var taskid = $(this).data("taskid");
					if(!taskid || ""==taskid){
						return;
					}
					var sourceid = $(this).data("sourceid");
					var urls="ytgl/task/getPicByTaskId/"+taskid+"/99?rdm="+new Date().getTime();
					if (sourceid=="ytgl"){
						urls="ytgl/task/getPicByTaskId/"+taskid+"/1?rdm="+new Date().getTime();
					}
					$.ajax({
						url: urls,
						success: function(rslt){
							if(rslt.code == 200){
								var tab = [];
								if(rslt.pic && rslt.pic.length>0){
									for (var i = 0; i < rslt.pic.length; i++) {
										var p = rslt.pic[i];
										var tabCont = {};
										tabCont.title = " "+(i+1)+" ";
										tabCont.content = "<img src='"+ctx+"/ytgl/task/getPicByTaskPicId/"+p.id+"'>";
										tab.push(tabCont);
									}
								}
								layer.tab({
								  area: ['800px', '500px'],
								  tab: tab
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				});
			},
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
	        },
			gridComplete:function(){
				if(vm.zxjgTaskQ.overdue  == '1'){
					var ids = $("#jqGrid").getDataIDs();
					for(var i = 0;i<ids.length;i++){
						var rowData = $("#jqGrid").getRowData(ids[i]);
						$('#' + rowData.id).find("td").addClass("SelectRed");
					}
				}
				//隐藏grid底部滚动条
				$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				vm.rowds=rowData;
			}
		});
	};

	var getTaskTypeDesc = function(typeCode) {
		switch (typeCode) {
		case "15GQ":
			return "15次违法未处理（逾期未检）车辆";
			break;
		case "15G":
			return "15次违法未处理（无逾期未检）车辆";
			break;
		case "5G":
			return "5次违法未处理车辆";
			break;
		case "G":
			return "违法未处理重点车辆";
			break;
		case "Q":
			return "未年检重点车辆";
			break;
		case "C":
			return "超一周期未年检车辆";
			break;
		case "0":
			return "长期(源头管理)";
			break;
		case "1":
			return "临时(源头管理)";
			break;
		}
	}
	
	
	var reloadJqGrid = function() {
		var postDataTmp = vm.zxjgTaskQ;
		var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
		$.each(postData, function (k, v) {  
			delete postData[k];
		});
		
		var page = $('#jqGrid').getGridParam('page');
		if(!page){
			page = 1;
		}
		$("#jqGrid").jqGrid('setGridParam',{ 
			postData: postDataTmp,
			page:page
		}).trigger("reloadGrid");
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})