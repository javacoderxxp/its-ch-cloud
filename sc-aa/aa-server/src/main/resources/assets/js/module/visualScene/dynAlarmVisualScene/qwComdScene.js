$(function () {
	initMap();
	loadGroups();
	var searchStr = location.search;
	 
	//由于searchStr属性值包括“?”，所以除去该字符
	searchStr = searchStr.substr(1);
	 
	//将searchStr字符串分割成数组，数组中的每一个元素为一个参数和参数值
	var searchs = searchStr.split("&");
	 
	//获得第一个参数和值
	var pn = searchs[0].split("=");
	var ps = decodeURI(pn[1]).split("-");
	var gId = searchs[1].split("=");
	var sd = searchs[2].split("=");
	vm.dType = ps[0];
	var url= "../dynScene/getUser?pn="+ps[1] +"&gId="+gId[1];
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rstl){
	    	if(rstl.code === 200){
				var user = rstl.user;
				vm.currentUser = rstl.currentUser;
				vm.currentUser.jUser =true;
				if(user){
					vm.groudId = user.group.groupId;
					vm.mjxm = user.userName;
					vm.mjjh = user.policeNo;
					vm.picN = user.policeNo;
					loadUsers();
					$("#umjjh").html(vm.mjjh);
					vm.sd = sd[1];
					vm.groudName = user.group.groupName;
					vm.query();
				}else{
					alert("未查询到警员信息！");
					
				}
			}else{
				alert(rstl.msg);
			}
		}
	});
	
});



