var map; // 地图
$(function() {
	initMap();
});

var vm = new Vue({
	el : '#vue-app',
	data : {
		title : null,
	},
	methods : {
		query : function() {
			var dataPost = {};
			var url = "";
			$.ajax(url).done(function(rslt) {
			}).fail(function() {
				alert(rslt.msg);
			});
		},
	}
});

var initMap = function(){
	map = new BMap.Map("map-area",{enableMapClick:false});
	map.centerAndZoom(new BMap.Point(120.723876,31.324664), 15);
	map.enableScrollWheelZoom(true);
	map.setMapStyle({
   	  styleJson:[
             {
               "featureType": "subway",
               "elementType": "all",
               "stylers": {
                     "lightness": 7,
                     "saturation": -100,
                     "visibility": "on"
               }
             },
             {
               "featureType": "poi",
               "elementType": "all",
               "stylers": {
                     "visibility": "off"
               }
             }
   		]
   	});
	//控件
	bmapToolbox.init();
	//鼠标右键
	var menu=new BMap.ContextMenu();
	menu.addItem(new BMap.MenuItem('放大',function(){map.zoomIn()},{width:80, iconUrl:"assets/images/map/zoom_in.png"}));
	menu.addSeparator();
	menu.addItem(new BMap.MenuItem('缩小',function(){map.zoomOut()},{width:80, iconUrl:"assets/images/map/zoom_out.png"}));
	map.addContextMenu(menu);
	
	layer.msg("地图加载完毕",{offset: '10px'});
}


