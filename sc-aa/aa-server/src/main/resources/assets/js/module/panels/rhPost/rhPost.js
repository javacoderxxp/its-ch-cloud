define(function(require) {
	var htmlStr = require('text!./rhPost.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var oldQ = '1';
	require('jquery');
	require('my97Datepicker');
	var fullcalendar = require('fullcalendar');
	var fullcalendarZh = require('fullcalendarZh');
	var jqueryFileuploadIframe = require('jqueryFileuploadIframe');
	var jqueryFileuploadUiW = require('jqueryFileuploadUiW');
	var jqueryFileupload = require('jqueryFileupload');
	require('jqueryUI');
	var vm = null;
	//在地图中添加MouseTool插件
	var mousetool = null, infowindow = null;
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.MarkerTool(new IMAP.Icon(("assets/images/rhPost.png"), new IMAP.Size(32, 32)));
		mousetool.follow=true;
		mousetool.autoClose=true;
		mousetool.title="点击左键标注岗点";
		map.addTool(mousetool);
	});
	var rhMarker,rhMarkerArr=[],infowindow=null,policeMarkers=[],policeLines = [];
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#rhPost-panel',
			data: {
				showList: 0, //显示查询
				rhPostQ: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :''),status:"0"},  //交警大队查询所有，交警中队查询当前组
				rhPost: {group:{groupId:(currentUser.jjzdUser? currentUser.group.groupId :'')}},
				rhPostScheduleList:[],
				rhPostSchedule:{userId:'',userName:'', postType:'ZGF'},
				groupList:[], //中队列表
				groupUserList:[], //中队内部的用户列表
				selectedFilePath:"",
				previewUrl:"",
				showUploadBtns: false,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0,
				timer_getPolice:null,
				police_rhPostList:[],
				allRhPostList:[],
				fileUploadWidget:null,
				pg:{}
			},
			methods: {
				query: function () {
					vm.reload(true);
				},
				add: function () {
					vm.title="新增";
					vm.showList = 1;
					vm.rhPost = {isNewRecord:true, shape:'', postName:'',postType:'', group:{groupId:(currentUser.jjzdUser? currentUser.group.groupId :'')}};
					$("#postType").selectpicker('val', vm.rhPost.postType);
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "qw/rhPost/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = 1;
								vm.rhPost = rslt.rhPost;
								$("#groupId").selectpicker('val', vm.rhPost.group.groupId);
								if(vm.rhPost.postType ){
									var pts =vm.rhPost.postType;
									if(vm.rhPost.postType.indexOf(",")>0){
										pts = vm.rhPost.postType.split(",");
									}
									$("#postType").selectpicker('val',pts);
								}else{
									$("#postType").selectpicker('val','');
								}
								var status = vm.rhPost.status;
								if(status && status !=""){
									var tempTimer = setInterval(function(){
										$("input[name='customRadio'][value='" + status + "']").prop("checked", "checked");
										var val  = $("input[name='customRadio']:checked").val();
										if(val == status){
											clearInterval(tempTimer);
										}
									}, 50);
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
					//表单验证
//					vm.rhPost.expiryDate = $("#expiryDate").val();
//					vm.rhPost.startDate = $("#startDate").val();
					var status = $("input[name='customRadio']:checked").val();
					if(!status || status == ''){
						alert("请选择岗点的有效性！");
						return;
					}
					vm.rhPost.status = status;
					
					$("#detailForm").validate({
						invalidHandler : function(){//验证失败的回调
							return false;
						},
						submitHandler : function(){//验证通过的回调
							var url = "qw/rhPost/save";
							vm.rhPost.postType = $("#postType").selectpicker('val').join(',');
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.rhPost),
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
							url: "qw/rhPost/purge/"+id,
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
				reload: function (needRefresh) {
					vm.showList = 0;
					$("#rhPost-panel").css("width", "580px");
					if(TUtils.cmp(vm.rhPostQ,oldQ)){
						var postDataTmp = vm.rhPostQ;
						oldQ = JSON.parse(JSON.stringify(vm.rhPostQ));
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
						if(needRefresh && !(needRefresh instanceof MouseEvent)){
							loadJqGrid();
						}
					}
					$('#progress .bar').css('width', '0%');
			    	$('#uploadMsg').html('');
			    	
			    	vm.selectedFilePath='';
			    	this.clearPoliceRelate();
				},
				addRhPost: function () {
					vm.clearRhPost();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						rhMarker = evt.overlay;
						vm.rhPost.shape = TUtils.lnglat2Str(evt.overlay.getPosition());
						mousetool.close();

						var url = "jcsj/cross/getNearestCross?lng="+evt.overlay.getPosition().lng+"&lat="+evt.overlay.getPosition().lat;
					    $.get(url, function(r){
							if(r.code == 200){
								vm.rhPost.postName = r.cross.mc;
							}else{
								alert(r.msg);
							}
						});
					},this);
				},
				clearRhPost: function(){
					if(rhMarker){
						map.getOverlayLayer().removeOverlay(rhMarker);
					}
					rhMarker = null; 
					vm.rhPost.shape='';
				},
				clearPoliceRelate:function(){
					for(var i=0; i<policeMarkers.length; i++){
						if(policeMarkers[i]){
							map.getOverlayLayer().removeOverlay(policeMarkers[i]);
						}
					}
					for(var j=0; j<policeLines.length; j++){
						if(policeLines[j]){
							map.getOverlayLayer().removeOverlay(policeLines[j]);
						}
					}
					policeMarkers = [];
					policeLines = [];
				},
				showOneRhPost: function (rhPost,type) {
					this.clearPoliceRelate();
					for(var i=0; i<rhMarkerArr.length; i++){
						var rhMarker = rhMarkerArr[i];
						var data = rhMarker.data;
						if(data.postId == rhPost.postId){
							var location = rhMarker.getPosition();
							map.setCenter(location,18);
							if(type == "0"){
								vm.setInfoWin2(data,location);
							}else if(type == "1"){
								vm.setInfoWin3(rhPost,location);
							}
							break;
						}
					}
				},
				setInfoWin3:function(data,lnglat){
//					console.info(data);
					var tit= "["+data.groupName +"]-"+ data.postName;
//					var allreceiveGps = data.receiveGps;
//					var allonGuardCnt = data.onGuardCnt;
//					var alloffGuardCnt = data.offGuardCnt;
					var table = "<table class='table'><thead><tr><th>#</th><th>应在岗</th><th>GPS接收次数</th><th>在岗</th><th>离岗</th><th>轨迹</th></tr></thead><tbody>";
					var tableBody = "";
      				if(data.rhPostPoliceList.length > 0){
						for(var i=0;i<data.rhPostPoliceList.length;i++){
							var police = data.rhPostPoliceList[i];
							var tr = "<tr><th scope='row'>"+(i+1)+"</th><td>"+police.userId + "-" +police.userName+"</td><td>"
								+police.receiveGps+"</td><td>"+police.onGuardCnt+"</td><td>"+police.offGuardCnt 
								+"</td><td><a class='btn police_query_trace' data-police='"+police.userId+"'><i class='fa fa-stumbleupon'></i></a></td>"
								
								+"</td></tr>"
							tableBody = tableBody + tr;
						}
						
			    	}
      				var parentdiv = $('<div class="panel panel-default"></div>');
      				var heading = $('<div class="panel-heading">总在岗占比：'+ data.allOnGuardPart +' %</div>');
      				table = table + tableBody + "</tbody></table>";
      				heading.appendTo(parentdiv);
      				$(table).appendTo(parentdiv);
      				infowindow = new IMAP.InfoWindow(parentdiv.html(),{
			    		size : new IMAP.Size(360,300),
						title: tit,
						position:lnglat,
						offset:new IMAP.Pixel(0, -20)
					});
			    	map.getOverlayLayer().addOverlay(infowindow);
			    	infowindow.visible(true);
					infowindow.autoPan(true);
					
					$('.police_query_trace').click(function(e){
						var policeId = $(this).data("police");
						var param = {data:{type:'2',policeNo:policeId,startDt:vm.rhPostQ.startTime,endDt:vm.rhPostQ.endTime}};
						require(['layers/policeControl/trackSearch'],function(trackSearch){
							trackSearch.showLayer(param);
						});
					});
				},
				setInfoWin2:function(data,lnglat){
			    	var tit= "["+data.groupName +"]-"+ data.postName;
			    	var yingzaigang = [], shizaigang = [], tuogang = [], zaixian = [], lixian=[], postTyp = "";
			    	if(data.rhPostPoliceList.length == 0){
			    		//无
			    	}else{
			    		var gdLngLat = TUtils.str2Lnglat(data.shape);
			    		for(var i=0;i<data.rhPostPoliceList.length;i++){
			    			var police = data.rhPostPoliceList[i];
			    			postTyp = police.postTyp;
			    			var name = "["+police.userId+"]-"+ police.userName;
			    			yingzaigang.push(name);
			    			if(police.online){
			    				zaixian.push(name);
			    			}else{
			    				lixian.push(name);
			    			}
			    			if(police.onGuard){
			    				shizaigang.push(name);
			    			}else{
			    				tuogang.push(name);
			    			}
			    			
			    			if(police.latitude && police.longitude){
			    				var markerOpts = new IMAP.MarkerOptions();
			    				var lngLat = new IMAP.LngLat(police.longitude,police.latitude);
			    				var plo = new IMAP.PolylineOptions();
			    				var lnglatarr = [];
			    				plo.strokeOpacity = "1";
			    				plo.strokeWeight = "3";
			    				plo.editabled = false;
			    				plo.strokeStyle = "1"
			    				lnglatarr.push(lngLat);
			    				lnglatarr.push(gdLngLat);
			    				var title = "";
			    				if(police.onGuard){
			    					plo.strokeColor = "#4caf50";
			    					plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;//shi线
			    					markerOpts.icon = new IMAP.Icon("assets/images/onGuard.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
			    					title = "[在岗]-";
			    				}else{
			    					plo.strokeColor = "#ff9800";
			    					plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_DASHED;//虚线
			    					if(police.online){
			    						title = "[离岗/在线]-";
			    						markerOpts.icon = new IMAP.Icon("assets/images/offGuard.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
			    					}else{
			    						title = "[离线]-";
			    						markerOpts.icon = new IMAP.Icon("assets/images/offlinePolice.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
			    					}
			    				}
			    				title = title + police.userId + "-" +police.userName;
			    				markerOpts.title = title;
								var rhMarker = new IMAP.Marker(lngLat, markerOpts);
								rhMarker.data = police;
//								rhMarker.setTitle(title);
					        	map.getOverlayLayer().addOverlay(rhMarker, false);
					        	policeMarkers.push(rhMarker);
					        	
					        	var polyline = new IMAP.Polyline(lnglatarr, plo);
			    				map.getOverlayLayer().addOverlay(polyline, false);
			    				policeLines.push(polyline);
			    			}
				    	}
			    	}
			    	
			    	var parentdiv=$('<div style="font-size:14px;"></div>');
		    	    var yingzaigangdiv = $('<div style="font-size:14px;"><div class="col-md-12" style="margin-top:15px;"></div><span class="col-md-3 label" style="background-color: #ff3030;">应在岗</span></div>');
		    	    var shizaigangdiv = $('<div style="font-size:14px;"><div class="border-top-line col-md-12"></div><span class="col-md-3 label" style="background-color: #4caf50;">实在岗</span></div>');
		    	    var tuogangdiv  = $('<div style="font-size:14px;"><div class="border-top-line col-md-12"></div><span class="col-md-3 label" style="background-color: #ff9800;">离岗</span></div>');
		    	    var zaixiandiv  = $('<div style="font-size:14px;"><div class="border-top-line col-md-12"></div><span class="col-md-3 label" style="background-color: #c0d490;">在线</span></div>');
		    	    var lixiandiv  = $('<div style="font-size:14px;"><div class="border-top-line col-md-12"></div><span class="col-md-3 label" style="background-color: #666666;">离线</span></div>');
		    	    
		    	    for(var i=0;i<yingzaigang.length;i++){
		    	    	var zgf = yingzaigang[i];
		    	    	var div = $('<div class="col-md-9">'+zgf+'</div>');
		    	    	if(i != 0){
		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+zgf+'</div>');
		    	    	}
		    	    	div.appendTo(yingzaigangdiv);
		    	    }
		    	    for(var i=0;i<shizaigang.length;i++){
		    	    	var zgf = shizaigang[i];
		    	    	var div = $('<div class="col-md-9">'+zgf+'</div>');
		    	    	if(i != 0){
		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+zgf+'</div>');
		    	    	}
		    	    	div.appendTo(shizaigangdiv);
		    	    }
		    	    for(var i=0;i<tuogang.length;i++){
		    	    	var zgf = tuogang[i];
		    	    	var div = $('<div class="col-md-9">'+zgf+'</div>');
		    	    	if(i != 0){
		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+zgf+'</div>');
		    	    	}
		    	    	div.appendTo(tuogangdiv);
		    	    }
		    	    for(var i=0;i<zaixian.length;i++){
		    	    	var zgf = zaixian[i];
		    	    	var div = $('<div class="col-md-9">'+zgf+'</div>');
		    	    	if(i != 0){
		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+zgf+'</div>');
		    	    	}
		    	    	div.appendTo(zaixiandiv);
		    	    }
		    	    for(var i=0;i<lixian.length;i++){
		    	    	var zgf = lixian[i];
		    	    	var div = $('<div class="col-md-9">'+zgf+'</div>');
		    	    	if(i != 0){
		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+zgf+'</div>');
		    	    	}
		    	    	div.appendTo(lixiandiv);
		    	    }
		    	    yingzaigangdiv.appendTo(parentdiv);
		    	    shizaigangdiv.appendTo(parentdiv);
		    	    tuogangdiv.appendTo(parentdiv);
		    	    zaixiandiv.appendTo(parentdiv);
		    	    lixiandiv.appendTo(parentdiv);
			    	infowindow = new IMAP.InfoWindow(parentdiv.html(),{
			    		size : new IMAP.Size(320,270),
						title: tit,
						position:lnglat,
						offset:new IMAP.Pixel(0, -20)
					});
			    	map.getOverlayLayer().addOverlay(infowindow);
			    	infowindow.visible(true);
					infowindow.autoPan(true);
				},
				setInfoWin:function(data,lnglat){
			    	var title= "["+data.groupName +"]-"+ data.postName;
			    	var parentdiv=$('<div style="font-size:14px;"></div>');
		    	    var zgfdiv = $('<div style="font-size:14px;"><div class="col-md-12" style="margin-top:15px;"></div><span class="col-md-3 label" style="background-color: #66cc00;">早高峰</span></div>');
		    	    var wgfdiv = $('<div style="font-size:14px;"><div class="border-top-line col-md-12"></div><span class="col-md-3 label" style="background-color: #99ccff;">晚高峰</span></div>');
		    	    var rcdiv  = $('<div style="font-size:14px;"><div class="border-top-line col-md-12"></div><span class="col-md-3 label" style="background-color: #dedede;">平峰</span></div>');
//		    	    var qtdiv  = $('<div style="font-size:14px;"><div class="border-top-line col-md-12"></div><span class="col-md-3 label" style="background-color: #dedede;">其他</span></div>');
//		    	    var qtUser = data.rhPostDutyUserList[0].qtUser;
		    	    var rcUser = data.rhPostDutyUserList[0].rcUser;
		    	    var wgfUser = data.rhPostDutyUserList[0].wgfUser;
		    	    var zgfUser = data.rhPostDutyUserList[0].zgfUser;
		    	    
		    	    for(var i=0;i<zgfUser.length;i++){
		    	    	var zgf = zgfUser[i];
		    	    	var div = $('<div class="col-md-9">'+zgf.userName+'-'+zgf.userId+'</div>');
		    	    	if(i != 0){
		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+zgf.userName+'-'+zgf.userId+'</div>');
		    	    	}
		    	    	div.appendTo(zgfdiv);
		    	    }
		    	    for(var i=0;i<wgfUser.length;i++){
		    	    	var wgf = wgfUser[i];
		    	    	var div = $('<div class="col-md-9">'+wgf.userName+'-'+wgf.userId+'</div>');
		    	    	if(i != 0){
		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+wgf.userName+'-'+wgf.userId+'</div>');
		    	    	}
		    	    	div.appendTo(wgfdiv);
		    	    }
		    	    for(var i=0;i<rcUser.length;i++){
		    	    	var rc = rcUser[i];
		    	    	var div = $('<div class="col-md-9">'+rc.userName+'-'+rc.userId+'</div>');
		    	    	if(i != 0){
		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+rc.userName+'-'+rc.userId+'</div>');
		    	    	}
		    	    	div.appendTo(rcdiv);
		    	    }
