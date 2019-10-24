define(function(require) {
	var htmlStr = require('text!./driverCardPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var oldQ= '1';
	var flg = '0';
	//在地图中添加MouseTool插件
	var mousetool = null, locationMarker,dutyGridPolygon, infowindow = null;
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/bzlocate.png"), new IMAP.Size(24, 26)));
		mousetool.follow=true;
		mousetool.autoClose=true;
		mousetool.title="点击左键标注驾驶证所在地地点";
		map.addTool(mousetool);
	});
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#driverCard-panel',
			data: {
				showList: true, //显示查询
				driverCardQ: {zdId: (currentUser.jjzdUser? currentUser.group.groupId :''),zt:'B',xm:'',gridAssigned:'0', vehicleCnt:'3'}, //查询参数
				driverCard: {gridId:'',zdId:'',shape:''},
				groupList:[],
				dutyGridList:[],
				selDriver:{},
				postDataTmp:null,
				showDownload:false,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			watch:{
				'driverCardQ.vehicleCnt' : {
					deep : true,
					handler : function(newVal, oldVal) {
						if(0 == newVal){
							this.driverCardQ.hasTrace = "ALL";
							vm.postDataTmp = null;
						}else if(1 == newVal){
							/*setTimeout(function(){
								$('#hasTraceQ').selectpicker({
									noneSelectedText:'请选择一个条件',
									liveSearch: true,
									style: 'btn-default',
									size: 7
								});
							}, 600);*/
						}
					}
				}
			},
			methods: {
				init:function(){
					/*require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#zt').selectpicker({
							noneSelectedText:'请选择一个状态',
							liveSearch: true,
							style: 'btn-default',
							size: 7
						});
						$('#gridId').selectpicker({
							noneSelectedText:'请选择一个责任区',
							liveSearch: true,
							style: 'btn-default',
							size: 7
						});
						$('#ztQ').selectpicker({
							noneSelectedText:'请选择一个状态',
							liveSearch: true,
							style: 'btn-default',
							size: 7
						});
						$('#hasTraceQ').selectpicker({
							noneSelectedText:'请选择一个条件',
							liveSearch: true,
							style: 'btn-default',
							size: 7
						});
					});*/
				},
				query: function () {
					vm.reload();
				},
				download:function(){
					if(vm.postDataTmp == null){
						return;
					}
		    		var url = "qw/driverCard/download/driver/hasTrace?rdm="+(new Date()).getTime();
				    if(vm.postDataTmp.zdId){
				    	url += ("&zdId="+vm.postDataTmp.zdId);
				    }
				    if(vm.postDataTmp.zt){
				    	url += ("&zt="+vm.postDataTmp.zt);
				    }
				    if(vm.postDataTmp.gridAssigned){
				    	url += ("&gridAssigned="+vm.postDataTmp.gridAssigned);
				    }
				    if(vm.postDataTmp.vehicleCnt){
				    	url += ("&vehicleCnt="+vm.postDataTmp.vehicleCnt);
				    }
				    if(vm.postDataTmp.hasTrace){
				    	url += ("&hasTrace="+vm.postDataTmp.hasTrace);
				    }
					var wWidth = document.body.clientWidth/2 ;  
					var wHeight =document.body.clientHeight/2;  
					window.open(url,'newwindow','height=20,width=20,top='+wHeight+',left='+wWidth+',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no') ;  
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.driverCard = {isNewRecord:true,gridId:'',zdId:''};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "qw/driverCard/detail/"+id+"?zt="+vm.driverCardQ.zt,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								if(!rslt.driverCard.shape){
									rslt.driverCard.shape = '';
								}
								if(!rslt.driverCard.zdId){
									rslt.driverCard.zdId = '';
								}
								if(!rslt.driverCard.gridId){
									rslt.driverCard.gridId = '';
								}
								vm.driverCard = rslt.driverCard;
								/*$("#zt").selectpicker('val', vm.driverCard.zt);
								$("#zdId").selectpicker('val', vm.driverCard.zdId);*/
								vm.getDutyListByTeamId();
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
							/*if(!vm.driverCard.zdId || vm.driverCard.zdId == ''){
								alert('中队不能为空');
								return;
							}
							if(!vm.driverCard.gridId || vm.driverCard.gridId == ''){
								alert('责任区不能为空');
								return;
							}*/
							var url = "qw/driverCard/updateZdIdAndGridId";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.driverCard),
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
							url: "qw/driverCard/delete/"+id,
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
							url: "qw/driverCard/purge/"+id,
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
				relocate:function(){
					this.clearLocation();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						locationMarker = evt.overlay;
						vm.driverCard.shape = TUtils.lnglat2Str(locationMarker.getPosition());
						mousetool.close();
					},this);
				},
				clearLocation:function(){
					if(locationMarker){
						map.getOverlayLayer().removeOverlay(locationMarker);
					}
					locationMarker = null;
				},
				reload: function () {
					this.clearGrid();
					this.clearLocation();
					vm.showList = true;
					if(TUtils.cmp(vm.driverCardQ,oldQ)){
						var postDataTmp = {};
						
						if(vm.driverCardQ.zdId && vm.driverCardQ.zdId != ''){
							postDataTmp.zdId = vm.driverCardQ.zdId;
						}
						if(vm.driverCardQ.zt && vm.driverCardQ.zt != ''){
							postDataTmp.zt = vm.driverCardQ.zt;
						}
						if(vm.driverCardQ.xm && vm.driverCardQ.xm != ''){
							postDataTmp.xm = vm.driverCardQ.xm;
						}
						/*if((typeof (vm.driverCardQ.hasTrace) != 'undefined') && (vm.driverCardQ.hasTrace || vm.driverCardQ.hasTrace != '')){
							postDataTmp.hasTrace = "1";
						}else{
							postDataTmp.hasTrace = "";
						}*/
						if(vm.driverCardQ.vehicleCnt == 2){
							vm.driverCardQ.vehicleCnt == '1';
							postDataTmp.hasTrace = "1";
							vm.driverCardQ.hasTrace = "1";
						}else{
							postDataTmp.hasTrace = "";
							vm.driverCardQ.hasTrace = "";
						}
						postDataTmp.gridAssigned =vm.driverCardQ.gridAssigned;
						postDataTmp.vehicleCnt =vm.driverCardQ.vehicleCnt;
						
						var postDataT = JSON.parse(JSON.stringify(postDataTmp));
						
						oldQ = JSON.parse(JSON.stringify(vm.driverCardQ));
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
							postData: postDataT,
							page:page
						}).trigger("reloadGrid");
					}else{
						loadJqGrid();
					}
				},
				close: function() {
					this.clearGrid();
					this.clearLocation();
					itsGlobal.hideLeftPanel();
				},
				getDutyListByTeamId: function() {
					this.clearGrid();
					var gid=vm.driverCard.gridId;
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.driverCard.zdId, function(r){
						if(r.code == 200){
							vm.dutyGridList = r.dutyGridList;
							vm.driverCard.gridId = gid;
							/*var refreshGridId = setInterval(function(){
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
							}, 10);*/
						}else{
							alert(r.msg);
						}
					});
				},
				selectOneGrid:function(e){
					if(this.driverCard.zdId && this.driverCard.zdId != ''){
						if(this.driverCard.gridId && this.driverCard.gridId != ''){
							for(var i=0;i<this.dutyGridList.length;i++){
								var grid = this.dutyGridList[i];
								if(grid.gridId == this.driverCard.gridId){
									this.drawGrid(grid.shape);
									break;
								}
							}
						}
					}
				},
				trajectory:function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					/*if(vm.selDriver.zt !='超分'){
						alert("请选择状态为超分的数据！");
						return ;
					}*/
					$.ajax({
						url: "qw/driverCard/queryHpHm/"+vm.selDriver.sfzmhm,
						success: function(rslt){
							if(rslt.code == 200){
								var hpHm = rslt.hpHm;
								if(!hpHm){
									alert("无车辆信息,请重新选择！");
								}else{
									//hpHm="苏"+hpHm;
									require(['panels/vehicleTrace/vehicleTrace'],function(vehicleTrace){
										vehicleTrace.loadCarTrace(true, hpHm,'','');
									});
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
					
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
				}
			}
		});
		
		oldQ=1;
		loadGroups();
		loadJqGrid();
		vm.init();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "driverCardPanel的vue实例"
		});
		
	}
	
	var loadGroups = function() {

		$.get("./aa/group/getAllTeams", function(r){
			if(r.code == 200){
				vm.groupList = r.teamList;
				
				/*vm.groupListQ = JSON.parse(JSON.stringify(r.teamList));
				vm.groupListQ.unshift({groupName:'所有'});
				
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#zdId').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
					$('#groupIdQ').selectpicker({
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
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {};
		if(vm.driverCardQ.zdId && vm.driverCardQ.zdId != ''){
			postDataTmp.zdId = vm.driverCardQ.zdId;
		}
		if(vm.driverCardQ.zt && vm.driverCardQ.zt != ''){
			postDataTmp.zt = vm.driverCardQ.zt;
		}
		if(vm.driverCardQ.xm && vm.driverCardQ.xm != ''){
			postDataTmp.xm = vm.driverCardQ.xm;
		}
		/*if((typeof (vm.driverCardQ.hasTrace) != 'undefined') && (vm.driverCardQ.hasTrace || vm.driverCardQ.hasTrace != '')){
			postDataTmp.hasTrace = "1";
		}else{
			postDataTmp.hasTrace = "";
		}*/
		if(vm.driverCardQ.vehicleCnt == 2){
			vm.driverCardQ.vehicleCnt == '1';
			postDataTmp.hasTrace = "1";
			vm.driverCardQ.hasTrace = "1";
		}else{
			postDataTmp.hasTrace = "";
			vm.driverCardQ.hasTrace = "";
		}
		postDataTmp.gridAssigned =vm.driverCardQ.gridAssigned;
		postDataTmp.vehicleCnt =vm.driverCardQ.vehicleCnt;
		
		vm.postDataTmp = JSON.parse(JSON.stringify(postDataTmp));
		oldQ = JSON.parse(JSON.stringify(vm.driverCardQ));
		$("#jqGrid").jqGrid({
			url: "qw/driverCard/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 1, key: true, hidden:true },
//				{ label: 'XX编号', name: 'dabh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '姓名', name: 'xm', width: 50, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '性别', name: 'xb', width: 35, sortable:false, formatter: function(value, options, row){return value=='1'?'男':'女';}},
				{ label: '驾驶证', name: 'sfzmhm', width: 140, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'ZJCX', name: 'zjcx', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'QF日期', name: 'qfrq', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'SY日期', name: 'syrq', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'CCFZJG', name: 'ccfzjg', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				/*{ label: '积分', name: 'ljjf', width: 30, sortable:false, formatter: function(value, options, row){return value;}},*/
				{ label: '状态', name: 'zt', width: 35, sortable:false, formatter: function(value, options, row){
						var r = "超分";
						switch (vm.driverCardQ.zt) {
						case 'B':
							r = "超分";
							break;
						case 'F':
							r = "吊销";
							break;
						case 'D':
							r = "暂扣";
							break;
						case 'SD':
							r = "涉毒";
							break;
						default:
							break;
						}
						return r;
					}
				},
//				{ label: 'ly', name: 'ly', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'XZQH', name: 'xzqh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'fzqr', name: 'fzrq', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'GLBM', name: 'glbm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'SFZMMC', name: 'sfzmmc', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'HMCD', name: 'hmcd', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'xb', name: 'xb', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'CSRQ', name: 'csrq', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'GJ', name: 'gj', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'DJZSXZQH', name: 'djzsxzqh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: '地址', name: 'djzsxxdz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'LXZSXZQH', name: 'lxzsxzqh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '地址', name: 'djzsxxdz', width: 60, sortable:false,hidden:true/*, formatter: function(value, options, row){return value;}*/},
//				{ label: 'SYYXQZ', name: 'syyxqz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '地理位置', name: 'shape', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '中队', name: 'groupName', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '责任区', name: 'gridName', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '中队', name: 'zdId', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '责任区', name: 'gridId', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '名下车辆', name: 'ywcl', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
//				{ label: '近一周轨迹', name: 'traceCnt', width: 70, sortable:false, formatter: function(value, options, row){
//					if(value >0){
//						return "<span class='label label-danger'>有</span>"
//					}
//					return "<span class='label label-default'>无</span>"
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
				if(vm.driverCardQ.hasTrace == '1' && data.all && data.all.length>0){
					vm.showDownload = true;
				}else{
					vm.showDownload = false;
				}
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
				vm.selDriver = rowData;
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