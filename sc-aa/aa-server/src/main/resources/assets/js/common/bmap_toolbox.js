var bmapToolbox = function(){
	var mapKniferControl;
	var mapCoordinateControl;
	
	var init = function (){
		initBmapControl();
		initMapCoordinateControl();
		initMapKniferControl();
	};
	
	//百度地图原生控件
	var initBmapControl = function (){
		//图层类型控件
		var mapTypeControl = new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP,BMAP_SATELLITE_MAP]});
		mapTypeControl.setAnchor(BMAP_ANCHOR_TOP_LEFT);
		mapTypeControl.setOffset(new BMap.Size(50, 10))
		map.addControl(mapTypeControl);
		//版权控件
		var cr = new BMap.CopyrightControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT,offset:new BMap.Size(10, 10)}); 
		var bs = this.map.getBounds();   //返回地图可视区域
		cr.addCopyright({id: 1, content: "<a href='http://www.posinda.com' target='_blank' style='font-size:16px; color:black;'>Copyright©2016-2017 江苏普信达电子科技有限公司</a>", bounds: bs});
		map.addControl(cr);
	};
	
	//坐标控件
	var initMapCoordinateControl = function (){
		function MapCoordinateControl() {
			this.defaultAnchor =BMAP_ANCHOR_BOTTOM_RIGHT;
			this.defaultOffset = new BMap.Size(10, 30);
		};
		
		MapCoordinateControl.prototype = new BMap.Control();
		MapCoordinateControl.prototype.initialize = function(map) {
			var domParser = new DOMParser();
			var panel = document.createElement("div");
			// 设置样式
			panel.style.opacity = "0.8";
			//panel.style.border = "1px solid gray";
			
			var divDefault = document.createElement("div");
			divDefault.innerHTML='<input id="Map_ZoomLvl_Txt" type="text" value="" style="width:24px; font-size:16px"/><input id="Map_CurMousePos_Txt" type="text" value="" style="width:170px; font-size:16px"/>';
			panel.appendChild(divDefault);
			// 添加DOM元素到地图中
			map.getContainer().appendChild(panel);
			return panel;
		}
		mapCoordinateControl = new MapCoordinateControl();
		map.addControl(mapCoordinateControl);

		map.addEventListener("zoomend", function(e){
			var pnt = e.point;
			var zoomNow = map.getZoom();
			$("#Map_ZoomLvl_Txt").val(zoomNow);
			/*
			var markers = map.getOverlays();
			if(zoomNow < 17){
				for (var x in markers) {
					markers[x].hide();
				}
			}else{
				for (var x in markers) {
					markers[x].show();
				}
			}
			*/
		});

		map.addEventListener("mousemove", function(e){
			var pnt = e.point;
			$("#Map_ZoomLvl_Txt").val(map.getZoom());
			$("#Map_CurMousePos_Txt").val(pnt.lng +","+pnt.lat);
		});
	}

	//工具控件
	var initMapKniferControl = function (){
		function MapKniferControl() {
			this.defaultAnchor =BMAP_ANCHOR_TOP_LEFT;
			this.defaultOffset = new BMap.Size(10, 10);
		}
	
		MapKniferControl.prototype = new BMap.Control();
		MapKniferControl.prototype.initialize = function(map) {
			var domParser = new DOMParser();
			var panel = document.createElement("div");
			// 设置样式
			panel.style.cursor = "pointer";
			panel.style.opacity = "0.8";
			panel.style.border = "1px solid gray";
			panel.style.backgroundColor = "#3C8DBC";
			panel.style.width="32px";
			
			var divDefault = document.createElement("div");
			divDefault.className='map-tool-item';
			divDefault.style.textAlign = "center";
			divDefault.innerHTML='<span class="fa fa-home" style="font-size:28px"></span>';
			divDefault.onclick = function(e) {
				// 默认位置
				map.centerAndZoom(new BMap.Point(120.73444, 31.327272), 16);
			}
	
			var divZoomIn = document.createElement("div");
			divZoomIn.className='map-tool-item';
			divZoomIn.style.textAlign = "center";
			divZoomIn.innerHTML='<span class="fa fa-search-plus" style="font-size:28px"></span>';
			divZoomIn.onclick = function(e) {
				// 放大
				var currentZoom = map.getZoom();
				if(currentZoom < 18){
					map.setZoom(currentZoom+1);
				}
			}
			var divZoomOut = document.createElement("div");
			divZoomOut.className='map-tool-item';
			divZoomOut.style.textAlign = "center";
			divZoomOut.innerHTML='<span class="fa fa-search-minus" style="font-size:28px"></span>';
			divZoomOut.onclick = function(e) {
				// 缩小
				var currentZoom = map.getZoom();
				if(currentZoom > 5){
					map.setZoom(currentZoom-1);
				}
			}
			var divDistance = document.createElement("div");
			divDistance.className='map-tool-item';
			divDistance.style.textAlign = "center";
			divDistance.innerHTML='<span class="fa fa-level-up" style="font-size:28px"></span>';
			divDistance.onclick = function(e) {
				// 测距
				var myDis = new BMapLib.DistanceTool(map);
				myDis.open();
			}
			var divTrash = document.createElement("div");
			divTrash.className='map-tool-item';
			divTrash.style.textAlign = "center";
			divTrash.innerHTML='<span class="fa fa-trash" style="font-size:28px"></span>';
			divTrash.onclick = function(e) {
				map.clearOverlays();
				var op = chart.getOption();
		 		for(var i in op.series) {
		 				op.series[i].data = [];
		 		}
		 		chart.setOption(op,false);
			}
			
			panel.appendChild(divDefault);
			panel.appendChild(divZoomIn);
			panel.appendChild(divZoomOut);
			panel.appendChild(divDistance);
			panel.appendChild(divTrash);
			// 添加DOM元素到地图中
			map.getContainer().appendChild(panel);
			return panel;
		}
		mapKniferControl = new MapKniferControl();
		map.addControl(mapKniferControl);
	}
	
	return {
		init:init
	}
};
window.bmapToolbox = bmapToolbox();