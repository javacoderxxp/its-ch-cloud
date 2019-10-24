define(function(require) {
	var htmlStr = require('text!./roadDraw.html');

	var Vue = require('vue');
	var map = require('mainMap');
	require('my97Datepicker');
	var infoLabel;
	var oldQ = '1';
	//在地图中添加MouseTool插件
	var mousetool = null, infowindow = null;
	var polyLines = [];//覆盖物列表
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.PolylineTool();
		mousetool.autoClose = true;//是否自动关闭绘制
		map.addTool(mousetool);
	});
	var vm = null;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#clgl-panel',
			data: {
				showList: true, //显示查询
				trafficControlQ: {}, //查询参数
				trafficControl: {region:'',type:''},
				roadDrawQ: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :''),vLdlxQ:''}, //交警大队查询所有，交警中队查询当前组
				roadDraw: {},
				groupList:[], //中队列表
				newGridPolygon:null,
				dutyGridList:[],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0  //判断当前用户是否有中队管理员权限，如果没有，只能进行查询操作。
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#vLdlxQ').selectpicker({
							noneSelectedText:'所有',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						
						$('#vLdlx').selectpicker({
							noneSelectedText:'请选择',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						
						$('#gridId').selectpicker({
							noneSelectedText:'请选择',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				query: function () {
					vm.reload();
				},
				reset: function () {
					if(vm.newGridPolygon){
						map.getOverlayLayer().removeOverlay(vm.newGridPolygon);
					}
				},
				add: function () {
					vm.reset();
					vm.showList = false;
					$("#vLdlx").selectpicker('val', "");
					$("#groupId").selectpicker('val', "");
					$("#gridId").selectpicker('val', "");
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
					    url: "./jtzx/roaddraw/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								vm.showList = false;
								vm.roadDraw = rslt.roaddraw;
								$("#vLdlx").selectpicker('val', rslt.roaddraw.vLdlx);
								$("#groupId").selectpicker('val', rslt.roaddraw.groupId);
								vm.getDutyListByTeamId();
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
				    //表单验证
				    $("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
				        	var reg = /^[0-9]*$/;
							if (!reg.test($("#constant").val())) 
							{
								alert("常值：   请输入数字");
								return false;
							}
							var url = "jtzx/roaddraw/save";
								$.ajax({
									type: "POST",
									url: url,
									data: JSON.stringify(vm.roadDraw),
									success: function(rslt){
										if(rslt.code === 200){
											alert('操作成功', function(index){
												vm.reload();
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
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
						    url: "./jtzx/roaddraw/purge/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									vm.reload();
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
				addGrid: function () {
					if(vm.newGridPolygon){
						map.getOverlayLayer().removeOverlay(vm.newGridPolygon);
					}
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						vm.newGridPolygon = evt.overlay;
						vm.roadDraw.region = TUtils.polygonPath2Str(evt.overlay.getPath());
						$("#region").val(vm.roadDraw.region);
						mousetool.close();
					},this);
				
				},
				showOnetrafficControl: function (roadDraw) {
		    		var polygonPath = TUtils.polygonStr2Path(roadDraw.region);
		        	var plo = new IMAP.PolylineOptions();
		        	plo.strokeColor = "#ff0000";
		        	plo.strokeOpacity = "1";
		        	plo.strokeWeight = "6";
		        	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
		        	vm.newGridPolygon = new IMAP.Polyline(polygonPath, plo);
		        	map.getOverlayLayer().addOverlay(vm.newGridPolygon, false);

				},
				reload: function () {
					vm.showList = true;
					vm.roadDraw= {};
					vm.reset();
					loadJqGrid();
				},
				close: function() {
					vm.reset();
					map.getOverlayLayer().clear();
					itsGlobal.hideLeftPanel();
				},
				getDutyListByTeamId: function() {
					var gid=vm.roadDraw.gridId;
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.roadDraw.groupId, function(r){
						if(r.code == 200){
							vm.dutyGridList = r.dutyGridList;
							var refreshGridId = setInterval(function(){
								$('#gridId').selectpicker('refresh');
								var a = $('#gridId option').text();
								var arr = $('#ze_ren_qu div li a');
								if(arr.length <=1){
									clearInterval(refreshGridId);
									$("#gridId").selectpicker('val', gid);
								}else{
									var b = arr[1].innerText;
									if(!b){
										clearInterval(refreshGridId);
										return;
									}
									if(a.indexOf(b)>=0){
										clearInterval(refreshGridId);
										$("#gridIdQ").selectpicker('val', gid);
									}
								}
							}, 10);
						}else{
							alert(r.msg);
						}
					});
				}
			}
		});
		oldQ=1;
		loadJqGrid();
		getGourp();
		vm.loadMultiselect();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "trafficControl的vue实例"
		});
	}

	var getGourp = function(){
		$.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				vm.groupList = r.groupList;
					//vm.groupList.unshift({groupName:'所有'});
				
				
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'所有',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
					$('#groupId').selectpicker({
						noneSelectedText:'请选择',
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
	
	var loadJqGrid = function() {
		map.getOverlayLayer().clear();
		var postDataTmp = vm.roadDrawQ;
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
				postData: vm.roadDrawQ,
				page:page
			}).trigger("reloadGrid");
		}else{
			oldQ = JSON.parse(JSON.stringify(postDataTmp));
			$('#jqGrid').jqGrid('GridUnload');
			$("#jqGrid").jqGrid({
				url: "./jtzx/roaddraw/pageData",
				datatype: "json",
				postData: vm.roadDrawQ,
				colModel: [
				           { label: 'id', name: 'id', width: 30, key: true, hidden:true },
				           { label: 'region', name: 'region', width: 30, hidden:true },
				           { label: '路段名称', name: 'mc',sortable:false,width: 45},
				           { label: '路段类型', name: 'vLdlx', width: 45, sortable:false , formatter: function(value, options, row){
				        	   return type2word(value);
				           }},
				           { label: '所属中队', name: 'groupName', width: 45},
				           { label: '描述', name: 'description',  width: 45},
				           /*{ label: '开始时间', name: 'startDt',  width: 45, sortable:true, formatter: function(value, options, row){
				        	   return value ? value: 'N/A';
				           }},
				           { label: '结束时间', name: 'endDt',  width: 45, sortable:true, formatter: function(value, options, row){
				        	   return value ? value: 'N/A';
				           }},*/
				           ],
				           viewrecords: true,
				           height: 260,
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
				           ondblClickRow: function(rowid, iRow, iCol, e){
				        	   vm.edit();
				           },
				           onSelectRow: function(rowid, status){//选中某行
				        	   vm.reset();
				        	   var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				        	   vm.showOnetrafficControl(rowData);
				           }
			});
		}
		
		$.ajax({
		    url:'./jtzx/roaddraw/allData',
		    data:vm.roadDrawQ,
			type:'GET', 
		    contentType: "application/json",    
		    success:function(dat){
		        if(dat.code == 200){
		        	map.getOverlayLayer().clear();
		        	polyLines=[];
		        	var roaddrawList = dat.roaddrawList;
		        	for (var ind = 0; ind < roaddrawList.length; ind++) {
						var oneData = roaddrawList[ind];
						var polygonPath = TUtils.polygonStr2Path(oneData.region);
			        	var plo = new IMAP.PolylineOptions();
			        	plo.strokeColor = "#AAAAAA";
			        	plo.strokeOpacity = "1";
			        	plo.strokeWeight = "6";
			        	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
			        	var polyline = new IMAP.Polyline(polygonPath, plo);
			        	
			        	polyline.data = oneData;
			        	polyline.addEventListener(IMAP.Constants.MOUSE_OVER, polylineMouseOver);
						polyline.addEventListener(IMAP.Constants.MOUSE_OUT, polylineMouseOut);
						
						polyLines.push(polyline);
					}
		        	map.getOverlayLayer().addOverlays(polyLines, false);
		        }
		    },
		    error:function(xhr,textStatus){
		    	layer.msg("区域查询失败！");
		    }
		});
	    
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	};
	
	
	//鼠标移入事件
	var polylineMouseOver = function(e) {
		var polyline = e.target;
		var road = polyline.data;
		var option = polyline.getAttribute();
		option.strokeWeight = 10;
		option.strokeColor = '#ff0000';
		polyline.setAttribute(option);
		
		var dispNm = road.mc;
		if(!road.mc){
			dispNm ='无名路';
		}
		infoLabel = new IMAP.Label(dispNm, {
			position : new IMAP.LngLat(e.lnglat.lng, e.lnglat.lat),// 基点位置
			anchor : IMAP.Constants.BOTTOM_CENTER,
			title : "label",
			fontColor : "#ff0000",
			fontSize : 12,
			fontBold : false
		});

		map.getOverlayLayer().addOverlay(infoLabel, false);
	};
	//鼠标移出事件
	var polylineMouseOut = function(e) {
		var polyline = e.target;
		var option = polyline.getAttribute();
		option.strokeWeight = 6;
		option.strokeColor = '#AAAAAA';
		polyline.setAttribute(option);
		
		map.getOverlayLayer().removeOverlay(infoLabel);
	};
	
	var type2word = function(vLdlx){
		var word = "其他";
		switch (vLdlx) {
			case "1":
				word = "国省道";
				break;
			case "3":
				word = "县道路";
				break;
			case "2":
				word = "城镇道路";
				break;
			default:
				break;
		}
		return word;
	}
	
	var hide = function() {
		map.getOverlayLayer().clear();
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})