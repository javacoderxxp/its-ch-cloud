define(function(require) {
	var Vue = require('vue');
	var map = require('mainMap');

	function TConfig(div) { //
		this._init(div);
	}
	
	TConfig.prototype._init = function() {
		//全局配置
		$.ajaxSetup({
			dataType: "json",
			contentType: "application/json",
			cache: false,
		    complete:function(xhr,textStatus){
		    	/*if(xhr.status==0){
		             alert("登录超时！请重新登录！",function(){
		                 var basePath= ctx+"login";
		                 window.location.href = basePath;
		             });
		        }*/
		        if(textStatus=="parsererror" && xhr.responseText.indexOf('<title>登录</title>') != -1){
		             alert("登录超时！请重新登录！",function(){
		                 var basePath= ctx+"login";
		                 window.location.href = basePath;
		             });
		        } 
		        /*else if(textStatus=="error"){
		            alert("请求超时！请稍后再试！");
		        }*/
		    }
		});

		//重写alert
		window.alert = function(msg, callback){
			layer.alert(msg, function(index){
				layer.close(index);
				if(typeof(callback) === "function"){
					callback("ok");
				}
			});
		}

		//重写confirm式样框
		window.confirm = function(msg, callback){
//			var xy = getMouseLocation();
//			layer.confirm(msg, {btn: ['确定','取消'],offset: [xy.x, xy.y]},
			layer.confirm(msg, {btn: ['确定','取消']},
			function(){//确定事件
				if(typeof(callback) === "function"){
					callback("ok");
				}
			});
		}
	}
	
	function getMouseLocation(event) {
		var e = event || window.event;
		return {'x':e.clientX,'y':e.clientY}
	}
	
	TConfig.prototype.V = {
		dutyGridPolygonOpt : {
				'editabled': false,
				"fillColor" : '#6699cc',
				"fillOpacity " : 0.2,
				"strokeColor  " : '#8B7B8B',
				"strokeOpacity" : 1,
				"strokeWeight" : 2,
				"strokeStyle" : "solid",
			},
	}
	
	return TConfig;
})