var qwInspectApp = null;
$(function () {
	qwInspectApp = new Vue({
		el: '#vue-app',
		data: {
			dutyGridList:[],
			violateList:[],
			hiddenDangerList:[],
			dutyGridTotal:{},
			policeTotal:{},
			assistantPoliceTotal:{},
			violatedTotal:{},
			hiddenTotal:{},
			rhPostList:[],
			rhPointTotal:{},
			rhPoliceTotal:{},
			qwList_djwf:[],
			djwfTotalCnt:{},
			qwList_jam:[],
			oftenJamTotalCnt:{},
			outputFileName:{},
			isShowDownload:false
		},
		methods: {
			init97DateStart: function(it){
				WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd'});
			},
			init: function () {
				var startDt = new Date(new Date().getFullYear()-1,11,21);
				startDt = formatDate(startDt);
				$("#startDt").val(startDt);
				var endDt = formatDate(new Date());
				$("#endDt").val(endDt);
				$('#collapseFive').collapse('show');
				$('#collapseSix').collapse('show');
				$('#collapseFour').collapse('show');
				$('#collapseThree').collapse('show');
				$('#collapseTwo').collapse('show');
				$('#collapseOne').collapse('show');
				$('#collapseOneLink').bind("click",function(){
					if($('#collapseOne').hasClass("in")){
						$("#collapseOneLabel").addClass("fa-caret-right");
						$("#collapseOneLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseOneLabel").removeClass("fa-caret-right");
						$("#collapseOneLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseTwoLink').bind("click",function(){
					if($('#collapseTwo').hasClass("in")){
						$("#collapseTwoLabel").addClass("fa-caret-right");
						$("#collapseTwoLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseTwoLabel").removeClass("fa-caret-right");
						$("#collapseTwoLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseThreeLink').bind("click",function(){
					if($('#collapseThree').hasClass("in")){
						$("#collapseThreeLabel").addClass("fa-caret-right");
						$("#collapseThreeLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseThreeLabel").removeClass("fa-caret-right");
						$("#collapseThreeLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseFourLink').bind("click",function(){
					if($('#collapseFour').hasClass("in")){
						$("#collapseFourLabel").addClass("fa-caret-right");
						$("#collapseFourLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseFourLabel").removeClass("fa-caret-right");
						$("#collapseFourLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseFiveLink').bind("click",function(){
					if($('#collapseFive').hasClass("in")){
						$("#collapseFiveLabel").addClass("fa-caret-right");
						$("#collapseFiveLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseFiveLabel").removeClass("fa-caret-right");
						$("#collapseFiveLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseSixLink').bind("click",function(){
					if($('#collapseSix').hasClass("in")){
						$("#collapseSixLabel").addClass("fa-caret-right");
						$("#collapseSixLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseSixLabel").removeClass("fa-caret-right");
						$("#collapseSixLabel").addClass("fa-caret-down");
					}
				});
				qwInspectApp.query();
			},
			outputWord: function(){
				var startDt = $("#startDt").val();
				var endDt = $("#endDt").val();
				$.ajax({
					type: "Get",
				    url:'../../../../qw/main/outputWord?startDt='+startDt+'&endDt='+endDt,
				    dataType: "json",
				    success:function(rslt){
				        if(rslt.code == 200){
				        	qwInspectApp.outputFileName = rslt.fileName;
				        	/*var path = window.document.location.href;
				        	var pos=path.indexOf("assets");  
				        	var target = path.substring(0,pos+7)+"doc/"+fileName;
				        	qwInspectApp.wordUrl = target;*/
				        	//document.getElementById("test").onclick();
				        	//$("#test").onclick();
				        	//$("#test").trigger("click");
				        	qwInspectApp.isShowDownload = true;
				        	layer.msg("生成成功！");
				        }else{
					    	layer.msg("生成失败！");
				        }
				    },
				    error:function(xhr,textStatus){
				    	layer.msg(xhr);
				    }
				});
			},
			download: function() {
				var url = "../../../../qw/main/downloadWord?fileName="+encodeURI(encodeURI(qwInspectApp.outputFileName));
				window.open(url);
				//！！不能用ajax提交,否则无法下载
			    /*$.get(url, function(r){
					if(r.code == 200){
						alert("导出成功，文档位置  [D:/岗点排班模板.xlsx]");
					}else{
						alert(r.msg);
					}
				});*/
			},
			query:function(){
				var startDt = $("#startDt").val();
				var endDt = $("#endDt").val();
				/*alert(startDt);
				alert(endDt);*/
				$.ajax({
					type: "GET",
				    url:'../../../../qw/main/loadAllQwSummary?startDt='+startDt+'&endDt='+endDt,
				    dataType: "json",
				    success:function(rslt){
				        if(rslt.code == 200){
				        	var qwInspectMap = rslt.qwInspectMap;
				        	//网格责任区
				        	qwInspectApp.dutyGridList = qwInspectMap["dutyGridList"];
				        	qwInspectApp.dutyGridTotal = qwInspectMap["dutyGridTotal"];
				        	qwInspectApp.policeTotal = qwInspectMap["policeTotal"];
				        	qwInspectApp.assistantPoliceTotal = qwInspectMap["assistantPoliceTotal"];
				        	//违法处罚
				        	qwInspectApp.violateList = qwInspectMap["violateList"];
				        	qwInspectApp.violatedTotal = qwInspectMap["violatedTotal"];
				        	//隐患排查
				        	qwInspectApp.hiddenDangerList = qwInspectMap["hiddenDangerList"];
				        	qwInspectApp.hiddenTotal = qwInspectMap["hiddenTotal"];
				        	//早晚高峰
				        	qwInspectApp.rhPostList = qwInspectMap["rhPostList"];
				        	qwInspectApp.rhPointTotal = qwInspectMap["rhPointTotal"];
				        	qwInspectApp.rhPoliceTotal = qwInspectMap["rhPoliceTotal"];
				        	//15次未检排查
				        	qwInspectApp.qwList_djwf = qwInspectMap["qwList_djwf"];
				        	qwInspectApp.djwfTotalCnt = qwInspectMap["djwfTotalCnt"];
				        	//拥堵治理
				        	qwInspectApp.qwList_jam = qwInspectMap["qwList_jam"];
				        	qwInspectApp.oftenJamTotalCnt = qwInspectMap["oftenJamTotalCnt"];
				        }else{
					    	layer.msg("查询失败！");
				        }
				    },
				    error:function(xhr,textStatus){
				    	layer.msg("查询失败！");
				    }
				});
			}
		}
	});
	
	//初始化查询时间
	qwInspectApp.init();
	
	window.onbeforeunload = function(){  
		//vm.clearAllQwFromMainMap();
	}  
});

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

var formatDateTime = function(date) {
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }
	    
    var hours = date.getHours();
	var mins = date.getMinutes();
	var secs = date.getSeconds();
	var msecs = date.getMilliseconds();
	if (hours < 10){
		hours = "0" + hours;
	}
	if (mins < 10){
		mins = "0" + mins;
	}
	if (secs < 10){
		secs = "0" + secs;
	}
	if (msecs < 10){
		secs = "0" + msecs;  
	}
    
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + day
            + " " + hours + seperator2 + mins + seperator2 + secs;
    return currentdate;
}