var dutyGridPolygon = null; 
var markerOpts = new IMAP.MarkerOptions();
markerOpts.anchor = IMAP.Constants.CENTER;
var polyline;
var tracemarkers=[];
var vm = new Vue({
	el : '#imptDiv',
	data : {
		picN:'',
		mjjh:'',
		mjxm:'',
		groudId:'',
		groudName:'',
		dType:'',
		sd:'',
		groupList:[],
		userList:[],
		workList:[],
		vListA:[],
		vListB:[],
		vListC:[],
		tujizhifaDetailList:[],
		punishList:[],
		wList:{},
		gzNum:{},
		zlNum:{},
		dutyGrid:{},
		hiddenDangerList:[],
		currentUser:{}
	},
	methods: {
		init97DateStart: function(it){
			WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd',onpicked:vm.addQuery});
		},
		addQuery:function(){
			vm.query();
			getDtype();
		},
		query: function () {
			var scheduleDt = $("#usd").text();
			if(scheduleDt){
				vm.sd=scheduleDt;
			}
			vm.cleanPlony();
			vm.showTrackSearchJwt();
			punishWarning();
			//publish();
			hidden();
			qwWork();
			loadData();
			jyrwzl();
			jyclrwgz();
		},
		showTrackSearchJwt: function(){
			vm.cleanPlony();
			var policeNo = vm.mjjh;
			var workTime = vm.sd;
			var startDt = workTime+" 00:00:00";
			var endDt = workTime+" 23:59:59";
			var url= "../jw/gpsDevice/trackJwtSearch?startDt="+startDt
			+"&endDt="+endDt+"&policeNo="+policeNo;
			$.ajax({
				type: "GET",
			    url: url,
			    success: function(rstl){
			    	if(rstl.code === 200){
						var dataList = rstl.gpsDeviceList;
						if(dataList.length === 0){
							//alert("未查询到相关轨迹信息！");
						}else{
							drawTrack(dataList);
						}
						workHisM();
					}else{
						alert(rstl.msg);
					}
				}
			});
		},
		repairdetail: function (longitude,latitude){
			if(longitude && latitude){
				var lnglat = new IMAP.LngLat(longitude,latitude);
				map.setCenter(lnglat);
			}else{
				alert("无点位信息");
			}
		},
		cleanPlony:function (){
			if(polyline){
				map.getOverlayLayer().removeOverlay(polyline);
			}
			for (var i = 0; i < tracemarkers.length; i++) {
				map.getOverlayLayer().removeOverlay(tracemarkers[i]);
			}
			tracemarkers=[];
			vm.workList=[];
			vm.clearDutyGrid();
		},
		openTujizhifaDetail:function(vp,type){
			if(!type){
				return;
			}
			var url = "../qw/violationPunish/getTujizhifaDetail?rdm="+(new Date()).getTime()+"&type="+type;
			if(vp.day){
				url += ("&day="+vp.day);
			}
			if(vp.startDt){
				url += ("&startDt="+vp.startDt);
			}
			if(vp.endDt){
				url += ("&endDt="+vp.endDt);
			}
			if("B" == type){
				if(vp.idCardNo){
					url += ("&idCardNo="+vp.idCardNo);
				}
				if(vp.carNo){
					url += ("&carNo="+vp.carNo);
				}
				if(vp.violatedName){
					url += ("&violatedName="+vp.violatedName);
				}
			}else{
				if(vp.punisherNo){
					url += ("&policeNo="+vp.punisherNo);
				}else{
					return;
				}
			}
			
			$.ajax({
			    url: url,
			    type: 'GET',
			    dataType: 'json',
			    error: function(){
			    	layer.msg("获取突击执法数据失败");
			    },
			    success: function(dat){
			    	if(dat.code == "200"){
			    		vm.tujizhifaDetailList = dat.list;
			    		if(dat.list && dat.list.length>0){
			    		var tm = setInterval(function(){
							var len = $("#tujizhifaDetailTb tr").length;
							if(len == dat.list.length){
								var html = $("#tujizhifaDetail").html();
								layer.open({
								  type: 1,
								  skin: 'layui-layer-rim', //加上边框
								  area: ['800px', '560px'], //宽高
								  content: html
								});
								clearInterval(tm);
							}
						}, 100);
			    		}
			    	}else{
			    		layer.msg("获取突击执法数据失败");
			    	}
			    }
			});
		},
		getDutyListByTeamId: function() {
			loadUsers();
		},
		sbPn: function() {
			vm.mjjh=vm.picN;
			getDtype();
			$("#umjjh").html(vm.mjjh);
			vm.query();
		},
		showDutyGrid: function () {
			vm.clearDutyGrid();
    		var polygonPath = polygonStr2Path(vm.dutyGrid.shape);
    		var opt = {
				'editabled': false,
				"fillColor" : '#6699cc',
				"fillOpacity " : 0.2,
				"strokeColor  " : '#8B7B8B',
				"strokeOpacity" : 1,
				"strokeWeight" : 2,
				"strokeStyle" : "solid",
			};
			dutyGridPolygon = new IMAP.Polygon(polygonPath, opt);
			dutyGridPolygon.data = vm.dutyGrid;
        	map.getOverlayLayer().addOverlay(dutyGridPolygon, true);
//        	vm.openSummaryWin();
		},
		clearDutyGrid: function(){
			if(dutyGridPolygon){
				map.getOverlayLayer().removeOverlay(dutyGridPolygon);
				dutyGridPolygon = null; 
			}
		},
	}
});

//得到工作排班类型
var getDtype = function() {
	vm.dType="";
	var sp=$("#pN option:selected").text().replace(/\s+/g,"");
	var url =  "../qw/schedule/getDtype?scheduleDt="+vm.sd.replace('-','.').replace('-','.')+
	"&groupId="+ vm.groudId + "&mPolice="+ sp;
	$.ajax({
	    url: url,
	    type: 'GET',
	    success: function(rslt){
			if(rslt.code == 200 && rslt.schedule){
				if(rslt.schedule.mPolice && rslt.schedule.mPolice.indexOf(sp) != -1 ){
					vm.dType="早班";
				}
				if(rslt.schedule.nPolice && rslt.schedule.nPolice.indexOf(sp) != -1){
					if(vm.dType){
						vm.dType= vm.dType +",";
					}
					vm.dType= vm.dType +"晚班";			
				}
				if(rslt.schedule.tPolice && rslt.schedule.tPolice.indexOf(sp) != -1){
					if(vm.dType){
						vm.dType= vm.dType +",";
					}
					vm.dType=vm.dType +"日班";
				}
				if(rslt.schedule.cPolice && rslt.schedule.cPolice.indexOf(sp) != -1){
					if(vm.dType){
						vm.dType= vm.dType +",";
					}
					vm.dType=vm.dType +"窗口";
				}
				if(rslt.schedule.sPolice && rslt.schedule.sPolice.indexOf(sp) != -1){
					if(vm.dType){
						vm.dType= vm.dType +",";
					}
					vm.dType=vm.dType +"事故处理";
				}
				if(rslt.schedule.zPolice && rslt.schedule.zPolice.indexOf(sp) != -1){
					if(vm.dType){
						vm.dType= vm.dType +",";
					}
					vm.dType=vm.dType +"值班";
				}
			}else{
				vm.dType="";
			}
		}
	});
}

