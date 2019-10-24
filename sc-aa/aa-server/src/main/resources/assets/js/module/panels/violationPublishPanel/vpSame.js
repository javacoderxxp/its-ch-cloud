define(function(require) {
	var htmlStr = require('text!./vpSame.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('my97Datepicker');
	var mousetool = null;
	var vm = null;
	var oldQ =  '1';
	var punishIcon = new IMAP.Icon("./assets/images/punish.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		
		vm = new Vue({
			el: '#violationPublish-panel',
			data: {
				queryObj:{startTime: TUtils.formatDateTime000(new Date()), endTime: TUtils.formatDateTime(new Date())},
				publishQuery:{},
				punish:{},
				pos:null,
				showDetail:false,
				groupId:"",
				groupList:[],
				heatmapOverlay:null
			},
			methods: {
				query: function () {
					vm.reload();
				},
				add: function () {
					this.showDetail = true;
					this.punish.punisherNo = currentUser.policeNo;
					$('#myTab a[href="#publishDetail"]').tab('show');
				},
				addPosition:function(){
					this.clearShape();
					mousetool=new IMAP.MarkerTool(punishIcon,false);
					mousetool.autoClose = true;//是否自动关闭绘制	
					map.addTool(mousetool);
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						var pos = evt.overlay;
						vm.pos = pos;
						var lnglat = pos.getPosition();
						$("#posShape").val(lnglat.toString());
						mousetool.close();
					},this);
				},
				reload: function () {
					var postDataTmp = {"groupId": vm.groupId,"type":$("#type").val(),"startDt": $("#startTime").val(),
							"endDt": $("#endTime").val()};
					if(TUtils.cmp(postDataTmp,oldQ)){
						oldQ = JSON.parse(JSON.stringify(postDataTmp));
						var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
						$.each(postData, function (k, v) {  
							delete postData[k];
						});
						//var page = $("#jqGrid").jqGrid('getGridParam','page');
						var page = $('#jqGrid').getGridParam('page');
						if(!page){
							page = 1;
						}
						$("#jqGrid").jqGrid('setGridParam',{ 
							postData: postDataTmp,
							page:page
						}).trigger("reloadGrid");
					}else{
						loadJqGrid();
					}
				},
				close: function() {
					itsGlobal.hideLeftPanel();
					this.clearHeatmapLayer();
				},
				clearHeatmapLayer:function(){
					if(this.heatmapOverlay){
						map.getOverlayLayer().removeOverlay(this.heatmapOverlay);
						this.heatmapOverlay=null;
					}
				},
				clearShape:function(){
					if(null!=this.pos){
						map.getOverlayLayer().removeOverlay(this.pos);
					}
					$("#posShape").val("");
				},
				setDateStart:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){vm.queryObj.startTime = $("#startTime").val()}});
				},
				setDateEnd:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){vm.queryObj.endTime = $("#endTime").val()}});
				},
			}
		});
		oldQ=1;
		loadGroups();
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "publish的vue实例"
		});
	};
	
	
	var loadJqGrid = function() {
		$('#jqGrid').jqGrid('GridUnload');
		var postDataTmp = {"type":$("#type").val(),"startDt": $("#startTime").val(),
				"endDt": $("#endTime").val()};
		oldQ = JSON.parse(JSON.stringify(postDataTmp));
	    $("#jqGrid").jqGrid({
	        url: "./qw/violationPunish/findSameVpPage",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 1, key: true, hidden:true },
	        	{ label: '车牌号', name: 'carNo',  width: 40, sortable:false},
				{ label: '违法地点', name: 'violatedPlace',width: 70, sortable:false},
					{ label: '违法行为', name: 'violatedDesc', width: 140, sortable:false},
				{ label: '违法次数', name: 'totalViolatedCnt',  width: 50, sortable:false},
				{ label: 'latitude', name: 'latitude',  width: 50, sortable:false, hidden:true },
				{ label: 'longitude', name: 'longitude',  width: 50, sortable:false, hidden:true }
			 ],
			viewrecords: true,
	        height: 260,
	        width: 580,
	        rowNum: 10,
			rowList : [10,30,50],
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
	            layer.msg("加载完毕");
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        onSelectRow: function(rowid, status){//选中某行
	        	var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	        	map.setCenter(new IMAP.LngLat(rowData.longitude, rowData.latitude),16);
	    	}
	    });
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	};

	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				vm.groupList = r.groupList;
				vm.groupList.unshift({groupName:'所有'});
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
				});
			}else{
				alert(r.msg);
			}
		});
	}
	
	return {
		show : show,
		hide : hide
	};
})