var qwInspectApp = null;
$(function () {
	qwInspectApp = new Vue({
		el: '#vue-app',
		data: {
			dutyGridList:[],
			ts:'sgbb',
			cfd:[],
        	zkd:[],
        	dxd:[], 
        	sdd:[],
        	Yd:{},
        	Nd:{},
        	Sd:{},
        	Qd:{},
		  	Gd:{},
		    Cd:{},
		    NODd:{},
		    YesDd:{},
		    swGQd:{},
		    swGd:{},
		    jcjDd:{},
		    WfCfDd:{},
		    WfTypeDd:{},
		    YtGlDd:{},
		    Dt:'',
		    chartVOList:[]
		},
		methods: {
			init97DateStart: function(it){
				WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd'});
			},
			init97DateStartQ: function(it){
				WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false});
			},
			init97DateEndQ: function(it){
				WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false});
			},
			init: function () {
				var startDt = formatDate(new Date());
				//$("#startDt").val(startDt);
				$("#startDtQ").val(startDt + " 00:00:00");
				$("#endDtQ").val(startDt + " 23:59:59");
				$('#collapseOneLink').bind("click",function(){
					if($('#collapseOne').hasClass("in")){
						$("#collapseOneLabel").addClass("fa-caret-right");
						$("#collapseOneLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseOneLabel").removeClass("fa-caret-right");
						$("#collapseOneLabel").addClass("fa-caret-down");
					}
				});
				$('#wfcfjLink').bind("click",function(){
					if($('#wfcfjOne').hasClass("in")){
						$("#wfcfjLabel").addClass("fa-caret-right");
						$("#wfcfjLabel").removeClass("fa-caret-down");
					}else{
						$("#wfcfjLabel").removeClass("fa-caret-right");
						$("#wfcfjLabel").addClass("fa-caret-down");
					}
				});
				$('#ytglLink').bind("click",function(){
					if($('#ytglOne').hasClass("in")){
						$("#ytglLabel").addClass("fa-caret-right");
						$("#ytglLabel").removeClass("fa-caret-down");
					}else{
						$("#ytglLabel").removeClass("fa-caret-right");
						$("#ytglLabel").addClass("fa-caret-down");
					}
				});
				$('#WfTypeLink').bind("click",function(){
					if($('#WfTypeOne').hasClass("in")){
						$("#WfTypeLabel").addClass("fa-caret-right");
						$("#WfTypeLabel").removeClass("fa-caret-down");
					}else{
						$("#WfTypeLabel").removeClass("fa-caret-right");
						$("#WfTypeLabel").addClass("fa-caret-down");
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
				$('#collapseEightLink').bind("click",function(){
					if($('#collapseEight').hasClass("in")){
						$("#collapseEightLabel").addClass("fa-caret-right");
						$("#collapseEightLabel").removeClass("fa-caret-down");
					}else{
						$("#collapseEightLabel").removeClass("fa-caret-right");
						$("#collapseEightLabel").addClass("fa-caret-down");
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
				$('#wlzdLink').bind("click",function(){
					if($('#wlzd').hasClass("in")){
						$("#wlzdLabel").addClass("fa-caret-right");
						$("#wlzdLabel").removeClass("fa-caret-down");
					}else{
						$("#wlzdLabel").removeClass("fa-caret-right");
						$("#wlzdLabel").addClass("fa-caret-down");
					}
				});
				$('#15cwfLink').bind("click",function(){
					if($('#15cwf').hasClass("in")){
						$("#15cwfLabel").addClass("fa-caret-right");
						$("#15cwfLabel").removeClass("fa-caret-down");
					}else{
						$("#15cwfLabel").removeClass("fa-caret-right");
						$("#15cwfLabel").addClass("fa-caret-down");
					}
				});
				$('#wfwclLink').bind("click",function(){
					if($('#wfwcl').hasClass("in")){
						$("#wfwclLabel").addClass("fa-caret-right");
						$("#wfwclLabel").removeClass("fa-caret-down");
					}else{
						$("#wfwclLabel").removeClass("fa-caret-right");
						$("#wfwclLabel").addClass("fa-caret-down");
					}
				});
				$('#djLink').bind("click",function(){
					if($('#dj').hasClass("in")){
						$("#djLabel").addClass("fa-caret-right");
						$("#djLabel").removeClass("fa-caret-down");
					}else{
						$("#djLabel").removeClass("fa-caret-right");
						$("#djLabel").addClass("fa-caret-down");
					}
				});
				
				qwInspectApp.query('sgbb');
			},
			query:function(types){
				//alert(types);
				var url="../../../../qw/main/downDayData?startDtQ="+$("#startDtQ").val()+"&endDtQ="+$("#endDtQ").val();
				document.getElementById("xzExecl").href=url;
				qwInspectApp.ts=types;
				qwInspectApp.Dt = $("#startDtQ").val();
				switch (types) {
	        	case 'sgbb':
		        	//事故
	        		$("#queryDate").show();
	        		initDataGrid();
		        	break;
	        	case 'jam':
		        	//拥堵
	        		$("#queryDate").show();
	        		loadJqGridJam();
		        	break;
	        	case 'sgzd':
		        	//施工
	        		$("#queryDate").show();
	        		loadJqGridSgZd();
	        		break;
	        	case 'jsz':
		        	//驾驶证
	        		$("#queryDate").hide();
	        		loadJszGl();
		        	break;
	        	case 'clgl':
		        	//车辆管理
	        		$("#queryDate").hide();
	        		loadClgl();
		        	break;
	        	case 'jamPm':
		        	//拥堵排名
	        		$("#queryDate").show();
	        		jampaiming();
		        	break;
	        	case 'jcj':
		        	//接处警
	        		$("#queryDate").show();
	        		loadjcj();
		        	break;
	        	case 'ytgl':
		        	//源头管理
	        		$("#queryDate").hide();
	        		loadYtGl();
		        	break;
	        	case 'jfjd':
		        	//执法监督
	        		$("#queryDate").show();
	        		loadWfcf();
	        		loadWfType();
		        	break;
	        	default:
					break;
	        	}
				
			}
		}
	});
	
	//初始化查询时间
	qwInspectApp.init();
	window.onbeforeunload = function(){  
		//vm.clearAllQwFromMainMap();
	}  
});

var jampaiming = function(){
	layer.load();
	$.ajax({
		url:  "../../../../jtzx/linkJam/getLatest7DayJam?startDt="+$("#startDtQ").val()+"&endDt="+$("#endDtQ").val(),
		type: 'GET',
		success: function(rslt){
			layer.closeAll('loading');
			if(rslt.code == 200){
				qwInspectApp.chartVOList = rslt.chartVOList;
			}else{
				alert(rslt.msg);
			}
		},
		error: function(){
			layer.closeAll('loading');
			alert('查询出错！');
		}
	});
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

var loadjcj = function() {
	$.ajax({
		type: "GET",
	    url:'../../../../qw/main/findJcjDd?startDtQ='+$("#startDtQ").val()+'&endDtQ='+$("#endDtQ").val(),
	    dataType: "json",
	    success:function(rslt){
	        if(rslt.code == 200){
	        	qwInspectApp.jcjDd = rslt.jcjDd;
	        }	
	    }
	})
}

var loadWfcf = function() {
	$.ajax({
		type: "GET",
	    url:'../../../../qw/main/findWfCfDd?startDtQ='+$("#startDtQ").val()+'&endDtQ='+$("#endDtQ").val(),
	    dataType: "json",
	    success:function(rslt){
	        if(rslt.code == 200){
	        	qwInspectApp.WfCfDd = rslt.WfCfDd;
	        }	
	    }
	})
}

var loadWfType = function() {
	$.ajax({
		type: "GET",
	    url:'../../../../qw/main/findWfTypeDd?startDtQ='+$("#startDtQ").val()+'&endDtQ='+$("#endDtQ").val(),
	    dataType: "json",
	    success:function(rslt){
	        if(rslt.code == 200){
	        	qwInspectApp.WfTypeDd = rslt.WfTypeDd;
	        }	
	    }
	})
}

var loadYtGl = function() {
	$.ajax({
		type: "GET",
	    url:'../../../../qw/main/findYtGlDd?startDtQ='+$("#startDtQ").val()+'&endDtQ='+$("#endDtQ").val(),
	    dataType: "json",
	    success:function(rslt){
	        if(rslt.code == 200){
	        	qwInspectApp.YtGlDd = rslt.YtGlDd;
	        }	
	    }
	})
}

var loadJszGl = function() {
	$.ajax({
		type: "GET",
	    url:'../../../../qw/main/findDriverCardDd',
	    dataType: "json",
	    success:function(rslt){
	        if(rslt.code == 200){
	        	var jszMap = rslt.jszMap;
	        	qwInspectApp.cfd =jszMap.cfd;
	        	qwInspectApp.zkd =jszMap.zkd;
	        	qwInspectApp.dxd =jszMap.dxd;
	        	qwInspectApp.sdd =jszMap.sdd;
	        	qwInspectApp.Yd = jszMap.Yd;
	        	qwInspectApp.Nd =jszMap.Nd;
	        	qwInspectApp.Sd =jszMap.Sd;
	        }	
	    }
	})
}

var loadClgl = function() {
	$.ajax({
		type: "GET",
	    url:'../../../../qw/main/clglDayData',
	    dataType: "json",
	    success:function(rslt){
	        if(rslt.code == 200){
	        	var qwInspectMap = rslt.resultmap;
	        	qwInspectApp.Qd =qwInspectMap.Qd;
	        	qwInspectApp.Gd =qwInspectMap.Gd;
	        	qwInspectApp.Cd =qwInspectMap.Cd;
	        	qwInspectApp.NODd =qwInspectMap.NODd;
	        	qwInspectApp.YesDd = qwInspectMap.YesDd;
	        	qwInspectApp.swGQd =qwInspectMap.swGQd;
	        	qwInspectApp.swGd =qwInspectMap.swGd;
	        }	
	    }
	})
}

var loadJqGridSgZd = function() {
	var postDataTmp = {'startTime': $("#startDtQ").val(),'endTime': $("#endDtQ").val()};
	$('#jqGrid').jqGrid('GridUnload');
	$("#jqGrid").jqGrid({
			url: "../../../../qw/main/sgPageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
			           { label: 'id', name: 'id', key: true, hidden:true },
			           { label: 'region', name: 'region', hidden:true },
			           {label: '所属中队',name: 'teamDesc',sortable : false, formatter: function(value, options, row){
			        	   return value ? value: '-';
			           }}, 
			           { label: '类型', name: 'typeDesc', sortable:false , formatter: function(value, options, row){
			        	   return value ? value: '-';
			           }},
			           { label: '内容', name: 'content'},
			           { label: '开始时间', name: 'startDt', sortable:false, formatter: function(value, options, row){
			        	   return value ? value: '-';
			           }},
			           { label: '结束时间', name: 'endDt', sortable:false, formatter: function(value, options, row){
			        	   return value ? value: '-';
			           }},
			           { label: '状态', name: 'statusDesc', sortable:false, formatter: function(value, options, row){
			        	   return value ? value: '-';
			           }}
			           ],
			           viewrecords: true,
			           height: 520,
			           rowNum: 30,
			           rowList : [20,30,50],
			           rownumbers: true, 
			           rownumWidth: 25, 
			           sortname:'START_DT',
			           sortorder:'desc',
			           autowidth:true,
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
			        	   //layer.msg("加载完毕");
			           },
			           gridComplete:function(){
			        	   //隐藏grid底部滚动条
			        	   $("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			           }
		});
    //表格左下角导航页
    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
    $("#jqGrid").setGridWidth($(window).width());
};

var initDataGrid = function(){
	$('#jqGrid').jqGrid('GridUnload');    // 每次查询前用来刷新table
	// dataGrid初始化
	var postDataTmp = {startDt: $("#startDtQ").val(), endDt:$("#endDtQ").val()};
	$("#jqGrid").jqGrid({
		url:"../../../../qw/main/searchTaskByConditionPage",
		datatype:"json",
		postData: postDataTmp,
		colModel:[
			{ label: '事故时间', name:'eventDtStr', sortable:false},
			{ label: '事故地点', name:'eventAddr', sortable:false},
			{ label: '事故内容', name:'eventContent', sortable:false},
			{ label: '修正状态', name:'manualFlag', sortable:false, formatter: function(value, options, row){
				var lx = '未修正';
				switch (value) {
				case '0':
					lx = '未修正';
					break;
				case '1':
					lx = '已修正';
					break;
				default:
				}
				return lx;
			}},
			{ label: '处警结果', name:'eventRst', sortable:false},
			{ label: 'longitude', name: 'longitude', hidden:true },
			{ label: 'latitude', name: 'latitude' , hidden:true },
			{ label: 'status', name: 'eventRstCode', hidden:true },
			{ label: 'eventId', name: 'eventId', key:true, hidden:true },
			],
		height:520,
		multiselect:false,
		rowNum:30,
		rowList:[20,30,50],
		pager:'#jqGridPager',
		sortname:'EVENT_DT',
		viewrecords:true,
		sortorder:'desc',
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth:true,
        //width:580,
        //用于设置如何解析从Server端发回来的json数据
        jsonReader : {
            root: "page.list",
            page: "page.pageNum",
            total: "page.pages",
            records: "page.total"
        },
        //用于设置jqGrid将要向Server传递的参数名称
        prmNames : {
            page:"page", 
            rows:"limit", 
            sort: "orderBy",
            order: "orderFlag"
        },
        gridComplete:function(){
        	
        	//隐藏grid底部滚动条
        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
        },
        loadComplete:function(data){
        	 var queryList = data.page.list;
        }
	});
	//表格左下角导航页
    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	//return false;
    $("#jqGrid").setGridWidth($(window).width());
};

var loadJqGridJam = function() {
	$('#jqGrid').jqGrid('GridUnload');
	var postDataTmp = {'startTime': $("#startDtQ").val(),endTime:$("#endDtQ").val()};
	
    $("#jqGrid").jqGrid({
        url: "../../../../qw/main/jamPageData",
        datatype: "json",
        postData: postDataTmp,
        colModel: [
            { label: '路名', name: 'roadName',sortable:false},
			{ label: '拥堵距离', name: 'jamDist', sortable:false,formatter: function(value, options, row){
				return value +' m';
			}},
			{ label: '时速', name: 'jamSpeed',  sortable:false,formatter: function(value, options, row){
				return value +' km/h';
			}},
			{ label: '持续时间', name: 'longTime', sortable:false,formatter: function(value, options, row){
				return value + ' 分';
			}},
			{ label: '发生时间', name: 'pubTime',  sortable:false},
			{ label: '拥堵原因', name: 'reasonId', sortable:false,formatter: function(value, options, row){
				return type2word(value);
			}},
			{ label: '拥堵起点', name: 'startAddr',  hidden:true},
			{ label: '拥堵终点', name: 'endAddr', hidden:true},
			{ label: '拥堵点坐标', name: 'xy',  hidden:true},
			{ label: '拥堵范围坐标', name: 'xys', hidden:true}
		 ],
		viewrecords: true,
        height: 520,
        rowNum: 30,
		rowList : [20,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth:true,
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
            //layer.msg("加载完毕");
        },
        gridComplete:function(){
        	//隐藏grid底部滚动条
        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
        }
    });
    //表格左下角导航页
    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
    $("#jqGrid").setGridWidth($(window).width());
};

var type2word = function(type){
	var word = "其他";
	switch (type) {
		case 0:
			word = "不详";
			break;
		case 1:
			word = "施工";
			break;
		case 2:
			word = "事故";
			break;
		case 3:
			word = "违停";
			break;
		case 4:
			word = "交通管制";
			break;
		case 5:
			word = "坏车";
			break;
		case 6:
			word = "车流量大";
			break;
		case 7:
			word = "信号灯";
			break;
		case 8:
			word = "道路积水";
			break;
		case 9:
			word = "突发事件";
			break;
		case 10:
			word = "其它";
			break;
		case 11:
			word = "道路封闭";
			break;
		case 12:
			word = "路况不符";
			break;
		default:
			break;
	}
	return word;
}
