define(function(require) {
	var htmlStr = require('text!./missionSend.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var oldQ ='1';
	require('my97Datepicker');
	var app = null;
	var completedMissionOpts = new IMAP.MarkerOptions();
	completedMissionOpts.icon = new IMAP.Icon("./assets/images/completedMission.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	completedMissionOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var uncompletedMissionOpts = new IMAP.MarkerOptions();
	uncompletedMissionOpts.icon = new IMAP.Icon("./assets/images/uncompletedMission.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	uncompletedMissionOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var unsignedMissionOpts = new IMAP.MarkerOptions();
	unsignedMissionOpts.icon = new IMAP.Icon("./assets/images/unsignedMission.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	unsignedMissionOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	var show = function(pos) {
		itsGlobal.showLeftPanel(htmlStr);
		
		var cuser = currentUser.userId?currentUser.userId:'';
		var shape = pos.toString();
		app = new Vue({
			el: '#missionSend-panel',
			data: {
				queryObj:{designatedPn:"",designatedZd:""},
				showList: true,
				groupList:[],
				mission:{publisher:cuser,shape:shape,designatedPn:"",designatedZd:""},
				markerArr:[],
				allgroupList:[],
				userList:[],
				userListQ:[],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			methods: {
				query: function() {
					if(TUtils.cmp(this.queryObj,oldQ)){
						var obj = this.queryObj;
						var postDataTmp = {
								'title': obj.title?obj.title:"",
								'designatedZd': obj.designatedZd?obj.designatedZd:"",
								'startTime': $("#startTime").val(),
								'endTime': $("#endTime").val()
								};
						oldQ = JSON.parse(JSON.stringify(this.queryObj));
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
						loadJqGrid(this.queryObj);
					}
					this.drawQueryMission(this.queryObj);
				},
				submitMission: function() {
					var that = this;
					$("#detailForm").validate({
						invalidHandler : function() {// 验证失败的回调
							return false;
						},
						submitHandler : function() {// 验证通过的回调
							if(!app.mission.id){
								app.mission.publishDt = TUtils.formatDateTime(new Date()); //发布时间为当前时间
								app.mission.status = "0"; //任务状态未签收
							}
							$.ajax({
								type: "POST",
							    url: "emer/mission/save",
							    data: JSON.stringify(app.mission),
							    success: function(rslt){
							    	if(rslt.code === 200){
										layer.msg('任务已发送');
										//app.reload();
										that.mission = {};
									}else{
										layer.msg(rslt.msg);
									}
								}
							});
						}
					});
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$("#liEdit").show();
					$("#liEdit").addClass("active");
					$("#editB").show();
					$("#liQuery").hide();
					$("#liDetail").hide();
					$("#queryTab").removeClass("tab-pane fade in active");
					$("#queryTab").addClass("tab-pane fade");
					$("#detailTab").removeClass("tab-pane fade");
					$("#detailTab").addClass("tab-pane fade in active");
					$.ajax({
					    url: "emer/mission/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								app.mission = rslt.mission;
								app.loadUsers(2);
								//$("#designatedZd").selectpicker('val', rslt.mission.designatedZd);
							}
						}
					});
						
				},
				reload: function () {
					$("#liDetail").removeClass("active");
					$("#liQuery").addClass("active");
					$("#liEdit").hide();
					$("#editB").hide();
					$("#liQuery").show();
					$("#detailTab").removeClass("tab-pane fade in active");
					$("#detailTab").addClass("tab-pane fade");
					$("#queryTab").removeClass("tab-pane fade");
					$("#queryTab").addClass("tab-pane fade in active");
					app.query();
				},
				drawQueryMission:function(obj){
					var postDataTmp = {
							'title': obj.title?obj.title:"",
							'designatedZd': obj.designatedZd?obj.designatedZd:"",
							'startTime': $("#startTime").val(),
							'endTime': $("#endTime").val()
							};
					this.clearMarkerArr();
					var that = this;
					var url = "emer/mission/getAllPageData";
					$.ajax({
						  type: "POST",
						  url: url,
						  data: JSON.stringify(obj),
						  dataType: "json",
						  contentType: "application/json; charset=utf-8",
						  cache: false,
						  success: function (msg) {
						      if(msg.code == 200){
						    	  var missions = msg.list;
						    	  for(var x in missions){
										var mission = missions[x];
										if(mission.shape && mission.shape.indexOf(",")!=-1){
											var pos = mission.shape.split(",");
											var lnglat = new IMAP.LngLat(pos[0], pos[1]);
											var opt;
											if(mission.status == '0'){
												opt = unsignedMissionOpts;
											}else if(mission.status == '1'){
												opt = uncompletedMissionOpts;
											}else if(mission.status == '2'){
												opt = completedMissionOpts;
											}
											if(opt){
												var marker = new IMAP.Marker(lnglat, opt);
												map.getOverlayLayer().addOverlay(marker, true);
												that.markerArr.push(marker);
											}
										}
									}
						      }
						  },
						  error:function(){
						  }
						});
				},
				clearMarkerArr:function(){
					for(var i =0; i< this.markerArr.length; i++){
						var one = this.markerArr[i];
						map.getOverlayLayer().removeOverlay(one);
					}
					this.markerArr = [];
				},
				close: function(e) {
					itsGlobal.hideLeftPanel();
					if(e){
						map.selfRemoveRightClickMaker();
					}
					this.clearMarkerArr();
				},
				deleteMission:function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
						    url: "./emer/mission/purge/"+id,
						    success: function(rslt){
						    	app.query();
							}
						});
					});
				},
				loadUsers: function(i){
					var gid=app.mission.designatedZd;
					if(i==1){
					     var gid=app.queryObj.designatedZd;
					}
					if(!gid){
						gid = "";
					}
					var designatedPn = app.mission.designatedPn;
					
					 $.get("./aa/user/allData?groupId="+gid+"&type=MJ", function(r){
							if(r.code == 200){
								if(i==1){
									app.userListQ = r.userList;
								}else{
									app.userList = r.userList;
									app.mission.designatedPn = designatedPn;
									//$("#pN").val(designatedPn);
								}
							}else{
								alert(r.msg);
							}
						});
					
				},
				setDateStart:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){app.queryObj.startTime = $("#startTime").val()}});
				},
				setDateEnd:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){app.queryObj.endTime = $("#endTime").val()}});
				},
			}
		});
		
		
		oldQ=1;
		loadGroups();
		app.loadUsers(1);
		vueEureka.set("leftPanel", {
			vue: app,
			description: "missionSendPanel的vue实例"
		});
	}
	
	var loadJqGrid = function(obj) {
		$('#jqGrid').jqGrid('GridUnload');
		var postDataTmp = {
				'title': obj.title?obj.title:"",
				'designatedZd': obj.designatedZd?obj.designatedZd:"",
				'startTime': $("#startTime").val(),
				'endTime': $("#endTime").val(),
				'designatedPn':obj.designatedPn
				};
		oldQ = JSON.parse(JSON.stringify(obj));
	    $("#jqGrid").jqGrid({
	        url: "./emer/mission/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 30, key: true, hidden:true },
	        	{ label: '主题', name: 'title', width: 75, hidden:false },
				{ label: '发布时间', name: 'publishDt',sortable:false,width: 85},
				{ label: '状态', name: 'status', width: 50, sortable:false , formatter: function(value, options, row){
					return status2word(value);
				}},
				{ label: '任务详情', name: 'content',  width: 105},
				{ label: '任务反馈', name: 'fkDesc',  width: 85},
				{ label: '指定中队', name: 'designatedZd',  width: 60, sortable:true, formatter: function(value, options, row){
					var groupName = "";
					for(var x in app.groupList){
						var group = app.groupList[x];
						if(group.groupId == value){
							groupName = group.groupName;
							break;
						}
					}
					return groupName;
				}},
				{ label: '指定民警', name: 'designatedPn',  width: 50, sortable:true, formatter: function(value, options, row){
					var userName = "";
					for(var x in app.userListQ){
						var user = app.userListQ[x];
						if(user.policeNo == value){
							userName = user.userName;
							break;
						}
					}
					return userName;
				}},
				{ label: 'shape', name: 'shape',  width: 45,hidden:true},
				{ label: '完成时间', name: 'finishDt',  width: 45,hidden:true},
				{ label: 'rating', name: 'rating',  width: 45,hidden:true}
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
	        	app.edit();
	        },
	        onSelectRow: function(rowid, status){//选中某行
	    		var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	    		if(rowData && rowData.shape){
					var pos = rowData.shape.split(",");
					var center = new IMAP.LngLat(pos[0], pos[1]);
					map.setCenter(center);
				}
	    	}
	    });
	};
	
	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				app.groupList = r.groupList;
				/*require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('.zdselectpicker').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
				});
				app.allgroupList = JSON.parse(JSON.stringify(r.groupList));
				app.allgroupList.unshift({groupName:'所有'});
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('.allselectpicker').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
				});*/
			}else{
				alert(r.msg);
			}
		});
	}
	
	var status2word = function(status){
		var str = "未知";
		switch (status) {
		case "0":
			str = "未签收";
			break;
		case "1":
			str = "未完成";
			break;
		case "2":
			str = "完成";
			break;
		default:
			break;
		}
		return str;
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	var showQueryPanel =  function(){
		show("");
		$('#mission_nav a[href="#detailTab"]').hide();
		$('#mission_nav a[href="#queryTab"]').tab('show');
	}
	
	return {
		show: show,
		hide: hide,
		showQueryPanel:showQueryPanel
	};
})