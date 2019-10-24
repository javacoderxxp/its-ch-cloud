define(function(require) {
	var htmlStr = require('text!./linkStatus.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var linkStatusApp = null;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		linkStatusApp = new Vue({
			el: '#linkStatus-panel',
			data: {
				linkStatusQ: {}, //查询参数
			},
			methods: {
				query: function () {
					linkStatusApp.reload();
				},
				reset: function () {
					map.getOverlayLayer().clear();
				},
				reload: function (event) {
					linkStatusApp.reset();
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});

		loadJqGrid();
		
		vueEureka.set("leftPanel", {
			vue: linkStatusApp,
			description: "linkStatus的vue实例"
		});
	}

	var loadJqGrid = function() {
		$('#jqGrid').jqGrid('GridUnload');

		var postDataTmp = {};
	    $("#jqGrid").jqGrid({
	        url: "jtzx/linkStatus/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '路段编号', name: 'linkId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '状态', name: 'status', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '接收时刻', name: 'rcvdTm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
	        ],
			viewrecords: true,
	        height: 510,
	        rowNum: 20,
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
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        onSelectRow: function(rowid){//选中某行
	    		var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	    		//var x = rowData.latLng.split(',')[0];
	    		//var y = rowData.latLng.split(',')[1];
	    		//map.centerAndZoom(new BMap.Point(x,y), 19);
	    	}
	    });

	};
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})