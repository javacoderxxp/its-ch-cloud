define(function(require) {
	var htmlStr = require('text!./trafficCondConfirm.html');
	var Vue = require('vue');
	var trafficCondConfirmPanelApp;
		
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		trafficCondConfirmPanelApp = new Vue({
			el : '#trafficConfirm-panel',
			data : {
				statusList:[],
				switchStatus:true,
				roadItem:{},
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			watch:{
				switchStatus:'setBootStrapSwitch'
			},
			methods : {
				close : function() {
					itsGlobal.hideLeftPanel();
				},
				//初始化开关的值
				setSwitchStatus : function(){
					$.ajax({
						type: "GET",
					    url: "./sys/parameter/allData",
					    async: false,
					    success: function(rslt){
							if(rslt.code == 200){
								var list = rslt.parameterList;
								if(null != list && list.length > 0) {
									for(var i=0;i<list.length;i++){
										var item = list[i];
										if("road.status.check" == item.key){
											trafficCondConfirmPanelApp.roadItem=item;
											if(item.value=="N"){
												trafficCondConfirmPanelApp.switchStatus=false;
											}
											break;
										}
									}
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				//设置开关、修改开关的值
				setBootStrapSwitch:function(cur,old){
		            $("#mySwitch input").bootstrapSwitch({
		            	state:trafficCondConfirmPanelApp.switchStatus,
		            	size:"small",
		            	onColor:"success",
		            	offColor:"warning",
		    			onSwitchChange: function (e, state) {
		    				e.preventDefault();
		    				var url = "./sys/parameter/save";
		    				trafficCondConfirmPanelApp.roadItem.value=$('#mySwitch input').bootstrapSwitch('state')?"Y":"N";
		    				$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(trafficCondConfirmPanelApp.roadItem),
							    success: function(rslt){
							    	if(rslt.code === 200){
										alert('操作成功', function(index){
											trafficCondConfirmPanelApp.switchStatus = !trafficCondConfirmPanelApp.switchStatus;
										});
									}else{
										alert(rslt.msg);
									}
								}
							});
		    		}});
				},
				//加载数据
				loadData: function () {
	    				$.ajax({
	    					url: "./vms/rlinkStatus/getLatestLinkStatus",
	    					success: function(rslt){
	    						if(rslt.code == 200){
	    							trafficCondConfirmPanelApp.statusList = rslt.statusList;
	    						}else{
	    							alert(rslt.msg);
	    						}
	    					}
	    				});
	    		},
	    		//展示图片
				showImg : function(e) {
					var imgPathTmp = e.target.getAttribute("data-item-id");
					imgPathTmp = imgPathTmp.replace(/\\/g, "/");
					if(itsEnv != 'prod'){
						$("#vmsImgPanel").attr("src", "http://localhost/filestorage/permanent/gaode_vmsImg/"+imgPathTmp+"?random="+new Date().getTime());
					}else{
						$("#vmsImgPanel").attr("src", "http://192.168.14.4:81/filestorage/permanent/gaode_vmsImg/"+imgPathTmp+"?random="+new Date().getTime());
					}
					
					/*$("#vmsImgPanel").attr("src", "http://localhost:8771/sc-itsweb/vms/rlinkStatus/readVmsImage?imgPath="+e.target.getAttribute("data-item-id")+"&random="+new Date().getTime());*/
	    		    layer.open({
	    				type: 1,
	    				skin: 'layui-layer-lan',
	    				title: "路况图像",
	    				area: ['512px', '365px'],
	    				shade: 0,
	    				content: $("#vmsImgPanel").parent()
	    			});
				},
				//人工确认
				updateStatus : function(e){
					var id = e.target.getAttribute("data-item-id");
					var value = e.target.getAttribute("data-item-value");
					$.ajax({
						type: "POST",
					    url: "./vms/rlinkStatus/updateConfirmStatus?id="+id+"&status="+value,
					    success: function(rslt){
							if(rslt.code == 200){
									alert('操作成功');
									trafficCondConfirmPanelApp.loadData();//重新载入
							}else{
								alert(rslt.msg);
							}
						}
					});
					
				}
			}
		});
		
		trafficCondConfirmPanelApp.loadData();
		trafficCondConfirmPanelApp.setSwitchStatus();
		trafficCondConfirmPanelApp.setBootStrapSwitch();
		
		vueEureka.set("leftPanel", {
			vue : trafficCondConfirmPanelApp,
			description : "trafficCondConfirmPanel的vue实例"
		});
		
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	};

	return {
		show : show,
		hide : hide
	};
	
	
})