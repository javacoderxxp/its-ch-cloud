$(function(){
    //初始化菜单与选项卡的链接关系
    $(".menu-item").tab();
	showDate();
	//openWebSocket();
});

/* 获取当前日期 */
function showDate() {
	var show_day = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六');
	var time = new Date();
	var year = time.getFullYear();
	var month = time.getMonth() + 1;
	var date = time.getDate();
	var day = time.getDay();
	var hour = time.getHours();
	var minutes = time.getMinutes();
	var second = time.getSeconds();
	hour < 10 ? hour = '0' + hour : hour;
	minutes < 10 ? minutes = '0' + minutes : minutes;
	second < 10 ? second = '0' + second : second;
	var now_time = year + '年' + month + '月' + date + '日' + ' ' + show_day[day] + '';
	$("#sysdate").html(now_time);
}

var websocket = null;
//创建连接
function openWebSocket(){
	/*	readyState 只读
		0 - 表示连接尚未建立。
		1 - 表示连接已建立，可以进行通信。
		2 - 表示连接正在进行关闭。
		3 - 表示连接已经关闭或者连接不能打开。
	*/
	if(websocket &&　websocket.readyState == 1){
	    alert('WebSocket对象已经存在');
		return;//已经创建
	}
	
	//判断当前浏览器是否支持WebSocket
	if('WebSocket' in window){
	    websocket = new WebSocket("ws://localhost:8771/sc-itsweb/websocket");
	}
	else{
	    alert('对不起，浏览器不支持WebSocket');
	}
	
	//接收到消息的回调方法
	websocket.onmessage = function(event){
	    setMessageInnerHTML(event.data);
	}
}

//将消息显示在网页上
function setMessageInnerHTML(data){
	var rslt = $.parseJSON(data);  
	var count = rslt.notifyList.length;
	if (count > 0){
		$("#notificationsCnt").html(count);
	}else{
		$("#notificationsCnt").html(0);
	}
	getNotificationContent(count, rslt.notifyList);
}

function getNotificationContent(count, notifyList){
	var data = {
		count: count,
		list : notifyList,
	}
	var tpl = $('#notifyItemTpl').html();
	var html = Mustache.render(tpl, data);
	$("#notificationsContent").html(html);

}

//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function(){
//  websocket.close();
}
