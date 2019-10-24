var vm = null;
$(function () {
	vm = new Vue({
		el: '#vue-app',
		data: {
			zxjgTaskQ:{startDt: formatDate(addDate(new Date(), -90)), gridId:'',completeStatus:'',
				endDt: formatDate(new Date()), plateNo:'',groupId:''},
			zxjgTaskSummaryList:[],
			zxjgTaskList:[],
			groupList:[],
			dutyGridList:[],
			chartVOList:[]
		},
		methods: {
			init97DateStart: function(it){
				WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', isShowClear: false, onpicked:function(){vm.zxjgTaskQ.startDt = $("#startDtQ").val()}});
			},
			init97DateEnd: function(it){
				WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', isShowClear: false, onpicked:function(){vm.zxjgTaskQ.endDt = $("#endDtQ").val()}});
			},
			init: function () {
			    var startDt=new Date();
			    startDt.setMonth(5);
			    startDt.setDate(1);
				$("#startDt").val(formatDate(startDt));
				var endDt = formatDate(new Date());
				$("#endDt").val(endDt);
			},
			query:function(){
				layer.load();
				var url='/sc-itsweb/qw/zxjgTask/analyzeZxjgYtglTaskCount?plateNo='+
				vm.zxjgTaskQ.plateNo +"&startDt=" +vm.zxjgTaskQ.startDt+
				" 00:00:00"+"&endDt="+ vm.zxjgTaskQ.endDt+" 23:59:59"+
				"&groupId="+vm.zxjgTaskQ.groupId+ "&gridId="+
				vm.zxjgTaskQ.gridId+"&completeStatus="+vm.zxjgTaskQ.completeStatus;
				$.ajax({
					url: url,
					type: 'GET',
					success: function(rs) {
						layer.closeAll('loading');
						vm.zxjgTaskSummaryList = rs.zxjgTaskList;
						vm.zxjgTaskList =[];
					},
					error: function(xhr, textStatus) {
						layer.closeAll('loading');
						layer.msg("获取数据失败！");
					}
				});
				vm.statistic();
			},
			queryDetail:function(plateNo){
				layer.load();
				plateNo = encodeURIComponent(plateNo);
				var url='/sc-itsweb/qw/zxjgTask/zxjgYtglTaskListData?plateNo='+
				plateNo +"&startDt=" +vm.zxjgTaskQ.startDt+" 00:00:00"+
				"&endDt="+ vm.zxjgTaskQ.endDt+" 23:59:59"+"&groupId="+vm.zxjgTaskQ.groupId+
				"&gridId=" + vm.zxjgTaskQ.gridId+"&completeStatus="+vm.zxjgTaskQ.completeStatus;
				$.ajax({
					url: url,
					type: 'GET',
					success: function(rs) {
						layer.closeAll('loading');
						vm.zxjgTaskList = rs.zxjgTaskList;
					},
					error: function(xhr, textStatus) {
						layer.closeAll('loading');
						layer.msg("获取数据失败！");
					}
				});
			},
			gotoCheckPic:function(taskid,sourceid){
				//var taskid = $(this).data("taskid");
				if(!taskid || ""==taskid){
					return;
				}
				//var sourceid = $(this).data("sourceid");
				var urls="/sc-itsweb/ytgl/task/getPicByTaskId/"+taskid+"/99?rdm="+new Date().getTime();
				if (sourceid=="ytgl"){
					//alert(sourceid);
					urls="/sc-itsweb/ytgl/task/getPicByTaskId/"+taskid+"/1?rdm="+new Date().getTime();
				}
				$.ajax({
					url: urls,
					success: function(rslt){
						if(rslt.code == 200){
							var tab = [];
							if(rslt.pic && rslt.pic.length>0){
								for (var i = 0; i < rslt.pic.length; i++) {
									var p = rslt.pic[i];
									var tabCont = {};
									tabCont.title = " "+(i+1)+" ";
									tabCont.content = "<img src='/sc-itsweb/ytgl/task/getPicByTaskPicId/"+p.id+"'>";
									tab.push(tabCont);
								}
							}
							layer.tab({
							  area: ['800px', '500px'],
							  tab: tab
							});
						}else{
							alert(rslt.msg);
						}
					}
				});
			},
			loadGridsByChangeGroup : function() {
				vm.dutyGridList = [];
				vm.zxjgTaskQ.gridId = '';
				if(vm.zxjgTaskQ.groupId){
					$.get("/sc-itsweb/qw/dutyGrid/allData?groupId="+vm.zxjgTaskQ.groupId, function(r){
						if(r.code == 200){
							vm.dutyGridList = r.dutyGridList;
							//vm.dutyGridList.unshift({gridId:'', gridName:'所有'});
							vm.zxjgTaskQ.gridId ='';
						}else{
							alert(r.msg);
						}
					});
				}
			},
			statistic: function () {
				var echartUrl = "/sc-itsweb/qw/zxjgTask/findStat?startDt="+vm.zxjgTaskQ.startDt+"&endDt="+vm.zxjgTaskQ.endDt+"&taskType=";
				$.ajax({
					url: echartUrl,
					success: function(rslt){
						if(rslt.code == 200){
							var chartVOList = rslt.chartVOList;
							var chartTmpCX = echarts.init(document.getElementById('cxzdEchartDiv'), 'walden');
							var chartTmpGQ = echarts.init(document.getElementById('gqzdEchartDiv'), 'walden');
							var chartTmpHJ = echarts.init(document.getElementById('hjzdEchartDiv'), 'walden');
							var chartTmpKFQ = echarts.init(document.getElementById('kfqzdEchartDiv'), 'walden');
							var chartTmpLH = echarts.init(document.getElementById('lhzdEchartDiv'), 'walden');
							var chartTmpNJ = echarts.init(document.getElementById('njzdEchartDiv'), 'walden');
							var chartTmpSX = echarts.init(document.getElementById('sxzdEchartDiv'), 'walden');
							var chartTmpSF = echarts.init(document.getElementById('sfzdEchartDiv'), 'walden');
							chartTmpCX.clear();
							chartTmpGQ.clear();
							chartTmpHJ.clear();
							chartTmpKFQ.clear();
							chartTmpLH.clear();
							chartTmpNJ.clear();
							chartTmpSX.clear();
							chartTmpSF.clear();
							if(chartVOList && chartVOList.length>0) {
							    for(x in chartVOList){
							    	switch (chartVOList[x].name) {
									case "城厢中队":
										chartTmpCX.setOption(getPieOptCX(chartVOList[x].name, chartVOList[x].value,chartVOList[x].value1));
										break;
									case "港区交警中队":
										chartTmpGQ.setOption(getPieOptCX(chartVOList[x].name, chartVOList[x].value,chartVOList[x].value1));
										break;
									case "璜泾中队":
								    	chartTmpHJ.setOption(getPieOptCX(chartVOList[x].name, chartVOList[x].value,chartVOList[x].value1));
										break;
									case "经济开发区中队":
								    	chartTmpKFQ.setOption(getPieOptCX(chartVOList[x].name, chartVOList[x].value,chartVOList[x].value1));
										break;
									case "浏河中队":
								    	chartTmpLH.setOption(getPieOptCX(chartVOList[x].name, chartVOList[x].value,chartVOList[x].value1));
										break;
									case "南郊中队":
								    	chartTmpNJ.setOption(getPieOptCX(chartVOList[x].name, chartVOList[x].value,chartVOList[x].value1));
										break;
									case "沙溪中队":
								    	chartTmpSX.setOption(getPieOptCX(chartVOList[x].name, chartVOList[x].value,chartVOList[x].value1));
										break;
									case "双凤中队":
								    	chartTmpSF.setOption(getPieOptCX(chartVOList[x].name, chartVOList[x].value,chartVOList[x].value1));
										break;
									default:
										break;
									}
							    }
							}else{
								layer.msg("无数据,请修改查询条件");
							}
						}else{
							layer.msg(rslt.msg);
						}
					}
				});
			},
		}
	});
	loadGroups();
	//初始化查询时间
	vm.init();
	vm.statistic();
});

