define(function(require) {
	var htmlStr = require('text!./cameraListPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var queryResPolygons = []; //查询后绘制至地图的施工区域集合
	//在地图中添加MouseTool插件
	var videoCameraId=null;
	var videoCameraApp = null;
	
	var show = function(sId) {
		videoCameraId=sId;
		itsGlobal.showLeftPanel(htmlStr);
		
		videoCameraApp = new Vue({
			el: '#videoCamera-app',
			data: {
				videoCameraQ: {}, //查询参数
				videoCamera: {status:''},
				newGridPolygon:null,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0
				
			},
			methods: {
				query: function () {
					videoCameraId=null;
					videoCameraApp.reload();
				},
				reset: function () {
					queryResPolygons = [];
					map.getOverlayLayer().clear();
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$("#liQuery").removeClass("active");
					$("#liDetail").show();
					$("#liDetail").addClass("active");
					$("#videoCameraQuery").removeClass("tab-pane fade in active");
					$("#videoCameraQuery").addClass("tab-pane fade");
					$("#videoCameraDetail").removeClass("tab-pane fade");
					$("#videoCameraDetail").addClass("tab-pane fade in active");
					
					editCamera(id);
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
							var url = "./dev/videoCamera/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(videoCameraApp.videoCamera),
							    success: function(rslt){
							    	if(rslt.code === 200){
										alert('操作成功', function(index){
											videoCameraApp.reload();
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
						    url: "./dev/videoCamera/purge/"+id,
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
					$("#liDetail").removeClass("active");
					$("#liQuery").addClass("active");
					$("#videoCameraDetail").removeClass("tab-pane fade in active");
					$("#videoCameraDetail").addClass("tab-pane fade");
					$("#videoCameraQuery").removeClass("tab-pane fade");
					$("#videoCameraQuery").addClass("tab-pane fade in active");
					//videoCameraApp.reset();
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		
		loadJqGrid();
		editCamera(sId);
		
		vueEureka.set("leftPanel", {
			vue: videoCameraApp,
			description: "videoCamera的vue实例"
		});
	};
	
	var editCamera = function(id) {
		$.ajax({
			type: "POST",
		    url: "./dev/videoCamera/detail/"+id,
		    success: function(rslt){
				if(rslt.code == 200){
					videoCameraApp.videoCamera = rslt.videoCamera;
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
	
	var loadJqGrid = function() {
		videoCameraApp.videoCameraQ.id=videoCameraId;
		$('#jqGrid').jqGrid('GridUnload');
	    $("#jqGrid").jqGrid({
	        url: "./dev/videoCamera/pageData",
	        datatype: "json",
	        postData: videoCameraApp.videoCameraQ,
	        colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '设备编号', name: 'deviceId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备名称', name: 'deviceName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '通道号', name: 'tunnel', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '位置描述', name: 'location', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '点位坐标', name: 'shape', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '厂家', name: 'manuId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '相机IP', name: 'ipAddress', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备状态', name: 'status', width: 60, sortable:false, formatter: function(value, options, row){return statusword(value);}},
				//{ label: '相机类型', name: 'type', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '是否可控', name: 'controllable', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备作用', name: 'usedFor', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '安装阶段', name: 'installPhase', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				//{ label: '所属单位', name: 'orgnization', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '描述', name: 'description', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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
	        	videoCameraApp.edit();
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