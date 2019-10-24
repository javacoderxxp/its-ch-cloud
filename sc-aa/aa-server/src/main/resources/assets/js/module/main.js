var its_version = "1.0";
//定义一个require的配置方法，
var requireConfig={
    baseUrl: './assets/js/module',
    urlArgs: 'ver='+its_version,
    paths  : {
        text:'../../plugins/requirejs/text',  
        jquery:'../../plugins/jQuery/jquery-2.2.3.min',  //jquery.js
        jqueryForm:'../../plugins/jQuery/jquery.form',  //jqueryform
        bootstrap:'../../plugins/bootstrap/js/bootstrap.min',
        vue:'../../plugins/vue/vue.min',
        //echart
        echarts:'../../plugins/echarts/echarts.min',
        datatool:'../../plugins/echarts/dataTool.min',
        echartsWalden:'../../plugins/echarts/theme/walden',
//        layui:'../../plugins/layui-v2.1.0/layui',
        layer:'../../plugins/layer/layer',
        jqgrid:'../../plugins/jqgrid/js/jquery.jqGrid.src',
        jqgridi18n:'../../plugins/jqgrid/js/i18n/grid.locale-cn',
        bootstrapSelect:'../../plugins/bootstrap-select/js/bootstrap-select',
        bootstrapSelectZh:'../../plugins/bootstrap-select/js/i18n/defaults-zh_CN',
        /*bootstrapMultiselect:'../../plugins/bootstrap-multiselect/js/bootstrap-multiselect',*/
        jqueryValidate:'../../plugins/jquery-validate/jquery.validate.min',
        jqueryValidateMsgZh:'../../plugins/jquery-validate/messages_zh',
        datetimepicker:'../../plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min',
        bootstrapSwitch:'../../plugins/bootstrap-switch/js/bootstrap-switch.min',
        bootstrapTypeahead:'../../plugins/bootstrap3-typeahead/bootstrap3-typeahead',
        zTree:'../../plugins/ztree/jquery.ztree.all.min',
        md5:'../../plugins/md5.min',  
        brush:'../../plugins/bootstrap-step/js/brush',  
        moment:'../../plugins/moment/moment.min', 
        fullcalendar:'../../plugins/fullcalendar/fullcalendar.min',  
        fullcalendarZh:'../../plugins/fullcalendar/zh-cn',  
        jqueryFileuploadIframe:'../../plugins/jQuery-File-Upload/js/jquery.iframe-transport',
        jqueryFileuploadUiW:'../../plugins/jQuery-File-Upload/js/vendor/jquery.ui.widget',
        jqueryFileupload:'../../plugins/jQuery-File-Upload/js/jquery.fileupload',
        my97Datepicker:'../../plugins/My97DatePicker/WdatePicker',
        jqueryUI:'../../plugins/jquery-ui/jquery-ui.min',
        duallistbox:'../../plugins/bootstrap-duallistbox/jquery.bootstrap-duallistbox',
    },
    shim  : { 
        bootstrap:{ 
            deps:['jquery'] 
        },
        bootstrapSelectZh:{ 
            deps:['bootstrapSelect'] 
        },
        fullcalendarZh:{ 
            deps:['fullcalendar'] 
        },
        jqueryUI:{
        	deps:['jquery'] 
        }
    }
}
requirejs.config(requireConfig);  

/**
 * 全局定义的 vue 实例 的注册中心;
 * key: vue
 * value : {{vue:ctrlPanelApp,description:"CtrlPanel的vue实例"}}
 * @example
 * vueEureka.set("leftPanel",{vue:ctrlPanelApp,description:"CtrlPanel的vue实例"});
 */
var vueEureka = window.vueEureka = vueEureka || new Map();
var itsGlobal = window.itsGlobal = itsGlobal || {};
var gblMapObjs = window.gblMapObjs = gblMapObjs || {};

