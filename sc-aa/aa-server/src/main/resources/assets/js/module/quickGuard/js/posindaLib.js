/** 信号机操作Util PosindaLib.SignalUtils
 *  addSignal(crossId): 添加一个信号机
 *  lockSignal(crossId,stageNo,isLock) ： 锁定或解锁一个信号机
 *  loadSignalList : 加载信号机列表
 */
var PosindaLib = window.PosindaLib = PosindaLib || {};
(function() {
	var addedSignalsMap = new Map(),runInfoTimer = null,signalListApp = null, userId = null, currentCrossId=null;
	var URLS = {
		getCurrentUser:"../../../../currentUser",
		getSignalList:"../../../../dev/signalCtrler/allData",
		getStaticInfo:"../../../../signalCtrl/getStaticInfo/{0}",
		getRunInfo:"../../../../signalCtrl/getRunInfo/{0}",
		setSignalStage:"../../../../signalCtrl/setSignalStage",
		setSignalYellowFlash:"../../../../signalCtrl/setSignalYellowFlash?crossId={0}&userId={1}&isYellowFlash={2}",
		setSignalAllRed:"../../../../signalCtrl/setSignalAllRed?crossId={0}&userId={1}&isAllRed={2}",
		releaseSignal:"../../../../signalCtrl/releaseSignal?crossId={0}&userId={1}",
		switchSignalCtrl:"../../../../signalCtrl/switchSignalCtrl?crossId={0}&userId={1}&stageNo={2}&isManCtrl={3}"
	};
	
	var a = PosindaLib.SignalUtils = function() {};
	a.clearSignalListApp = function(){
		if(signalListApp){
			signalListApp.list = [];
		}
	}
	a.addSignal = function(signal) {
		var crossId = signal.crossId;
		if(null == crossId  || "" == crossId.trim()){
			return false;
		}
		crossId = crossId.trim();
		if(addedSignalsMap.get(crossId)){
			return true;
		}
		addedSignalsMap.set(crossId,{signal:signal});
//		loadSignalStaticInfo(crossId);
		getRunInfoByTimer();
		return true;
	};
	
	a.lockSignal = function(crossId,stageNo,isLock){
		//TODO 1. 判定用户
		var userId = this.userId;
		var type = isLock ? "锁定" : "解锁";
		var lockObj = {
			crossId: crossId,
			stageNo: stageNo,
			isLock:isLock,
			userId:userId
		}
		var url = URLS.setSignalStage;
		$.ajax({
		  type: "POST",
		  url: url,
		  data: JSON.stringify(lockObj),
		  dataType: "json",
		  contentType: "application/json; charset=utf-8",
		  cache: false,
		  success: function (msg) {
		      if(msg.code == 200 && msg.send == "1"){
		    	  layer.msg(type +" 命令发送成功",{offset: ['300px', '250px']});
		      }else{
		    	  layer.msg(type +" 命令发送失败",{offset: ['300px', '250px']});
		      }
		  },
		  error:function(){
			  layer.msg(type +" 命令发送失败");
		  }
		});
	}
	a.releaseSignal = function(crossId){
		var userId = this.userId;
		var url = URLS.releaseSignal.replace(/\{0\}/g,crossId).replace(/\{1\}/g,userId)+ "&rd=" + getRandomStr();
		$.get(url, function(data){
			if(data.code == 200){
				layer.msg("解除控制命令发送成功",{offset: ['300px', '250px']});
			}else{
				layer.msg("解除控制命令发送失败",{offset: ['300px', '250px']});
		}});
	}
	a.switchSignalCtrl = function(crossId,curstage,isManCtrl){
		var userId = this.userId;
		var url = URLS.switchSignalCtrl.replace(/\{0\}/g,crossId).replace(/\{1\}/g,userId).replace(/\{2\}/g,curstage).replace(/\{3\}/g,isManCtrl)+ "&rd=" + getRandomStr();
		$.get(url, function(data){
			if(data.code == 200){
				layer.msg("切换控制方式命令发送成功",{offset: ['300px', '250px']});
			}else{
				layer.msg("切换控制方式命令发送失败",{offset: ['300px', '250px']});
		}});
	}
	a.setAllRed = function(crossId,isAllRed){
		var userId = this.userId;
		var url = URLS.setSignalAllRed.replace(/\{0\}/g,crossId).replace(/\{1\}/g,userId).replace(/\{2\}/g,isAllRed)+ "&rd=" + getRandomStr();
		$.get(url, function(data){
			if(data.code == 200){
				layer.msg("全红命令发送成功",{offset: ['300px', '250px']});
			}else{
				layer.msg("全红命令发送失败",{offset: ['300px', '250px']});
		}});
	}
	a.setYellowFlash = function(crossId,isYellowFlash){
		var userId = this.userId;
		var url = URLS.setSignalYellowFlash.replace(/\{0\}/g,crossId).replace(/\{1\}/g,userId).replace(/\{2\}/g,isYellowFlash)+ "&rd=" + getRandomStr();
		$.get(url, function(data){
			if(data.code == 200){
				layer.msg("黄闪命令发送成功",{offset: ['300px', '250px']});
			}else{
				layer.msg("黄闪命令发送失败",{offset: ['300px', '250px']});
		}});
	}
	a.addToHandleList = function(sigs){
		var container = document.getElementById("signal-container");
		$(container).empty();
		for (var m in sigs) {
			var sig = sigs[m];
			sig.manCtrl = false;
		}
		var signals = JSON.parse(JSON.stringify(sigs));
		if(null == signalListApp){
			signalListApp = new Vue({
				el:"#signal-list-app",
				data:{
					list:signals
				},
				methods:{
					signalLiClick:function(e){
						var sig = e;
//						layer.confirm('加载信号机 '+sig.deviceName+"?", {
//						  btn: ['确定','取消'], //按钮
//						  yes:function(index){
//							  layer.close(index);
//							  if(PosindaLib.SignalUtils.addSignal(sig)){
//								  loadSignalStaticInfo(sig);
//							  }
//						  }
//						});
						if(PosindaLib.SignalUtils.addSignal(sig)){
							  loadSignalStaticInfo(sig);
						}
					}
				}
			});
		}else{
			for (var j in signals) {
				var sig = signals[j];
				var notIn = true;
				for(var pp in signalListApp.list){
					var asig = signalListApp.list[pp];
					if(asig.crossId == sig.crossId){
						notIn = false;
						break;
					}
				}
				if(notIn){
					signalListApp.list.push(sig);
				}
			}
		}
		if(!sessionStorage || !sessionStorage.setItem){
			return;
		}
		sessionStorage.setItem("signals",JSON.stringify(signalListApp.list));
		for (var i in signals) {
			var sig = signals[i];
//			if(i == 0){
//				setTimeout(function(){
//					loadSignalStaticInfo(sig);
//				}, 1500);
//			}
			PosindaLib.SignalUtils.addSignal(sig);
		}
		var sig = signals[0];
		setTimeout(function(){
			var container = document.getElementById("signal-container");
			$(container).empty();
			loadSignalStaticInfo(sig);
		}, 1500);
		sessionStorage.setItem("refresh",false);
	}
	
	a.init = function(){
		var that = this;
		var url = URLS.getCurrentUser + "?" + getRandomStr();
		$.get(url, function(rslt){
			if(rslt.currentUser){
				currentUser = window.currentUser = rslt.currentUser;
				that.userId = currentUser.userId;
				document.getElementById('username').innerText=currentUser.userName;
			}
		});
	}
	
	function loadSignalStaticInfo(signal){
		//1. 先加div容器，避免ajax异步影响先后顺序
		var crossId = signal.crossId;
		var container = document.getElementById("signal-container");
		//只加载一台，先清除
		$(container).empty();
		//2. ajax获取静态数据
		var url = URLS.getStaticInfo.replace(/\{0\}/g,crossId)+ "?" + getRandomStr();
		$.ajax({
		    url: url,
		    type: 'GET',
		    dataType: 'json',
		    error: function(){
		    	layer.msg("获取静态数据失败",{offset: ['300px', '250px']});
		    	//$(panel).remove(); //IE9
		    },
		    success: function(dat){
		    	//3. 生成vue组件，并进行挂载
		    	if(dat.code == "200"){
		    		var panel = document.createElement("div");
		    		panel.id = "crossId_"+crossId;
		    		container.appendChild(panel);
//		    		addedSignalsMap.set(crossId,{signal:signal});
		    		var hasCtrlRole = false;
		    		if($.inArray("qwzhs",currentUser.roleIdList) >= 0){
		    			hasCtrlRole = true;
		    		}
					var data =  {staticInfo:dat.staticInfo,hasCtrlRole:hasCtrlRole};
					var obj = addedSignalsMap.get(crossId);	
					currentCrossId = crossId;
					var app = new ctrlUnit({propsData:data}).$mount();
					document.getElementById('crossId_'+crossId).appendChild(app.$el);
					obj.vueApp = app;
		    	}else{
		    		layer.msg("获取静态数据失败",{offset: ['300px', '250px']});
		    		//$(panel).remove();//IE9
		    	}
		    }
		});
	}
	
	function getRunInfoByTimer(){
		if(null == runInfoTimer){
			runInfoTimer = setInterval(function(){
				var crossIdArr = [];
				addedSignalsMap.forEach(function(v,k){
					crossIdArr.push(k);
				});
				if(crossIdArr.length == 0){
					return;
				}
				var queryParam = crossIdArr.toString();
				var url = URLS.getRunInfo.replace(/\{0\}/g,queryParam)+ "?" + getRandomStr();
				$.get(url, function(dat){
					if(dat.code == 200){
						var runInfoMap = dat.runInfo;
						for(var k in runInfoMap){
							var runInfoObj = runInfoMap[k];
							var cloneObj = JSON.parse(JSON.stringify(runInfoObj));
							var obj = addedSignalsMap.get(k);
							if(obj){
								var app = obj.vueApp;
								if(app){
									if(currentCrossId && currentCrossId == k){
										app.runInfo = cloneObj;
									}
								}
								for(var p in signalListApp.list){
									var sig = signalListApp.list[p];
									if(sig.crossId == k){
										if(cloneObj.controlMode == "6"){
											sig.manCtrl = true;
										}else{
											sig.manCtrl = false;
										}
									}
								}
							}
						}
					}else{
						//layer.msg("获取信号机实时运行数据失败");
					}
				});
			},1000);
		}
		return runInfoTimer;
	}
	a.getSignalLocked = function(){
		var lockedList=[];
		addedSignalsMap.forEach(function(v,k){
			var app = v.vueApp;
			if(app && app.runInfo && app.runInfo.lockInfo){
		    	var lockInfo = app.runInfo.lockInfo;
				if(lockInfo.locked && lockInfo.lockStageNo){
					lockedList.push(app.staticInfo.deviceName);
				}
		    }
		});
		return lockedList;
	}
	a.closeRunInfoTimer = function(){
		if(null != runInfoTimer){
			clearInterval(runInfoTimer);
		}
	}
	function getRandomStr(){
		var t = "rdm="+ Date.now();
		return t;
	}
	
	a.getControlMode = function(controlMode){
		var mode = "多时段",claz="primary";
		switch (controlMode) {
			case "1":
				mode = "多时段";
				break;
			case "2":
				mode = "系统优化";
				break;
			case "3":
				mode = "无电线缆协调";
				break;
			case "6":
				mode = "手动";
				claz = "danger";
				break;
			case "7":
				mode = "感应";
				break;
			case "10":
				mode = "自适应";
				break;
			case "11":
				mode = "面板控制";
				claz = "danger";
				break;
			case "15":
				mode = "优先控制";
				break;
			default:
				break;
		}
		var className = "label label-"+claz;
		return {
			mode:mode,
			className:className
		};
	}
	a.getWorkStatus = function(workStatus){
		var mode = "标准";
		switch (workStatus) {
			case "0":
				mode = "关灯";
				break;
			case "1":
				mode = "全红";
				break;
			case "2":
				mode = "闪光";
				break;
			case "3":
				mode = "标准";
				break;
			default:
				break;
		}
		return mode;
	}
	a.getPhaseColor = function(colorCode){
		var color = "red";
		switch (colorCode) {
			case "0":
				color = "close"; //关灯
				break;
			case "16":
				color = "red"; //红灯
				break;
			case "32":
				color = "yellow"; //黄灯 
				break;
			case "48":
				color = "green"; //绿灯
				break;
			case "17":
				color = "redFlash"; //红闪
				break;
			case "33":
				color = "yellowFlash"; //黄闪
				break;
			case "49":
				color = "greenFlash"; //绿闪
				break;
			default:
				break;
		}
		return color;
	}
})();