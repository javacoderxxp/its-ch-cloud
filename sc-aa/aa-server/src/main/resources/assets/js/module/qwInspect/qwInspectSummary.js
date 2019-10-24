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
			isShowDownload:false,
			missionList:[],
			missionUnsign:'',
			missionUnfinish:'',
			missionFinished:'',
			jszRankList:[],
			jszCf:'',
        	jszZk:'',
        	jszDx:'',
        	jszSd:'',
        	jszSdList:[],
        	wfzdList:[],
        	wfzdTotal:'',
        	wnjzdList:[],
        	wnjzdTotal:'',
        	cyzqwnjList:[],
        	cyzqwnjTotal:'',
        	zdqyCnt:'',
        	zdqyList:[],
        	ts:"",
        	aqxcTotal:'',
        	aqxcList:[]
		},
		methods: {
			init97DateStart: function(it){
				WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd'});
			},
			init: function () {
				var startDt = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()-7);
				startDt = formatDate(startDt);
				$("#startDt").val(startDt);
				var endDt = formatDate(new Date());
				$("#endDt").val(endDt);
				$('#collapseFive').collapse('show');
				$('#collapseSix').collapse('show');
				$('#collapseSeven').collapse('show');
				$('#collapseFour').collapse('show');
				$('#collapseThree').collapse('show');
				$('#collapseTwo').collapse('show');
				$('#collapseOne').collapse('show');
				$('#collapseAqxc').collapse('show');
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
				$('#collapseSevenLink').bind("click",function(){
					if($('#collapseSeven').hasClass("in")){
						$("#collapseSevenLabel").addClass("fa-caret-right");
						$("#collapseSevenLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseSevenLabel").removeClass("fa-caret-right");
						$("#collapseSevenLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseEightLink').bind("click",function(){
					if($('#collapseEight').hasClass("in")){
						$("#collapseEightLabel").addClass("fa-caret-right");
						$("#collapseEightLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseEightLabel").removeClass("fa-caret-right");
						$("#collapseEightLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseNineLink').bind("click",function(){
					if($('#collapseNine').hasClass("in")){
						$("#collapseNineLabel").addClass("fa-caret-right");
						$("#collapseNineLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseNineLabel").removeClass("fa-caret-right");
						$("#collapseNineLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseTenLink').bind("click",function(){
					if($('#collapseTen').hasClass("in")){
						$("#collapseTenLabel").addClass("fa-caret-right");
						$("#collapseTenLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseTenLabel").removeClass("fa-caret-right");
						$("#collapseTenLabel").addClass("fa-caret-down");
					}
				});
				$('#jszSdLink').bind("click",function(){
					if($('#jszSd').hasClass("in")){
						$("#jszSdLabel").addClass("fa-caret-right");
						$("#jszSdLabel").removeClass("fa-caret-down");
					}else{
						$("#jszSdLabel").removeClass("fa-caret-right");
						$("#jszSdLabel").addClass("fa-caret-down");
					}
				});
				$('#wfwclzdLink').bind("click",function(){
					if($('#wfwclzd').hasClass("in")){
						$("#wfwclzdLabel").addClass("fa-caret-right");
						$("#wfwclzdLabel").removeClass("fa-caret-down");
					}else{
						$("#wfwclzdLabel").removeClass("fa-caret-right");
						$("#wfwclzdLabel").addClass("fa-caret-down");
					}
				});
				$('#wnjzdLink').bind("click",function(){
					if($('#wnjzd').hasClass("in")){
						$("#wnjzdLabel").addClass("fa-caret-right");
						$("#wnjzdLabel").removeClass("fa-caret-down");
					}else{
						$("#wnjzdLabel").removeClass("fa-caret-right");
						$("#wnjzdLabel").addClass("fa-caret-down");
					}
				});
				$('#cyzqwnjLink').bind("click",function(){
					if($('#cyzqwnj').hasClass("in")){
						$("#cyzqwnjLabel").addClass("fa-caret-right");
						$("#cyzqwnjLabel").removeClass("fa-caret-down");
					}else{
						$("#cyzqwnjLabel").removeClass("fa-caret-right");
						$("#cyzqwnjLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseZdqyLink').bind("click",function(){
					if($('#collapseZdqy').hasClass("in")){
						$("#collapseZdqyLabel").addClass("fa-caret-right");
						$("#collapseZdqyLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseZdqyLabel").removeClass("fa-caret-right");
						$("#collapseZdqyLabel").addClass("fa-caret-down");
					}
				});
				$('#collapseAqxcLink').bind("click",function(){
					if($('#collapseAqxc').hasClass("in")){
						$("#collapseAqxcLabel").addClass("fa-caret-right");
						$("#collapseAqxcLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseAqxcLabel").removeClass("fa-caret-right");
						$("#collapseAqxcLabel").addClass("fa-caret-down");
					}
				});
				qwInspectApp.query('qwsqhz');
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
			djwfswList:function(gid,rid,gName,rName) {
				var tName = gName+'-'+rName;
				layer.open({
					type: 1,
					skin: 'layui-layer',
					title: [tName],
					area: ['485px', '425px'],
					shade: false,
					content: jQuery("#postAlarmTaskDiv"),
					btn: []
				});
				loadJqGrid(gid,rid);
				var url="../../../../qw/djwf/downPoiDjwf?groupId="+gid+'&bz='+rid+'&wflx=15GQ';
				document.getElementById("xzExecl").href=url;
				//document.getElementById("xzExecl").download=tName+formatDateTime(new Date())+'.xls';
			},
			query:function(types){
				qwInspectApp.ts=types;
				switch (types) {
	        	case 'qwsqhz':
		        	//网格责任区
	        		$("#queryDate").hide();
		        	break;
	        	case 'jtwfcf':
		        	//违法处罚
	        		$("#queryDate").show();
		        	break;
	        	case 'aqyhpc':
		        	//隐患排查
	        		$("#queryDate").show();
		        	break;
	        	case 'zwgfgw':
		        	//早晚高峰
	        		$("#queryDate").show();
		        	break;
	        	case 'wjpc':
		        	//15次未检排查
	        		$("#queryDate").hide();
		        	break;
	        	case 'ydzl':
		        	//拥堵治理
	        		$("#queryDate").hide();
		        	break;
	        	case 'ptrw':
		        	//平台任务
	        		$("#queryDate").show();
		        	break;
	        	case 'jsz':
		        	//驾驶证
	        		$("#queryDate").hide();
		        	break;
	        	case 'clgl':
		        	//车辆管理
	        		$("#queryDate").hide();
		        	break;
	        	case 'zdqy':
		        	//重点企业
	        		$("#queryDate").hide();
		        	break;
	        	case 'aqxc':
		        	//安全宣传
	        		$("#queryDate").show();
		        	break;
	        	default:
					break;
	        	}
				var startDt = $("#startDt").val();
				var endDt = $("#endDt").val();
				/*alert(startDt);
				alert(endDt);*/
				$.ajax({
					type: "GET",
				    url:'../../../../qw/main/loadAllQwSummary?startDt='+startDt+'&endDt='+endDt+'&type='+types,
				    dataType: "json",
				    success:function(rslt){
				        if(rslt.code == 200){
				        	var qwInspectMap = rslt.qwInspectMap;
				        	switch (types) {
				        	case 'qwsqhz':
					        	//网格责任区
					        	qwInspectApp.dutyGridList = qwInspectMap["dutyGridList"];
					        	qwInspectApp.dutyGridTotal = qwInspectMap["dutyGridTotal"];
					        	qwInspectApp.policeTotal = qwInspectMap["policeTotal"];
					        	qwInspectApp.assistantPoliceTotal = qwInspectMap["assistantPoliceTotal"];
					        	break;
				        	case 'jtwfcf':
					        	//违法处罚
					        	qwInspectApp.violateList = qwInspectMap["violateList"];
					        	qwInspectApp.violatedTotal = qwInspectMap["violatedTotal"];
					        	break;
				        	case 'aqyhpc':
					        	//隐患排查
					        	qwInspectApp.hiddenDangerList = qwInspectMap["hiddenDangerList"];
					        	qwInspectApp.hiddenTotal = qwInspectMap["hiddenTotal"];
					        	break;
				        	case 'zwgfgw':
					        	//早晚高峰
					        	qwInspectApp.rhPostList = qwInspectMap["rhPostList"];
					        	qwInspectApp.rhPointTotal = qwInspectMap["rhPointTotal"];
					        	qwInspectApp.rhPoliceTotal = qwInspectMap["rhPoliceTotal"];
					        	break;
				        	case 'wjpc':
					        	//15次未检排查
					        	qwInspectApp.qwList_djwf = qwInspectMap["qwList_djwf"];
					        	qwInspectApp.djwfTotalCnt = qwInspectMap["djwfTotalCnt"];
					        	break;
				        	case 'ydzl':
					        	//拥堵治理
					        	qwInspectApp.qwList_jam = qwInspectMap["qwList_jam"];
					        	qwInspectApp.oftenJamTotalCnt = qwInspectMap["oftenJamTotalCnt"];
					        	break;
				        	case 'ptrw':
					        	//平台任务
					        	qwInspectApp.missionList = qwInspectMap["missionList"];
					        	qwInspectApp.missionUnsign = qwInspectMap["missionUnsign"];
					        	qwInspectApp.missionUnfinish = qwInspectMap["missionUnfinish"];
					        	qwInspectApp.missionFinished = qwInspectMap["missionFinished"];
					        	break;
				        	case 'jsz':
					        	//驾驶证
					        	qwInspectApp.jszRankList = qwInspectMap["jszRankList"];
					        	qwInspectApp.jszSdList = qwInspectMap["jszSdList"];
					        	qwInspectApp.jszSd = qwInspectMap["jszSd"];
					        	qwInspectApp.jszCf = qwInspectMap["jszCf"];
					        	qwInspectApp.jszZk = qwInspectMap["jszZk"];
					        	qwInspectApp.jszDx = qwInspectMap["jszDx"];
					        	break;
				        	case 'clgl':
					        	//车辆管理
					        	qwInspectApp.wfzdList=qwInspectMap["wfzdList"];
					        	qwInspectApp.wfzdTotal=qwInspectMap["wfzdTotal"];
					        	qwInspectApp.wnjzdList=qwInspectMap["wnjzdList"];
					        	qwInspectApp.wnjzdTotal=qwInspectMap["wnjzdTotal"];
					        	qwInspectApp.cyzqwnjList=qwInspectMap["cyzqwnjList"];
					        	qwInspectApp.cyzqwnjTotal=qwInspectMap["cyzqwnjTotal"];
					        	break;
				        	case 'zdqy':
					        	//重点企业
					        	qwInspectApp.zdqyCnt=qwInspectMap["zdqyCnt"];
					        	qwInspectApp.zdqyList=qwInspectMap["zdqyList"];
					        	break;
				        	case 'aqxc':
					        	//违法处罚
					        	qwInspectApp.aqxcList = qwInspectMap["aqxcList"];
					        	qwInspectApp.aqxcTotal = qwInspectMap["aqxcTotal"];
					        	break;
				        	default:
								break;
				        	}
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

var loadJqGrid = function(gid,rid) {
	$("#jqGrid").jqGrid('GridUnload');
	var postDataTmp = {groupId:gid,bz:rid,wflx:'15GQ'};
	$("#jqGrid").jqGrid({
		url: "../../../../qw/djwf/pageData",
		datatype: "json",
		postData: postDataTmp,
		colModel: [
			{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
			{ label: '车牌号', name: 'hphm', width: 80, sortable:true/*, formatter: function(value, options, row){return value;}*/},
			{ label: '有效期止', name: 'yxqz', width: 120, sortable:true/*, formatter: function(value, options, row){return value;}*/},
			{ label: '所有人', name: 'syr', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '次数', name: 'djcs', width: 30, sortable:true/*, formatter: function(value, options, row){return value;}*/},
			{ label: '责任单位', name: 'groupName', width: 70, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '责任区', name: 'gridName', width: 70, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '状态(字典)', name: 'status', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
			{ label: '状态', name: 'statusDesc', width: 80, sortable:true, hidden:true,formatter: function(value, options, row){
				var status = row.status;
				switch (status) {
				case "0":
					return '待指定中队';
					break;
				case "1":
					return '待指定责任区';
					break;
				/*case "2":
					return '待关联';*/
				case "3":
				default:
					return '已完成';
				}
				return value;
			}}
		],
		viewrecords: true,
		height: 260,
		rowNum: 10,
		rowList : [10,30,50],
		rownumbers: true, 
		rownumWidth: 25, 
		autowidth:false,
		multiselect: false,
		pager: "#jqGridPager",
		jsonReader : {
			root: "page.list",
			page: "page.pageNum",
			total: "page.pages",
			records: "page.total"
		},
		prmNames : {
			page:"page", 
			rows:"limit", 
			sort: "orderBy",
			order: "orderFlag"
		},
		loadComplete: function(data) {//数据查询完毕
			var queryList = data.page.list;
		},
        ondblClickRow: function(rowid, iRow, iCol, e){
        	vmDjwf.assignTo();
        },
		gridComplete:function(){
			//隐藏grid底部滚动条
			$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
		},
		onSelectRow: function(rowid){//选中某行
			var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
			vmDjwf.selectedRow = rowData;
		}
	});
};

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