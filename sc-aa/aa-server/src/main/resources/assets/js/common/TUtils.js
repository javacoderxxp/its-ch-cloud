define(function(require) {
	var Vue = require('vue');
	var map = require('mainMap');

	var pi = Math.PI;
	var a = 6370996.81;// 6378245.0; // 卫星椭球坐标投影到平面地图坐标系的投影因子
	var ee = 0.00669342162296594323; // 椭球的偏心率
	var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
	
	function TUtils(div) { //
		this._init(div);
	}
	
	TUtils.prototype._init = function() {
		
	}
	
	//获取项目地址
	TUtils.prototype.basePath = function (){
	    //获取当前网址，如： http://localhost:8080/a/b.jsp
	    var wwwPath = window.document.location.href;
	    //获取主机地址之后的目录，如： /a/b.jsp
	    var pathName = window.document.location.pathname;
	    var pos = wwwPath.indexOf(pathName);
	    //获取主机地址，如： http://localhost:8080
	    var localhostPath = wwwPath.substring(0, pos);
	    //获取带"/"的项目名，如：/ems
	    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
	    //获取项目的basePath   http://localhost:8080/ems/
	    var basePath=localhostPath+projectName+"/";
	}

	//jqgrid选择一条记录
	TUtils.prototype.getSelectedRow = function() {
	  var grid = $("#jqGrid");
	  var rowKey = grid.getGridParam("selrow");
	  if(!rowKey){
	  	alert("请选择一条记录");
	  	return ;
	  }
	  return rowKey;
	}

	//jqgrid选择多条记录
	TUtils.prototype.getSelectedRows = function() {
	  var grid = $("#jqGrid");
	  var rowKey = grid.getGridParam("selrow");
	  if(!rowKey){
	  	alert("请选择一条记录");
	  	return ;
	  }
	  return grid.getGridParam("selarrrow");
	}
	
	TUtils.prototype.goToHref = function (href){
		window.href.location = href;
	}
	 
	//格式化日期
	TUtils.prototype.formatDate = function(DateIn) {
		var Year = 0;
		var Month = 0;
		var Day = 0;

		var formattedDate = "";
		// 初始化时间
		Year = DateIn.getFullYear();
		Month = DateIn.getMonth() + 1;
		Day = DateIn.getDate();

		formattedDate = Year + "-";
		if (Month >= 10) {
			formattedDate = formattedDate + Month + "-";
		} else {
			formattedDate = formattedDate + "0" + Month + "-";
		}
		if (Day >= 10) {
			formattedDate = formattedDate + Day;
		} else {
			formattedDate = formattedDate + "0" + Day;
		}
		return formattedDate;
	}
	
	//格式化日期时间
	TUtils.prototype.formatDateTime = function(date) {
	    var seperator1 = "-";
	    var seperator2 = ":";
	    var month = date.getMonth() + 1;
	    var day = date.getDate();
	    if (month >= 1 && month <= 9) {
	        month = "0" + month;
	    }
	    if (day >= 0 && day <= 9) {
	        day = "0" + day;
	    }
		    
	    var hours = date.getHours();
		var mins = date.getMinutes();
		var secs = date.getSeconds();
		var msecs = date.getMilliseconds();
		if (hours < 10){
			hours = "0" + hours;
		}
		if (mins < 10){
			mins = "0" + mins;
		}
		if (secs < 10){
			secs = "0" + secs;
		}
		if (msecs < 10){
			secs = "0" + msecs;  
		}
	    
	    var formattedDate = date.getFullYear() + seperator1 + month + seperator1 + day
	            + " " + hours + seperator2 + mins + seperator2 + secs;
	    return formattedDate;
	}
	
	//格式化日期时间时分秒都是0
	TUtils.prototype.formatDateTime000 = function(date) {
	    var seperator1 = "-";
	    var month = date.getMonth() + 1;
	    var day = date.getDate();
	    if (month >= 1 && month <= 9) {
	        month = "0" + month;
	    }
	    if (day >= 0 && day <= 9) {
	        day = "0" + day;
	    }
	    
	    var formattedDate = date.getFullYear() + seperator1 + month + seperator1 + day
	            + " 00:00:00";
	    return formattedDate;
	}
	
	//格式化日期时间
	TUtils.prototype.formatDateTime2Min = function(date) {
	    var seperator1 = "";
	    var seperator2 = "";
	    var month = date.getMonth() + 1;
	    var day = date.getDate();
	    if (month >= 1 && month <= 9) {
	        month = "0" + month;
	    }
	    if (day >= 0 && day <= 9) {
	        day = "0" + day;
	    }
		    
	    var hours = date.getHours();
		var mins = date.getMinutes();
		var secs = date.getSeconds();
		var msecs = date.getMilliseconds();
		if (hours < 10){
			hours = "0" + hours;
		}
		if (mins < 10){
			mins = "0" + mins;
		}
		if (secs < 10){
			secs = "0" + secs;
		}
		if (msecs < 10){
			secs = "0" + msecs;  
		}
	    
	    var formattedDate = date.getFullYear() + seperator1 + month + seperator1 + day
	            + "" + hours + seperator2 + mins ;
	    return formattedDate;
	}
	
	TUtils.prototype.addDate = function(date, n) {
		date.setDate(date.getDate() + n);
		return date;
	}

	TUtils.prototype.setDate = function(date) {
		currentFirstDate = new Date(date);
		return date;
	}
	
	TUtils.prototype.getLastMonday = function() {//获取上个星期1
		var now = new Date();  
		var nowYear = now.getFullYear();         //当前年
		var nowMonth = now.getMonth();           //当前月
		var nowDayOfWeek = now.getDay();         //今天本周的第几天
	    var nowDay = now.getDate();              //当前日
	    
		var getLastWeekMonday = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek -6);
		return getLastWeekMonday ;
	}

	TUtils.prototype.getMonth1stDay = function(month) {
		var nowdays = new Date();  
		var year = nowdays.getFullYear();  
		var month = nowdays.getMonth() +month;//month == 1 是本月
		if(month==13){
		    month=1;  
		    year=year+1;  
		}  
		if (month < 10) {  
		    month = "0" + month;  
		}  
		return year + "-" + month ;//月的第一天  
	}

	TUtils.prototype.getTimeDiff = function(endDtStr, startDtStr) {
		if(!startDtStr || !endDtStr){
			return -1;
		}
		var end_date = new Date(endDtStr);//将字符串转化为时间  
		var sta_date = new Date(startDtStr);  
		var num = (end_date-sta_date);//求出两个时间的时间差，秒
		return num ;
	}
	
	// 面积点数组转字符串
	TUtils.prototype.polygonPath2Str = function(lngLatArray) {
		var polygonStr ="";
		for(var i =0 ;i< lngLatArray.length; i++){
			polygonStr += lngLatArray[i].lng+","+ lngLatArray[i].lat+" "
		}
		return polygonStr.trim();
	}
	
	//字符串转面积点数组
	TUtils.prototype.polygonStr2Path = function(polygonStr) {
		var lngLatArray= [];
		if(polygonStr){
			polygonStr= polygonStr.trim();
			var polygonArr = polygonStr.split(" ");
			for (var i = 0; i < polygonArr.length; i++) {
				var lnglatStr = polygonArr[i];
				var lnglatArr = lnglatStr.split(",");
				lngLatArray.push(new IMAP.LngLat(lnglatArr[0],lnglatArr[1]));
			}
		}
		return lngLatArray;
	}
	
	//字符串转面积点数组";"
	TUtils.prototype.polygonStr2PathBySem = function(polygonStr) {
		var lngLatArray= [];
		if(polygonStr){
			polygonStr= polygonStr.trim();
			var polygonArr = polygonStr.split(";");
			for (var i = 0; i < polygonArr.length; i++) {
				var lnglatStr = polygonArr[i];
				var lnglatArr = lnglatStr.split(",");
				lngLatArray.push(new IMAP.LngLat(lnglatArr[0],lnglatArr[1]));
			}
		}
		return lngLatArray;
	}
	
	//字符串转点
	TUtils.prototype.str2Lnglat = function(lnglatStr) {
		var lnglat = null;
		if(lnglatStr){
			lnglatStr= lnglatStr.trim();
			var lnglatArr = lnglatStr.split(",");
			lnglat = new IMAP.LngLat(lnglatArr[0],lnglatArr[1]);
		}
		return lnglat;
	}
	
	//点转字符串
	TUtils.prototype.lnglat2Str = function(lnglat) {
		var lnglatStr = lnglat.lng+","+ lnglat.lat;
		return lnglatStr;
	}
	
	// 地图可视范围转字符串
	TUtils.prototype.mapBounds2Str = function(mapBounds) {
		var lngLatArray= [];
		//东北点
		lngLatArray.push(mapBounds.northeast);
		//东南点
		var lnglatES = new IMAP.LngLat(mapBounds.northeast.lng, mapBounds.southwest.lat);
		lngLatArray.push(lnglatES);
		//西南点
		lngLatArray.push(mapBounds.southwest);
		//西北点
		var lnglatWN = new IMAP.LngLat(mapBounds.southwest.lng, mapBounds.northeast.lat);
		lngLatArray.push(lnglatWN);
		var polygonStr ="";
		for(var i =0 ;i< lngLatArray.length; i++){
			polygonStr += lngLatArray[i].lng+","+ lngLatArray[i].lat+" "
		}
		return polygonStr.trim();
	}
	
	// 计算点到一条线段（两端点）的距离
	TUtils.prototype.getDisFromPoint2Line = function(targetP, pa, pb) {
		var a = IMAP.Function.distanceByLngLat(pb, targetP);
		var b = IMAP.Function.distanceByLngLat(pa, targetP);
		var c = IMAP.Function.distanceByLngLat(pa, pb);
		if (a * a >= b * b + c * c)
			return b;
		if (b * b >= a * a + c * c)
			return a;
		var l = (a + b + c) / 2;
		var s = Math.sqrt(l * (l - a) * (l - b) * (l - c)); // 海伦公式求面积
		return 2 * s / c;
	}
	
	var _getDistance = function(pxA, pxB) {
        return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
    };
    
    var _linear = function(initPos, targetPos, currentCount, count) {
        var b = initPos, c = targetPos - initPos, t = currentCount,
        d = count;
        return c * t / d + b;
    };
    //把一条线按距离（单位：米）等分成点集合
    TUtils.prototype.lineToPoints = function(line,intervalMeter){
		var points = line.getPath();
		var resultPs = [];
		resultPs.push(points[0]);
		for (var ind = 0; ind < points.length-1; ind++) {
			var p1 = points[ind];
			var p2 = points[ind+1];
			var currentCount = 0,
			init_pos = map.lnglatToPixel(p1),
			target_pos = map.lnglatToPixel(p2),
			count = Math.round(_getDistance(init_pos, target_pos) / intervalMeter);
			while(currentCount < count){
				currentCount++;
                var x = _linear(init_pos.x, target_pos.x, currentCount, count),
                    y = _linear(init_pos.y, target_pos.y, currentCount, count),
                    pos = map.pixelToLnglat(new IMAP.Pixel(x, y));
                resultPs.push(pos);
			}
		}
		return resultPs;
	};
	
	// 获取一段折线xy的最大值和最小值
	TUtils.prototype.getMinMaxLngLat = function(line) {
		var points = line.getPath();
		var minLng,minLat,maxLng,maxLat;
		if(points.length>0){
			minLng = points[0].lng;
			minLat = points[0].lat;
			maxLng = points[0].lng;
			maxLat = points[0].lat;
		}else{
			return;
		}

		for (var idx = 1; idx <= points.length-1; idx++) {
			var tempPoint = points[idx];
			if(tempPoint.lng<=minLng){
				minLng= tempPoint.lng;
			}
			if(tempPoint.lng>=maxLng){
				maxLng= tempPoint.lng;
			}
			if(tempPoint.lat<=minLat){
				minLat= tempPoint.lat;
			}
			if(tempPoint.lat>=maxLat){
				maxLat= tempPoint.lat;
			}
		}
		return [{lng:minLng,lat:minLat},{lng:maxLng,lat:maxLat}];
	}
	
	// 获取2个点的中点
	TUtils.prototype.getMidPoint = function(p1,p2) {
		var midLng = (p1.lng+p2.lng)/2;
		var midLat = (p1.lat+p2.lat)/2;
		return midLng+","+midLat;
	}
	
	var _getLoop = function (v, a1, b1) {
	    while(v > b1) {
	        v -= b1 - a1;
	    }
	    while(v < a1) {
	        v += b1 - a1;
	    }
	    return v;
	}

	var _getRange = function (v, a1, b1) {
	    if(null != a1) {
	        v = Math.max(v, a1);
	    }
	    if(b1 != null) {
	        v = Math.min(v, b1);
	    }
	    return v;
	}

	var degreeToRad = function (degree) {
	    return pi * degree / 180;
	}

	TUtils.prototype.getDistance = function (p1, p2) {
	    var lng1 = p1.lng;
	    var lat1 = p1.lat;
	    var lng2 = p2.lng;
	    var lat2 = p2.lat;
	    var point1_lng = _getLoop(lng1, -180, 180);
	    var point1_lat = _getRange(lat1, -74, 74);
	    var point2_lng = _getLoop(lng2, -180, 180);
	    var point2_lat = _getRange(lat2, -74, 74);

	    var x1, x2, y1, y2;
	    x1 = degreeToRad(point1_lng);
	    y1 = degreeToRad(point1_lat);
	    x2 = degreeToRad(point2_lng);
	    y2 = degreeToRad(point2_lat);

	    return a * Math.acos((Math.sin(y1) * Math.sin(y2) + Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1)));
	};

	
	//获取项目地址
	TUtils.prototype.togglePanelBody = function (){
    	if($("#LEFT_PANEL_UD").hasClass('fa-chevron-up')){
    		$(".panel-body").hide(100);
    		$("#LEFT_PANEL_UD").removeClass('fa-chevron-up');
    		$("#LEFT_PANEL_UD").addClass('fa-chevron-down');
    		showToolBtns = false;
    	}else{
    		$(".panel-body").show(100);
    		$("#LEFT_PANEL_UD").removeClass('fa-chevron-down');
    		$("#LEFT_PANEL_UD").addClass('fa-chevron-up');
    		showToolBtns = true;
    	}
	}
	
	TUtils.prototype.leftPanelDragEnable = function (){
		//leftPanel可拖拽
		var leftPanel = document.getElementById("leftPanel");
		var leftPanelHead = leftPanel.children[0].children[0];
//		leftPanel = $("#leftPanel");
//		var pPanel = $(leftPanel.children("div").get(0));
//		var leftPanelHead = $(pPanel.children("div").get(0));
		leftPanelHead.onmousedown = function(ev){
			var e = ev || event;
			e.preventDefault();
			var distanceX = e.clientX - leftPanel.offsetLeft;
			var distanceY = e.clientY - leftPanel.offsetTop;
			document.onmousemove = function(ev){
				var e = ev || event;
			    e.preventDefault();
				leftPanel.style.left = e.clientX - distanceX + 'px';
				leftPanel.style.top = e.clientY - distanceY + 'px'; 
	　　　　	};
			document.onmouseup = function(){
				document.onmousemove = null;
				document.onmouseup = null;
			};
		};
	}
	
	TUtils.prototype.cmp = function(x, y) {
		if(x === y) {
			return true;
		}
		if(!(x instanceof Object) || !(y instanceof Object)) {
			return false;
		}
		if(x.constructor !== y.constructor) {
			return false;
		}

		for(var p in x) {
			if(x.hasOwnProperty(p)) {
				if(!y.hasOwnProperty(p)) {
					return false;
				}

				if(x[p] === y[p]) {
					continue;
				}

				if(typeof(x[p]) !== "object") {
					return false;
				}

				if(!Object.equals(x[p], y[p])) {
					return false;
				}
			}
		}

		for(p in y) {
			if(y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
				return false;
			}
		}
		return true;
	}
	  
	
	
	TUtils.prototype.isIE9Browser = function(){
		var isIE = false;
		var userAgent = navigator.userAgent.toLowerCase();
		if(!!window.ActiveXObject || "ActiveXObject" in window){
			var reIE = new RegExp("msie (\\d+\\.\\d+);");
			reIE.test(userAgent);
	        var fIEVersion = parseFloat(RegExp["$1"]);
	        if(fIEVersion == 9) {
	        	isIE = true;
	        }  
		}
		return isIE;
	}
	
	return TUtils;
})