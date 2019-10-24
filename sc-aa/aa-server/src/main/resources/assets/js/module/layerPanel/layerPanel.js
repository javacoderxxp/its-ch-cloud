define(function(require) {
	var layerPanelHtml = require('text!./layerPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('zTree');
	var ztree;
	var isCheckIn = function(e){
		var isShow = false;
		if(typeof e === 'boolean'){
			isShow = e;
		}else{
			isShow = e.target.checked;
		}
		return isShow;
	}
	
	var init = function(){
		$("#layerPanel").html(layerPanelHtml);
//		$('.silder-pannel').perfectScrollbar();//滚动条
		var layerPanelApp = vueEureka.get("layerPanelApp");
		
		rightClickPannel(layerPanelApp,Vue);
		ztreeRight();//右侧树方法
		rightSilder();//右侧滑块方法
	}

	var clearTreeNodes = function(){
		zTree.checkAllNodes(false);
	}
	

//右侧滑块效果
function rightSilder(){
	/**
	 * 滑过显示,滑出隐藏
	 */
	//two

	var boxs = document.getElementById('sideBarTab');
	var b3 = window.getComputedStyle? window.getComputedStyle(boxs).right : boxs.currentStyle.right;
	var hid=true;
	$('#sideBarTab').click(function(){
		if(hid){
			$("#sideBarContents").animate({
		        opacity: "hide"
		       }, "slow");
			document.getElementById('sideBarContents').style.right=0;
			$(this).css('background','url("./assets/images/slide-sou.png") no-repeat');
		}else{
			document.getElementById('sideBarContents').style.display = 'block';
			document.getElementById('sideBarContents').style.right=b3;
			$(this).css('background','url("./assets/images/slide-kai.png") no-repeat');
		}
		hid=!hid
	});


//	$("#sideBarTab").on('mouseenter', function() {
//		$('#sideBarContents').show();
//		$('#sideBarImg').hide();
//		$('#sideBarImg-a').show();
//	})
//
//	$('#box-cl-keleyi-com').on('mouseleave', function() {
//		$('#sideBarContents').hide();
//		$('#sideBarImg-a').hide();
//		$('#sideBarImg').show();
//	});
}
	//构造树右侧
	function ztreeRight(){
		var setting = {
				view: {
					showLine: false,
					showIcon: true,
					selectedMulti: false,
					dblClickExpand: false,

				},
				check: {
					enable: true,
					chkStyle: "checkbox",
					chkboxType: { "Y": "ps", "N": "ps" }
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {   
					beforeClick: beforeClick,
					
	                onClick: function (e, treeId, treeNode, clickFlag) {   
	                  zTree.checkNode(treeNode, !treeNode.checked, true,true);  
	                },
	                
	                onCheck: function(event, treeId, treeNode) {
					    var checked = treeNode.checked;
					    var checkedId = treeNode.id;
					    var app = vueEureka.get("layerPanelApp").vue;
					    if(app){
						    switch (checkedId){
						    	case 11:
						    		app.checkSignal(checked);
						    		break;
						    	case 13:
						    		app.checkEp(checked);
						    		break;
						    	case 14:
						    		app.checkVms(checked);
						    		break;
						    	case 15:
						    		app.checkHikFlow(checked);
						    		break;
						    	case 21:
						    		app.checkJWT(checked);
						    		break;
						    	case 2101:
						    		app.checkJWT(checked,'城厢中队');
						    		break;
						    	case 2102:
						    		app.checkJWT(checked,'港区交警中队');
						    		break;
						    	case 2103:
						    		app.checkJWT(checked,'璜泾中队');
						    		break;
						    	case 2104:
						    		app.checkJWT(checked,'经济开发区中队');
						    		break;
						    	case 2105:
						    		app.checkJWT(checked,'浏河中队');
						    		break;
						    	case 2106:
						    		app.checkJWT(checked,'南郊中队');
						    		break;
						    	case 2107:
						    		app.checkJWT(checked,'沙溪中队');
						    		break;
						    	case 2108:
						    		app.checkJWT(checked,'双凤中队');
						    		break;
						    	case 2109:
						    		app.checkJWT(checked,'大队机关');
						    		break;
						    	case 2110:
						    		app.checkJWT(checked,'所有部门');
						    		break;
						    	case 22:
						    		app.checkCar(checked);
						    		break;
						    	case 2201:
						    		app.checkCar(checked,'城厢中队');
						    		break;
						    	case 2202:
						    		app.checkCar(checked,'港区中队');
						    		break;
						    	case 2203:
						    		app.checkCar(checked,'璜泾中队');
						    		break;
						    	case 2204:
						    		app.checkCar(checked,'开发区中队');
						    		break;
						    	case 2205:
						    		app.checkCar(checked,'浏河中队');
						    		break;
						    	case 2206:
						    		app.checkCar(checked,'南郊中队');
						    		break;
						    	case 2207:
						    		app.checkCar(checked,'沙溪中队');
						    		break;
						    	case 2208:
						    		app.checkCar(checked,'双凤中队');
						    		break;
						    	case 2209:
						    		app.checkCar(checked,'大队机关');
						    		break;
						    	case 2210:
						    		app.checkCar(checked,'所有部门');
						    		break;
						    	case 23:
						    		app.checkRadio(checked);
						    		break;
						    	case 2301:
						    		app.checkRadio(checked,'城厢中队');
						    		break;
						    	case 2302:
						    		app.checkRadio(checked,'港区中队');
						    		break;
						    	case 2303:
						    		app.checkRadio(checked,'璜泾中队');
						    		break;
						    	case 2304:
						    		app.checkRadio(checked,'开发区中队');
						    		break;
						    	case 2305:
						    		app.checkRadio(checked,'浏河中队');
						    		break;
						    	case 2306:
						    		app.checkRadio(checked,'南郊中队');
						    		break;
						    	case 2307:
						    		app.checkRadio(checked,'沙溪中队');
						    		break;
						    	case 2308:
						    		app.checkRadio(checked,'双凤中队');
						    		break;
						    	case 2309:
						    		app.checkRadio(checked,'大队机关');
						    		break;
						    	case 2310:
						    		app.checkRadio(checked,'所有部门');
						    		break;
						    	case 24:
						    		app.checkTieji(checked);
						    		break;
					    		case 31:
						    		app.checkAlarmTask(checked);
						    		break;
						    	case 41:
						    		app.checkDutyGridLayer(checked);
						    		break;
						    	case 42:
						    		app.checkJTGJ(checked);
						    		break;
						    	case 43:
						    		app.checkCross(checked);
						    		break;
						    	case 44:
						    		app.checkRoad(checked);
						    		break;
						    	case 45:
						    		app.checkRoadLink(checked);
						    		break;
						    	case 46:
						    		app.checkLane(checked);
						    		break;
						    	case 47:
						    		app.checkParking(checked);
						    		break;
						    	case 48:
						    		app.checkSchool(checked);
						    		break;
						    	case 49:
						    		//app.checkTestLayer(checked);
						    		app.checkRfLayer(checked);
						    		break;
						    	case 51:
//						    		app.checkBx(checked);
						    		break;
						    	case 52:
						    		app.checkBz(checked, '');
						    		break;
						    	case 5201:
						    		app.checkBz(checked, '指示标志/指路标志');
						    		break;
						    	case 5202:
						    		app.checkBz(checked, '禁令标志');
						    		break;
						    	case 5203:
						    		app.checkBz(checked, '警告标志');
						    		break;
						    	case 5204:
						    		app.checkBz(checked, '辅助标志');
						    		break;
						    	case 5205:
						    		app.checkBz(checked, '旅游区标志');
						    		break;
						    	case 5206:
						    		app.checkBz(checked, '其他标志');
						    		break;
						    	case 53:
//						    		app.checkFhss(checked);
						    		app.checkXhd(checked);
						    		break;
						    	case 54:
						    		app.checkCrk(checked);
						    		break;
						    	case 55:
						    		app.checkGajg(checked);
						    		break;
						    	case 56:
						    		app.checkJyz(checked);
						    		break;
						    	case 57:
						    		app.checkLzdw(checked);
						    		break;
						    	case 58:
						    		app.checkQl(checked);
						    		break;
						    	case 59:
						    		app.checkSfz(checked);
						    		break;
						    	case 510:
						    		app.checkXfjg(checked);
						    		break;
						    	case 511:
						    		app.checkYljhjg(checked);
						    		break;
						    	case 61:
						    		app.checkCamera(checked,"1");
						    		break;
						    	case 62:
						    		app.checkCamera(checked,"2");
						    		break;
						    	case 63:
						    		app.checkCamera(checked,"3");
						    		break;
						    	case 64:
						    		app.checkCamera(checked,"4");
						    		break;
						    	case 65:
						    		app.checkCamera(checked,"5");
						    		break;
						    	case 66:
						    		app.checkCamera(checked,"6");
						    		break;
						    	case 67:
						    		app.checkCamera(checked,"7");
						    		break;
						    	case 68:
						    		app.checkCamera(checked,"8");
						    		break;	
						    	case 621:
						    		app.checkCamera(checked,"21");
						    		break;	
						    	case 622:
						    		app.checkCamera(checked,"22");
						    		break;	
						    	case 623:
						    		app.checkCamera(checked,"23");
						    		break;	
						    	case 624:
						    		app.checkCamera(checked,"24");
						    		break;	
						    	case 625:
						    		app.checkCamera(checked,"25");
						    		break;
						    	case 626:
						    		app.checkCamera(checked,"26");
						    		break;
						    	case 627:
						    		app.checkCamera(checked,"27");
						    		break;
						    	case 628:
						    		app.checkCamera(checked,"28");
						    		break;
						    	case 629:
						    		app.checkCamera(checked,"29");
						    		break;
						    	case 6210:
						    		app.checkCamera(checked,"210");
						    		break;
						    	case 6211:
						    		app.checkCamera(checked,"211");
						    		break;
						    	case 6212:
						    		app.checkCamera(checked,"212");
						    		break;
						    	case 6213:
						    		app.checkCamera(checked,"213");
						    		break;
						    	case 6214:
						    		app.checkCamera(checked,"214");
						    		break;
						    	case 6215:
						    		app.checkCamera(checked,"215");
						    		break;
						    	case 6216:
						    		app.checkCamera(checked,"216");
						    		break;
						    	case 610:
						    		app.checkCamera(checked,"10");
						    		break;
						    	case 15:
						    		app.checkDaHuaEp(checked);
						    		break;
						    	default:
						    		break;
						    }	
					    }
					}
	            },  
			};  

			var zNodes =[
				{ id:1, pId:0, name:"通信设备", nocheck:true, open:true},
				{ id:11, pId:1, name:"信号机"},
				{ id:13, pId:1, name:"卡口电警"},
				{ id:14, pId:1, name:"诱导屏"},
				{ id:15, pId:1, name:"海康流量卡口"},
//				{ id:15, pId:1, name:"大华高清卡口"},
				{ id:6, pId:0, name:"监控设备", nocheck:true, open:true},
				{ id:61, pId:6, name:"交警大队"},
				{ id:610, pId:6, name:"高点监控"},
				{ id:62, pId:6, name:"派出所", nocheck:true},
				{ id:621, pId:62, name:"板桥"},
				{ id:622, pId:62, name:"城西"},
				{ id:623, pId:62, name:"城中"},
				{ id:624, pId:62, name:"港区"},
				{ id:625, pId:62, name:"公交"},
				{ id:626, pId:62, name:"璜泾"},
				{ id:627, pId:62, name:"金仓湖"},
				{ id:628, pId:62, name:"金浪"},
				{ id:629, pId:62, name:"开发区"},
				{ id:6210, pId:62, name:"科教新城"},
				{ id:6211, pId:62, name:"浏河"},
				{ id:6212, pId:62, name:"浏家港"},
				{ id:6213, pId:62, name:"陆渡"},
				{ id:6214, pId:62, name:"沙溪"},
				{ id:6215, pId:62, name:"双凤"},
				{ id:6216, pId:62, name:"岳王"},
				{ id:63, pId:6, name:"治安监控"},
				{ id:64, pId:6, name:"学校"},
				{ id:65, pId:6, name:"城管局"},
				{ id:66, pId:6, name:"社会监控"},
				{ id:67, pId:6, name:"科信大队"},
				{ id:68, pId:6, name:"其他监控"},
				{ id:2, pId:0, name:"警力监控", nocheck:true, open:true},
				{ id:21, pId:2, name:"警务通", nocheck:true, open:false},
				{ id:2101, pId:21, name:"城厢中队"},
				{ id:2102, pId:21, name:"港区中队"},
				{ id:2103, pId:21, name:"璜泾中队"},
				{ id:2104, pId:21, name:"开发区中队"},
				{ id:2105, pId:21, name:"浏河中队"},
				{ id:2106, pId:21, name:"南郊中队"},
				{ id:2107, pId:21, name:"沙溪中队"},
				{ id:2108, pId:21, name:"双凤中队"},
				{ id:2109, pId:21, name:"大队机关"},
				{ id:2110, pId:21, name:"所有部门"},
				{ id:22, pId:2, name:"警车", nocheck:true, open:false},
				{ id:2201, pId:22, name:"城厢中队"},
				{ id:2202, pId:22, name:"港区中队"},
				{ id:2203, pId:22, name:"璜泾中队"},
				{ id:2204, pId:22, name:"开发区中队"},
				{ id:2205, pId:22, name:"浏河中队"},
				{ id:2206, pId:22, name:"南郊中队"},
				{ id:2207, pId:22, name:"沙溪中队"},
				{ id:2208, pId:22, name:"双凤中队"},
				{ id:2209, pId:22, name:"大队机关"},
				{ id:2210, pId:22, name:"所有部门"},
				{ id:23, pId:2, name:"350M电台", nocheck:true, open:false},
				{ id:2301, pId:23, name:"城厢中队"},
				{ id:2302, pId:23, name:"港区中队"},
				{ id:2303, pId:23, name:"璜泾中队"},
				{ id:2304, pId:23, name:"开发区中队"},
				{ id:2305, pId:23, name:"浏河中队"},
				{ id:2306, pId:23, name:"南郊中队"},
				{ id:2307, pId:23, name:"沙溪中队"},
				{ id:2308, pId:23, name:"双凤中队"},
				{ id:2309, pId:23, name:"大队机关"},
				{ id:2310, pId:23, name:"所有部门"},
				{ id:24, pId:2, name:"铁骑视频"},
				{ id:3, pId:0, name:"警情信息", nocheck:true, open:false},
				{ id:31, pId:3, name:"警情分布"},
				{ id:4, pId:0, name:"基础数据", nocheck:true, open:false},
				{ id:41, pId:4, name:"责任区", chkDisabled:false},
				{ id:42, pId:4, name:"中队辖区", chkDisabled:false},
				{ id:43, pId:4, name:"路口"},
				{ id:44, pId:4, name:"道路"},
				{ id:45, pId:4, name:"路段"},
//				{ id:46, pId:4, name:"车道", chkDisabled:false},
				{ id:47, pId:4, name:"停车场", chkDisabled:false},
				{ id:49, pId:4, name:"道路设施"},
				/*{ id:49, pId:4, name:"测试层"},*/
				{ id:5, pId:0, name:"交通专题", nocheck:true, open:false},
//				{ id:51, pId:5, name:"交通标线", chkDisabled:true},
				/*{ id:52, pId:5, name:"交通标志", nocheck:true, open:false},
				{ id:5201, pId:52, name:"指示/指路标志"},
				{ id:5202, pId:52, name:"禁令标志"},
				{ id:5203, pId:52, name:"警告标志"},
				{ id:5204, pId:52, name:"辅助标志"},
				{ id:5205, pId:52, name:"旅游区标志"},
				{ id:5206, pId:52, name:"其他标志"},
				{ id:52, pId:5, name:"交通标志"},
				*/
				/*{ id:53, pId:5, name:"防护设施"},*/
				{ id:53, pId:5, name:"信号灯"},
				{ id:54, pId:5, name:"重点出入口"},
				{ id:55, pId:5, name:"公安机关"},
				{ id:56, pId:5, name:"加油站",},
				{ id:57, pId:5, name:"路政单位",},
				{ id:58, pId:5, name:"桥梁"},
				{ id:59, pId:5, name:"收费站",},
				{ id:48, pId:5, name:"学校", chkDisabled:false},
				{ id:510, pId:5, name:"消防机关",},
				{ id:511, pId:5, name:"医疗机构"},
			];
			zTree = $.fn.zTree.init($("#treeDemo"), setting, zNodes);
	}

	function beforeClick(treeId, treeNode) {
		var zTree1 = $.fn.zTree.getZTreeObj("treeDemo");
		zTree1.expandNode(treeNode);
		return true;
	}
	//
	//右侧node事件
	function rightClickPannel(layerPanelApp,Vue){
		if(!layerPanelApp){
			layerPanelApp = new Vue({
				el: '#layer-panel',
				data: {
					signalChecked:false,
					vmsChecked:false,
					hikFlowChecked:false,
					hazChemVehChecked:false,
					epChecked:false,
					cameraChecked:false, 
					jwtChecked:false,
					carChecked:false,
					radioChecked:false,
					tiejiChecked:false,
					crossChecked:false,
					roadChecked:false,
					roadLinkChecked:false,
					laneChecked:false,
					parkingChecked:false,
					jtgjChecked:false,
					dutyGridChecked:false,
					testChecked:false,
					schoolChecked:false,
					alarmTaskChecked:false,
					bzChecked:false,
					bxChecked:false,
					fhssChecked:false,
					crkChecked:false,
					gajgChecked:false,
					jyzChecked:false,
					lzdwChecked:false,
					qlChecked:false,
					sfzChecked:false,
					xfjgChecked:false,
					yljhjgChecked:false
				},
				methods: {
					checkSignal: function(e) {
						this.signalChecked = e;
						require(['layers/signal/signal'],function(signal){
							signal.showLayer(e);
						});
					},
					checkVms:function(e){
						this.vmsChecked = e;
						require(['layers/vms'],function(vms){
							vms.showLayer(e);
						});
					},
					checkHikFlow:function(e){
						this.hikFlowChecked = e;
						require(['layers/hikFlowCam/hikFlowCam'],function(hikFlowCam){
							hikFlowCam.showLayer(e);
						});
					},
					checkCamera:function(e,tp){
						this.cameraChecked = e;
						require(['layers/camera/camera'],function(camera){
							camera.showLayer(e,null,tp);
						});
					},
					checkEp:function(e){
						this.epChecked = e;
						require(['layers/ep/ep'],function(ep){
							ep.showLayer(e);
						});
					},
					checkJWT:function(e, groupName){
						this.jwtChecked = e;
						require(['layers/policeControl/policeJwt'],function(jwt){
							jwt.showLayer(e, null, groupName);
						});
					},
					checkCar:function(e, groupName){
						this.carChecked = e;
						require(['layers/policeControl/policeCar'],function(car){
							car.showLayer(e, null, groupName);
						});
					},
					checkRadio:function(e, groupName){
						this.radioChecked = e;
						require(['layers/policeControl/policeRadio'],function(radio){
							radio.showLayer(e, null, groupName);
						});
					},
					checkTieji:function(e){
						this.tiejiChecked = e;
						require(['layers/tieji/tiejiListPanel'],function(tiejiListPanel){
							tiejiListPanel.loadPanel(e);
						});
					},
					checkCross:function(e){
						this.crossChecked = e;
						require(['layers/cross/crossLayer'],function(crossLayer){
							crossLayer.showLayer(e);
						});
					},
					checkRoad:function(e){
						this.roadChecked = e;
						require(['layers/road/roadLayer'],function(roadLayer){
							roadLayer.showLayer(e);
						});
					},
					checkRoadLink:function(e){
						this.roadLinkChecked = e;
						require(['layers/roadLink/roadLinkLayer'],function(roadLinkLayer){
							roadLinkLayer.showLayer(e);
						});
					},
					checkLane:function(e){
						this.laneChecked = e;
						require(['layers/lane/lane'],function(lane){
							lane.showLayer(e);
						});
					},
					checkParking:function(e){
						this.parkingChecked = e;
						require(['layers/parkingLot/parkingLot'],function(parkingLot){
							parkingLot.showLayer(e);
						});
					},
					checkJTGJ:function(e){
						this.jtgjChecked = e;
						require(['layers/jtgj/jtgj'],function(jtgj){
							jtgj.showLayer(e);
						});
					},
					checkDutyGridLayer:function(e){
						this.dutyGridChecked = e;
						require(['layers/dutyGridLayer/dutyGridLayer'],function(dutyGridLayer){
							dutyGridLayer.showLayer(e);
						});
					},
					checkRfLayer:function(e){
						this.testChecked = e;
						require(['layers/roadFacilities/roadFacilities'],function(roadFacilities){
							roadFacilities.showLayer(e);
						});
					},
					checkTestLayer:function(e){
						this.testChecked = e;
						require(['layers/testLayer'],function(testChecked){
							testChecked.showLayer(e);
						});
					},
					checkSchool:function(e){
						this.schoolChecked = e;
						require(['layers/school/school'],function(schoolLayer){
							schoolLayer.showLayer(e);
						});
					},
					checkAlarmTask:function(e){
						this.alarmTaskChecked = e;
						// 加载当天警情信息
						require(['layers/alarmTask/alarmTask'],function(alarmTaskLayer){
							alarmTaskLayer.showLayer(e);
						});
					},
					checkBx:function(e){
						this.bxChecked = e;
						require(['layers/bxPanel/bx'],function(bx){
							bx.showLayer(e);
						});
					},
					checkXhd:function(e){
						this.bxChecked = e;
						require(['layers/xhd/xhd'],function(xhd){
							xhd.showLayer(e);
						});
					},
					checkBz:function(e, type){
						this.bzChecked = e;
						require(['layers/bzPanel/bz'],function(bz){
							bz.showLayer(e, type);
						});
					},
					checkFhss:function(e){
						this.crkChecked = e;
						require(['layers/fhss/fhss'],function(fhss){
							fhss.showLayer(e);
						});
					},
					checkCrk:function(e){
						this.crkChecked = e;
						require(['layers/crk/crk'],function(crk){
							crk.showLayer(e);
						});
					},
					checkGajg:function(e){
						this.gajgChecked = e;
						require(['layers/gajg/gajg'],function(gajg){
							gajg.showLayer(e);
						});
					},
					checkJyz:function(e){
						this.jyzChecked = e;
						require(['layers/jyz/jyz'],function(jyz){
							jyz.showLayer(e);
						});
					},
					checkLzdw:function(e){
						this.lzdwChecked = e;
						require(['layers/lzdw/lzdw'],function(lzdw){
							lzdw.showLayer(e);
						});
					},
					checkQl:function(e){
						this.qlChecked = e;
						require(['layers/ql/ql'],function(ql){
							ql.showLayer(e);
						});
					},
					checkSfz:function(e){
						this.sfzChecked = e;
						require(['layers/sfz/sfz'],function(sfz){
							sfz.showLayer(e);
						});
					},
					checkXfjg:function(e){
						this.xfjgChecked = e;
						require(['layers/xfjg/xfjg'],function(xfjg){
							xfjg.showLayer(e);
						});
					},
					checkYljhjg:function(e){
						this.yljhjgChecked = e;
						require(['layers/yljhjg/yljhjg'],function(yljhjg){
							yljhjg.showLayer(e);
						});
					},
					checkDaHuaEp:function(e){
						this.yljhjgChecked = e;
						require(['layers/dahuaEp/dahuaEp'],function(dahuaEp){
							dahuaEp.showLayer(e);
						});
					}
				}
			});
			vueEureka.set("layerPanelApp",{vue:layerPanelApp,description:"layerPanelApp的vue实例"});
		}
	}
	
	return {
		init:init,
		clearTreeNodes:clearTreeNodes
	};
})