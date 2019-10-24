define(function(require) {
	var htmlStr = require('text!./vehicleFlow.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	var colors = ['#25daba', '#675bba'];
	
	var heatmapOverlay = null, headmapDatas = {data:[]};
//	var hospotOption = new IMAP.HospotOptions();
//	hospotOption.type=IMAP.Constants.LAYER_HOTSPOT_RECT_TYPE;
//	hospotOption.type="";
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/elecPolice.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.CENTER;
	var marker = null;//覆盖物列表
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#vehicleFlow-panel',
			data: {
				showList:false,
				dataList:[],
				epList:[],
				vehiclePassQ:{startDt: TUtils.formatDateTime000(new Date()), endDt: TUtils.formatDate(new Date())+" 23:59:59"},
				todayData:false,
				todaySummary:{},
				overSummary:{},
				flows:[],
				deviceName:""
//				vehiclePassQ:{startDt: '2017-11-01 00:00:00', endDt: '2017-11-30 00:00:00'},
			},
			methods: {
				query: function() {
					vm.clear();
					layer.load();
					$.ajax({
						url: "video/vehiclePass/findVehiclePassStatList",
						data: vm.vehiclePassQ,
						success: function(rslt){
							if(rslt.code == 200){
								layer.closeAll('loading');
								vm.dataList = rslt.vehiclePassStatList;
								vm.showList = true;
								vm.applyDataToUI();
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				//数据应用到视图
				applyDataToUI : function() {
					for(var i = 0; i < vm.dataList.length; i++){
						var obj = vm.dataList[i];
						if(obj.shape){
							var pos = obj.shape.split(",");
//							var item = {"lng": pos[0],"lat": pos[1],"count": Math.random()*100};
							var item = {"lng": pos[0],"lat": pos[1],"count":obj.cnt};
							headmapDatas.data.push(item);
						}
					}
					
					map.plugin(['IMAP.HeatmapOverlay'], function(){
						//TODO 参数不正确
						heatmapOverlay=new IMAP.HeatmapOverlay(headmapDatas, {
							radius: 20, //给定半径
							gradient: {  //热力颜色变化趋势
								.25: "rgb(0,0,255)",  
								.55: "rgb(0,255,0)",
								.85: "yellow",
								1: "rgb(255,0,0)"
							},
							blur: 0.95//边缘虚化 取值：0 ~ 1  值越大边缘越虚化
						});
						map.getOverlayLayer().addOverlay(heatmapOverlay);
					});
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.vehiclePassQ.startDt = $("#startDtQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.vehiclePassQ.endDt = $("#endDtQ").val()}});
				},
				clear : function() {
					//清除界面
					if(heatmapOverlay){
						map.getOverlayLayer().removeOverlay(heatmapOverlay);
						heatmapOverlay.setMap(null);
						heatmapOverlay = null;
					}
					if(marker){
						map.getOverlayLayer().removeOverlay(marker);
					}
					//清除数据
//					dataList = [];
					marker = null;
					headmapDatas = {data:[]};
				},
				close: function() {
					vm.clear();
					itsGlobal.hideLeftPanel();
				},
				locatePosition:function(vps){
					if(vps && vps.shape){
						var pos = vps.shape.split(",");
						if(pos.length == 2){
							var lnglat = new IMAP.LngLat(pos[0], pos[1]);
							map.setCenter(lnglat,18);

							if(marker){
								map.getOverlayLayer().removeOverlay(marker);
								marker = null;
							}
							var marker = new IMAP.Marker(lnglat, markerOpts);
							map.getOverlayLayer().addOverlay(marker, false);
						}
					}
				},
				loadTodayData:function(vps){
					if(vps && vps.deviceId) {
						vm.todayData = true;
						layer.load();
						$.ajax({
							url: "video/trafficFlow/getTodayData?deviceId="+vps.deviceId,
							success: function(rslt){
								if(rslt.code == 200){
									layer.closeAll('loading');
									vm.deviceName = vps.deviceName;
									vm.todaySummary = rslt.todayDate;
									vm.overSummary = rslt.overData;
									vm.flows = rslt.flows;
									drawChart();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				back:function(){
					vm.todayData = false;
				}
			}
		});
		
		loadEpList();

		/*require(['datetimepicker'],function(){
			$('.form_datetime').datetimepicker({
				language: "zh-CN",
				format : "yyyy-mm-dd hh:ii:00",//日期格式
				autoclose: true,
			}).on('changeDate', function (ev) {
				var startDt = $("#startDtQ").val();
				$("#endDtQ").datetimepicker('setStartDate', startDt);
				var endDt = $("#endDtQ").val();
				$("#startDtQ").datetimepicker('setEndDate', endDt);
			}).on('hide', function (ev) {
				vm.vehiclePassQ.startDt = $("#startDtQ").val();
				vm.vehiclePassQ.endDt = $("#endDtQ").val();
			});
		})*/
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "vehicleFlow的vue实例"
		});
	}
	
	var loadEpList = function() {
	    $.get("dev/ep/allData", function(r){
			if(r.code == 200){
				vm.epList = r.epList;
				vm.epList.unshift({deviceName:'所有'});
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('.selectpicker').selectpicker({
						noneSelectedText:'请选择一台设备',
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
	
	var drawChart = function (){
		// 基于准备好的dom，初始化echarts实例
	    var myChart = echarts.init(document.getElementById('echarts-div'), 'walden');
	    var dateArray = [];
	    var x1 = [];
	    var x2 = [];
	    var todayStatArray = [];
	    var overStatArray = [];
	    for(x in vm.todaySummary){
	    	x1.push(vm.todaySummary[x].name);
	    	todayStatArray.push(vm.todaySummary[x].value);
	    }
	    
	    for(x in vm.overSummary) {
	    	x2.push(vm.overSummary[x].name);
	    	overStatArray.push(vm.overSummary[x].value);
	    }
	  
	    var dType =[],t1,t2,xName;
	    	
	    	t1 = "今天流量";
	    	t2 = "平均流量";
	    	dType.push(t1);
	    	dType.push(t2);
	    	xName="分钟";

	    // 指定图表的配置项和数据
	    var option = {
	    	color: colors,	
	    		
	        title: {
	            text: "5分钟流量"
	        },
	        grid: {
	            top: 70,
	            bottom: 50
	        },
	        tooltip: {
	        	 trigger: 'none',
	             axisPointer: {
	                 type: 'cross'
	             }
	        },
	        legend: {
	            data:dType
	        },
	        toolbox: {
	            show : true,
	            feature : {
	                dataView : {show: true, readOnly: false},
	                magicType : {show: true, type: ['line', 'bar']},
	            }
	        },
	        xAxis:[
	               {
	                   type: 'category',
	                   axisTick: {
	                       alignWithLabel: true
	                   },
	                   axisLine: {
	                       onZero: false,
	                       lineStyle: {
	                           color: '#00FF00'
	                       }
	                   },
	                   axisPointer: {
	                       label: {
	                           formatter: function (params) {
	                               return '平均流量  ' + params.value
	                                   + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
	                           }
	                       }
	                   },
	                   data: x2
	               },
	               {
	                   type: 'category',
	                   axisTick: {
	                       alignWithLabel: true
	                   },
	                   axisLine: {
	                       onZero: false,
	                       lineStyle: {
	                           color: '#5793f3'
	                       }
	                   },
	                   axisPointer: {
	                       label: {
	                           formatter: function (params) {
	                               return '今日流量  ' + params.value
	                                   + (params.seriesData.length ? '：' + params.seriesData[0].data : '');
	                           }
	                       }
	                   },
	                   data: x1
	               }
	        ],
	        yAxis: {min: 0,
	            	axisLabel: {
	                formatter: '{value}'
	            }
	        },
	        series: [
	        	{
		            name: t1,
		            type: 'bar',
		            xAxisIndex: 1,
		            smooth: true,
		            data: todayStatArray,
		            itemStyle: {
		            	normal: {
		            	color: function(params) {
		            	     var index_value = params.value;
		            	     var index_name = params.name;
		            	     var flag = false;
		            	     for(x in vm.overSummary) {
		            		    if(index_name == vm.overSummary[x].name){
		            		    	 if(index_value > vm.overSummary[x].value){
		            		    		 flag = true;
		            		    		 break;
		            		    	 }
		            		    }
		            		 }
		            	    
		            	     if(flag){
		            	         return '#fe4365';
		            	     }else {
		            	          return '#5793f3';
		            	     }
		            	}
		              }
		         }
		        },{
		            name: t2,
		            type: 'line',
		            smooth: true,
		            data: overStatArray,
		            itemStyle: {
		            	normal: {
		            	color: '#00FF00'
		            	
		              }
		         }
		        }
	        ]
	    };
	    // 使用刚指定的配置项和数据显示图表。
	    myChart.setOption(option);
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})