define(function(require) {
	var htmlStr = require('text!./pressureIncidentPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var polyline,gjPolyline;
	
	require('my97Datepicker');
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#pressureIncident-panel',
			data: {
				showList: true, //显示查询
				pressureIncidentQ: {groupId:(currentUser.jjzdUser? currentUser.group.groupId :'')}, //查询参数
				pressureIncident: {groupId:"",roadId:""},
				groupListQ:[],
				teamList:[],
				roaddrawList:[],
				roaddrawListQ:[],
				rd:{},
				ddList:[],
				gridPoliceList:[],
				plPtah:"",
				isZdUsr: currentUser.jjzdUser,
				isDdUsr: currentUser.jjddUser,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0  //判断当前用户是否有中队管理员权限，如果没有，只能进行查询操作。
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#groupIdQ').selectpicker({
							noneSelectedText:'所有',
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
					vm.pressureIncidentQ = {};
					$("#qwStart").val("");
					$("#qwEnd").val("");
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					$("#qwStart").val("");
					$("#qwEnd").val("");
					vm.pressureIncident = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "qw/pressureIncident/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.pressureIncident = rslt.pressureIncident;
								$("#qwStart").val(vm.pressureIncident.qwStart);
								$("#qwEnd").val(vm.pressureIncident.qwEnd);
								$("#groupId").selectpicker('val', vm.pressureIncident.groupId);
								vm.getDutyListByTeamId();
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				saveSe: function () {
					for (var i = 0; i < vm.ddList.length; i++) {  
						vm.ddList[i].piid=vm.rd.id;
					}
					var url = "qw/pressureIncident/saveSe";
					$.ajax({
						type: "POST",
						url: url,
						data:  JSON.stringify(vm.ddList),
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功', function(index){
									layer.closeAll();
									vm.reload();
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				getQwSch: function (){
					require(['riSchedule/initRiSchedule'],function(riSchedule){
						riSchedule.show();
					});
				},
				save: function () {
					//表单验证
					vm.pressureIncident.qwStart=$("#qwStart").val();
					vm.pressureIncident.qwEnd=$("#qwEnd").val();
					
					
					$("#detailForm").validate({
						invalidHandler : function(){//验证失败的回调
							return false;
						},
						submitHandler : function(){//验证通过的回调
							if(!vm.pressureIncident.roadId){
								alert("道路不能空！");
								return;
							}
							var pattern=/^[0-9]*$/;
							var mystr = vm.pressureIncident.qwTimes.replace(/，/g, ',');
							var sz=mystr.split(",");
							for(var i = 0; i < sz.length; i++){
								var ss=sz[i].split("-");
								var s1=ss[0].replace('时', '');
								if(!pattern.test(s1)){
									alert("勤务时间格式有误，请重新填写！");
									return;
								}
								if(s1 <0 || s1> 23){
									alert("勤务时间格式有误，请重新填写！");
									return;
								}
								var s2=ss[1].replace('时', '');
								if(!pattern.test(s2)){
									alert("勤务时间格式有误，请重新填写！");
									return;
								}
								if(s2 <0 || s2> 23){
									alert("勤务时间格式有误，请重新填写！");
									return;
								}
							}
							/*if(!pattern.test(mystr.charAt(0))){
								
							}*/
							var url = "qw/pressureIncident/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.pressureIncident),
								success: function(rslt){
									if(rslt.code == 200){
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
				del: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除(使失效)？', function(){
						$.ajax({
							type: "POST",
							url: "qw/pressureIncident/delete/"+id,
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
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "qw/pressureIncident/purge/"+id,
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
				getQwPath: function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					/*$.ajax({
					    url: "./jtzx/roaddraw/detail/"+vm.rd.roadId,
					    success: function(rslt){
							if(rslt.code == 200){
								var oneData = rslt.roaddraw;
								vm.showPolyline(oneData);
								vm.plPtah= oneData.region;
								$.get("qw/dutyGrid/roadIdGrId?roadId="+vm.rd.roadId, function(r){
									if(r.code == 200){
										vm.gridPoliceList=r.dutyGrids;
									}
								});
					    		
							}else{
								alert(rslt.msg);
							}
						}
					});*/
					$.ajax({
						url: "./qw/piSchedule/allData?piid="+vm.rd.id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.ddList = rslt.piScheduleList;
								if(vm.ddList.length == 0){
									vm.ddList = getDayAll(vm.rd.qwStart,vm.rd.qwEnd);
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
					
					layer.open({
						type: 1,
						skin: 'layui-layer',
						title: ["勤务排班 : "],
						area: ['400px', '280px'],
						/*offset: ['100px', '580px'],*/
						shade: false,
						shadeClose: true, //点击遮罩关闭层
						content: jQuery("#SplitStaticDiv"),
						btn: [],
						end:function(index){             
							var retVal = $("#layerResult").val();             
							if(retVal=='0'){//0通过   
							}else{             
								//vm.cleanPlony();
							}  
						}

					});
					
				},
				showPolyline: function (oneData) {
					if(polyline){
						map.getOverlayLayer().removeOverlay(polyline);
					}
					var polygonPath = TUtils.polygonStr2Path(oneData.region);
		        	var plo = new IMAP.PolylineOptions();
		        	plo.strokeColor = "red";
		        	plo.strokeOpacity = "1";
		        	plo.strokeWeight = "6";
		        	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
		        	polyline = new IMAP.Polyline(polygonPath, plo);
		        	map.getOverlayLayer().addOverlay(polyline, false);
		    		map.setCenter(polyline.getBounds().getCenter(),14);
				},
				reload: function () {
					vm.showList = true;
					loadJqGrid();
				},
				rdget: function () {
					loadRoad();
				},
				showTrackSearchJwt: function(policeNo){
					if(gjPolyline){
						map.getOverlayLayer().removeOverlay(gjPolyline);
					}
					for (var i = 0; i < tracemarkers.length; i++) {
						map.getOverlayLayer().removeOverlay(tracemarkers[i]);
					}
					//清除聚合图
					tracemarkers = [];
					var startDt = vm.rd.qwStart+" 00:00:00";
					var endDt = vm.rd.qwEnd+" 23:59:59";
					var url= "jw/gpsDevice/trackSearch?startDt="+startDt+"&endDt="
					+endDt+"&policeNo="+policeNo+"&lines="+vm.plPtah;
					$.ajax({
						type: "GET",
					    url: url,
					    success: function(rstl){
					    	if(rstl.code === 200){
								var dataList = rstl.gpsDeviceList;
								if(dataList.length === 0){
									alert("未查询到相关轨迹信息！");
								}else{
									drawTrack(dataList);
								}
							}else{
								alert(rstl.msg);
							}
						}
					});
				},
				getGridPolice: function (){
					if(vm.pressureIncident.roadId){
						
						$.get("qw/dutyGrid/roadIdGrId?roadId="+vm.pressureIncident.roadId, function(r){
							if(r.code == 200){
								var dg=r.dutyGrids;
								if(dg.length !=0){
									var userNames=[];
									for(var i = 0;i<dg.length;i++){
										userNames.push(dg[i].userNames);
									}
									$("#gridPolice").val(userNames.toString());
									vm.pressureIncident.gridPolice= userNames.toString();
								}else{
									$("#gridPolice").val("");
									vm.pressureIncident.gridPolice= "";
									alert("该路段没有分配责任区");
								}
							}
						});
					}
				},
				getDutyListByTeamId: function() {
					var gid=vm.pressureIncident.roadId;
					$.get("jtzx/roaddraw/allData?groupId="+vm.pressureIncident.groupId, function(r){
						if(r.code == 200){
							vm.roaddrawList = r.roaddrawList;
							var refreshGridId = setInterval(function(){
								$('#roadId').selectpicker('refresh');
								var a = $('#roadId option').text();
								var arr = $('#ze_ren_qu div li a');
								if(arr.length <=1){
									clearInterval(refreshGridId);
									$("#roadId").selectpicker('val', gid);
									vm.pressureIncident.roadId=gid;
								}else{
									var b = arr[1].innerText;
									if(!b){
										clearInterval(refreshGridId);
										return;
									}
									if(a.indexOf(b)>=0){
										clearInterval(refreshGridId);
										$("#roadId").selectpicker('val', gid);
										vm.pressureIncident.roadId=gid;
									}
								}
							}, 10);
						}else{
							alert(r.msg);
						}
					});
				},
				cleanPlony:function (){
					if(gjPolyline){
						map.getOverlayLayer().removeOverlay(gjPolyline);
					}
					if(polyline){
						map.getOverlayLayer().removeOverlay(polyline);
					}
					for (var i = 0; i < tracemarkers.length; i++) {
						map.getOverlayLayer().removeOverlay(tracemarkers[i]);
					}
					//清除聚合图
					tracemarkers = [];
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		$("#qwStartQ").val(getStart());
		$("#qwEndQ").val(getEnd());
		vm.loadMultiselect();
		loadJqGrid();
		loadGroups();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "pressureIncidentPanel的vue实例"
		});
	}
	
	var getDayAll = function(begin,end){
        var dateAllArr = new Array();
        var ab = begin.split("-");
        var ae = end.split("-");
        var db = new Date();
        db.setUTCFullYear(ab[0], ab[1]-1, ab[2]);
        var de = new Date();
        de.setUTCFullYear(ae[0], ae[1]-1, ae[2]);
        var unixDb=db.getTime();
        var unixDe=de.getTime();
        for(var k=unixDb;k<=unixDe;){
            dateAllArr.push({dt:getDateStr(new Date(parseInt(k))),policeName:""});
            k=k+24*60*60*1000;
        }
        return dateAllArr;
    }
	
	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
					vm.teamList =r.groupList;
					vm.groupListQ = JSON.parse(JSON.stringify(r.groupList));
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#groupId').selectpicker({
							noneSelectedText:'请选择',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#roadId').selectpicker({
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
	var loadRoad = function() {
	    $.get("jtzx/roaddraw/allData?groupId="+vm.pressureIncident.groupId, function(r){
			if(r.code == 200){
					vm.roaddrawList =r.roaddrawList;
					vm.roaddrawListQ = JSON.parse(JSON.stringify(r.roaddrawList));
					
			}else{
				alert(r.msg);
			}
		});
	}
	
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		vm.pressureIncidentQ.qwStart=$("#qwStartQ").val();
		vm.pressureIncidentQ.qwEnd=$("#qwEndQ").val();
		var postDataTmp = vm.pressureIncidentQ;
		$("#jqGrid").jqGrid({
			url: "qw/pressureIncident/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '所属中队', name: 'groupName', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '道路Id', name: 'roadId', width: 10, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '道路名称', name: 'roadName', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '勤务时间段', name: 'qwTimes', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '勤务开始日期', name: 'qwStart', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '勤务结束日期', name: 'qwEnd', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '警员/警辅', name: 'gridPolice', width: 80, sortable:false}
			],
			viewrecords: true,
			height: 290,
			rowNum: 15,
			rowList : [15,30,50],
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
			ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
	        },
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				vm.rd =rowData;
			}
		});
	};
	
	/*var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.CENTER;
	var tracemarkers=[];
	var drawTrack = function(dataList){
		var inglatarr = [];
		for(var i = 0;i<dataList.length;i++){
			var police = dataList[i];
			var lot;
			if(police.longitude.substring(8,9) == 0){
				 lot = police.longitude.substring(0,8);
			}else{
				 lot = police.longitude.substring(0,9);
            }
			
			var lat;
			if(police.latitude.substring(7,8) == 0){
				lat = police.latitude.substring(0,7);
			}else{
				lat = police.latitude.substring(0,8);
            }
			var d = police.gpsUpdateDt.split(" ");;
			var str =d[1].split(":")[0];
			var f= vm.rd.qwTimes;
			if(!(f.indexOf(str) != -1)){
				continue; 
			}
			var lnglat = new IMAP.LngLat(police.longitude,police.latitude);
			inglatarr.push(lnglat);
			markerOpts.icon = new IMAP.Icon("./assets/images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
			var marker = new IMAP.Marker(lnglat, markerOpts);
			//marker.data = police;
			map.getOverlayLayer().addOverlay(marker, false);
			//marker.setLabel("["+(i+1)+"] ", IMAP.Constants.BOTTOM_CENTER, new IMAP.Pixel(0,-25));
			marker.setLabel(police.gpsUpdateDt);
			tracemarkers.push(marker);
		}
		if(tracemarkers.length == 0){
			alert("未查询到相关轨迹信息！");
		}
		var opt = new IMAP.PolylineOptions();
		opt.strokeColor = "#33cc99";
		opt.strokeOpacity = "1";
		opt.strokeWeight = "3";
		opt.strokeStyle = IMAP.Constants.OVERLAY_LINE_DASHED;//虚线
		opt.strokeStyle = "1";
		opt.arrow = true;
		gjPolyline = new IMAP.Polyline(inglatarr, opt);
		map.getOverlayLayer().addOverlay(gjPolyline, false);
		map.setCenter(gjPolyline.getBounds().getCenter(),14);
	}*/
	
	var today=new Date();
	var weekday=today.getDay();

	if(weekday ==0){
		weekday=7;
	}
	    
	var monday=new Date(1000*60*60*24*(1-weekday) + today.getTime());    
	var sunday=new Date(1000*60*60*24*(7-weekday) + today.getTime());


	function getDateStr(dd){
	    var y = dd.getFullYear();
	    
	    var m = dd.getMonth()+1;//获取当前月份的日期
	    m=parseInt(m,10);
	    if(m<10){
	        m="0"+m;
	    }
	    
	    var d = dd.getDate();
	    d=parseInt(d,10);
	    if(d<10){
	        d="0"+d;
	    }
	    
	    return y+"-"+m+"-"+d;
	}
	
	function getStart() {
		return getDateStr(monday);
	}
	
   function getEnd() {
		return getDateStr(sunday);
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})