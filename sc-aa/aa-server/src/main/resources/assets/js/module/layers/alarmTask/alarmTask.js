define(function(require){
	var map = require('mainMap');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');
	//require('datetimepicker');
	require('my97Datepicker');
	var htmlStr = require('text!./alarmTask.html');
	var Vue = require('vue');
	
	var markers = [];
	var marker;
	var infowindow;
	var app;
	var tool;
	var modifiedLnglat;
	var targetId;
	var showLayer = function(isShow) {
		if(isShow){
			//加载所有警情，包括历史警情信息列表信息
			// init left panel
			itsGlobal.showLeftPanel(htmlStr);
			
			//showCurrentAlarm();   //TODO: 功能重复，待定
 			
			app = new Vue({
				el : '#alarmTask-panel',
				data : {
					alarmTaskRstType:[], //任务结果
					modifyPercent:{},
					teamList:[],
					isddUser: currentUser.jjddUser,
					manualFlag:'0',
					heatmapOverlay:null,
					heatmapCheck:false
				},
				methods :{
					close: function(){
						hide();
						this.clearHeatMap();
					},
					query: function(){
						var startDt = $("#startDt").val();
						var endDt = $("#endDt").val();
						var pStartDt = new Date(startDt.replace(/-/g,"/"));
						var pEndDt = new Date(endDt.replace(/-/g,"/"));
						
						if(pStartDt<=pEndDt){
							initDataGrid();
							//if(this.heatmapCheck){
								var check = document.getElementById("customCheck1").checked;
								if(check){
									this.drawHeatmap();
								}
							//}
						}else{
							layer.msg("结束时间必须在开始时间之后");
						}
					},
					load: function(){
						var postDataTmp = {status:$("#eventRstCode").val(), startDt:$("#startDt").val(), endDt:$("#endDt").val(), alarmTeam:$("#teamId").val(), manualFlag:app.manualFlag};
						var postData = $('#alarmTaskTb').jqGrid("getGridParam", "postData");
						$.each(postData, function (k, v) {  
							delete postData[k];
						});
						
						var page = $('#alarmTaskTb').getGridParam('page');
						if(!page){
							page = 1;
						}
						$("#alarmTaskTb").jqGrid('setGridParam',{ 
							postData: postDataTmp,
							page:page
						}).trigger("reloadGrid");
					},
					byMonth: function(){
						var url = "jw/policeTask/alarmWorkEfficiencySummary?timeUnit=MONTH";
						initEchart(url);
					},
					byWeek: function(){
						var url = "jw/policeTask/alarmWorkEfficiencySummary?timeUnit=WEEK";
						initEchart(url);
					},
					byDay: function(){
						var url = "jw/policeTask/alarmWorkEfficiencySummary?timeUnit=DAY";
						initEchart(url);
					},
					exportExcel: function(){
						
					},
					init97DateStart: function(it){
						WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd HH:mm:ss'});
					},
					drawHeatmap:function(){
						/*this.clearHeatMap();*/
						if(markers.length != 0) {
							for(var i = 0; i < markers.length; i++) {
								var marker = markers[i];
								map.getOverlayLayer().removeOverlay(marker);
							}
							markers = [];
						}
						var check = document.getElementById("customCheck1").checked;
						if(!check){
							return;
						}
						var url = "jw/policeTask/searchTaskByCondition?rdm=1";
						var status = $("#eventRstCode").val();
						var startDt = $("#startDt").val();
						var endDt = $("#endDt").val();
						var alarmTeam = $("#teamId").val();
						var manualFlag = app.manualFlag;
						if(status){
							url = url + "&status=" + status;
						}
						if(startDt){
							url = url + "&startDt=" + startDt;
						}
						if(endDt){
							url = url + "&endDt=" + endDt;
						}
						if(alarmTeam){
							url = url + "&alarmTeam=" + alarmTeam;
						}
						if(manualFlag){
							url = url + "&manualFlag=" + manualFlag;
						}
						$.get(url, function(r){
					    	if(r.code == 200){
					    		var heatmapList = [];
					    		if(r.list && r.list.length>0){
					    			for(var j =0; j<r.list.length; j++){
					    				var rr = r.list[j];
					    				if(rr.longitude && rr.latitude){
					    					
					    					//heatmapList.push({"lng":rr.longitude,"lat":rr.latitude,"count":1});
					    				}else{
					    					continue;
					    				}
					    				var opts=new IMAP.MarkerOptions();
					    				var ms;
					            		opts.anchor = IMAP.Constants.BOTTOM_CENTER;
					            		opts.icon=new IMAP.Icon("./assets/images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
					            		var lnglat=new IMAP.LngLat(rr.longitude, rr.latitude);
				            			ms=new IMAP.Marker(lnglat, opts);
				            			map.getOverlayLayer().addOverlay(ms, false);
				            			ms.data = rr;
					            		ms.addEventListener(IMAP.Constants.CLICK, function(e) {
					            			var pos = new IMAP.LngLat(e.target.data.longitude, e.target.data.latitude);
					            			
					            			var content = '<div style="width: 320px;border: solid 1px silver;">'
					            				   +'<div style="position: relative;background: none repeat scroll 0 0 #F9F9F9;    border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;">'
					            		    +'<div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;line-height: 31px;padding: 0 10px;">警情信息</div>'
					            		    +'<img  class="tt" src="./assets/images/close.png" style="position: absolute;top: 10px;right: 10px;transition-duration: 0.25s;" />'
					            		   +'</div><div style="font-size: 12px;padding: 6px;line-height: 20px;background-color: white;height:115px;"><b>报警时间:</b>'+(typeof(e.target.data.eventDtStr)=='undefined'?'':e.target.data.eventDtStr)
					            			+'<br /><b>案发地址:</b>'+(typeof(e.target.data.eventAddr)=='undefined'?'':e.target.data.eventAddr)+'<br /><b>警情详情:</b>'+(typeof(e.target.data.eventContent)=='undefined'?'':e.target.data.eventContent)
					            			+'</div>'
					            			+'<div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;"></div></div>'
					            			infowindow = new IMAP.InfoWindow(content,{
					            				size:new IMAP.Size(322,103),
					            				position:pos,
					            				//autoPan:false,
					            				offset: new IMAP.Pixel(300,90),
					            				anchor:IMAP.Constants.BOTTOM_CENTER,
					            				type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
					            			});
					            			
					            			map.getOverlayLayer().addOverlay(infowindow);
					            			infowindow.autoPan(true);
					            			$(".tt").on( "click", function() {
					            				if (map && infowindow) {
					            		    		map.getOverlayLayer().removeOverlay(infowindow);
					            		    		infowindow = null;
					            		    	}
					            			});
					            	    });
					            		ms.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
					            		
					            		markers.push(ms);
					    			}
					    		}
					    	}else{
					    		alert(r.msg);
					    	}
					    });
					},
					clearHeatMap:function(){
						if(this.heatmapOverlay){
							map.getOverlayLayer().removeOverlay(this.heatmapOverlay);
						}
					},
					checkHeatmap:function(){
						/*this.heatmapCheck = !this.heatmapCheck;
						document.getElementById("customCheck1").checked=this.heatmapCheck;
						if(this.heatmapCheck){
							this.drawHeatmap();
						}else{
							this.clearHeatMap();
						}*/ //2018年10月8日14:57:29 根据对方需求  不显示热力图 显示点位
						
					}
				}
			});
			//app.initDropDown();
			//初始化警情结果下拉框
			$.get("sys/dict/getDictList?type=ALARM_TASK_RST_TYPE", function(r){
		    	if(r.code == 200){
		    		app.alarmTaskRstType = r.dictList;
		    	}else{
		    		alert(r.msg);
		    	}
		    });
			//初始化中队下拉框
			$.get("aa/group/getAllTeams", function(r){
		    	if(r.code == 200){
		    		app.teamList = r.teamList;
		    	}else{
		    		alert(r.msg);
		    	}
		    });
			
			//$(".form_datetime").datetimepicker({language: "zh-CN", format: 'yyyy-mm-dd hh:ii:ss', autoclose: true});
			var startDt = TUtils.formatDateTime(new Date(new Date().setHours(0,0,0,0)));
			$("#startDt").val(startDt);
			var endDt = TUtils.formatDateTime(new Date());
			$("#endDt").val(endDt);
			vueEureka.set("leftPanel", {
				vue: app,
				description: "alarmTask的vue实例"
			});
			app.query();
			var url = "jw/policeTask/alarmWorkEfficiencySummary?timeUnit=DAY";
			initEchart(url);
		} else {
			hide();
		}
	}

	var initDataGrid = function(){
		$('#alarmTaskTb').jqGrid('GridUnload');    // 每次查询前用来刷新table
		// dataGrid初始化
		var postDataTmp = {status:$("#eventRstCode").val(), startDt:$("#startDt").val(), endDt:$("#endDt").val(), alarmTeam:$("#teamId").val(), manualFlag:app.manualFlag};
		$("#alarmTaskTb").jqGrid({
			url:"jw/policeTask/searchTaskByConditionPage",
			datatype:"json",
			postData: postDataTmp,
			colModel:[
				{ label: '警情时间', name:'eventDtStr', width:70, sortable:false},
				{ label: '警情地点', name:'eventAddr',width:70, sortable:false},
				{ label: '警情内容', name:'eventContent',width:120, sortable:false},
				{ label: '修正状态', name:'manualFlag',width:40, sortable:false, formatter: function(value, options, row){
					var lx = '未修正';
					switch (value) {
					case '0':
						lx = '未修正';
						break;
					case '1':
						lx = '已修正';
						break;
					default:
					}
					return lx;
				}},
				{ label: '处警结果', name:'eventRst',width: 60, sortable:false},
				{ label: 'longitude', name: 'longitude', width: 60 , hidden:true },
				{ label: 'latitude', name: 'latitude', width: 60 , hidden:true },
				{ label: 'status', name: 'eventRstCode', width: 60 , hidden:true },
				{ label: 'eventId', name: 'eventId', width: 60 , key:true, hidden:true },
				{ label: '操作', name:'act', width: 60 , sortable:false},
				],
			height:260,
			multiselect:false,
			rowNum:30,
			rowList:[20,30,50],
			pager:'#alarmPager',
			sortname:'EVENT_DT',
			viewrecords:true,
			sortorder:'desc',
	        rownumbers: true, 
	        rownumWidth: 25, 
	        //autowidth:true,
	        width:580,
	        //用于设置如何解析从Server端发回来的json数据
	        jsonReader : {
	            root: "page.list",
	            page: "page.pageNum",
	            total: "page.pages",
	            records: "page.total"
	        },
	        //用于设置jqGrid将要向Server传递的参数名称
	        prmNames : {
	            page:"page", 
	            rows:"limit", 
	            sort: "orderBy",
	            order: "orderFlag"
	        },
	        onSelectRow: function(rowid){
	        	//alert(status);
	        	//if(status){//选中
	        	if(marker){
        			map.getOverlayLayer().removeOverlay(marker);
        		}
        		var rowData = $("#alarmTaskTb").jqGrid('getRowData', rowid);
        		//alert("经度："+rowData.longitude+"纬度："+rowData.latitude);
        		if(rowData.longitude ==''){
        			layer.msg("该警情无位置信息！");
        			return;
        		}
        		var opts=new IMAP.MarkerOptions();
        		opts.anchor = IMAP.Constants.BOTTOM_CENTER;
        		opts.icon=new IMAP.Icon("./assets/images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
        		var lnglat=new IMAP.LngLat(rowData.longitude, rowData.latitude);
        		modifiedLnglat = lnglat;
        		if(lnglat){
        			map.setCenter(lnglat);
        			marker=new IMAP.Marker(lnglat, opts);
        			map.getOverlayLayer().addOverlay(marker, false);
        			marker.data = rowData;
        		}
        		
        		// add info window
        		if (!marker) {return;}
        		marker.addEventListener(IMAP.Constants.CLICK, function(e) {
        			var pos = new IMAP.LngLat(e.target.data.longitude, e.target.data.latitude);
        			
        			var content = '<div style="width: 320px;border: solid 1px silver;">'
        				   +'<div style="position: relative;background: none repeat scroll 0 0 #F9F9F9;    border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;">'
        		    +'<div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;line-height: 31px;padding: 0 10px;">警情信息</div>'
        		    +'<img  class="tt" src="./assets/images/close.png" style="position: absolute;top: 10px;right: 10px;transition-duration: 0.25s;" />'
        		   +'</div><div style="font-size: 12px;padding: 6px;line-height: 20px;background-color: white;height:115px;"><b>报警时间:</b>'+(typeof(e.target.data.eventDtStr)=='undefined'?'':e.target.data.eventDtStr)
        			+'<br /><b>案发地址:</b>'+(typeof(e.target.data.eventAddr)=='undefined'?'':e.target.data.eventAddr)+'<br /><b>警情详情:</b>'+(typeof(e.target.data.eventContent)=='undefined'?'':e.target.data.eventContent)
        			+'</div>'
        			+'<div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;"></div></div>'
        			infowindow = new IMAP.InfoWindow(content,{
        				size:new IMAP.Size(322,103),
        				position:pos,
        				//autoPan:false,
        				offset: new IMAP.Pixel(300,90),
        				anchor:IMAP.Constants.BOTTOM_CENTER,
        				type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
        			});
        			
        			map.getOverlayLayer().addOverlay(infowindow);
        			infowindow.autoPan(true);
        			$(".tt").on( "click", function() {
        				if (map && infowindow) {
        		    		map.getOverlayLayer().removeOverlay(infowindow);
        		    		infowindow = null;
        		    	}
        			});
        	    });
        		marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
        		
        		markers.push(marker);
	        },
	        gridComplete:function(){
	        	var ids = $("#alarmTaskTb").getDataIDs();
	        	for(var i = 0;i<ids.length;i++){
	        		var rowData = $("#alarmTaskTb").getRowData(ids[i]);
	        		switch(rowData.eventRstCode){
	        		//未分配
	        		case '1':
	        			$('#' + rowData.eventId).find("td").addClass("SelectRed");
	        			break;
	        		//私了/未到达现场，当事人已自行协商解决
	        		case '6':
	        		case '7':
	        			$('#' + rowData.eventId).find("td").addClass("SelectGreen");
	        			break;
	        		//已分配/重新分配
	        		case '2':
	        		case '5':
	        			$('#' + rowData.eventId).find("td").addClass("SelectBule");
	        			break;
	        		default:
	        			break;
	        		}
	        		
	        		// 如果没有点位的警情，添加位置确认按钮
	        		//if(rowData.longitude ==''){
	        		if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
	        			var rele= "<input class='btn btn-success btn-sm addPosition' name=\""+rowData.eventId+"\" style='font-size:10px;height:20px; line-height:8px;' type='button' value='位置修正' />";
		        		$("#alarmTaskTb").jqGrid('setRowData', ids[i],{
		        			act:rele
		        		});
		        		$(".addPosition").unbind('click').on("click",function(){
		        			rowData = $("#alarmTaskTb").getRowData(this.name);
		        			//rowData.longitude ='';
		        			targetId = this.name;
		        			if(marker){
		        				map.getOverlayLayer().removeOverlay(marker);
		        			}
		        			if(tool){
		        				tool.close();
		        			}
		        			tool = new IMAP.MarkerTool(new IMAP.Icon(("./assets/images/alarmTask.png"), new IMAP.Size(31, 31)));
		        			tool.follow=true;
		        			tool.autoClose=true;
		        			tool.title="点击左键标注点位";
		        			map.addTool(tool);
		        			tool.open();
		        			tool.addEventListener(IMAP.Constants.ADD_OVERLAY, function(e) {
		        				tool.close();
		        				marker = e.overlay;
		        				markers.push(marker);
		        				modifiedLnglat = new IMAP.LngLat(marker.f._latlng.lng, marker.f._latlng.lat);
		        				//modifiedLnglat = marker.f._latlng.lng+","+marker.f._latlng.lat;
		        				marker.data = {longitude:marker.f._latlng.lng,latitude:marker.f._latlng.lat};
		        				marker.editable(true);
		        				marker.addEventListener(IMAP.Constants.DRAG_END, function(e) {
		        					modifiedLnglat = e.lnglat;
		        				});
		        				marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
		        			});
		        			/*if(rowData.longitude ==''){
		        			}else{
		        				if(marker){
		                			map.getOverlayLayer().removeOverlay(marker);
		                		}
		        				var opts=new IMAP.MarkerOptions();
		                		opts.anchor = IMAP.Constants.BOTTOM_CENTER;
		                		opts.icon=new IMAP.Icon("./assets/images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
		                		var lnglat=new IMAP.LngLat(rowData.longitude, rowData.latitude);
		                		if(lnglat){
		                			map.setCenter(lnglat);
		                			marker=new IMAP.Marker(lnglat, opts);
		                			map.getOverlayLayer().addOverlay(marker, false);
		                			marker.data = rowData;
		                		}
		                		
		                		// add info window
		                		marker.addEventListener(IMAP.Constants.CLICK, function(e) {
		                			var pos = new IMAP.LngLat(e.target.data.longitude, e.target.data.latitude);
		                			
		                			var content = '<div style="width: 320px;border: solid 1px silver;">'
		                				   +'<div style="position: relative;background: none repeat scroll 0 0 #F9F9F9;    border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;">'
		                		    +'<div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;line-height: 31px;padding: 0 10px;">警情信息</div>'
		                		    +'<img  class="tt" src="./assets/images/close.png" style="position: absolute;top: 10px;right: 10px;transition-duration: 0.25s;" />'
		                		   +'</div><div style="font-size: 12px;padding: 6px;line-height: 20px;background-color: white;height:115px;"><b>报警时间:</b>'+(typeof(e.target.data.eventDtStr)=='undefined'?'':e.target.data.eventDtStr)
		                			+'<br /><b>案发地址:</b>'+(typeof(e.target.data.eventAddr)=='undefined'?'':e.target.data.eventAddr)+'<br /><b>警情详情:</b>'+(typeof(e.target.data.eventContent)=='undefined'?'':e.target.data.eventContent)
		                			+'</div>'
		                			+'<div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;"></div></div>'
		                			infowindow = new IMAP.InfoWindow(content,{
		                				size:new IMAP.Size(322,103),
		                				position:pos,
		                				//autoPan:false,
		                				offset: new IMAP.Pixel(300,90),
		                				anchor:IMAP.Constants.BOTTOM_CENTER,
		                				type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
		                			});
		                			
		                			map.getOverlayLayer().addOverlay(infowindow);
		                			infowindow.autoPan(true);
		                			$(".tt").on( "click", function() {
		                				if (map && infowindow) {
		                		    		map.getOverlayLayer().removeOverlay(infowindow);
		                		    		infowindow = null;
		                		    	}
		                			});
		                	    });
		                		marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
		                		
		                		markers.push(marker);
		                		marker.editable(true);
		        			    marker.addEventListener(IMAP.Constants.DRAG_END, function(e) {
		        			    	modifiedLnglat = e.lnglat;
		        				});
		                		
		        				layer.msg("请移动警情图标，以纠正警情位置！",{offset: '350px'});
		        			}*/
		        		});
	        		}
	        		
	        	}
	        	
	        	//隐藏grid底部滚动条
	        	$("#alarmTaskTb").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        loadComplete:function(xhr){
	        	if(xhr.code != 200){
	        		layer.msg(xhr.msg);
	        	}
	        	var rstArry = $('#alarmTaskTb').jqGrid('getDataIDs');  
	        	if(null === rstArry || rstArry.length === 0){
	        		layer.msg("无任何记录！");
	        	}
	        }
		});
		
		//return false;
	};

	var rightClick = function(e) {
    	
		//右键菜单
		var contextMen = "";
		if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
			contextMen = '<div class="self-menu"><span class="detailspan callVideo" >周边监控</span>'
				/*+'<span class="detailspan setPosNull" >位置删除</span>'*/
				+'<span class="detailspan confirmPos" >位置确认</span>'
//				+'<span class="detailspan callJwt" >周边警务通(200米)</span>'
				+'</div>';
		}else{
			contextMen = '<div class="self-menu"><span class="detailspan callVideo" >周边监控</span>'
//				+'<span class="detailspan callJwt" >周边警务通(200米)</span>'
				+'</div>';
		}
		CustomContextMenu.setContent(contextMen,e,100,40);
		$(".callVideo").bind("click",function(){
			CustomContextMenu.close();
			var lnglat = new IMAP.LngLat(e.target.data.longitude, e.target.data.latitude);
			$.ajax({
			    url:'./map/map/findVideoInCycle?lnglat='+lnglat+'&radius=100',
			    success:function(rslt){
			        if(rslt.code == 200){
			        	var tunnels="";
			        	var videoCameraList = rslt.mapPoiContainer.videoCameraList
			        	for (var ind = 0; ind < videoCameraList.length; ind++) {
							var oneData = videoCameraList[ind];
							tunnels = tunnels+","+oneData.tunnel;
						}
			        	if(!tunnels){
			        		layer.msg("该点范围内无监控设备");
						} else {
							require(['layers/camera/camera'],function(camera){
								camera.clear();
								camera.showLayer(true, videoCameraList);
								camera.playWinVideo(tunnels);
							});
						}
			        }else{
				    	layer.msg("查询失败！");
			        }
			    },
			    error:function(xhr,textStatus){
			    	layer.msg("查询失败！");
			    }
			});
		});
		$(".callJwt").bind("click",function(){
			CustomContextMenu.close();
			layer.msg("功能尚未开放...");
			return;
			var lnglat = new IMAP.LngLat(e.target.data.longitude, e.target.data.latitude);
		    $.ajax({
				type: "GET",
			    url: './jw/gpsDevice/findJwtInCycle?lnglat='+lnglat+'&radius=200',
			    success:function(rslt){
			        if(rslt.code == 200){
			        	var gpsIds="";
			        	var gpsJwtList = rslt.mapPoiContainer.gpsJwtList
			        	if(gpsJwtList.length === 0){
			        		layer.msg("该点范围内无监控设备");
			        	} else {
							require(['layers/policeControl/policeJwt'],function(jwt){
								jwt.showLayer(true, gpsJwtList, null);
							});
							alert("查询成功！");
						}
			        }else{
				    	layer.msg("查询失败！");
			        }
			    },
			    error:function(xhr,textStatus){
			    	layer.msg("查询失败！");
			    }
			});
		});
		$(".setPosNull").bind("click",function(){
			CustomContextMenu.close();
			if (!marker) {return;}
		    marker.editable(false);
		    /*marker.addEventListener(IMAP.Constants.DRAG_END, function(e) {
		    	modifiedLnglat = e.lnglat;
			});
			layer.msg("请移动警情图标，以纠正警情位置！",{offset: '350px'});*/
		    if(targetId == '' || typeof(targetId) == 'undefined'){
		    	targetId = marker.data.eventId;
		    }
		    $.ajax({
				type: "GET",
			    url: './jw/policeTask/modifiedAlarmPosition?lnglat='+'&eventId='+targetId,
			    success: function(rstl){
			    	if(rstl.code === 200){
		    			layer.msg("警情位置删除成功！");
		    			app.load();
		    			targetId = '';
		    			marker.data.longitude = modifiedLnglat.lng;
		    			marker.data.latitude = modifiedLnglat.lat;
			    	}else{
						layer.msg(rstl.msg);
					}
				}
			});
		});
		$(".confirmPos").bind("click",function(){
			CustomContextMenu.close();
			if (!marker) {return;}
		    marker.editable(false);
		    if(targetId == '' || typeof(targetId) == 'undefined'){
		    	targetId = marker.data.eventId;
		    }
		    /*if(typeof(modifiedLnglat) == 'undefined'){
		    	layer.msg("当前警情位置未发生变化");
		    	return;
		    }*/
		    $.ajax({
				type: "GET",
			    url: './jw/policeTask/modifiedAlarmPosition?lnglat='+modifiedLnglat+'&eventId='+targetId,
			    success: function(rstl){
			    	if(rstl.code === 200){
		    			layer.msg("警情位置修正成功！");
		    			app.load();
		    			targetId = '';
		    			marker.data.longitude = modifiedLnglat.lng;
		    			marker.data.latitude = modifiedLnglat.lat;
			    	}else{
						layer.msg(rstl.msg);
					}
				}
			});
		});
	}
	
	var initEchart = function(url){
		// init echart
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var alarmVO = rslt.alarmVO;
		    		app.modifyPercent = alarmVO.modifyPercentList;
		    		var myChart = echarts.init(document.getElementById('echarts-div'), 'walden');
	    			var option = {};
		    		if(alarmVO.teamList.length >0){
		    			option = {
		    			    tooltip : {
		    			        trigger: 'axis',
		    			        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
		    			            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
		    			        }
		    			    },
		    			    legend: {
		    			        data:['未分配','已分配']
		    			    },
		    			    grid: {
		    			        left: '3%',
		    			        right: '4%',
		    			        bottom: '3%',
		    			        containLabel: true
		    			    },
		    			    xAxis : [
		    			        {
		    			            type : 'category',
		    			            data : alarmVO.teamList,
		    			            axisLabel: {
				    	                interval: 0,
				    	                rotate: 20
				    	            },
				    	            splitLine: {
				    	                show: false
				    	            }
		    			        }
		    			    ],
		    			    yAxis : [
		    			        {
		    			            type : 'value'
		    			        }
		    			    ],
		    			    series : [
		    			        
		    			        {
		    			            name:'未分配',
		    			            type:'bar',
		    			            stack: '警情状态',
		    			            data: alarmVO.unprocess
		    			        },
		    			        {
		    			            name:'已分配',
		    			            type:'bar',
		    			            stack: '警情状态',
		    			            data: alarmVO.process
		    			        }, {
		    			            name:'到达现场平均时间（单位：小时）',
		    			            type:'line',
		    			            data: alarmVO.arriveAvgTimeList
		    			        }, {
		    			            name:'处理完毕平均时间（单位：小时）',
		    			            type:'line',
		    			            data: alarmVO.finishedAvgTimeList 
		    			        }
		    			    ]
		    			};
		    		}
		    	    // 使用刚指定的配置项和数据显示图表。
		    	    myChart.setOption(option,true);
		    	    myChart.resize(); 
				}else{
					alert(rstl.msg);
				}
			}
		});
	}
	
	var initModifyAlarmPos = function(){
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var alarmVO = rslt.alarmVO;
		    		var myChart = echarts.init(document.getElementById('alarmModPosEcharts-div'), 'walden');
	    			var option = {};
		    		if(alarmVO.teamList.length >0){
		    			option = {
		    			    tooltip : {
		    			        trigger: 'axis',
		    			        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
		    			            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
		    			        }
		    			    },
		    			    legend: {
		    			        data:['未分配','已分配']
		    			    },
		    			    grid: {
		    			        left: '3%',
		    			        right: '4%',
		    			        bottom: '3%',
		    			        containLabel: true
		    			    },
		    			    xAxis : [
		    			        {
		    			            type : 'category',
		    			            data : alarmVO.teamList,
		    			            axisLabel: {
				    	                interval: 0,
				    	                rotate: 20
				    	            },
				    	            splitLine: {
				    	                show: false
				    	            }
		    			        }
		    			    ],
		    			    yAxis : [
		    			        {
		    			            type : 'value'
		    			        }
		    			    ],
		    			    series : [
		    			        
		    			        {
		    			            name:'未分配',
		    			            type:'bar',
		    			            stack: '警情状态',
		    			            data: alarmVO.unprocess
		    			        },
		    			        {
		    			            name:'已分配',
		    			            type:'bar',
		    			            stack: '警情状态',
		    			            data: alarmVO.process
		    			        }, {
		    			            name:'到达现场平均时间（单位：小时）',
		    			            type:'line',
		    			            data: alarmVO.arriveAvgTimeList
		    			        }, {
		    			            name:'处理完毕平均时间（单位：小时）',
		    			            type:'line',
		    			            data: alarmVO.finishedAvgTimeList 
		    			        }
		    			    ]
		    			};
		    		}
		    	    // 使用刚指定的配置项和数据显示图表。
		    	    myChart.setOption(option,true);
				}else{
					alert(rstl.msg);
				}
			}
		});
	};
	
	var showCurrentAlarm = function(){
		// 加载当天警情信息
		if(markers.length == 0) {
			var url = "jw/policeTask/listTodayUnprocessTasks";
			$.ajax({
				type: "GET",
			    url: url,
			    success: function(rstl){
			    	if(rstl.code === 200){

						var tasks = rstl.alarmTaskList;
						if(null == tasks || tasks.length == 0){
							layer.msg("今天未监测到警情记录！");
						}
						var datas = [];
						for(var i = 0; i < tasks.length; i++){
							
							var task = tasks[i];
							var opts=new IMAP.MarkerOptions();
							opts.anchor = IMAP.Constants.BOTTOM_CENTER;
							opts.icon=new IMAP.Icon("./assets/images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
							
							var lnglat=new IMAP.LngLat(task.longitude, task.latitude);
							if(lnglat){
								marker=new IMAP.Marker(lnglat, opts);
								map.getOverlayLayer().addOverlay(marker, false);
								marker.data = task;
							}
							
							// add info window
							if (!marker) {return;}
							marker.addEventListener(IMAP.Constants.CLICK, function(e) {
								var pos = new IMAP.LngLat(e.target.data.longitude, e.target.data.latitude);
								var innerHtml = '<div style="padding:0px 0px 0px 4px;"><b><i>报警时间:</i></b> '+e.target.data.eventDtStr+'<br><b><i>案发地址:</i></b> '+e.target.data.eventAddr
								+'<br><b><i>所属辖区:</i></b> '+ e.target.data.teamDesc+'<br><b><i>警情详情:</i></b> '+ e.target.data.eventContent+'</div>';
								infowindow = new IMAP.InfoWindow(innerHtml,{
									size:new IMAP.Size(300,170),
									offset:new IMAP.Pixel(-5,-35),
									title:e.target.data.eventAbsDesc,
									visible:true,
									position:pos
								});
								
								map.getOverlayLayer().addOverlay(infowindow);
								infowindow.autoPan(true);
						    });
				    		
							markers.push(marker);
						}
						
					}else{
						alert(rstl.msg);
					}
				}
			});
		} else {
			for(var i = 0; i < markers.length; i++) {
				var marker = markers[i];
				map.getOverlayLayer().addOverlay(marker, false);
			}
		}
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
		
		if(markers.length != 0) {
			for(var i = 0; i < markers.length; i++) {
				var marker = markers[i];
				map.getOverlayLayer().removeOverlay(marker);
			}
			markers = [];
		}
		
		if(infowindow){
			map.getOverlayLayer().removeOverlay(infowindow);
		}
	}
	
	return {
		showLayer:showLayer
	}
});

