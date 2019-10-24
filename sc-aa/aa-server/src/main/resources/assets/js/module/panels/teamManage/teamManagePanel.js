define(function(require) {
	var htmlStr = require('text!./teamManagePanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var brush = require('brush');
	var moment = require('moment');
	var fullcalendar = require('fullcalendar');
	var fullcalendarZh = require('fullcalendarZh');
	require('jqueryUI');
	var vm = null;
	var oldQ='1';
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#teamManage-panel',
			data: {
				currStep : 1,
				showList: -1 , //显示查询
				currentUser: currentUser,
				team:{isNewRecord:true,  groupId:(currentUser.jjzdUser? currentUser.group.groupId :'')},
				teamQ:{},
				groupList:[], //中队列表
				groupUserList:[], //中队内部的用户列表
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0,
				teamArrange:{groupId:(currentUser.jjzdUser? currentUser.group.groupId :''),"startYearMonth": TUtils.getMonth1stDay(2)},
				teamList:[],
				teamQuery:{groupId:(currentUser.jjzdUser? currentUser.group.groupId :''),"startYearMonth": TUtils.getMonth1stDay(2)},
				queryteamList:[],
				currentGroupId : null,
				currentYearMonth : null,
				queryZbb:false,
				todayScheduleList:[]
			},
			watch:{
				groupUserList :'loadGroupUserListUi',
				'team.groupId' : {
					deep : true,
					handler : function(val, oldVal) {
						vm.loadUsersByGroup();
					}
				},
				currStep:'sortBz',
			},
			methods: {
				loadGroupUserListUi: function () {
					$('.selectpickerU').selectpicker('destroy');
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('.selectpickerU').selectpicker({
							noneSelectedText:'请选择一个用户',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						if(vm.team.userIds && vm.team.userIds.length>0){//编辑的时候
							var userIds = vm.team.userIds.split(',');
							$("#userIds").selectpicker('val', userIds);
						}
					});
				},
				query: function() {
					vm.reload();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				},
				add: function(){
					vm.title="新增";
					vm.showList = 0;
					if(currentUser.jjzdUser){
						var userUrl = "aa/user/findAvaliableTeamGroupUsers?groupId="+currentUser.group.groupId+"&teamId="+vm.team.teamId;
						$.get(userUrl, function(r){
							if(r.code == 200){
								vm.groupUserList = r.userList;
							}else{
								alert(r.msg);
							}
						});
					} else{
						$("#groupId").change(function(){
							var userUrl = "aa/user/findAvaliableTeamGroupUsers?groupId="+$("#groupId").val()+"&teamId="+vm.team.teamId;
							$.get(userUrl, function(r){
								if(r.code == 200){
									vm.groupUserList = r.userList;
								}else{
									alert(r.msg);
								}
							});
						});
					}
				},
				edit:function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
					    url: "qw/team/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								vm.showList = 0;
								vm.team = rslt.team;
								$("#groupId").selectpicker('val', vm.team.groupId);
								if(vm.team.userIds && vm.team.userIds.length>0){//编辑的时候
									var userIds = vm.team.userIds.split(',');
									$("#userIds").selectpicker('val', userIds[0]);
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
					if(currentUser.jjddUser){
						vm.team.groupId = $("#groupId").val();
					} else if(currentUser.jjzdUser){
						vm.team.groupId = vm.currentUser.group.groupId;
					}
				    //表单验证
				    $("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							vm.team.userIds = $("#userIds").val().toString();
							var url = "qw/team/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(vm.team),
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
				purge:function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
						    url: "qw/team/purge/"+id,
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
					});
				},
				clear: function () {
					vm.team = {isNewRecord:true,  group:{groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')}, userIds:[]};
					$("#groupId").selectpicker('val', '');
					$('.selectpickerU').selectpicker('destroy');
				},
				reload: function () {
					vm.showList = -1;
					vm.clear();
					
					if(TUtils.cmp(vm.teamQ.groupId,oldQ)){
						var postDataTmp = {'groupId': vm.teamQ.groupId};
						oldQ = vm.teamQ.groupId;
						var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
						$.each(postData, function (k, v) {  
							delete postData[k];
						});
						//var page = $("#jqGrid").jqGrid('getGridParam','page');
						var page = $('#jqGrid').getGridParam('page');
						if(!page){
							page = 1;
						}
						$("#jqGrid").jqGrid('setGridParam',{ 
							postData: postDataTmp,
							page:page
						}).trigger("reloadGrid");
					}else{
						loadJqGrid();
					}
					
					this.currentGroupId = null;
					this.currentYearMonth = null;
					this.queryZbb = false;
				},
				loadUsersByGroup : function() {
					if(!vm.team.groupId){
						vm.groupUserList = [];
					}else{
						var userUrl = "aa/user/findAvaliableTeamGroupUsers?groupId="+vm.team.groupId+"&teamId="+vm.team.teamId;
						$.get(userUrl, function(r){
							if(r.code == 200){
								vm.groupUserList = r.userList;
							}else{
								alert(r.msg);
							}
						});
					}
				},
				arrange:function(){
					vm.showList = 1;
					vm.currStep = 1;
					$("#scheduleConfigPanel .carousel").carousel(0);
					$("#scheduleConfigPanel .step li.active").removeClass("active");
					$("#scheduleConfigPanel .step li").first().addClass("active");
				},
				goStep : function(direction) {
					if(vm.currStep <1 || vm.currStep> 3){
						return;
					}
					if(vm.currStep == 1){
						//校验是否有排班表存在
						var url = "qw/teamSchedule/checkSchedule?groupId="+vm.teamArrange.groupId+"&startYearMonth="+vm.teamArrange.startYearMonth;
						$.ajax({
						    url: url,
							type: "POST",
						    success: function(rslt){
								if(rslt.code == 200){
									if(direction == 'P'){
										vm.currStep --;
										$("#scheduleConfigPanel .carousel").carousel('prev');
										$("#scheduleConfigPanel .step li.active").last().removeClass("active");
									}else{
										vm.loadTeam();
										vm.currStep ++;
										$("#scheduleConfigPanel .carousel").carousel('next');
										$("#scheduleConfigPanel .step li.active").next().addClass("active");
									}
								}else{
									alert(rslt.msg);
								}
							}
						});
					}else{
						if(direction == 'P'){
							vm.currStep --;
							$("#scheduleConfigPanel .carousel").carousel('prev');
							$("#scheduleConfigPanel .step li.active").last().removeClass("active");
						}else{
							vm.currStep ++;
							$("#scheduleConfigPanel .carousel").carousel('next');
							$("#scheduleConfigPanel .step li.active").next().addClass("active");
						}
					}
				},
				loadTeam:function(){
					var url = "qw/team/getTeamsByGroup?groupId="+vm.teamArrange.groupId;
					$.ajax({
					    url: url,
						type: "GET",
					    success: function(rslt){
							if(rslt.code == 200){
								if(rslt.teamList && rslt.teamList.length>0){
									vm.teamList = rslt.teamList;
									var currentStep = vm.currStep;
								}else{
									alert("["+vm.teamArrange.groupId+"]"+": 该中队尚未完成班组划分，请先划分班组!");
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				sortBz:function(val,oldVal){
					if(val == 2){
						setTimeout(function() {
							require(['jqueryUI'],function(){
								$("#bzTable tbody").sortable({ 
									placeholder: "ui-state-highlight",
									start : function(e, ui) {
										ui.helper.css({
											"background" : "#fff"
										});
										return ui;
									},
									stop : function(e, ui) {
										return ui;
									}
								}).disableSelection();
							});
						}, 1000);
					}
					if(val == 3){
						setTimeout(function() {
							require(['jqueryUI'],function(){
								$(".teanNameDrag").each(function(){
									var title = $(this).text();
									$(this).data('eventObject', {title:title,teamId:$(this).data("teamid")});
									$(this).draggable({
							          zIndex: 99999,
							          helper: "clone",
							          revert: true, // will cause the event to go back to its
							          revertDuration: 0  //  original position after the drag
							        });
								});
							});
						}, 1000);
					}
				},
				setTeamJoin:function(team, isJoin){
					team.joinArrange = isJoin;
				},
				generate : function() {
					//检查至少有一个人排班可以参与排班
					var total = 0;
					for(x=0; x< vm.teamList.length; x++){
						if(vm.teamList[x].joinArrange){
							total ++;
						}
					}
					if(total==0){
						alert('至少有一个班组参与排班');
						return;
					}
					
					var arr = [];
					$("#bzTable tbody tr").each(function() {
	                    var ind = $(this).data("index");
	                    arr.push(vm.teamList[ind]);
	                })
	                vm.teamList = arr;
					
					var url = "qw/teamSchedule/generateSchedule?groupId=" + vm.teamArrange.groupId
						+"&startYearMonth=" + vm.teamArrange.startYearMonth;
					$.ajax({
						url : url,
						type : "POST",
						data: JSON.stringify(vm.teamList),
						success : function(rslt) {
							if (rslt.code == 200) {
								vm.dutyTaskList = rslt.scheduleList;
								vm.currStep++;
								$("#scheduleConfigPanel .carousel").carousel('next');
								$("#scheduleConfigPanel .step li.active").next().addClass("active");
								$('#calendarPreview').fullCalendar('destroy');
								var defaultDate = vm.teamArrange.startYearMonth + '-01';
								var fullCalendar = $('#calendarPreview').fullCalendar({
										header : {
											left : '',
											center : 'title',
											right : ''
										},
										defaultDate : defaultDate,
										eventLimit: 2, 
										editable: true,
										droppable: true, // this allows things to be dropped onto the calendar !!!
										events : JSON.parse(JSON.stringify(vm.dutyTaskList)),
										eventClick : function(event, jsEvent, view) {// 单击事件项时触发
											confirm('确定删除？', function(){
												 $('#calendarPreview').fullCalendar('removeEvents', event.id);
												 layer.closeAll();
											});
										},
										eventDrop : function(event, dayDelta, minuteDelta, allDay, revertFunc,
												jsEvent, ui, view) {
											// 只按天分
											var mday = dayDelta.days();// 与当前日期相比，移动的天数，可以是负值
											var d = new Date(event.start.format("YYYY-MM-DD HH:mm:ss"))
											var t = TUtils.formatDateTime(event.start._d).replace(" ","T");
											event.start._i = t;
											event._start._i = t;
										},
										drop: function (date, allDay) { // this function is called when something is dropped
									        var originalEventObject = $(this).data('eventObject');
									        var copiedEventObject = $.extend({}, originalEventObject);
									        var thatday = TUtils.formatDate(date._d).replace(/-/g,"");
									        copiedEventObject.id = copiedEventObject.teamId+"_"+thatday;
									        copiedEventObject.start = copiedEventObject._start = date._d;
									        copiedEventObject.start._i = TUtils.formatDateTime000(date._d).replace(" ","T");;
									        copiedEventObject._start._i = TUtils.formatDateTime000(date._d).replace(" ","T");;
									        copiedEventObject.allDay = true;
									        copiedEventObject.backgroundColor = $(this).css("background-color");
									        copiedEventObject.borderColor = $(this).css("border-color");
									        $('#calendarPreview').fullCalendar('renderEvent', copiedEventObject, true);
									      }});
							} else {
								alert(rslt.msg);
							}
						}
					});
				},
				finish : function() {
					//获取客户端事件集
					var c_events = $('#calendarPreview').fullCalendar('clientEvents');
					var dataArray = [];
					if(c_events){
						for(var x =0; x < c_events.length; x++){
							var data = {'id': c_events[x].id, 'title': c_events[x].title, 'allDay': c_events[x].allDay,'teamId':c_events[x].teamId};
							if(c_events[x].start){
								var d = c_events[x].start._i;
								if(d instanceof Date){
									data.start=d._i;
								}else{
									data.start=d;
								}
							}
							if(c_events[x].end){
								data.end=c_events[x].end._i;
							}
							dataArray.push(data);
						}
					}
					for(var i = 0; i< dataArray.length; i++){
						var data = dataArray[i];
						for(var j = i+1; j< dataArray.length; j++){
							var origin = dataArray[j];
							if(data.start == origin.start){
								alert("每天只允许一个班组参与排班！");
								return;
							}
						}
					}
					var url = "qw/teamSchedule/saveSchedule?groupId=" + vm.teamArrange.groupId;
					$.ajax({
						url : url,
						type : "POST",
						data: JSON.stringify(dataArray),
						success : function(rslt) {
							if (rslt.code == 200) {
								layer.msg("保存成功");
								vm.reload();
							} else {
								alert(rslt.msg);
							}
						}
					});
				},
				showCalendar: function() {
					this.showList = 2;
					$("#calendarFinal").fullCalendar('destroy');
				},
				teamQueryConfirm:function(){
					if(!vm.teamQuery.groupId || ''==vm.teamQuery.groupId){
						alert('请选择一个中队');
						return;
					}
					if(!vm.teamQuery.startYearMonth || ''==vm.teamQuery.startYearMonth){
						alert('请选择一个月份');
						return;
					}
					$.ajax({
					    url: "qw/teamSchedule/allDutyTask?groupId="+vm.teamQuery.groupId+"&startYearMonth="+vm.teamQuery.startYearMonth,
					    success: function(rslt){
					    	vm.queryZbb = true;
							if(rslt.code == 200 && rslt.dutyTaskList){
								$('#calendarFinal').fullCalendar( 'destroy');
								var defaultDate =vm.teamQuery.startYearMonth+'-01';
								var fullCalendar = $('#calendarFinal').fullCalendar({
									header: {
										left: '',
										center: 'title',
										right: ''
									},
									defaultDate: defaultDate,
									editable: false,
									eventLimit: 2, 
									events: rslt.dutyTaskList,
								});
								vm.queryteamList = rslt.teamList;
								vm.currentGroupId = vm.teamQuery.groupId;
								vm.currentYearMonth = vm.teamQuery.startYearMonth;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				teamScheduleDelete:function(){
					if(!vm.currentGroupId || !vm.currentYearMonth){
						return;
					}
					confirm('确定删除？', function(){
						$.ajax({
							url: "qw/teamSchedule/deleteSchedule?groupId="+vm.currentGroupId+"&startYearMonth="+vm.currentYearMonth,
							type: "POST",
							success: function(rslt){
								if(rslt.code == 200){
									alert('排班表已删除！');
									vm.reload();
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				todayDuty:function(){
					$.ajax({
					    url: "qw/teamSchedule/findTodayList",
					    success: function(rslt){
							if(rslt.code == 200){
								if(rslt.todayScheduleList){
									vm.todayScheduleList = rslt.todayScheduleList;
									vm.showList = 3;
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
				}
				
			}
		});
		oldQ=1;
		initStep();
		loadGroups();
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "purePanel的vue实例"
		});
	}
	
	var initStep = function(){
		$('#scheduleConfigModal').modal('show');
	    
	    $("#scheduleConfigModal .modal-footer button").each(function () {
	        $(this).click(function () {
	            if ($(this).hasClass("MN-next")) {
	                $("#scheduleConfigModal .carousel").carousel('next');
	                $("#scheduleConfigModal .step li.active").next().addClass("active");
	            } else {
	                $("#scheduleConfigModal .carousel").carousel('prev');
	                if ($("#scheduleConfigModal .step li").length > 1) {
	                    $($($("#scheduleConfigModal .step li.active"))[$("#scheduleConfigModal .step li.active").length - 1]).removeClass("active")
	                }
	            }
	        })
	    });
		require(['datetimepicker'],function(){
			$('#startYearMonth').datetimepicker({
				language: "zh-CN",
		    	minView: 3,
		    	maxView: 4,
		    	startView: 3,
				format : "yyyy-mm",//格式
				autoclose: true,
			}).on('hide', function (ev) {
				vm.teamArrange.startYearMonth = $("#startYearMonth").val();
			});
			$('#startYearMonthQ').datetimepicker({
				language: "zh-CN",
		    	minView: 3,
		    	maxView: 4,
		    	startView: 3,
				format : "yyyy-mm",//格式
				autoclose: true,
			}).on('hide', function (ev) {
				vm.teamQuery.startYearMonth = $("#startYearMonthQ").val();
			});
		})
		
	}
	
	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				if(currentUser.jjddUser){
					vm.groupList = r.groupList;
					vm.groupList.unshift({groupName:'所有'});
				}else if(currentUser.jjzdUser){
					vm.groupList.push(currentUser.group);
				}
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('.selectpicker').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
					$('.selectpickerU').selectpicker({
						noneSelectedText:'请选择一个用户',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
				});
			}else{
				alert(r.msg);
			}
		});
	};
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		if(currentUser.jjzdUser){
			vm.teamQ.groupId = vm.currentUser.group.groupId;
		}
		var postDataTmp = {'groupId': vm.teamQ.groupId};
		oldQ = vm.teamQ.groupId;
		 $("#jqGrid").jqGrid({
		        url: "qw/team/pageData",
		        datatype: "json",
		        postData: postDataTmp,
		        colModel: [
		        	{ label: 'id', name: 'id', width: 1, key: true, hidden:true },
		        	{ label: '所属中队', name: 'groupName', width: 100, sortable:false, formatter: function(value, options, row){return value;}},
					{ label: '班组编号', name: 'teamId', width: 120, sortable:false, formatter: function(value, options, row){return value;}},
					{ label: '班组名称', name: 'teamName', width: 100, sortable:true, formatter: function(value, options, row){return value;}},
					{ label: '警员', name: 'userNames', width: 300, sortable:true, formatter: function(value, options, row){return value;}}
		        ],
				viewrecords: true,
		        height: 260,
		        rowNum: 10,
				rowList : [10,30,50],
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
		            layer.msg("加载完毕");
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
//		var postDataTmp = {};
//	        postData: postDataTmp,
	};
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})