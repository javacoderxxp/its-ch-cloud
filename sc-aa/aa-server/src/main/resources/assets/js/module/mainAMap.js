define(function(){
	var marker = null; //右键位置
	var contextMenuPositon = null, nearByResInfoWin = null,circleEditor = null,findCircle=null,centerMarker = null;
	var map = new AMap.Map('container', {
        resizeEnable: true,
        zoom:18,
        expandZoomRange:true,
        expandZoomRange:true,
   		zooms:[13,20],
        center: [121.128187,31.464808]
    });
	
	//车道级别地图
	var laneLayer = new AMap.TileLayer({
    	tileUrl: 'http://58.210.9.131/arcgis/rest/services/CS/TCS_ZNJT/MapServer/tile/[z]/[y]/[x]',
        zIndex:100
    });
	//laneLayer.setMap(map);
	
	//地图控件
	/*
	map.plugin([ "AMap.MapType" ], function() { // 地图类型切换
		var type = new AMap.MapType({
			defaultType : 0
		// 使用2D地图
		});
		map.addControl(type);
	});
	*/
	
	//创建右键菜单
    var contextMenu = new AMap.ContextMenu();  
    //构建搜索周边资源信息窗体
    function createInfoWindow(title) {
        var info = document.createElement("div");
        info.className = "info";
        info.style.width = "350px";
        // 定义顶部标题
        var top = document.createElement("div");
        var titleD = document.createElement("div");
        var closeX = document.createElement("img");
        top.className = "info-top";
        titleD.innerHTML = title;
        closeX.src = "http://webapi.amap.com/images/close2.gif";
        closeX.onclick = function(){
        	map.clearInfoWindow();
        };

        top.appendChild(titleD);
        top.appendChild(closeX);
        info.appendChild(top);

        // 定义中部内容
        var middle = document.createElement("div");
        middle.className = "info-middle";
        middle.style.backgroundColor = 'white';
        middle.innerHTML = "<form class='layui-form' action=''><div class='layui-form-item'>" +
        		"<input type='checkbox' name='video' title='视频'>" +
        		"<input type='checkbox' name='police' title='警力'></div><div class='layui-form-item'>" +
        		"<input type='checkbox' name='vms' title='诱导屏'>" +
        		"<input type='checkbox' name='signal' title='信号机'></div><div class='layui-form-item'><div class='layui-input-block pull-right'>" +
        		"<button class='layui-btn' lay-submit lay-filter='findNearByResForm'>提交</button>"+
        		"</div></form>";
        info.appendChild(middle);
	
        // 定义底部内容
        var bottom = document.createElement("div");
        bottom.className = "info-bottom";
        bottom.style.position = 'relative';
        bottom.style.top = '0px';
        bottom.style.margin = '0 auto';
        var sharp = document.createElement("img");
        sharp.src = "http://webapi.amap.com/images/sharp.png";
        bottom.appendChild(sharp);
        info.appendChild(bottom);
        return info;
    }
    
    //根据点位经纬度，弹出资源选择框，搜索周边资源信息
    var findAroundRes = function(lngLat){
    		if(!nearByResInfoWin){
        		nearByResInfoWin = new AMap.InfoWindow({
        	        isCustom: true,  //使用自定义窗体
        	        content: createInfoWindow("搜索周边资源"),
        	        offset: new AMap.Pixel(16, -45)
        	    });
        		AMap.event.addListener(nearByResInfoWin, "open", function(e){
        			var center = e.target.getPosition();
        			layui.use('form', function(){
        	    		var form = layui.form;
        	    		form.on('submit(findNearByResForm)', function(data) {
        					layer.msg(JSON.stringify(data.field));
        					clearAroundRes();
        					findCircle = (function(){
        				        var _circle = new AMap.Circle({
        				            center: center,// 圆心位置
        				            radius: 1000, //半径
        				            strokeColor: "#F33", //线颜色
        				            strokeOpacity: 0.4, //线透明度
        				            strokeWeight: 1.5, //线粗细度
        				            fillColor: "#ee2200", //填充颜色
        				            fillOpacity: 0.25//填充透明度
        				        });
        				        _circle.setMap(map);
        				        return _circle;
        				    })();
        					if(marker){
        			        	marker.setMap(null);
        			        }
        					if(centerMarker){
        						centerMarker.setMap(null);
        			        }
        					centerMarker = new AMap.Marker({
        			            map: map,
        			            position: center
        			        });
        					centerMarker.setTop(true);
        					map.plugin(["AMap.CircleEditor"],function(){ 
        						circleEditor = new AMap.CircleEditor(map,findCircle); 
        						circleEditor.open();
        					});
        					//监听半径的变化事件,动态的显示区域内的资源信息
        					require(['./panels/aroundResPanel/aroundRes'],function(aroundRes){
        						aroundRes.show(center,1000,data.field);
        						AMap.event.addListener(circleEditor, "adjust", function(t){
            						var r = t.radius; // 半径,米
            						aroundRes.show(center,r,data.field);
            					});
        					});
        					
        					return false;
        				});
        	    		
        				setTimeout(function(){
        					form.render('checkbox');
        				}, 100);
        	    	});
        		});
        	}
        	nearByResInfoWin.open(map, lngLat);
    }
    //右键添加Marker标记
    contextMenu.addItem("周边资源搜索", function(e) {
    	var center = marker.getPosition();
    	findAroundRes(center);
    }, 0);
    
    contextMenu.addItem("可视域调用", function(e) {
    	if(marker){
        	marker.setMap(null);
        }
        alert("可视域调用");
    }, 1);

    //地图绑定鼠标右击事件——弹出右键菜单
    map.on('rightclick', function(e) {
    	contextMenuPositon = e.lnglat;
    	if(marker){
        	marker.setMap(null);
        }
    	marker = new AMap.Marker({
            map: map,
            position: contextMenuPositon //基点位置
        });
    	marker.setTop(true);
        contextMenu.open(map, contextMenuPositon);
    });
    
    map.on('click', function(e) {
        if(marker){
        	marker.setMap(null);
        }
        if(nearByResInfoWin){
    		nearByResInfoWin.close();
    	}
    });
    
    map.on('zoomchange', function(e) {
        var zoom = map.getZoom();
        if(zoom > 18){
        	laneLayer.setMap(map);
        }else{
        	laneLayer.setMap();
        }
        	
    });
    
    var clearAroundRes = map.clearAroundRes = function(){
    	if(findCircle){
			findCircle.setMap(null);
			circleEditor.close();
        }
    	if(nearByResInfoWin){
    		nearByResInfoWin.close();
    	}
    	if(centerMarker){
    		centerMarker.setMap(null);
    	}
    }
    
    return map;
})