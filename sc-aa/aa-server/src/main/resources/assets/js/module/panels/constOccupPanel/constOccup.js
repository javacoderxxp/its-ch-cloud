define(function(require) {
	var htmlStr = require('text!./constOccup.html');
	var Vue = require('vue');
	var map = require('mainMap');
	//require('datetimepicker');
	var my97Datepicker = require('my97Datepicker');
	var queryResPolygons = []; //查询后绘制至地图的施工区域集合
	var constMarkers = [];
	var oldQ = '1';
	var opts = new IMAP.MarkerOptions();
	opts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var icon_const = new IMAP.Icon("./assets/images/sgzd.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var dutyGridPolygon = null; 
	//在地图中添加MouseTool插件
	var mousetool = null, infowindow = null;
	var visualContent ="<div style='height:270px'>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>施工类型</span> <input type='text' class='form-control' value='{0}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>施工内容</span> <input type='text' class='form-control' value='{1}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>发生时间</span> <input type='text' class='form-control' value='{2}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>结束时间</span> <input type='text' class='form-control' value='{3}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>施工单位</span> <input type='text' class='form-control' value='{4}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>建设单位</span> <input type='text' class='form-control' value='{5}' disabled></div>" +
	"<div class='input-group input-group-sm'><span class='input-group-addon'>所属中队</span> <input type='text' class='form-control' value='{6}' disabled></div>" +
	"</div>";
	
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.PolygonTool();
		mousetool.autoClose = true;//是否自动关闭绘制
		map.addTool(mousetool);
	});
    var clearQueryResPolygons = function(){
    	if(queryResPolygons.length > 0){
    		for (var t = 0; t < queryResPolygons.length; t++) {
				var ele = queryResPolygons[t];
				map.getOverlayLayer().removeOverlay(ele);
			}
    	}
    	if(constMarkers.length > 0){
    		for (var t = 0; t < constMarkers.length; t++) {
				var ele = constMarkers[t];
				map.getOverlayLayer().removeOverlay(ele);
			}
    	}
    	if(infowindow){
    		map.getOverlayLayer().removeOverlay(infowindow);
    	}
    	queryResPolygons = [];
    }
    var setInfoWindow = function(data,lnglat,ishow){
    	var title="施工占道  " + data.typeDesc;
    	var content = visualContent.replace("{0}",data.typeDesc).replace("{1}",data.content?data.content:"")
    		.replace("{2}",data.startDt).replace("{3}",data.endDt).replace("{4}",data.implementUnit).replace("{5}",data.constructionUnit)
    		.replace("{6}",data.teamDesc);
    	infowindow = new IMAP.InfoWindow(content,{
    		size : new IMAP.Size(320,270),
			title: title,
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
	
	
	var constOccupApp = null;
	var dutyGridPolygonOthers = [];
	var infoLabelOthers = [];
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		constOccupApp = new Vue({
			el: '#constOccup-panel',
			data: {
				constOccupQ: {}, //查询参数
				constOccup: {region:'',type:''},
				//constOccupNew: {team:'',aor:''},
				newGridPolygon:[],
				dictList:[],
				teamList:[],
				dutyGridList:[],
				isTeam:false,
				selectedRow:{},
				dutyStatus:[],
				unionDeptList:[],
				dutyGridOtherList:[],
				dynTeamList:[],
				isZdUsr: currentUser.jjzdUser,
				isEditOpt: false,
				isOverdue:22,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0  //判断当前用户是否有中队管理员权限，如果没有，只能进行查询操作。
			},
			watch:{
				dictList:'loadMultiselect'
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#typeId').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#worktype').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#status').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				initAddControls: function(){
					//clearQueryResPolygons();
					constOccupApp.loadUnionDeptList();
					//初始化责任区
					constOccupApp.showOtherDutyGrids();
					$("#applyDt").val("");
					$("#worktype").selectpicker('val',"");
					constOccupApp.dynTeamList = [];
					constOccupApp.isEditOpt = false;
					constOccupApp.addRow();
				},
				loadUnionDeptList:function(selectedVal){
					$('#unionDept').selectpicker('destroy'); 
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#unionDept').selectpicker({
							noneSelectedText:'请选择',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						/*if(constOccupApp.constOccup.unionDept && constOccupApp.constOccup.unionDept.length>0){
							var unionDept = constOccupApp.constOccup.unionDept.split(',');
							$("#unionDept").selectpicker('val', unionDept);
						}*/
						if(selectedVal && selectedVal.length>0){
							var unionDept = selectedVal.split(',');
							$("#unionDept").selectpicker('val', unionDept);
						}else{
							$("#unionDept").selectpicker('val', '');
						}
					});
					
				},
				query: function () {
					constOccupApp.reload();
				},
				reset: function () {
					queryResPolygons = [];
					map.getOverlayLayer().clear();
				},
				add: function () {
					constOccupApp.constOccup = {isNewRecord:true};
				},
				drawDutyGrid: function(){
					var aor = $("#girdId").val();//constOccupApp.constOccup.aor
					var team = $("#asignGroupId").val();//constOccupApp.constOccup.team
					var url = "./qw/dutyGrid/getDutyAreaByGroupIdAndDutyId?teamId="+team+"&girdId="+aor;
					$.ajax({
						type: "GET",
					    url: url,
					    success: function(rslt){
					    	if(rslt.code === 200){
					    		var dutyGrid = rslt.dutyGrid;
					    		if(dutyGridPolygon){
									map.getOverlayLayer().removeOverlay(dutyGridPolygon);
								}
								dutyGridPolygon = null; 
								if(dutyGrid){
									var polygonPath = TUtils.polygonStr2Path(dutyGrid.shape);
									dutyGridPolygon = new IMAP.Polygon(polygonPath, TConfig.V.dutyGridPolygonOpt);
									dutyGridPolygon.data = dutyGrid;
						        	map.getOverlayLayer().addOverlay(dutyGridPolygon, false);
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				edit: function () {
					constOccupApp.isEditOpt = true;
					//初始化责任区
					constOccupApp.showOtherDutyGrids();
					clearQueryResPolygons();
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					//显示详细信息
					var rowData = $("#jqGrid").jqGrid('getRowData', id);
					constOccupApp.showOneconstOccup(rowData);
		    		
					$.ajax({
					    url: "./jtzx/construction/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								constOccupApp.constOccupPageList = constOccupDetail;
								if(!rslt.construction.region){
									rslt.construction.region = "";
								}
								constOccupApp.constOccup = rslt.construction;
								$("#liEdit").show();
								$("#liEdit").addClass("active");
								$("#editB").show();
								$("#liQuery").hide();
								$("#liDetail").hide();
								$("#constOccupQuery").removeClass("tab-pane fade in active");
								$("#constOccupQuery").addClass("tab-pane fade");
								$("#constOccupDetail").removeClass("tab-pane fade");
								$("#constOccupDetail").addClass("tab-pane fade in active");
								$("#startDt").val(rslt.construction.startDt);
								$("#endDt").val(rslt.construction.endDt);
								$("#applyDt").val(rslt.construction.applyDt);
								$("#approveDt").val(rslt.construction.approveDt);
								$("#length").val(rslt.construction.length);
								$("#square").val(rslt.construction.square);
								$("#worktype").selectpicker('val',rslt.construction.type);
								constOccupApp.loadUnionDeptList(constOccupApp.constOccup.unionDept);
								constOccupApp.dynTeamList = [];
								var teamArry = constOccupApp.constOccup.team.split(";");
								var aorArry;
								if(constOccupApp.constOccup.aor){
									aorArry = constOccupApp.constOccup.aor.split(";");
								}
								
								for(var i=0;i<teamArry.length;i++){
									var obj = new Object();
									obj.teamList = constOccupApp.teamList;
									$.ajax({
										type: "get",
									    url: "./qw/dutyGrid/getDutyAreaByGroupId?teamId="+teamArry[i],
									    async:false,
									    success: function(rslt){
									    	if(rslt.code === 200){
									    		obj.dutyGridList = rslt.dutyGridList;
											}else{
												alert(rslt.msg);
											}
										}
									});
									
									obj.selectedTeam = teamArry[i];
									if(aorArry){
										obj.selectedAor = aorArry[i];
									}
									constOccupApp.dynTeamList.push(obj);
								}
								
								
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
					/*$("select[id^='groupId']").each(function(){
						$(this).rules("add", {
				    	    required: true,
				    	    messages: {
				    	        required: "请输入推荐词!"
				    	    }
				    	});
					});*/
					
				    //表单验证
				    $("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							var url = "./jtzx/construction/save";
							constOccupApp.constOccup.startDt=$("#startDt").val();
							constOccupApp.constOccup.endDt=$("#endDt").val();
							constOccupApp.constOccup.applyDt = $("#applyDt").val();
							constOccupApp.constOccup.approveDt = $("#approveDt").val();
							constOccupApp.constOccup.length = $("#length").val();
							constOccupApp.constOccup.square = $("#square").val();
							constOccupApp.constOccup.unionDept = $("#unionDept").val().toString();
							//constOccupApp.constOccup.team = constOccupApp.constOccupNew.team;
							//constOccupApp.constOccup.aor = constOccupApp.constOccupNew.aor;
							var teamArry = $("[name='team']").toArray();
							var team = "";
							$.each(teamArry, function(i,item){
								team = team + item.value + ";";
							});
							if(team != ""){
								constOccupApp.constOccup.team = team.substring(0,team.length-1);
							}else{
								constOccupApp.constOccup.team = team;
							}
							
							var aorArry = $("[name='aor']").toArray();
							var aor = "";
							$.each(aorArry, function(i,item){
								//if(item.value != ''){
									aor = aor + item.value + ";";
								//}
							});
							if(aor != ""){
								constOccupApp.constOccup.aor = aor.substring(0,aor.length-1);
							}
							var isTeamNull = false;
							$("select[id^='groupId']").each(function(){
								if(!$(this).val() || $(this).val()==''){
									isTeamNull = true;
								}
							});
							
							var isDutyNull = false;
							if(currentUser.jjzdUser){
								$("select[id^='dutyGrid']").each(function(){
									if(!$(this).val() || $(this).val()==''){
										var curDutyGridInd = $(this).attr('id').substring(8,$(this).attr('id').length);
										if($("#groupId"+curDutyGridInd).val() == currentUser.group.groupId){
											isDutyNull = true;
											return false;
										}
									}
								});
							}
							
							var startDt = $("#startDt").val();
							var endDt = $("#endDt").val();
							var planStartDt = new Date(startDt.replace(/-/g,"/"));
							var planEndDt = new Date(endDt.replace(/-/g,"/"));
							
							if(isTeamNull){
								alert("请选择施工所属中队");
							}else if(isDutyNull){
								alert("请选择您所属中队的责任区");
							}else{
								if(planStartDt<=planEndDt){
									$.ajax({
										type: "POST",
									    url: url,
									    data: JSON.stringify(constOccupApp.constOccup),
									    success: function(rslt){
									    	if(rslt.code === 200){
												alert('操作成功', function(index){
													constOccupApp.reload();
													//layer.closeAll('page');
												});
											}else{
												alert(rslt.msg);
											}
										}
									});
						            return false;//已经用AJAX提交了，需要阻止表单提交
								}else{
									layer.msg("施工结束时间必须在发生时间之后");
								}
								constOccupApp.teamList = [];
							}
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
						    url: "./jtzx/construction/purge/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									constOccupApp.reload();
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
				clearGrid: function(){
					if(constOccupApp.newGridPolygon){
						var gridArr = constOccupApp.newGridPolygon;
						for(var i=0;i<gridArr.length;i++){
							map.getOverlayLayer().removeOverlay(gridArr[i]);
						}
						constOccupApp.newGridPolygon = [];
						constOccupApp.constOccup.region = "";
					}
				},
				addGrid: function () {
					mousetool.open();
					var obj = mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						constOccupApp.newGridPolygon.push(evt.overlay);
						constOccupApp.constOccup.region = constOccupApp.constOccup.region +TUtils.polygonPath2Str(evt.overlay.getPath())+";";
						mousetool.close();
						//alert(evt.overlay.getBounds().getCenter().toString());
						//constOccupApp.getTeamAndGridByCenterLnglat(evt.overlay.getBounds().getCenter().toString());
						if(obj){
							mousetool.removeEventListener(obj);
						}
					},this);
				},
				clearOtherDutyGrids: function(){
	    			for (var i = 0; i < dutyGridPolygonOthers.length; i++) {
	    				map.getOverlayLayer().removeOverlay(dutyGridPolygonOthers[i]);
	    			}
	    			for (var i = 0; i < infoLabelOthers.length; i++) {
	    				map.getOverlayLayer().removeOverlay(infoLabelOthers[i]);
	    			}
					dutyGridPolygonOthers = [];
					infoLabelOthers = [];
				},
				showOtherDutyGrids: function () {
					constOccupApp.clearOtherDutyGrids();
					var param = "";
					if(currentUser.jjddUser){
						param = "groupId="+($("#groupId").val()==null?'':$("#groupId").val());
					}else{
						param = "groupId="+currentUser.group.groupId;
					}
					var url = "qw/dutyGrid/findOtherList?"+param;
				    $.get(url, function(r){
						if(r.code == 200){
							constOccupApp.dutyGridOtherList = r.dutyGridOtherList;
							if(constOccupApp.dutyGridOtherList.length == 0){
								layer.msg("尚未添加勤务社区");
								return;
							}
							for(var idx =0; idx < constOccupApp.dutyGridOtherList.length; idx++){
								var dutyGridOther = constOccupApp.dutyGridOtherList[idx];
								var polygonPathOther = TUtils.polygonStr2Path(dutyGridOther.shape);
								var polygonOpt = {
										'editabled': false,
										"fillColor" : '#000000',
										"fillOpacity " : 1,
										"strokeColor  " : '#8B7B8B',
										"strokeOpacity" : 0.1,
										"strokeWeight" : 0.1,
										"strokeStyle" : "dashed",
									};
								polygonOpt.fillColor = dutyGridOther.fillColor;
								var dutyGridPolygonOther = new IMAP.Polygon(polygonPathOther, polygonOpt);
								dutyGridPolygonOther.data = dutyGridOther;
								map.getOverlayLayer().addOverlay(dutyGridPolygonOther, false);
								dutyGridPolygonOthers.push(dutyGridPolygonOther);
								
								var infoLabel = new IMAP.Label(dutyGridOther.group.groupName+"<br/>"+dutyGridOther.gridName, {
									position : dutyGridPolygonOther.getBounds().getCenter(),// 基点位置
									offset: new IMAP.Pixel(0,-25),//相对于基点的位置
									anchor : IMAP.Constants.BOTTOM_CENTER,
									fontSize : 6,
									fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
									fontColor : "#222222"
								});
								map.getOverlayLayer().addOverlay(infoLabel, false);
								infoLabelOthers.push(infoLabel);
							}
						}else{
							alert(r.msg);
						}
					});
				},
				addRow: function() {
					//var s = $("#dynTeamRow");
					var obj = new Object();
					obj.teamList = constOccupApp.teamList;
					obj.dutyGridList = "";
					constOccupApp.dynTeamList.push(obj);
				},
				delRow: function() {
					constOccupApp.dynTeamList.pop();
				},
				getDutyListByTeamId: function(selectedVal) {
					//初始化责任区
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+selectedVal.target.value, function(r){
						if(r.code == 200){
							constOccupApp.dutyGridList = r.dutyGridList;
							var index = selectedVal.target.id.substring(selectedVal.target.id.length-1,selectedVal.target.id.length)
							var obj = constOccupApp.dynTeamList[index];
							obj.dutyGridList = r.dutyGridList;
						}else{
							alert(r.msg);
						}
					});
				},
				showOneconstOccup: function (constOccup) {
					if(constOccup.region){
						var regionArry = constOccup.region.split(";")
						$.each(regionArry, function(i,item){
							var polygonPath = TUtils.polygonStr2Path(item);
							var polygon = new IMAP.Polygon(polygonPath, {
				    			"fillColor" : "#000000",
				    			"fillOpacity " : 0.1,
				    			"strokeColor  " : "#8B7B8B",
				    			"strokeOpacity" : 0.5,
				    			"strokeWeight" : 0.0,
				    			"strokeStyle" : "dashed",
				    			});
				    		polygon.data = constOccup;
				    		queryResPolygons.push(polygon);
				    		map.getOverlayLayer().addOverlays(polygon, false);
				    		
				    		var point = new IMAP.Marker(polygon.getBounds().getCenter(), opts);
				    		point.setIcon(icon_const);
							point.data = constOccup;
							constMarkers.push(point);
							map.getOverlayLayer().addOverlay(point, false);
						});
					}
				},
				gridSearch:function(){
					if(constOccupApp.newGridPolygon){
						var polygonPath = constOccupApp.newGridPolygon.getPath();
						var polygonPathStr= TUtils.polygonPath2Str(polygonPath);
						var url = "map/map/findPoiInPolygon?polygon="+polygonPathStr;
						$.ajax({
							url: url,
							success: function(rslt){
								if(rslt.code == 200){
									mapPoiContainer = rslt.mapPoiContainer;
									var cycleInnerObjCnt = 0 ;
									layer.msg('半径'+globalPoiCycle.getRadius()+'米范围内查询到'+cycleInnerObjCnt+'个对象');
								}else{
									alert(rslt.msg);
								}
							}
						});
						}
				},
				reload: function () {
					$("#liDetail").removeClass("active");
					$("#liQuery").addClass("active");
					$("#liEdit").hide();
					$("#editB").hide();
					$("#liQuery").show();
					$("#liDetail").show();
					//$("#liAssign").hide();
					$("#constOccupDetail").removeClass("tab-pane fade in active");
					$("#constOccupDetail").addClass("tab-pane fade");
					$("#constOccupQuery").removeClass("tab-pane fade");
					$("#constOccupQuery").addClass("tab-pane fade in active");
					constOccupApp.constOccup = {region:'',type:''};
					constOccupApp.reset();
					$("#startDt").val("");
					$("#endDt").val("");
					loadJqGrid();
				},
				close: function() {
					constOccupApp.reset();
					itsGlobal.hideLeftPanel();
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd HH:mm:ss'});
				}
			}
		});
		
		$("input[name='isOverdues']").click(function () { 
			var aaa = $("#isOverdues").prop("checked");
			if(aaa){
				constOccupApp.isOverdue = '11';
			}else{
				constOccupApp.isOverdue = '22';
			}
			constOccupApp.reload();
	    })
	    oldQ=1;
		loadJqGrid();
		
		initPage();
		
		vueEureka.set("leftPanel", {
			vue: constOccupApp,
			description: "constOccup的vue实例"
		});
	};
	
	var rightClick = function(e) {
		//右键菜单
		var contextMen = '<div class="self-menu"><span class="detailspan callVideo" >周边监控</span></div>';
				
		CustomContextMenu.setContent(contextMen,e,100,20);
		$(".callVideo").bind("click",function(){
			CustomContextMenu.close();
			var lnglat = new IMAP.LngLat(e.target.f._latlng.lng, e.target.f._latlng.lat);
			$.ajax({
			    url:'./map/map/findVideoInCycle?lnglat='+lnglat+'&radius=100',
			    success:function(rslt){
			        if(rslt.code == 200){
			        	var tunnels="";
			        	var videoCameraList = rslt.mapPoiContainer.videoCameraList
			        	for (var ind = 0; ind < videoCameraList.length; ind++) {
							var oneData = videoCameraList[ind];
							tunnels = tunnels+","+oneData.tunnel;
						}
			        	if(!tunnels){
			        		layer.msg("该点范围内无监控设备");
						} else {
							require(['layers/camera/camera'],function(camera){
								camera.clear();
								camera.showLayer(true, videoCameraList);
								camera.playWinVideo(tunnels);
							});
						}
			        }else{
				    	layer.msg("查询失败！");
			        }
			    },
			    error:function(xhr,textStatus){
			    	layer.msg("查询失败！");
			    }
			});
		});
	}
	
	var initPage = function(){
		$.get("./sys/dict/getDictList?type="+"const_occup_type", function(r){
			if(r.code == 200){
				constOccupApp.dictList = r.dictList;
			}else{
				alert(r.msg);
			}
		});
		
		$.get("./sys/dict/getDictList?type="+"duty_status", function(r){
			if(r.code == 200){
				constOccupApp.dutyStatus = r.dictList;
			}else{
				alert(r.msg);
			}
		});
		
		// 联合审批部门
		$.get("./sys/dict/getDictList?type="+"UNION_DEPT", function(r){
			if(r.code == 200){
				constOccupApp.unionDeptList = r.dictList;
			}else{
				alert(r.msg);
			}
		});
		
		//初始化中队下拉框
		$.get("./aa/group/getAllTeams", function(r){
			if(r.code == 200){
				constOccupApp.teamList = r.teamList;
				var obj = new Object();
				obj.teamList = r.teamList;
				obj.dutyGridList = "";
				constOccupApp.dynTeamList.push(obj);
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadJqGrid = function() {
		map.getOverlayLayer().clear();
		var postDataTmp = {'typeId': $("#typeId").val(),'startTime': $("#startTime").val(),
				'endTime': $("#endTime").val(),'status':$("#status").val(),'isOverdue':constOccupApp.isOverdue};
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
			oldQ = JSON.parse(JSON.stringify(postDataTmp));
			$('#jqGrid').jqGrid('GridUnload');
			$("#jqGrid").jqGrid({
				url: "./jtzx/construction/pageData",
				datatype: "json",
				postData: postDataTmp,
				colModel: [
				           { label: 'id', name: 'id', width: 30, key: true, hidden:true },
				           { label: 'region', name: 'region', width: 30, hidden:true },
				           {label: '所属中队',name: 'teamDesc',width : 35,sortable : false, formatter: function(value, options, row){
				        	   return value ? value: '-';
				           }}, 
				           { label: '类型', name: 'typeDesc', width: 25, sortable:false , formatter: function(value, options, row){
				        	   return value ? value: '-';
				           }},
				           { label: '内容', name: 'content',  width: 45},
				           { label: '开始时间', name: 'startDt',  width: 50, sortable:false, formatter: function(value, options, row){
				        	   return value ? value: '-';
				           }},
				           { label: '结束时间', name: 'endDt',  width: 50, sortable:false, formatter: function(value, options, row){
				        	   return value ? value: '-';
				           }},
				           { label: '状态', name: 'statusDesc',  width: 25, sortable:false, formatter: function(value, options, row){
				        	   return value ? value: '-';
				           }},
				           { label: '施工单位', name: 'implementUnit',  width: 45,hidden:true},
				           { label: 'type', name: 'type',  width: 45,hidden:true},
				           { label: 'team', name: 'team',  width: 45,hidden:true},
				           { label: '建设单位', name: 'constructionUnit',  width: 45,hidden:true},
				           { label: 'status', name: 'status',  width: 45,hidden:true},
				           { label: 'approveDt', name: 'approveDt',  width: 45,hidden:true},
				           { label: 'aor', name: 'aor',  width: 45,hidden:true},
				           { label: 'constStatus', name: 'constStatus',  width: 45,hidden:true},
				           { label: '请求配合内容', name: 'coordination',  width: 45,hidden:true}
				           ],
				           viewrecords: true,
				           height: 260,
				           rowNum: 10,
				           rowList : [10,30,50],
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
				        	   layer.msg("加载完毕");
				           },
				           gridComplete:function(){
				        	   var ids = $("#jqGrid").getDataIDs();
				        	   for(var i = 0;i<ids.length;i++){
				        		   var rowData = $("#jqGrid").getRowData(ids[i]);
				        		   if(rowData.constStatus){
				        			   if(rowData.constStatus.indexOf("0") == -1){
				        				   //已确认
				        				   //$('#' + rowData.id).find("td").style.color ='';
				        			   }else if(rowData.constStatus.indexOf("1") == -1){
				        				   //未确认
				        				   $('#' + rowData.id).find("td").addClass("constUnprocessed");
				        			   }else{
				        				   //部分确认
				        				   $('#' + rowData.id).find("td").addClass("constPartProcessed");
				        			   }
				        		   }
				        	   }
				        	   
				        	   //隐藏grid底部滚动条
				        	   $("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
				           },
				           /*ondblClickRow: function(rowid, iRow, iCol, e){
	        	constOccupApp.edit();
	        },*/
				           onSelectRow: function(rowid, status){//选中某行
				        	   var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				        	   //rowData.qwType = '7';  // 该模块的关联统一是"施工路段"类型
				        	   constOccupApp.selectedRow = rowData;
				        	   
				        	   //显示详细信息
				        	   for (var t = 0; t < queryResPolygons.length; t++) {
				        		   var poly = queryResPolygons[t];
				        		   if(rowData.id == poly.extData.id){
				        			   var center = poly.getBounds().getCenter();
				        			   map.setCenter(center,18);
				        			   if(status){
				        				   poly.setAttribute({"fillColor":"#FF0000"});
				        				   //setInfoWindow(rowData,center,true);
				        			   }else{
				        				   poly.setAttribute({"fillColor":"#000000"});
				        				   //setInfoWindow(rowData,center,false);
				        			   }
				        		   }
				        	   }
				           }
			});
		}
	    
	    //在地图上显示全部的区域
	    $.ajax({
		    url:'./jtzx/construction/queryByTypeAndTimeDirectly?type='+$("#typeId").val()+"&startDt="+$("#startTime").val()+"&endDt="+$("#endTime").val()+"&isOverdue="+constOccupApp.isOverdue,
			type:'GET', 
		    contentType: "application/json",    
		    success:function(dat){
		        if(dat.code == 200){
		        	clearQueryResPolygons();
		        	var queryList = dat.list;
		        	for (var ind = 0; ind < queryList.length; ind++) {
						var oneData = queryList[ind];
						if(oneData.region){
							var regionArry = oneData.region.split(";")
							$.each(regionArry, function(i,item){
								var polygonPath =TUtils.polygonStr2Path(item);
					    		var polygon = new IMAP.Polygon(polygonPath, {
					    			"fillColor" : "#000000",
					    			"fillOpacity " : 1,
					    			"strokeColor  " : "#8B7B8B",
					    			"strokeOpacity" : 0.5,
					    			"strokeWeight" : 0.0,
					    			"strokeStyle" : "dashed",
					    		});
					    		polygon.extData = oneData;
					    		queryResPolygons.push(polygon);
					    		//鼠标移入
					    		polygon.addEventListener(IMAP.Constants.MOUSE_DOWN, function(e){
					    			//alert("test");
					    			var center = e.target.getBounds().getCenter();
					    			map.setCenter(center);
									var data = e.target.extData;
									setInfoWindow(data,center,false);
					    		});
					    		
					    		//显示施工图标
					    		var point = new IMAP.Marker(polygon.getBounds().getCenter(), opts);
					    		point.setIcon(icon_const);
								point.data = oneData;
								if($.inArray("zdadmin",currentUser.roleIdList) >= 0){
									point.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
								}
								constMarkers.push(point);
								map.getOverlayLayer().addOverlay(point, false);
							});
						}
					}
		        	map.getOverlayLayer().addOverlays(queryResPolygons, false);
		        }
		    },
		    error:function(xhr,textStatus){
		    	layer.msg("区域查询失败！");
		    }
		});
	    
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	};

	var hide = function() {
		itsGlobal.hideLeftPanel();
	};

	var renderQwData = function(dataList){
		clearQueryResPolygons();
		if(dataList){
			for(var i = 0; i < dataList.length; i++){
				var data = dataList[i];
				if(data && data.region){
					var regionArry = data.region.split(";")
					$.each(regionArry, function(i,item){
						var polygonPath = TUtils.polygonStr2Path(item);
						var polygon = new IMAP.Polygon(polygonPath, {
							"fillColor" : "#000000",
							"fillOpacity " : 1,
							"strokeColor  " : "#8B7B8B",
							"strokeOpacity" : 0.5,
							"strokeWeight" : 0.0,
							"strokeStyle" : "dashed",
							});
						polygon.data = data;
						queryResPolygons.push(polygon);
						polygon.addEventListener(IMAP.Constants.CLICK, function(e){
							var center = e.target.getBounds().getCenter();
							var data = e.target.data;
							setInfoWindow(data,center,false);
						});
						var point = new IMAP.Marker(polygon.getBounds().getCenter(), opts);
			    		point.setIcon(icon_const);
						point.data = data;
						constMarkers.push(point);
						map.getOverlayLayer().addOverlay(point, false);
					});
			    	map.getOverlayLayer().addOverlays(queryResPolygons, false);
				}
			}
			layer.msg('加载了 '+dataList.length+" 个施工占道数据");
		}
	};
	
	return {
		show : show,
		hide : hide,
		renderQwData:renderQwData
	};
})