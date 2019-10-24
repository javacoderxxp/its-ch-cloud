define(function(require) {
	var htmlStr = require('text!./parkingLot.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('datetimepicker');
	var parkingLotApp = null;
	
	//在地图中添加MouseTool插件
	var mousetool = null, infowindow = null;
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/parkingLot.png"), new IMAP.Size(32, 32)));
		mousetool.follow=true;
		mousetool.autoClose=true;
		mousetool.title="点击左键标注岗位点";
		map.addTool(mousetool);
	});
	var parkMarker;
	
	var visualContent = "<div style='height:270px'>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>停车场名</span> <input type='text' class='form-control' value='{0}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>总泊位</span> <input type='text' class='form-control' value='{1}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>管理单位</span> <input type='text' class='form-control' value='{2}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>所在道路</span> <input type='text' class='form-control' value='{3}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>是否收费</span> <input type='text' class='form-control' value='{4}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>面积</span> <input type='text' class='form-control' value='{5}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>接入停车系统</span> <input type='text' class='form-control' value='{6}' disabled></div>" +
	"</div>";
	
	var setInfoWindow = function(data,lnglat,ishow){
	    	var title="停车场";
	    	var content = visualContent.replace("{0}",data.parkName).replace("{1}",data.parkCapacity)
	    		.replace("{2}",data.gldw).replace("{3}",data.szdl).replace("{4}",data.sfsf).replace("{5}",data.mj)
	    		.replace("{6}",data.jrtcxt);
	    	infowindow = new IMAP.InfoWindow(content,{
	    		size : new IMAP.Size(320,270),
				title: title,
				offset: new IMAP.Pixel(0,-25),//相对于基点的位置
				position:lnglat
			});
	    	map.getOverlayLayer().addOverlay(infowindow);
			if(!ishow){
				infowindow.visible(false);
			}else{
				infowindow.visible(true);
			}
			infowindow.autoPan(true);
	    }
	  
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		parkingLotApp = new Vue({
			el: '#pure-panel',
			created: function () {
				this.loadMultiselect(),
				require(['datetimepicker'],function(){
					$("#cjsj").datetimepicker({
						language: "zh-CN", 
						format: 'yyyy-mm-dd hh:ii:ss', 
						autoclose: true
					});
				})
				
			},
			data: {
				showList: true,
				parkingLotQ:{},
				parkingLot: {},
				selectedRow:{}
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#jrtcxtQ').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#jrtcxt').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#sfsf').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				query: function() {
					parkingLotApp.reload();
				},
				add:{},
				save:function(){
					 //表单验证
				    $("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
				        	
							var url = "jcsj/parkingLot/save";
							parkingLotApp.parkingLot.parkCode = $("#parkCode").val();
							parkingLotApp.parkingLot.cjsj=$('#cjsj').val();
							$.ajax({
									type: "POST",
								    url: url,
								    data: JSON.stringify(parkingLotApp.parkingLot),
								    success: function(rslt){
								    	if(rslt.code === 200){
											alert('操作成功', function(index){
												parkingLotApp.clearParkPoint();
												parkingLotApp.reload();
												//layer.closeAll('page');
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
				edit:function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						alert("请选择一条记录");
						return ;
					}
					
					$.ajax({
					    url: "jcsj/parkingLot/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								parkingLotApp.parkingLot = rslt.parkingLot;
								if(rslt.parkingLot.jrtcxt == '1'){
									alert("已接入停车系统的不能修改！");
									return;
								}
								
								$("#jrtcxt").selectpicker('val',rslt.parkingLot.jrtcxt);
								$("#sfsf").selectpicker('val',rslt.parkingLot.sfsf);
								$("#liEdit").show();
								$("#editB").show();
								$("#liEdit").addClass("active");
								$("#liQuery").hide();
								$("#liDetail").hide();
								$("#parkingLotQuery").removeClass("tab-pane fade in active");
								$("#parkingLotQuery").addClass("tab-pane fade");
								$("#parkingLotDetail").removeClass("tab-pane fade");
								$("#parkingLotDetail").addClass("tab-pane fade in active");
							}else{
								alert(rslt.msg);
							}
						}
					});
					
				},
				purge:function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						alert("请选择一条记录");
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
						    url: "jcsj/parkingLot/detail/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									if(rslt.parkingLot.jrtcxt == '1'){
										alert("已接入停车系统的不能删除！");
										return;
									} else {
										$.ajax({
											type: "POST",
										    url: "jcsj/parkingLot/purge/"+id,
										    success: function(rslt){
												if(rslt.code == 200){
													parkingLotApp.reload();
													alert('操作成功', function(index){
														$("#jqGrid").trigger("reloadGrid");
													});
												}else{
													alert(rslt.msg);
												}
											}
										});
									}
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				reset: function () {
					parkingLotApp.clearParkPoint();
					map.getOverlayLayer().clear();
				},
				reload: function () {
					$("#liDetail").removeClass("active");
					$("#liQuery").addClass("active");
					$("#liEdit").hide();
					$("#editB").hide();
					$("#liQuery").show();
					$("#liDetail").show();
					$("#parkingLotDetail").removeClass("tab-pane fade in active");
					$("#parkingLotDetail").addClass("tab-pane fade");
					$("#parkingLotQuery").removeClass("tab-pane fade");
					$("#parkingLotQuery").addClass("tab-pane fade in active");
					parkingLotApp.parkingLot={jrtcxt:'',sfsf:''};
					parkingLotApp.reset();
					parkingLotApp.showList = true;
					loadJqGrid();
				},
				addParkPoint:function(){
					parkingLotApp.reset();
					parkingLotApp.clearParkPoint();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						parkMarker = evt.overlay;
						parkingLotApp.parkingLot.zb = TUtils.lnglat2Str(evt.overlay.getPosition());
						$("#parkPoint").val(TUtils.lnglat2Str(evt.overlay.getPosition()));
						var url = "jcsj/parkingLot/findNextParkCode";
					    $.get(url, function(r){
							if(r.code == 200){
								$("#parkCode").val(r.numStr);
							}else{
								alert(r.msg);
							}
						});
						mousetool.close();
					},this);
				},
				clearParkPoint:function(){
					if(parkMarker){
						map.getOverlayLayer().removeOverlay(parkMarker);
					}
					parkMarker = null; 
					parkingLotApp.parkingLot.zb='';
					$("#parkPoint").val("");
					$("#parkCode").val("");

				},
				close: function() {
					parkingLotApp.reset();
					itsGlobal.hideLeftPanel();
				}
			}
		});
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: parkingLotApp,
			description: "purePanel的vue实例"
		});
	}
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		
		var postDataTmp = {'jrtcxt': parkingLotApp.parkingLotQ.jrtcxt,'parkName': parkingLotApp.parkingLotQ.parkName};
	    $("#jqGrid").jqGrid({
	        url: "jcsj/parkingLot/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
	        	{ label: 'lx', name: 'lx', width: 100, hidden:true},
	        	{ label: 'zb', name: 'zb', width: 30, hidden:true },
	        	{ label: 'szdl', name: 'szdl', width: 30, hidden:true },
				{ label: '停车场名称', name: 'parkName', width: 130, sortable:false},
				{ label: '总泊位', name: 'parkCapacity', width: 50, sortable:false},
				{ label: '是否收费', name: 'sfsf', width: 80, sortable:false, formatter: function(value, options, row){
					var sf = "未知";
					if(value == "0"){
						sf = "不收费";
					} else if(value == "1") {
						sf = "收费";
					}
					return sf ;}},
				{ label: '面积', name: 'mj', width: 50, sortable:false, formatter: function(value, options, row){
					return (value == null || value=="")?"未知":value;
					}},
				{ label: '接入停车系统', name: 'jrtcxt', width: 100, sortable:false, formatter: function(value, options, row){
					return value == "1" ? "已接入":"未接入" ;
				}},
				{ label: '管理单位', name: 'gldw', width: 100, sortable:false, formatter: function(value, options, row){
					return (value == null || value=="")?"未知":value;
				}},
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
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        onSelectRow: function(rowid, status){//选中某行
	        	parkingLotApp.clearParkPoint();
	    		var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	    		parkingLotApp.selectedRow = rowData;
	    		var markerOpts = new IMAP.MarkerOptions();
				markerOpts.icon = new IMAP.Icon("assets/images/parkinglot.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	    		var lngLat = TUtils.str2Lnglat(rowData.zb);
	    		parkMarker = new IMAP.Marker(lngLat, markerOpts);
	        	map.getOverlayLayer().addOverlay(parkMarker, false);
	    		if(status){
					setInfoWindow(rowData,lngLat,true);
        		}else{
        			setInfoWindow(rowData,lngLat,false);
        		}
	    		map.setCenter(lngLat,15);
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