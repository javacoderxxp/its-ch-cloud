define(function(require) {
	var htmlStr = require('text!./roadFacilitiesPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var mousetool = null, locationMarker,dutyGridPolygon, infowindow = null;
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/bzlocate.png"), new IMAP.Size(24, 26)));
		mousetool.follow=true;
		mousetool.autoClose=true;
		mousetool.title="点击左键标注设施点位";
		map.addTool(mousetool);
	});
	
	var show = function(rfs,boo) {
		var shape = rfs.shape;
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#roadFacilities-panel',
			data: {
				showList: false, //显示查询
				roadFacilitiesQ: {type:''}, //查询参数
				roadFacilities: {type:'',subtype:'',status:''},
				groupListQ:[],
				teamList:[],
				lbList:[],
				dutyGridList:[]
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.roadFacilitiesQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.roadFacilities = {isNewRecord:true,type:'',subtype:'',status:''};
				},
				edit: function (rId) {
					var id;
					if(rId){
						id = rId;
					}else{
						id = TUtils.getSelectedRow();
					}
					
					if(id == null){
						return ;
					}
					$.ajax({
						url: "jtss/roadFacilities/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.roadFacilities = rslt.roadFacilities;
								if(vm.roadFacilities.type == 2){
							    	$("#st").show();
							    }
								$("#groupId").selectpicker('val', vm.roadFacilities.groupId);
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
							var url = "jtss/roadFacilities/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.roadFacilities),
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
				getDutyListByTeamId: function() {
					var gid=vm.roadFacilities.gridId;
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.roadFacilities.groupId, function(r){
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
				relocate:function(){
					this.clearLocation();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						locationMarker = evt.overlay;
						vm.roadFacilities.shape = TUtils.lnglat2Str(locationMarker.getPosition());
						$("#shape").val(vm.roadFacilities.shape);
						toGeocoder(locationMarker.getPosition());
						mousetool.close();
					},this);
				},
				clearLocation:function(){
					if(locationMarker){
						map.getOverlayLayer().removeOverlay(locationMarker);
					}
					locationMarker = null;
				},
				del: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除(使失效)？', function(){
						$.ajax({
							type: "POST",
							url: "jtss/roadFacilities/delete/"+id,
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
							url: "jtss/roadFacilities/purge/"+id,
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
				reload: function () {
					vm.showList = true;
					$("#st").hide();
					vm.clearLocation();
					vm.roadFacilities= {type:'',subtype:'',status:''};
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		$.get("jtss/bz/findLbList", function(r){
			if(r.code == 200){
				vm.lbList = r.lbList;
				//$("#subtype").val(vm.roadFacilities.subtype);
			}
    	});	
		$('#type').on('change',function(){
			//判断是否选取prompt属性，无返回值；
			    if($(this).val() == 2){
			    	$("#st").show();
			    }else{
			    	$("#st").hide();
			    }
			});
		
		loadGroups(rfs,boo);
		loadJqGrid();
		
		if(boo){
			vm.roadFacilities.shape=shape.lng+","+shape.lat;
			toGeocoder(shape);
		}
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "roadFacilitiesPanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		//var postDataTmp = {id:vm.roadFacilitiesQ.id};
		$("#jqGrid").jqGrid({
			url: "jtss/roadFacilities/pageData",
			datatype: "json",
			postData: vm.roadFacilitiesQ,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '设施编号', name: 'deviceId', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设施名称', name: 'deviceName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设施类型', name: 'type', width: 60, sortable:false, formatter: function(value, options, row){
					return typeWord(value);}},
				{ label: '子类型', name: 'subtype', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '安装路口', name: 'crossId', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '位置描述', name: 'location', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '点位坐标', name: 'shape', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '生产厂家', name: 'manuId', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设施状态', name: 'status', width: 60, sortable:false, formatter: function(value, options, row){
					return statusWord(value);}},
				{ label: '描述信息', name: 'description', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属中队', name: 'groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属责任区', name: 'gridId', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/}
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
	
	var typeWord = function(type){
		var word = "其他";
		switch (type) {
			case '1':
				word = "信号机";
				break;
			case '2':
				word = "标志牌";
				break;
			default:
				break;
		}
		return word;
	}
	
	var statusWord = function(type){
		var word = "其他";
		switch (type) {
			case '1':
				word = "正常";
				break;
			case '2':
				word = "维护中";
				break;
			case '3':
				word = "损坏";
				break;
			default:
				break;
		}
		return word;
	}
	
	//地理编码
	function toGeocoder(shape){
		//var pos = shape;
		map.plugin(['IMAP.Geocoder'], function(){
			var geocoder=new IMAP.Geocoder({city:"太仓市", pois:true});
			geocoder.getAddress(shape,function(status, result) {
	            if (status == 0) {
	            	var plnglat=result.result;
	            	$("#location").val(plnglat[0].formatted_address);
	            	vm.roadFacilities.location = plnglat[0].formatted_address;
	            }
	        });
		});
	}
	
	
	var loadGroups = function(rfs,boo) {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				//if(currentUser.jjddUser){
				vm.teamList = r.groupList;
				vm.groupListQ =  r.groupList;
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					/*$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});*/
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
					if(!boo){
						vm.edit(rfs.id);
					}
				});

			}else{
				alert(r.msg);
			}
			
		});
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})