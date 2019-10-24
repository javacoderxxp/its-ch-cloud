define(function(require){
	var Vue = require('vue');
	var show = function(){
		var iWidth = screen.availWidth - 10;
		var iHeight = screen.availHeight - 40;
		var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
		var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
		window.open(
			'assets/js/module/qwSchedule/qwSchedule.html',
			'qwSchedule',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
	};
	
	var showZxxd = function(){
		var iWidth = 1024;
		var iHeight = 768;
		window.open(
			'assets/js/module/qwSchedule/qwZxxdSchedule.html',
			'qwZxxdSchedule',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=100,left=400,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
	};
	var showQwGSS = function(){
		var iWidth = screen.availWidth - 10;
		var iHeight = screen.availHeight - 40;
		var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
		var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
		window.open(
			'assets/js/module/qwSchedule/qwGsdSchedule.html',
			'qwGSSchedule',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=100,left=400,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
	};
	
	var showValidCatch = function(id){
		var iWidth = 1024;
		var iHeight = 768;
		window.open(
			'assets/js/module/qwSchedule/qwValidCatch.html?id='+id,
			'qwValidCatch',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=100,left=400,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
	};
	
	return {
		show : show,
		showZxxd : showZxxd,
		showValidCatch:showValidCatch,
		showQwGSS:showQwGSS
	};
});