define(function(require) {
	var htmlStr = require('text!./hikVFReport.html');
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
			el: '#hikVFR-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			data: {
				showList:false,
				tCounts:0,
				xxcSum:0,
				zxcSum:0,
				dxcSum:0,
				vehicleFlowRptSummary:{},
				vehiclePassQ:{deviceId:'', startDt: TUtils.formatDate(new Date()), timeUnit:'DAY'},
				epList:[],
				remindeMsg:'*基准日期(24小时)的流量'
			},
			watch:{
				'vehiclePassQ.timeUnit':{
					deep: true,
					handler : function(val, oldVal) {
						if(val == 'DAY'){
							vm.remindeMsg='*基准日期当天的流量';
							vm.vehiclePassQ.startDt = TUtils.formatDate(new Date());
						}else{
							vm.remindeMsg='*基准日期后7天的流量,建议选择周一;数据较多请稍等';
							vm.vehiclePassQ.startDt = TUtils.formatDate(new Date());
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
					vm.tCounts=0;
					vm.xxcSum =0;
			    	vm.zxcSum =0;
			    	vm.dxcSum =0;
					layer.load();
					$.ajax({
						url: "http://192.168.14.4:8700/sc-videoGateway/video/hikFlow/findVehicleFlowRprtSummary",
						data: vm.vehiclePassQ,
						success: function(rslt){
							if(rslt.code == 200){
								layer.closeAll('loading');
								vm.vehicleFlowRptSummary = rslt.hikFlows;
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
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "hikVFR的vue实例"
		});
	}
	
	var loadEpList = function() {
	    $.get("dev/hikFlowCam/allData", function(r){
			if(r.code == 200){
				vm.epList = r.hikFlowCamList;
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
	    var vehPassStatFarArray = [];
	    for(x in vm.vehicleFlowRptSummary){
	    	if(vm.vehiclePassQ.timeUnit != 'DAY'){
	    		x1.push(vm.vehicleFlowRptSummary[x].captureDt);
	    	}else{
	    		x1.push(vm.vehicleFlowRptSummary[x].captureDt+"时");
	    	}
	    	vm.tCounts = parseInt(vm.tCounts) + parseInt(vm.vehicleFlowRptSummary[x].cnt);
	    	vm.xxcSum =parseInt(vm.xxcSum) + parseInt(vm.vehicleFlowRptSummary[x].xxcSum);
	    	vm.zxcSum =parseInt(vm.zxcSum) + parseInt(vm.vehicleFlowRptSummary[x].zxcSum);
	    	vm.dxcSum =parseInt(vm.dxcSum) + parseInt(vm.vehicleFlowRptSummary[x].dxcSum);
	    	vehPassStatFarArray.push(vm.vehicleFlowRptSummary[x].cnt);
	    }
	    
	    var t1,xName;
	    if(vm.vehiclePassQ.timeUnit == 'DAY'){
	    	t1="当天";
	    	xName="小时";
	    }else{
	    	t1="七天";
	    	xName="天";
	    }

	    // 指定图表的配置项和数据
	    var option = {
	    		
	        title: {
	            text: '海康卡口流量'
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
	        toolbox: {
	            show : true,
	            feature : {
	                dataView : {show: true, readOnly: false},
	                magicType : {show: true, type: ['line', 'bar']},
	            }
	        },
	        xAxis:{
	                   type: 'category',
	                   axisPointer: {
	                       label: {
	                           formatter: function (params) {
	                               return '卡口流量  ' + params.value
	                                   + (params.seriesData.length ? '：' + params.seriesData[0].data : '')+'';
	                           }
	                       }
	                   },
	                   data: x1
	        },
	        yAxis: {
	        	  type: 'value'
	        },
	        series: [
	        	{	
	        		name: t1,
		            type: 'bar',
		            data: vehPassStatFarArray
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