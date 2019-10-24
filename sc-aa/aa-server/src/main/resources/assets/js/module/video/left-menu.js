$(document).ready(function(){
	showdata();
	//ultwo();
})
function showdata(liId){
				/*var liId = $(e.target).attr("data-index-id");*/
				$.ajax({
				    url:'/sc-itsweb/dev/videoCamera/findDeviceTreeList2?level='+liId,
				    type:'GET', 
				    async:false,
				    success:function(dat){
				    	var ullistr2="";
				    	for(var i=0;i<dat.length;i++){
				    		var descItem = dat[i]
				    		if(descItem.status=="0"){
								ullistr2 = ullistr2+'		<li><a href="#" class="tunnelLi" data-tunnel='+descItem.tunnel+'><i class="fa fa-laptop"></i> '+descItem.name+'</a></li>';
							}
							else{
								ullistr2 = ullistr2+'		<li><a href="#"><i class="fa fa-times-circle-o"></i> '+descItem.name+'</a></li>';
							}
				    	}
				    	$('#ultwo'+liId).empty();
				    	$('#ultwo'+liId).append(ullistr2);
				    	$('.tunnelLi').bind("click",function(e){
							var tunnel = e.target.getAttribute("data-tunnel");
							$.ajax({
							    url:'/sc-itsweb/dev/videoCamera/getPreviewParam?cameraIndexCode='+tunnel+'&random='+new Date().getTime(),
							    type:'GET', 
							    async:false,
							    success:function(dat){
							    	StartPlayView_Free(dat.replace(/[\\]/g,""));
							    },
							    error:function(xhr,textStatus){
							    	layer.msg("获取预览xml失败！");
							    }
							});
						});
				    },
				    error:function(xhr,textStatus){
				    	layer.msg("获取预览xml失败！");
				    }
			});
}
/*$('#searchName').bind('input propertychange', function() {
    if(null == $(this).val() || "" == $.trim($(this).val())){
    	$('#ultwoSearch').empty();
    	$("#searchResTree").css("display","none");
    }
});*/

var oIpt = document.getElementById('searchName');
function inputEvent(){
	 if(null == oIpt.value || "" == $.trim(oIpt.value)){
	    	$('#ultwoSearch').empty();
	    	$("#searchResTree").css("display","none");
	    }
}

function propertychangeEvent(e){
	if(e.propertyName === 'value'){
		if(null == oIpt.value || "" == $.trim(oIpt.value)){
	    	$('#ultwoSearch').empty();
	    	$("#searchResTree").css("display","none");
	    }
	 }
}


if(window.attachEvent){   //IE
	oIpt.attachEvent('oninput', inputEvent);
	if(!window.ScriptEngineMinorVersion() && window.addEventListener){  //IE9
			oIpt.attachEvent('onkeyup', function(e){
			if(e.keyCode === 8){
	             //删除--触发
	             oIpt.fireEvent('oninput'); 
	         }
	        if(e.ctrlKey && e.keyCode === 88){
	             //剪切--触发
	             oIpt.fireEvent('oninput');
	        }
	  });
	}
} else { //非IE
      oIpt.addEventListener('input', inputEvent);
}
	
function searchVideo(){
	var url=encodeURI('/sc-itsweb/dev/videoCamera/allData?deviceName='+$('#searchName').val()+'&random='+new Date().getTime());
	$.ajax({
	    url:url,
	    type:'POST', 
	    async:false,
	    success:function(dat){
	    	if(null != dat.videoCameraList &&dat.videoCameraList.length > 0 ){
	    		var ullistr3="";
	    		for(var i=0;i<dat.videoCameraList.length;i++){
		    		var descItem = dat.videoCameraList[i]
		    		if(descItem.status=="0"){
		    			ullistr3 = ullistr3+'		<li><a href="#" class="tunnelLi" data-tunnel='+descItem.tunnel+'><i class="fa fa-laptop"></i> '+descItem.deviceName+'</a></li>';
					}
					else{
						ullistr3 = ullistr3+'		<li><a href="#"><i class="fa fa-times-circle-o"></i> '+descItem.deviceName+'</a></li>';
					}
		    	}
	    		$('#ultwoSearch').empty();
		    	$('#ultwoSearch').append(ullistr3);
		    	$('.tunnelLi').bind("click",function(e){
					var tunnel = e.target.getAttribute("data-tunnel");
					$.ajax({
					    url:'/sc-itsweb/dev/videoCamera/getPreviewParam?cameraIndexCode='+tunnel+'&random='+new Date().getTime(),
					    type:'GET', 
					    async:false,
					    success:function(dat){
					    	StartPlayView_Free(dat.replace(/[\\]/g,""));
					    },
					    error:function(xhr,textStatus){
					    	layer.msg("获取预览xml失败！");
					    }
					});
				});
		    	$("#searchResTree").css("display","block");
	    	}
	    },error:function(xhr,textStatus){
	    	layer.msg("查询摄像机失败！");
	    	}
	    });
}
function clickLi(){
	$.ajax({
	    url:'/sc-itsweb/dev/videoCamera/getPreviewParam?cameraIndexCode='+descItem.tunnel+'&random='+new Date().getTime(),
	    type:'GET', 
	    async:false,
	    success:function(dat){
	    	StartPlayView_Free(dat.replace(/[\\]/g,""));
	    },
	    error:function(xhr,textStatus){
	    	layer.msg("获取预览xml失败！");
	    }
	});
}
//gundong
//function gundong(){
//	$(".ultwo").niceScroll
//}
