define(function(require) {
	var Vue = require('vue');
	var htmlStr = require('text!./tiejiListPanel.html');
	var map = require('mainMap');
	var tiejiVm = null, allTieji = [], win_video= null;
	
	var loadPanelApp = function() {
		var selectedDevListPanel = $("#selectedDevListPanel");
		selectedDevListPanel.html(htmlStr);
		selectedDevListPanel.fadeIn().css("display", "inline-block");
		tiejiVm = new Vue({
			el : '#tiejiPanel',
			data : {
				tiejiList : []
			},
			methods : {
				init : function() {
					//loadData
					selectedDevListPanel.show();
					layer.load();
					var url = "dev/videoCamera/allTiejiData?cameraTp=9&ssdw="+encodeURIComponent('铁骑视频')+"&time="+new Date().getTime();;
					$.ajax({
						type: "GET",
						url: url,
						success: function(rslt){
							layer.closeAll('loading');
							if(rslt.code === 200){
								tiejiVm.tiejiList = rslt.videoCameraList;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				close : function() {
					selectedDevListPanel.hide();
					this.signalList = [];
				},
				openVideoWin: function(tunnel) {
					tiejiVm.playWinVideo(tunnel);
				},
				playWinVideo: function(tunnel){
					var iWidth = screen.availWidth - 10;
					var iHeight = screen.availHeight - 40;
					var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
					var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
					win_video = window.open(
							'assets/js/module/video/videoPlay.html?cameraId='+tunnel,
							'videoCtrlwindow',
							'height=' + iHeight + ', innerHeight=' + iHeight +
							',width=' + iWidth + ', innerWidth=' + iWidth +
					',top=0,left=0,toolbar=yes,menubar=yes,scrollbars=no,resizable=yes,location=yes');
//					if(win_video == null) {
//					} else {
//						win_video.playVideoWithWindow(tunnel);
//					}
				}
			}
		});
		
		
		vueEureka.set("tiejiListPanel", {
			vue : tiejiVm,
			description : ""
		});
	}

	var closePanel = function() {
		if (tiejiVm) {
			tiejiVm.close();
		}
		allTieji = [];
	}

	var loadPanel = function(tiejiChecked) {
		if (tiejiChecked) {
			loadPanelApp();
			tiejiVm.init();
		} else {
			tiejiVm.close();
		}
	}
	return {
		loadPanel : loadPanel,
		closePanel : closePanel
	}
})