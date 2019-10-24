define(function(require) {
	var htmlStr = require('text!./vmsListPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var queryResPolygons = []; //查询后绘制至地图的施工区域集合
	//在地图中添加MouseTool插件
	var vmsId=null;
	var vmsApp = null;
	
	var show = function(sId) {
		vmsId=sId;
		itsGlobal.showLeftPanel(htmlStr);
		
		vmsApp = new Vue({
			el: '#vms-app',
			data: {
				vmsQ: {}, //查询参数
				vms: {status:''},
				newGridPolygon:null,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0
			},
			methods: {
				query: function () {
					vmsId=null;
					vmsApp.reload();
				},
				reset: function () {
					queryResPolygons = [];
					map.getOverlayLayer().clear();
				},
				add: function () {
					vmsApp.vms = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					
					$("#liQuery").removeClass("active");
					$("#liDetail").show();
					$("#liDetail").addClass("active");
					$("#vmsQuery").removeClass("tab-pane fade in active");
					$("#vmsQuery").addClass("tab-pane fade");
					$("#vmsDetail").removeClass("tab-pane fade");
					$("#vmsDetail").addClass("tab-pane fade in active");
					
					editVms(id);
				},
				save: function () {
				    //表单验证
				    $("#detailForm").validate({
				    	 //!!!验证时请替换为真实字段
				    	rules: {
				    		height: {
		    					number: true
			    			},
			    			width: {
		    					number: true
			    			}
				    	},
				    	messages: {
				    		height: {
			    				number: "高度必须是数字"
			    			},
			    			width: {
			    				number: "宽度必须是数字"
			    			}
				    	},
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							var url = "./dev/vms/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(vmsApp.vms),
							    success: function(rslt){
							    	if(rslt.code === 200){
										alert('操作成功', function(index){
											vmsApp.reload();
											//layer.closeAll('page');
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
						    url: "./dev/vms/purge/"+id,
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
					//vmsApp.reset();
					$("#liDetail").removeClass("active");
					$("#liQuery").addClass("active");
					$("#vmsDetail").removeClass("tab-pane fade in active");
					$("#vmsDetail").addClass("tab-pane fade");
					$("#vmsQuery").removeClass("tab-pane fade");
					$("#vmsQuery").addClass("tab-pane fade in active");
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		
		loadJqGrid();
		editVms(sId);
		
		vueEureka.set("leftPanel", {
			vue: vmsApp,
			description: "vms的vue实例"
		});
	};
	
	var editVms = function(id){
		$.ajax({
			type: "POST",
		    url: "./dev/vms/detail/"+id,
		    success: function(rslt){
				if(rslt.code == 200){
					vmsApp.vms = rslt.vms;
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
	
	var loadJqGrid = function() {
		vmsApp.vmsQ.id=vmsId;
		$('#jqGrid').jqGrid('GridUnload');
	    $("#jqGrid").jqGrid({
	        url: "./dev/vms/pageData",
	        datatype: "json",
	        postData: vmsApp.vmsQ,
	        colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '诱导屏编号', name: 'vmsId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '诱导屏名称', name: 'vmsName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: 'IP地址', name: 'ip', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '点位信息', name: 'shape', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '位置描述', name: 'location', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '朝向', name: 'orientation', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '智能卡厂商', name: 'manuId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '状态', name: 'status', width: 60, sortable:false, formatter: function(value, options, row){return statusword(value);}},
				//{ label: '宽度', name: 'width', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '高度', name: 'height', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/}
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
	            //layer.msg("加载完毕");
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	vmsApp.edit();
	        },
	        onSelectRow: function(rowid){//选中某行
	    		var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	    	}
	    });
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});

	};
	
	var type2word = function(type){
		var word = "其他";
		switch (type) {
			case "1":
				word = "信号机";
				break;
			case 2:
				word = "监控设备";
				break;
			case 3:
				word = "诱导屏";
				break;
			case 8:
				word = "其他";
				break;
			default:
				break;
		}
		return word;
	}
	
	var statusword = function(status){
		var word = "其他";
		switch (status) {
			case "1":
				word = "正常使用";
				break;
			case "2":
				word = "拆除";
				break;
			case "3":
				word = "维护中";
				break;
			case "8":
				word = "其他";
				break;
			default:
				break;
		}
		return word;
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show : show,
		hide : hide
	};
})