var getPieOptCX = function(titile, value0, value1) {
	var chartOpt = {
		title : {
	        x: 'center',
        	text: titile+"("+value1+"/"+value0+")"
	    },
	    tooltip: {
	        trigger: 'item',
	        formatter: "{b}: {c} ({d}%)"
	    },
	    series: [
	        {
	            type:'pie',
	            radius: ['50%', '70%'],
	            label: {
	                normal: {
	                    show: false,
	                    position: 'center'
	                }
	            },
	            labelLine: {
	                normal: {
	                    show: false
	                }
	            },
	            data:[
	                {value: value1, name:'已完成'},
	                {value: (value0 - value1), name:'未完成'},
	            ]
	        }
	    ]
	};
	return chartOpt;
}
var loadGroups = function() {
    $.get("/sc-itsweb/aa/group/allData?zdFlag="+1, function(r){
		if(r.code == 200){
			vm.teamList =r.groupList;
			vm.groupList = JSON.parse(JSON.stringify(r.groupList));
			//vm.groupList.unshift({groupName:'所有',groupId:''});
		}else{
			alert(r.msg);
		}
	});
}

var addDate = function(date, n) {
	date.setDate(date.getDate() + n);
	return date;
}

var formatDate = function(DateIn) {
	var Year = 0;
	var Month = 0;
	var Day = 0;

	var CurrentDate = "";
	// 初始化时间
	Year = DateIn.getFullYear();
	Month = DateIn.getMonth() + 1;
	Day = DateIn.getDate();

	CurrentDate = Year + "-";
	if (Month >= 10) {
		CurrentDate = CurrentDate + Month + "-";
	} else {
		CurrentDate = CurrentDate + "0" + Month + "-";
	}
	if (Day >= 10) {
		CurrentDate = CurrentDate + Day;
	} else {
		CurrentDate = CurrentDate + "0" + Day;
	}
	return CurrentDate;
}


