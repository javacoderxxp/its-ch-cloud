define(function(require) {
	var htmlStr = require('text!./punishWarning.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('my97Datepicker');
	var vm = null;
	var queryList = [];
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#pw-panel',
			data: {
				showList: true,
				punishQ:{type:'A',groupId:""},
				groupList:[],
				halfHourMore4List:[],
				halfHourMore4DetailList:[],
				tujizhifaDetailList:[]
			},
			methods: {
				init:function(){
					var day = TUtils.formatDate(new Date());
					vm.punishQ.startDt = day;
					$("#startDt").val(day);
					$("#endDt").val(day);
					vm.punishQ.endDt = day;
				},
				query: function() {
					var startDt = $("#startDt").val();
					var endDt = $("#endDt").val();
					
					if(startDt == "" || endDt == ""){
						alert("请选择起止时间");
						return;
					}
					
					var pStartDt = new Date(startDt.replace(/-/g,"/"));
					var pEndDt = new Date(endDt.replace(/-/g,"/"));
					
					var queryObj = vm.punishQ;
					if(pStartDt<=pEndDt){
						queryObj.startDt = startDt +" 00:00:00";
						queryObj.endDt = endDt+" 23:59:59";
						
						if(currentUser.jjddUser==false && currentUser.jjzdUser == true){
							queryObj.groupId = currentUser.group.groupId;
						}
						
						loadJqGrid(queryObj);
					}
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				},
				setDateStart:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', onpicked:function(){vm.punishQ.startDt = $("#startDt").val()}});
				},
				setDateEnd:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', onpicked:function(){vm.punishQ.endDt = $("#endDt").val()}});
				},
				changePunishType:function(e){
					var val = e.target.value;
					if("B"==val){
						vm.punishQ.groupId = "";
						$("#groupIdQ").selectpicker('val',"");
					}
				},
				openWarningPage:function(){
					require(['visualScene/dynAlarmVisualScene/initAlarmScene'],function(initAlarmScene){
						initAlarmScene.show('alarmSceneNew');
					});
				},
				openHalfHourMore4Detail:function(item){
					this.halfHourMore4DetailList = [];
					if(item && item.vpList){
						this.halfHourMore4DetailList = item.vpList;
						
						var tm = setInterval(function(){
							var len = $("#halfHourMore4DetailTb tr").length;
							if(len == item.vpList.length){
								var html = $("#halfHour4Detail").html();
								layer.open({
								  type: 1,
								  skin: 'layui-layer-rim', //加上边框
								  area: ['800px', '560px'], //宽高
								  content: html
								});
								clearInterval(tm);
							}
						}, 100);
					}
				},
				openTujizhifaDetail:function(vp){
					if(!vp.type){
						return;
					}
					var url = "qw/violationPunish/getTujizhifaDetail?rdm="+(new Date()).getTime()+"&type="+vp.type;
					if(vp.day){
						url += ("&day="+vp.day);
					}
					if(vp.startDt){
						url += ("&startDt="+vp.startDt);
					}
					if(vp.endDt){
						url += ("&endDt="+vp.endDt);
					}
					if("B" == vp.type){
						if(vp.idCardNo){
							url += ("&idCardNo="+vp.idCardNo);
						}
						if(vp.carNo){
							url += ("&carNo="+vp.carNo);
						}
						if(vp.violatedName){
							url += ("&violatedName="+vp.violatedName);
						}
					}else{
						if(vp.punisherNo){
							url += ("&policeNo="+vp.punisherNo);
						}else{
							return;
						}
					}
					
					$.ajax({
					    url: url,
					    type: 'GET',
					    dataType: 'json',
					    error: function(){
					    	layer.msg("获取突击执法数据失败");
					    },
					    success: function(dat){
					    	if(dat.code == "200"){
					    		vm.tujizhifaDetailList = dat.list;
					    		if(dat.list && dat.list.length>0){
					    		var tm = setInterval(function(){
									var len = $("#tujizhifaDetailTb tr").length;
									if(len == dat.list.length){
										var html = $("#tujizhifaDetail").html();
										layer.open({
										  type: 1,
										  skin: 'layui-layer-rim', //加上边框
										  area: ['800px', '560px'], //宽高
										  content: html
										});
										clearInterval(tm);
									}
								}, 100);
					    		}
					    	}else{
					    		layer.msg("获取突击执法数据失败");
					    	}
					    }
					});
				}
			}
		});
		loadGroups();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "pw-panel的vue实例"
		});
		vm.init();
	}
	var loadJqGrid = function(queryData) {
		queryList = [];
		if(!queryData){
			return;
		}
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = queryData;
		if(!queryData.type){
			return;
		}
		
		if("B" == queryData.type){
			layer.load();
			/*
			$.ajax({
			    url: "qw/violationPunish/getMoreThan4InOneDay?startDt="+queryData.startDt+"&endDt="+queryData.endDt+"&rdm="+(new Date()).getTime(),
			    type: 'GET',
			    dataType: 'json',
			    error: function(){
			    	layer.msg("获取同一人车半小时违法超4起数据失败");
			    },
			    success: function(dat){
					layer.closeAll('loading');
			    	if(dat.code == "200"){
			    		vm.halfHourMore4List = dat.list;
			    	}else{
			    		layer.msg("获取同一人车半小时违法超4起数据失败");
			    	}
			    }
			});*/
			
			$("#jqGrid").jqGrid({
				url: "qw/violationPunish/tujiZhifaPageData",
				datatype: "json",
				postData: postDataTmp,
				colModel: [
					{ label: '车牌号', name: 'carNo', width: 80, sortable:false},
					{ label: '被处罚人', name: 'violatedName', width: 80, sortable:false},
					{ label: '身份证号/驾驶证号', name: 'idCardNo', width: 160, sortable:false},
					{ label: '处罚时间', name: 'day', width: 150, sortable:false},
					{ label: '处罚量', name: 'cnt', width: 70,sortable:true, formatter: function(value, options, row,data){
						var vpId = ""+row.day+row.idCardNo;
						row.vpId = vpId;
						return "<span data-vp='"+vpId+"' class='vp-cnt label label-primary' style='cursor: pointer;' title='点击查看详情'>"+value+"</span>";
					}},
					{ label: 'type', name: 'type', width: 100, hidden:true,sortable:false}
				],
				viewrecords: true,
				height: 370,
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
					layer.closeAll('loading');
					if(data &&data.page && data.page.list){
						queryList = data.page.list;
					}
					$(".vp-cnt").bind('click',function(){
						var vp = $(this).data('vp');
						if(vp && ""!=vp && queryList.length>0){
							for(var i=0;i<queryList.length;i++){
								var ql = queryList[i];
								if(ql && ql.vpId){
									if(ql.vpId == vp){
										vm.openTujizhifaDetail(ql);
										break;
									}
								}
							}
						}
					});
				},
				gridComplete:function(){
					//隐藏grid底部滚动条
					$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
				},
		        ondblClickRow: function(rowid){
		        	var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
		        },
				onSelectRow: function(rowid){//选中某行
					var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				}
			});
			
		}else{
			$("#jqGrid").jqGrid({
				url: "qw/violationPunish/tujiZhifaPageData",
				datatype: "json",
				postData: postDataTmp,
				colModel: [
					{ label: 'groupId', name: 'groupId', width: 5, key: false, hidden:true },
					{ label: '所属中队', name: 'groupName', width: 60, sortable:false},
					{ label: '警号', name: 'punisherNo', width: 60, sortable:false},
					{ label: '警员', name: 'policeName', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
					{ label: '处罚时间', name: 'content', width: 265, sortable:false},
					{ label: '处罚量', name: 'cnt', width: 70,sortable:true, formatter: function(value, options, row,data){
						var vpId = ""+row.groupId+row.punisherNo+row.content;
						row.vpId = vpId;
						return "<span data-vp='"+vpId+"' class='vp-cnt label label-primary' style='cursor: pointer;' title='点击查看详情'>"+value+"</span>";
					}},
					{ label: 'type', name: 'type', width: 1, hidden:true,sortable:false},
					{ label: 'startDt', name: 'startDt', width: 1, hidden:true,sortable:false},
					{ label: 'endDt', name: 'endDt', width: 1, hidden:true,sortable:false},
					{ label: 'day', name: 'day', width: 1, hidden:true,sortable:false},
				],
				viewrecords: true,
				height: 370,
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
					if(data &&data.page && data.page.list){
						queryList = data.page.list;
					}
					$(".vp-cnt").bind('click',function(){
						var vp = $(this).data('vp');
						if(vp && ""!=vp && queryList.length>0){
							for(var i=0;i<queryList.length;i++){
								var ql = queryList[i];
								if(ql && ql.vpId){
									if(ql.vpId == vp){
										vm.openTujizhifaDetail(ql);
										break;
									}
								}
							}
						}
					})
				},
				gridComplete:function(){
					//隐藏grid底部滚动条
					$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
				},
		        ondblClickRow: function(rowid){
		        	var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
		        },
				onSelectRow: function(rowid){//选中某行
					var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				}
			});
		}
		
	};
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				vm.groupList = JSON.parse(JSON.stringify(r.groupList));
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
					$('#typeQ').selectpicker({
						noneSelectedText:'请选择一个类型',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
				});
			}else{
				alert(r.msg);
			}
		});
	}
	return {
		show: show,
		hide: hide
	};
})