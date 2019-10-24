
define(function(require) {
	var htmlStr = require('text!./trafficControl.html');
	
	var Vue = require('vue');
	var map = require('mainMap');
	require('my97Datepicker');
	var oldQ = '1';
	var queryResPolygons = []; //查询后绘制至地图的施工区域集合
	//在地图中添加MouseTool插件
	var mousetool = null, infowindow = null;
	var visualContent ="<div style='height:270px'><div class='input-group input-group-sm'><span class='input-group-addon'>标题</span> " +
	"<input type='text' class='form-control' value='{0}' disabled></div><div class='input-group input-group-sm'>" +
	"<span class='input-group-addon'>管制类型</span> <input type='text' class='form-control' value='{1}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>管制内容</span> " +
	"<input type='text' class='form-control' value='{2}' disabled></div><div class='input-group input-group-sm'>" +
	"<span class='input-group-addon'>路段长度</span> <input type='text' class='form-control' value='{3}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>发生时间</span> " +
	"<input type='text' class='form-control' value='{4}' disabled></div><div class='input-group input-group-sm'>" +
	"<span class='input-group-addon'>结束时间</span> <input type='text' class='form-control' value='{5}' disabled></div></div>";
	
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.PolygonTool();
		mousetool.autoClose = true;//是否自动关闭绘制
		map.addTool(mousetool);
	});
    var clearQueryResPolygons = function(){
    	if(queryResPolygons.length > 0){
    		for (var t = 0; t < queryResPolygons.length; t++) {
				var ele = queryResPolygons[t];
				map.getOverlayLayer().removeOverlay(ele);
			}
    	}
    	queryResPolygons = [];
    }
    var setInfoWindow = function(data,lnglat,ishow){
    	var title="交通管制  ";
    	var content = visualContent.replace("{0}",data.title).replace("{1}",data.type)
    		.replace("{2}",data.content).replace("{3}",data.length).replace("{4}",data.startDt).replace("{5}",data.endDt);
    	infowindow = new IMAP.InfoWindow(content,{
    		size : new IMAP.Size(320,270),
			title: title,
			position:lnglat
		});
    	map.getOverlayLayer().addOverlay(infowindow);
		if(!ishow){
			infowindow.visible(false);
		}else{
			infowindow.visible(true);
		}
		infowindow.autoPan(true);
    }
	
	var trafficControlApp = null;

	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		
		trafficControlApp = new Vue({
			el: '#trafficControl-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			
			data: {
				trafficControlQ: {}, //查询参数
				trafficControl: {region:'',type:''},
				newGridPolygon:null,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0,  //判断当前用户是否有中队管理员权限，如果没有，只能进行查询操作。
				publish:false,
			},
			
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#typeId').selectpicker({
							noneSelectedText:'所有',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#type').selectpicker({
							noneSelectedText:'请选择',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				query: function () {
					trafficControlApp.reload();
				},
				reset: function () {
					queryResPolygons = [];
					map.getOverlayLayer().clear();
					this.publish = false;
				},
				add: function () {
					trafficControlApp.trafficControl = {isNewRecord:true};
				},
				edit: function () {
					
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					
					$("#liEdit").show();
					$("#liEdit").addClass("active");
					$("#editB").show();
					
					$("#liQuery").hide();
					$("#liDetail").hide();
					$("#trafficControlQuery").removeClass("tab-pane fade in active");
					$("#trafficControlQuery").addClass("tab-pane fade");
					$("#trafficControlDetail").removeClass("tab-pane fade");
					$("#trafficControlDetail").addClass("tab-pane fade in active");
					
					$.ajax({
					    url: "./jtzx/trafficControl/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								trafficControlApp.trafficControlPageList = trafficControlDetail;
								trafficControlApp.trafficControl = rslt.trafficControl;
								$("#type").selectpicker('val', rslt.trafficControl.type);
								$("#startDt").val(rslt.trafficControl.startDt);
								$("#endDt").val(rslt.trafficControl.endDt);
							}else{
								alert(rslt.msg);
							}
						}
					});
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
							var url = "./jtzx/trafficControl/save";
							trafficControlApp.trafficControl.startDt=$("#startDt").val();
							trafficControlApp.trafficControl.endDt=$("#endDt").val();
							
							var startDt = $("#startDt").val();
							var endDt = $("#endDt").val();
							var planStartDt = new Date(startDt.replace(/-/g,"/"));
							var planEndDt = new Date(endDt.replace(/-/g,"/"));
							
							if(planStartDt<=planEndDt){
								$.ajax({
									type: "POST",
									url: url,
									data: JSON.stringify(trafficControlApp.trafficControl),
									success: function(rslt){
										if(rslt.code === 200){
											alert('操作成功', function(index){
												trafficControlApp.reload();
												//layer.closeAll('page');
											});
										}else{
											alert(rslt.msg);
										}
									}
								});
								return false;//已经用AJAX提交了，需要阻止表单提交
							}else{
								layer.msg("结束时间必须在发生时间之后");
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
						    url: "./jtzx/trafficControl/purge/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									trafficControlApp.reload();
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
				addGrid: function () {
					if(trafficControlApp.newGridPolygon){
						map.getOverlayLayer().removeOverlay(trafficControlApp.newGridPolygon);
					}
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						trafficControlApp.newGridPolygon = evt.overlay;
						trafficControlApp.trafficControl.region = TUtils.polygonPath2Str(evt.overlay.getPath());
						mousetool.close();
					},this);
				
				},
				showOnetrafficControl: function (trafficControl) {
		    		var polygonPath = TUtils.polygonStr2Path(trafficControl.region);
					var polygon = new IMAP.Polygon(polygonPath, {
		    			"fillColor" : "#8B7D6B",
		    			"fillOpacity " : 0.8,
		    			"strokeColor  " : "#8B7B8B",
		    			"strokeOpacity" : 1,
		    			"strokeWeight" : 3,
		    			"strokeStyle" : "solid",
		    			});
		    		polygon.data = trafficControl;
		    		queryResPolygons.push(polygon);
		        	map.getOverlayLayer().addOverlays(queryResPolygons, false);
				},
				gridSearch:function(){
					if(trafficControlApp.newGridPolygon){
						var polygonPath = trafficControlApp.newGridPolygon.getPath();
						var polygonPathStr= TUtils.polygonPath2Str(polygonPath);
						var url = "map/map/findPoiInPolygon?polygon="+polygonPathStr;
						$.ajax({
							url: url,
							success: function(rslt){
								if(rslt.code == 200){
									mapPoiContainer = rslt.mapPoiContainer;
									var cycleInnerObjCnt = 0 ;
									layer.msg('半径'+globalPoiCycle.getRadius()+'米范围内查询到'+cycleInnerObjCnt+'个对象');
								}else{
									alert(rslt.msg);
								}
							}
						});
						}
				},
				reload: function () {
					$("#liDetail").removeClass("active");
					$("#liQuery").addClass("active");
					$("#liEdit").hide();
					$("#editB").hide();
					$("#liQuery").show();
					$("#liDetail").show();
					$("#type").selectpicker('val', '');
					$("#trafficControlDetail").removeClass("tab-pane fade in active");
					$("#trafficControlDetail").addClass("tab-pane fade");
					$("#trafficControlQuery").removeClass("tab-pane fade");
					$("#trafficControlQuery").addClass("tab-pane fade in active");
					trafficControlApp.trafficControl = {region:'',type:''};
					trafficControlApp.reset();
					$("#startDt").val("");
					$("#endDt").val("");
					loadJqGrid();
					this.publish = false;
				},
				close: function() {
					trafficControlApp.reset();
					itsGlobal.hideLeftPanel();
				},
				publishToDriver:function(){
					this.publish = true;
					this.edit();
					$("#liEdit").hide();
					$("#liEdit").removeClass("active");
					$("#liPublish").show();
					$("#liPublish").addClass("active");
				},
				generateExcel:function(){
					var cont = $("#msg").val().trim();
					if(!cont || ""==cont){
						alert("短信内容不能为空");
						return;
					}
					
					var url = "jtzx/trafficControl/generateTcExcel?cont="+cont;
				
					window.open(url);
				}
			}
		});
		oldQ=1;
		loadJqGrid();
		
		/*$("#startTime").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true
			}).on('changeDate', function(ev){
				var startDt= $("#startTime").val();
				$('#endTime').datetimepicker('setStartDate', startDt);
			});
		
		$("#endTime").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true
			}).on('changeDate', function(ev){
				var endTime= $("#endTime").val();
				$('#startTime').datetimepicker('setEndDate', endTime);
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
			});*/
		
		vueEureka.set("leftPanel", {
			vue: trafficControlApp,
			description: "trafficControl的vue实例"
		});
	};
	
	var loadJqGrid = function() {
		map.getOverlayLayer().clear();
		
		var postDataTmp = {'typeId': $("#typeId").val(),'startTime': $("#startTime").val(),
				'endTime': $("#endTime").val()};
		
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
				url: "./jtzx/trafficControl/pageData",
				datatype: "json",
				postData: postDataTmp,
				colModel: [
				           { label: 'id', name: 'id', width: 30, key: true, hidden:true },
				           { label: 'region', name: 'region', width: 30, hidden:true },
				           { label: '标题', name: 'title',sortable:false,width: 45},
				           { label: '管制类型', name: 'type', width: 45, sortable:false , formatter: function(value, options, row){
				        	   return type2word(value);
				           }},
				           { label: '管制内容', name: 'content',  width: 45},
				           { label: '长度', name: 'length', hidden:true},
				           { label: '开始时间', name: 'startDt',  width: 45, sortable:true, formatter: function(value, options, row){
				        	   return value ? value: 'N/A';
				           }},
				           { label: '结束时间', name: 'endDt',  width: 45, sortable:true, formatter: function(value, options, row){
				        	   return value ? value: 'N/A';
				           }},
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
				           ondblClickRow: function(rowid, iRow, iCol, e){
				        	   trafficControlApp.edit();
				           },
				           onSelectRow: function(rowid, status){//选中某行
				        	   var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				        	   //trafficControlApp.showOnetrafficControl(rowData);
				        	   for (var t = 0; t < queryResPolygons.length; t++) {
				        		   var poly = queryResPolygons[t];
				        		   if(rowData.id == poly.extData.id){
				        			   var center = poly.getBounds().getCenter();
				        			   map.setCenter(center);
				        			   if(status){
				        				   poly.setAttribute({"fillColor":"#00FFFF"});
				        				   setInfoWindow(rowData,center,true);
				        			   }else{
				        				   poly.setAttribute({"fillColor":"#8B7D6B"});
				        				   setInfoWindow(rowData,center,false);
				        			   }
				        		   }
				        	   }
				           }
			});
		}
	    
	  //在地图上显示全部的区域
	    $.ajax({
		    url:'./jtzx/trafficControl/queryByTypeAndTimeDirectly?type='+$("#typeId").val()+"&startDt="+$("#startTime").val()+"&endDt="+$("#endTime").val(),
			type:'GET', 
		    contentType: "application/json",    
		    success:function(dat){
		        if(dat.code == 200){
		        	clearQueryResPolygons();
		        	var queryList = dat.list;
		        	for (var ind = 0; ind < queryList.length; ind++) {
						var oneData = queryList[ind];
						var polygonPath =TUtils.polygonStr2Path(oneData.region);
			    		var polygon = new IMAP.Polygon(polygonPath, {
			    			"fillColor" : "#8B7D6B",
			    			"fillOpacity" : 0.8,
			    			"strokeColor" : "#8B7B8B",
			    			"strokeOpacity" : 1,
			    			"strokeWeight" : 3,
			    			"strokeStyle" : "solid",
			    			});
			    		polygon.extData = oneData;
			    		queryResPolygons.push(polygon);
					}
		        	map.getOverlayLayer().addOverlays(queryResPolygons, false);
		        }
		    },
		    error:function(xhr,textStatus){
		    	layer.msg("区域查询失败！");
		    }
		});
	    
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	};
	
	
	var type2word = function(type){
		var word = "其他";
		switch (type) {
			case 0:
				word = "道路施工占道";
				break;
			case 1:
				word = "交通警卫";
				break;
			case 2:
				word = "交通事故";
				break;
			case 3:
				word = "交通拥堵";
				break;
			case 4:
				word = "大型活动";
				break;
			case 5:
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