define(function(require) {
	var htmlStr = require('text!./oftenJamPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('datetimepicker');
	var vm = null;
	var oldQ = '1';
	var mousetool = null;
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/jtyd.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.MarkerTool(new IMAP.Icon(("./assets/images/jtyd.png"), new IMAP.Size(24, 26)));
		mousetool.follow=true;
		mousetool.autoClose=true;
		mousetool.title="点击左键标注拥堵点";
		map.addTool(mousetool);
	});
	var rhMarker;
	
	var typeMap={},classMap={},StatusMap={};
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#oftenJam-panel',
			data: {
				showList: 0, //显示查询
				oftenJamQ: {}, //查询参数
				oftenJam: {},
				jamType:{},
				jamClass:{},
				selectedRow:{},
				teamList:[],
				dutyGridList:[],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.oftenJamQ = {};
					map.getOverlayLayer().clear();
				},
				add: function () {
					vm.title="新增";
					vm.showList = 1;
					vm.oftenJam = {isNewRecord:true,reason:"",type:"",status:"2"};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					
					$.ajax({
						url: "./qw/oftenJam/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								if(rslt.oftenJam.status == 3){
									alert("该记录已完成，不能修改！")
									return ;
								}
								vm.title="编辑";
								vm.showList = 1;
								vm.oftenJam = rslt.oftenJam;
								
								$("#groupId").selectpicker('val', vm.oftenJam.groupId);
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
							var url = "./qw/oftenJam/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.oftenJam),
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
							url: "./qw/oftenJam/purge/"+id,
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
				relevance: function() {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "./qw/oftenJam/detail/"+id,
						async: false,
						success: function(rslt){
							if(rslt.code == 200){
								vm.selectedRow = rslt.oftenJam;
							}else{
								alert(rslt.msg);
							}
						}
					});
					
					var data = vm.selectedRow;
					data.qwType = "8";
					data.approveDt = vm.selectedRow.createDt;
					data.team = vm.selectedRow.groupId;
					data.aor = vm.selectedRow.gridId;
					var dutyRelevancePanel = require(['../../bottomPanel/dutyRelevance/dutyRelevancePanel'],function(dutyRelevancePanel){
						dutyRelevancePanel.show(data);
			        });
				},
				showOneRhPost: function (rhPost) {
					vm.clearRhPost();
					
		    		var lngLat = TUtils.str2Lnglat(rhPost.jamSpot);
					rhMarker = new IMAP.Marker(lngLat, markerOpts);
					rhMarker.data = rhPost;
		        	map.getOverlayLayer().addOverlay(rhMarker, false);
		    		map.setCenter(lngLat,18);
				},
				addRhPost: function () {
					vm.clearRhPost();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						rhMarker = evt.overlay;
						vm.oftenJam.jamSpot = TUtils.lnglat2Str(evt.overlay.getPosition());
						$("#jamSpot").val(vm.oftenJam.jamSpot);
						mousetool.close();

						var url = "./jcsj/cross/getNearestCross?lng="+evt.overlay.getPosition().lng+"&lat="+evt.overlay.getPosition().lat;
					    $.get(url, function(r){
							if(r.code == 200){
								vm.oftenJam.roadName = r.cross.mc;
								$("#roadName").val(vm.oftenJam.roadName);
							}else{
								alert(r.msg);
							}
						});
					   /* var rurl = "./qw/oftenJam/getRegion?shape="+vm.oftenJam.jamSpot;
					    $.get(rurl, function(r){
							if(r.code == 200){
								if(r.dutyGrid == null || r.dutyGrid == ""){
									vm.clearRhPost();
									alert("点位附件没有责任区，请重新选择点位!");
								}else{
									vm.oftenJam.gridId = r.dutyGrid.gridId;
									vm.oftenJam.gridIdName = r.dutyGrid.gridName;
									$("#gridIdName").val(r.dutyGrid.gridName);
									
									vm.oftenJam.groupId = r.dutyGrid.group.groupId;
									vm.oftenJam.groupIdName = r.dutyGrid.group.groupName;
									$("#groupIdName").val(r.dutyGrid.group.groupName);
								}
							}else{
								alert(r.msg);
							}
						});*/
					},this);
				},
				clearRhPost: function(){
					if(rhMarker){
						map.getOverlayLayer().removeOverlay(rhMarker);
					}
					rhMarker = null; 
					vm.oftenJam.jamSpot='';
					$("#jamSpot").val(vm.oftenJam.jamSpot);
					$("#roadName").val("");
					vm.oftenJam.gridId = "";
					vm.oftenJam.groupId = "";
				},
				reload: function () {
					vm.showList = 0;
					if(TUtils.cmp(vm.oftenJamQ.roadName,oldQ)){
						var postDataTmp = {roadName:vm.oftenJamQ.roadName};
						oldQ = vm.oftenJamQ.roadName;
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
				getDutyListByTeamId: function() {
					var gid=vm.oftenJam.gridId;
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.oftenJam.groupId, function(r){
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
				close: function() {
					vm.reset();
					map.setCenter(new IMAP.LngLat(121.128187, 31.464808),14);
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		
		
		$.get("./sys/dict/getDictList?type="+"JAM_TYPE", function(r){
			if(r.code == 200){
				vm.jamType = r.dictList;
				typeMap=forMap(vm.jamType);
			}else{
				alert(r.msg);
			}
		});
		
		$.get("./sys/dict/getDictList?type="+"JAM_CLASS", function(r){
			if(r.code == 200){
				vm.jamClass = r.dictList;
				classMap=forMap(vm.jamClass);
			}else{
				alert(r.msg);
			}
		});
		
		$.get("./sys/dict/getDictList?type="+"duty_status", function(r){
			if(r.code == 200){
				StatusMap=forMap(r.dictList);
			}else{
				alert(r.msg);
			}
		});
		oldQ=1;
		loadJqGrid();
		loadGroups();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "oftenJamPanel的vue实例"
		});
	}
	
	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				//if(currentUser.jjddUser){
				vm.teamList =r.groupList;
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupId').selectpicker({
						noneSelectedText:'请选择',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
					$('#gridId').selectpicker({
						noneSelectedText:'请选择',
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
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {roadName:vm.oftenJamQ.roadName};
		oldQ = vm.oftenJamQ.roadName;
		$("#jqGrid").jqGrid({
			url: "./qw/oftenJam/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '道路名称', name: 'roadName', width: 75, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '拥堵类型', name: 'type', width: 65, sortable:false, formatter: function(value, options, row){
					return classMap[value];}},
				{ label: '拥堵原因', name: 'reason', width: 65, sortable:false, formatter: function(value, options, row){
					return typeMap[value];}},
					{ label: '点位', name: 'jamSpot', hidden:true, width: 100, sortable:false},
				{ label: '拥堵时间', name: 'jamTime', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '采取措施', name: 'takeSteps', width: 90, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属中队', name: 'groupIdName', width: 90, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '状态', name: 'status', width: 60,hidden:true, sortable:false, formatter: function(value, options, row){
					return StatusMap[value];}},
			],
			viewrecords: true,
			height: 290,
			rowNum: 10,
			rowList : [10,30,50],
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
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
	        },
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				vm.showOneRhPost(rowData);
			}
		});
	};
	
	var forMap = function(dList){
		var n = {};
		for(var i =0;i<dList.length;i++){
			n[dList[i].value]  = dList[i].label;
		}
		return n;
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}
	
	/*<start>********************** 勤务页面数据展示 ********************/
	var qwOftenJamArr = [];
	var renderQwData = function(dataList){
		if(qwOftenJamArr.length>0){
    		for (var t = 0; t < qwOftenJamArr.length; t++) {
				var ele = qwOftenJamArr[t];
				map.getOverlayLayer().removeOverlay(ele);
			}
    		qwOftenJamArr = [];
		}
		if(dataList){
			for(var i = 0; i < dataList.length; i++){
				var data = dataList[i];
				if(data && data.jamSpot){
					var lngLat = TUtils.str2Lnglat(data.jamSpot);
					var marker = new IMAP.Marker(lngLat, markerOpts);
					marker.data = data;
					marker.addEventListener(IMAP.Constants.CLICK, qwMarkerClick);
					map.getOverlayLayer().addOverlay(marker, false);
					qwOftenJamArr.push(marker);
				}
			}
			layer.msg('加载了 '+dataList.length+" 个拥堵点数据");
		}
	};
	//单击事件
	var qwMarkerClick = function(e) {
		var marker = e.target;
		var data = e.target.data;
		map.setCenter(e.lnglat,16);
		var status = "已完成";
		switch(data.status){
			case 0:
				status="待指定中队";break;
			case 1:
				status="待指定责任区";break;
			case 2:
				status="待关联";break;
			case 3:
				status="已完成";break;
			default:
				break;
		}
		var rd = data.roadName?"路段名："+data.roadName:"";
		alert(rd+"</br>拥堵时间："+data.jamTime+"</br>状态："+status);
	};
	/*<end>********************** 勤务页面数据展示 ********************/
	
	return {
		show: show,
		hide: hide,
		renderQwData:renderQwData
	};
})