define(function(require) {
	var htmlStr = require('text!./vehicleFlowReport.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	var heatmapOverlay = null, headmapDatas = {data:[]};
	var colors = ['#5793f3', '#d14a61', '#675bba'];
	
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#vehicleFlowReport-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			data: {
				showList:false,
				vehicleFlowRptSummary:{},
				vehiclePassQ:{deviceId:'', startDt: TUtils.formatDate(new Date()), timeUnit:'DAY'},
//				vehiclePassQ:{deviceId:'', startDt: '2017-11-01', timeUnit:'WEEK'},
				epList:[],
				remindeMsg:'*基准日期与前1天(计48小时)的流量'
			},
			watch:{
				'vehiclePassQ.timeUnit':{
					deep: true,
					handler : function(val, oldVal) {
						if(val == 'DAY'){
							vm.remindeMsg='*基准日期与前1天(计48小时)的流量';
							vm.vehiclePassQ.startDt = TUtils.formatDate(new Date());
						}else{
							vm.remindeMsg='*基准日期前后7天(计14天)的流量,建议选择周一;数据较多请稍等';
							vm.vehiclePassQ.startDt = TUtils.formatDate(TUtils.setDate(TUtils.getLastMonday()));
						}
					}
				}
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
				query: function() {
					layer.load();
					$.ajax({
						url: "video/vehiclePass/findVehicleFlowRprtSummary",
						data: vm.vehiclePassQ,
						success: function(rslt){
							if(rslt.code == 200){
								layer.closeAll('loading');
								vm.vehicleFlowRptSummary = rslt.vehicleFlowRptSummary;
								vm.showList=true;
								vm.applyDataToUI();
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', isShowClear: false, onpicked:function(){vm.vehiclePassQ.startDt = $("#startDtQ").val()}});
				},
				//数据应用到视图
				applyDataToUI : function() {
					drawChart();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		loadEpList();

		/*require(['datetimepicker'],function(){
			$('.form_datetime').datetimepicker({
				language: "zh-CN",
				minView: 2, 
				format : "yyyy-mm-dd",//日期格式
				autoclose: true,
			}).on('hide', function (ev) {
				vm.vehiclePassQ.startDt = $("#startDtQ").val();
			});
		})*/
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "vehicleFlowReport的vue实例"
		});
	}
	
	var loadEpList = function() {
	    $.get("dev/ep/allData?notFor=CJQ", function(r){
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
	    var vehPassStatFarArray = [];
	    var vehPassStatNearArray = [];
	    for(x in vm.vehicleFlowRptSummary.vehPassStatListFar){
	    	if(vm.vehiclePassQ.timeUnit != 'DAY'){
	    		//dateArray.push(parseInt(x)+1);
	    		x1.push(vm.vehicleFlowRptSummary.vehPassStatListFar[x].captureDt);
	    	}else{
	    		//dateArray.push(x);
	    		x1.push(vm.vehicleFlowRptSummary.vehPassStatListFar[x].captureDt+"时");
	    	}
	    	
	    	vehPassStatFarArray.push(vm.vehicleFlowRptSummary.vehPassStatListFar[x].cnt/10000.0);
	    }
	    
	    for(i in vm.vehicleFlowRptSummary.vehPassStatListNear){
	    	if(vm.vehiclePassQ.timeUnit != 'DAY'){
	    		x2.push(vm.vehicleFlowRptSummary.vehPassStatListNear[i].captureDt);
	    	}else{
	    		x2.push(vm.vehicleFlowRptSummary.vehPassStatListNear[i].captureDt+"时");
	    	}
	    	
	    	vehPassStatNearArray.push(vm.vehicleFlowRptSummary.vehPassStatListNear[i].cnt/10000.0);
	    }
	    var dType =[],t1,t2,xName;
	    if(vm.vehiclePassQ.timeUnit == 'DAY'){
	    	
	    	t1 = "前一天";
	    	t2 = "当天";
	    	dType.push(t1);
	    	dType.push(t2);
	    	xName="小时";
	    }else{
	    	t1 = "前七天"
	    	t2 = "后七天"
	    	dType.push(t1);
	    	dType.push(t2);
	    	xName="天";
	    }

	    // 指定图表的配置项和数据
	    var option = {
	    	color: colors,	
	    		
	        title: {
	            text: '卡口电警车流量'
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
	                           color: colors[1]
	                       }
	                   },
	                   axisPointer: {
	                       label: {
	                           formatter: function (params) {
	                               return '电警车流量  ' + params.value
	                                   + (params.seriesData.length ? '：' + params.seriesData[0].data : '')+'万';
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
	                           color: colors[0]
	                       }
	                   },
	                   axisPointer: {
	                       label: {
	                           formatter: function (params) {
	                               return '电警车流量  ' + params.value
	                                   + (params.seriesData.length ? '：' + params.seriesData[0].data : '')+'万';
	                           }
	                       }
	                   },
	                   data: x1
	               }
	        ],
	        yAxis: {min: 0,
	            axisLabel: {
	                formatter: '{value}万'
	            }
	        },
	        series: [
	        	{
		            name: t1,
		            type: 'line',
		            xAxisIndex: 1,
		            smooth: true,
		            data: vehPassStatFarArray
		        },{
		            name: t2,
		            type: 'line',
		            smooth: true,
		            data: vehPassStatNearArray
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