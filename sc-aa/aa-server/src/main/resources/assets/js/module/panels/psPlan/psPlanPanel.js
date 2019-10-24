define(function(require) {
	var htmlStr = require('text!./psPlanPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var echarts = require('echarts');
	var echartsWalden = require('echartsWalden');
	var vm = null;
	
	var show = function(psPlanParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#psPlan-panel',
			data: {
				showList: true, //显示查询
				signalCtrlerList:[],
				psPlanQ: {}, //查询参数
				psPlan: {},
				chartOpt:null,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.psPlanQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.psPlan = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "signal/psPlan/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.psPlan = rslt.psPlan;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				clone: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "signal/psPlan/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								vm.psPlan = rslt.psPlan;
								vm.title="克隆";
								vm.psPlan.id='';
								vm.psPlan.isNewRecord=true;
								vm.showList = false;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
					//表单验证
					$("#detailForm").validate({
						invalidHandler : function(){//验证失败的回调
							return false;
						},
						submitHandler : function(){//验证通过的回调
							var url = "signal/psPlan/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.psPlan),
								success: function(rslt){
									if(rslt.code == 200){
										alert('操作成功', function(index){
											vm.reload();
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
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "signal/psPlan/purge/"+id,
							success: function(rslt){
								if(rslt.code == 200){
									alert('操作成功', function(index){
										$("#jqGrid").trigger("reloadGrid");
									});
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				reload: function () {
					vm.showList = true;
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		loadSignalDevice();
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "psPlanPanel的vue实例"
		});
	}
	var loadSignalDevice = function () {
	    $.get("dev/signalCtrler/allData", function(r){
			if(r.code == 200){
				vm.signalCtrlerList = r.signalCtrlerList;
			}else{
				alert(r.msg);
			}
		});
	};
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = vm.psPlanQ;
		$("#jqGrid").jqGrid({
			url: "signal/psPlan/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '路口', name: 'deviceName', width:100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '路口号', name: 'crossId', width: 50, sortable:true, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				/*{ label: '方案号', name: 'planNo', width: 60, sortable:false, formatter: function(value, options, row){return value;}},*/
				{ label: '方案', name: 'planName', width: 50, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '配时名', name: 'timingName', width: 50, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '周期(秒)', name: 'cycleLen', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '执行日期', name: 'exeDts', width: 150, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '执行时间', name: 'exeDurations', width: 150, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '详情', name: 'planNo', width: 50, sortable:false, hidden:true, formatter: function(value, options, row){
					return "<a class='btn btn-defalut psDetailPic' data-planid='"+row.id+"' style='cursor: pointer;'><span class='fa fa-eye'></span></a>";
				}},
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
				$('.psDetailPic').bind('click',function(){
					var planid = $(this).data("planid");
					if(!planid || ""==planid){
						return;
					}
					var chartTmp = echarts.init(document.getElementById('psPlanEchart'), 'walden');
					getPieOpt();
					chartTmp.setOption(vm.chartOpt);
					
					layer.open({
						type: 1,
						offset: '150px',
//						skin: 'layui-layer-rim',
						skin: 'layui-layer',
						title: "",
						area: ['600px','500px'], //宽高
						shade: 0,
						shadeClose: false,
						content: $("#psPlanEchartPopup")
					});
				});
			},
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
	        },
			gridComplete:function(){
				//隐藏grid底部滚动条
				$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
			}
		});
	};
	var getPieOpt = function () {
		vm.chartOpt = {
			    tooltip: {
			        trigger: 'item',
			        formatter: "{a} <br/>{b}: {c} ({d}%)"
			    },
			    legend: {
			        orient: 'vertical',
			        x: 'left',
			        data:['东西直行','东西左转','南北直行','南北左转']
			    },
			    series: [
			        {
			            name:'00:00-06:00',
			            type:'pie',
			            selectedMode: 'single',
			            radius: ['5%', '12%'],
			            label: {
			                normal: {
			                    position: 'inner'
			                }
			            },
			            data:[
			                {value:16, name:'东西直行'},
			                {value:13, name:'东西左转'},
			                {value:16, name:'南北直行'},
			                {value:13, name:'南北左转'}
			            ]
			        },
			        {
			            name: '06:00-07:00',
			            type:'pie',
			            radius: ['15%', '22%'],
			            label: {
			                normal: {
			                    position: 'inner'
			                }
			            },
			            data:[
			                {value:28, name:'东西直行'},
			                {value:15, name:'东西左转'},
			                {value:25, name:'南北直行'},
			                {value:15, name:'南北左转'}
			            ]
			        },
			        {
			            name: '07:00-09:00',
			            type:'pie',
			            radius: ['25%', '32%'],
			            label: {
			                normal: {
			                    position: 'inner'
			                }
			            },
			            data:[
			                {value:32, name:'东西直行'},
			                {value:17, name:'东西左转'},
			                {value:36, name:'南北直行'},
			                {value:23, name:'南北左转'}
			            ]
			        },
			        {
			            name: '09:00-12:00',
			            type:'pie',
			            radius: ['35%', '42%'],
			            label: {
			                normal: {
			                    position: 'inner'
			                }
			            },
			            data:[
			                {value:28, name:'东西直行'},
			                {value:15, name:'东西左转'},
			                {value:25, name:'南北直行'},
			                {value:15, name:'南北左转'}
			            ]
			        },
			        {
			            name: '12:00-16:50',
			            type:'pie',
			            radius: ['45%', '52%'],
			            label: {
			                normal: {
			                    position: 'inner'
			                }
			            },
			            data:[
			                {value:28, name:'东西直行'},
			                {value:15, name:'东西左转'},
			                {value:25, name:'南北直行'},
			                {value:15, name:'南北左转'}
			            ]
			        },
			        {
			            name: '16:50-18:00',
			            type:'pie',
			            radius: ['55%', '62%'],
			            label: {
			                normal: {
			                    position: 'inner'
			                }
			            },
			            data:[
			                {value:31, name:'东西直行'},
			                {value:20, name:'东西左转'},
			                {value:37, name:'南北直行'},
			                {value:20, name:'南北左转'}
			            ]
			        },
			        {
			            name: '18:00-22:00',
			            type:'pie',
			            radius: ['65%', '72%'],
			            label: {
			                normal: {
			                    position: 'inner'
			                }
			            },
			            data:[
			                {value:28, name:'东西直行'},
			                {value:15, name:'东西左转'},
			                {value:25, name:'南北直行'},
			                {value:15, name:'南北左转'}
			            ]
			        },
			        {
			            name: '22:00-00:00',
			            type:'pie',
			            radius: ['75%', '82%'],
			            label: {
			                normal: {
			                    position: 'inner'
			                }
			            },
			            data:[
			                {value:16, name:'东西直行'},
			                {value:13, name:'东西左转'},
			                {value:16, name:'南北直行'},
			                {value:13, name:'南北左转'}
			            ]
			        },
			    ]
			};
	};
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})