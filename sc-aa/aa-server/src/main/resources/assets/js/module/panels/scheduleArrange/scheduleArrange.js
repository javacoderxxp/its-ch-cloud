define(function(require) {
	var htmlStr = require('text!./scheduleArrange.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var brush = require('brush');
	var moment = require('moment');
	var fullcalendar = require('fullcalendar');
	var fullcalendarZh = require('fullcalendarZh');
	var vm = null;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#scheduleArrange-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			data: {
				showList: 0,
				currentUser: currentUser,
				showRestDay: false,
				groupList :[],
				dutyScheduleQ:{groupId: (currentUser.jjzdUser? currentUser.group.groupId :''), yearMonth:TUtils.getMonth1stDay(1), userId:'', userName:''},
				currStep : 1,
				groupList :[], 
				group: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :'sfzd')},
				groupUserList :[], 
				dutyPerDate: 2,
				startYearMonth: TUtils.getMonth1stDay(2),
				dutyTaskList:[],
				dutyRestList:[],
				todayScheduleList: [],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			watch : {
				'group':{
					deep: true,
					handler : function(val, oldVal) {
						vm.loadUsersByGroup();
					}
				}
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#perteam').selectpicker({
							noneSelectedText:'请选择一个中队',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				query: function() {
					vm.reload();
				},
				execute: function() {
					vm.showList = 1;
					vm.currStep = 1;
					$("#scheduleConfigPanel .carousel").carousel(0);
					$("#scheduleConfigPanel .step li.active").removeClass("active");
					$("#scheduleConfigPanel .step li").first().addClass("active");
				},
				init : function() {
					vm.loadUsersByGroup();
				},
				goStep : function(direction) {
					if(vm.currStep <1 || vm.currStep> 3){
						return;
					}
					
					if(vm.currStep == 1){
						//校验是否有排班表存在
						var url = "qw/dutySchedule/checkSchedule?groupId="+vm.group.groupId+"&startYearMonth="+vm.startYearMonth;
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
				loadUsersByGroup : function() {
					var userUrl = "aa/user/allData?groupId="+vm.group.groupId;
					$.get(userUrl, function(r){
						if(r.code == 200){
							vm.groupUserList = r.userList;
						}else{
							alert(r.msg);
						}
					});
				},
				banUser : function(userId, dutyExclude) {
					var banUserUrl = "qw/dutySchedule/banUser";
					var banUserData = {'userId': userId, 'dutyExclude': dutyExclude};
				    $.ajax({
					    url: banUserUrl,
						type: "POST",
					    data: JSON.stringify(banUserData),
					    success: function(rslt){
							if(rslt.code == 200){
								vm.loadUsersByGroup();
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				banDate : function(userId) {
					vm.showRestDay = true;
				    $.get("qw/dutyRest/allData?userId="+userId, function(r){
						if(r.code == 200){
							vm.dutyRestList = r.dutyRestList;
						}else{
							alert(r.msg);
						}
					});
					/*layer.open({
						type: 1,
						skin: 'layui-layer',
						title: "选择休息日",
						area: ['460px', '240px'],
						shade: false,
						content: jQuery("#banDateDiv"),
						btn: ['确定','取消'],
						btn1: function (index) {
							
						}
					});*/
				},
				backToUserList : function(userId) {
					vm.showRestDay = false;
				},
				generate : function() {
					//检查至少有一个人排班可以参与排班
					var total = 0;
					for(x=0; x< vm.groupUserList.length; x++){
						if(vm.groupUserList[x].dutyExclude == 0){
							total ++;
						}
					}
					if(total==0){
						alert('至少有一名警员参与排班');
						return;
					}else if(total < vm.dutyPerDate){
						alert('警员人数少于每日最低人数要求');
						return;
					}
				
					var url = "qw/dutySchedule/generateSchedule?groupId=" + vm.group.groupId + "&dutyPerDate="
							+ vm.dutyPerDate + "&startYearMonth=" + vm.startYearMonth;
					$.ajax({
						url : url,
						type : "POST",
						success : function(rslt) {
							if (rslt.code == 200) {
								vm.dutyTaskList = rslt.dutyTaskList;
								vm.currStep++;
								$("#scheduleConfigPanel .carousel").carousel('next');
								$("#scheduleConfigPanel .step li.active").next().addClass("active");
								$('#calendarPreview').fullCalendar('destroy');
								var defaultDate = vm.startYearMonth + '-01';
								var fullCalendar = $('#calendarPreview').fullCalendar({
										header : {
											left : '',
											center : 'title',
											right : ''
										},
										defaultDate : defaultDate,
										editable : true,
										eventLimit: 2, 
										events : JSON.parse(JSON.stringify(vm.dutyTaskList)),
										eventClick : function(event, jsEvent, view) {// 单击事件项时触发
//											alert(event.id + "~" + event.title);
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
//											d.setTime(d.getTime() + (mday+1) * 24 * 60 * 60 * 1000); //不需要重新设置事件时间
											var t = TUtils.formatDateTime(event.start._d).replace(" ","T");
											event.start._i = t;
											event._start._i = t;
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
//					var c_events = dataSources[0].events;

					var dataArray = [];
					if(c_events){
						for(var x =0; x < c_events.length; x++){
							var data = {'id': c_events[x].id, 'title': c_events[x].title, 'allDay': c_events[x].allDay};
							if(c_events[x].start){
								data.start=c_events[x].start._i;
							}
							if(c_events[x].end){
								data.end=c_events[x].end._i;
							}
							dataArray.push(data);
						}
					}

					var url = "qw/dutySchedule/saveDutyTasks?groupId="+vm.group.groupId;
					$.ajax({
					    url: url,
						type: "POST",
					    data: JSON.stringify(dataArray),
					    success: function(rslt){
							if(rslt.code == 200){
								//alert('保存成功');
								vm.currStep = 1;
								$("#scheduleConfigPanel .carousel").carousel(0);
								$("#scheduleConfigPanel .step li.active").removeClass("active");
								layer.msg("排班已完成！");
								vm.reload();
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				deleteSchedule: function() {
					confirm('确定删除？', function(){
						$.ajax({
							url: "qw/dutySchedule/deleteSchedule?groupId="+vm.dutyScheduleQ.groupId+"&yearMonth="+vm.dutyScheduleQ.yearMonth,
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
				showCalendar: function() {
					if(!vm.dutyScheduleQ.groupId){
						alert('请选择一个中队');
						return;
					}
					vm.showList = 2;
					$.ajax({
					    url: "qw/dutySchedule/allDutyTask?groupId="+vm.dutyScheduleQ.groupId+"&yearMonth="+vm.dutyScheduleQ.yearMonth+"&userId="+vm.dutyScheduleQ.userId+"&userName="+vm.dutyScheduleQ.userName,
					    success: function(rslt){
							if(rslt.code == 200 && rslt.dutyTaskList){
								$('#calendarFinal').fullCalendar( 'destroy');
								var defaultDate =vm.dutyScheduleQ.yearMonth+'-01';
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
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				findTodayList: function() {
					vm.showList = 3;
					$.ajax({
					    url: "qw/dutySchedule/findTodayList",
					    success: function(rslt){
							if(rslt.code == 200){
								vm.todayScheduleList= rslt.todayScheduleList
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				reload: function () {
					vm.showList = 0;
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});

		initStep();
		
		loadGroups();
		
		loadJqGrid();

		require(['datetimepicker'],function(){
			$('.form_month').datetimepicker({
				language: "zh-CN",
		    	minView: 3,
		    	maxView: 4,
		    	startView: 3,
				format : "yyyy-mm",//格式
				autoclose: true,
			}).on('hide', function (ev) {
				vm.dutyScheduleQ.yearMonth = $("#monthQ").val();
				vm.startYearMonth = $("#startYearMonth").val();
			});
		})
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "scheduleArrange的vue实例"
		});
	}

	var initStep = function(){
		$('#scheduleConfigModal').modal('show')
	    
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
	    })

		vm.loadUsersByGroup();
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
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadJqGrid = function() {
		$('#jqGrid').jqGrid('GridUnload');

		var postDataTmp = {'groupId': vm.dutyScheduleQ.groupId, 'dateFormat': vm.dutyScheduleQ.yearMonth, 'userId': vm.dutyScheduleQ.userId, 'userName': vm.dutyScheduleQ.userName};
	    $("#jqGrid").jqGrid({
	        url: "qw/dutySchedule/pageData",
	        postData: postDataTmp,
	        datatype: "json",
	        colModel: [
	        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
	        	{ label: '用户编号', name: 'userId', width: 150, sortable:false/*, formatter: function(value, options, row){return value;}*/},
	        	{ label: '用户名称', name: 'userName', width: 150, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '开始时间', name: 'startTm', width: 200, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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