var dataClusterStyle =  window.dataClusterStyle = [];
var dstyle1 = {
		url:"./assets/images/lan.png",
		height:35,
		width:35,
		anchor:[0,0],
		textColor:"black",
		textSize:10,
		maxSize:10
};
dataClusterStyle.push(dstyle1);
var dstyle2 = {
		url:"./assets/images/lv.png",
		height:45,
		width:45,
		anchor:[0,0],
		textColor:"black",
		textSize:10,
		maxSize:50
};
dataClusterStyle.push(dstyle2);
var dstyle3 = {
		url:"./assets/images/huang.png",
		height:55,
		width:55,
		anchor:[0,0],
		textColor:"black",
		textSize:10,
		maxSize:100
};
dataClusterStyle.push(dstyle3);
var dstyle4 = {
		url:"./assets/images/hong.png",
		height:65,
		width:65,
		anchor:[0,0],
		textColor:"black",
		textSize:10,
		maxSize:500
};
dataClusterStyle.push(dstyle4);
var dstyle5 = {
		url:"./assets/images/zi.png",
		height:75,
		width:75,
		anchor:[0,0],
		textColor:"black",
		textSize:10,
		maxSize:1000
};
dataClusterStyle.push(dstyle5);

itsGlobal.showLeftPanel = function(htmlStr, showPopup){
	itsGlobal.closeLeftPanel(showPopup);
	if(showPopup){
		var popUpPanel = $("#globalPopupPanel");
		popUpPanel.html(htmlStr);
		$("#globalPopupPanel").show();
		layer.open({
			type: 1,
			offset: '150px',
			skin: 'layui-layer-rim',//加上边框
			title: "查询",
			area: ['570px','550px'], //宽高
			shade: 0,
			shadeClose: false,
			content: $("#globalPopupPanel"),
			end: function(){
				itsGlobal.closeLeftPanel(showPopup);
			},
		});
	}else{
		var leftPanel = $("#leftPanel");
		leftPanel.html(htmlStr);
		leftPanel.fadeIn().css("display","inline-block");
		//可以拖拽
		setTimeout("TUtils.leftPanelDragEnable()", 500);
		
		$("#realtimeAlarm-panel").hide();
		$('#sideBarTableft').css('background','url("./assets/images/slide-kai.png") no-repeat');
	}
}

itsGlobal.hideLeftPanel = function(showPopup){
	if(showPopup){
		//hide popupPanel
		$("#globalPopupPanel").hide();
	}else{
		//!!!切换菜单时候也要隐藏popup
		//hide popupPanel
		layer.closeAll();
		$("#globalPopupPanel").hide();
		//hide leftPanel
		$("#leftPanel").hide();
		//$("#realtimeAlarm-panel").show();//2018年8月20日11:55:45  根据需求切换页面后  不需要自动展示实时警情
		$('#sideBarTableft').css('background','url("./assets/images/slide-sou.png") no-repeat');
	}
//	itsGlobal.closeLeftPanel(showPopup);
}

itsGlobal.closeLeftPanel = function(showPopup){
	if(showPopup){
		//close popupPanel
		var obj = vueEureka.get("globalPopupPanel");
		if(obj){
			obj.vue.close();//close 一般先会回调hide();
			obj.vue.$destroy();
		}
	}else{
		//!!!切换菜单时候也要关闭popup
		//close popupPanel
		var obj = vueEureka.get("globalPopupPanel");
		if(obj){
			obj.vue.close();//close 一般先会回调hide();
			obj.vue.$destroy();
		}
		//hide leftPanel
		obj = vueEureka.get("leftPanel");
		if(obj){
			obj.vue.close();//close 一般先会回调hide();
			obj.vue.$destroy();
		}
	}
}

//安静模式打开菜单
itsGlobal.silentOpenMenu = function(){
	var menuItemObj = arguments[0];
	itsGlobal.sicentOpenMenuArgs= arguments;

	require([menuItemObj],function(menuPanel){
		menuPanel.show();
		if(menuPanel.setParams){//设定参数
			//延时1.5秒给模块内部加载提供时间
			setTimeout(function() {
        	    menuPanel.setParams(itsGlobal.sicentOpenMenuArgs);
			}, 1500);
		}
	});
}

