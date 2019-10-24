define(function(require) {
	var htmlStr = require('text!./historyJam.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	var infowindow = null;
	var vectors = [];
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.anchor = IMAP.Constants.BOTTOM_CENTER;
	markerOpts.icon = new IMAP.Icon("./assets/images/jtyd.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var markers=[];
	var chartTmp;
	gblMapObjs.closeInfoWindow = function(){
    	map.getOverlayLayer().removeOverlay(infowindow);
    	map.getOverlayLayer().clear(vectors);
		vectors=[];
    }
	
	var show = function() {

		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#historyJam-panel',
			data: {
				showList:false,
				dataList:[],
				roaddrawQ:{startDt: TUtils.formatDateTime000(TUtils.setDate(TUtils.addDate(new Date(),-30))), endDt: TUtils.formatDate(new Date())+" 23:59:59", vLdlx: ''},
				nameArray:[],
				valueArray:[],
				richiValueArray:[],
				chartVOList:[],
				chartTitle:'',
				newGridPolygon:null,
				linkJamDetailList:null,
				charOpt:{},
				chartTmp:null,
			},
			methods: {
				query: function() {
					chartTmp = echarts.init(document.getElementById('historyJamChart'), 'walden');
					var url = "jtzx/linkJam/getLatest7DayJam?startDt="+vm.roaddrawQ.startDt+"&endDt="+vm.roaddrawQ.endDt+"&vLdlx="+vm.roaddrawQ.vLdlx;
					layer.load();
					$.ajax({
						url: url,
						type: 'GET',
						success: function(rslt){
							layer.closeAll('loading');
							if(rslt.code == 200){
								vm.chartVOList = rslt.chartVOList;
								vm.showList = true;
								vm.applyDataToUI();
							}else{
								alert(rslt.msg);
							}
						},
						error: function(r1, r2, r3){
							layer.closeAll('loading');
							alert('查询出错！');
						}
					});
				},
				showOnetrafficControl: function (region) {
		    		var polygonPath = TUtils.polygonStr2Path(region);
		        	var plo = new IMAP.PolylineOptions();
		        	plo.strokeColor = "#ff0000";
		        	plo.strokeOpacity = "1";
		        	plo.strokeWeight = "6";
		        	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
		        	vm.newGridPolygon = new IMAP.Polyline(polygonPath, plo);
		        	map.getOverlayLayer().addOverlay(vm.newGridPolygon, false);
		        	var center = vm.newGridPolygon.getBounds().getCenter();
		        	map.setCenter(center,14);
				},
				/*showRoadJamToMap : function(list) {
					if(null != list && list.length > 0){
						for(var i = 0; i<list.length;i++){
							var pos = list[i].xy.split(",");
							var polygonPath = TUtils.polygonStr2PathBySem(list[i].xys);
				        	var plo = new IMAP.PolylineOptions();
				        	plo.strokeColor = "#ff0000";
				        	plo.strokeOpacity = "1";
				        	plo.strokeWeight = "6";
				        	plo.strokeStyle = IMAP.Constants.OVERLAY_LINE_SOLID;
				        	var aa = new IMAP.Polyline(polygonPath, plo);
				        	map.getOverlayLayer().addOverlay(aa, false);
						}
					}
				},*/
				//数据应用到视图
				applyDataToUI : function() {
					vm.nameArray = [];
					vm.valueArray = [];
					vm.richiValueArray = [];
				    for(x in vm.chartVOList){
				    	if(x >= 10){
				    		break;
				    	}
				    	vm.nameArray.push(vm.chartVOList[x].name);
				    	vm.valueArray.push(vm.chartVOList[x].value);
				    	vm.richiValueArray.push({value: vm.chartVOList[x].value, name: vm.chartVOList[x].name, linkJams: vm.chartVOList[x].linkJams, roaddraw : vm.chartVOList[x].roaddraw});
				    }
				    vm.chartTitle ='拥堵路段统计';
	    			vm.getBarOpt();
	    			
				    if(vm.chartVOList) {
		    			chartTmp.setOption(vm.chartOpt);
					}
				},

				compare : function (string1, string2) {
				    if(string1.pubTime >= string2.pubTime){
				    	return -1;
				    }
				    return 1;
				} ,
				showDetails  : function(array) {
					vm.clear();
					for (var i = 0; i < markers.length; i++) {
						map.getOverlayLayer().removeOverlay(markers[i]);
					}
					this.linkJamDetailList = [];
					if(array && array.linkJams){
						
						array.linkJams.sort(vm.compare);
						this.linkJamDetailList = array.linkJams;
						
						var html = $("#linkJamDetail");
						layer.open({
						  type: 1,
						  skin: 'layui-layer-rim', //加上边框
						  area: ['800px', '420px'], //宽高
						  shade: false,
						  content: html
						});
						
						
					}
					
				},
				showOneLinkJam:function(item){
					
					map.getOverlayLayer().clear(vectors);
					vectors=[];
					vm.showOnelinkJam2(item);
					vm.setInfoWindow(item,item.xy,true);
				},
				
				showOnelinkJam2: function (linkJam) {
		    		var polygonStr = linkJam.xys ;
		    		//polygonStr= polygonStr.trim();
		    		var polygonArr = polygonStr.split("#");
		    		for (var i = 0; i < polygonArr.length; i++) {
		    			var lnglatarr = [];
		    			var lnglatStr = polygonArr[i];
		    			var lnglatArr = lnglatStr.split(";");
		    			for(var h = 0; h < lnglatArr.length; h++){
		    				var pos = lnglatArr[h].split(",");
		    				lnglatarr.push(new IMAP.LngLat(pos[0], pos[1]));
		    			}
		    			var polyline=new IMAP.Polyline(lnglatarr, {
		    				"strokeOpacity" : 1,
		    				"arrow" : true,
		    				"strokeColor" : "#CD2626" ,
		    				"strokeWeight" : 6,
		    				"strokeOpacity" : 1,
		    				"strokeStyle" : IMAP.Constants.OVERLAY_LINE_SOLID,
		    				"editabled" : false
		    			
		    			});
		    			vectors.push(polyline);
			    		map.getOverlayLayer().addOverlay(polyline, false);
		    		}

				},
				markerClick:function(e){
					var marker = e.target;
					var linkJam = e.target.data;
					map.getOverlayLayer().clear(vectors);
					vectors=[];
					vm.showOnelinkJam2(linkJam);
					vm.setInfoWindow(linkJam,linkJam.xy,true);
				},
				 setInfoWindow: function(data,lnglat,ishow){
			    	var pos = lnglat.split(",");
			    	var lnglat=new IMAP.LngLat(pos[0], pos[1]);
			    	var content = '<div style="width: 320px; border: solid 1px silver;"><div style="position: relative;background: none repeat scroll 0 0 #F9F9F9; '
			    		+' border-bottom: 1px solid #CCC;border-radius: 5px 5px 0 0;"><div style="display: inline-block;color: #333333;font-size: 14px;font-weight: bold;'
			    		+'line-height: 31px;padding: 0 10px;">'+data.roadName+'</div><img src="./assets/images/close2.gif" style="position: absolute;'
			    		+'top: 10px;right: 10px;transition-duration: 0.25s;"'
			    		+' onclick="gblMapObjs.closeInfoWindow()"></div><div style="font-size: 12px;color: #212121;padding: 6px;line-height: 20px;background-color: #f5f5f5;'
			    		+'height:117px;opacity: 0.8;">'
			    		+'<span>起点: <span>'+data.startAddr+'<br><span>终点: <span>'+data.endAddr+'<br><div style="margin:3px -10px; padding:0;border-top: 1px solid #CCC;"></div>'
			    		+'时速: '+data.jamSpeed +'  拥堵距离: '+data.jamDist+' <br>持续时间: '+data.longTime+'钟  发生时间: '+data.pubTime
			    		+'</div><div style="height: 0px;width: 100%;clear: both;text-align: center;position: relative; top: 0px; margin: 0px auto;">'
			    		+'<img src="./assets/images/bottom.png"></div></div>';
			    	infowindow = new IMAP.InfoWindow(content,{
						size : new IMAP.Size(322,125),
						position:lnglat,
						autoPan : false,
						offset : new IMAP.Pixel(15, 35),
						anchor:IMAP.Constants.LEFT_CENTER,
						type:IMAP.Constants.OVERLAY_INFOWINDOW_CUSTOM
					});
					map.getOverlayLayer().addOverlay(infowindow);
					infowindow.autoPan(true);
			    },
				applyDataToMap : function(data) {
					map.getOverlayLayer().removeOverlay(infowindow);
					for (var i = 0; i < markers.length; i++) {
						map.getOverlayLayer().removeOverlay(markers[i]);
					}
					vm.clear();
					map.getOverlayLayer().clear(vectors);
					vectors=[];
					vm.showOnetrafficControl(data.roaddraw.region);
					
					for (var i = 0; i < data.linkJams.length; i++) {
						var linkJam = data.linkJams[i];
						if(linkJam.xy){
							var pos = linkJam.xy.split(",");
							var marker = new IMAP.Marker(new IMAP.LngLat(pos[0], pos[1]), markerOpts);
							marker.data = linkJam;
							marker.addEventListener(IMAP.Constants.CLICK, vm.markerClick);
							//markers.push(marker);
							map.getOverlayLayer().addOverlay(marker, false);
							markers.push(marker);
						}
					}
					/*vm.showRoadJamToMap(data.linkJams);*/
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.roaddrawQ.startDt = $("#startDtQ").val()}});
				},
				init97DateEnd: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.roaddrawQ.endDt = $("#endDtQ").val()}});
				},
				getBarOpt: function () {
					vm.chartOpt = {
						title : {
					        x: 'center',
					        //text: vm.chartTitle
					    },
					    tooltip : {
					        trigger: 'axis'
					    },
					    grid:{
					    	show:true,
					    	/*backgroundColor:'#ff03fc'*/
					    	top:10,
					    	bottom:150
					    },
					    /*toolbox: {
					        show : true,
					        feature : {
					            dataView : {show: true, readOnly: true},
					            saveAsImage : {show: true}
					        }
					    },*/
					    xAxis : [
					        {
					            type : 'category',
					            data : vm.nameArray, 
					            axisLabel: {
			    	                interval: 0,
			    	                rotate: 90,
			    	                fontSize: 10
			    	            },
			    	            offset:0
					        }
					    ],
					    yAxis : [
					        {
					            type : 'value',
								/*min:0,
								max:10,
								interval:2,
					            splitArea:{
					            	show: true,
					            	areaStyle:{
					            		color:[
					            			'#01b85c','#00ff01', '#ffff01','#ff7f00','#fe0000'
					            		]
					            	}
					            }*/
					        }
					    ],
				        series: [
				        	{
				        		smooth:true,
					            type: 'bar',
					            data: vm.valueArray
					        }
				        ]
					};
				},
				clear: function(){
					//清除数据
					if(vm.newGridPolygon){//清除折线
						map.getOverlayLayer().removeOverlay(vm.newGridPolygon);
						vm.newGridPolygon = null;
					}
					
					vm.dataList = [];
				},
				close: function() {
					map.getOverlayLayer().removeOverlay(infowindow);
					for (var i = 0; i < markers.length; i++) {
						map.getOverlayLayer().removeOverlay(markers[i]);
					}
					vm.clear();
					map.getOverlayLayer().clear(vectors);
					vectors=[];
					itsGlobal.hideLeftPanel();
				}
			}
		});
		
		vm.query();
		
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "vehicleTrace的vue实例"
		});
	}
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})