define(function(require) {
	var htmlStr = require('text!./roadCrossFlow.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vehicleFlowApp = null;
	var heatmapOverlay = null, headmapDatas = {data:[]};
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		crossFlowApp = new Vue({
			el: '#crossFlowApp-panel',
			data: {
				showChart:false,
				crossList:[],
				flowList:[]
			},
			watch:{
				crossList:'loadMultiselect',
				flowList:'updateChart'
			},
			methods: {
				query: function() {
					var startDt = $("#crossFlowStartTime").val();
					var endDt = $("#crossFlowEndTime").val();
					var crossId = $("#crossFlowSelect").val();
					if(""==startDt||""==endDt||""==crossId){
						return;
					}
					var queryStartDt = new Date(startDt.replace(/-/g,"/"));
					var queryEndDt = new Date(endDt.replace(/-/g,"/"));
					
					if(queryStartDt<=queryEndDt){
						var url = "signal/flowHalfhour/queryFlow/"+crossId+"?startDt="+startDt+"&endDt="+endDt+"&rd="+Date.now();
						$.ajax({
							url: url,
							success: function(rslt){
								if(rslt.code == 200){
									crossFlowApp.flowList = rslt.list;
								}else{
									alert(rslt.msg);
								}
							}
						});
					}else{
						layer.msg("查询结束时间必须在开始时间之后");
					}
				},
				updateChart:function(cur,old){
					this.updateTotalFlowChart(cur);
				},
				updateTotalFlowChart:function(data){
					this.showChart = true;
					require(['echart'],function(echart){
						var chart = echart.init(document.getElementById('crossFlowChart1'));
						var option = {
							title: {
						        text: '路口流量图',
						        subtext: '-- 30分钟粒度',
						        left:'center'
						    },
						    color: ['#3398DB'],
						    tooltip : {
						        trigger: 'axis',
						        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
						            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
						        }
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
						            data : [],
						            axisTick: {
						                alignWithLabel: true
						            },
						            nameTextStyle:{
						            	fontSize:10
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
						            name:'30分钟流量',
						            type:'bar',
						            barWidth: '60%',
						            data:[]
						        }
						    ]
						};
						for (var i = 0; i < data.length; i++) {
							var flow = data[i];
							option.xAxis[0].data.push(flow.recordTime.replace(" ","\n"));
							option.series[0].data.push(flow.total);
						}
						chart.setOption(option);
					});
				},
				loadMultiselect:function(cur,old){
					/*require(['bootstrapMultiselect'],function(){
						 $('#crossFlowSelect').multiselect({
						 	nonSelectedText:'请选择一个路口',
							enableFiltering: true,
							maxHeight:400,
							buttonWidth: '100%'
						 });
					});*/
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#crossFlowSelect').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				loadData:function(){
					$.ajax({
    					url: "jcsj/cross/allData",
    					success: function(rslt){
    						if(rslt.code == 200){
    							crossFlowApp.crossList = rslt.crossList;
    						}else{
    							alert(rslt.msg);
    						}
    					}
    				});
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:00'});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:00'});
				},
				close: function() {
					this.showChart = false;
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		crossFlowApp.loadData();
		vueEureka.set("leftPanel", {
			vue: crossFlowApp,
			description: "crossFlow的vue实例"
		});
		/*require(['datetimepicker'],function(){
			$(".form_datetime").datetimepicker({format: 'yyyy-mm-dd hh:ii:00',autoclose: true});
		})*/
	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})