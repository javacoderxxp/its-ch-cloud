define(function(require) {
	var htmlStr = require('text!./jtsgPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	

	var searchAreaPolygon = null; 
	var mousetool = null;
	var mousetoolhx = null;
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/accident.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var markers = [];//覆盖物列表z
	
	var markerBlackOpts = new IMAP.MarkerOptions();
	markerBlackOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerBlackOpts.icon = new IMAP.Icon("./assets/images/accident24.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
//	markerBlackOpts.icon = new IMAP.Icon("./assets/images/blackCross.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	var blackCrossMarkers = [];//事故黑点路口
	var blackCrossLabels = [];
	
	var show = function(jtsgParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#jtsg-panel',
			data: {
				showList: true, //显示查询
				currentUser: currentUser,
				jtsgQ: {startDt: TUtils.formatDateTime000(new Date()), endDt: TUtils.formatDateTime(new Date())}, //查询参数
				jtsg: jtsgParam,
				dataList : [],//数据列表
				blackCrossList : [],//事故黑点路口
				vBadwList:[],//办案单位列表
				newGridPolygon:null,
				overlay:null
			},
			methods: {
				query: function () {
					vm.clear();
					vm.reload();
				},
				queryBlackCross: function () {
					vm.clear();
					var url = "qw/jtsg/findBlackCross";
					vm.jtsgQ.radius = 200;//200米半径
					layer.load();
					$.ajax({
						type: "GET",
						data: vm.jtsgQ,
						url: url,
						success: function(rslt){
							layer.closeAll('loading');
							if(rslt.code == 200){
								vm.blackCrossList = rslt.crossList;
								vm.showBlackCross();
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				reset: function () {
					vm.jtsgQ = {};
				},
				reload: function () {
					vm.showList = true;
					loadJqGrid();
				},
				addShape: function() {
					this.clear();
					mousetoolhx=new IMAP.PolylineTool();
					mousetoolhx.autoClose = true;//是否自动关闭绘制	
					map.addTool(mousetoolhx);
					mousetoolhx.open();
					mousetoolhx.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						vm.overlay  = evt.overlay;
						var shape = TUtils.polygonPath2Str(evt.overlay.getPath());
						vm.jtsgQ.lines=shape;
						vm.reload();
						mousetoolhx.close();
					},this);
				},
				//加载地图数据
				loadData : function(paramDataList) {
					if(paramDataList){
						vm.dataList = paramDataList;//传入的数据
						vm.applyDataToUI();
					}else{//主动查询的数据
						layer.load();
						var url = "qw/jtsg/allData";
						$.ajax({
							type: "GET",
							data: vm.jtsgQ,
							url: url,
							success: function(rslt){
								layer.closeAll('loading');
								if(rslt.code == 200){
									vm.dataList = rslt.jtsgList;
									vm.applyDataToUI();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				//数据应用到视图
				applyDataToUI : function() {
					for(var i = 0; i < vm.dataList.length; i++){
						var jtsg = vm.dataList[i];
						if(jtsg.shape){
							var pos = jtsg.shape.split(",");
							var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
							marker.data = jtsg;
							marker.addEventListener(IMAP.Constants.CLICK, vm.markerClick);

							map.getOverlayLayer().addOverlay(marker, false);
							marker.setTitle(jtsg.sgbh);
							markers.push(marker);
						}
					}
					gblMapObjs.jtsgMarkers = markers;
					//创建聚合管理对象
					map.plugin(['IMAP.DataCluster'], function(){
						gblMapObjs.jtsgDataCluster = new IMAP.DataCluster(map, markers, {
							maxZoom: 0, //比例尺级别
							gridSize: 80, //网格缓冲的像素值，默认为60。
							zoomOnClick: true, //点击放大
							minimumClusterSize: 2,//最小聚合数
							styles: dataClusterStyle 
						});
					});
					//当前地图级别大于18是  取消聚合图   全部显示
					map.addEventListener(IMAP.Constants.ZOOM_END,function(){
						var mZoom= map.getZoom();
						if(mZoom>=18){
							gblMapObjs.jtsgDataCluster.setMaxZoom(100,true);
						}else{
							gblMapObjs.jtsgDataCluster.setMaxZoom(0,true);
						}
					});
					layer.msg('加载了'+markers.length+"个交通事故");
				},
				//单击事件
				markerClick : function(e) {
					var marker = e.target;
					var data = e.target.data;
					map.setCenter(e.lnglat,17);
					var msg = "案发地点："+data.afdz+"</br>时间："+data.fasj
						+"</br>办案警员："+data.jbr+"</br>详情："+data.jyaq;
					alert(msg);
				},
				showBlackCross : function() {
					for(var i = 0; i < vm.blackCrossList.length; i++){
						/*if(i > 9){
							break;
						}*/
						var obj = vm.blackCrossList[i];
						var pos = obj.zb.split(",");
						var markerPnt = new IMAP.LngLat(pos[0], pos[1]);
						var marker = new IMAP.Marker(markerPnt, markerBlackOpts);
						marker.data = obj;//marker绑定数据
						
//						map.getOverlayLayer().addOverlay(marker, false);
						blackCrossMarkers.push(marker);
						
//						var infoLabel = new IMAP.Label("["+(i+1)+"] "+obj.mc+"(事故:"+obj.jtsgCnt+"起)", {
						var infoLabel = new IMAP.Label(obj.jtsgCnt, {
							position : markerPnt,// 基点位置
							offset: new IMAP.Pixel(0,-25),//相对于基点的位置
							anchor : IMAP.Constants.BOTTOM_CENTER,
							fontSize : 14,
							fontBold : true,// 在html5 marker的情况下，是否允许marker有背景
							fontColor : "black"
						});
						map.getOverlayLayer().addOverlay(infoLabel, false);
						blackCrossLabels.push(infoLabel);
					}
					gblMapObjs.jtsgBlackCrossMarkers = blackCrossMarkers;
					layer.msg('加载了'+blackCrossMarkers.length+"个路口");
					
				},
				//清除数据
				clear: function() {
					//清除界面
					for (var i = 0; i < markers.length; i++) {
						map.getOverlayLayer().removeOverlay(markers[i]);
					}
					//清除聚合图
					if(gblMapObjs.jtsgDataCluster){
						gblMapObjs.jtsgDataCluster.clearMarkers();
//						dataCluster.setMap(null);
					}
					//清除黑点路口
					for (var i = 0; i < blackCrossMarkers.length; i++) {
						map.getOverlayLayer().removeOverlay(blackCrossMarkers[i]);
					}
					for (var i = 0; i < blackCrossLabels.length; i++) {
						map.getOverlayLayer().removeOverlay(blackCrossLabels[i]);
					}
					
					markers = [];
					gblMapObjs.jtsgMarkers = [];
					
					blackCrossMarkers = [];
					gblMapObjs.jtsgBlackCrossMarkers =[];
					
					vm.jtsgQ.lines  ="";
					vm.jtsgQ.area  ="";
					
					if(vm.newGridPolygon){//清除多边形
						map.getOverlayLayer().removeOverlay(vm.newGridPolygon);
						vm.newGridPolygon=null;
					}
					
					if(vm.overlay){//清除折线
						map.getOverlayLayer().removeOverlay(this.overlay);
						vm.overlay = null;
					}
					
					//清除数据
					vm.dataList = [];
					vm.blackCrossList = [];
					
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.jtsgQ.startDt = $("#startDtQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.jtsgQ.endDt = $("#endDtQ").val()}});
				},
				showOneJtsg: function(jtsg){
					if(jtsg.shape){
						var pos = jtsg.shape.split(",");
						map.setCenter(new IMAP.LngLat(pos[0], pos[1]), 18);
					}else{
						layer.msg('该交通事故无点位信息!');
					}
				},
				close: function() {
					vm.clear();
					itsGlobal.hideLeftPanel();
				},
				areaSearch: function () {
					
					vm.clear();
					mousetool = new IMAP.PolygonTool();
					mousetool.autoClose = true;//是否自动关闭绘制
					map.addTool(mousetool);
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						vm.newGridPolygon = evt.overlay;
						vm.jtsgQ.area = TUtils.polygonPath2Str(evt.overlay.getPath());
						vm.reload();
						mousetool.close();
					},this);
				}
			}
		});
		loadVBadwList();
		
		loadJqGrid();
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "jtsgPanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		vm.loadData();
		
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {sgbh:vm.jtsgQ.sgbh, fadd:vm.jtsgQ.fadd, vBadw:vm.jtsgQ.vBadw, 
				jbr:vm.jtsgQ.jbr, startDt:vm.jtsgQ.startDt, endDt:vm.jtsgQ.endDt,
				area:vm.jtsgQ.area,lines:vm.jtsgQ.lines};
		$("#jqGrid").jqGrid({
			url: "qw/jtsg/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '事故编号', name: 'sgbh', width: 40, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '发生时间', name: 'fasj', width: 40, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '发生地点', name: 'fadd', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '办案单位', name: 'vBadw', width: 40, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '经办人', name: 'jbr', width: 40, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '坐标', name: 'shape', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
			],
			viewrecords: true,
			height: 220,
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
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				vm.showOneJtsg(rowData);
	    	}
		});
	};
	

	var loadVBadwList = function() {
	    $.get("qw/jtsg/findVBadwList", function(r){
			if(r.code == 200){
				vm.vBadwList = r.vBadwList;
				vm.vBadwList.unshift('');
				/*if(currentUser.jjddUser){
					vm.vBadwList = r.vBadwList;
					vm.vBadwList.unshift('');
				}else if(currentUser.jjzdUser){
					vm.vBadwList.push(currentUser.group.groupName);
				}*/
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('.selectpicker').selectpicker({
						noneSelectedText:'请选择一个单位',
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
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})