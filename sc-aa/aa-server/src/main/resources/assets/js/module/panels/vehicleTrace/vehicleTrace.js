define(function(require) {
	var htmlStr = require('text!./vehicleTrace.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/vehicle.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.CENTER;

	var vehicleTracemarkers = [];
	var vehicleTracePath = [];
	var vehicleTracePolyline = null;
	
	var show = function(showPopup) {
		itsGlobal.showLeftPanel(htmlStr, showPopup);
		vm = new Vue({
			el: '#vehicleTrace-panel',
			data: {
				showPopup: showPopup,
				showList:false,
				dataList:[],
				plateNoList:[],
				isPNList:false,
				//vehiclePassQ:{startDt: '2017-11-05 00:00:00', endDt: '2017-11-07 00:00:00', plateNo:'苏EKP678', dataSrc:'DJGC'},
				vehiclePassQ:{startDt: TUtils.formatDateTime000(new Date()), endDt: TUtils.formatDate(new Date())+" 23:59:59", plateNo:'苏EKP678', dataSrc:'DJGC'},
			},
			methods: {
				query: function() {
					var url = "video/vehiclePass/findVehiclePassTraceList";
					if(vm.vehiclePassQ.dataSrc != 'DJGC'){//高清过车
						url = "http://192.168.14.4:8700/sc-videoGateway/video/vehiclePass/findVehiclePassTraceList";
					}
					if(vm.vehiclePassQ.plateNos){
						vm.vehiclePassQ.plateNo = vm.vehiclePassQ.plateNos;
					}
					layer.load();
					$.ajax({
						url: url,
						type: 'GET',
						data: vm.vehiclePassQ,
						success: function(rslt){
							layer.closeAll('loading');
							if(rslt.code == 200){
								vm.dataList = rslt.vehiclePassTraceList;
								vm.showList = true;
								vm.applyDataToUI();
							}else{
								alert(rslt.msg);
							}
						},
						error: function(r1, r2, r3){
							layer.closeAll('loading');
							alert('查询出错！');
						}
					});
					
				},
				//数据应用到视图
				applyDataToUI : function() {
					vm.clearVehicleTrace();
					vehicleTracePath = [];
					vehicleTracemarkers =[];
					var ll=null;
					if(vm.dataList.length>0){
						for(var i = 0; i < vm.dataList.length; i++){
							var obj = vm.dataList[i];
							if(obj.shape){
								var pos = obj.shape.split(",");
								//增加数据点位
								var lnglat = new IMAP.LngLat(pos[0],pos[1]);
								if(i==0){
									ll=lnglat;
								}
								vehicleTracePath.push(lnglat);
								
								var marker = new IMAP.Marker(lnglat, markerOpts);
								marker.data = obj;
								map.getOverlayLayer().addOverlay(marker, false);
								marker.setLabel("["+(i+1)+"] "+obj.captureDt+"<br/>("+obj.deviceName+")", IMAP.Constants.BOTTOM_CENTER, new IMAP.Pixel(0,-25));
								vehicleTracemarkers.push(marker);
							}
						}
						vehicleTracePolyline = new IMAP.Polyline(vehicleTracePath, {
							'editable': false,
							"arrow": true,
							"strokeColor" : "blue",
							"strokeOpacity" : 1,
							"strokeWeight" : 3,
							"strokeStyle" : "solid",
						});
						map.getOverlayLayer().addOverlay(vehicleTracePolyline, true);
						
						togglePlayback(ll,vehicleTracePath);
					}
				},
				clearVehicleTrace: function(){
					toggleStopMove();
					if(markerPc){
						map.getOverlayLayer().removeOverlay(markerPc);
					}
					markerPc="";
					//清除界面
					for (var i = 0; i < vehicleTracemarkers.length; i++) {
						map.getOverlayLayer().removeOverlay(vehicleTracemarkers[i]);
					}
					map.getOverlayLayer().removeOverlay(vehicleTracePolyline);
					//清除聚合图
					vehicleTracemarkers = [];
					vehicleTracePath = [];
					vehicleTracePolyline = null;
				},
				clear: function(){
					if(vm.vehiclePassQ.plateNos){
						vm.isPNList=true;
					}else{
						vm.isPNList=false;
					}
					vm.clearVehicleTrace();
					//清除数据
					vm.dataList = [];
					var plateNos = vm.vehiclePassQ.plateNos;
					vm.vehiclePassQ = {startDt: TUtils.formatDateTime000(TUtils.setDate(new Date())), 
							endDt: TUtils.formatDateTime(TUtils.setDate(new Date())), plateNos:plateNos,
							plateNo:'苏EKP678', dataSrc:'DJGC'}
				},
	    		locateVehPassEp: function(shape){
					if(shape){
						var pos = shape.split(",");
						var lnglat = new IMAP.LngLat(pos[0],pos[1]);
						/*map.setZoom(18);
						map.panTo(lnglat);*/
						map.setCenter(lnglat,17);
						map.setCenter(lnglat,18);
					}
	    		},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.vehiclePassQ.startDt = $("#startDtQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.vehiclePassQ.endDt = $("#endDtQ").val()}});
				},
				close: function() {
					vm.clear();
					hide();
				}
			}
		});
		
		/*require(['datetimepicker'],function(){
			$('.form_datetime').datetimepicker({
				language: "zh-CN",
				format : "yyyy-mm-dd hh:ii:00",//日期格式
				autoclose: true,
			}).on('changeDate', function (ev) {
				var startDt = $("#startDtQ").val();
				$("#endDtQ").datetimepicker('setStartDate', startDt);
				var endDt = $("#endDtQ").val();
				$("#startDtQ").datetimepicker('setEndDate', endDt);
			}).on('hide', function (ev) {
				vm.vehiclePassQ.startDt = $("#startDtQ").val();
				vm.vehiclePassQ.endDt = $("#endDtQ").val();
			});
		})*/
		if(vm.showPopup){
			vueEureka.set("globalPopupPanel", {
				vue: vm,
				description: "vehicleTrace的vue实例"
			});
		}else{
			vueEureka.set("leftPanel", {
				vue: vm,
				description: "vehicleTrace的vue实例"
			});
		}
	}
	var hide = function() {
		itsGlobal.hideLeftPanel(vm.showPopup);
	}
	
	
	var markerPc="";
	var line=null;
	var togglePlayback = function(lnglat,path) {
    	if(map){
    		if(!markerPc){
    			var opts=new IMAP.MarkerOptions();
				opts.anchor =  IMAP["Constants"]["BOTTOM_CENTER"];
				opts.icon = new IMAP.Icon("./assets/images/kdc.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
				//opts.icon=new IMAP.Icon("./assets/images/police.png",new IMAP.Size(32,32), new IMAP.Pixel(0, 0));

				if(lnglat){
					markerPc=new IMAP.Marker(lnglat, opts);
					map.getOverlayLayer().addOverlay(markerPc, true);
					markerPc.setAngleOffsetX(52/2);
					markerPc.setAnchor(IMAP.Constants.CENTER);
					markerPc.setOffset(new IMAP.Pixel(0, 0));
				}
			}
			map.setBestMap(path);
			/*if(line){
				line.setPath(path);
			}else{
				line=new IMAP.Polyline(path,{strokeColor:"#ff0000"});
				map.getOverlayLayer().addOverlay(line);
			}*/
			markerPc.moveAlong(path,50,true,false);
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

	var loadCarTrace =  function(showPopup,carNo,startDt,endDt){
		show(showPopup);
		if(carNo){
			if(carNo.indexOf(',') >= 0){
				vm.plateNoList=[];
				var ale = carNo.split(",");
				for(var i=0;i<ale.length;i++){
					vm.plateNoList.push('苏'+ ale[i]);
				}
				vm.vehiclePassQ.plateNos =vm.plateNoList[0];
				vm.isPNList=true;
			}else{
				if(carNo.indexOf('苏') >= 0){
					vm.vehiclePassQ.plateNo =carNo;
				}else{
					vm.vehiclePassQ.plateNo ='苏'+carNo;
				}
				vm.isPNList=false;
			}
		}
		if(startDt){
			vm.vehiclePassQ.startDt =TUtils.formatDateTime(aa()) ;
		}
		if(endDt){
			vm.vehiclePassQ.endDt = startDt;
		}
		//vm.vehiclePassQ.startDt = '2017-11-05 00:00:00';
		//vm.vehiclePassQ.endDt = '2017-11-07 00:00:00';
	}
	var aa = function(){
		var dd = new Date();
		dd.setDate(dd.getDate()-1);
		return dd;
	}
	return {
		show: show,
		hide: hide,
		loadCarTrace:loadCarTrace
	};
})