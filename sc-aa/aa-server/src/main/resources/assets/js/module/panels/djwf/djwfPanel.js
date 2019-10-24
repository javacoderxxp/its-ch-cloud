define(function(require) {
	var htmlStr = require('text!./djwfPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vmDjwf = null;
	var dutyGridPolygon;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vmDjwf = new Vue({
			el: '#djwf-panel',
			data: {
				showList: 0, //显示查询
				djwfQ: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :''), wflx:'15GQ', status:'',gridAssigned:'0'}, //查询参数
				djwf: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :''), gridId:''},
				groupList:[],
				dutyGridList:[],
				dictList:[],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0,
				plateTypeDicts:[]
			},
			methods: {
				query: function () {
					vmDjwf.load();
				},
				assignTo: function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "qw/djwf/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vmDjwf.title="指派";
								vmDjwf.showList = 2;
								vmDjwf.djwf = rslt.djwf;
								/*if(rslt.djwf.status != 6){
									vmDjwf.djwf.status = "";
								}*/
								vmDjwf.loadGridsByGroup();
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				assignNow: function(){
					/*if(vmDjwf.djwf.status == '0'){
						vmDjwf.djwf.status = '1';
					}else if(vmDjwf.djwf.status == '1'){
						vmDjwf.djwf.status = '2';
					}else if(vmDjwf.djwf.status == '2'){
						vmDjwf.djwf.status = '3';
					}*/
					if(!vmDjwf.djwf.groupId && !vmDjwf.djwf.gridId){
						//vmDjwf.djwf.status = '0';
					}else if(vmDjwf.djwf.groupId && !vmDjwf.djwf.gridId){
						//vmDjwf.djwf.status = '1';
					}else if(!vmDjwf.djwf.groupId && vmDjwf.djwf.gridId){
						alert('请先选择中队');
						return;
					}else {
						//vmDjwf.djwf.status = '3';//电警违法没有关联流程指派责任区后直接完成
					}
					
					var url = "qw/djwf/save";
					$.ajax({
						type: "POST",
						url: url,
						data: JSON.stringify(vmDjwf.djwf),
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功', function(index){
									vmDjwf.reload();
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				drawDutyGrid: function(){
					if(vmDjwf.djwf.gridId && vmDjwf.djwf.groupId){
						var gridId = vmDjwf.djwf.gridId;
						var groupId = vmDjwf.djwf.groupId;
						var url = "./qw/dutyGrid/getDutyAreaByGroupIdAndDutyId?teamId="+groupId+"&girdId="+gridId;
						$.ajax({
							type: "GET",
							url: url,
							success: function(rslt){
								if(rslt.code === 200){
									var dutyGrid = rslt.dutyGrid;
									if(dutyGrid){
										if(dutyGridPolygon){
											map.getOverlayLayer().removeOverlay(dutyGridPolygon);
										}
										dutyGridPolygon = null; 
										
										var polygonPath = TUtils.polygonStr2Path(dutyGrid.shape);
										
										var polygonOpt = {
												'editabled': false,
												"fillColor" : '#6699cc',
												"fillOpacity " : 0.5,
												"strokeColor  " : '#8B7B8B',
												"strokeOpacity" : 1,
												"strokeWeight" : 2,
												"strokeStyle" : "solid",
										};
										polygonOpt.fillColor = dutyGrid.fillColor;
										dutyGridPolygon = new IMAP.Polygon(polygonPath, polygonOpt);
										dutyGridPolygon.data = dutyGrid;
										map.getOverlayLayer().addOverlay(dutyGridPolygon, false);
									}
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				/*relevance: function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					
					var data = vmDjwf.selectedRow;
					data.qwType = '9';  // 该模块的关联统一是"15次违法未年检"类型
					if(data.status >= '2' ){
						var dutyRelevancePanel = require(['../../bottomPanel/dutyRelevance/dutyRelevancePanel'],function(dutyRelevancePanel){
							dutyRelevancePanel.show(data);
				        });
					}else{
						alert("该记录未处于待关联状态！");
					}
				},*/
				loadDictTypes: function() {
					$.get("sys/dict/getDictList?type=duty_status", function(r){
						if(r.code == 200){
							vmDjwf.dictList = r.dictList;
						}else{
							alert(r.msg);
						}
					});
				},
				loadGridsByGroup : function() {
					vmDjwf.dutyGridList = [];
					var gid=vmDjwf.djwf.gridId;
					if(vmDjwf.djwf.groupId){
						$.get("qw/dutyGrid/allData?groupId="+vmDjwf.djwf.groupId, function(r){
							if(r.code == 200){
								vmDjwf.dutyGridList = r.dutyGridList;
								vmDjwf.djwf.gridId = gid;
							}else{
								alert(r.msg);
							}
						});
					}
				},
				loadGridsByChangeGroup : function() {
					vmDjwf.dutyGridList = [];
					vmDjwf.djwf.gridId = '';
					if(vmDjwf.djwf.groupId){
						$.get("qw/dutyGrid/allData?groupId="+vmDjwf.djwf.groupId, function(r){
							if(r.code == 200){
								vmDjwf.dutyGridList = r.dutyGridList;
							}else{
								alert(r.msg);
							}
						});
					}
				},
				sendTask: function() {
					
				},
				load: function () {
					vmDjwf.showList = 0;
					loadJqGrid();
				},
				reload: function () {
					vmDjwf.showList = 0;
					reloadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		loadGroups();
		loadPlateTypes();
		
		loadJqGrid();
		
		vmDjwf.loadDictTypes();
		
		vueEureka.set("leftPanel", {
			vue: vmDjwf,
			description: "djwfPanel的vue实例"
		});
	}

	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				vmDjwf.groupList = r.groupList;
				/*if(currentUser.jjddUser){
					vmDjwf.groupListQ = r.groupList;
					vmDjwf.groupListQ.unshift({groupName:'所有'});
					vmDjwf.groupList = r.groupList;
				}else if(currentUser.jjzdUser){
					vmDjwf.groupListQ.push(currentUser.group);
					vmDjwf.groupList.push(currentUser.group);
				}
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('.selectpicker').selectpicker({
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

	var loadPlateTypes = function() {
	    $.get("sys/dict/getDictList?type=PLATE_TYPE", function(r){
			if(r.code == 200){
				vmDjwf.plateTypeDicts = r.dictList;
			}else{
				alert(r.msg);
			}
		});
	};
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {groupId:vmDjwf.djwfQ.groupId, hphm:vmDjwf.djwfQ.hphm, syr:vmDjwf.djwfQ.syr, wflx:vmDjwf.djwfQ.wflx, status:vmDjwf.djwfQ.status,gridAssigned:vmDjwf.djwfQ.gridAssigned};
		$("#jqGrid").jqGrid({
			url: "qw/djwf/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '号牌号码', name: 'hphm', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '号牌种类', name: 'hpzl', width: 40, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所有人', name: 'syr', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '抓拍次数', name: 'djcs', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '系统指派中队', name: 'zrdw', width: 70, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '手工指派中队', name: 'groupName', width: 70, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '责任区', name: 'gridName', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: '状态(字典)', name: 'status', width: 100, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
//				{ label: '通知状态', name: 'statusDesc', width: 80, sortable:true, formatter: function(value, options, row){
//					var status = row.status;
//					switch (status) {
//					/*case "0":
//						return '待指定中队';
//						break;
//					case "1":
//						return '待指定责任区';
//						break;
//					case "2":
//						return '待关联';
//					case "3":*/
//					case "6":
//						return '已通知';
//						break;
//					default:
//						return '未通知';
//						break;
//					}
//					return value;
//				}}
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
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	vmDjwf.assignTo();
	        },
			gridComplete:function(){
				//隐藏grid底部滚动条
				$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				vmDjwf.selectedRow = rowData;
			}
		});
		
	};

	var reloadJqGrid = function() {
		var postDataTmp = {groupId:vmDjwf.djwfQ.groupId, hphm:vmDjwf.djwfQ.hphm, syr:vmDjwf.djwfQ.syr, wflx:vmDjwf.djwfQ.wflx, status:vmDjwf.djwfQ.status,gridAssigned:vmDjwf.djwfQ.gridAssigned};
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