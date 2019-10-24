define(function(require) {
	var htmlStr = require('text!./signalEditPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var queryResPolygons = []; //查询后绘制至地图的施工区域集合
	//在地图中添加MouseTool插件
	var signalManageApp = null;
	
	var show = function(id) {
		itsGlobal.showLeftPanel(htmlStr);
		
		signalManageApp = new Vue({
			el: '#signalManage-app',
			data: {
				signalManage: {status:''},
				newGridPolygon:null
				
			},
			methods: {
				save: function () {
				    //表单验证
				    $("#detailForm").validate({
				    	/* !!!验证时请替换为真实字段
				    	rules: {
				    		version: {
		    					number: true
			    			}
				    	},
				    	messages: {
				    		version: {
			    				number: "版本号必须是数字"
			    			}
				    	},*/
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							var url = "./dev/signalCtrler/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(signalManageApp.signalManage),
							    success: function(rslt){
							    	if(rslt.code === 200){
										alert('操作成功', function(index){
											itsGlobal.hideLeftPanel();
										});
									}else{
										alert(rslt.msg);
									}
								}
							});
				            return false;//已经用AJAX提交了，需要阻止表单提交
				        }
					});
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		querzSignal(id);
		
		vueEureka.set("leftPanel", {
			vue: signalManageApp,
			description: "signalManage的vue实例"
		});
	};
	
	
	var querzSignal=function(id) {
		if(id == null){
			return ;
		}
		$.ajax({
		    url: "./dev/signalCtrler/detail/"+id,
		    success: function(rslt){
				if(rslt.code == 200){
					var sxin = rslt.signalCtrler;
					signalManageApp.signalManage=sxin;
					if(sxin.status ==null ||sxin.status ==''){
						signalManageApp.signalManage.status='';
					}
				}else{
					alert(rslt.msg);
				}
			}
		});
	}
	
	
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show : show,
		hide : hide
	};
})