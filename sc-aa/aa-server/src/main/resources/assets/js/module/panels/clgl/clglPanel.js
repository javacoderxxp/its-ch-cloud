define(function(require) {
	var htmlStr = require('text!./clglPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var oldQ =1;
	var mousetool = null, locationMarker,dutyGridPolygon, infowindow = null;
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/bzlocate.png"), new IMAP.Size(24, 26)));
		mousetool.follow=true;
		mousetool.autoClose=true;
		mousetool.title="点击左键标注车辆所在地地点";
		map.addTool(mousetool);
	});
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#clgl-panel',
			data: {
				showList: true, //显示查询
				clglQ: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :''), zt:'Q', gridAssigned:'0'}, //查询参数
				clgl: {groupId:'',gridId:'',point:''},
				groupList:[],
				dutyGridList:[],
				plateTypeDicts:[],
				page:'',
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			methods: {
				init:function(){
					/*require(['bootstrapSelect','bootstrapSelectZh'],function(){
						
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
					});*/
				},
				query: function () {
					vm.reload();
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.clgl = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "qw/clgl/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								if(!rslt.clgl.point){
									rslt.clgl.point = '';
								}
								if(!rslt.clgl.groupId){
									rslt.clgl.groupId = '';
								}
								if(!rslt.clgl.gridId){
									rslt.clgl.gridId = '';
								}
								vm.clgl = rslt.clgl;
								
								/*vm.clgl.zt = type2word(vm.clgl.zt);*/
								/*$("#groupId").selectpicker('val', vm.clgl.groupId);*/
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
							/*if(!vm.clgl.groupId || vm.clgl.groupId == ''){
								alert('中队不能为空');
								return;
							}*/
							/*if(!vm.clgl.gridId || vm.clgl.gridId == ''){
								alert('责任区不能为空');
								return;
							}*/
							
							/*if(vm.clglQ.zt =='Q' || vm.clglQ.zt=='G'){
								alert('重点车辆所属中队和责任区不允许直接修改，请修改该车辆所属企业的中队和责任区！');
								return;
							}*/
							
							vm.clgl.gridId =$("#gridId").val();
							var url = "qw/clgl/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.clgl),
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
				relocate:function(){
					this.clearLocation();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						locationMarker = evt.overlay;
						vm.clgl.point = TUtils.lnglat2Str(locationMarker.getPosition());
						$("#point").val(vm.clgl.point);
						mousetool.close();
					},this);
				},
				clearLocation:function(){
					if(locationMarker){
						map.getOverlayLayer().removeOverlay(locationMarker);
					}
					locationMarker = null;
				},
				getDutyListByTeamId: function() {
					this.clearGrid();
					var gid=vm.clgl.gridId;
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.clgl.groupId, function(r){
						if(r.code == 200){
							vm.dutyGridList = r.dutyGridList;
							vm.clgl.gridId = gid;
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
					if(this.clgl.groupId && this.clgl.groupId != ''){
						if(this.clgl.gridId && this.clgl.gridId != ''){
							for(var i=0;i<this.dutyGridList.length;i++){
								var grid = this.dutyGridList[i];
								if(grid.gridId == this.clgl.gridId){
									this.drawGrid(grid.shape);
									break;
								}
							}
						}
					}
				},
				reload: function () {
					vm.showList = true;
					if(TUtils.cmp(vm.clglQ,oldQ)){
						var postDataTmp = vm.clglQ;
						oldQ = JSON.parse(JSON.stringify(vm.clglQ));
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
				},
				close: function() {
					itsGlobal.hideLeftPanel();
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
		loadPlateTypes();
		loadJqGrid();
		vm.init();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "clglPanel的vue实例"
		});
	}
	
	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				vm.groupList =r.groupList;
				/*
				vm.teamList =r.groupList;
				vm.groupListQ = JSON.parse(JSON.stringify(r.groupList));
				vm.groupListQ.unshift({groupName:'所有'});
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
					$('#groupId').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
				});*/
			}else{
				alert(r.msg);
			}
		});
	};
	
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
		oldQ = JSON.parse(JSON.stringify(vm.clglQ));
		$("#jqGrid").jqGrid('GridUnload');
		$("#jqGrid").jqGrid({
			url: "qw/clgl/pageData",
			datatype: "json",
			postData: vm.clglQ,
			/*page:vm.page,*/
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '序号', name: 'xh', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '号牌种类', name: 'hpzl', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车牌号码', name: 'hphm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所有人', name: 'syr', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '处理序号', name: 'clxh', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '初次登记日期', name: 'ccdjrq', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '强制报废日期', name: 'qzbfqz', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '有效期止', name: 'yxqz', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车辆状态', name: 'zt', width: 60, sortable:false, formatter: function(value, options, row){return type2word(value);}},
				{ label: '所属中队', name: 'groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属责任区', name: 'gridName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			],
			viewrecords: true,
			height: 290,
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
				var queryList = data.page.list;
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
	
	var type2word = function(type){
		var word = "";
		if(type.indexOf("Q")>-1){
			word =word + "逾期未检验";
		}
		if(type.indexOf("G")>-1){
			word =word + "/违法未处理";
		}
		if(word.slice(0,1) == "/"){
			word=word.replace('/','');
		}
		return word;
	}
	
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})