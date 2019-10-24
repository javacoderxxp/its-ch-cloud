define(function(require) {
	var htmlStr = require('text!./roadsgCount.html');
	require('my97Datepicker');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');
	var map = require('mainMap');
	var oldQ = '1';
	var Vue = require('vue');
	var vm = null;
	var infowindow=null;
	var icon_police = new IMAP.Icon("./assets/images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var opts = new IMAP.MarkerOptions();
	opts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/accident.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
    var datas={data:[]};
    var markers=[];
    var heatmapOverlay =[];
    var show = function(sType) {
    	itsGlobal.showLeftPanel(htmlStr);
    	
    	vm = new Vue({
    		el: '#roadsgCount-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			  data: {
				  	roadsgCountQ: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :''),vLdlxQ:'',time:''}, //交警大队查询所有，交警中队查询当前组
				  	roadsgCount: {region:'',vLdlx:'',groupId:(currentUser.jjzdUser? currentUser.group.groupId :'')},
					groupList:[], //中队列表
					rdList:[],
					roadsgCountList:[],
					roaddrawQ:{},
					newGridPolygon:null,
					dutyGridList:[],
					splitStaticList1:[],
					splitStaticList2:[],
					remindeMsg:'*基准日期之前一周的事故统计',
					isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0  //判断当前用户是否有中队管理员权限，如果没有，只能进行查询操作。
				},
				methods: {
					loadMultiselect:function(){
						require(['bootstrapSelect','bootstrapSelectZh'],function(){
							$('#timeQ').selectpicker({
								noneSelectedText:'所有',
								liveSearch: true,
								style: 'btn-default',
								size: 10
							});
							$('#gridIdQ').selectpicker({
								noneSelectedText:'所有',
								liveSearch: true,
								style: 'btn-default',
								size: 10
							});
							$('#vLdlxQ').selectpicker({
								noneSelectedText:'所有',
								liveSearch: true,
								style: 'btn-default',
								size: 10
							});
						});
					},
					getDutyListByTeamId: function() {
						var gid=vm.roadsgCountQ.gridId;
						$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.roadsgCountQ.groupId, function(r){
							if(r.code == 200){
								vm.dutyGridList = r.dutyGridList;
								var refreshGridId = setInterval(function(){
									$('#gridIdQ').selectpicker('refresh');
									var a = $('#gridId option').text();
									var arr = $('#ze_ren_qu div li a');
									if(arr.length <=1){
										clearInterval(refreshGridId);
										$("#gridIdQ").selectpicker('val', gid);
									}else{
										var b = arr[1].innerText;
										if(!b){
											clearInterval(refreshGridId);
											return;
										}
										if(a.indexOf(b)>=0){
											clearInterval(refreshGridId);
											$("#gridIdQ").selectpicker('val', gid);
										}
									}
								}, 10);
							}else{
								alert(r.msg);
							}
						});
					},
					query: function() {
						loadJqGrid();
					},
					close: function() {
						vm.clear();
						itsGlobal.hideLeftPanel();
					},
					markerClick : function(e) {
						var marker = e.target;
						var data = e.target.data;
						//map.setCenter(e.lnglat,17);
						if(!data.policeNum){
							data.policeNum ="无";
						}
						var msg = "案发地点："+data.eventAddr+"</br>时间："+data.eventDtStr
							+"</br>办案警员："+data.policeNum+"</br>详情："+data.eventContent;
						alert(msg);
					},
					applyDataToUI : function(dataList,region) {
						vm.clear();
						if(dataList){
							for(var i = 0; i < dataList.length; i++){
								var jtsg = dataList[i];
								if(jtsg.longitude !=null && jtsg.latitude !=null){
									/*var pos = (",");*/
									var marker = new IMAP.Marker(new IMAP.LngLat(jtsg.longitude, jtsg.latitude), markerOpts);
									marker.data = jtsg;
									marker.addEventListener(IMAP.Constants.CLICK, vm.markerClick);
									
									map.getOverlayLayer().addOverlay(marker, false);
									marker.setTitle(jtsg.eventId);
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
						}
						/*if(region){//路段周边100米之内  警员 点位
							var postDataTmp = {endDt:$("#endDt").val()+" 23:59:59",region:region};
					    	layer.load();
					    	$.ajax({
								type: "GET",
							    url: "./jtzx/roaddraw/findJwtHistory",
							    data: postDataTmp,
							    success: function(rslt){
							    	
									if(rslt.code == 200){
										if(rslt.jwtList){
											for(var i = 0; i < rslt.jwtList.length; i++){
												var jwt = rslt.jwtList[i];
												var point = new IMAP.Marker(new IMAP.LngLat(jwt.longitude, jwt.latitude), opts);
												point.setIcon(icon_police);
												point.data = jwt;
												map.getOverlayLayer().addOverlay(point, false);
												point.setTitle(jwt.bh+"————:"+jwt.time);
												markers.push(point);
											}
										}
										layer.closeAll('loading');
									}else{
										alert(rslt.msg);
										layer.closeAll('loading');
									}
								}
							});
						}*/
						vm.showOnetrafficControl(region);
					},
					showSplitStatic:function(dataList,ldmc){
						if(null == dataList || dataList.length < 1){
							alert("该路段指定七天内无事故。");
						} else {
							var staticList = [];
							for(var m=0;m<24;m++){
								var n = m+1;
								staticList[m]={};
								staticList[m].name=m+"~"+n+"";
								staticList[m].value=0;
							}
							
							for(var i=0;i<dataList.length;i++){
								var item = dataList[i];
								var dates = item.eventDtStr.split(" ");
								var timeName = dates[1].split(":")[0];
								staticList[parseInt(timeName, 10)].value += 1;
							}
							var staticList1=[];//前12个时段
							var staticList2=[];//后12个时段
							for(var i = 0;i<12;i++){
								staticList1.push(staticList[i]);
							}
							for(var i = 12;i<24;i++){
								staticList2.push(staticList[i]);
							}
							vm.splitStaticList1 = staticList1;
							vm.splitStaticList2 = staticList2;
							
							/*生成柱状图*/
							var chartTmp = echarts.init(document.getElementById('jtsgEchartsDiv'), 'walden');
							var nameArray = [];
							var valueArray = [];
							for(var i=0;i<24;i++){ 
								nameArray.push(i);
						    	valueArray.push(staticList[i].value);
							}
							var chartOpt = {
									title : {
								        x: 'center',
								        text: "7天事故分时段统计"
								    },
								    tooltip : {
								        trigger: 'axis'
								    },
								    toolbox: {
								        show : true,
								        feature : {
								            dataView : {show: true, readOnly: true},
								            magicType : {show: true, type: ['line', 'bar']},
								            saveAsImage : {show: true}
								        }
								    },
								    xAxis : [
								        {
								            type : 'category',
								            data : nameArray, 
								            axisLabel: {
						    	                interval: 0,
						    	                rotate: 20
						    	            },
								        }
								    ],
								    yAxis : [
								        {
								            type : 'value'
								        }
								    ],
							        series: [
							        	{
							        		symbol:'none',  //这句就是去掉点的 
							        		smooth:true,
								            type: 'line',
								            data: valueArray
								        }
							        ]
								};
							
							chartTmp.setOption(chartOpt);
							staticList=null;
							layer.open({
								type: 1,
								skin: 'layui-layer',
								title: ["7天事故分时段统计 : "+ldmc],
								area: ['620px', '420px'],
								shade: false,
								content: jQuery("#SplitStaticDiv"),
								btn: []
							});
						}
						
					},
					showOnetrafficControl: function (region) {
			    		var polygonPath = TUtils.polygonStr2Path(region);
			        	var plo = new IMAP.PolylineOptions();
			        	plo.strokeColor = "#ff0000";
			        	plo.strokeOpacity = "1";
			        	plo.strokeWeight = "6";
			        	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
			        	vm.newGridPolygon = new IMAP.Polyline(polygonPath, plo);
			        	map.getOverlayLayer().addOverlay(vm.newGridPolygon, false);
			        	var center = vm.newGridPolygon.getBounds().getCenter();
			        	map.setCenter(center,14);
					},
					reset: function () {
						vm.roadsgCountQ = {region:'',groupId:(currentUser.jjzdUser? currentUser.group.groupId :'')};
						$("#groupIdQ").selectpicker('val', '');
						$("#gridIdQ").selectpicker('val', '');
						$("#vLdlxQ").selectpicker('val', '');
						loadJqGrid();
					},
					clear: function (){
						for (var i = 0; i < markers.length; i++) {
							map.getOverlayLayer().removeOverlay(markers[i]);
						}
						
						if(gblMapObjs.jtsgDataCluster){
							gblMapObjs.jtsgDataCluster.clearMarkers();
//							dataCluster.setMap(null);
						}
						if(vm.newGridPolygon){//清除折线
							map.getOverlayLayer().removeOverlay(vm.newGridPolygon);
							vm.newGridPolygon = null;
						}
						gblMapObjs.jtsgMarkers = [];
						markers =[];
					}
				}
    	});
    	$("#endDt").val(TUtils.formatDate(new Date(new Date()-24*60*60*1000)));
    	loadGroups();
    	loadJqGrid();
    	vm.loadMultiselect();
    	vueEureka.set("leftPanel", {
			vue: vm,
			description: "roadsgCount-panel的vue实例"
		});
    }
    
    var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				vm.groupList = r.groupList;
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
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
	}
    
    var loadJqGrid = function() {
    	vm.rdList =[];
    	var time =vm.roadsgCountQ.time;
    	if(time.length==1 && time){
    		time="0"+time;
    	}
    	var postDataTmp = {endDt:$("#endDt").val()+" 23:59:59",mc:vm.roadsgCountQ.mc,
		    	groupId:vm.roadsgCountQ.groupId,gridId:vm.roadsgCountQ.gridId,
		    	vLdlx:vm.roadsgCountQ.vLdlxQ,datumDt:$("#endDt").val(),time:time};
    	layer.load();
    	$.ajax({
			type: "GET",
		    url: "./jtzx/roaddraw/RoadSgCountPage",
		    data: postDataTmp,
		    success: function(rslt){
		    	
				if(rslt.code == 200){
					vm.rdList = rslt.rdList;
					layer.closeAll('loading');
				}else{
					alert(rslt.msg);
					layer.closeAll('loading');
				}
			}
		});
    	
    }
    
    
    var type2word = function(vLdlx){
		var word = "其他";
		switch (vLdlx) {
			case "1":
				word = "国省道";
				break;
			case "3":
				word = "县道路";
				break;
			case "2":
				word = "城镇道路";
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