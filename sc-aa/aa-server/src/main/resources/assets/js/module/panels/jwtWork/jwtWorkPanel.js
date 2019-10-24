define(function(require) {
	var htmlStr = require('text!./jwtWorkPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var oldQ =1;
	var polyline;
	require('my97Datepicker');
	var tracemarkers = [];
	var pathq;
	var mmm;
	var sgjyPolyline;
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.CENTER;
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#jwtWork-panel',
			data: {
				showList: true, //显示查询
				jwtWorkQ: {deptName: (currentUser.jjzdUser? currentUser.group.groupName :'')}, //查询参数
				jwtWork: {},
				teamList:[],
				dutyGridList:[],
				groupListQ:[],
				page:'',
				mjjh:'',
				mjxm:'',
				jj:{},
				sd:'',
				plPtah:"",
				qwTimes:'',
				workList:[]
			},
			methods: {
				query: function () {
					vm.reload();
				},
				repairdetail: function (longitude,latitude){
					if(longitude && latitude){
						var lnglat = new IMAP.LngLat(longitude,latitude);
						map.setCenter(lnglat);
					}else{
						alert("无点位信息");
					}
				},
				edit: function () {
					var policeNo = TUtils.getSelectedRow();
					if(policeNo == null){
						return ;
					}
					vm.mjjh=policeNo;
					vm.mjxm=vm.jj.policeName;
					vm.showList = false;
					vm.showTrackSearchJwt();
				},
				reload: function () {
					vm.showList = true;
					vm.cleanPlony();
					$("#bf").hide();
					$("#guiji").hide();
					vm.sd='';
					if(TUtils.cmp(vm.jwtWorkQ,oldQ)){
						var postDataTmp = vm.jwtWorkQ;
						oldQ = JSON.parse(JSON.stringify(vm.jwtWorkQ));
						var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
						$.each(postData, function (k, v) {  
							delete postData[k];
						});
						//var page = $("#jqGrid").jqGrid('getGridParam','page');
						var page = $('#jqGrid').getGridParam('page');
						if(!page){
							page = 1;
						}
						$("#jqGrid").jqGrid('setGridParam',{ 
							postData: postDataTmp,
							page:page
						}).trigger("reloadGrid");
					}else{
						loadJqGrid();
					}
				},
				showTrackSearchJwt: function(){
					vm.cleanPlony();
					var policeNo = vm.jj.policeNo;
					var workTime = $("#workTime").val();
					var startDt = workTime+" 00:00:00";
					var endDt = workTime+" 23:59:59";
					var url= "jw/gpsDevice/trackSearch?startDt="+startDt
					+"&endDt="+endDt+"&policeNo="+policeNo+"&lines="+vm.plPtah;
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
				cleanPlony:function (){
					toggleStopMove();
					if(markerPc){
						map.getOverlayLayer().removeOverlay(markerPc);
					}
					markerPc="";
					if(polyline){
						map.getOverlayLayer().removeOverlay(polyline);
					}
					for (var i = 0; i < tracemarkers.length; i++) {
						map.getOverlayLayer().removeOverlay(tracemarkers[i]);
					}
					tracemarkers=[];
					vm.workList=[];
				},
				close: function() {
					vm.cleanPlony();
					if(sgjyPolyline){
						map.getOverlayLayer().removeOverlay(sgjyPolyline);
					}
					itsGlobal.hideLeftPanel();
				},
				drawGrid:function(shape){
					this.clearGrid();
					if(shape && shape!=''){
						var polygonPath = TUtils.polygonStr2Path(shape);
						dutyGridPolygon = new IMAP.Polygon(polygonPath, TConfig.V.dutyGridPolygonOpt);
			        	map.getOverlayLayer().addOverlay(dutyGridPolygon, false);
					}
				},
				getQwPath: function(roadId){
					if(sgjyPolyline){
						map.getOverlayLayer().removeOverlay(sgjyPolyline);
					}
					$.ajax({
					    url: "./jtzx/roaddraw/detail/"+roadId,
					    success: function(rslt){
							if(rslt.code == 200){
								var oneData = rslt.roaddraw;
								vm.plPtah= oneData.region;
								var polygonPath = TUtils.polygonStr2Path(oneData.region);
					        	var plo = new IMAP.PolylineOptions();
					        	plo.strokeColor = "red";
					        	plo.strokeOpacity = "1";
					        	plo.strokeWeight = "6";
					        	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
					        	sgjyPolyline = new IMAP.Polyline(polygonPath, plo);
					        	map.getOverlayLayer().addOverlay(sgjyPolyline, false);
					    		map.setCenter(sgjyPolyline.getBounds().getCenter(),14);
							}else{
								alert(rslt.msg);
							}
						}
					});
					
				},
				togglePauseMove:function (){//暂停
					if(markerPc){
			    		markerPc.pauseMove();
			    		$("#zt").show();
			    		$("#bf").hide();
					}
				},
				variableSpeed:function (){
					if(markerPc){
			    		markerPc.pauseMove();
			    		togglePlayback('',pathq,mmm);
			    		$("#bf").show();
			    		$("#zt").hide();
					}
				},
				jixuMove:function (){//继续
					if(markerPc){
						togglePlayback('',pathq,mmm);
					}
					$("#zt").hide();
		    		$("#bf").show();
				},
				clearGrid:function(){
					if(dutyGridPolygon){
						map.getOverlayLayer().removeOverlay(dutyGridPolygon);
					}
					dutyGridPolygon = null;
				}
			}
		});
		
		$("#workTime").val(TUtils.formatDate(new Date()));//"2018-04-18");//
		oldQ=1;
		loadGroups();
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "jwtWorkPanel的vue实例"
		});
		
	}
	
	
	var workHisM = function(){
		var policeNo =  vm.jj.policeNo;
		var workTime = $("#workTime").val();
		var teamName = vm.jj.teamName;
		var url= "jw/gpsDevice/findWorkHisList?workTime="+workTime+"&policeNo="+policeNo+"&groupId="+teamName;
		$.ajax({
			type: "GET",
		    url: url,
		    success: function(rstl){
		    	if(rstl.code === 200){
					var dataList = rstl.workList;
					if(dataList.length === 0){
						alert("未查询到警员当日工作信息！");
						vm.workList.push({type:'无',gpsUpdateDt:'无'})
					}else{
						var sb= true;
						var sbzb= '';
						var xb= true;
						var xbzb= '';
						for(var i = 0;i<dataList.length;i++){
							var wi=vm.workList.length-1;
							var police = dataList[i];
							
							if(vm.qwTimes){
								var d = police.gpsUpdateDt.split(" ");
								var str =d[1].split(":")[0];
								var falg = false;
								var qwTimes = vm.qwTimes.replace(/时/g, "");
								var qw = qwTimes.split(",");
								for(var h = 0; h < qw.length; h++) {
									if(parseInt(qw[h].split("-")[0]) <= parseInt(str) && parseInt(str) < parseInt(qw[h].split("-")[1])) {
										falg = true;
									}
								}
								if(!falg) {
									continue; 
								}
							}
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
							if(word.length >15){
								word=word.slice(0,15) + "...";
							}
							vm.workList.push({type:word,wordss:wordss,gpsUpdateDt:police.gpsUpdateDt,
								longitude:police.longitude, latitude:police.latitude});
						}
						if(vm.workList.length === 0){
							vm.workList.push({type:'无',gpsUpdateDt:'无'})
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
		var ll=null;
		var mp = new Map();
		for(var i = 0;i<dataList.length;i++){
			var police = dataList[i];
			if(vm.qwTimes){
				var falg = false;
				var d = police.gpsUpdateDt.split(" ");
				var str =d[1].split(":")[0];
				
				var qwTimes = vm.qwTimes.replace(/时/g, "");
				var qw = qwTimes.split(",");
				for(var  h= 0; h < qw.length; h++) {
					if(parseInt(qw[h].split("-")[0]) <= parseInt(str) && parseInt(str) < parseInt(qw[h].split("-")[1])) {
						falg = true;
					}
				}
				
				if(!falg) {
					continue; 
				}
			}
			var lot;
			if(police.longitude.substring(8,9) == 0){
				 lot = police.longitude.substring(0,8);
			}else{
				 lot = police.longitude.substring(0,9);
            }
			
			var lat;
			if(police.latitude.substring(7,8) == 0){
				lat = police.latitude.substring(0,7);
			}else{
				lat = police.latitude.substring(0,8);
            }
			var lnglat = new IMAP.LngLat(lot,lat);
			if(i==0){
				ll=lnglat;
			}
			inglatarr.push(lnglat);
			mp.set(lot+','+lat,police.gpsUpdateDt);
		}
		if(inglatarr.length == 0){
			return;
		}
		var opt = new IMAP.PolylineOptions();
		opt.strokeColor = "#33cc99";
		opt.strokeOpacity = "1";
		opt.strokeWeight = "3";
		opt.strokeStyle = IMAP.Constants.OVERLAY_LINE_DASHED;//虚线
		opt.strokeStyle = "1";
		opt.arrow = true;
		polyline = new IMAP.Polyline(inglatarr, opt);
		map.getOverlayLayer().addOverlay(polyline, false);
		map.setCenter(polyline.getBounds().getCenter(),14);
		pathq=inglatarr;
		mmm=mp;	
		togglePlayback(ll,inglatarr,mp);
	}
	
	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				//if(currentUser.jjddUser){
					vm.teamList =r.groupList;
					vm.groupListQ = JSON.parse(JSON.stringify(r.groupList));
					//vm.groupListQ.unshift({groupName:'所有'});
				/*}else if(currentUser.jjzdUser){
					vm.groupListQ.push(currentUser.group);
					vm.groupList.push(currentUser.group);
				}*/
				/*require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
				});*/
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadJqGrid = function() {
		oldQ = JSON.parse(JSON.stringify(vm.jwtWorkQ));
		$("#jqGrid").jqGrid('GridUnload');
		$("#jqGrid").jqGrid({
			url: "jw/gpsDevice/findJWTInfoPage",
			datatype: "json",
			postData: vm.jwtWorkQ,
			/*page:vm.page,*/
			colModel: [
				{ label: 'id', name: 'policeNo', width: 5, key: true, hidden:true },
				{ label: '警员编号', name: 'policeNo', width: 80,  sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '警员姓名', name: 'policeName', width: 80,  sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属中队', name: 'teamName', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '状态', name: 'status', width: 60, sortable:false, formatter: function(value, options, row){
					return type2word(value);}},
				{ label: '更新时间', name: 'gpsUpdateDt', width: 140, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			],
			viewrecords: true,
			height: 290,
			rowNum: 15,
			rowList : [15,30,50],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth:false,
			multiselect: false,
			pager: "#jqGridPager",
			jsonReader : {
				root: "page.list",
				page: "page.pageNum",
				total: "page.pages",
				records: "page.total"
			},
			prmNames : {
				page:"page", 
				rows:"limit", 
				sort: "orderBy",
				order: "orderFlag"
			},
			loadComplete: function(data) {//数据查询完毕
				var queryList = data.page.list;
			},
			gridComplete:function(){
				//隐藏grid底部滚动条
				$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
			ondblClickRow: function(rowid){
				vm.edit();
			},
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				vm.jj=rowData;
			}
		});
	};
	
	var type2word = function(type){
		var word = "";
		if(type == 0){
			word ="在线";
		}
		if(type == 1){
			word ="离线";
		}
		return word;
	}
	
	var Sdword = function(type){
		var word = 50;
		switch (type) {
		case '-1':
			word = 35;
			break;
		case '-2':
			word = 20;
			break;
		case '-3':
			word = 5;
			break;
		case '1':
			word = 75;
			break;
		case '2':
			word = 100;
			break;
		case '3':
			word = 150;
			break;
		default:
			break;
		}
		return word;
	}
	
	var markerPc="";
	var line=null;
	var togglePlayback = function(lnglat,path,mp) {
    	if(map){
    		if(!markerPc){
    			var opts=new IMAP.MarkerOptions();
				opts.anchor =  IMAP["Constants"]["BOTTOM_CENTER"];
				opts.icon = new IMAP.Icon("./assets/images/police.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));

				if(lnglat){
					markerPc=new IMAP.Marker(lnglat, opts);
					map.getOverlayLayer().addOverlay(markerPc, true);
					markerPc.setAngleOffsetX(52/2);
					markerPc.setAnchor(IMAP.Constants.CENTER);
					markerPc.setOffset(new IMAP.Pixel(0, 0));
					markerPc.addEventListener(IMAP.Constants.MOVING,function(e){
	                    var location = e.lnglat;
	                    //console.log(location.lng+','+location.lat);
	                    var sj = mp.get(location.lng+','+location.lat);
	                    if(sj != "" && sj != undefined && sj != null){
	                    	//console.log(sj);
	                    	markerPc.setLabel( sj,{
	                    		offset: new IMAP.Pixel(0,-35),
	                    		anchor: IMAP.Constants.TOP_CENTER });
	                    }
	                });
				}
			}
			map.setBestMap(path);
			/*if(line){
				line.setPath(path);
			}else{
				line=new IMAP.Polyline(path,{strokeColor:"#ff0000"});
				map.getOverlayLayer().addOverlay(line);
			}*/
			var s = Sdword($("#sd").val());
			markerPc.moveAlong(path,s,true,false);
			$("#bf").show();
			$("#guiji").show();
		}
    }
	
	 //暂停运动
    function togglePauseMove(){
    	if(markerPc){
    		markerPc.pauseMove();
		}
    }
    //停止运动
    function toggleStopMove() {
    	if(markerPc){
    		markerPc.stopMove();
		}
    }
	
	
	var workHisType = function(type){
		var word = "无";
		var imgPath = "";
		switch (type) {
			case '01':
				word = "隐患排查";
				imgPath = "./assets/images/qinwuwangge/yinhuan.png";
				break;
			case '2':
				word = "勤务考核";
				imgPath = "./assets/images/qinwuwangge/qinwuhe.png";
				break;
			case '3':
				word = "基础管理";
				imgPath = "./assets/images/qinwuwangge/manger.png";
				break;
			case '4':
				word = "突发事件";
				imgPath = "./assets/images/qinwuwangge/tu.png";
				break;
			case '5':
				word = "其他处理";
				imgPath = "./assets/images/qinwuwangge/others.png";
				break;
			case '6':
				word = "七进宣传";
				imgPath = "./assets/images/qinwuwangge/5xuan.png";
				break;
			case '7':
				word = "施工路段";
				imgPath = "./assets/images/qinwuwangge/sgzd.png";
				break;
			case '8':
				word = "拥堵治理";
				imgPath = "./assets/images/qinwuwangge/jtyd.png";
				break;
			case '9':
				word = "15次未检";
				imgPath = "./assets/images/qinwuwangge/15wei.png";
			case 'wl':
				word = "违法处理";
				imgPath = "./assets/images/qinwuwangge/wei.png";
				break;
			case 'jq':
				word = "警情处理";
				imgPath = "./assets/images/qinwuwangge/alarmTask.png";
				break;
			case 'pz':
				word = "违停拍照";
				imgPath = "./assets/images/qinwuwangge/bz_jl.png";
				break;
			case 'sbdkd':
				word = "上班打卡点";
				imgPath = "./assets/images/qinwuwangge/dakadian.png";
				break;
			case 'xbdkd':
				word = "下班打卡点";
				imgPath = "./assets/images/qinwuwangge/dakadian.png";
				break;
			case 'sckjd':
				word = "轨迹初始时间"; //2018年10月9日14:54:56
				imgPath = "./assets/images/location.png";
				break;
			case 'zhgjd':
				word = "轨迹终止时间";
				imgPath = "./assets/images/location.png";
				break;
			default:
				word =  "违法处理("+type+")";
				imgPath = "./assets/images/qinwuwangge/wei.png";
				break;
		}
		markerOpts.icon = new IMAP.Icon(imgPath, new IMAP.Size(24, 24), new IMAP.Pixel(0, 0));
		return word;
	}
	
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}
	
	//用于给外部设置参数
	var setParams = function(args) {
		if(args && args.length ==6){
			var deptId = args[1];
			var policeName = args[2];
			var date = args[3];
			var roadId = args[4];
			vm.qwTimes = args[5];
			//设定传入的参数
			if(deptId){
				for(xx in vm.groupListQ){
					if(vm.groupListQ[xx].groupId == deptId){
						vm.jwtWorkQ.deptName = vm.groupListQ[xx].groupName;
						break;
					}
				}
			}
			if(roadId){
				vm.getQwPath(roadId);
			}
			if(policeName){
				vm.jwtWorkQ.policeName = policeName;
			}
			if(date){
				 $("#workTime").val(date);
			}
			vm.query();
		}
	}


	return {
		show: show,
		hide: hide,
		setParams: setParams
	};
})