//责任区管理 
var loadData = function() {
	var url =  "../qw/dutyGrid/getGrgid?userIds="+vm.mjjh+"&startDt="
	+ vm.sd +" 00:00:00"+"&endDt="+ vm.sd +" 23:59:59";
	$.ajax({
	    url: url,
	    type: 'GET',
	    success: function(rslt){
			if(rslt.code == 200){
				vm.dutyGrid = rslt.dutyGrid;
				if(!vm.dutyGrid){
					vm.dutyGrid ={gridId:"无",gridName:"无",userNames:"无",
							description:"无",sgNum:"0",xhdNum:"0",taskNum:"0"}
					layer.msg("无责任区！");
					return;
				}
				vm.showDutyGrid();
			}else{
				//alert(rslt.msg);
			}
		}
	});
};
//警员车辆任务告知
var jyclrwgz = function(){
	var url='../qw/zxjgTask/jyclrwgz?startDt=' + vm.sd +" 00:00:00"
	+"&endDt="+ vm.sd +" 23:59:59" +"&jh="+vm.mjjh;
	$.ajax({
		url: url,
		type: 'GET',
		success: function(dat) {
			vm.gzNum = dat.gzNum;
		},
		error: function(xhr, textStatus) {
			layer.msg("获取统计数据失败！");
		}
	});
}

//警员任务指令
var jyrwzl = function(){
	var url='../emer/mission/jyrwzl?startDt=' + vm.sd +" 00:00:00"
	+"&endDt="+ vm.sd +" 23:59:59" +"&jh="+vm.mjjh;
	$.ajax({
		url: url,
		type: 'GET',
		success: function(dat) {
			vm.zlNum = dat.zlNum;
		},
		error: function(xhr, textStatus) {
			layer.msg("获取统计数据失败！");
		}
	});
}

//工作汇总
var qwWork = function(){
	var url='../pubishSummary/summary?startDt=' + vm.sd +" 00:00:00"
	+"&endDt="+ vm.sd +" 23:59:59" +"&jh="+vm.mjjh;
	$.ajax({
		url: url,
		type: 'GET',
		success: function(dat) {
			vm.wList = dat.list[0];
			/*if(vm.wList.length === 0){
				//alert("未查询到警员当日工作信息！");
				vm.wList.push({type:'无',gpsUpdateDt:'无'})
			}*/
		},
		error: function(xhr, textStatus) {
			layer.msg("获取统计数据失败！");
		}
	});
}

//处罚分析 //2019年4月17日15:42:11  徐主任要求 这个隐藏 不显示
var publish = function(){
	$.ajax({
		type: "GET",
	    url: "../qw/violationPunish/genViolateCount",
	    data: {startDt:vm.sd +" 00:00:00",endDt:vm.sd +" 23:59:59",
	    	zdId:vm.groudId,punisherNo:vm.mjjh},
        dataType: "json",
	    success: function(rstl){
	    	if(rstl.code === 200){
	    		vm.punishList = rstl.punishList;
	    		if(vm.punishList.length === 0){
	    			vm.punishList.push({violatedDesc:'无',comments:'无'})
				}
	    		/*vm.tCounts =0;
	    		for(var i = 0;i<vm.punishList.length;i++){
	    			vm.tCounts =Number(vm.tCounts)+Number(vm.punishList[i].comments);
				}*/
			}else{
				alert(rstl.msg);
			}
		}
	});
}

