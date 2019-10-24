$(function() {
	$("#content").html("<object id='PlayViewOCX' name='ocx' classid='clsid:D5E14042-7BF6-4E24-8B01-2F453E8154D7' " +
			"style='min-width:320px; min-height:400px' width='100%' height='92%'></object>");
//	$('#PlayViewOCX').attr('width',window.screen.width - $('.main-sidebar').width());
//	$('#PlayViewOCX').attr('height',window.screen.height - 150);
	init();
	var cameraId = $.getUrlParam('cameraId');
	if(cameraId == "-1") {
		var posion = $.getUrlParam('posion');
		var tuPreArr = posion.split(";");
		for(var i = 0; i < tuPreArr.length; i++){
			var tuPre = tuPreArr[i].split(",");
			var tu = tuPre[0];
			var Pre = tuPre[1];
			$.ajax({
				url: '/sc-itsweb/dev/videoCamera/getPreviewParam?cameraIndexCode=' +tu,
				type: 'GET',
				async: false,
				success: function(dat) {
					var i = StartPlayView_Free(dat.replace(/[\\]/g, ""));
					
					if(i !=-1){
						win_tunnel_map.set(i,{tunnel:tu,prePos:Pre});
					}
				},
				error: function(xhr, textStatus) {
					layer.msg("获取预览xml失败！");
				}
			});
		}
	} else {
		var initCodes = cameraId.split(",");
		for(var i = 0; i < initCodes.length; i++) {
			var tunnel = initCodes[i];
			$.ajax({
				url: '/sc-itsweb/dev/videoCamera/getPreviewParam?cameraIndexCode=' +tunnel,
				type: 'GET',
				async: false,
				success: function(dat) {
					var i = StartPlayView_Free(dat.replace(/[\\]/g, ""));
					
					if(i !=-1){
						win_tunnel_map.set(i,{tunnel:tunnel});
					}
				},
				error: function(xhr, textStatus) {
					layer.msg("获取预览xml失败！");
				}
			});
		}
	}
});

function playVideoWithWindow(cameraIndexCode) {
	var codes = cameraIndexCode.split(",");
	for(var i = 0; i < codes.length; i++) {
		var tunnel = codes[i];
		$.ajax({
			url: '/sc-itsweb/dev/videoCamera/getPreviewParam?cameraIndexCode=' + tunnel,
			type: 'GET',
			async: false,
			success: function(dat) {
				var i = StartPlayView_Free(dat.replace(/[\\]/g, ""));
				
				if(i !=-1){
					win_tunnel_map.set(i,{tunnel:tunnel});
				}
			},
			error: function(xhr, textStatus) {
				layer.msg("获取预览xml失败！");
			}
		});
	}
}