//在main中转  跳到台账页面
itsGlobal.OpenMenuQwSummary = function(){
	var lnglat = arguments[0];
	var iWidth = window.screen.availWidth - 10;
	var iHeight = window.screen.availHeight - 40;
	var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
	var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
	window.open(
		'../qw/main/summary?lnglat='+lnglat,
		'taizhangSummaryWin',
		'height=' + iHeight + ', innerHeight=' + iHeight +
		',width=' + iWidth + ', innerWidth=' + iWidth +
		',top=0,left=0,toolbar=yes,menubar=yes,scrollbars=no,resizable=yes,location=yes');
}

//在main中转  跳到警员勤务页面
itsGlobal.qwComdScene = function(){
	var policeName = arguments[0];
	var groupId = arguments[1];
	var sd = arguments[2];
	var iWidth = screen.availWidth - 10;
	var iHeight = screen.availHeight - 40;
	var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
	var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
	/*var url = encodeURI('../../module/visualScene/dynAlarmVisualScene/emergencyComdScene.html?pn='+policeName
		+'&gId='+groupId+'&sd=2018-0809');*/
	var url = encodeURI('../../../../dynScene/eclist?pn='+policeName
			+'&gId='+groupId+'&sd='+sd);
    window.open(url,
			'qwComdScene',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');

}

//在main中转  跳到中队勤务页面
itsGlobal.qwGroudScene = function(){
	var groupName = arguments[0];
	var groupId = arguments[1];
	var sd = arguments[2];
	var iWidth = screen.availWidth - 10;
	var iHeight = screen.availHeight - 40;
	var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
	var iTop = (window.screen.availHeight - 40 - iHeight) / 2;
	/*var url = encodeURI('../../module/visualScene/dynAlarmVisualScene/emergencyComdScene.html?pn='+policeName
		+'&gId='+groupId+'&sd=2018-0809');*/
	var url = encodeURI('../../../../dynScene/ecGroud?groupName='+groupName
			+'&gId='+groupId+'&sd='+sd);
    window.open(url,
			'qwGroudScene',
			'height=' + iHeight + ', innerHeight=' + iHeight +
			',width=' + iWidth + ', innerWidth=' + iWidth +
			',top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no');

}

define(function(){  //定义一个模块，传入require对象。并执行函数。
    'use strict'

    require(['mainMap','bootstrap','layer'],function(map, bootstrap, layer){
        require(['./navPanel/navPanel'],function(NavPanel){
        	var div=$('#navPanel'); 
            var np = new NavPanel(div); 
            np.test();
        });
        /*
        require(['./mapTuli/mapTuli'],function(MapTuli){
        	var div=$('#mapTuliPanel'); 
            var mapTuli = new MapTuli(div); 
        });
        */
        require(['./mapTool/mapTool'],function(MapTool){
        	var div=$('#mapToolPanel'); 
            var mapTool = new MapTool(div); 
            window.mapTool = mapTool; 
        });
        
        require(['./layerPanel/layerPanel'],function(layerPanel){
        	layerPanel.init();
        });
        
        /*require(['./layers/alarmTask/alarmTaskScheduler'],function(alarmScheduler){
        	alarmScheduler.init();
        });*/
     	require(['./layers/alarmTask/realtimeAlarm'],function(realtimeAlarm){
        	realtimeAlarm.showLayer();
        });
        
        layer.config({
        	path: './assets/plugins/layer/', //layer.js所在的目录，可以是绝对目录，也可以是相对目录
    	});
        /*
        layui.use(['layer'], function(){
  			window.layer = layui.layer;
    	});
        */
        require(['jqgrid','jqgridi18n','jqueryValidate'],function(){
        	$.ajaxSetup({
        		dataType: "json",
        		contentType: "application/json",
        		cache: false
        	});
        	
        	require(['jqueryValidateMsgZh'],function(){
        	});
        });
        
        require(['../common/TConfig'],function(TConfig){//全局配置
            window.TConfig = new TConfig(); 
        });

        require(['../common/TUtils'],function(TUtils){//全局工具类
            window.TUtils = new TUtils(); 
        });
        
        require(['jqueryForm'],function(jqueryForm){//全局工具类
        });

    	require(['bootstrapSwitch'],function(){
    	});
    	
        /*require(['./jtywWidget/jtywWidget'],function(JtywWidget){
            window.JtywWidget = new JtywWidget(); 
        });*/
    	
    	var handleQw = window.handleQw = function(flag,data){
    		switch (flag) {
				case 'wfcf':
					require(['./layers/wfcf/wfcf'],function(wfcf){
						wfcf.loadData(data);
			    	});
					break;
				case 'dlsg':
					require(['./panels/constOccupPanel/constOccup'],function(dlsg){
						dlsg.renderQwData(data);
			    	});
					break;
				case 'ydzl':
					require(['./panels/oftenJam/oftenJamPanel'],function(ydzl){
						ydzl.renderQwData(data);
			    	});
					break;
				case 'aqxc':
					require(['./panels/aqxcPanel/aqxc'],function(aqxc){
						aqxc.loadData(data);
			    	});
					break;
				case 'yhpc':
					require(['./panels/hiddenDanger/yhpc'],function(yhpc){
						yhpc.loadData(data);
			    	});
					break;
				case 'jtsg':
					require(['./layers/jtsg/jtsg'],function(jtsg){
						jtsg.loadData(data);
			    	});
					break;
				case 'tcc':
					require(['./layers/parkingLot/parkingLot'],function(tcc){
						if(data){
							tcc.showLayer(true,data);
						}else{
							tcc.showLayer(false);
						}
			    	});
					break;
				case 'school':
					require(['./layers/school/school'],function(tcc){
						if(data){
							tcc.showLayer(true,data);
						}else{
							tcc.showLayer(false);
						}
			    	});
					break;
				case 'cross':
					require(['./layers/cross/crossLayer'],function(cross){
						if(data){
							cross.showLayer(true,data);
						}else{
							cross.showLayer(false);
						}
			    	});
					break;
				case 'dutyGrid':
					require(['./layers/dutyGrid/dutyGrid'],function(dutyGrid){
						dutyGrid.loadData(data);
			    	});
					break;
				case 'ptrw':
					require(['./panels/missionSendPanel/missionPanel'],function(missionPanel){
						missionPanel.loadData(data);
			    	});
					break;
				case 'zdqy':
					require(['./layers/zdqy/zdqy'],function(zdqy){
						if(data){
							zdqy.showLayer(true,data);
						}else{
							zdqy.showLayer(false);
						}
			    	});
					break;
				default:
					break;
			}
    	}
    	
    	//10s之后启动Timer间隔5s 获取近20s内执行的开道车线路    交警大队用户角色可查看
    	setTimeout(function(){
    		if(currentUser.jjddUser){
	    		setInterval(function(){
	    			$.ajax({
	    				url:'zhdd/autoGuardLine/getActiveExecGuardLine?execSeconds=25',
	    				success:function(r){
	    					if(r.code == 200 && r.list && r.list.length>0 && currentUser.jjddUser){
	    						var header = '<div style="font-size: 18px;font-weight: bold;">';
	    						var content = '';
	    						for (var i = 0; i < r.list.length; i++) {
	    							if(i > 0){
	    								content = content + '<hr class="layui-bg-red">';
	    							}
									var ele = r.list[i];
									var lineName = ele.guardName;
									var execTime = ele.updateDt;
									var cont = "首车领航线路："+lineName+" 在Pad上执行</div>执行时间："+execTime;
									content = content + header + cont;
								}
	    						if(content != '' && content.length > 10){
	    							layer.msg(content, {time: 4500, icon:1,offset: '130px'});
	    						}
	    					}
	    				}
	    			});
	    		}, 5000);
    		}
    	}, 10000);
    });
})