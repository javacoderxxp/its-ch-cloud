define(function(require){
	var show = function(){
		var iWidth = screen.availWidth;
		var iHeight = screen.availHeight;
		var iLeft = (window.screen.availWidth - iWidth) / 2;
		var iTop = (window.screen.availHeight- iHeight) / 2;
		iWidth = 1024;
		iHeight = 768;
		iLeft = 500;
		iTop = 200;
		window.open(
			'assets/js/module/zxjgYtglTask/zxjgYtglTaskSummary.html',
			'qwDayDataPage',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=' + iTop + ',left=' + iLeft +',toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');
	};
	
	return {
		show : show
	};
});