define(function(require) {
	var htmlStr = require('text!./policeService.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('datetimepicker');
	
	var policeServiceApp = null;
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		
		policeServiceApp = new Vue({
			el: '#policeService-panel',
			data: {
				teamList:[],
				dutyGridListQ:[],
				dutyGridList:[],
				onlySearch:false,
				policeService:{team:''}
			},
			watch:{
				'policeService.team': {
					//deep : true,
					handler : function(val, oldVal) {
						policeServiceApp.initAORDropListUI();
					}
				}
			},
			methods: {
				initAORDropListUI:function(){
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+$("#team").val(), function(r){
						if(r.code == 200){
							policeServiceApp.dutyGridListQ = r.dutyGridList;
							require(['bootstrapSelect','bootstrapSelectZh'],function(){
								$('#aor').selectpicker('destroy');
								$('#aor').selectpicker({
									noneSelectedText:'请选择一个责任区',
									liveSearch: true,
									style: 'btn-default',
									size: 10
								});
								
							});
						}else{
							alert(r.msg);
						}
					});
				},
				query: function () {
					policeServiceApp.reload();
				},
				add: function () {
					policeServiceApp.policeService = {isNewRecord:true};
				},
				edit: function () {
					policeServiceApp.policeService.team = '';
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					
					$.ajax({
					    url: "./qw/policeService/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								policeServiceApp.policeService = rslt.policeService;
								$("#startDt").val(rslt.policeService.startDt);
								$("#endDt").val(rslt.policeService.endDt);
								$("#aorId").selectpicker('val',rslt.policeService.aor);
								$("#liEdit").show();
								$("#liEdit").addClass("active");
								$("#editB").show();
								$("#liQuery").hide();
								$("#liDetail").hide();
								$("#policeServiceQuery").removeClass("tab-pane fade in active");
								$("#policeServiceQuery").addClass("tab-pane fade");
								$("#policeServiceDetail").removeClass("tab-pane fade");
								$("#policeServiceDetail").addClass("tab-pane fade in active");
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
							var url = "./qw/policeService/save";
							policeServiceApp.policeService.startDt=$("#startDt").val();
							policeServiceApp.policeService.endDt=$("#endDt").val();
							var startDt = $("#startDt").val();
							var endDt = $("#endDt").val();
							var planStartDt = new Date(startDt.replace(/-/g,"/"));
							var planEndDt = new Date(endDt.replace(/-/g,"/"));
							
							if(planStartDt<=planEndDt){
								$.ajax({
									type: "POST",
								    url: url,
								    data: JSON.stringify(policeServiceApp.policeService),
								    success: function(rslt){
								    	if(rslt.code === 200){
											alert('操作成功', function(index){
												policeServiceApp.reload();
											});
										}else{
											alert(rslt.msg);
										}
									}
								});
					            return false;//已经用AJAX提交了，需要阻止表单提交
							}else{
								layer.msg("恢复时间必须在发生时间之后");
							}
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
						    url: "./qw/policeService/purge/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									policeServiceApp.reload();
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
					if(policeServiceApp.onlySearch){
						$("#liDetail").hide();
					}else{
						$("#liDetail").removeClass("active");
						$("#liDetail").show();
					}
					
					$("#liQuery").addClass("active");
					$("#liEdit").hide();
					$("#editB").hide();
					$("#liQuery").show();
					$("#policeServiceDetail").removeClass("tab-pane fade in active");
					$("#policeServiceDetail").addClass("tab-pane fade");
					$("#policeServiceQuery").removeClass("tab-pane fade");
					$("#policeServiceQuery").addClass("tab-pane fade in active");
					$("#startTime").val("");
					$("#endTime").val("");
					initPage();
					loadJqGrid();
					
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				},
			}
		});
		
		initPage();
		
		loadJqGrid();
		
		vueEureka.set("leftPanel", {
			vue: policeServiceApp,
			description: "policeService的vue实例"
		});
	};
	
	var initPage = function(){
		//初始化中队下拉框
		$.get("./aa/group/getAllTeams", function(r){
			if(r.code == 200){
				policeServiceApp.teamList = r.teamList;
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#team').selectpicker('destroy');
					$('#team').selectpicker({
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
		
		
		require(['bootstrapSelect','bootstrapSelectZh'],function(){
			if(currentUser.jjzdUser){
				$("#team").selectpicker('val',currentUser.group.groupId);
				$("#team").attr('disabled',true);
			}else{
				$("#team").selectpicker('val',null);
			}
		});
		
		$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+currentUser.group.groupId, function(r){
			if(r.code == 200){
				policeServiceApp.dutyGridListQ = r.dutyGridList;
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#aor').selectpicker('destroy');
					$('#aor').selectpicker({
						noneSelectedText:'请选择一个责任区',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
					
				});
			}else{
				alert(r.msg);
			}
		});
		
		$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+currentUser.group.groupId, function(r){
			if(r.code == 200){
				policeServiceApp.dutyGridList = r.dutyGridList;
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#aorId').selectpicker('destroy');
					$('#aorId').selectpicker({
						noneSelectedText:'请选择一个责任区',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
				});
			}else{
				alert(r.msg);
			}
		});
		
		$("#startDt").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true
			}).on('changeDate', function(ev){
				var startDt= $("#startDt").val();
				$('#endDt').datetimepicker('setStartDate', startDt);
			});
		
		$("#endDt").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true
			}).on('changeDate', function(ev){
				var endDt= $("#endDt").val();
				$('#startDt').datetimepicker('setEndDate', endDt);
			});
				
		$("#startTime").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true
			}).on('changeDate', function(ev){
				var startTime= $("#startTime").val();
				$('#startTime').datetimepicker('setStartDate', startTime);
			});
		
		$("#endTime").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true
			}).on('changeDate', function(ev){
				var endTime= $("#endTime").val();
				$('#endTime').datetimepicker('setStartDate', endTime);
			});
		
		//判断当前登录用户所在中队
		var perList = currentUser.permissionIdList;
		if(perList.length > 0){
			for(var i = 0;i<perList.length;i++){
				if(perList[i] == 'F_QW_QUERY_BTN_ONLY'){  //只有查询的权限
					policeServiceApp.onlySearch = true;
					break;
				}else{
					continue;
				}
			}
		}
		
		
	}
	
	var loadJqGrid = function() {
		$('#jqGrid').jqGrid('GridUnload');
		var postDataTmp = {'team': $("#team").val(),'aor':$("#aor").val(),'startTime': $("#startTime").val(),
				'endTime': $("#endTime").val()};
		
	    $("#jqGrid").jqGrid({
	        url: "./qw/policeService/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 30, key: true, hidden:true },
	        	{label: '责任区',name: 'aor',width : 35,sortable : true }, 
				{ label: '开始时间', name: 'startDt', width: 40, sortable:false , formatter: function(value, options, row){
					return value ? value: '-';
				}},
				{ label: '结束时间', name: 'endDt',  width: 40, formatter: function(value, options, row){
					return value ? value: '-';
				}},
				{ label: '受理总数', name: 'serviceTotal',  width: 25, sortable:true, formatter: function(value, options, row){
					return value ? value: '-';
				}},
				{ label: '损失金额', name: 'lossAmount',  width: 25, sortable:true, formatter: function(value, options, row){
					return value ? value: '-';
				}}
			 ],
			viewrecords: true,
	        height: 260,
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
	            layer.msg("加载完毕");
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        onSelectRow: function(rowid, status){//选中某行
	        	var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	        	policeServiceApp.selectedRow = rowData;
	        
	    	}
	    });
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	};

	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show : show,
		hide : hide
	};
})