//警务通-隐患上报(当天)
var hidden = function(){
	$.ajax({
		type: "GET",
	    url: "../jtzx/hiddenDanger/findJwtHidd",
	    data: {startDt:vm.sd +" 00:00:00",endDt:vm.sd +" 23:59:59",
	    	groupId:vm.groudId,policeNo:vm.mjjh},
        dataType: "json",
	    success: function(rstl){
	    	if(rstl.code === 200){
	    		vm.hiddenDangerList = rstl.hiddenDangerList;
	    		if(vm.hiddenDangerList.length === 0){
	    			vm.hiddenDangerList.push({violatedDesc:'无',comments:'无'})
				}
			}else{
				alert(rstl.msg);
			}
		}
	});
}

//执法监督
var punishWarning = function(){
	var url= "../qw/violationPunish/tujiZhifaMap?punisherNo="+vm.mjjh
	+"&groupId="+vm.groudId+"&startDt="+vm.sd +" 00:00:00"+"&endDt="+vm.sd +" 23:59:59";
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rstl){
	    	if(rstl.code === 200){
	    		var data = rstl.punishMap;
	    		vm.vListA = data.listA;
	    		if(vm.vListA.length === 0){
					//alert("未查询到警员当日工作信息！");
	    			vm.vListA=[];
				}
	    		vm.vListB = data.listB;
	    		if(vm.vListB.length === 0){
					//alert("未查询到警员当日工作信息！");
	    			vm.vListB=[];
				}
	    		vm.vListC = data.listC;
	    		if(vm.vListC.length === 0){
					//alert("未查询到警员当日工作信息！");
	    			vm.vListC=[];
				}
	    	}else{
				alert(rstl.msg);
			}
	    }
	})
}


//工作轨迹
var workHisM = function(){
	var policeNo = vm.mjxm;
	var workTime = vm.sd;
	var teamName = vm.groudId;
	var url= "../jw/gpsDevice/findWorkHisList?workTime="+workTime+"&policeNo="+vm.mjjh+"&groupId="+teamName;
	$.ajax({
		type: "GET",
	    url: url,
	    success: function(rstl){
	    	if(rstl.code === 200){
				var dataList = rstl.workList;
				vm.workList=[];
				if(dataList.length === 0){
					//alert("未查询到警员当日工作信息！");
					vm.workList.push({type:'无',gpsUpdateDt:'无'})
				}else{
					var sb= true;
					var sbzb= '';
					var xb= true;
					var xbzb= '';
					for(var i = 0;i<dataList.length;i++){
						var wi=vm.workList.length-1;
						var police = dataList[i];
						/*if(police.type == "sbdkd" && i != 0 ){
							continue;
						}else 如果上班打卡点不在第一条，那第一条就显示“首次开机点”，
								那“上班打卡点”就不要显示了；
								如果“上班打卡点”是第一条，那就只显示“上班打卡点”*/
						
						if(police.type == "sckjd"){
							if(dataList[0].type=='sbdkd'){
								continue;
							}
						}
						if(police.type == "zhgjd"){
							var di = dataList.length-1;
							if(dataList[di].type=='xbdkd'){
								continue;
							}
						}
						if(police.type == "sbdkd"){
							if(i != 0){
								continue;
							}
							
						}
						if(police.type == "xbdkd"){
							if(i != dataList.length-1){
								continue;
							}
						}
						
						if(police.longitude && police.latitude){
							var lnglat = new IMAP.LngLat(police.longitude, police.latitude);
							var types =workHisType(police.type);
							
							var marker = new IMAP.Marker(lnglat, markerOpts);
							//marker.data = police;
							map.getOverlayLayer().addOverlay(marker, false);
							//marker.setLabel("["+(i+1)+"] ", IMAP.Constants.BOTTOM_CENTER, new IMAP.Pixel(0,-25));
							marker.setTitle(police.gpsUpdateDt+"----"+types);
							tracemarkers.push(marker);
						}
						var word = workHisType(police.type);
						var wordss = workHisType(police.type);
						if(word.length >8){
							word=word.slice(0,8) + "...";
						}
						vm.workList.push({type:word,wordss:wordss,gpsUpdateDt:police.gpsUpdateDt,
							longitude:police.longitude, latitude:police.latitude});
					}
				}
			}else{
				alert(rstl.msg);
			}
		}
	});
}

