define(function(require) {
	var htmlStr = require('text!./deviceStat.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var deviceStatApp = null;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		deviceStatApp = new Vue({
			el: '#deviceStat-panel',
			data: {
				deviceTypeQ:'',
				showList: false,
			},
			methods: {
				query: function() {
					alert("query");
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		vueEureka.set("leftPanel", {
			vue: deviceStatApp,
			description: "deviceStat的vue实例"
		});
	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})