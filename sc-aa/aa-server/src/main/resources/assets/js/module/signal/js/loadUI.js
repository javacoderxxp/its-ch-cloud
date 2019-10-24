//stageUnit 公共组件  阶段控制单元
var stageUnit = Vue.extend({
	template: '#stage-Tpl',
	data: function() {
    	return {
	      	stageTimeOut:"",
	      	totalStageTime:""
	    }
    },
	props: ['stage','crossId','deviceId'],
	methods: {
	}
});
//ctrlUnit 公共组件  信号机控制单元
var ctrlUnit = Vue.extend({
	template: '#ctrlUnit-Tpl',
	data: function() {
    	return {
	      	stageList: [],
			runInfo:{
				curTimePatternNo:"",
				curStageTimeNo:""
			},
			staticInfo:{},
			curCycleLen:"",
			controlMode:"",
			controlModeClassName:"label label-primary",
			hasNewStage:false,
			workStatus:"",
			oldStage:"",
			needSetCheckboxStyle:true,
			initSwitchStatus:false,
			countdown:"",
			lockUser:"",
			modeCtrlShow:false,
			hasCtrlRole:false
	    }
    },
	props: ['staticInfo','hasCtrlRole'],
	components: {
		'stage': stageUnit
	},
	methods: {
		//解除控制
		release:function(){
			PosindaLib.SignalUtils.releaseSignal(this.staticInfo.crossId);
		},
		//设置黄闪
		setYellowFlash:function(){
			PosindaLib.SignalUtils.setYellowFlash(this.staticInfo.crossId,true);
		},
		//设置全红
		setAllRed:function(){
			PosindaLib.SignalUtils.setAllRed(this.staticInfo.crossId,true);
		},
		//查看监控
		showCamera:function(){
		},
		//查看地图
		showMap:function(){
		},
		//设置checkbox样式，并绑定check事件
		setCheckboxStyle:function(){
			if(this.needSetCheckboxStyle){
				var crossId = this.staticInfo.crossId;
				var radioName = crossId+"_radio";
				var that = this;
				setTimeout(function(){
					$("[name= "+radioName+"]").not('[data-switch-no-init]').bootstrapSwitch({
						onSwitchChange: function (e, state,skip) {
							e.preventDefault();
						    var stageNo = e.target.getAttribute("data-stage");
						    // 若锁定信息中包含当前阶段号，并且已经锁定，则不发送锁定命令
						    if(that && that.runInfo.lockInfo){
						    	var lockInfo = that.runInfo.lockInfo;
								if(state && lockInfo.locked && stageNo == lockInfo.lockStageNo){
									return;
								}
						    }
						    if(that.initSwitchStatus){
						    	that.initSwitchStatus = false;
						    	return;
						    }
						    PosindaLib.SignalUtils.lockSignal(crossId,stageNo,state);
						    $("[name= "+radioName+"]").bootstrapSwitch("disabled",true);
						    setTimeout(function(){
						    	$("[name= "+radioName+"]").bootstrapSwitch("disabled",false);
						    }, 2500);
					}});
					$("[name= "+radioName+"]").bootstrapSwitch("disabled",false);
					that.needSetCheckboxStyle = false;
					$(".ctrl-switch-btn").hide();
				}, 150);
			}
		},
		//设置当前在跑的阶段列表
		setStageList:function(){
			var curPlanNo = this.runInfo.curTimePatternNo;
			var curStageTimeNo = this.runInfo.curStageTimeNo;
			var plans = this.staticInfo.signalPlans;
			for (var i = 0; i < plans.length; i++) {
				var plan = plans[i];
				if(plan.planNo == curPlanNo){
					this.stageList = [];
					this.curCycleLen = plan.cycleLen;
					for (var j = 0; j < plan.stageList.length; j++) {
						var oneStage = plan.stageList[j];
						if(oneStage.stageTimeNo == curStageTimeNo){
							Vue.set(oneStage,'lock',false);
							this.stageList.push(oneStage);
						}
					}
					this.curCycleLen = plan.cycleLen;
					this.needSetCheckboxStyle = true;
				}
			}
		},
		modeChangeToManCtrl:function(){
			var crossId = this.staticInfo.crossId;
			PosindaLib.SignalUtils.switchSignalCtrl(crossId,this.runInfo.curStage,true);
		},
		modeChangeToAuto:function(){
			var crossId = this.staticInfo.crossId;
			PosindaLib.SignalUtils.switchSignalCtrl(crossId,this.runInfo.curStage,false);
		},
		// 处理黄闪
		handleAllYellowFlash:function(){
			for (var i = 0; i < this.stageList.length; i++) {
				var stage = this.stageList[i];
				for (var m = 0; m < stage.phaseList.length; m++) {
					var ph = stage.phaseList[m];
					ph.color = "yellow";
				}
			}
		},
		// 处理全红
		handleAllRed:function(){
			for (var i = 0; i < this.stageList.length; i++) {
				var stage = this.stageList[i];
				for (var m = 0; m < stage.phaseList.length; m++) {
					var ph = stage.phaseList[m];
					ph.color = "red";
				}
			}
		},
		// 设置信号机运行信息
		setSignalRunInfo:function(){
			var curStageNo =  this.runInfo.curStage;
			var mode = this.runInfo.controlMode;
			var status = this.runInfo.workStatus;
			var lockInfo = this.runInfo.lockInfo;
			var mode_class = PosindaLib.SignalUtils.getControlMode(mode);
			this.controlMode = mode_class.mode;
			this.controlModeClassName = mode_class.className;
			this.workStatus =  PosindaLib.SignalUtils.getWorkStatus(status);
			var crossId = this.staticInfo.crossId;
			var that = this;
			if(mode == "6"){
				if(lockInfo && lockInfo.lockUser){
					this.lockUser = lockInfo.lockUser;
				}else{
					this.lockUser = "其他平台";
				}
				
				if(this.lockUser != "其他平台" && this.lockUser != currentUser.userId){
					this.modeCtrlShow = false;
					$(".ctrl-switch-btn").hide();
				}else{
					this.modeCtrlShow = true;
					$(".ctrl-switch-btn").show();
				}
				// 手动控制 并且 lockInfo有相应信息
				if(status == "0"){
					//关灯
					this.handleAllRed();
					return;
				}else if(status == "1"){
					// 全红
					this.handleAllRed();
					return;
				}else if(status == "2"){
					// 闪光
					this.handleAllYellowFlash();
					return;
				}
				this.countdown = this.runInfo.stageTimeOut;
			}else{
				//倒计时
				this.countdown = this.runInfo.stageTimeOut;
				var remainder = parseInt(this.runInfo.totalStageTime) - parseInt(this.runInfo.stageTimeOut);
				if(remainder>=0){
					this.countdown = remainder;
				}else{
					this.countdown = 0 - remainder;
				}
				this.lockUser = "";
				this.modeCtrlShow = true;
				$(".ctrl-switch-btn").hide();
			}
			// 标准
			if(curStageNo == "0"){
				if(lockInfo){
					if(lockInfo.lockPhaseNo){
						var colorPhaselist = this.resetPhaseColor(this.runInfo.colorPhaselist);
						for (var j = 0; j < colorPhaselist.length; j++) {
							var phase = colorPhaselist[j];
							$("#direc_"+phase.direcId).attr("class", phase.color);
						}
					}else{
						curStageNo = this.oldStage == ""? lockInfo.lockStageNo:this.oldStage;
					}
				}else{
					var curDirecList = this.runInfo.colorPhaselist;
					if(!this.hasNewStage){
						var tempStage = {
							stageNo:"0",
							phaseList:curDirecList,
							lock:false
						};
						this.stageList.push(tempStage);
						this.hasNewStage = true;
						this.needSetCheckboxStyle = true;
					}
				}
			}else{
				this.oldStage = curStageNo;
				for (var i = 0; i < this.stageList.length; i++) {
					if(this.stageList[i].stageNo == "0"){
						this.stageList.splice(i, 1);
						this.hasNewStage = false;
						break;
					}
				}
			}
			
			for (var i = 0; i < this.stageList.length; i++) {
				var stage = this.stageList[i];
				var stageNo = stage.stageNo;
				if(!stage.totalStageTime){
					Vue.set(stage,'totalStageTime',this.runInfo.totalStageTime); //!后添加的属性必须动态的增加get set
				}
				if(!stage.stageTimeOut){
					Vue.set(stage,'stageTimeOut',this.runInfo.stageTimeOut);
				}
				if(lockInfo){
					if(lockInfo.locked){
						if(stageNo == lockInfo.lockStageNo){
							stage.lock = true;
						}else{
							stage.lock = false;
						}
					}
					var ele = $("#"+crossId+"_"+lockInfo.lockStageNo);
					var state = ele.bootstrapSwitch('state');
					if(!state){
						ele.bootstrapSwitch('state',true)
					}
				}else{
					stage.lock = false;
					var ele = $("#"+crossId+"_"+stageNo);
					var state = ele.bootstrapSwitch('state');
					if(state){
						ele.bootstrapSwitch('state',false)
					}
				}
				if(stageNo == curStageNo){
					stage.totalStageTime = this.runInfo.totalStageTime;
					stage.stageTimeOut = this.runInfo.stageTimeOut;
					var colorPhaselist = this.resetPhaseColor(this.runInfo.colorPhaselist);
					if(curStageNo == "0"){
						stage.phaseList = colorPhaselist;
					}
					for (var j = 0; j < colorPhaselist.length; j++) {
						var phase = colorPhaselist[j];
						$("#direc_"+phase.direcId).attr("class", phase.color);
						for (var p = 0; p < stage.phaseList.length; p++) {
							var ph = stage.phaseList[p];
							if(ph.direcId == phase.direcId){
								ph.color = phase.color;
								break;
							}
						}
					}
				}else{
					for (var m = 0; m < stage.phaseList.length; m++) {
						var ph = stage.phaseList[m];
						ph.color = "red";
					}
				}
			}
		},
		resetPhaseColor:function(phaselist){
			for (var i = 0; i < phaselist.length; i++) {
				var phase = phaselist[i];
				phase.color = PosindaLib.SignalUtils.getPhaseColor(phase.color.trim());
			}
			return phaselist;
		},
		handleRunInfo:function(curVal,oldVal){
			if(curVal){
				if(curVal.curTimePatternNo && curVal.curStageTimeNo && curVal.curTimePatternNo != "" && curVal.curStageTimeNo != ""){
					//实时运行方案与当前方案不同，则更新stage列表
					if(curVal.curTimePatternNo != oldVal.curTimePatternNo || curVal.curStageTimeNo != oldVal.curStageTimeNo){
						this.setStageList();
					}
					this.setSignalRunInfo(); //设置每个stage里面的运行数据
					this.setCheckboxStyle();
				}
			}
		}
	},
	watch:{
		runInfo:'handleRunInfo'
	}
});