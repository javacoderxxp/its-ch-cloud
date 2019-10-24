define(function(require) {
	var htmlStr = require('text!./facilitiesManage.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('datetimepicker');
	var queryResPolygons = []; //查询后绘制至地图的施工区域集合
	//在地图中添加MouseTool插件
	var signalId=null;
	var facilitiesManageApp = null;
	
	var show = function(sId) {
		signalId=sId;
		itsGlobal.showLeftPanel(htmlStr);
		
		facilitiesManageApp = new Vue({
			el: '#facilitiesManage-panel',
			data: {
				showList: false, //显示查询
				facilitiesManageQ: {}, //查询参数
				facilitiesManage: {status:''},
				newGridPolygon:null,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0
				
			},
			methods: {
				query: function () {
					signalId=null;
					facilitiesManageApp.reload();
				},
				reset: function () {
					queryResPolygons = [];
					map.getOverlayLayer().clear();
				},
				add: function () {
					facilitiesManageApp.title="新增";
					facilitiesManageApp.showList = false;
					facilitiesManageApp.facilitiesManage = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					facilitiesManageApp.showList = false;
					editFaManage(id);
					
				},
				save: function () {
				    //表单验证
				    $("#detailForm").validate({
				    	/* !!!验证时请替换为真实字段
				    	rules: {
				    		version: {
		    					number: true
			    			}
				    	},
				    	messages: {
				    		version: {
			    				number: "版本号必须是数字"
			    			}
				    	},*/
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							var url = "./dev/signalCtrler/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(facilitiesManageApp.facilitiesManage),
							    success: function(rslt){
							    	if(rslt.code === 200){
										alert('操作成功', function(index){
											facilitiesManageApp.reload();
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
						    url: "./dev/signalCtrler/purge/"+id,
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
					facilitiesManageApp.showList = true;
					signalId=null
					//facilitiesManageApp.reset();
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		loadJqGrid();
		editFaManage(sId);
		
		$(".form_datetime").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss',autoclose: true});
		
		vueEureka.set("leftPanel", {
			vue: facilitiesManageApp,
			description: "facilitiesManage的vue实例"
		});
	};
	
	var editFaManage =function(id){
		$.ajax({
		    url: "./dev/signalCtrler/detail/"+id,
		    success: function(rslt){
				if(rslt.code == 200){
					facilitiesManageApp.facilitiesManage = rslt.signalCtrler;
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
	
	var loadJqGrid = function() {
		facilitiesManageApp.facilitiesManageQ.id=signalId;
		$('#jqGrid').jqGrid('GridUnload');
	    $("#jqGrid").jqGrid({
	        url: "./dev/signalCtrler/pageData",
	        datatype: "json",
	        postData: facilitiesManageApp.facilitiesManageQ,
	        colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '设备编号', name: 'deviceId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备名称', name: 'deviceName', width: 135, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备类型', name: 'type', width: 125, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '安装路口', name: 'crossId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '位置描述', name: 'location', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '点位坐标', name: 'shape', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '生产厂家', name: 'manuId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '所属服务器IP', name: 'serverIp', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '中心信号机ID', name: 'serverCid', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备状态', name: 'status', width: 60, sortable:false, formatter: function(value, options, row){return statusword(value);}},
				{ label: '描述信息', name: 'description', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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
	            //layer.msg("加载完毕");
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	facilitiesManageApp.edit();
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