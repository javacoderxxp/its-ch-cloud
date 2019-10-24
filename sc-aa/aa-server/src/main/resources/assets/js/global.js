//全局配置
$.ajaxSetup({
	dataType: "json",
	contentType: "application/json",
	cache: false
   /* complete:function(xhr,textStatus){
    	if(xhr.status==0){
             alert("登录超时！请重新登录！",function(){
                 var basePath= UrlUtil.basePath+"login";
                 window.top.location.href = basePath;
             });
        }
        if(textStatus=="parsererror" && xhr.responseText.indexOf('<title>登录</title>') != -1){
             alert("登录超时！请重新登录！",function(){
                 var basePath= UrlUtil.basePath+"login";
                 window.top.location.href = basePath;
             });
        } 
    }*/
});

//重写alert
window.alert = function(msg, callback){
	parent.layer.alert(msg, function(index){
		parent.layer.close(index);
		if(typeof(callback) === "function"){
			callback("ok");
		}
	});
}

//重写confirm式样框
window.confirm = function(msg, callback){
	parent.layer.confirm(msg, {btn: ['确定','取消']},
	function(){//确定事件
		if(typeof(callback) === "function"){
			callback("ok");
		}
	});
}

var UrlUtil = function (){
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
    return {
    	basePath : basePath
    };
}();


//选择一条记录
function getSelectedRow() {
  var grid = $("#jqGrid");
  var rowKey = grid.getGridParam("selrow");
  if(!rowKey){
  	alert("请选择一条记录");
  	return ;
  }
  return rowKey;
  
//  var selectedIDs = grid.getGridParam("selarrrow");
//  if(selectedIDs.length > 1){
//  	alert("只能选择一条记录");
//  	return ;
//  }
//  
//  return selectedIDs[0];
}

//选择多条记录
function getSelectedRows() {
  var grid = $("#jqGrid");
  var rowKey = grid.getGridParam("selrow");
  if(!rowKey){
  	alert("请选择一条记录");
  	return ;
  }
  
  return grid.getGridParam("selarrrow");
}

function longDatetimeFormat(longTypeDate){ 
  var datetimeType = ""; 
  var date = new Date(eval(longTypeDate)); 
//  date.setTime(longTypeDate); 
  datetimeType+= date.getFullYear();  //年 
  datetimeType+= "-" + (date.getMonth()+1); //月  
  datetimeType += "-" + date.getDate();  //日 
  datetimeType+= "  " + date.getHours();  //时 
  datetimeType+= ":" + date.getMinutes();   //分
  datetimeType+= ":" + date.getSeconds();   //分
  return datetimeType;
}

function getFormatDate(date) {
	if(!date){
		return '';
	}
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
    
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + day
            + " " + hours + seperator2 + mins + seperator2 + secs;
    return currentdate;
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showPositionError);
	} else {
		alert("浏览器不支持地理定位。");
	}
}

function showPosition(position) {
	var lat = position.coords.latitude; // 纬度
	var lag = position.coords.longitude; // 经度
	alert('纬度:' + lat + ',经度:' + lag);
} 

function showPositionError(error) {
	switch (error.code) {
	case error.PERMISSION_DENIED:
		alert("定位失败,用户拒绝请求地理定位");
		break;
	case error.POSITION_UNAVAILABLE:
		alert("定位失败,位置信息是不可用");
		break;
	case error.TIMEOUT:
		alert("定位失败,请求获取用户位置超时");
		break;
	case error.UNKNOWN_ERROR:
		alert("定位失败,定位系统失效");
		break;
	}
}

var localURL = function (file) {
    var url = null;
    if (window.createObjectURL != undefined) { 
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) {
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) { 
        url = window.webkitURL.createObjectURL(file);
    }
    return url;//     eg:     blob:http://localhost/671c3409-0047-44ec-bcba-89d63a439231
};