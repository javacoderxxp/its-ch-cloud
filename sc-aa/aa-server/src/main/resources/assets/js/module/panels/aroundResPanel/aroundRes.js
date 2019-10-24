define(function(require) {
	var htmlStr = require('text!./aroundRes.html');
	var Vue = require('vue');
	var map = require('mainMap');
	
	var aroundResApp = null;
	
	var searchRes = function(circleCenter,radius,resArray){
		
	}
	
	var show = function(circleCenter,radius,res) {
		var bottomPanel = $("#bottomPanel");
		bottomPanel.html(htmlStr);
		bottomPanel.fadeIn().css("display","inline-block");
		
		aroundResApp = new Vue({
			el: '#aroundRes-panel',
			data: {
				isShowVideo:true,
				isShowPolice:false,
				isShowVms:false,
				isShowSignal:false
			},
			methods: {
				closePanel: function() {
					bottomPanel.empty();
					bottomPanel.hide();
					map.clearAroundRes();
				},
				hidePanel: function() {
					bottomPanel.hide();
				}
			}
		});
		vueEureka.set("bottomPanel", {
			vue: aroundResApp,
			description: "aroundRes的vue实例"
		});
	}
	var hide = function() {
		var bottomPanel = $("#bottomPanel");
		bottomPanel.hide();
	}

	return {
		show: show,
		hide: hide
	};
})