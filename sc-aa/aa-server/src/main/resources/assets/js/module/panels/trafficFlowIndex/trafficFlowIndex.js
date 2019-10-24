define(function(require) {
	var htmlStr = require('text!./trafficFlowIndex.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var echarts = require('echarts');
	var echartWalden = require('echartsWalden');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	
	var markerOpts = new IMAP.MarkerOptions();
	markerOpts.icon = new IMAP.Icon("./assets/images/vehicle.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	markerOpts.anchor = IMAP.Constants.CENTER;
	var chartTmp;
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#trafficFlowIndex-panel',
			data: {
				showList:false,
				dataList:[],
				nameArray:[],
				valueArray:[],
				richiValueArray:[],
				chartTitle:'',
				charOpt:{},
				chartTmp:null,
				vehiclePassQ:{startDt: TUtils.formatDate(new Date())},
			},
			methods: {
				query: function() {
					chartTmp = echarts.init(document.getElementById('trafficIndexChart'), 'walden');
					var url = "video/vehiclePass/getTrafficFlowIndex?startDt="+vm.vehiclePassQ.startDt;
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
				//数据应用到视图
				applyDataToUI : function() {
					vm.nameArray = [];
					vm.valueArray = [];
					vm.richiValueArray = [];
				    for(x in vm.chartVOList){
				    	vm.nameArray.push(vm.chartVOList[x].name);
				    	vm.valueArray.push(vm.chartVOList[x].value);
				    	vm.richiValueArray.push({value: vm.chartVOList[x].value, name: vm.chartVOList[x].name});
				    }
				    vm.chartTitle ='';
	    			vm.getBarOpt();
	    			
				    if(vm.chartVOList) {
		    			chartTmp.setOption(vm.chartOpt);
					}
				},
				getBarOpt: function () {
					vm.chartOpt = {
						title : {
					        x: 'center',
					        text: vm.chartTitle
					    },
					    tooltip : {
					        trigger: 'axis'
					    },
					    grid:{
					    	show:true,
					    	backgroundColor:'#ff03fc'
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
			    	                rotate: 20
			    	            },
					        }
					    ],
					    yAxis : [
					        {
					            type : 'value',
								min:0,
								max:10,
								interval:2,
					            splitArea:{
					            	show: true,
					            	areaStyle:{
					            		color:[
					            			'#01b85c','#00ff01', '#ffff01','#ff7f00','#fe0000'
					            		]
					            	}
					            }
					        }
					    ],
				        series: [
				        	{
					            type: 'line',
					            smooth: true,
					            data: vm.valueArray
					        }
				        ]
					};
				},
				clear: function(){
					//清除数据
					vm.dataList = [];
					vm.vehiclePassQ = {startDt: TUtils.formatDateTime(TUtils.setDate(TUtils.addDate(new Date(),-1)))}
				},
				init97DateStart: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', isShowClear: false, onpicked:function(){vm.vehiclePassQ.startDt = $("#startDtQ").val()}});
				},
				close: function() {
					vm.clear();
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