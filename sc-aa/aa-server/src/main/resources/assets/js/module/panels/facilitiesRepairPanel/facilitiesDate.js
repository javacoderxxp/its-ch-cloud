/**
 * 设备设施维修统计时效
 */
define(function(require) {
	var htmlStr = require('text!./facilitiesDate.html');

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
					createBy: (currentUser.jjzdUser? currentUser.group.groupId :'')}, //查询参数
				facilitiesDates: {},
				unitNames:{},
				xdata: [],
				groupList:[],
				seriesData: {},
				isShows:false
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
    	//$("#startDt").val(TUtils.formatDate(new Date())+" 00:00:00");
    	$("#startDt").val(TUtils.formatDateTime000(TUtils.addDate(new Date(),-30)));
		$("#endDt").val(TUtils.formatDate(new Date())+" 23:59:59");
    	loadGroups();
    	//加载数据
    	loadJqGrid();
    
    	vueEureka.set("leftPanel", {
			vue: facilitiesStaApp,
			description: "facilitiesSta的vue实例"
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
    	$.ajax({
		    url: "./jtss/facilitiesRepair/facilitiesDate",
	        data: {"repairUnitId" : $("#repairUnitId").val(), 
        			"startDt" : $("#startDt").val(),
        			"endDt" : $("#endDt").val(),
        			"createBy":facilitiesStaApp.facilitiesRepairQ.createBy},
		    success: function(rslt){
				if(rslt.code == 200){
					facilitiesStaApp.facilitiesDates = rslt.facilitiesDates;
					facilitiesStaApp.isShows=false;
					if(facilitiesStaApp.facilitiesDates.length == 0){
						facilitiesStaApp.isShows=true;
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