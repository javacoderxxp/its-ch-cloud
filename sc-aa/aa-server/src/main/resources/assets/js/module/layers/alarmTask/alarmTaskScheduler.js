define(function(require) {
	var map = require('mainMap');
	var points = [];//覆盖物列表
	var dataList = [];//数据列表
	var pointCollection = null;
	var timeInterval = 60000; //每分钟
	
	var icon_alarm = new IMAP.Icon("./assets/images/alarmTask.png", new IMAP.Size(31, 31), new IMAP.Pixel(0, 0));
	var opt_alarm = {
		size: 6,
		icon: icon_alarm
	}
	
	var t  //计时器对象
	var flash_show
	var flash_hide
	var init = function(){
		clear();
		t = setInterval(loadData,timeInterval);   // 5s请求一次
	};
	
	var loadData = function(){
		var url = "jw/policeTask/getLastedAlarmTask?fromClient=0";
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rstl){
		    	if(rstl.code === 200){
		    		clear();
					dataList = rstl.alarmList;
					applyDataToUI();
				}else{
					clearInterval(t);
					alert(rstl.msg);
				}
			}
		});
	};
	
	var applyDataToUI = function(){
		//语音播报
		if(dataList.length > 0){
			//$("#alarmAlert").play();//.attr("src","./assets/audio/xjq.mp3");
			var audio = document.getElementById("alarmAlert");
			audio.play();
		}
		//地图描绘点位
		for(var i = 0; i < dataList.length; i++){
			var alarm = dataList[i];
			var pointData = {lnglat:new IMAP.LngLat(alarm.longitude, alarm.latitude), data: alarm};
			points.push(pointData);
		}
		pointCollection = new IMAP.PointCollection(points, opt_alarm);
		pointCollection.addEventListener(IMAP.Constants.MOUSE_UP, markerClick);
		//map.getOverlayLayer().addOverlay(pointCollection);
		flash_show = setInterval(iconShow,1000);
		flash_hide = setInterval(iconHide,2000);
	};
	
	var iconHide = function(){
		map.getOverlayLayer().removeOverlay(pointCollection);
	}
	
	var iconShow = function(){
		map.getOverlayLayer().addOverlay(pointCollection);
	}
	
	var clear = function(){
		if(pointCollection){
			pointCollection.destroy();
			pointCollection = null;
		}
		points=[];
		//清除数据
		dataList = [];
		//停止先前的计时器
		clearInterval(flash_show);
		clearInterval(flash_hide);
	};
	
	//单击事件
	var markerClick = function(e) {
		var alarm = e.data;
		
		var content = '<div style="width: 320px;border: solid 1px silver;">'
			   +'<div style="position: relative;background: none repeat scroll 0 0 #F9F9F9;    border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;">'
	    +'<div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;line-height: 31px;padding: 0 10px;">警情信息</div>'
	    +'<img class="tt" src="./assets/images/close.png" style="position: absolute;top: 10px;right: 10px;transition-duration: 0.25s;"/>'
	   +'</div><div style="font-size: 12px;padding: 6px;line-height: 20px;background-color: white;height:120px;">'
	   +'<b><i>报警时间:</i></b>'+(typeof(alarm.eventDtStr)=='undefined'?'':alarm.eventDtStr)+'<br />'
	   +'<b><i>案发地址:</i></b>'+(typeof(alarm.eventAddr)=='undefined'?'':alarm.eventAddr)
		+'<br /><b><i>警情详情:</i></b>'+(typeof(alarm.eventContent)=='undefined'?'':alarm.eventContent)+'<br /></div>'
	   +'<div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;"></div></div>'
		infoWindow = new IMAP.InfoWindow(content,{
			size:new IMAP.Size(322,103),
			position:new IMAP.LngLat(alarm.longitude,alarm.latitude),
			autoPan:false,
			offset: new IMAP.Pixel(45,75),
			anchor:IMAP.Constants.BOTTOM_CENTER,
			type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
		});
		map.getOverlayLayer().addOverlay(infoWindow);
		infoWindow.autoPan(true);
		
		$(".tt").on( "click", function() {
	    	closeInfoWindow();
		});
	};
	
	var closeInfoWindow = function(){
    	if (map && infoWindow) {
    		map.getOverlayLayer().removeOverlay(infoWindow);
    	}
    };
    
	return{
		init: init
	}
})

