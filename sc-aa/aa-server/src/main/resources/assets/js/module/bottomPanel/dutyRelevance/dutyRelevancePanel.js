define(function(require) {
	var htmlStr = require('text!./dutyRelevancePanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var marker;
	
	var show = function(parmData) {
		applyDataToUI();
		loadData(parmData);
	}
	
	var loadData = function(parmData) {
		//constId = parmData.id;
		$('#dutyReleGrid').jqGrid('GridUnload');    // 每次查询前用来刷新table
		// dataGrid初始化
		$("#dutyReleGrid").jqGrid({
			url:"qw/dutyRelevance/pageData?qwType="+parmData.qwType+"&team="+parmData.team+"&aor="+parmData.aor+"&qwDt="+parmData.startDt+"&opt="+parmData.status,
			datatype:"json",
			colModel:[
				{ label: '执勤时间', name:'qwRecordDt', width:80, sortable:false},
				/*{ label: '执勤地点', name:'qwAddr',width:70, sortable:false},*/
				{ label: '勤务类型', name:'qwTypeDesc',width:50, sortable:false},
				{ label: '执勤人员', name:'policeName',width: 60, sortable:false},
				{ label: 'longitude', name: 'longitude', width: 60 , hidden:true },
				{ label: 'latitude', name: 'latitude', width: 60 , hidden:true },
				{ label: 'qwId', name: 'qwId', width: 60 , key:true, hidden:true },
				{ label: 'picCnt', name: 'picCnt', width: 60 , hidden:true },
				{ label: '操作', name:'act', width: 40 , sortable:false},
				],
			height:140,
			multiselect:false,
			rowNum:10,
			rowList:[10,20,30],
			pager:'#dutyReleGridPager',
			sortname:'QW_RECORD_DT',
			viewrecords:true,
			sortorder:'desc',
	        rownumbers: true, 
	        rownumWidth: 25, 
	        autowidth:true,
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
	        onSelectRow: function(rowid){
	        	// 生成图片预览
	        	$("#photoDisplayDiv").empty();
	        	var rowData = $("#dutyReleGrid").jqGrid('getRowData', rowid);
	        	var innerHtm = '';
	        	var carouselIndex = '<ol class="carousel-indicators">';  //轮播（Carousel）指标
	        	var carouselPrj = '<div class="carousel-inner" style="height:200px;">';   //轮播（Carousel）项目
	        	var carouselNavi = '<a class="carousel-control left" href="#photoDisplayDiv" data-slide="prev">&lsaquo;</a><a class="carousel-control right" href="#photoDisplayDiv" data-slide="next">&rsaquo;</a>';   //轮播（Carousel）导航
	        	var slideCnt;
	        	var itemCnt = 4;
	        	if(null != rowData.picCnt){
	        		itemCnt = rowData.picCnt < itemCnt?rowData.picCnt:itemCnt;
	        		slideCnt = rowData.picCnt%itemCnt==0?rowData.picCnt/itemCnt:(Number(rowData.picCnt)+Number(itemCnt)-rowData.picCnt%itemCnt)/itemCnt;
	        	}
	        	for(var i = 0; i<slideCnt;i++){
	        		carouselIndex += '<li data-target="#photoDisplayDiv" data-slide-to="'+i+'" '+(i==0?'class="active"':'')+'></li>';
	        		if(i == 0){
	        			carouselPrj += '<div class="item active">';
	        		}else{
	        			carouselPrj += '<div class="item">';
	        		}
	        		var url = '';
	        		for(var j = i*itemCnt; j<itemCnt*(i+1);j++){
	        			url = 'qw/dutyRelevance/getPicById?qwId='+rowData.qwId+'&seq='+(j+1)+"&random="+new Date().getTime();
	        			carouselPrj += '<img src="'+url+'" alt="图片缩略图" style="width:200px; heigth:200px;margin-top:30px;float:left;padding:5px;" />';
	        		}
	        		carouselPrj += '</div>';
	        	}
	        	carouselIndex += '</ol>';
	        	carouselPrj += '</div>';
	        	$("#photoDisplayDiv").append(carouselIndex + carouselPrj + carouselNavi);
	        	
	        	// 生成勤务点位
	        	if(marker){
        			map.getOverlayLayer().removeOverlay(marker);
        		}
	        	
	        	if(rowData.longitude ==''){
        			layer.msg("该勤务记录无位置信息！");
        			return;
        		}
        		var opts=new IMAP.MarkerOptions();
        		opts.anchor = IMAP.Constants.BOTTOM_CENTER;
        		opts.icon=new IMAP.Icon("./assets/images/unsignedMission.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
        		var lnglat=new IMAP.LngLat(rowData.longitude, rowData.latitude);
        		if(lnglat){
        			map.setCenter(lnglat);
        			marker=new IMAP.Marker(lnglat, opts);
        			map.getOverlayLayer().addOverlay(marker, false);
        			marker.data = rowData;
        		}
	        },
	        gridComplete:function(){
	        	var ids = $("#dutyReleGrid").jqGrid('getDataIDs');
	        	if(parmData.status == '2'){
	        		for(var i=0;i<ids.length;i++){
		        		var rowData = $("#dutyReleGrid").jqGrid('getRowData', ids[i]);
		        		var rele= "<input class='btn btn-success btn-sm' style='font-size:10px;height:20px; line-height:8px;' type='button' value='确认关联' onclick=\"confirmRelevance('"+rowData.qwId+'||'+parmData.id+'||'+parmData.qwType+"');\" />";
		        		
		        		$("#dutyReleGrid").jqGrid('setRowData', ids[i],{
		        			act:rele
		        		});
		        	}
	        	}else{
	        		for(var i=0;i<ids.length;i++){
		        		var rowData = $("#dutyReleGrid").jqGrid('getRowData', ids[i]);
		        		var rele = "<input class='btn btn-success btn-sm' style='font-size:10px;height:20px; line-height:8px;' type='button' value='取消关联' onclick=\"cancelRelevance('"+rowData.qwId+'||'+parmData.id+'||'+parmData.qwType+"');\" />";
		        		
		        		$("#dutyReleGrid").jqGrid('setRowData', ids[i],{
		        			act:rele
		        		});
		        	}
	        	}
	        	
	        	//隐藏grid底部滚动条
	        	$("#dutyReleGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        loadComplete:function(xhr){
	        	if(xhr.code != 200){
	        		layer.msg(xhr.msg);
	        	}
	        	var rstArry = $('#dutyReleGrid').jqGrid('getDataIDs');  
	        	if(null === rstArry || rstArry.length === 0){
	        		layer.msg("无任何记录！");
	        	}
	        }
		});
	};

	var applyDataToUI = function() {
		var bottomPanel = $("#bottomPanel");
		bottomPanel.html(htmlStr);
		bottomPanel.fadeIn().css("display","inline-block");
		vm = new Vue({
			el: '#dutyRelevance-panel',
			data: {
				picUrlList:[]
			},
			methods: {
				close: function() {
					//$("#bottomPanel").hide();
					hide();
				}
			}
		});
		
		vueEureka.set("bottomPanel", {
			vue: vm,
			description: "bottomPanel"
		});
	};
	
	var hide = function() {
		$("#bottomPanel").hide();
		if(marker){
			map.getOverlayLayer().removeOverlay(marker);
		}
	}

	return {
		show: show,
		hide: hide
	};
})
	
var confirmRelevance = function(value){
	var id = TUtils.getSelectedRow();
	if(id == null){
		return ;
	}
	var parmArry = value.split("||");
	$.ajax({
	    url: "qw/dutyRelevance/relevanceQw?qwId="+parmArry[0]+"&id="+parmArry[1]+"&qwType="+parmArry[2]+"&qwRelevanceFlag="+"1",
	    success: function(rstl){
			if(rstl.code == 200){
				alert("关联成功！");
			}else{
				alert(rstl.msg);
			}
		}
	});
	$("#bottomPanel").hide();
	vueEureka.get("leftPanel").vue.reload();
	/*var gridLedgerPanel = require(['../gridLedgerPanel'],function(gridLedgerPanel){
		gridLedgerPanel.reload;
    });*/
};

var cancelRelevance = function(value){
	var id = TUtils.getSelectedRow();
	if(id == null){
		return ;
	}
	
	var parmArry = value.split("||");
	$.ajax({
	    url: "qw/dutyRelevance/relevanceQw?qwId="+parmArry[0]+"&id="+parmArry[1]+"&qwType="+parmArry[2]+"&qwRelevanceFlag="+"0",
	    success: function(rstl){
			if(rstl.code == 200){
				alert("取消关联成功！");
			}else{
				alert(rstl.msg);
			}
		}
	});
	$("#bottomPanel").hide();
	vueEureka.get("leftPanel").vue.reload();
};
	