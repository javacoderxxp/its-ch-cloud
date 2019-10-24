/**
 * 设备设施维修统计饼状图
 */
define(function(require) {
	var htmlStr = require('text!./facilitiesCount.html');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');
	require('my97Datepicker');
	//require('echarts');
	var Vue = require('vue');
	var facilitiesStaApp = null;
    
    var show = function(sType) {
    	itsGlobal.showLeftPanel(htmlStr);
    	
    	facilitiesStaApp = new Vue({
			el: '#facilitiesCount-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			data: {
				facilitiesRepairQ: {repairUnitId:'',createBy: (currentUser.jjzdUser? currentUser.group.groupId :'')},
				xdata: {},
				seriesData: {},
				unitNamesQ:[],
				groupList:[]
			},
			methods: {
				loadMultiselect:function(cur,old){
					/*require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#results').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});*/
				},
					close: function() {
						itsGlobal.hideLeftPanel();
					},
					query: function(){
						var startDt = $("#startDt").val();
						var endDt = $("#endDt").val();
						var pStartDt = new Date(startDt.replace(/-/g,"/"));
						var pEndDt = new Date(endDt.replace(/-/g,"/"));
			        	if(pStartDt>pEndDt){
							layer.msg("结束时间必须在开始时间之后");
							return;
						}
						loadJqGrid();
					},
					addEcharts: function() {
						// 基于准备好的dom，初始化echarts实例
				        var myChart = echarts.init(document.getElementById('main'), 'walden');
				        //--- 折柱 ---  
				        //定义图表option  
				        var option = {
				        		 title : {
				        		        text: '交通设备设施维护比例统计',
				        		        subtext: '',
				        		        x:'center'
				        		    },
				        		    tooltip : {
				        		        trigger: 'item',
				        		        formatter: "{a} <br/>{b} : {c} ({d}%)"
				        		    },
				        		    legend: {
				        		        orient: 'vertical',
				        		        left: 'left',
				        		        data: facilitiesStaApp.xdata
				        		    },
				        		    series : [
				        		        {
				        		            name: '交通设备设施维护比例统计',
				        		            type: 'pie',
				        		            radius : '55%',
				        		            center: ['50%', '60%'],
				        		            data:facilitiesStaApp.seriesData,
				        		            itemStyle: {
				        		                emphasis: {
				        		                    shadowBlur: 10,
				        		                    shadowOffsetX: 0,
				        		                    shadowColor: 'rgba(0, 0, 0, 0.5)'
				        		                }
				        		            }
				        		        }
				        		    ]
				        };
				    
				    	
				    	// 使用刚指定的配置项和数据显示图表。
				    	myChart.setOption(option);
					}
				}
				
    	});
    	$("#startDt").val(TUtils.formatDateTime000(TUtils.addDate(new Date(),-30)));
    	$("#endDt").val(TUtils.formatDate(new Date())+" 23:59:59");
    	loadGroups();
		getUnitQ("");
    	//加载数据
    	loadJqGrid();
    	
    	/*$("#startDt").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true
			}).on('changeDate', function(ev){
				var startDt= $("#startDt").val();
				$('#endDt').datetimepicker('setStartDate', startDt);
			});
		
		$("#endDt").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true
			}).on('changeDate', function(ev){
				var endDt= $("#endDt").val();
				$('#startDt').datetimepicker('setEndDate', endDt);
			});*/
    	
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
		    url: "./jtss/facilitiesRepair/facilitiesCount",
		    data: {"results" : $("#results").val(),
        		"startDt" : startDt, 
        		"endDt" : endDt,
        		"createBy":facilitiesStaApp.facilitiesRepairQ.createBy,
        		"repairUnitId":facilitiesStaApp.facilitiesRepairQ.repairUnitId},
		    success: function(rslt){
				if(rslt.code == 200){
					
					facilitiesStaApp.xdata = new Array();
					facilitiesStaApp.seriesData = new Array();
					var RepairCountList = rslt.RepairCountList;
					for(var i =0;i<RepairCountList.length;i++){ 
						var counts = RepairCountList[i].repairName;
						var type = type2word(RepairCountList[i].type);
						var map = {};
						map["value"] = counts; 
						map["name"] = type;
						facilitiesStaApp.xdata.push(type);
						facilitiesStaApp.seriesData.push(map);
					}
						facilitiesStaApp.addEcharts();
				}else{
					alert(rslt.msg);
				}
			}
		});
    }
    
    var type2word = function(type){
		var word = "其他";
		switch (type) {
			case 1:
				word = "信号机";
				break;
			case 2:
				word = "监控设备";
				break;
			case 3:
				word = "诱导屏";
				break;
			case 4:
				word = "交通标志";
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