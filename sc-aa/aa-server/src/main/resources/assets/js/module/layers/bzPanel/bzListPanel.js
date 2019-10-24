define(function(require) {
	var htmlStr = require('text!./bzListPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('datetimepicker');
	var oldQ="1";
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	
	//在地图中添加MouseTool插件
	var bzsId=null;
	var bzsApp = null;
	var bzMarkers=[];//地图上查询到的
	var bzMarkerSel;//选中的
	var searchAreaPolygon = null; 
	var mousetool = null;
	/*map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.PolygonTool();
		mousetool.autoClose = true;//是否自动关闭绘制
		map.addTool(mousetool);
	});*/
	
	
	var show = function(sId) {
		bzsId=sId;
		itsGlobal.showLeftPanel(htmlStr);
		
		bzsApp = new Vue({
			el: '#bzs-app',
			data: {
				showList: true,
				bzsQ: {lb:'指示标志/指路标志', mc:'', xs:'-1'}, //查询参数
				bzs: {status:''},
				dataList:[],
				bzLbList:[],
				bzMcList:[],
				roadList:[],
				crossList:[],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			methods: {
				//加载地图数据
				loadData : function(paramDataList) {
					loadJqGrid();
					
					if(paramDataList){
						bzsApp.dataList = paramDataList;//传入的数据
						bzsApp.applyDataToUI();
					}else{//主动查询的数据
						layer.load();
						var url = "jtss/bz/allData";
						$.ajax({
							type: "GET",
							data: bzsApp.bzsQ,
							url: url,
							success: function(rslt){
								layer.closeAll('loading');
								if(rslt.code == 200){
									bzsApp.dataList = rslt.bzList;
									bzsApp.applyDataToUI();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
				},
				//数据应用到视图
				applyDataToUI : function() {
					for(var i = 0; i < bzsApp.dataList.length; i++){
						var bz = bzsApp.dataList[i];
						if(bz.zb){
							var pos = bz.zb.split(",");
							switch (bz.lb) {
							case '指示标志':
							case '指路标志':
							case '指示标志/指路标志':
								markerOpts.icon = new IMAP.Icon("./assets/images/bz_zs.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
								break;
							case '禁令标志':
								markerOpts.icon = new IMAP.Icon("./assets/images/bz_jl.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
								break;
							case '警告标志':
								markerOpts.icon = new IMAP.Icon("./assets/images/bz_jg.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
								break;
							case '辅助标志':
								markerOpts.icon = new IMAP.Icon("./assets/images/bz_fz.png", new IMAP.Size(32, 18), new IMAP.Pixel(0, 0));
								break;
							case '旅游区标志':
								markerOpts.icon = new IMAP.Icon("./assets/images/bz_lyq.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
								break;
							case '其他标志':
								markerOpts.icon = new IMAP.Icon("./assets/images/bz_qt.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
								break;
							default:
								break;
							}
							var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
							marker.data = bz;
//							marker.addEventListener(IMAP.Constants.CLICK, bzsApp.markerClick);
							map.getOverlayLayer().addOverlay(marker, false);
							marker.setTitle(bz.mc);
							bzMarkers.push(marker);
						}
					}
					gblMapObjs.bzMarkers = bzMarkers;
					layer.msg('加载了'+bzMarkers.length+"个交通标志");
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					editbzs(id);
				},
				save: function () {
				    //表单验证
				    $("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							var url = "./jtss/bz/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(bzsApp.bzs),
							    success: function(rslt){
							    	if(rslt.code === 200){
										alert('操作成功', function(index){
											bzsApp.reload();
										});
									}else{
										alert(rslt.msg);
									}
								}
							});
				            return false;//已经用AJAX提交了，需要阻止表单提交
				        }
					});
				},
				lineSearch: function () {
					
				},
				resetSearchArea: function(){
					if(searchAreaPolygon){
						map.getOverlayLayer().removeOverlay(searchAreaPolygon);
					}
					searchAreaPolygon = null; 
				},
				areaSearch: function () {
					//区域搜索的时候不加路口条件
					bzsApp.bzsQ.crossId ='';
					bzsApp.bzsQ.roadId ='';
					$('.selectpickerDl').selectpicker('val', '');
					$('.selectpickerLk').selectpicker('val', '');
					
					bzsApp.resetSearchArea();
					bzsApp.clear();
					mousetool = new IMAP.PolygonTool();
					mousetool.autoClose = true;//是否自动关闭绘制
					map.addTool(mousetool);
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						searchAreaPolygon = evt.overlay;
						bzsApp.bzsQ.area = TUtils.polygonPath2Str(evt.overlay.getPath());

						bzsApp.loadData();
						
						mousetool.close();
					},this);
					mousetool.editabled = false; 
				},
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定清除？', function(){
						$.ajax({
							type: "POST",
						    url: "./jtss/bz/purge/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									alert('操作成功', function(index){
										$("#jqGrid").trigger("reloadGrid");
									});
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				clearOneBz: function(){
					if(bzMarkerSel){
						map.getOverlayLayer().removeOverlay(bzMarkerSel);
					}
					bzMarkerSel = null; 
				},
				showOneBz: function (bz) {
					bzsApp.clearOneBz();
					var markerOpts = new IMAP.MarkerOptions();
					markerOpts.icon = new IMAP.Icon("assets/images/bzlocate.png", new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
		    		var lngLat = TUtils.str2Lnglat(bz.zb);
		    		bzMarkerSel = new IMAP.Marker(lngLat, markerOpts);
		    		bzMarkerSel.data = bz;
		        	map.getOverlayLayer().addOverlay(bzMarkerSel, false);
		    		map.setCenter(lngLat,19);
				},
				clearMarkers: function () {
					//清除界面
	    			for (var i = 0; i < bzMarkers.length; i++) {
	    				map.getOverlayLayer().removeOverlay(bzMarkers[i]);
	    			}
					bzMarkers = [];
					gblMapObjs.bzMarkers = [];
				},	
				loadBzMcList : function() {
					$.get("./jtss/bz/findMcList?lb="+bzsApp.bzsQ.lb, function(r){
						if(r.code == 200){
							bzsApp.bzMcList = r.bzMcList;
						}else{
							alert(r.msg);
						}
					});
				},
				reset: function () {
					//重置搜索条件
					bzsApp.bzsQ={lb:'指示标志/指路标志', mc:'', xs:'-1'};
					$('.selectpickerDl').selectpicker('val', '');
					$('.selectpickerLk').selectpicker('val', '');
					bzsApp.resetSearchArea();
					bzsApp.clear();
				},
				clear: function () {
					//重置结果
					bzsApp.clearOneBz();
					bzsApp.clearMarkers(); 
					bzsApp.showList = true;
				},
				query: function () {
					bzsId=null;
					//一般搜索的时候不加区域条件
					bzsApp.bzsQ.area ='';
					bzsApp.resetSearchArea();
					bzsApp.reload();
				},
				reload: function () {
					bzsApp.clear();
					bzsApp.loadData();
				},
				close: function() {
					bzsApp.reset();
					bzsApp.clear();
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		if(sId){
			editbzs(sId);
		}
		oldQ=1;
		loadBzLbList();
		bzsApp.loadBzMcList();
		loadRoads();
		loadCrosses();

		
		$(".form_datetime").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss',autoclose: true});
		
		$('#myTab li:eq(1) a').tab('show');
		
		vueEureka.set("leftPanel", {
			vue: bzsApp,
			description: "bzs的vue实例"
		});
	};
	
	var editbzs = function(id){
		$.ajax({
			type: "POST",
		    url: "./jtss/bz/detail/"+id,
		    success: function(rslt){
				if(rslt.code == 200){
					bzsApp.bzs = rslt.bz;
					bzsApp.showList = false;
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
	
	var loadBzLbList = function() {
		bzsApp.bzLbList.push('指示标志/指路标志');
		bzsApp.bzLbList.push('禁令标志');
		bzsApp.bzLbList.push('警告标志');
		bzsApp.bzLbList.push('辅助标志');
		bzsApp.bzLbList.push('旅游区标志');
		bzsApp.bzLbList.push('其他标志');
	}
	
	var loadRoads = function() {
		$.ajax({
			url: "jcsj/road/allData",
			success: function(rslt){
				layer.closeAll('loading');
				if(rslt.code == 200){
					bzsApp.roadList = rslt.roadList;
					bzsApp.roadList.unshift({mc:'所有', bh:''});
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('.selectpickerDl').selectpicker({
							noneSelectedText:'请选择一条道路',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				}else{
					alert(rslt.msg);
				}
			}
		});
	}

	var loadCrosses = function() {
		$.ajax({
			url: "jcsj/cross/allData",
			success: function(rslt){
				layer.closeAll('loading');
				if(rslt.code == 200){
					bzsApp.crossList = rslt.crossList;
					bzsApp.crossList.unshift({mc:'所有', bh:''});
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('.selectpickerLk').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
	
	var loadJqGrid = function() {
		bzsApp.bzsQ.id=bzsId;
		
		if(TUtils.cmp(bzsApp.bzsQ,oldQ)){
			
			var postDataTmp = bzsApp.bzsQ;
			oldQ = JSON.parse(JSON.stringify(bzsApp.bzsQ));
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
			oldQ = JSON.parse(JSON.stringify(bzsApp.bzsQ));
			$('#jqGrid').jqGrid('GridUnload');
			$("#jqGrid").jqGrid({
				url: "./jtss/bz/pageData",
				datatype: "json",
				postData: bzsApp.bzsQ,
				colModel: [
				           { label: 'id', name: 'id', width: 5, key: true, hidden:true },
				           { label: '编号', name: 'bh', width: 150, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '类别', name: 'lb', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '名称', name: 'mc', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '限速', name: 'xs', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				           { label: '坐标', name: 'zb', width: 150, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				           ],
				           viewrecords: true,
				           height: 260,
				           rowNum: 10,
				           rowList : [10,30,50],
				           rownumbers: true, 
				           rownumWidth: 25, 
				           autowidth: false,
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
				           ondblClickRow: function(rowid, iRow, iCol, e){
				        	   bzsApp.edit();
				           },
				           gridComplete:function(){
				        	   //隐藏grid底部滚动条
				        	   $("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
				           },
				           onSelectRow: function(rowid){//选中某行
				        	   var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				        	   var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				        	   bzsApp.showOneBz(rowData);
				           }
			});
		}
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});

	};
	
	var type2word = function(type){
		var word = "其他";
		switch (type) {
			case "1":
				word = "信号机";
				break;
			case 2:
				word = "监控设备";
				break;
			case 3:
				word = "诱导屏";
				break;
			case 8:
				word = "其他";
				break;
			default:
				break;
		}
		return word;
	}
	
	var statusword = function(status){
		var word = "其他";
		switch (status) {
			case "1":
				word = "正常使用";
				break;
			case "2":
				word = "拆除";
				break;
			case "3":
				word = "维护中";
				break;
			case "8":
				word = "其他";
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