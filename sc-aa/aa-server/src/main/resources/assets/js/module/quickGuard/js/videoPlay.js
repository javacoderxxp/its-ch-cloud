$(function() {
	$("#video-content").html("<object id='PlayViewOCX' name='ocx' classid='clsid:D5E14042-7BF6-4E24-8B01-2F453E8154D7' " +
			"style='min-width:480px; min-height:720px' width='100%' height='92%'></object>");
	init();
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
			},
			error: function(xhr, textStatus) {
				layer.msg("获取预览xml失败！");
			}
		});
	}
}


function init() {
	var OCXobj = document.getElementById("PlayViewOCX");
	try {
		OCXobj.SetOcxMode(0);
	} catch (e) {
		
	}
}

/*****实时预览******/
function StartPlayView() {
	var OCXobj = document.getElementById("PlayViewOCX");
	var previewXml = document.getElementById("config").value;
	try {
		var ret = OCXobj.StartTask_Preview_InWnd(previewXml, 0);
	} catch (e) {
		
	}
}
/*****指定窗口实时预览******/
function StartPlayView_InWnd() {
	var OCXobj = document.getElementById("PlayViewOCX");
	var previewXml = document.getElementById("config").value;
	var wndNum = document.getElementById("SelectWnd").value;
	try {
		OCXobj.SelWindow(parseInt(wndNum))
		var ret = OCXobj.StartTask_Preview_InWnd(previewXml, 0);
	} catch (e) {
		
	}
}
/*****空闲窗口实时预览******/
function StartPlayView_Free(previewXml) {
	var OCXobj = document.getElementById("PlayViewOCX");
	try {
		return OCXobj.StartTask_Preview_FreeWnd(previewXml);
	} catch (e) {
		
	}
}
/*****停止所有预览******/
function StopPlayView() {
	var OCXobj = document.getElementById("PlayViewOCX");
	try {
		OCXobj.StopAllPreview();
	} catch (e) {
		
	}
}
