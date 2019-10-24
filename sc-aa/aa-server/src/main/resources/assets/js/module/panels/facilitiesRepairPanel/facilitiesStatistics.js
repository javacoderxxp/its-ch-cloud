/**
 * 设备设施维修统计折线和柱状图
 */
define(function(require) {
	var htmlStr = require('text!./facilitiesStatistics.html');
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
				facilitiesRepairQ: { startDt: TUtils.formatDate(new Date()), timeUnit:'DAY',
					repairUnitId:'',createBy: (currentUser.jjzdUser? currentUser.group.groupId :'')}, //查询参数
				xdata: [],
				seriesData: [],
				remindeMsg:'基准日期当天(计24小时)的统计',
				facilitiesList:[],
				unitNamesQ:[],
				groupList:[],
				facilitiesCount:0
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
				            //标题，每个图表最多仅有一个标题控件，每个标题控件可设主副标题  
				            title: {  
				                //主标题文本，'\n'指定换行  
				                text: /*title*/'',  
				                //主标题文本超链接  
				                link: '',  
				                //副标题文本，'\n'指定换行  
				                subtext: '',  
				                //副标题文本超链接  
				                sublink: '',  
				                //水平安放位置，默认为左侧，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）  
				                x: 'left',  
				                //垂直安放位置，默认为全图顶端，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）  
				                y: 'top'  
				            },  
				            //提示框，鼠标悬浮交互时的信息提示  
				            tooltip: {  
				                //触发类型，默认（'item'）数据触发，可选为：'item' | 'axis'  
				                trigger: 'axis'  
				            },  
				            //图例，每个图表最多仅有一个图例  
				            legend: {  
				                //显示策略，可选为：true（显示） | false（隐藏），默认值为true  
				                show: true,  
				                //水平安放位置，默认为全图居中，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）  
				                x: 'center',  
				                //垂直安放位置，默认为全图顶端，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）  
				                y: 'top',  
				                //legend的data: 用于设置图例，data内的字符串数组需要与sereis数组内每一个series的name值对应  
				                data: '交通设备设施维护数量' 
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
				                    //显示策略，可选为：true（显示） | false（隐藏），默认值为true  
				                    show: true,  
				                    //坐标轴类型，纵轴默认为数值型'value'  
				                    type: 'value',  
				                    //分隔区域，默认不显示  
				                    splitArea: {show: true}  
				                }  
				            ],  
				              
				            //sereis的数据: 用于设置图表数据之用。series是一个对象嵌套的结构；对象内包含对象  
				            series: [  
				                {  
				                    //系列名称，如果启用legend，该值将被legend.data索引相关  
				                    name: '交通设备设施维护数量',  
				                    //图表类型，必要参数！如为空或不支持类型，则该系列数据不被显示。  
				                    type: 'bar',  
				                    //系列中的数据内容数组，折线图以及柱状图时数组长度等于所使用类目轴文本标签数组axis.data的长度，并且他们间是一一对应的。数组项通常为数值  
				                    data: facilitiesStaApp.seriesData,  
				                    //系列中的数据标注内容  
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
    	
    	//$("#startDt").val(TUtils.formatDate(new Date())+" 00:00:00");
    	$("#endDt").val(TUtils.formatDate(new Date())+" 23:59:59");
    	$("#startDt").val(TUtils.formatDateTime000(TUtils.addDate(new Date(),-30)));
    	getUnitQ("");
    	loadGroups();
    	//加载数据
    	loadJqGrid();
    	
    	vueEureka.set("leftPanel", {
			vue: facilitiesStaApp,
			description: "facilitiesSta的vue实例"
		});
    	
    }
    
    var getUnitQ = function(fIds){
		$.get("./jtss/repairUnit/allData?type="+fIds, function(r){
	    	if(r.code == 200){
	    		facilitiesStaApp.unitNamesQ = r.repairUnitList;
	    	}else{
	    		alert(r.msg);
	    	}
	    });
	}
    
    var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				facilitiesStaApp.groupList =r.groupList;
			}else{
				alert(r.msg);
			}
		});
	};
    
    var loadJqGrid = function() {
    	var startDt = $("#startDt").val();
    	var endDt = $("#endDt").val();
    	$.ajax({
		    url: "./jtss/facilitiesRepair/repairList",
	        data: {"startDt" : startDt,
	        		"endDt" : endDt,
	        		"repairUnitId" : facilitiesStaApp.facilitiesRepairQ.repairUnitId,
	        		"createBy":facilitiesStaApp.facilitiesRepairQ.createBy},
		    success: function(rslt){
				if(rslt.code == 200){/*
					facilitiesStaApp.xdata = [];
					facilitiesStaApp.seriesData=[];
					var RepairCountList = rslt.RepairCountList;
					for(var i =0;i<RepairCountList.length;i++){ 
						
						var startTime = RepairCountList[i].title;
						
						if(facilitiesStaApp.facilitiesRepairQ.timeUnit == 'DAY'){
							startTime = startTime.replace(startDt,'') + "时";
						}
						facilitiesStaApp.xdata.push(startTime);
						facilitiesStaApp.seriesData.push(RepairCountList[i].repairName);
					}
					if(RepairCountList.length == 0){
						var testdiv = document.getElementById("main");
						testdiv.innerHTML="暂无数据";
						testdiv.style.cssText += 'text-align:center';
					}else{
						facilitiesStaApp.addEcharts();
					}*/
					facilitiesStaApp.facilitiesList = rslt.RepairCountList;
					facilitiesStaApp.facilitiesCount=0;
					for(var i = 0;i<rslt.RepairCountList.length;i++){
						facilitiesStaApp.facilitiesCount =Number(facilitiesStaApp.facilitiesCount)+Number(rslt.RepairCountList[i].content);
					}
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