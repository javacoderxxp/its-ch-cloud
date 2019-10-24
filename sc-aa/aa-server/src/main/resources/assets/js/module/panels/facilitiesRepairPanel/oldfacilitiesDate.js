/**
 * 设备设施维修统计折线和柱状图
 */
define(function(require) {
	var htmlStr = require('text!./facilitiesDate.html');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');

	var my97Datepicker = require('my97Datepicker');
	//require('echarts');
	var Vue = require('vue');
	var facilitiesStaApp = null;
	require('datetimepicker');
    
    var show = function(/*sType*/) {
    	var title;
    	var tlegend;
    	itsGlobal.showLeftPanel(htmlStr);
    	
    	facilitiesStaApp = new Vue({
			el: '#facilitiesSta-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			data: {
				facilitiesRepairQ: { startDt: TUtils.formatDate(new Date()), timeUnit:'DAY'}, //查询参数
				facilitiesDates: {},
				unitNames:{},
				xdata: [],
				seriesData: {},
				receiveList: [],
	    		arriveList: [],
	    		finishList: [],
				remindeMsg:'基准日期当天(计24小时)的统计'
			},
			watch:{
				'facilitiesRepairQ.timeUnit':{
					deep: true,
					handler : function(val, oldVal) {
						if(val == 'DAY'){
							facilitiesStaApp.remindeMsg='基准日期当天(计24小时)的统计';
						}else if(val == 'MONTH'){
							facilitiesStaApp.remindeMsg='基准日期前一月(计30天)的统计';
						}else if(val == 'YEAR'){
							facilitiesStaApp.remindeMsg='基准日期前一年(计12个月)的统计';
						}
					}
				}
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#type').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#results').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd',onpicked:function(){facilitiesStaApp.facilitiesRepairQ.startDt = $("#startDt").val()}});
				},
					close: function() {
						itsGlobal.hideLeftPanel();
					},
					query: function(){
						loadJqGrid();
					},
					addEcharts: function() {
						// 基于准备好的dom，初始化echarts实例
				        var myChart = echarts.init(document.getElementById('main'), 'walden');
				        //--- 折柱 ---  
				        //定义图表option  
				        var option = {  
				            tooltip: {  
				                //触发类型，默认（'item'）数据触发，可选为：'item' | 'axis'  
				                trigger: 'axis'  
				            },  
				            //图例，每个图表最多仅有一个图例  
				            legend: {  
				                data: ['平均接单时间','平均到场时间','平均完成时间']
				            },  
				            //工具箱，每个图表最多仅有一个工具箱  
				            toolbox: {  
				                //显示策略，可选为：true（显示） | false（隐藏），默认值为false  
				                show: true,  
				                //启用功能，目前支持feature，工具箱自定义功能回调处理  
				                feature: {  
				                    //辅助线标志  
				                    mark: {show: true},  
				                    //dataZoom，框选区域缩放，自动与存在的dataZoom控件同步，分别是启用，缩放后退  
				                    dataZoom: {  
				                        show: false,  
				                         title: {  /*
				                            dataZoom: '区域缩放',  
				                            dataZoomReset: '区域缩放后退'  */
				                        }  
				                    },  
				                    //数据视图，打开数据视图，可设置更多属性,readOnly 默认数据视图为只读(即值为true)，可指定readOnly为false打开编辑功能  
				                    dataView: {show: true, readOnly: true},  
				                    //magicType，动态类型切换，支持直角系下的折线图、柱状图、堆积、平铺转换  
				                    magicType: {show: true, type: ['line', 'bar']},  
				                    //restore，还原，复位原始图表  
				                    restore: {show: true},  
				                    //saveAsImage，保存图片（IE8-不支持）,图片类型默认为'png'  
				                    saveAsImage: {show: true}  
				                }  
				            },  
				            //是否启用拖拽重计算特性，默认关闭(即值为false)  
				            calculable: true,  
				            //直角坐标系中横轴数组，数组中每一项代表一条横轴坐标轴，仅有一条时可省略数值  
				            //横轴通常为类目型，但条形图时则横轴为数值型，散点图时则横纵均为数值型  
				            xAxis: [  
				                {  
				                    //显示策略，可选为：true（显示） | false（隐藏），默认值为true  
				                    show: true,  
				                    //坐标轴类型，横轴默认为类目型'category'  
				                    type: 'category',  
				                    //类目型坐标轴文本标签数组，指定label内容。 数组项通常为文本，'\n'指定换行  
				                    data: facilitiesStaApp.xdata,  
				                }  
				            ],  
				            //直角坐标系中纵轴数组，数组中每一项代表一条纵轴坐标轴，仅有一条时可省略数值  
				            //纵轴通常为数值型，但条形图时则纵轴为类目型  
				            yAxis: [  
				                {  
				                  name: '平均时间（分钟）',
				                  type: 'value'
				                }  
				            ],  
				              
				            //sereis的数据: 用于设置图表数据之用。series是一个对象嵌套的结构；对象内包含对象  
				            series: [  
									{  
									    name: '平均接单时间',  
									    type: 'bar',  
									    data: facilitiesStaApp.receiveList,  
									    markPoint: {  
									        data: [  
									            {type: 'max', name: '最大值'},  
									            {type: 'min', name: '最小值'}  
									        ]  
									    }
									},
									{  
									    name: '平均到场时间',  
									    type: 'bar',  
									    data: facilitiesStaApp.arriveList,  
									    markPoint: {  
									        data: [  
									            {type: 'max', name: '最大值'},  
									            {type: 'min', name: '最小值'}  
									        ]  
									    } 
									},
									{  
									    name: '平均完成时间',  
									    type: 'bar',  
									    data: facilitiesStaApp.finishList,  
									    markPoint: {  
									        data: [  
									            {type: 'max', name: '最大值'},  
									            {type: 'min', name: '最小值'}  
									        ]  
									    } 
									} 
				            ]  
				        };
				    
				    	
				    	// 使用刚指定的配置项和数据显示图表。
				    	myChart.setOption(option);
					}
				}
				
    	});
    	
    	$.get("./jtss/repairUnit/allData?type="+"1,2,3,4,5", function(r){
	    	if(r.code == 200){
	    		facilitiesStaApp.unitNames = r.repairUnitList;
	    	}else{
	    		alert(r.msg);
	    	}
	    });
    	/*
    	$("#startDt").datetimepicker({
			format: 'yyyy-mm-dd',
			minView: 2, 
			autoclose: true
			}).on('changeDate', function(ev){
				var startDt= $("#startDt").val();
				$('#endDt').datetimepicker('setStartDate', startDt);
			});*/
    	
    	//加载数据
    	loadJqGrid();
    
    	vueEureka.set("leftPanel", {
			vue: facilitiesStaApp,
			description: "facilitiesSta的vue实例"
		});
    	
    }
    
    var loadJqGrid = function() {
    	var startDt = $("#startDt").val();
    	$.ajax({
		    url: "./jtss/facilitiesRepair/facilitiesDate",
	        data: {"repairUnitId" : $("#repairUnitId").val(), 
	        		"timeUnit" : $("#timeUnit").val(),
	        		"startDt" : startDt + " 23:59:59"},
		    success: function(rslt){
				if(rslt.code == 200){
					var facilitiesDates = rslt.facilitiesDates;
					facilitiesStaApp.xdata = [];
					facilitiesStaApp.receiveList = [];
					facilitiesStaApp.arriveList = [];
					facilitiesStaApp.finishList = [];
					for(i in facilitiesDates.receiveList){
						var startTime = facilitiesDates.receiveList[i].startTime;
						
						if(facilitiesStaApp.facilitiesRepairQ.timeUnit == 'DAY'){
							startTime = startTime.replace(startDt,'') + "时";
						}
						facilitiesStaApp.xdata.push(startTime);
			    		//y.push();
			    		facilitiesStaApp.receiveList.push(facilitiesDates.receiveList[i].receive);
			    		facilitiesStaApp.arriveList.push(facilitiesDates.arriveList[i].arrive);
			    		facilitiesStaApp.finishList.push(facilitiesDates.finishList[i].finish);
				    }
					
					facilitiesStaApp.addEcharts();
				}else{
					alert(rslt.msg);
				}
			}
		});
    }
    
    
    
    var hide = function() {
		itsGlobal.hideLeftPanel();
	}
    

	return {
		show : show,
		hide : hide
	};
	
})