define(function(require) {
	var htmlStr = require('text!./dutyGrid.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var oldQ='1';
	var vm = null;
	//在地图中添加MouseTool插件
	var mousetool = null, infowindow = null;
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.PolygonTool();
		mousetool.autoClose = true;//是否自动关闭绘制
		map.addTool(mousetool);
	});
	
	var dutyGridFillColors = ['#ccccff','#99ccff','#99cccc','#ccff99','#ccffff','#6699cc'];
	
	var dutyGridPolygon = null; 
	var dutyGridPolygonOthers = [];
	var infoLabelOthers = [];
	var jtgjLayer = null;

	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		
		vm = new Vue({
			el: '#dutyGrid-panel',
			data: {
				showList: true,
				currentUser: currentUser,
				dutyGridQ: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')}, //交警大队查询所有，交警中队查询当前组
				dutyGrid: {isNewRecord:true, shape:'', group:{groupId:(currentUser.jjzdUser? currentUser.group.groupId :'')}},
				groupList:[], //中队列表
				groupUserList:[], //中队内部的用户列表
				dutyGridOtherList:[],//中队勤务社区列表
//				displayGridBtn: "显示勤务社区",
				pointCnt:0,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			watch:{
				groupUserList :'loadGroupUserListUi',
				'dutyGrid.group.groupId' : {
					deep : true,
					handler : function(val, oldVal) {
						vm.loadUsersByGroup();
					}
				}
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
						if(vm.dutyGrid.userIds && vm.dutyGrid.userIds.length>0){//编辑的时候
							var userIds = vm.dutyGrid.userIds.split(',');
							$("#userIds").selectpicker('val', userIds);
						}
					});
				},
				query: function () {
					vm.reload();
				},
				
				add: function () {
					vm.showList = false;
					vm.clear();
					vm.loadUsersByGroup();
//					vm.displayGridBtn = "显示勤务社区";
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
					    url: "qw/dutyGrid/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								vm.showList = false;
								vm.dutyGrid = rslt.dutyGrid;
								$("#groupId").selectpicker('val', vm.dutyGrid.group.groupId);
								vm.showOneDutyGrid(vm.dutyGrid);
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
					if(currentUser.jjddUser){
						vm.dutyGrid.group.groupId = $("#groupId").val();
					}
				    //表单验证
				    $("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							vm.dutyGrid.userIds = $("#userIds").val().toString();
							if(!vm.dutyGrid.fillColor){
								vm.dutyGrid.fillColor = dutyGridFillColors[Math.floor(Math.random()*6)];
							}
							
							var url = "qw/dutyGrid/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(vm.dutyGrid),
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
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
						    url: "qw/dutyGrid/purge/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									alert('操作成功', function(index){
										vm.clearDutyGrid();
										vm.reload();
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
					vm.clear();
					
					if(TUtils.cmp(oldQ,vm.dutyGridQ.groupId)){
						var postDataTmp = {'groupId': vm.dutyGridQ.groupId};
						oldQ = vm.dutyGridQ.groupId;
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
					
					vm.showOtherDutyGrids();
				},
				clearDutyGrid: function(){
					if(dutyGridPolygon){
						map.getOverlayLayer().removeOverlay(dutyGridPolygon);
					}
					dutyGridPolygon = null; 
					vm.dutyGrid.shape='';
				},
				clearOtherDutyGrids: function(){
	    			for (var i = 0; i < dutyGridPolygonOthers.length; i++) {
	    				map.getOverlayLayer().removeOverlay(dutyGridPolygonOthers[i]);
	    			}
	    			for (var i = 0; i < infoLabelOthers.length; i++) {
	    				map.getOverlayLayer().removeOverlay(infoLabelOthers[i]);
	    			}
					dutyGridPolygonOthers = [];
					infoLabelOthers = [];
				},
				clear: function () {
					vm.clearDutyGrid();
					vm.dutyGrid = {isNewRecord:true, shape:'', group:{groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')}, userIds:[]};
					$("#groupId").selectpicker('val', '');
					$('.selectpickerU').selectpicker('destroy');
				},
				loadUsersByGroup : function() {
					if(!vm.dutyGrid.group.groupId){
						vm.groupUserList = [];
					}else{
						var userUrl = "aa/user/findAvaliableGroupUsers?groupId="+vm.dutyGrid.group.groupId+"&gridId="+vm.dutyGrid.gridId;
						$.get(userUrl, function(r){
							if(r.code == 200){
								vm.groupUserList = r.userList;
							}else{
								alert(r.msg);
							}
						});
					}
				},
				addDutyGrid: function () {
					vm.clearDutyGrid();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						dutyGridPolygon = evt.overlay;
						vm.dutyGrid.shape = TUtils.polygonPath2Str(evt.overlay.getPath());
						mousetool.close();
						dutyGridPolygon.addEventListener(IMAP.Constants.MOUSE_IN, function(evt2){
							//获取拖拉之后的面积
							var target2 = evt2.target;
							vm.dutyGrid.shape = TUtils.polygonPath2Str(target2.getPath());
							if(vm.dutyGrid.shape){
								var polygonArr = vm.dutyGrid.shape.split(" ");
								vm.pointCnt = polygonArr.length;
							}
						},this);
						dutyGridPolygon.addEventListener(IMAP.Constants.MOUSE_OUT, function(evt2){
							//获取拖拉之后的面积
							var target2 = evt2.target;
							vm.dutyGrid.shape = TUtils.polygonPath2Str(target2.getPath());
							if(vm.dutyGrid.shape){
								var polygonArr = vm.dutyGrid.shape.split(" ");
								vm.pointCnt = polygonArr.length;
							}
						},this);
						dutyGridPolygon.addEventListener(IMAP.Constants.CLICK,function(evt2){
							dutyGridPolygon.editable(true);
//							var polygonOptOld = dutyGridPolygon.getAttribute();
//							dutyGridPolygon.setAttribute(polygonOptOld);
						},this);
						dutyGridPolygon.addEventListener(IMAP.Constants.DRAG_START,function(evt2){
							dutyGridPolygon.editable(false);
//							var polygonOptOld = dutyGridPolygon.getAttribute();
//							dutyGridPolygon.setAttribute(polygonOptOld);
						},this);
						/*dutyGridPolygon.addEventListener(IMAP.Constants.DRAG_END,function(evt2){
							//获取拖拽之后的面积
							var target2 = evt2.target;
							vm.dutyGrid.shape = TUtils.polygonPath2Str(target2.getPath());
						},this);*/
					},this);
					mousetool.editabled = true; 
				},
				showOtherDutyGrids: function () {
//					vm.displayGridBtn="隐藏勤务社区";
					vm.clearOtherDutyGrids();
					var param = "";
					if(currentUser.jjddUser){
						if(vm.showList){
							param = "groupId="+($("#groupIdQ").val()==null?'':$("#groupIdQ").val());
						}else{
							param = "groupId="+($("#groupId").val()==null?'':$("#groupId").val());
						}
					}else{
						param = "groupId="+currentUser.group.groupId;
					}
					var url = "qw/dutyGrid/findOtherList?"+param;
				    $.get(url, function(r){
						if(r.code == 200){
							vm.dutyGridOtherList = r.dutyGridOtherList;
							if(vm.dutyGridOtherList.length == 0){
								layer.msg("尚未添加勤务社区");
								return;
							}
							for(var idx =0; idx < vm.dutyGridOtherList.length; idx++){
								var dutyGridOther = vm.dutyGridOtherList[idx];
								var polygonPathOther = TUtils.polygonStr2Path(dutyGridOther.shape);
								var polygonOpt = {
										'editabled': false,
										"fillColor" : '#6699cc',
										"fillOpacity " : 0.5,
										"strokeColor  " : '#8B7B8B',
										"strokeOpacity" : 1,
										"strokeWeight" : 2,
										"strokeStyle" : "solid",
									};
								polygonOpt.fillColor = dutyGridOther.fillColor;
								var dutyGridPolygonOther = new IMAP.Polygon(polygonPathOther, polygonOpt);
								dutyGridPolygonOther.data = dutyGridOther;
								map.getOverlayLayer().addOverlay(dutyGridPolygonOther, false);
								dutyGridPolygonOthers.push(dutyGridPolygonOther);
								
								var infoLabel = new IMAP.Label(dutyGridOther.group.groupName+"<br/>("+dutyGridOther.gridName+")", {
									position : dutyGridPolygonOther.getBounds().getCenter(),// 基点位置
									offset: new IMAP.Pixel(0,-25),//相对于基点的位置
									anchor : IMAP.Constants.TOP_CENTER,
									fontSize : 12,
									fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
									fontColor : "#222222"
								});
								map.getOverlayLayer().addOverlay(infoLabel, false);
								infoLabelOthers.push(infoLabel);
							}
						}else{
							alert(r.msg);
						}
					});
				},
				toggleGroupGrids: function (idx) {
					if(dutyGridPolygonOthers && dutyGridPolygonOthers.length >0){
//						vm.displayGridBtn="中队勤务社区";
						vm.clearOtherDutyGrids();
					}else{
						vm.showOtherDutyGrids();
					}
				},
				showOneDutyGrid: function (dutyGrid) {
//					vm.toggleGroupGrids();
					
		    		var polygonPath = TUtils.polygonStr2Path(dutyGrid.shape);
		    		var polygonOpt = {
		    				'editabled': true,
		    				"fillColor" : '#6699cc',
		    				"fillOpacity " : 0.5,
		    				"strokeColor  " : '#8B7B8B',
		    				"strokeOpacity" : 1,
		    				"strokeWeight" : 2,
		    				"strokeStyle" : "solid",
		    			};
		    		polygonOpt.fillColor = dutyGrid.fillColor;
					dutyGridPolygon = new IMAP.Polygon(polygonPath, polygonOpt);

					dutyGridPolygon.addEventListener(IMAP.Constants.MOUSE_IN, function(evt2){
						//获取拖拉之后的面积
						var target2 = evt2.target;
						vm.dutyGrid.shape = TUtils.polygonPath2Str(target2.getPath());
						if(vm.dutyGrid.shape){
							var polygonArr = vm.dutyGrid.shape.split(" ");
							vm.pointCnt = polygonArr.length;
						}
					},this);
					dutyGridPolygon.addEventListener(IMAP.Constants.MOUSE_OUT, function(evt2){
						//获取拖拉之后的面积
						var target2 = evt2.target;
						vm.dutyGrid.shape = TUtils.polygonPath2Str(target2.getPath());
						if(vm.dutyGrid.shape){
							var polygonArr = vm.dutyGrid.shape.split(" ");
							vm.pointCnt = polygonArr.length;
						}
					},this);
					dutyGridPolygon.addEventListener(IMAP.Constants.CLICK,function(evt2){
						dutyGridPolygon.editable(true);
//						var polygonOptOld = dutyGridPolygon.getAttribute();
//						dutyGridPolygon.setAttribute(polygonOptOld);
					},this);
					dutyGridPolygon.addEventListener(IMAP.Constants.DRAG_START,function(evt2){
						dutyGridPolygon.editable(false);
//						var polygonOptOld = dutyGridPolygon.getAttribute();
//						dutyGridPolygon.setAttribute(polygonOptOld);
					},this);
					/*dutyGridPolygon.addEventListener(IMAP.Constants.DRAG_END,function(evt2){
						//获取拖拽之后的面积
						var target2 = evt2.target;
						vm.dutyGrid.shape = TUtils.polygonPath2Str(target2.getPath());
					},this);*/
					
					map.getOverlayLayer().addOverlay(dutyGridPolygon, false);
					if(dutyGridPolygon){
						map.setCenter(dutyGridPolygon.getBounds().getCenter(), 14);
//						map.panTo(dutyGridPolygon.getBounds().getCenter());
					}
				},
				highlightDutyGrid: function (dutyGrid) {//高亮显示某一个责任区
					for(var idx =0; idx < dutyGridPolygonOthers.length; idx++){
						var dutyGridPolygonOther = dutyGridPolygonOthers[idx];
						if(dutyGridPolygonOther.data.id == dutyGrid.id){
							var optNew = dutyGridPolygonOther.getAttribute();
							optNew.fillColor='red';
							dutyGridPolygonOther.setAttribute(optNew);
							map.setCenter(dutyGridPolygonOther.getBounds().getCenter(), 14);
//							map.panTo(dutyGridPolygon.getBounds().getCenter());
						}else{
							var optOld= dutyGridPolygonOther.getAttribute();
							optOld.fillColor=dutyGridPolygonOther.data.fillColor;
							dutyGridPolygonOther.setAttribute(optOld);
						}
					}
				},
				toggleZdLayer: function () {
					if(jtgjLayer){
						vm.hideZdLayer();
					}else{
						vm.showZdLayer();
					}
				},
				showZdLayer: function () {
					//################################测绘加工中队范围图################################
					jtgjLayer = new IMAP.TileLayer({
						tileSize: 256,
						minZoom: 11,
						maxZoom: 20,
					});
					jtgjLayer.setOpacity(0.8);
					if(itsEnv != 'prod'){
						jtgjLayer.setTileUrlFunc(function(x,y,z){
							//SIT
							return ("http://58.210.9.131/arcgis/rest/services/CS/XQ/MapServer/tile/" + z + "/" + y + "/" + x );
						});
					}else{
						jtgjLayer.setTileUrlFunc(function(x,y,z){
							//PROD
							return ("http://192.168.15.6:6080/arcgis/rest/services/MAP/TCS_ZDXQ/MapServer/tile/" + z + "/" + y + "/" + x );
						});
					}
					map.addLayer(jtgjLayer);
				},
				hideZdLayer: function () {
					if(jtgjLayer){
						jtgjLayer.setMap();
						jtgjLayer = null;
					}
				},
				close: function() {
					vm.clear();
					vm.clearDutyGrid();
					vm.hideZdLayer();
					vm.clearOtherDutyGrids();
					itsGlobal.hideLeftPanel();
				}
				
			}
		});
		oldQ=1;
		loadGroups();
		
		vm.showOtherDutyGrids();
		
		loadJqGrid();

		map.addEventListener(IMAP.Constants.ZOOM_END,function(){
	        var mZoom= map.getZoom();
	        if(infoLabelOthers){
		        if(mZoom>=12){
	    			for (var i = 0; i < infoLabelOthers.length; i++) {
	    				infoLabelOthers[i].visible(true);
	    			}
		        }else{
	    			for (var i = 0; i < infoLabelOthers.length; i++) {
	    				infoLabelOthers[i].visible(false);
	    			}
		        	
		        }
	        }
	    });
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "dutyGrid的vue实例"
		});
	};

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
				});
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadJqGrid = function() {
		$('#jqGrid').jqGrid('GridUnload');
		oldQ = vm.dutyGridQ.groupId;
		var postDataTmp = {'groupId': vm.dutyGridQ.groupId};
	    $("#jqGrid").jqGrid({
	        url: "qw/dutyGrid/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
	        	{ label: '所属中队', name: 'group.groupName', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '社区编号', name: 'gridId', width: 70, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '勤务社区名称', name: 'gridName', width: 120, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '警员', name: 'richUserNames', width: 150, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '勤务社区范围', name: 'shape', width: 5, sortable:false, hidden:true},
				{ label: '详情', name: 'detailInfoBtn', width: 50, sortable:true,formatter: function(value, options, row){
					 return "<button data-toggle='tooltip' title='责任区详情' data-placement='right' type='button' data-pid="+ row.id +" class='btn btn-link btn-sm info' style='width: 50px;'><span class='fa fa-file' aria-hidden='true'></span></button>";
				}},
				{ label: '详情', name: 'detailInfo', sortable:false, hidden:true},
				/*{ label: '操作', name: 'description', width: 70, sortable:false, formatter: function(value, options, row){
					return '<button class="btn btn-default btn-xs" onclick="vm.gridSearch(\''+row.shape+'\')" >搜索</button>';
				}},*/
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
	            $('.info').bind("click",function(){
	            	 layer.closeAll();
	            	 var id = $(this).data("pid");
	        		 var rowData = $("#jqGrid").getRowData(id); 
	        		 layer.open({
						  type: 1,
						  title:'责任区详情',
						  shade:0,
						  skin: 'layui-layer-rim', //加上边框
						  area: ['400px', '400px'], //宽高
						  content: rowData.detailInfo
						});
	        	   });
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
				vm.highlightDutyGrid(rowData);
	    	},
	    	
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