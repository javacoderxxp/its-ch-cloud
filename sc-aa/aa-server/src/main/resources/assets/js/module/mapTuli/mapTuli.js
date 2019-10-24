define(function(require) {
	var mapTuliHtml = require('text!./mapTuli.html');
	var Vue = require('vue');
	var map = require('mainMap');

	function MapTuli(div) {
		this._init(div);
	}
	
	MapTuli.prototype._init = function(div) {
		var it = this;
		div.html(mapTuliHtml);
		var mapTuliApp = new Vue({
			el: '#tuli-wrapper',
			data: {
				showImg : false
			},
			methods: {
				toggerTuliImg: function() {
					mapTuliApp.showImg = !mapTuliApp.showImg;
				}
			}
		});
		
		/*$(".wheel-button").wheelmenu({
			trigger: "hover",
			animation: "fly",
			animationSpeed: "fast"
		});*/
	}
	
	return MapTuli;
})
