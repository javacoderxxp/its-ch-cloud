define(function(require){
	
	var map = require('mainMap');
	var Vue = require('vue');
	require('jqgrid');
	var htmlStr = require('text!./realtimeAlarm.html');
	var marker;
	//var jamMarker;
	var currentUser;
	var app;
	var tool;
	var modifiedLnglat;
	var targetId="";
	var vectors = [];
	var infowindow;
	var app;
	var time = 0;
	var timeInterval;
	var t;  //定时刷新警情的计时器对象
	var t2;  //定时刷新交通拥堵的计时器对象
	var t3;  //定时刷新布控报警的计时器对象
	var markerOpts_bk = new IMAP.MarkerOptions();
	markerOpts_bk.icon = new IMAP.Icon("./assets/images/car.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts_bk.anchor = IMAP.Constants.CENTER;
	var icon_police = new IMAP.Icon("./assets/images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var icon_police_offline = new IMAP.Icon("./assets/images/police1.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var opts = new IMAP.MarkerOptions();
	opts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var jwtMakers = [],clearJwtTimer,jwtLabels=[];
	
	var clearJwtMarkers = function(){
		if(jwtMakers.length > 0){
			for(var j = 0; j < jwtMakers.length; j++){
				map.getOverlayLayer().removeOverlay(jwtMakers[j]);
			}
		}
		if(jwtLabels.length > 0){
			for(var j = 0; j < jwtLabels.length; j++){
				map.getOverlayLayer().removeOverlay(jwtLabels[j]);
			}
		}
		
		jwtLabels=[];
		jwtMakers=[];
	}
	
	var showLayer = function(){
		showAlarmPanel(htmlStr);
		app = new Vue({
			el : '#realtimeAlarm-panel',
			data : {
				alarmList:[],
				alarmTask:{},
				jamList:[],
				bkAlertListMid:[],
				bkAlertList:[],
				newBkAlertCnt:'',
				bkLocalMarker :null,
				bkLocalTimer:null
			},
			methods :{
				updateBkDataList:function(){
					var that = this;
					$.ajax({
					    url:'./video/bkAlert/findBkList',
					    success:function(rslt){
					        if(rslt.code == 200){
					        	that.bkAlertListMid = rslt.bkAlertList;
					        }
					    },
					    error:function(xhr,textStatus){}
					});
				},
				locateBk:function(item){
					var that = this;
					clearTimeout(this.bkLocalTimer);
					this.bkLocalTimer = null;
					if(null != this.bkLocalMarker){
						map.getOverlayLayer().removeOverlay(this.bkLocalMarker);
					}
					if(item.shape){
						var pos = item.shape.split(",");
						this.bkLocalMarker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts_bk);
						this.bkLocalMarker.data = {longitude:pos[0],latitude:pos[1], cont: item.cont};
						this.bkLocalMarker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClickBk);
						
						map.getOverlayLayer().addOverlay(this.bkLocalMarker, true);
					}
					this.bkLocalTimer = setTimeout(function(){
						if(null != that.bkLocalMarker){
							map.getOverlayLayer().removeOverlay(that.bkLocalMarker);
							that.bkLocalMarker = null;
						}
					}, 10000);
				},
				saveAlarmBtn:function(){
					if(!app.alarmTask.processContent || app.alarmTask.processContent.trim() == ''){
						layer.msg("请选择处理详情！");
						return;
					}
					if(app.alarmTask.processContent == "其他"){
						var descText = $("#descText").val();
						if(descText){
							app.alarmTask.processContent = descText;
						}
					}
					//return;
					var url = "./jw/policeTask/dispatchAlarmByDd";
					$.ajax({
						type: "POST",
						url: url,
						data: JSON.stringify(app.alarmTask),
						success: function(rslt){
							if(rslt.code === 200){
								alert('操作成功', function(index){
									layer.closeAll();
									app.alarmTask = {};
									initDataGrid();
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				close: function(){
					hide();
				}
			},
			watch:{
				'bkAlertListMid' : {
					deep : true,
					handler : function(newVal, oldVal) {
						var list = [],newBkAlertCnt=0;
						for(var i=0;i<newVal.length;i++){
							var isIn = false;
							var newBk = newVal[i];
							var newId = newBk.id;
							for(var j=0;j<oldVal.length;j++){
								var oldId = oldVal[j].id;
								if(newId == oldId){
									isIn = true;
									break;
								}
							}
							if(!isIn){
								newBk.isNew = true;
								newBkAlertCnt = newBkAlertCnt +1;
							}else{
								newBk.isNew = false;
							}
							var bktype = "";
							if(newBk.dataType == "0"){
								bktype = "大华-关注车辆";
							}else if(newBk.dataType == "1"){
								bktype = "大华-可疑车辆";
							}else if(newBk.dataType == "2"){
								bktype = "临时-布控车辆";
							}
							var title = "["+newBk.flag+"]-"+bktype+"-" + "  " + newBk.plateNo + " 已抓拍";
							var cont = newBk.devName + " 抓拍到布控车辆，车牌号： " + newBk.plateNo + " , 抓拍时间为： " + newBk.captureDt+
							"，布控案由: "+newBk.bkay;
							newBk.title = title;
							newBk.cont = cont;
							list.push(newBk);
						}
						this.bkAlertList = list;
						this.newBkAlertCnt = newBkAlertCnt == 0?'':newBkAlertCnt;
					}
				}
			},
		});
		
		$.get("currentUser", function(rslt){
			if(rslt.currentUser){
				currentUser = rslt.currentUser;
				initDataGrid();
				initRealtimeJamTB();
			}
		});
		
		t = setInterval(initDataGrid,15000);   // 15s请求一次
		
		t2 = setInterval(initRealtimeJamTB,120000);   // 2min请求一次
		
		t3 = setInterval(app.updateBkDataList,240000);   // 4min请求一次
		app.updateBkDataList();
		
		leftSilder();
		vueEureka.set("realtimeAlarmPanel", {
			vue: app,
			description: "alarmTask的vue实例"
		});
	};

	var rightClickBk = function(e) {
		//右键菜单
		var contextMen = "";
		if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
			contextMen = '<div class="self-menu">'
				+'<span class="detailspan callJwtBk" >周边警力(3公里)</span>'
				+'</div>';
		}
		CustomContextMenu.setContent(contextMen,e,100,40);
		$(".callJwtBk").bind("click",function(){
			CustomContextMenu.close();
//			layer.msg("功能尚未开放...");
//			return;
			var data = e.target.data;
			var lnglat = new IMAP.LngLat(data.longitude, data.latitude);
		    $.ajax({
				type: "GET",
			    url: './jw/gpsDevice/findJwtInCycle?lnglat='+lnglat+'&radius=3000',
			    success:function(rslt){
			        if(rslt.code == 200){
			        	var gpsIds="";
			        	var gpsJwtList = rslt.mapPoiContainer.gpsJwtList;
			        	if(gpsJwtList.length === 0){
			        		layer.msg("该点范围内无警务通",{offset: '300px'});
			        	} else {
//							if(clearJwtTimer){
//								clearTimeout(clearJwtTimer);
								clearJwtMarkers();
//							}
							var policeNoArr = [];
							for(var i = 0; i < gpsJwtList.length; i++){
								var police = gpsJwtList[i];
								if(police.status != '0'){
									continue;
								}
								policeNoArr.push(police.policeNo);
								var point = new IMAP.Marker(new IMAP.LngLat(police.longitude, police.latitude), opts);
								police.status === '0'?point.setIcon(icon_police):point.setIcon(icon_police_offline);
								point.data = police;
								map.getOverlayLayer().addOverlay(point, false);
								point.setTitle(police.userName);
								
								var tl = "["+(police.policeNo?police.policeNo:"")+"]"+(police.policeName?police.policeName:"");
								var infoLabel = new IMAP.Label(tl, {
									position : new IMAP.LngLat(police.longitude, police.latitude),// 基点位置
									offset: new IMAP.Pixel(0,-60),//相对于基点的位置
									anchor : IMAP.Constants.TOP_CENTER,
									fontSize : 15,
									fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
									fontColor : "#222222"
								});
								map.getOverlayLayer().addOverlay(infoLabel, false);
								jwtLabels.push(infoLabel);
								
								jwtMakers.push(point);
								
								point.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, function(e){
									var contextMen = "";
									if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
										contextMen = '<div class="self-menu">'
											+'<span class="detailspan sendNoticeToPolice" >下发处警单</span>'
											+'</div>';
									}
									CustomContextMenu.setContent(contextMen,e,100,40);

									$(".sendNoticeToPolice").bind("click",function(){
										CustomContextMenu.close();
										var po = e.target.data;
										policeNoArr = [];
										policeNoArr.push(po.policeNo);
										require(['layers/policeControl/sendNotice'],function(notice){
											var policeNos = policeNoArr.join(",");
											var title = "[实时布控报警]";
											var content = data.cont;
											var publisher = currentUser.policeNo?currentUser.policeNo:"";
								    		notice.showLayer(true,policeNos,title,content,publisher); 
										});
									});
								});
							}
//							if(!clearJwtTimer){
//								clearJwtTimer = setTimeout(function(){
//									clearJwtMarkers();
//								}, 6000);
//							}
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
	};
	
	var rightClick = function(e) {
    	
		//右键菜单
		var contextMen = "";
		if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
			contextMen = '<div class="self-menu"><span class="detailspan callVideo" >周边监控</span>'
				/*+'<span class="detailspan setPosNull" >位置删除</span>'*/
				+'<span class="detailspan confirmPos" >位置确认</span>'
				+'<span class="detailspan callJwt" >周边警力(3公里)</span>'
				+'</div>';
		}else{
			contextMen = '<div class="self-menu"><span class="detailspan callVideo" >周边监控</span>'
				+'<span class="detailspan callJwt" >周边警力(3公里)</span>'
				+'</div>';
		}
		
		CustomContextMenu.setContent(contextMen,e,100,40);
		$(".callVideo").bind("click",function(){
			CustomContextMenu.close();
			var lnglat = new IMAP.LngLat(e.target.data.longitude, e.target.data.latitude);
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
		$(".callJwt").bind("click",function(){
			CustomContextMenu.close();
//			layer.msg("功能尚未开放...");
//			return;
			var data = e.target.data;
			var lnglat = new IMAP.LngLat(data.longitude, data.latitude);
		    $.ajax({
				type: "GET",
			    url: './jw/gpsDevice/findJwtInCycle?lnglat='+lnglat+'&radius=3000',
			    success:function(rslt){
			        if(rslt.code == 200){
			        	var gpsIds="";
			        	var gpsJwtList = rslt.mapPoiContainer.gpsJwtList;
			        	if(gpsJwtList.length === 0){
			        		layer.msg("该点范围内无警务通",{offset: '300px'});
			        	} else {
//							require(['layers/policeControl/policeJwt'],function(jwt){
//								jwt.showLayer(true, gpsJwtList, null);
//							});
//							if(clearJwtTimer){
//								clearInterval(clearJwtTimer);
								clearJwtMarkers();
//							}
							var policeNoArr = [];
							for(var i = 0; i < gpsJwtList.length; i++){
								var police = gpsJwtList[i];
								if(police.status != '0'){
									continue;
								}
								policeNoArr.push(police.policeNo);
								var point = new IMAP.Marker(new IMAP.LngLat(police.longitude, police.latitude), opts);
								police.status === '0'?point.setIcon(icon_police):point.setIcon(icon_police_offline);
								point.data = police;
								map.getOverlayLayer().addOverlay(point, false);
								point.setTitle(police.userName);
								
								var tl = "["+(police.policeNo?police.policeNo:"")+"]"+(police.policeName?police.policeName:"");
								var infoLabel = new IMAP.Label(tl, {
									position : new IMAP.LngLat(police.longitude, police.latitude),// 基点位置
									offset: new IMAP.Pixel(0,-60),//相对于基点的位置
									anchor : IMAP.Constants.TOP_CENTER,
									fontSize : 15,
									fontBold : false,// 在html5 marker的情况下，是否允许marker有背景
									fontColor : "#222222"
								});
								map.getOverlayLayer().addOverlay(infoLabel, false);
								jwtLabels.push(infoLabel);
								jwtMakers.push(point);
								
								point.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, function(e){
									var contextMen = "";
									if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
										contextMen = '<div class="self-menu">'
											+'<span class="detailspan sendNoticeToPolice">下发处警单</span>'
											+'</div>';
									}
									CustomContextMenu.setContent(contextMen,e,100,40);
									$(".sendNoticeToPolice").bind("click",function(){
										CustomContextMenu.close();
										var po = e.target.data;
										policeNoArr = [];
										policeNoArr.push(po.policeNo);
										require(['layers/policeControl/sendNotice'],function(notice){
											var policeNos = policeNoArr.join(",");
											var title = data.eventAbsDesc?"[警情] "+data.eventAbsDesc:"[警情]";
											var content = data.eventAddr + ", "+data.eventContent;
											var publisher = currentUser.policeNo?currentUser.policeNo:"";
								    		notice.showLayer(true,policeNos,title,content,publisher); 
										});
									});
								});
							}
//							if(!clearJwtTimer){
//								clearJwtTimer = setTimeout(function(){
//									clearJwtMarkers();
//								}, 10000);
//							}

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
		$(".setPosNull").bind("click",function(){
			CustomContextMenu.close();
			if (!marker) {return;}
		    marker.editable(false);
		    /*marker.addEventListener(IMAP.Constants.DRAG_END, function(e) {
		    	modifiedLnglat = e.lnglat;
			});
			layer.msg("请移动警情图标，以纠正警情位置！",{offset: '350px'});*/
		    if(targetId == '' || typeof(targetId) == 'undefined'){
		    	targetId = marker.data.eventId;
		    }
		    $.ajax({
				type: "GET",
			    url: './jw/policeTask/modifiedAlarmPosition?lnglat='+'&eventId='+targetId,
			    success: function(rstl){
			    	if(rstl.code === 200){
		    			layer.msg("警情位置删除成功！");
		    			targetId = '';
		    			marker.data.longitude = modifiedLnglat.lng;
		    			marker.data.latitude = modifiedLnglat.lat;
			    	}else{
						layer.msg(rstl.msg);
					}
				}
			});
		});
		$(".confirmPos").bind("click",function(){
			CustomContextMenu.close();
			if (!marker) {return;}
		    marker.editable(false);
		    if(targetId == '' || typeof(targetId) == 'undefined'){
		    	targetId = marker.data.eventId;
		    }
		    if(typeof(modifiedLnglat) == 'undefined'){
		    	layer.msg("当前警情位置未发生变化");
		    	return;
		    }
		    $.ajax({
				type: "GET",
			    url: './jw/policeTask/modifiedAlarmPosition?lnglat='+modifiedLnglat+'&eventId='+targetId,
			    success: function(rstl){
			    	if(rstl.code === 200){
		    			layer.msg("警情位置修正成功！");
		    			initDataGrid();
		    			targetId = '';
		    			marker.data.longitude = modifiedLnglat.lng;
		    			marker.data.latitude = modifiedLnglat.lat;
		    			marker.data = rstl.jq;
			    	}else{
						layer.msg(rstl.msg);
					}
				}
			});
		});
	};
	
	var hide = function() {
		if(marker){
			map.getOverlayLayer().removeOverlay(marker);
		}
		/*if(jamMarker){
			map.getOverlayLayer().removeOverlay(jamMarker);
		}*/
		map.getOverlayLayer().clear(vectors);
		vectors=[];
		map.getOverlayLayer().removeOverlay(infowindow);
	}
	
	var showAlarmPanel = function(htmlStr){
		closeAlarmPanel();
		var leftPanel = $("#realtimeAlarmPanel");
		leftPanel.html(htmlStr);
		leftPanel.fadeIn().css("display","inline-block");
	};
	
	var closeAlarmPanel = function(){
		var obj = vueEureka.get("realtimeAlarmPanel");
		if(obj){
			obj.vue.close();
			obj.vue.$destroy();//手动销毁vue实例
		}
	};
	
	var initRealtimeJamTB = function(){
		var zdId='';
		/*currentUser.group.groupId;
		if(zdId =='cxzd'|| zdId =='kfqzd' || zdId =='njzd'){
			zdId='33';
		}
		if(currentUser.jjddUser){
			zdId='';
		}*/
		var endDt = new Date();
		var startDt = endDt;
		endDt = formatDateTime(endDt);
		//startDt.setTime(startDt.getTime() - 10*60*1000);
		startDt.setHours(0);
		startDt.setMinutes(0);
		startDt.setSeconds(0);
		startDt.setMilliseconds(0);
		startDt = formatDateTime(startDt);
		var url = "./jtzx/linkJam/getUnprocessJamList";
		url += "?startDt="+startDt+"&endDt="+endDt+"&zdId="+zdId;
		$.ajax({
			type: "GET",
		    url: url,
		    async :false,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		if(rslt.jamList && rslt.jamList.length > 0){
		    			$("#accordionDiv").empty();
		    			var newJamList = [];  //默认所有的都是新拥堵
		    			var oldJamList = [];
		    			if(app.jamList.length > 0){
		    				var oldJamMap = new Map();//覆盖物列表
		    				$.each(app.jamList, function(i,item){
		    					oldJamMap.set(item.eventId,item);
							});
		    				$.each(rslt.jamList, function(i,item){
		    					if(typeof(oldJamMap.get(item.eventId)) == "undefined"){
		    						newJamList.push(item);
			    				}else{
			    					oldJamList.push(item);
			    				}
							});
		    				
		    			}else{
		    				newJamList = rslt.jamList;
		    			}
		    			app.jamList = rslt.jamList;
		    			
		    			$.each(newJamList, function(i,item){
		    				assembleJamDiv(item,true);
						});
		    			$.each(oldJamList, function(i,item){
		    				assembleJamDiv(item,false);
						});
		    			$("#newlyJamCntSpan").html(newJamList?newJamList.length:"0");
		    		}
				}else{
					alert(rslt.msg);
				}
			}
		});
		$('.firstrowcolor').animate({
			left: 0,
		},1000,function () {
			$('.firstrowcolor').css('position', 'static');
		})
		
	};
	
	var assembleJamDiv = function(item,isNew){
		var template = 
			'<div class="panel-heading '+(isNew?"firstrowcolor":"")+'" id="div'+item.eventId+'" >'
					+'<h4 class="panel-title">'
					+'<a data-toggle="collapse" data-parent="#accordionDiv" class="showJam" name="'+item.eventId+"||"+item.xys+'" href="#id_'+item.eventId+'">'
					+'	<span class="text-warning '+(isNew?"firstrowcolorspan":"")+'"><i style="color:#2196F3">['+item.roadName +'] </i>交通拥堵 ( '+item.pubTime+' ):'+ item.startAddr+'</span>'
					+'</a></h4></div>'
					+'<div id=id_'+item.eventId+' class="panel-collapse collapse">'
    				+'<div class="panel panel-default "><div class="form-horizontal" style="width: 500px;">'
    				+'<div class="form-group" style="margin-top: 5px"><div class="col-sm-2 control-label" style="font-size:12px;">处理方式</div>'
    				+'<div class="col-sm-10" ><textarea class="form-control" style=" border: 1px solid #bbbbbb" rows="3" id="'+item.eventId+'"></textarea></div></div>'
    				+'<div class="form-group" style="margin-top: 5px"><div class="col-sm-12">'
    				+'<button class="btn btn-xs btn-primary pull-right confirmJam" name="'+item.eventId+'">确认属实</button>'
    				+'<button class="btn btn-xs btn-warning mistakeJam" name="'+item.eventId+'">误报</button>'
    				+'</div></div></div></div></div>';
		$("#accordionDiv").append(template);
		$(".confirmJam").unbind('click').on("click",function(){
			targetId = this.name;
			$.ajax({
			    url:encodeURI('./jtzx/linkJam/manualConfirmJam?eventId='+this.name+'&manualType=0&handleMethod='+$("#"+this.name).val()),
			    success:function(rslt){
			        if(rslt.code == 200){
			        	$("#div"+targetId).removeClass('firstrowcolor');
			        	$("#id_"+targetId).removeClass('firstrowcolor');
			        	$("#div"+targetId).css('left', 'auto');
			        	$("#div"+targetId).css('position', 'absolute');
			        	$("#id_"+targetId).css('position', 'absolute');
//			        	$("#div"+targetId).addClass('lastrowcolor');
//			        	$("#id_"+targetId).addClass('lastrowcolor');
			        	$("#id_"+targetId).animate({
			        		right:-10999
//							opacity: "hide"
			        	},1000)
			        	$("#div"+targetId).animate({
//			        		opacity: "hide"
			        		right:-10999
			        	},1000);
			        	
			        	layer.msg("确认成功！");
			        }else{
				    	layer.msg("确认失败！");
			        }
			    },
			    error:function(xhr,textStatus){
			    	layer.msg("确认失败！");
			    }
			});
		});
		$(".mistakeJam").unbind('click').on("click",function(){
			targetId = this.name;
			$.ajax({
				url:'./jtzx/linkJam/manualConfirmJam?eventId='+this.name+'&manualType=1',
			    success:function(rslt){
			        if(rslt.code == 200){
			        	$("#div"+targetId).removeClass('firstrowcolor');
			        	$("#id_"+targetId).removeClass('firstrowcolor');
			        	$("#div"+targetId).css('left', 'auto');
			        	$("#div"+targetId).css('position', 'absolute');
			        	$("#id_"+targetId).css('position', 'absolute');
//			        	$("#div"+targetId).addClass('lastrowcolor');
//			        	$("#id_"+targetId).addClass('lastrowcolor');
			        	$("#id_"+targetId).animate({
			        		right:-10999
//							opacity: "hide"
			        	},1000)
			        	$("#div"+targetId).animate({
//			        		opacity: "hide"
			        		right:-10999
			        	},1000);
			        	layer.msg("确认成功！");
			        }else{
				    	layer.msg("确认失败！");
			        }
			    },
			    error:function(xhr,textStatus){
			    	layer.msg("确认失败！");
			    }
			});
		});
		$(".showJam").unbind('click').on("click",function(){
			//alert(this.name);
			var nameVal = this.name.split("||");
			if(nameVal[1] == "undefined"){
				layer.msg("该拥堵信息无位置！");
			}else{
				$.ajax({
					type: "GET",
				    url: './jtzx/linkJam/getByEventId?eventId='+nameVal[0],
				    success: function(rslt){
				    	if(rslt.code === 200){
				    		var jam = rslt.jam;
				    		//定位拥堵范围
							showOnelinkJam(jam);
						}else{
							alert(rslt.msg);
						}
					}
				});
				
			}
		});
	}
	
	var showOnelinkJam = function (jam) {
		map.getOverlayLayer().removeOverlay(infowindow);
    	map.getOverlayLayer().clear(vectors);
		vectors=[];
		var polygonArr = jam.xys.split("#");
		for (var i = 0; i < polygonArr.length; i++) {
			var lnglatarr = [];
			var lnglatStr = polygonArr[i];
			var lnglatArr = lnglatStr.split(";");
			for(var h = 0; h < lnglatArr.length; h++){
				var pos = lnglatArr[h].split(",");
				lnglatarr.push(new IMAP.LngLat(pos[0], pos[1]));
			}
			var polyline=new IMAP.Polyline(lnglatarr, {
				"strokeOpacity" : 1,
				"arrow" : true,
				"strokeColor" : "#FF0000" ,
				"strokeWeight" : 6,
				"strokeOpacity" : 1,
				"strokeStyle" : IMAP.Constants.OVERLAY_LINE_SOLID,
				"editabled" : false
			
			});
			vectors.push(polyline);
    		map.getOverlayLayer().addOverlay(polyline, false);
		}
		setInfoWindow(jam,jam.xy,true);
	}
	
	var setInfoWindow = function(data,lnglat,ishow){
    	var pos = lnglat.split(",");
    	var lnglat=new IMAP.LngLat(pos[0], pos[1]);
    	map.setCenter(lnglat);
    	var content = '<div style="width: 320px; border: solid 1px silver;"><div style="position: relative;background: none repeat scroll 0 0 #F9F9F9; '
    		+' border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;"><div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;'
    		+'line-height: 31px;padding: 0 10px;">'+data.roadName+'</div><img src="./assets/images/close2.gif" style="position: absolute;'
    		+'top: 10px;right: 10px;transition-duration: 0.25s;"'
    		+' onclick="gblMapObjs.closeInfoWindow()"></div><div style="font-size: 12px;color: #212121;padding: 6px;line-height: 20px;background-color: #f5f5f5;'
    		+'height:117px;opacity: 0.8;">'
    		+'<span>起点: <span>'+data.startAddr+'<br><span>终点: <span>'+data.endAddr+'<br><div style="margin:3px -10px; padding:0;border-top: 1px solid #CCC;"></div>'
    		+'时速: '+data.jamSpeed +'  拥堵距离: '+data.jamDist+' <br>持续时间: '+data.longTime+'钟  发生时间: '+data.pubTime
    		+'</div><div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;">'
    		+'<img src="./assets/images/bottom.png"></div></div>';
    	infowindow = new IMAP.InfoWindow(content,{
			size : new IMAP.Size(322,125),
			position:lnglat,
			autoPan : false,
			offset : new IMAP.Pixel(15, 35),
			anchor:IMAP.Constants.LEFT_CENTER,
			type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
		});
		map.getOverlayLayer().addOverlay(infowindow);
		infowindow.autoPan(true);
    }
	
	gblMapObjs.closeInfoWindow = function(){
    	map.getOverlayLayer().removeOverlay(infowindow);
    	map.getOverlayLayer().clear(vectors);
		vectors=[];
    }
	
	var initDataGrid = function(){
		/*var endDt = new Date();
		var startDt = endDt;
		endDt = TUtils.formatDateTime(endDt);
		startDt.setTime(startDt.getTime() - 1000*60*1000);
		startDt = TUtils.formatDateTime(startDt);*/
		var url = "./jw/policeTask/listTodayUnprocessTasks";
		//url += "?startDt="+startDt+"&endDt="+endDt;
		$.ajax({
			type: "GET",
		    url: url,
		    async :false,
		    success: function(rslt){
		    	if(rslt.code === 200){
		    		var tb = document.getElementById('realtimeAlarmTb');
		    		//$("#realTimeJamTB  tr").empty();
		    		if(rslt.alarmTaskList && rslt.alarmTaskList.length > 0){
		    			$("#realtimeAlarmTb").empty();
		    			var newAlarmList = [];
		    			var oldAlarmList = [];
		    			if(app.alarmList.length > 0){
		    				var oldAlarmMap = new Map();//覆盖物列表
		    				$.each(app.alarmList, function(i,item){
		    					oldAlarmMap.set(item.eventId,item);
							});
		    				$.each(rslt.alarmTaskList, function(i,item){
		    					if(typeof(oldAlarmMap.get(item.eventId)) == "undefined"){
		    						newAlarmList.push(item);
			    				}else{
			    					oldAlarmList.push(item);
			    				}
							});
		    			}else{
		    				newAlarmList = rslt.alarmTaskList;
		    			}
		    			app.alarmList = rslt.alarmTaskList;
		    			
		    			$.each(oldAlarmList, function(i,item){
		    				assembleAlarmDiv(tb,item,false);
						});
		    			
		    			$.each(newAlarmList, function(i,item){
		    				assembleAlarmDiv(tb,item,true);
						});
		    			
		    			if(newAlarmList.length > 0){
							if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
		    					var audio = document.getElementById("alarmAlert");
				    			audio.play();
		    				}
		    			}
		    			$("#newlyAlarmCntSpan").html(newAlarmList?newAlarmList.length:"0");
		    			$(".showPos").on('click',function(){
		    				//alert($(this).parents("tr").attr('id'));
		    				//var alarm = app.alarmList[$(this).parents("tr").attr('id')];
		    				clearJwtMarkers();
		    				$.ajax({
		    					type: "GET",
		    				    url: './jw/policeTask/getAlarmTaskByEventId?eventId='+$(this).parents("tr").attr('id'),
		    				    success: function(rslt){
		    				    	if(rslt.code === 200){
		    				    		var alarmVO = rslt.alarmVO;
		    				    		//定位警情信息
		    				    		drawAlarm(alarmVO);
		    						}else{
		    							alert(rslt.msg);
		    						}
		    					}
		    				});
		    			});
		    		}
				}/*else{
					alert(rslt.msg);
				}*/
			}
		});
		$('.firstrowcolor').animate({
			left: 0,
		},1000,function () {
			$('.firstrowcolor').css('position', 'static');
		})
	};
	
	var drawAlarm = function(alarm){
		CustomContextMenu.close();
		if(marker){
			map.getOverlayLayer().removeOverlay(marker);
		}
		if(tool){
			tool.close();
		}
		if(typeof(alarm.longitude)=='undefined'){
			layer.msg("该警情无位置信息！");
			return;
		}
		
		var opts=new IMAP.MarkerOptions();
		opts.anchor = IMAP.Constants.BOTTOM_CENTER;
		opts.icon=new IMAP.Icon("./assets/images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
		var lnglat=new IMAP.LngLat(alarm.longitude, alarm.latitude);
		modifiedLnglat = lnglat;
		if(lnglat){
			map.setCenter(lnglat);
			marker=new IMAP.Marker(lnglat, opts);
			map.getOverlayLayer().addOverlay(marker, true);
			marker.data = alarm;
		}
		marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
	}
	
	var assembleAlarmDiv = function(tb,item,isNew){
		var r1=tb.insertRow(0);
		r1.id = item.eventId;
		r1.className = (isNew?"firstrowcolor":""); 
		/*if(isNew){
			$(r1).attr("class","firstrowcolor");
			//r1.className ="firstrowcolor"; 
			$(r1).attr("style","left: 0px; position: static;");
		}*/
		var c0=r1.insertCell(0);
		c0.innerHTML = "【"+item.eventDtStr+"】: "+item.eventContent +" <b>( "+item.eventAddr+" )</b>";
		c0.className = "showPos";
		if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
			var c1=r1.insertCell(1);
			if(item.manualFlag == '1'){
				c1.innerHTML = "<button class='btn btn-xs btn-primary pull-right addComments' style='width:60px;' name="+item.eventId+">操作</button>";
			}else{
				c1.innerHTML = "<button class='btn btn-xs btn-primary pull-right modifyPosition' name="+item.eventId+"||"+item.longitude+"||"+item.latitude+">位置修正</button>" +
				"<br/><button class='btn btn-xs btn-primary pull-right addComments' style='width:60px;' name="+item.eventId+">操作</button>";
			}
		}
		
		$(".addComments").unbind('click').on("click",function(){
			//$(this).css('background-color', 'green');
			app.alarmTask.eventId = this.name;
			app.alarmTask.processContent = "";
			$("#processContent option:first").prop("selected", 'selected');
			$("#descText").val("");
			$("#descText").hide();
			layer.open({
				type: 1,
				skin: 'layui-layer',
				title: ["编辑警情"],
				area: ['480px', '220px'],
				shade: false,
				content: jQuery("#postAlarmTaskDiv"),
				btn: []
			});
			$('#processContent').on('change',function(){
				//判断是否选取prompt属性，无返回值；
				    if($(this).val() == '其他'){
				    	$("#descText").show();
				    }else{
				    	$("#descText").val("");
				    	$("#descText").hide();
				    }
				});
		});

		$(".modifyPosition").unbind('click').on("click",function(){
			CustomContextMenu.close();
			if (marker) {
				map.getOverlayLayer().removeOverlay(marker);
			}
			if(tool){
				tool.close();
			}
			var nameVal = this.name.split("||");
			//2018年7月30日14:34:15 根据客户需求 警情修改位时   不管以前有没有点位都直接出来图标 让客户修改
			tool = new IMAP.MarkerTool(new IMAP.Icon(("./assets/images/alarmTask.png"), new IMAP.Size(31, 31)));
			tool.follow=true;
			tool.autoClose=true;
			tool.title="点击左键标注点位";
			map.addTool(tool);
			tool.open();
			tool.addEventListener(IMAP.Constants.ADD_OVERLAY, function(e) {
				tool.close();
				marker = e.overlay;
				//markers.push(marker);
				modifiedLnglat = new IMAP.LngLat(marker.f._latlng.lng, marker.f._latlng.lat);
				//modifiedLnglat = marker.f._latlng.lng+","+marker.f._latlng.lat;
				marker.data = {longitude:marker.f._latlng.lng,latitude:marker.f._latlng.lat};
				marker.editable(true);
				marker.addEventListener(IMAP.Constants.DRAG_END, function(e) {
					modifiedLnglat = e.lnglat;
				});
				marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
			});
			/*if(nameVal[1] == "undefined"){
				// 没有坐标点位
			}else{
				
        		var opts=new IMAP.MarkerOptions();
        		opts.anchor = IMAP.Constants.BOTTOM_CENTER;
        		opts.icon = new IMAP.Icon("./assets/images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
        		var lnglat = new IMAP.LngLat(nameVal[1], nameVal[2]);
        		if(lnglat){
        			map.setCenter(lnglat);
        			marker=new IMAP.Marker(lnglat, opts);
        			map.getOverlayLayer().addOverlay(marker, false);
        			marker.data = {eventId:nameVal[0],longitude:nameVal[1],latitude:nameVal[2]};
        		}
        		marker.editable(true);
			    marker.addEventListener(IMAP.Constants.DRAG_END, function(e) {
			    	modifiedLnglat = e.lnglat;
				});
			    marker.addEventListener(IMAP.Constants.MOUSE_CONTEXTMENU, rightClick);
				layer.msg("请移动警情图标，以纠正警情位置！", {offset: '350px'});
			}*/
			targetId = nameVal[0];
			
		});
	}
	
	//左侧滑块效果
	function leftSilder(){
		/**
		 * 滑过显示,滑出隐藏
		 */
		//two
		var boxs = document.getElementById('sideBarTableft');
		var b3 = window.getComputedStyle? window.getComputedStyle(boxs).left : boxs.currentStyle.left;
		var hid=true;
		$('#sideBarTableft').click(function(){
			if(hid){
				$("#realtimeAlarm-panel").animate({
			        opacity: "hide"
			       }, "slow");
				document.getElementById('realtimeAlarm-panel').style.left=0;
				$(this).css('background','url("./assets/images/slide-kai.png") no-repeat');
				//hide();
			}else{
				document.getElementById('realtimeAlarm-panel').style.display = 'block';
				document.getElementById('realtimeAlarm-panel').style.left=b3;
				$(this).css('background','url("./assets/images/slide-sou.png") no-repeat');
			}
			hid=!hid
		});

	}
	
	var formatDateTime = function(date) {
	    var seperator1 = "-";
	    var seperator2 = ":";
	    var month = date.getMonth() + 1;
	    var day = date.getDate();
	    if (month >= 1 && month <= 9) {
	        month = "0" + month;
	    }
	    if (day >= 0 && day <= 9) {
	        day = "0" + day;
	    }
		    
	    var hours = date.getHours();
		var mins = date.getMinutes();
		var secs = date.getSeconds();
		var msecs = date.getMilliseconds();
		if (hours < 10){
			hours = "0" + hours;
		}
		if (mins < 10){
			mins = "0" + mins;
		}
		if (secs < 10){
			secs = "0" + secs;
		}
		if (msecs < 10){
			secs = "0" + msecs;  
		}
	    
	    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + day
	            + " " + hours + seperator2 + mins + seperator2 + secs;
	    return currentdate;
	}
	
	return {
		showLayer:showLayer,
		clearJwtMarkers:clearJwtMarkers
	}
});

var togglePanelBody = function (){
	if($("#realtime_alarm_panel_ud").hasClass('fa-chevron-up')){
		$(".alarm-panel-body").hide(100);
		$("#realtime_alarm_panel_ud").removeClass('fa-chevron-up');
		$("#realtime_alarm_panel_ud").addClass('fa-chevron-down');
		showToolBtns = false;
	}else{
		$(".alarm-panel-body").show(100);
		$("#realtime_alarm_panel_ud").removeClass('fa-chevron-down');
		$("#realtime_alarm_panel_ud").addClass('fa-chevron-up');
		showToolBtns = true;
	}
}



