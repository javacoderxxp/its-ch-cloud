define(function(require){
	var map = require('mainMap');
	//require('datetimepicker');
	require('my97Datepicker');
	var htmlStr = require('text!./trackSearch.html');
	var Vue = require('vue');
	var tracemarkers = [];
	var polyline;
	var marker;
	var type;
	var status;
	var pathq;
	var mmm;
	var markerQd;
	var markerZd;
	var ne;
	var fromGps;
	var fromGroup;
	var showLayer = function(param,fromGps,fromGroup) {
		// init left panel
		itsGlobal.showLeftPanel(htmlStr);
		marker = param;
		fromGps = fromGps;
		fromGroup = fromGroup;
		map.getOverlayLayer().removeOverlay(marker);
		type = param.data.type;
		status = param.data.status;
		var app = new Vue({
			el : '#trackSearch-panel',
			data : {
				gpsId:param.data.gpsId,
				type:param.data.type,
				policeNo:param.data.policeNo,
				sd:''
			},
			methods :{
				close: function(){
					app.cleanPlony();
					hide();
				},
				query: function(){
					app.cleanPlony();
					var startDt = $("#startDt").val();
					var endDt = $("#endDt").val();
					var url="";
					if(app.type == '2'){
						url = "jw/gpsDevice/trackSearch?startDt="+startDt+"&endDt="+endDt+"&policeNo="+app.policeNo;
						ne=param.data.ne;
						if(!ne){
							ne=param.data.policeNo;
						}
					}else{
						url = "jw/gpsDevice/trackSearch?startDt="+startDt+"&endDt="+endDt+"&gpsId="+app.gpsId;
						ne=param.data.ne;
					}
					
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
				toggleStopMove:function (){//停止
					if(markerPc){
			    		markerPc.stopMove();
					}
				},
				togglePauseMove:function (){//暂停
					if(markerPc){
			    		markerPc.pauseMove();
			    		$("#zt").show();
			    		$("#bf").hide();
					}
				},
				variableSpeed:function (){
					if(markerPc){
			    		markerPc.pauseMove();
			    		togglePlayback('',pathq,mmm);
			    		$("#bf").show();
			    		$("#zt").hide();
					}
				},
				jixuMove:function (){//继续
					if(markerPc){
						togglePlayback('',pathq,mmm);
					}
					$("#zt").hide();
		    		$("#bf").show();
				},
				backToList: function(){
					switch (fromGps) {
					case 'Jwt':
						require(['layers/policeControl/policeJwt'],function(jwt){
							jwt.showLayer(true, null, fromGroup);
						});
						break;
					case 'Car':
						require(['layers/policeControl/policeCar'],function(jwt){
							jwt.showLayer(true, null, fromGroup);
						});
						break;
					case 'Radio':
						require(['layers/policeControl/policeRadio'],function(jwt){
							jwt.showLayer(true, null, fromGroup);
						});
						break;
					}
				},
				cleanPlony:function (){
					toggleStopMove();
					if(markerPc){
						map.getOverlayLayer().removeOverlay(markerPc);
					}
					if(markerQd){
						map.getOverlayLayer().removeOverlay(markerQd);
					}
					if(markerZd){
						map.getOverlayLayer().removeOverlay(markerZd);
					}
					markerPc="";
					if(polyline){
						map.getOverlayLayer().removeOverlay(polyline);
					}
					for (var i = 0; i < tracemarkers.length; i++) {
						map.getOverlayLayer().removeOverlay(tracemarkers[i]);
					}
					//清除聚合图
					tracemarkers = [];
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd HH:mm:ss'});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd HH:mm:ss'});
				}
			}
		});
		app.gpsId = param.data.gpsId;
		//$(".form_datetime").datetimepicker({language: "zh-CN", format: 'yyyy-mm-dd hh:ii:ss', autoclose: true});
		var currDt = TUtils.formatDateTime000(new Date());
		var currDtTm = TUtils.formatDate(new Date()) + " 23:59:59";
		
		if(param.data.startDt){
			currDt = param.data.startDt;
		}
		$("#startDt").val(currDt);
		$("#endDt").val(currDtTm);
		
		vueEureka.set("leftPanel", {
			vue: app,
			description: "trackSearch的vue实例"
		});
	}
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.CENTER;
	var drawTrack = function(dataList){
		if(type == '2'){
			markerOpts.icon = new IMAP.Icon("./assets/images/policehui.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
		}else if(type == '3'){
			markerOpts.icon = new IMAP.Icon("./assets/images/350Mhui.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
		}else{
			markerOpts.icon = new IMAP.Icon("./assets/images/policeCarhui.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
		}
		var inglatarr = [];
		var lt="";
		var modian="";
		var mp = new Map();
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
			var lnglat = new IMAP.LngLat(lot,lat);
			if(i==0){
				lt=lnglat;
				markerOpts.icon = new IMAP.Icon("./assets/images/qidian.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				markerQd = new IMAP.Marker(lnglat, markerOpts);
				map.getOverlayLayer().addOverlay(markerQd, false);
				markerQd.setLabel(police.gpsUpdateDt, IMAP.Constants.BOTTOM_CENTER, new IMAP.Pixel(0,-25));
			}
			if(i== dataList.length-1){
				markerOpts.icon = new IMAP.Icon("./assets/images/zhongdian.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				markerZd = new IMAP.Marker(lnglat, markerOpts);
				map.getOverlayLayer().addOverlay(markerZd, false);
				markerZd.setLabel(police.gpsUpdateDt, IMAP.Constants.BOTTOM_CENTER, new IMAP.Pixel(0,-25));
			}
			inglatarr.push(lnglat);
			//console.log(lot+','+lat);
			mp.set(lot+','+lat,police.gpsUpdateDt);
			/*if(status == 0 && i == dataList.length-1){
				if(type == '2'){
					markerOpts.icon = new IMAP.Icon("./assets/images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}else if(type == '3'){
					markerOpts.icon = new IMAP.Icon("./assets/images/350M.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}else{
					markerOpts.icon = new IMAP.Icon("./assets/images/policeCar.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}
			}
			var marker = new IMAP.Marker(lnglat, markerOpts);
			//marker.data = police;
			map.getOverlayLayer().addOverlay(marker, false);
			marker.setLabel("["+(i+1)+"] ", IMAP.Constants.BOTTOM_CENTER, new IMAP.Pixel(0,-25));
			marker.setTitle(police.gpsUpdateDt);
			tracemarkers.push(marker);*/
		}
		var opt = new IMAP.PolylineOptions();
		opt.strokeColor = "#ff0000";
		opt.strokeOpacity = "1";
		opt.strokeWeight = "3";
		opt.strokeStyle = IMAP.Constants.OVERLAY_LINE_DASHED;//虚线
		opt.editabled = false;
		opt.strokeStyle = "1";
		opt.arrow = true
		polyline = new IMAP.Polyline(inglatarr, opt);
		map.getOverlayLayer().addOverlay(polyline, false);
		togglePlayback(lt,inglatarr,mp);
		pathq=inglatarr;
		mmm=mp;	
	}
	
	var hide = function(){
		toggleStopMove();
		if(markerPc){
			map.getOverlayLayer().removeOverlay(markerPc);
		}
		markerPc="";
		if(marker instanceof IMAP.Overlay){
			map.getOverlayLayer().removeOverlay(marker);
		}
		itsGlobal.hideLeftPanel();
		if(polyline){
			map.getOverlayLayer().removeOverlay(polyline);
		}
		for (var i = 0; i < tracemarkers.length; i++) {
			map.getOverlayLayer().removeOverlay(tracemarkers[i]);
		}
		//清除聚合图
		tracemarkers = [];
	}
	
	
	var markerPc="";
	var line=null;
	var togglePlayback = function(lnglat,path,mp) {
    	if(map){
    		if(!markerPc){
    			var opts=new IMAP.MarkerOptions();
				opts.anchor =  IMAP["Constants"]["BOTTOM_CENTER"];
				if(type == '2'){
					opts.icon = new IMAP.Icon("./assets/images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}else if(type == '3'){
					opts.icon = new IMAP.Icon("./assets/images/350M.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}else{
					opts.icon = new IMAP.Icon("./assets/images/policeCar.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				}
				//opts.icon=new IMAP.Icon("./assets/images/police.png",new IMAP.Size(32,32), new IMAP.Pixel(0, 0));

				if(lnglat){
					markerPc=new IMAP.Marker(lnglat, opts);
					map.getOverlayLayer().addOverlay(markerPc, true);
					markerPc.setAngleOffsetX(52/2);
					markerPc.setAnchor(IMAP.Constants.CENTER);
					markerPc.setOffset(new IMAP.Pixel(0, 0));
					markerPc.addEventListener(IMAP.Constants.MOVING,function(e){
	                    var location = e.lnglat;
	                    //console.log(location.lng+','+location.lat);
	                    var sj = mp.get(location.lng+','+location.lat);
	                    if(sj != "" && sj != undefined && sj != null){
	                    	//console.log(sj);
	                    	markerPc.setLabel("("+ne+")"+sj,{
	                    		offset: new IMAP.Pixel(0,-35),
	                    		anchor: IMAP.Constants.TOP_CENTER });
	                    }
	                });
				}
			}
			map.setBestMap(path);
			/*if(line){
				line.setPath(path);
			}else{
				line=new IMAP.Polyline(path,{strokeColor:"#ff0000"});
				map.getOverlayLayer().addOverlay(line);
			}*/
			var s = Sdword($("#sd").val());
			markerPc.moveAlong(path,s,true,false);
			$("#bf").show();
		}
    }
	
	  //暂停运动
    function togglePauseMove(){
    	if(markerPc){
    		markerPc.pauseMove();
		}
    }
    //停止运动
    function toggleStopMove() {
    	if(markerPc){
    		markerPc.stopMove();
		}
    }
	
    
    var Sdword = function(type){
		var word = 50;
		switch (type) {
		case '-1':
			word = 35;
			break;
		case '-2':
			word = 20;
			break;
		case '-3':
			word = 5;
			break;
		case '1':
			word = 75;
			break;
		case '2':
			word = 100;
			break;
		case '3':
			word = 150;
			break;
		default:
			break;
		}
		return word;
	}
	return {
		showLayer:showLayer,
		hide:hide()
	}
	
})