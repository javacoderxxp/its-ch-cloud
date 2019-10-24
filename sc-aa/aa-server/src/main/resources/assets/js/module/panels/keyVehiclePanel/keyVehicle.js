define(function(require) {
	var htmlStr = require('text!./keyVehicle.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	var oldQ= '1';
	var polylineTool=new IMAP.PolylineTool();;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#keyVehicle-panel',
			data: {
				showList: true, //显示查询
				plateTypeList:[],
				vehTypeList:[],
				keyVehicleQ: {}, //查询参数
				keyVehicle: {},
				groupList:[]
			},
			methods: {
				query: function () {
					vm.reload();
				},
				add: function () {
					vm.showList = false;
					vm.keyVehicle = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
					    url: "cljg/keyVehicle/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								vm.showList = false;
								vm.keyVehicle = rslt.keyVehicle;
								
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
//					vm.keyVehicle.inspectionExpiryDt = $("#inspectionExpiryDt").val();
					
				    $("#detailForm").validate({
				        invalidHandler : function(){
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							var url = "cljg/keyVehicle/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(vm.keyVehicle),
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
					confirm('确定清除？', function(){
						$.ajax({
							type: "POST",
						    url: "cljg/keyVehicle/purge/"+id,
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
				addRhPost:function(){
					vm.clearRhPost();
					var lastId = null;
					polylineTool.arrow = false;
					polylineTool.autoClose = true;//是否自动关闭绘制	
					map.addTool(polylineTool);
					polylineTool.open();
					polylineTool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						lastId=evt.overlay.getId();
						//console.log(evt.overlay);
						vm.keyVehicle.lines = TUtils.polygonPath2Str(evt.overlay.getPath());
						$("#lines").val(vm.keyVehicle.lines);
						polylineTool.close();
					},this);
					
				},
				clearRhPost:function(){
					map.getOverlayLayer().clear();
					polylineTool.clear();
					vm.keyVehicle.lines = "";
					$("#lines").val("");
				},
				xsPolyline:function(llss){
					var plo = new IMAP.PolylineOptions();
					plo.strokeColor = "#000000";
					plo.strokeOpacity = "1";
					plo.strokeWeight = "3";
					plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;//实线
					plo.editabled = false;
					plo.strokeStyle = "1";
					var polyline = new IMAP.Polyline(TUtils.polygonStr2Path(llss), plo);
					map.getOverlayLayer().addOverlay(polyline, false);

				},
	    		/*init97DateExpiryDt: function(it){
	    			WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){
	    				vm.keyVehicle.inspectionExpiryDt = $("#inspectionExpiryDt").val()}});
	    		},*/
				init97DatePassStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){
						vm.keyVehicle.passStartDt = $("#passStartDt").val()}});
				},
				init97DatePassEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){
						vm.keyVehicle.passEndDt = $("#passEndDt").val()}});
				},
				reload: function () {
					map.getOverlayLayer().clear();
					vm.showList = true;
					loadJqGrid();
				},
				close: function() {
					map.getOverlayLayer().clear();
					itsGlobal.hideLeftPanel();
				}
			}
		});
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "keyVehicle的vue实例"
		});
		oldQ=1;
		loadListForSelect();
		loadJqGrid();
		loadGroupList();

		require(['datetimepicker'],function(){
			$(".form_datetime").datetimepicker({language: "zh-CN", minView: 2, format: 'yyyy-mm-dd', autoclose: true});
		})

	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	var loadListForSelect = function(){
	    $.get("cljg/keyVehicle/getPlateTypeList", function(r){
			if(r.code == 200){
				vm.plateTypeList = r.plateTypeList;

				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#caruse').selectpicker({
						noneSelectedText:'请选择一个路口',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
				});
			}else{
				alert(r.msg);
			}
		});
	    
	    $.get("cljg/keyVehicle/getVehTypeList", function(r){
			if(r.code == 200){
				vm.vehTypeList = r.vehTypeList;

				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#cartype').selectpicker({
						noneSelectedText:'请选择一个路口',
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
	
	var loadGroupList = function() {
	    $.get("aa/group/allData?zdFlag=1", function(r){
			if(r.code == 200){
				vm.groupList = r.groupList;
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadJqGrid = function(){
		var postDataTmp = vm.keyVehicleQ;
		
		if(TUtils.cmp(vm.keyVehicleQ,oldQ)){
			oldQ = JSON.parse(JSON.stringify(vm.keyVehicleQ));
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
			oldQ = JSON.parse(JSON.stringify(vm.keyVehicleQ));
			$("#jqGrid").jqGrid('GridUnload');
			$("#jqGrid").jqGrid({
				url: "cljg/keyVehicle/pageData",
				postData: postDataTmp,
				datatype: "json",
				colModel: [
				           { label: 'id', name: 'id', width: 5, key: true, hidden:true },
				           { label: '车牌号', name: 'plateNo', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '号牌种类', name: 'plateType', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '使用性质', name: 'type', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '公司名称', name: 'company', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '单位性质', name: 'dwxz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '线路', name: 'lines', width: 120, sortable:false,hidden:true/*, formatter: function(value, options, row){return value;}*/},
				           { label: '过检日期', name: 'inspectionExpiryDt', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '所属中队', name: 'groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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
				           ondblClickRow: function(rowid, iRow, iCol, e){
				        	   vm.edit();
				           },
				           onSelectRow: function(rowid){//选中某行
				        	   map.getOverlayLayer().clear();
				        	   var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				        	   if(rowData.lines){
				        		   vm.xsPolyline(rowData.lines);
				        	   }
				           }
			});
		}
	}

	return {
		show: show,
		hide: hide
	};
})