function playVideoWithRan(posion) {
	var tuPreArr = posion.split(";");
	for(var i = 0; i < tuPreArr.length; i++){
		var tuPre = tuPreArr[i].split(",");
		var tu = tuPre[0];
		var Pre = tuPre[1];
		$.ajax({
			url: '/sc-itsweb/dev/videoCamera/getPreviewParam?cameraIndexCode=' +tu,
			type: 'GET',
			async: false,
			success: function(dat) {
				var i = StartPlayView_Free(dat.replace(/[\\]/g, ""));
				
				if(i !=-1){
					win_tunnel_map.set(i,{tunnel:tu,prePos:Pre});
				}
			},
			error: function(xhr, textStatus) {
				layer.msg("获取预览xml失败！");
			}
		});
	}
}
/*****实时预览******/
function StartPlayView() {
	var OCXobj = document.getElementById("PlayViewOCX");
	var previewXml = document.getElementById("config").value;
	var ret = OCXobj.StartTask_Preview_InWnd(previewXml, 0);
}
/*****指定窗口实时预览******/
function StartPlayView_InWnd() {
	var OCXobj = document.getElementById("PlayViewOCX");
	var previewXml = document.getElementById("config").value;
	var wndNum = document.getElementById("SelectWnd").value;
	OCXobj.SelWindow(parseInt(wndNum))
	var ret = OCXobj.StartTask_Preview_InWnd(previewXml, 0);
}
/*****空闲窗口实时预览******/
function StartPlayView_Free(previewXml) {
	var OCXobj = document.getElementById("PlayViewOCX");
	return OCXobj.StartTask_Preview_FreeWnd(previewXml);
}
/*****停止所有预览******/
function StopPlayView() {
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StopAllPreview();
}
/*****设置抓图格式为JPG******/
function CatchPicJPG() {
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.SetCapturParam("C:\\pic", 0);
}
/*****设置抓图格式为BMP******/
function CatchPicBMP() {
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.SetCapturParam("C:\\pic", 1);
}
/*****云台：左上******/
function PTZLeftUp() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(25, speed);
}
/*****云台：左上 停止******/
function PTZLeftUpStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-25, speed);
}
/*****云台：上******/
function PTZUp() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(21, speed);
}
/*****云台：上 停止******/
function PTZUpStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-21, speed);
}
/*****云台：右上******/
function PTZRightUp() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(26, speed);
}
/*****云台：右上 停止******/
function PTZRightUpStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-26, speed);
}
/*****云台：左******/
function PTZLeft() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(23, speed);
}
/*****云台：左 停止******/
function PTZLeftStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-23, speed);
}
/*****云台：自转******/
function PTZAuto() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(29, speed);
}
/*****云台：右******/
function PTZRight() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(24, speed);
}
/*****云台：右 停止******/
function PTZRightStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-24, speed);
}
/*****云台：左下******/
function PTZLeftDown() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(27, speed);
}
/*****云台：左下 停止******/
function PTZLeftDownStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-27, speed);
}
/*****云台：下******/
function PTZDown() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(22, speed);
}
/*****云台：下 停止******/
function PTZDownStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-22, speed);
}
/*****云台：右下******/
function PTZRightDown() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(28, speed);
}
/*****云台：右下 停止******/
function PTZRightDownStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-28, speed);
}
/*****云台：焦距+******/
function PTZAddTimes() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(11, speed);
}
/*****云台：焦距+ 停止******/
function PTZAddTimesStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-11, speed);
}
/*****云台：焦距-******/
function PTZMinusTimes() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(12, speed);
}
/*****云台：焦距- 停止******/
function PTZMinusTimesStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-12, speed);
}
/*****云台：焦点+******/
function PTZFarFocus() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(13, speed);
}
/*****云台：焦点+ 停止******/
function PTZFarFocusStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-13, speed);
}
/*****云台：焦点-******/
function PTZNearFocus() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(14, speed);
}
/*****云台：焦点- 停止******/
function PTZNearFocusStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-14, speed);
}
/*****云台：光圈+******/
function PTZLargeAperture() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(15, speed);
}
/*****云台：光圈+ 停止******/
function PTZLargeApertureStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-15, speed);
}
/*****云台：光圈-******/
function PTZSmallAperture() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(16, speed);
}
/*****云台：光圈- 停止******/
function PTZSmallApertureStop() {
	var speed = $('#ptzSpeed').val();
	var OCXobj = document.getElementById("PlayViewOCX");
	OCXobj.StartTask_PTZ(-16, speed);
}
/*****云台：调用预置点******/
function GetPt() {
	var OCXobj = document.getElementById("PlayViewOCX");
	ptNum = document.getElementById("sel_preset").value;
	var ret = OCXobj.PTZCtrlGotoPreset(ptNum);

}
/*****云台：设置预置点******/
function SetPt() {
	var OCXobj = document.getElementById("PlayViewOCX");
	ptNum = document.getElementById("sel_preset").value;

	var ret = OCXobj.PTZCtrlSetPreset(parseInt(ptNum));

}

function init() {
	var OCXobj = document.getElementById("PlayViewOCX");
	try {
		OCXobj.SetOcxMode(0);
	} catch (e) {
		
	}
}

function setPrePosition(tunnel,posId){
	var winNum = null;
	win_tunnel_map.forEach(function(v,k){
		if(v && v.tunnel && v.tunnel == tunnel){
			winNum = k;
		}
	})
	if(null == winNum){
		return -3; //无相应窗口
	}
	var OCXobj = document.getElementById("PlayViewOCX");
	var rsel = OCXobj.SelWindow(winNum);
	if(null == rsel || rsel == -1){
		return -2; //设置窗口选中失败
	}
	var ret = OCXobj.PTZCtrlSetPreset(posId);
	if(ret == -1){
		return -1; //设置预置位失败
	}else if(ret == 0){
		return 0; //设置预置位成功
	}
}