var drawTrack = function(dataList){
	var inglatarr = [];
	for(var i = 0;i<dataList.length;i++){
		var police = dataList[i];
		var lot = police.longitude;
		var lat = police.latitude;
		var lnglat = new IMAP.LngLat(lot,lat);
		inglatarr.push(lnglat);
	}
	var opt = new IMAP.PolylineOptions();
	opt.strokeColor = "#4169E1";
	opt.strokeOpacity = "1";
	opt.strokeWeight = "3";
	opt.strokeStyle = IMAP.Constants.OVERLAY_LINE_DASHED;//虚线
	opt.strokeStyle = "1";
	opt.arrow = true;
	polyline = new IMAP.Polyline(inglatarr, opt);
	map.getOverlayLayer().addOverlay(polyline, false);
	map.setCenter(polyline.getBounds().getCenter(),14);
}

var workHisType = function(type){
	var word = "无";
	var imgPath = "";
	switch (type) {
		case '01':
			word = "隐患排查";
			imgPath = "../assets/images/qinwuwangge/yinhuan.png";
			break;
		case '2':
			word = "勤务考核";
			imgPath = "../assets/images/qinwuwangge/qinwuhe.png";
			break;
		case '3':
			word = "基础管理";
			imgPath = "../assets/images/qinwuwangge/manger.png";
			break;
		case '4':
			word = "突发事件";
			imgPath = "../assets/images/qinwuwangge/tu.png";
			break;
		case '5':
			word = "其他处理";
			imgPath = "../assets/images/qinwuwangge/others.png";
			break;
		case '6':
			word = "七进宣传";
			imgPath = "../assets/images/qinwuwangge/5xuan.png";
			break;
		case '7':
			word = "施工路段";
			imgPath = "../assets/images/qinwuwangge/sgzd.png";
			break;
		case '8':
			word = "拥堵治理";
			imgPath = "../assets/images/qinwuwangge/jtyd.png";
			break;
		case '9':
			word = "15次未检";
			imgPath = "../assets/images/qinwuwangge/15wei.png";
		case 'wl':
			word = "违法处理";
			imgPath = "../assets/images/qinwuwangge/wei.png";
			break;
		case 'jq':
			word = "警情处理";
			imgPath = "../assets/images/qinwuwangge/alarmTask.png";
			break;
		case 'pz':
			word = "违停拍照";
			imgPath = "../assets/images/qinwuwangge/bz_jl.png";
			break;
		case 'sbdkd':
			word = "上班打卡点";
			imgPath = "../assets/images/qinwuwangge/dakadian.png";
			break;
		case 'xbdkd':
			word = "下班打卡点";
			imgPath = "../assets/images/qinwuwangge/dakadian.png";
			break;
		case 'sckjd':
			word = "轨迹初始时间"; //2018年10月9日14:54:56
			imgPath = "../assets/images/location.png";
			break;
		case 'zhgjd':
			word = "轨迹终止时间";
			imgPath = "../assets/images/location.png";
			break;
		default:
			word =  "违法处理("+type+")";
			imgPath = "../assets/images/qinwuwangge/wei.png";
			break;
	}
	markerOpts.icon = new IMAP.Icon(imgPath, new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
	return word;
}

var map;
var marker;
var infowindow;
//初始化地图
var initMap = function(){

	//初始化地图
	var mapOpt = {
		minZoom : 9, // 地图最小缩放级别
		maxZoom : 20, // 地图最大缩放级别
		zoom : 14,// 设置地图初始化级别
		center : new IMAP.LngLat(121.128187, 31.464808),// 设置地图中心点坐标
		animation : true
	};
	if(itsEnv != 'prod'){
		mapOpt.zoom = 9;
	}else{
		mapOpt.zoom = 14;
	}
	if(itsEnv != 'prod'){
		//SIT 不添加 tileUrl
	}else{
		mapOpt.tileUrl = ["http://{s}/v3/tile?z={z}&x={x}&y={y}",[host+":25333", host+":25333"]];
	}
	map = new IMAP.Map("mapContainer", mapOpt); //地图实例化
	L.DomUtil.enableTextSelection();//解决地图不能选择的问题
	map.plugin(['IMAP.Tool']);//下载插件

    //################################图盟蓝色路网图层################################
	/*var trafficLayer = new IMAP.TileLayer({
    	minZoom: 9,
        maxZoom: 18,
        tileSize: 256
    });

	if(itsEnv != 'prod'){
	    trafficLayer.setTileUrlFunc(function(x, y, z) {
	    	return 'http://114.215.146.210:25033/v3/tile?z={z}&x={x}&y={y}'.replace("{x}", x).replace("{y}", y).replace("{z}", z);
	    });
	    map.addLayer(trafficLayer);
	}else{
	    trafficLayer.setTileUrlFunc(function(x, y, z) {
	        return 'http://'+ host +':25033/v3/tile?z={z}&x={x}&y={y}'.replace("{x}", x).replace("{y}", y).replace("{z}", z);
	    });
	    map.addLayer(trafficLayer);
	    //实时路况
		var trafficStatusLayer = new IMAP.TileLayer({
			maxZoom:18,
			minZoom:1,
			tileSize : 256
		});
		trafficStatusLayer.setTileUrlFunc(function(x,y,z){
			 //add time chuo _dc= new Date().getTime() ; 每次取到最新的
			 var url = "http://" + host +":8883/tile?lid=traffic&get=map&cache=off&x={x}&y={y}&z={z}&_dc="+new Date().getTime();
			 return url.replace("{x}",x).replace("{y}",y).replace("{z}",z);
		});
		map.addLayer(trafficStatusLayer);
	}*/

    //地图控件
	var scale = new IMAP.ScaleControl({
		anchor : IMAP.Constants.LEFT_BOTTOM
	});
	scale.visible(true);

	
	//创建右键菜单
	var contextMenu = new IMAP.ContextMenu(false);
	var menuItem = new IMAP.MenuItem("地图复位");
	menuItem.setCallback(function(lnglat) {
		var center = new IMAP.LngLat(121.128187,31.464808);
		map.setCenter(center,14);
    });
	contextMenu.addItem(menuItem);
	map.addContextMenu(contextMenu);
	
	var menuItem = new IMAP.MenuItem("勤务社区台账");
	menuItem.setCallback(function(lnglat) {
		//openSummaryWin(lnglat);
		window.opener.itsGlobal.OpenMenuQwSummary(lnglat);
	});
	contextMenu.addItem(menuItem);
	
	map.addEventListener(IMAP.Constants.CLICK, function(e) {
//		e.lnglat.lng = '121.1219501495';
//		e.lnglat.lat = '31.4594914434';
		if(e.lnglat.lng.length> 10){
			e.lnglat.lng = 	e.lnglat.lng.substring(0,10);
		}
		if(e.lnglat.lat.length> 9){
			e.lnglat.lat = 	e.lnglat.lat.substring(0,9);
		}
	});
	map.selfRemoveRightClickMaker = function(){
		if(marker){
			map.getOverlayLayer().removeOverlay(marker, false);
			marker = null;
		}
	}
    return map;
}


var loadGroups = function() {
    $.get("../aa/group/allData?ran="+getRandomNum()+"&zdFlag="+1, function(r){
		if(r.code == 200){
			vm.groupList = r.groupList;
		}else{
			alert(r.msg);
		}
	});
}

var loadUsers = function(){
	var gid=vm.groudId;
	 $.get("../aa/user/allData?ran="+getRandomNum()+"&groupId="+gid+"&type=MJ", function(r){
			if(r.code == 200){
				vm.userList = r.userList;
				/*$("#umjxm").hide();
				$("#pN").show();
				vm.mjxm="";*/
				//$("#pN").val(vm.picN);
				 $("#pN").val(vm.picN);
			}else{
				alert(r.msg);
			}
		});
	
}
//获得随机时间
var getRandomNum = function(){
	return (new Date()).getTime();
}

//字符串转面积点数组
var polygonStr2Path = function(polygonStr) {
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

/*var handleQw = function(flag,data){
	window.opener.handleQw(flag,data);
}*/
