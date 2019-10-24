define(function(require) {
	var htmlStr = require('text!./tempBkPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('my97Datepicker');
	var vm = null;
	var oldQ = '1';
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el : '#tempBk-panel',
			data : {
				search : '',
				queryObj:{},
				newBk:{startDt: TUtils.formatDateTime(TUtils.setDate(new Date()))},
				plateType:"",
				dictList:[],
				bkDictList:[],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			methods : {
				query : function() {
					loadJqGrid();
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					
					$("#liEdit").show();
					$("#liEdit").addClass("active");
					$("#editB").show();
					$("#editC").show();
					
					$("#liQuery").hide();
					$("#liDetail").hide();
					
					$("#queryTab").removeClass("tab-pane fade in active");
					$("#queryTab").addClass("tab-pane fade");
					$("#detailTab").removeClass("tab-pane fade");
					$("#detailTab").addClass("tab-pane fade in active");
					
					$.ajax({
					    url: "bk/temp/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								//trafficControlApp.trafficControlPageList = trafficControlDetail;
								vm.newBk = rslt.temp;
								$("#startDt").val(rslt.temp.startDt);
								$("#endDt").val(rslt.temp.endDt);
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				submitBk : function() {
					$("#detailForm").validate({
						invalidHandler : function() {//验证失败的回调
							return false;
						},
						submitHandler : function() {//验证通过的回调
							var startDt = $("#newBk_startDt").val();
							var endDt = $("#newBk_endDt").val();
							var pEndDt;
							if (endDt != '') {
								pEndDt = new Date(endDt.replace(/-/g, "/"));
								if (pEndDt < Date.now()) {
									alert("结束时间应该在当前时间之后");
									return;
								}
							}
							var plateNo = $("#tempBk-plateNo").val();
							var bk = {
								id:	vm.newBk.id,
								plateNo : plateNo,
								startDt : startDt,
								endDt : endDt,
								plateType: vm.newBk.plateType,
								bkType : vm.newBk.bkType,
								bkBrief : vm.newBk.bkBrief
							};
							var url = "bk/temp/save";
							$.ajax({
								type : "POST",
								url : url,
								data : JSON.stringify(bk),
								success : function(rslt) {
									if (rslt.code === 200) {
										alert('操作成功', function(index){
											vm.reload();
											//layer.closeAll('page');
										});
										
									} else {
										alert(rslt.msg);
									}
								}
							});
						}
					});

				},
				deleteBk: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					var rowData = $("#jqGrid").getRowData(id);  
					var plateNo = "";
					if(rowData && rowData.plateNo){
						plateNo = rowData.plateNo;
					}
					var alertStr = "移除布控车辆 "+plateNo+" ？";
					confirm(alertStr, function(){
						$.ajax({
							type: "POST",
						    url: "./bk/temp/delete/"+id,
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
				cancelBk: function () {
					var alertStr = "撤销布控车辆 "+vm.newBk.plateNo+" ？";
					confirm(alertStr, function(){
						$.ajax({
							type: "POST",
						    url: "./bk/temp/delete/"+vm.newBk.id,
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
					});
				},
				
				close : function() {
					itsGlobal.hideLeftPanel();
				},
				reload:function(){
					$("#liDetail").removeClass("active");
					$("#liQuery").addClass("active");
					$("#liEdit").hide();
					$("#editB").hide();
					$("#editC").hide();
					$("#liQuery").show();
					$("#liDetail").show();
					$("#detailTab").removeClass("tab-pane fade in active");
					$("#detailTab").addClass("tab-pane fade");
					$("#queryTab").removeClass("tab-pane fade");
					$("#queryTab").addClass("tab-pane fade in active");
					$("#newBk_startDt").val('');
					$("#newBk_endDt").val('');
					$("#tempBk-plateNo").val('');
					loadJqGrid();
					this.newBk = {};
					this.queryObj = {};
				},
				setBkDateStart:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){vm.queryObj.startDt = $("#query_startDt").val()}});
				},
				setBkDateEnd:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){vm.queryObj.endDt = $("#query_endDt").val()}});
				},
				setNewBkDateStart:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){vm.newBk.startDt = $("#newBk_startDt").val()}});
				},
				setNewBkDateEnd:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){vm.newBk.endDt = $("#newBk_endDt").val()}});
				}
			}
		});
		$("#editC").hide();
		oldQ=1;
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue : vm,
			description : "tempBkPanel的vue实例"
		});
		initPage();
	}
	var initPage = function(){
		 $.get("./sys/dict/getDictList?type=PLATE_TYPE", function(r){
				if(r.code == 200){
					vm.dictList = r.dictList;
				}else{
					alert(r.msg);
				}
			});
		 $.get("./sys/dict/getDictList?type=BKZLB", function(r){
				if(r.code == 200){
					vm.bkDictList = r.dictList;
				}else{
					alert(r.msg);
				}
			});
	}
	
	var loadJqGrid = function() {
		var queryPlateNo = $("#query_plateNo").val();
		if(queryPlateNo && queryPlateNo.trim() == ''){
			queryPlateNo = null;
		}
		var postDataTmp = {'plateNo': queryPlateNo,'startDt': $("#query_startDt").val(),
				'endDt': $("#query_endDt").val()};
		
		if(TUtils.cmp(postDataTmp,oldQ)){
			oldQ = JSON.parse(JSON.stringify(postDataTmp));
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
			oldQ = JSON.parse(JSON.stringify(postDataTmp));
			$('#jqGrid').jqGrid('GridUnload');
			$("#jqGrid").jqGrid({
				url: "./bk/temp/pageData",
				datatype: "json",
				postData: postDataTmp,
				colModel: [
				           { label: 'id', name: 'id', width: 30, key: true, hidden:true },
				           { label: '车牌号', name: 'plateNo',  sortable:false, width: 30},
				           { label: '号牌类型', name: 'label', width: 30, sortable:true},
				           { label: '开始时间', name: 'startDt', index:'start_dt', width: 45, sortable:true, formatter: function(value, options, row){
				        	   return value ? value: 'N/A';
				           }},
				           { label: '恢复时间', name: 'endDt',  index:'end_dt', width: 45, sortable:true, formatter: function(value, options, row){
				        	   return value ? value: 'N/A';
				           }},
				           { label: '布控类型', name: 'bkTypeLabel', width: 30, sortable:true},
				           { label: '布控案由', name: 'bkBrief', width: 30, sortable:true},
				           { label: '轨迹查询', width: 25, sortable:false, formatter: function(value, options, row){
				        	   return "<button data-toggle='tooltip' title='查询历史轨迹' data-placement='right' type='button' data-pid="+ row.id +" class='btn btn-link btn-sm history-trace-query' style='width: 50px;'><span class='fa fa-car' aria-hidden='true'></span></button>";
				           }},
				           ],
				           viewrecords: true,
				           height: 260,
				           width:490,
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
				        	   layer.msg("加载完毕");
				        	   $('.history-trace-query').bind("click",function(){
				        		   var id = $(this).data("pid");
				        		   var rowData = $("#jqGrid").getRowData(id);  
				        		   if(rowData){
				        			   var start=null, end=null, plateNo=null;
				        			   if(rowData.startDt && rowData.startDt != "N/A"){
				        				   start = rowData.startDt;
				        			   }
				        			   if(rowData.endDt && rowData.endDt != "N/A"){
				        				   end = rowData.endDt;
				        			   }
				        			   plateNo = rowData.plateNo;
				        			   require(["panels/vehicleTrace/vehicleTrace"],function(vehTrace){
				        				   vehTrace.loadCarTrace(true, plateNo,start,end);
				        			   });
				        		   }
				        	   })
				           },
				           gridComplete:function(){
				        	   //隐藏grid底部滚动条
				        	   $("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
				           },
				           ondblClickRow: function(rowid, iRow, iCol, e){
				        	   vm.edit();
				           },
				           onSelectRow: function(rowid, status){//选中某行
				           }
			});
		}
	};

	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show : show,
		hide : hide
	};
})