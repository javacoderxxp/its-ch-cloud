define(function(require) {
	var htmlStr = require('text!./aqxcPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	
	//var dutyGridPolygonOthers = [];
	//var infoLabelOthers = [];
	
	var marker;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#pure-panel',
			created: function () {
				/*this.loadMultiselect(),*/
			},
			watch:{
				dictList:'loadMultiselect'
			},
			data: {
				showList: true,
				dictList:{},
				dutyStatus:{},
				aqxcQ:{startTime: TUtils.formatDate(TUtils.setDate(TUtils.addDate(new Date(),-365))), endTime: TUtils.formatDate(TUtils.addDate(new Date(), 1))},
				aqxc:{},
				selectedRow:{},
				dutyGridList:[]
			},
			methods: {
				query: function() {
					vm.reload();
				},
				reload:function(){
					vm.aqxc = {xclx:''};
					//$('#xclx').val('');
					vm.reset();
					loadJqGrid();
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', isShowClear: false, onpicked:function(){vm.aqxcQ.startTime = $("#startTimeQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', isShowClear: false, onpicked:function(){vm.aqxcQ.endTime = $("#endTimeQ").val()}});
				},
				reset: function(){
					marker = null;
					map.getOverlayLayer().clear();
				},
				close: function() {
					vm.reset();
					itsGlobal.hideLeftPanel();
				},
				toGeocoder : function toGeocoder(shape){
					map.plugin(['IMAP.Geocoder'], function(){
						var geocoder=new IMAP.Geocoder({city:"太仓市", pois:true});
						geocoder.getAddress(shape,function(status, result) {
				            if (status == 0) {
				            	var plnglat=result.result;
				            	vm.aqxc.xcdd = plnglat[0].formatted_address;
				            }
				        });
					});
				},
/*				showDutyGrids: function () {
					var url = "qw/dutyGrid/findOtherList";
				    $.get(url, function(r){
						if(r.code == 200){
							vm.dutyGridList = r.dutyGridOtherList;
							if(vm.dutyGridList.length == 0){
								layer.msg("尚未添加责任区");
								return;
							}
							for(var idx =0; idx < vm.dutyGridList.length; idx++){
								var dutyGridOther = vm.dutyGridList[idx];
								var polygonPathOther = TUtils.polygonStr2Path(dutyGridOther.shape);
								var dutyGridPolygonOther = new IMAP.Polygon(polygonPathOther, TConfig.V.dutyGridPolygonOpt);
								dutyGridPolygonOther.data = dutyGridOther;
								map.getOverlayLayer().addOverlay(dutyGridPolygonOther, false);
								dutyGridPolygonOthers.push(dutyGridPolygonOther);
								
								var infoLabel = new IMAP.Label(dutyGridOther.group.groupName+"[网格 "+dutyGridOther.gridId+"]<br/>"+dutyGridOther.userNames, {
									position : dutyGridPolygonOther.getBounds().getCenter(),// 基点位置
									offset: new IMAP.Pixel(0,-25),//相对于基点的位置
									anchor : IMAP.Constants.BOTTOM_CENTER,
									fontSize : 12,
									fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
									fontColor : "red"
								});
								map.getOverlayLayer().addOverlay(infoLabel, false);
								infoLabelOthers.push(infoLabel);
							}
						}else{
							alert(r.msg);
						}
					});
				}*/
			}
		});
		//initPage();
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "purePanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		//vm.showDutyGrids();
		$("#jqGrid").jqGrid('GridUnload');
		vm.aqxcQ.startDt = $('#startTimeQ').val();
		vm.aqxcQ.endDt = $('#endTimeQ').val();
		var postDataTmp = {'startDt': vm.aqxcQ.startDt,'endDt':vm.aqxcQ.endDt,'xclx': vm.aqxcQ.xclx,'status':vm.aqxcQ.status};
	    $("#jqGrid").jqGrid({
	        url: "qw/aqxc/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
	        	{ label: 'qwId', name: 'qwId', width: 60, hidden:true, sortable:false},
	        	{ label: 'createDt', name: 'createDt', width: 5, hidden:true },
				{ label: 'longitude', name: 'longitude', width: 60 , hidden:true },
				{ label: 'latitude', name: 'latitude', width: 60 , hidden:true },
				{ label: '宣传时间', name: 'qwRecordDt', width: 150, sortable:false},
				{ label: '宣传类型', name: 'qwTypeDesc', width: 150, sortable:false},
				{ label: '宣传地点', name: 'qwAddr', width: 100, hidden:true},
				{ label: '执勤人员', name:'policeName',width: 180, sortable:false},
				{ label: '照片数量', name: 'picCnt', width: 60, sortable:false, formatter: function(value, options, row){
					if(value != "0"){
						return "<a class='gotoCheckPic' data-qwid='"+row.qwId+"' style='color:red;cursor: pointer;'>"+value+"</a>";
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
				$('.gotoCheckPic').bind('click',function(){
					var taskid = $(this).data("qwid");
					if(!taskid || ""==taskid){
						return;
					}
					$.ajax({
						url: "./qw/dutyRelevance/findPicByQwId?qwId="+taskid+"&rdm="+new Date().getTime(),
						success: function(rslt){
							if(rslt.code == 200){
								var tab = [];
								if(rslt.pic && rslt.pic.length>0){
									for (var i = 0; i < rslt.pic.length; i++) {
										var p = rslt.pic[i];
										var tabCont = {};
										tabCont.title = " <a href='#' style='margin-right: 25px;'>"+(i+1)+"</a> ";
										tabCont.content = "<img style='margin-left: 55px;' src='"+ctx+"qw/dutyRelevance/getPicByPicId?id="+p.id+"'>";
										tab.push(tabCont);
									}
								}
								layer.tab({
								  area: ['800px', '500px'],
								  tab: tab,
								  skin: '.layui-layer-tab div'
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				});
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        onSelectRow: function(rowid){
	        	// 生成图片预览
	        	var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
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
        		opts.icon=new IMAP.Icon("./assets/images/aqxc.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
        		var lnglat=new IMAP.LngLat(rowData.longitude, rowData.latitude);
        		if(lnglat){
        			map.setCenter(lnglat);
        			marker=new IMAP.Marker(lnglat, opts);
        			map.getOverlayLayer().addOverlay(marker, false);
        			marker.data = rowData;
        		}
	        }
	    });
	};
	
/*	var initPage = function(){

		$.get("./sys/dict/getDictList?type="+"XCLX", function(r){
			if(r.code == 200){
				vm.dictList = r.dictList;
			}else{
				alert(r.msg);
			}
		});
		
		$.get("./sys/dict/getDictList?type="+"duty_status", function(r){
			if(r.code == 200){
				vm.dutyStatus = r.dictList;
			}else{
				alert(r.msg);
			}
		});
		
	}*/
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})