//		    	    for(var i=0;i<qtUser.length;i++){
//		    	    	var qt = qtUser[i];
//		    	    	var div = $('<div class="col-md-9">'+qt.userName+'-'+qt.userId+'</div>');
//		    	    	if(i != 0){
//		    	    		div = $('<div class="col-md-9 col-md-offset-3">'+qt.userName+'-'+qt.userId+'</div>');
//		    	    	}
//		    	    	div.appendTo(qtdiv);
//		    	    }
		    	    zgfdiv.appendTo(parentdiv);
		    	    wgfdiv.appendTo(parentdiv);
		    	    rcdiv.appendTo(parentdiv);
//		    	    qtdiv.appendTo(parentdiv);
			    	    
			    	infowindow = new IMAP.InfoWindow(parentdiv.html(),{
			    		size : new IMAP.Size(320,270),
						title: title,
						position:lnglat,
						offset:new IMAP.Pixel(0, -20)
					});
			    	map.getOverlayLayer().addOverlay(infowindow);
			    	infowindow.visible(true);
					infowindow.autoPan(true);
				},
				schedule: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "qw/rhPost/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="排岗";
								vm.showList = 2;
								$("#rhPost-panel").css("width", "950px");
								vm.rhPost = rslt.rhPost;
//								vm.initFileUpload();
								setTimeout(function(){vm.findAllRhPostSch();}, 200);
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				findAllRhPostSch: function() {
					var defaultDate =TUtils.formatDate(new Date());
					$('#calendarPost').fullCalendar( 'destroy');
					var fullCalendar = $('#calendarPost').fullCalendar({
						header: {
							left: 'prev today next ',
							center: 'title',
							right: ''
						},
						defaultDate: defaultDate,
				        eventOrder: 'order',
						editable: true,//能否拖动
						droppable: true, 
						eventLimit: 2, 
						events : {
							url : 'qw/rhPostSchedule/allDutyTask?postId='+vm.rhPost.postId,
							type : 'GET',
							error : function() {
								alert('查询岗点出错!');
							}
						},
						/*dayClick: function(date, allDay, jsEvent, view) {
					        $(this).css('background-color', 'green');
					        vm.addOneRhPostSch(date);
							layer.open({
								type: 1,
								skin: 'layui-layer',
								title: "选择人员",
								area: ['460px', '200px'],
								shade: false,
								content: jQuery("#postDtlFormDiv"),
								btn: []
							});
					    },*/
					    eventClick: function(calEvent, jsEvent, view) {
					        $(this).css('background-color', 'red');
					        vm.editOneRhPostSch(calEvent.id);
							/*layer.open({
								type: 1,
								skin: 'layui-layer',
								title: "选择人员",
								area: ['460px', '200px'],
								shade: false,
								content: jQuery("#postDtlFormDiv"),
								btn: []
							});*/
					    		vm.delOneRhPostSch();
					    },
					    eventDrop : function(event, dayDelta, minuteDelta, allDay, revertFunc,
								jsEvent, ui, view) {
							var mday = dayDelta.days();// 与当前日期相比，移动的天数，可以是负值
							var d = new Date(event.start.format("YYYY-MM-DD HH:mm:ss"))
							var fdt = TUtils.formatDateTime(event.start._d);
							var t = fdt.replace(" ","T");
							event.start._i = t;
							event._start._i = t;
							if(event.id){
								$.ajax({
									url: "qw/rhPostSchedule/updateDate/"+event.id + "?postDt="+fdt,
									success: function(rslt){
										if(rslt.code == 200){
										}else{
											alert(rslt.msg);
										}
									}
								});
							}
						},
						drop: function (date, allDay, jsEvent, ui) {// this function is called when something is dropped
					        var originalEventObject = $(this).data('eventObject');
					        /*var copiedEventObject = $.extend({}, originalEventObject);
					        var thatday = TUtils.formatDate(date._d).replace(/-/g,"");
					        copiedEventObject.id = copiedEventObject.userId+"_"+thatday;
					        copiedEventObject.start = copiedEventObject._start = date._d;
					        copiedEventObject.start._i = TUtils.formatDateTime000(date._d).replace(" ","T");;
					        copiedEventObject._start._i = TUtils.formatDateTime000(date._d).replace(" ","T");;
					        copiedEventObject.allDay = true;
					        copiedEventObject.backgroundColor = $(this).css("background-color");
					        copiedEventObject.borderColor = $(this).css("border-color");
					        $('#calendarPost').fullCalendar('renderEvent', copiedEventObject, true);*/
					        vm.addOneRhPostSch(originalEventObject.userId, originalEventObject.userName, date._d);
					        vm.saveOneRhPostSch();
					   }
					});
				},
				addOneRhPostSch: function (userId,userName,selectedDate) {
					vm.rhPostSchedule.id='';
					vm.rhPostSchedule.userId=userId;
					vm.rhPostSchedule.userName=userName;
					vm.rhPostSchedule.isNewRecord=true;
					var date =new Date(selectedDate)
					vm.rhPostSchedule.postDt = TUtils.formatDate(date);
				},
				editOneRhPostSch: function(id) {
					$.ajax({
						url: "qw/rhPostSchedule/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.rhPostSchedule = rslt.rhPostSchedule;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				saveOneRhPostSch: function(userName) {
					/*if(!vm.rhPostSchedule.userName){
						alert('请选择用户');
						return;
					}*/
					if(!vm.rhPostSchedule.postType){
						alert('请选择岗点类型');
						return;
					}
					vm.rhPostSchedule.postId = vm.rhPost.postId;
					vm.rhPostSchedule.postName = vm.rhPost.postName;
					var url = "qw/rhPostSchedule/save";
					$.ajax({
						type: "POST",
						url: url,
						data: JSON.stringify(vm.rhPostSchedule),
						success: function(rslt){
							if(rslt.code === 200){
								/*alert('操作成功', function(index){
								});*/
								layer.closeAll();
								vm.findAllRhPostSch();
								$('#calendarPost').fullCalendar('gotoDate',vm.rhPostSchedule.postDt);
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				delOneRhPostSch: function(id) {
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "qw/rhPostSchedule/purge/"+vm.rhPostSchedule.id,
							success: function(rslt){
								if(rslt.code == 200){
									layer.closeAll();
									vm.findAllRhPostSch();
									$('#calendarPost').fullCalendar('gotoDate',vm.rhPostSchedule.postDt);
									/*alert('操作成功', function(index){
									});*/
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				/*openFileUploadDialog: function(id) {
					document.getElementById("fileupload").click(); 
					this.initFileUpload();
				},*/
				initFileUpload: function(id) {
					if(vm.fileUploadWidget){
						$('#fileupload').fileupload('destroy');
						vm.fileUploadWidget = null;
					}
					vm.fileUploadWidget = $('#fileupload').fileupload({
						dataType: 'json',
						autoUpload: false,//是否自动上传
				        url:'qw/rhPostSchedule/upload?groupId='+vm.rhPostQ.groupId,
				        acceptFileTypes: /(.|\/)(xls|xlsx)$/i,//文件格式限制
				        maxNumberOfFiles: 2,//最大上传文件数目
				        maxFileSize: 5242880,//文件不超过5M
				        sequentialUploads: true,//是否队列上传
						change : function(e, data) {
							vm.selectedFilePath= data.files[0].name;
							$.each(data.files, function(index, file) {
							});
							vm.showUploadBtns= true;
						},
						add : function(e, data) {
							var files = $('#uploadSubmitBtn');
							$('#uploadSubmitBtn').off("click").on("click", function () {
//							$('#uploadSubmitBtn').one("click", function () {
								var files = $('#uploadSubmitBtn');
								$('#uploadMsg').text('上传中...');
			                    data.submit();  
			                });  
						},
						done : function(e, data) {// data.result, data.textStatus, data.jqXHR;
							$('#uploadMsg').text('上传成功');
							$("uploadSubmitBtn").attr("disabled",true);
						},
						fail: function (e, data) {// data.errorThrown, data.textStatus, data.jqXHR;
							$('#uploadMsg').text('上传失败');
						},
						progressall : function(e, data) {
							var progress = parseInt(data.loaded / data.total * 100, 10);
							$('#progress .bar').css('width', progress + '%');
						}
				    }).bind('fileuploadadd', function (e, data) {
				    	vm.previewUrl = localURL(data.files[0]);
					    $('#fileCancelBtn').on("click", function () {
					    	if(data){
					    		if(data.jqXHR){
					    			data.jqXHR.abort();
					    		}
					    	}
					    })
					    
					    $('#fileDelBtn').on("click", function () {
					    	if(data){
					    		if(data.jqXHR){
					    			data.jqXHR.abort();
					    		}
					    	}
							$('#progress .bar').css('width', '0%');
					    	$('#uploadMsg').html('');
					    	vm.selectedFilePath='';
					    })
					})
				},
				/*exportTemplate: function() {
					var url = "qw/rhPostSchedule/download/template?postId="+vm.rhPost.postId;
					window.open(url);
					//！！不能用ajax提交,否则无法下载
				    $.get(url, function(r){
						if(r.code == 200){
							alert("导出成功，文档位置  [D:/岗点排班模板.xlsx]");
						}else{
							alert(r.msg);
						}
					});
				},*/
				exportRhPostSchedule: function() {
					var url = "qw/rhPostSchedule/exportRhPostSchedule?postId="+vm.rhPost.postId;
					window.open(url);
					//！！不能用ajax提交,否则无法下载
				    /*$.get(url, function(r){
						if(r.code == 200){
							alert("导出成功，文档位置  [D:/岗点排班.xlsx]");
						}else{
							alert(r.msg);
						}
					});*/
				},
				clearRhPostSchedule: function(id) {
					confirm('确定清空当月排班表？', function(){
						var url = "qw/rhPostSchedule/clearRhPostSchedule?postId="+vm.rhPost.postId;
					    $.get(url, function(r){
							if(r.code == 200){
								alert(r.msg);
								setTimeout(function(){vm.findAllRhPostSch();}, 200);
							}else{
								alert(r.msg);
							}
						});
					});
				},
				popupGroupUserTree: function(){
					layer.open({
						type: 1,
						offset: '50px',
						skin: 'layui-layer-rim',
						title: "组织列表",
						area: ['300px', '450px'],
						shade: 0,
						offset: '200px',
						shadeClose: false,
						content: jQuery("#groupUserLayer"),
						btn: ['确定', '取消'],
						btn1: function (index) {
							var nodes = ztreeGroup.getSelectedNodes();
							if(nodes[0].isParent){
								alert("不能选择部门，请重新选择警员");
								return;
							}
							vm.rhPostSchedule.userId = nodes[0].id;
							vm.rhPostSchedule.userName = nodes[0].name;
							layer.close(index);
			            }
					});
				},
				clear: function () {
					vm.clearRhPost();
					vm.rhPost = {isNewRecord:true, shape:'', postName:'', group:{groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')}};
					$("#groupId").selectpicker('val', '');
					clearRhMarkerArr();
					this.clearRhPost();
					if(infowindow){
						map.getOverlayLayer().removeOverlay(infowindow);
					}
					this.closeTimerGetPolice();
					this.clearPoliceRelate();
				},
				close: function() {
					vm.clear();
					itsGlobal.hideLeftPanel();
					this.closeTimerGetPolice();
					this.clearPoliceRelate();
				},
				exportAllTemplate:function(){
//					var groupId = currentUser.jjzdUser? currentUser.group.groupId :'';
//					var url = "qw/rhPostSchedule/download/allTemplate?groupId="+groupId;
//					window.open(url);
					layer.open({
						type: 1,
						skin: 'layui-layer',
						title: "导出模板日期选择",
						area: ['460px', '200px'],
						shade: false,
						content: $("#pgFormDiv"),
						btn: []
					});
				},
				openFileUploadDialogNew:function(){
					this.initFileUpload();
					document.getElementById("fileupload").click(); 
				},
				closeTimerGetPolice:function(){
					if(this.timer_getPolice){
						clearInterval(this.timer_getPolice);
						this.timer_getPolice = null;
					}
				},
				getRhRelatedPolice:function(postType,postIds){
					$.get("qw/rhPost/findPostRelatedPolice?postType="+postType+"&postIds="+postIds, function(r){
						if(r.code == 200){
							vm.police_rhPostList = r.rhPostList;
							
						}else{
							alert(r.msg);
						}
					});
				},
				setPostExpiryDate:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', onpicked:function(){vm.rhPost.expiryDate = $("#expiryDate").val()}});
				},
				setPostStartDate:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', onpicked:function(){vm.rhPost.startDate = $("#startDate").val()}});
				},
				setPgStartDt:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', onpicked:function(){vm.pg.startDt = $("#startDt").val()}});
				},
				setPgEndDt:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', onpicked:function(){vm.pg.endDt = $("#endDt").val()}});
				},
				confirmPgDt:function(){
					vm.pg.startDt = $("#startDt").val();
					vm.pg.endDt = $("#endDt").val();
					if(!vm.pg.endDt || vm.pg.endDt == ""){
						alert('请选择结束日期');
						return;
					}
					if(!vm.pg.startDt || vm.pg.startDt == ""){
						alert('请选择开始日期');
						return;
					}
					var d1 = new Date(vm.pg.startDt.replace(/\-/g, "\/"));  
					var d2 = new Date(vm.pg.endDt.replace(/\-/g, "\/"));  

					if(d1 >d2){  
					  alert("开始时间不能大于结束时间！");  
					  return;  
					}
					  
					var groupId = currentUser.jjzdUser? currentUser.group.groupId :'';
					var url = "qw/rhPostSchedule/download/allTemplate?groupId="+groupId 
						+ "&start=" + vm.pg.startDt
						+ "&end=" + vm.pg.endDt;
					
					window.open(url);
					
					layer.closeAll();
				},
				cancelPgDt:function(){
					layer.closeAll();
					vm.pg = {};
				},
				setGpsData:function(e){
					var gpsData = e.target.value;
					if(gpsData == "1"){
						$("#showHistoryQueryTime").removeClass("hide");
					}else{
						$("#showHistoryQueryTime").addClass("hide");
					}
				},
				setHistoryStartDate:function(){
					WdatePicker({lang:'zh-cn',dateFmt:'yyyy-MM-dd HH:mm', readOnly: true, onpicked:function(){
							vm.rhPostQ.startTime = $("#startTime").val();
						}
					});
				},
				setHistoryEndDate:function(){
					WdatePicker({lang:'zh-cn',minDate:'#F{$dp.$D(\'startTime\')}',maxDate:'#F{$dp.$D(\'startTime\',{H:8})}',dateFmt:'yyyy-MM-dd HH:mm', onpicked:function(){vm.rhPostQ.endTime = $("#endTime").val()}});
				}
			}
		});
		oldQ=1;
		loadGroups();
		
		loadJqGrid();
		
		loadGroupUsers();
		constructGroupUserTree();
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "rhPostPanel的vue实例"
		});
		vm.rhPostQ.startTime = TUtils.formatDate(new Date())+" 00:00";
		$("#startTime").val(vm.rhPostQ.startTime);
	}

	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				if(currentUser.jjddUser){
					vm.groupList = r.groupList;
					vm.groupList.unshift({groupName:'大队机关',groupId:'ddjg'});
					vm.groupList.unshift({groupName:'所有'});
				}else if(currentUser.jjzdUser){
					vm.groupList.push(currentUser.group);
				}
				
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
					$('#postTypeQ').selectpicker({
						noneSelectedText:'请选择岗点类型',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
					$('#statusQ').selectpicker({
						noneSelectedText:'请选择是否有效',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
					$('#groupId').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
					$('#postType').selectpicker({
						noneSelectedText:'请选择岗点类型（可多选）',
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
	
	var localURL = function (file) {
        var url = null;
        if (window.createObjectURL != undefined) { 
            url = window.createObjectURL(file);
        } else if (window.URL != undefined) {
            url = window.URL.createObjectURL(file);
        } else if (window.webkitURL != undefined) { 
            url = window.webkitURL.createObjectURL(file);
        }
        return url;//     eg:     blob:http://localhost/671c3409-0047-44ec-bcba-89d63a439231
	}
	
	var clearRhMarkerArr = function(){
		if(rhMarkerArr && rhMarkerArr.length>0){
			for(var i=0; i<rhMarkerArr.length; i++){
				var rhMarker = rhMarkerArr[i];
				map.getOverlayLayer().removeOverlay(rhMarker);
			}
			rhMarkerArr = [];
		}
	}
	
	var loadAllRhByGroup = function(groupId,postName,postType,status){
		clearRhMarkerArr();
		var gId = null;
		if(groupId){
			gId = groupId;
		}else{
			gId = currentUser.jjzdUser? currentUser.group.groupId :'';
		}
		var url = "qw/rhPost/allData?groupId="+gId;
		if(postName){
			url += ("&postName="+postName);
		}
		if(postType){
			url += ("&postType="+postType);
		}
		if(status){
			url += ("&status="+status);
		}
		$.get(url, function(r){
			if(r.code == 200){
				if(r.rhPostList && r.rhPostList.length >0){
					vm.allRhPostList = r.rhPostList;
					var markerOpts = new IMAP.MarkerOptions();
					markerOpts.icon = new IMAP.Icon("assets/images/rhPost.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
					var rhpostidArr = [];
					for(var i=0; i<r.rhPostList.length; i++){
						var rhPost = r.rhPostList[i];
						var lngLat = TUtils.str2Lnglat(rhPost.shape);
						markerOpts.title= "["+rhPost.groupName+"]"+rhPost.postName;
						var rhMarker = new IMAP.Marker(lngLat, markerOpts);
						rhMarker.data = rhPost;
			        	map.getOverlayLayer().addOverlay(rhMarker, false);
			        	rhMarkerArr.push(rhMarker);
			        	rhpostidArr.push(rhPost.postId);
					}
				}
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadAllHistoryRhByGroup = function(groupId,postName,postType,status,startTime,endTime){
		clearRhMarkerArr();
		var gId = null;
		if(groupId){
			gId = groupId;
		}else{
			gId = currentUser.jjzdUser? currentUser.group.groupId :'';
		}
		var url = "qw/rhPost/listData?groupId="+gId;
		if(postName){
			url += ("&postName="+postName);
		}
		if(postType){
			url += ("&postType="+postType);
		}
		if(status){
			url += ("&status="+status);
		}
		if(startTime){
			url += ("&startTime="+startTime);
		}
		if(endTime){
			url += ("&endTime="+endTime);
		}
		$.get(url, function(r){
			if(r.code == 200){
				if(r.rhPostList && r.rhPostList.length >0){
					vm.allRhPostList = r.rhPostList;
					var markerOpts = new IMAP.MarkerOptions();
					markerOpts.icon = new IMAP.Icon("assets/images/rhPost.png", new IMAP.Size(32,32), new IMAP.Pixel(0, 0));
					var rhpostidArr = [];
					for(var i=0; i<r.rhPostList.length; i++){
						var rhPost = r.rhPostList[i];
						var lngLat = TUtils.str2Lnglat(rhPost.shape);
						var rhMarker = new IMAP.Marker(lngLat, markerOpts);
						rhMarker.data = rhPost;
			        	map.getOverlayLayer().addOverlay(rhMarker, false);
			        	rhMarkerArr.push(rhMarker);
			        	rhpostidArr.push(rhPost.postId);
					}
				}
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var gpsData = $("input[name='gpsDataRadio']:checked").val();
		
		var postDataTmp = {'groupId': vm.rhPostQ.groupId, 'postName': vm.rhPostQ.postName,'postType':vm.rhPostQ.postType,'status':vm.rhPostQ.status};
		
		vm.clearRhPost();
		
		if(gpsData == "1"){
			postDataTmp.startTime = vm.rhPostQ.startTime;
			postDataTmp.endTime = vm.rhPostQ.endTime;
			if(!postDataTmp.startTime|| postDataTmp.startTime == "" || !postDataTmp.endTime || postDataTmp.endTime == ""){
				alert("起止时间不能为空");
				return;
			}
			historyJqGrid(postDataTmp);
			loadAllHistoryRhByGroup(vm.rhPostQ.groupId,vm.rhPostQ.postName,vm.rhPostQ.postType,vm.rhPostQ.status,vm.rhPostQ.startTime,vm.rhPostQ.endTime);
		}else{
			realTimeJqGrid(postDataTmp);
			loadAllRhByGroup(vm.rhPostQ.groupId,vm.rhPostQ.postName,vm.rhPostQ.postType,vm.rhPostQ.status);
		}
		vm.rhPostQ.queryGpsData = gpsData;
//		oldQ = JSON.parse(JSON.stringify(vm.rhPostQ));
	};

	function realTimeJqGrid(postDataTmp){
		$("#jqGrid").jqGrid({
			url: "qw/rhPost/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '所属单位', name: 'groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '岗点编号', name: 'postId', width: 120, sortable:false,hidden:true, /*, formatter: function(value, options, row){return value;}*/},
				{ label: '岗点名称', name: 'postName', width: 140, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '空间信息', name: 'shape', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '岗点描述', name: 'description', width:100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '应在岗', name: 'yingZaiGang', width:50, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '实在岗', name: 'shiZaiGang', width:50, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '脱岗', name: 'liGang', width:40, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '在线', name: 'online', width:40, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '离线', name: 'offline', width:40, sortable:false/*, formatter: function(value, options, row){return value;}*/}
			],
			viewrecords: true,
			height: 290,
			rowNum: 15,
			rowList : [15,30,50],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth:false,
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
				vm.showOneRhPost(rowData,"0");
			}
		});
	}
	
	function historyJqGrid(postDataTmp){
		var queryList = [];
		$("#jqGrid").jqGrid({
			url: "qw/rhPost/pageDataOld",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '所属单位', name: 'groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '岗点编号', name: 'postId', width: 120, sortable:false,hidden:true, /*, formatter: function(value, options, row){return value;}*/},
				{ label: '岗点名称', name: 'postName', width: 140, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '空间信息', name: 'shape', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '岗点描述', name: 'description', width:100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '总在岗', name: 'allOnGuardPart', width:50, sortable:false, formatter: function(value, options, row){
					var claz = "label-info";
					if(value<30){
						claz = "label-danger";
					}else if(value<60){
						claz = "label-warning";
					}else if(value<85){
						claz = "label-info";
					}else{
						claz = "label-success";
					}
					return "<span class='label "+claz+"'>"+value+"%</span>";
				}},
			],
			viewrecords: true,
			height: 290,
			rowNum: 10,
			rowList : [10,15,20],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth:false,
			width:540,
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
				queryList = data.page.list;
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
				if(queryList.length > 0){
					for(var i=0; i<queryList.length; i++){
						if(queryList[i].id == rowData.id){
							vm.showOneRhPost(queryList[i],"1");
							break;
						}
					}
				}
			}
		});
	}

	function loadGroupUsers() {
		var groupId = currentUser.group.groupId;
		if(currentUser.jjddUser){
			groupId = '';
		}
		var userUrl = "aa/user/allMjAndJf?groupId="+groupId;
		$.get(userUrl, function(r){
			if(r.code == 200){
				vm.groupUserList = r.userList;
				
				setTimeout(function() {
					require(['jqueryUI'],function(){
						$(".userNameDrag").each(function(){
							var userName = $(this).text();
							$(this).data('eventObject', {userName:userName,userId:$(this).data("userid")});
							$(this).draggable({
					          zIndex: 9999,
					          helper: "clone",
					          revert: true, // will cause the event to go back to its
					          revertDuration: 0  //  original position after the drag
					        });
						});
					});
				}, 1000);
			}else{
				alert(r.msg);
			}
		});
	};
	
	function constructGroupUserTree() {
		var groupId = currentUser.group.groupId;
		if(currentUser.jjddUser){
			groupId = '';
		}
		$.get("aa/group/groupUserTree?groupId="+groupId, function(r) {// 加载树
			ztreeGroup = $.fn.zTree.init($("#groupUserTree"), {
				view: {
					dblClickExpand: false,
				},
				data : {
					
					simpleData : {
						enable : true,
						idKey : "id",
						pIdKey : "pId",
						rootPId : -1
					},
					key : {
						url : "nourl",
						name : "name"
					}
				},
					callback: {   
//		                onClick:  function(e,treeId, treeNode) {
//							var zTree1 = $.fn.zTree.getZTreeObj("#groupUserTree");
//							zTree1.expandNode(treeNode);
//						},
						beforeClick: function(treeId, treeNode){
							var zTree1 = $.fn.zTree.getZTreeObj("groupUserTree");
							zTree1.expandNode(treeNode);
							return true;
						},
						 onClick: function (e, treeId, treeNode, clickFlag) {   
						  ztreeGroup.checkNode(treeNode, !treeNode.checked, true,true);  
//		                  
//							zTree1.expandNode(treeNode);
		                },
					}
		                
				
			}, r.treeNodeList);
			ztreeGroup.expandAll(false);// 展开所有节点
		});
	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})