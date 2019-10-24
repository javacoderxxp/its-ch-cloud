define(function(require){
	//var initAlarmScenePage = null;
	var Vue = require('vue');
	
	var show = function(pageType){
		var iWidth = screen.availWidth - 10;
		var iHeight = screen.availHeight - 40;
		var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
		var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
		
		if(pageType == 'alarmScene'){
			window.open(
				'assets/js/module/visualScene/dynAlarmVisualScene/dynAlarmVisualScene.html',
				'dynAlarmVisualScene',
				'height=' + iHeight + ', innerHeight=' + iHeight +
				',width=' + iWidth + ', innerWidth=' + iWidth +
				',top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
		}else if(pageType == 'alarmSceneNew'){
			window.open(
					'assets/js/module/visualScene/dynAlarmVisualScene/zfxxyjScene.html',
					'zfxxyjScene',
					'height=' + iHeight + ', innerHeight=' + iHeight +
					',width=' + iWidth + ', innerWidth=' + iWidth +
					',top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
		}else if(pageType == 'emergencyScene'){
			window.open(
				'assets/js/module/visualScene/dynAlarmVisualScene/emergencyComdScene.html',
				'emergencyComdScene',
				'height=' + iHeight + ', innerHeight=' + iHeight +
				',width=' + iWidth + ', innerWidth=' + iWidth +
				',top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
		}else if(pageType == 'securityGuardScene'){
			window.open(
					'assets/js/module/visualScene/dynAlarmVisualScene/securityGuardScene.html',
					'securityGuardScene',
					'height=' + iHeight + ', innerHeight=' + iHeight +
					',width=' + iWidth + ', innerWidth=' + iWidth +
					',top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
		}else{
			alert("the target page not existed,please check!");
		}
		//alert("hello");
		
		
	};
	
	return {
		show : show
	};
});