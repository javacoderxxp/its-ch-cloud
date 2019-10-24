define(function(require){
	var Vue = require('vue');
	var show = function(){
		var iWidth = "800px";
		var iHeight = "600px";
		var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
		var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
		window.open(
			'assets/js/module/riSchedule/riSchedule.html',
			'riSchedule',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
	};
	
	return {
		show : show
	};
});