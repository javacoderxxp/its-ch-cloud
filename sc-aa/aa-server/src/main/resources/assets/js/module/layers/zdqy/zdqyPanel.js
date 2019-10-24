define(function(require) {
	var htmlStr = require('text!./zdqyPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var oldQ ='1';
	var mousetool,locationMarker,dutyGridPolygon, infowindow = null;
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/bz_qt.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/bz_qt.png"), new IMAP.Size(24, 26)));
		mousetool.follow=true;
		mousetool.autoClose=true;
		mousetool.title="点击左键标注企业所在地地点";
		map.addTool(mousetool);
	});
	
	var show = function(zdqyParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#zdqy-panel',
			data: {
				showList: true, //显示查询
				carDetail: false,//显示车辆信息
				driverlicDetail: false,//显示驾驶证信息
				zdqyQ: {zdId: (currentUser.jjzdUser? currentUser.group.groupId :''),gridAssigned:'0'}, //交警大队查询所有，交警中队查询当前组
				zdqy: zdqyParam,
				dutyGridList:[],
				groupList:[],
				dutyGridListQ:[],
				zdqyXzList:[],
				fileName: "",
				//中队或车管所都可以更新
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0,
				isCgsAdmin: $.inArray("r_cgs",currentUser.roleIdList) >= 0 
			},
			methods: {
				init:function(){
					loadGroupList();
				},
				query: function () {
					require(['./zdqy'],function(zdqy){
						zdqy.showLayer(false);
					});
					vm.showList = true;
					this.clearGrid();
					this.clearLocation();
					if(TUtils.cmp(vm.zdqyQ,oldQ)){
						var postDataTmp = vm.zdqyQ;
						oldQ = JSON.parse(JSON.stringify(vm.zdqyQ));
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
					/*var url = "jtzt/zdqy/allData?rdm=1";
					if(vm.zdqyQ.zdId){
						url = url + "&zdId="+ vm.zdqyQ.zdId;
					}
					if(vm.zdqyQ.gridId){
						url = url + "&gridId="+ vm.zdqyQ.gridId;
					}
					if(vm.zdqyQ.mc){
						url = url + "&mc="+ vm.zdqyQ.mc;
					}
					if(vm.zdqyQ.xz){
						url = url + "&xz="+ vm.zdqyQ.xz;
					}
					if(vm.zdqyQ.xz){
						url = url + "&gridAssigned="+ vm.zdqyQ.gridAssigned;
					}
					this.getDutyListByTeamId2();
					$.ajax({
						type: "GET",
						url: url,
						success: function(rslt){
							if(rslt.code == 200){
								var zdqyList = rslt.zdqyList;
								if(zdqyList && zdqyList.length >0){
									require(['./zdqy'],function(zdqy){
										zdqy.showLayer(true,zdqyList);
									});
								}
							}else{
								alert(rslt.msg);
							}
						}
					});*/
				},
				contrast: function (){
					
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.zdqy = {isNewRecord:true,shape:''};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					require(['./zdqy'],function(zdqy){
						zdqy.showLayer(false);
					});
					this.clearLocation();
					$.ajax({
						url: "jtzt/zdqy/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								if(!rslt.zdqy.shape){
									rslt.zdqy.shape = '';
								}
								if(!rslt.zdqy.zdId){
									rslt.zdqy.zdId = '';
								}
								if(!rslt.zdqy.gridId){
									rslt.zdqy.gridId = '';
								}
								vm.zdqy = rslt.zdqy;
								var pos = vm.zdqy.shape.split(",");
								locationMarker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
								map.getOverlayLayer().addOverlay(locationMarker, false);
								locationMarker.setTitle(vm.zdqy.mc);
								vm.loadGridsByGroup();
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
				    	rules: {
				    		lxdh: {
		    					number: true
			    			},
			    			aqfzrDh: {
		    					number: true
			    			},
				    	},
				    	messages: {
				    		lxdh: {
			    				number: "联系电话必须是数字"
			    			},
			    			aqfzrDh: {
		    					number: "安全负责人电话必须是数字"
			    			}
				    	},
						submitHandler : function(){//验证通过的回调
							/*if(!vm.zdqy.zdId || vm.zdqy.zdId == ''){
								alert('所属中队不能为空');
								return;
							}*/
							var url = "jtzt/zdqy/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.zdqy),
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
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "jtzt/zdqy/purge/"+id,
							success: function(rslt){
								if(rslt.code == 200){
									alert('操作成功', function(index){
										vm.query();
									});
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				saveGroupGrid: function () {
					var url = "jtzt/zdqy/saveGroupGrid";
					$.ajax({
						type: "POST",
						url: url,
						data: JSON.stringify(vm.zdqy),
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
				exportExcel: function () {
					var url = "jtzt/zdqy/exportExcel";
					$.ajax({
						type: "POST",
						url: url,
					    data: JSON.stringify(vm.zdqyQ),
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功,请下载文件', function(index){
									vm.exportSuccess = true;
									vm.fileName = rslt.fileName;
									vm.query();
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				downloadExcel: function () {
					var url = "jtzt/zdqy/downloadExcel?fileName="+encodeURIComponent(vm.fileName);
					var wWidth = document.body.clientWidth/2 ;  
					var wHeight =document.body.clientHeight/2;  
					window.open(url,'newwindow','height=20,width=20,top='+wHeight+',left='+wWidth+',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no') ;  
				},
				reload: function () {
					vm.showList = true;
					vm.fileName = "";
					this.clearGrid();
					this.clearLocation();
					this.query();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
					this.clearGrid();
					this.clearLocation();
					require(['./zdqy'],function(zdqy){
						zdqy.showLayer(false);
					});
				},
				/*
				getDutyListByTeamId: function() {
					this.clearGrid();
					var gid=vm.zdqy.gridId;
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.zdqy.zdId, function(r){
						if(r.code == 200){
							vm.dutyGridList = r.dutyGridList;
							var refreshGridId = setInterval(function(){
								$('#gridId').selectpicker('refresh');
								var a = $('#gridId option').text();
								var arr = $('#ze_ren_qu div li a');
								if(arr.length <=1){
									clearInterval(refreshGridId);
									$("#gridId").selectpicker('val', gid);
								}else{
									var b = arr[1].innerText;
									if(!b){
										clearInterval(refreshGridId);
										return;
									}
									if(a.indexOf(b)>=0){
										clearInterval(refreshGridId);
										$("#gridId").selectpicker('val', gid);
									}
								}
							}, 10);
						}else{
							alert(r.msg);
						}
					});
				},
				getDutyListByTeamId2: function() {
					var gid=vm.zdqyQ.gridId;
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.zdqyQ.zdId, function(r){
						if(r.code == 200){
							vm.dutyGridListQ = r.dutyGridList;
							var refreshGridId = setInterval(function(){
								//$('#gridIdQ').selectpicker('refresh');
								var a = $('#gridIdQ option').text();
								var arr = $('#ze_ren_qu1 div li a');
								if(arr.length <=1){
									clearInterval(refreshGridId);
							    //$("#gridIdQ").selectpicker('val', gid);
								}else{
									var b = arr[1].innerText;
									if(!b){
										clearInterval(refreshGridId);
										return;
									}
									if(a.indexOf(b)>=0){
										clearInterval(refreshGridId);
										$("#gridIdQ").selectpicker('val', gid);
									}
								}
							}, 10);
						}else{
							alert(r.msg);
						}
					});
				},*/
				loadGridsByGroup : function() {
					vm.dutyGridList = [];
					var gid=vm.zdqy.gridId;
					if(vm.zdqy.zdId){
						$.get("qw/dutyGrid/allData?groupId="+vm.zdqy.zdId, function(r){
							if(r.code == 200){
								vm.dutyGridList = r.dutyGridList;
								vm.zdqy.gridId = gid;
							}else{
								alert(r.msg);
							}
						});
					}
				},
				loadGridsByChangeGroup : function() {
					vm.dutyGridList = [];
					vm.zdqy.gridId = '';
					if(vm.zdqy.zdId){
						$.get("qw/dutyGrid/allData?groupId="+vm.zdqy.zdId, function(r){
							if(r.code == 200){
								vm.dutyGridList = r.dutyGridList;
							}else{
								alert(r.msg);
							}
						});
					}
				},
				selectOneGrid:function(e){
					if(this.zdqy.zdId && this.zdqy.zdId != ''){
						if(this.zdqy.gridId && this.zdqy.gridId != ''){
							for(var i=0;i<this.dutyGridList.length;i++){
								var grid = this.dutyGridList[i];
								if(grid.gridId == this.zdqy.gridId){
									this.drawGrid(grid.shape);
									break;
								}
							}
						}
					}
				},
				drawGrid:function(shape){
					this.clearGrid();
					if(shape && shape!=''){
						var polygonPath = TUtils.polygonStr2Path(shape);
						dutyGridPolygon = new IMAP.Polygon(polygonPath, TConfig.V.dutyGridPolygonOpt);
			        	map.getOverlayLayer().addOverlay(dutyGridPolygon, false);
					}
				},
				clearGrid:function(){
					if(dutyGridPolygon){
						map.getOverlayLayer().removeOverlay(dutyGridPolygon);
					}
					dutyGridPolygon = null;
				},
				relocate:function(){
					this.clearLocation();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						locationMarker = evt.overlay;
						vm.zdqy.shape = TUtils.lnglat2Str(locationMarker.getPosition());
						mousetool.close();
					},this);
				},
				queryVehicles:function(){
					
				},
				queryDirvers:function(){
					
				},
				clearLocation:function(){
					if(locationMarker){
						map.getOverlayLayer().removeOverlay(locationMarker);
					}
					locationMarker = null;
				},
				loadZdqyXzList:function(){
					$.get("./jtzt/zdqy/findXzList?xz="+vm.zdqyQ.xz, function(r){
						if(r.code == 200){
							vm.zdqyXzList = r.zdqyXzList;
						}else{
							alert(r.msg);
						}
					});
				},
//				carDetail:function(){
//					debugger;
//					console.log(0);
//				}
				carList:function(qymc) {
					var tName = qymc+"--车辆";
					layer.open({
						type: 1,
						skin: 'layui-layer',
						title: [tName],
						area: ['485px', '425px'],
						shade: false,
						content: jQuery("#carDetailDiv"),
						btn: []
					});
					loadJqGrid2(qymc);
				},
				driverlicList:function(qymc) {
					var tName = qymc+"--驾驶员";
					layer.open({
						type: 1,
						skin: 'layui-layer',
						title: [tName],
						area: ['485px', '425px'],
						shade: false,
						content: jQuery("#driverlicDetailDiv"),
						btn: []
					});
					loadJqGrid3(qymc);
				},
			}
		});
		oldQ=1;
		vm.query();
		vm.init();
		vm.loadZdqyXzList();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "zdqyPanel的vue实例"
		});
	}
	
	var loadGroupList = function() {
	    $.get("aa/group/allData?zdFlag=1", function(r){
			if(r.code == 200){
				vm.groupList = r.groupList;
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {zdId:vm.zdqyQ.zdId,gridId:vm.zdqyQ.gridId,mc:vm.zdqyQ.mc,xz:vm.zdqyQ.xz,gridAssigned:vm.zdqyQ.gridAssigned};
		oldQ = JSON.parse(JSON.stringify(vm.zdqyQ));
		$("#jqGrid").jqGrid({
			url: "jtzt/zdqy/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '企业名称', name: 'mc', width: 140, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '企业性质', name: 'xz', width: 55, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '地址', name: 'dz', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '联系电话', name: 'lxdh', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属中队', name: 'zdName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属责任区', name: 'gridName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车辆数', name: 'carCount', width: 30, sortable:false, formatter: function(value, options, row){
					return "<a class='carDetail' style='color: #05c3d8;' data-qymc='"+row.mc+"'>"+value+"</a>";
				}},
				{ label: '驾驶人数', name: 'driverlicCount', width: 30, sortable:false, formatter: function(value, options, row){
					return "<a class='driverlicDetail' style='color: #e0b203;' data-qymc='"+row.mc+"'>"+value+"</a>";
				}},
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
				$('.carDetail').bind('click',function(){
					var qymc = $(this).data("qymc");
					if(!qymc || ""==qymc){
						return;
					}
					vm.carList(qymc);
				});
				$('.driverlicDetail').bind('click',function(){
					var qymc = $(this).data("qymc");
					if(!qymc || ""==qymc){
						return;
					}
					vm.driverlicList(qymc);
				});
			},
			gridComplete:function(){
				//隐藏grid底部滚动条
				$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
			ondblClickRow: function(rowid){
				vm.edit();
			},
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
			}
		});
	};
	
	var loadJqGrid2 = function(qymc) {
		$("#jqGrid2").jqGrid('GridUnload');
		var postDataTmp2 = {dwmc:qymc,gridAssigned:vm.zdqyQ.gridAssigned,zdqy:1};
		$("#jqGrid2").jqGrid({
			url: "jtzt/zdqyCl/pageData",
			datatype: "json",
			postData: postDataTmp2,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '车辆号牌', name: 'hphm', width: 70, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '品牌种类', name: 'hpzlMs', width: 70, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '使用性质', name: 'syxz', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '有效期止', name: 'yxqz', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属中队', name: 'groupName', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属责任区', name: 'gridName', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
			],
			viewrecords: true,
			height: 300,
			rowNum: 10,
			rowList : [10,30,50],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth:false,
			multiselect: false,
			pager: "#jqGridPager2",
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
				$("#jqGrid2").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid2").jqGrid('getRowData', rowid);
			}
		});
	};

	var loadJqGrid3 = function(qymc) {
		$("#jqGrid3").jqGrid('GridUnload');
		var postDataTmp3 = {dwmc:qymc,gridAssigned:vm.zdqyQ.gridAssigned,zdqy:1};
		$("#jqGrid3").jqGrid({
			url: "jtzt/zdqyJsy/pageData",
			datatype: "json",
			postData: postDataTmp3,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '姓名', name: 'xm', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '证件号码', name: 'zjhm', width: 100, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '准驾车型', name: 'zjcx', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属中队', name: 'groupName', width: 100, sortable:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属责任区', name: 'gridName', width: 100, sortable:true/*, formatter: function(value, options, row){return value;}*/},
			],
			viewrecords: true,
			height: 300,
			rowNum: 10,
			rowList : [10,30,50],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth:false,
			multiselect: false,
			pager: "#jqGridPager3",
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
				$("#jqGrid3").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid3").jqGrid('getRowData', rowid);
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