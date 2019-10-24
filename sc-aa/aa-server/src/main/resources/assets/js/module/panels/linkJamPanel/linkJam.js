define(function(require) {
	var htmlStr = require('text!./linkJam.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vectors = [];
//	require('datetimepicker');
	var my97Datepicker = require('my97Datepicker');
	var infowindow;
	var zdId="";
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/jtyd.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.CENTER;
	
	var queryResPolygons = []; //查询后绘制至地图的施工区域集合
	//在地图中添加MouseTool插件
	var mousetool = null, infowindow = null;
	
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
    //单击事件
    var markerClick = function(e) {
		var linkJam = e.target.data;
		map.getOverlayLayer().clear(vectors);
		vectors=[];
		linkJamApp.showOnelinkJam(linkJam);
		setInfoWindow(linkJam,linkJam.xy,true);
	};
    
    var setInfoWindow = function(data,lnglat,ishow){
    	var pos = lnglat.split(",");
    	var lnglat=new IMAP.LngLat(pos[0], pos[1]);
    	var content = '<div style="width: 320px; border: solid 1px silver;"><div style="position: relative;background: none repeat scroll 0 0 #F9F9F9; '
    		+' border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;"><div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;'
    		+'line-height: 31px;padding: 0 10px;">'+data.roadName+'</div><img src="./assets/images/close2.gif" style="position: absolute;'
    		+'top: 10px;right: 10px;transition-duration: 0.25s;"'
    		+' onclick="gblMapObjs.closeInfoWindow()"></div><div style="font-size: 12px;color: #212121;padding: 6px;line-height: 20px;background-color: #f5f5f5;'
    		+'height:117px;opacity: 0.8;">'
    		+'<span>起点: <span>'+data.startAddr+'<br><span>终点: <span>'+data.endAddr+'<br><div style="margin:3px -10px; padding:0;border-top: 1px solid #CCC;"></div>'
    		+'时速: '+data.jamSpeed +'  拥堵距离: '+data.jamDist+' <br>持续时间: '+data.longTime+'钟  发生时间: '+data.pubTime
    		+'</div><div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;">'
    		+'<img src="./assets/images/bottom.png"></div></div>';
    	infowindow = new IMAP.InfoWindow(content,{
			size : new IMAP.Size(322,125),
			position:lnglat,
			autoPan : false,
			offset : new IMAP.Pixel(15, 35),
			anchor:IMAP.Constants.LEFT_CENTER,
			type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
		});
		map.getOverlayLayer().addOverlay(infowindow);
		infowindow.autoPan(true);
    }
    gblMapObjs.closeInfoWindow = function(){
    	map.getOverlayLayer().removeOverlay(infowindow);
    	map.getOverlayLayer().clear(vectors);
		vectors=[];
    }
	
	var linkJamApp = null;
	
	var show = function() {
		zdId=currentUser.group.groupId;
		if(zdId =='cxzd'|| zdId =='kfqzd' || zdId =='njzd'){
			zdId='33';
		}
		if(currentUser.jjddUser){
			zdId='';
		}
		
		itsGlobal.showLeftPanel(htmlStr);
		linkJamApp = new Vue({
			el: '#linkJam-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			data: {
				linkJamQ: {}, //查询参数
				linkJam: {xys:'',type:''},
				newGridPolygon:null,
				dictList:{}
				
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#typeId').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				query: function () {
					linkJamApp.reload();
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
					$.ajax({
						url: "./jtzx/linkJam/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.linkJam = rslt.linkJam;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				showOnelinkJam: function (linkJam) {
		    		var polygonStr = linkJam.xys ;
		    		//polygonStr= polygonStr.trim();
		    		var polygonArr = polygonStr.split("#");
		    		for (var i = 0; i < polygonArr.length; i++) {
		    			var lnglatarr = [];
		    			var lnglatStr = polygonArr[i];
		    			var lnglatArr = lnglatStr.split(";");
		    			for(var h = 0; h < lnglatArr.length; h++){
		    				var pos = lnglatArr[h].split(",");
		    				lnglatarr.push(new IMAP.LngLat(pos[0], pos[1]));
		    			}
		    			var polyline=new IMAP.Polyline(lnglatarr, {
		    				"strokeOpacity" : 1,
		    				"arrow" : true,
		    				"strokeColor" : "#FF0000" ,
		    				"strokeWeight" : 6,
		    				"strokeOpacity" : 1,
		    				"strokeStyle" : IMAP.Constants.OVERLAY_LINE_SOLID,
		    				"editabled" : false
		    			
		    			});
		    			vectors.push(polyline);
			    		map.getOverlayLayer().addOverlay(polyline, false);
		    		}

				},
				reload: function () {
					loadJqGrid();
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd'});
				},
				close: function() {
					linkJamApp.reset();
					itsGlobal.hideLeftPanel();
				},
			}
		});
		/*$("#startTime").datetimepicker({
			minView: "month",
			format: 'yyyy-mm-dd',
			autoclose: true
			}).on('changeDate', function(ev){
				var startDt= $("#startTime").val();
				$('#endTime').datetimepicker('setStartDate', startDt);
			});*/
		$("#startTime").val(CurentTime());
		
		loadJqGrid();
		
		vueEureka.set("leftPanel", {
			vue: linkJamApp,
			description: "linkJam的vue实例"
		});
	};
	
	var loadJqGrid = function() {
		map.getOverlayLayer().clear();
		$('#jqGrid').jqGrid('GridUnload');
		var postDataTmp = {'roadType': $("#typeId").val(),'preHandlingTime': $("#startTime").val(),'zdId':zdId};
		
	    $("#jqGrid").jqGrid({
	        url: "./jtzx/linkJam/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	            { label: '路名', name: 'roadName', width: 60, sortable:false},
				{ label: '拥堵距离', name: 'jamDist', width: 40, sortable:false,formatter: function(value, options, row){
					return value +' m';
				}},
				{ label: '时速', name: 'jamSpeed', width: 40, sortable:false,formatter: function(value, options, row){
					return value +' km/h';
				}},
				{ label: '持续时间', name: 'longTime', width: 40, sortable:false,formatter: function(value, options, row){
					return value + ' 分';
				}},
				{ label: '发生时间', name: 'pubTime', width: 100, sortable:false},
				{ label: '拥堵原因', name: 'reasonId', width: 40, sortable:false,formatter: function(value, options, row){
					return type2word(value);
				}},
				{ label: '拥堵起点', name: 'startAddr', width: 60, hidden:true},
				{ label: '拥堵终点', name: 'endAddr', width: 60,hidden:true},
				{ label: '拥堵点坐标', name: 'xy', width: 60, hidden:true},
				{ label: '拥堵范围坐标', name: 'xys', width: 60, hidden:true}
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
	        onSelectRow: function(rowid, status){//选中某行
	    		var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	    		map.getOverlayLayer().clear(vectors);
	    		vectors=[];
	    		var pos = rowData.xy.split(",");
	    		map.setCenter(new IMAP.LngLat(pos[0], pos[1]),16);
				//linkJamApp.showOnelinkJam(rowData);
	    		//显示详细信息
	    		linkJamApp.showOnelinkJam(rowData);
	    		setInfoWindow(rowData,rowData.xy,true);
	    	}
	    });
	    
	    //在地图上显示全部的区域
	    $.ajax({
		    url:'./jtzx/linkJam/allData?roadType='+ $("#typeId").val()+'&preHandlingTime='+ $("#startTime").val()+'&zdId='+zdId,
		    type:'GET', 
		    contentType: "application/json",  
		    success:function(dat){
		        if(dat.code == 200){
		        	clearQueryResPolygons();
		        	var linkList = dat.linkJamList;
		        	for (var i = 0; i < linkList.length; i++) {
						var linkJam = linkList[i];
						if(linkJam.xy){
							var pos = linkJam.xy.split(",");
							var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
							marker.data = linkJam;
							marker.addEventListener(IMAP.Constants.CLICK, markerClick);
							var contextMen = '<div class="self-menu">'
								+'<span class="openCamera detailspan">周边监控</span></div>';
							//右击事件
							marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, function(e,b) {
								CustomContextMenu.setContent(contextMen,e,100,40);
								$(".openCamera").on( "click", function() {
									CustomContextMenu.close();
									var linkJam = e.target.data;
									$.ajax({
									    url:'./map/map/findVideoInCycle?lnglat='+linkJam.xy+'&radius=100',
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
							});
							
							map.getOverlayLayer().addOverlay(marker, false);
						}
					}
		        }else{
		        	alert(rslt.msg);
		        }
		    }
		});
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	};
	
	var type2word = function(type){
		var word = "其他";
		switch (type) {
			case 0:
				word = "不详";
				break;
			case 1:
				word = "施工";
				break;
			case 2:
				word = "事故";
				break;
			case 3:
				word = "违停";
				break;
			case 4:
				word = "交通管制";
				break;
			case 5:
				word = "坏车";
				break;
			case 6:
				word = "车流量大";
				break;
			case 7:
				word = "信号灯";
				break;
			case 8:
				word = "道路积水";
				break;
			case 9:
				word = "突发事件";
				break;
			case 10:
				word = "其它";
				break;
			case 11:
				word = "道路封闭";
				break;
			case 12:
				word = "路况不符";
				break;
			default:
				break;
		}
		return word;
	}
	
	var CurentTime= function(){ 
        var now = new Date();
       
        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
       
        var clock = year + "-";
       
        if(month < 10)
            clock += "0";
       
        clock += month + "-";
       
        if(day < 10)
            clock += "0";
           
        clock += day;
        return(clock); 
    }
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show : show,
		hide : hide
	};
})