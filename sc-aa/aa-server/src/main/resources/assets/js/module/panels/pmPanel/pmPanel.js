define(function(require) {
	var htmlStr = require('text!./pmPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var duallistbox = require('duallistbox');
	var pmPanelApp = null;
	var st=1;
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		
		pmPanelApp = new Vue({
			el: '#pm-panel',
			created: function () {
			   this.loadMultiselect()
			  },
			data: {
				showList: true,
				projectQ: {}, //查询参数
				project: {projectTraceList:[]},
				projectStatusDicts:[],
				devProjectList:[],
				signalList:[],
				oldArray:[],
				pmzdbh:'',
				ssType: 1,
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			methods: {
				loadMultiselect:function(cur,old){
					require(['bootstrapSelect','bootstrapSelectZh'],function(){
						$('#protype').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
						$('#prostatus').selectpicker({
							noneSelectedText:'请选择一个路口',
							liveSearch: true,
							style: 'btn-default',
							size: 10
						});
					});
				},
				query: function () {
					pmPanelApp.reload();
				},
				detail: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
					    url: "jtss/project/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								pmPanelApp.showList = false;
								pmPanelApp.project = rslt.project;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				showTraceContent: function (content) {
					layer.alert(content)
				},
				reload: function () {
					pmPanelApp.showList = true;
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				},
				relation: function(){
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					pmPanelApp.ssType=1;
					layer.open({
						type: 1,
						skin: 'layui-layer',
						title: ["设备关联"],
						area: ['540px', '475px'],
						shade: false,
						content: jQuery("#shebeiRelation"),
						btn: []
					});
					var deviceType = pmPanelApp.ssType;
					$.get("jtss/project/findPmDevList?zdbh="+pmPanelApp.pmzdbh+"&deviceType="+deviceType, function(r){// 已选择的数据
			    		pmPanelApp.signalList=r.devProjectList;
			    		pmPanelApp.oldArray=[];
						for(var x=0; x < pmPanelApp.signalList.length; x++){
			    			pmPanelApp.oldArray.push(pmPanelApp.signalList[x].deviceId);
			    		}
			    	});
					pmPanelApp.loadGroupUser(deviceType);
				},
				relationSave:function(){
					var deviceType =  pmPanelApp.ssType;
					if(groupUserComponent){
		        		var signalIds = groupUserComponent.val();
		        		var signals = [];
		        		if(signalIds){
		        			for(var x=0; x < signalIds.length; x++){
		        				//var userTmp = {'userId': signalIds[x]};
		        				signals.push(signalIds[x]);
		        			}
		        			//console.log(signals);
		        		}else{
		        			//alert("请选择设备");
		        			//return;
		        		}
        				var devProject={"zdbh":pmPanelApp.pmzdbh,
        						"deviceType":deviceType,
        						"deviceId":signals.toString()};
        				//console.log(devProject);
        				$.ajax({
        					type: "POST",
        					url: "jtss/project/savePmDev/",
        					data: JSON.stringify(devProject),
        					success: function(rslt){
        						if(rslt.code == 200){
        							alert('操作成功', function(index){
        								layer.closeAll();
        								pmPanelApp.ssType=1;
        							});
        						}else{
        							alert(rslt.msg);
        						}
        					}
        				});
		        	}
				},
				sbssSelect: function (){

					var deviceType =  pmPanelApp.ssType;
					if(groupUserComponent){
		        		var signalIds = groupUserComponent.val();
		        		var signals = [];
		        		if(signalIds){
		        			for(var x=0; x < signalIds.length; x++){
		        				//var userTmp = {'userId': signalIds[x]};
		        				signals.push(signalIds[x]);
		        			}
		        			//console.log(signals);
		        		}else{
		        			//alert("请选择设备");
		        			//return;
		        		}
		        		if(!TUtils.cmp(pmPanelApp.oldArray,signals)){
		        			confirm('当前修改的数据，是否提交？', function(){
		        				var devProject={"zdbh":pmPanelApp.pmzdbh,
		        						"deviceType":st,
		        						"deviceId":signals.toString()};
		        				console.log(st);
		        				$.ajax({
		        					type: "POST",
		        					url: "jtss/project/savePmDev/",
		        					data: JSON.stringify(devProject),
		        					success: function(rslt){
		        						if(rslt.code == 200){
		        							alert('操作成功');
		        							st= pmPanelApp.ssType;
		        						}else{
		        							alert(rslt.msg);
		        						}
		        					}
		        				});
		        			})
		        			
		        		}else{
		        			st= pmPanelApp.ssType;
		        		}
		        	}
					$.get("jtss/project/findPmDevList?zdbh="+pmPanelApp.pmzdbh+"&deviceType="+deviceType, function(r){// 已选择的数据
			    		pmPanelApp.signalList=r.devProjectList;
			    		pmPanelApp.oldArray=[];
						for(var x=0; x < pmPanelApp.signalList.length; x++){
			    			pmPanelApp.oldArray.push(pmPanelApp.signalList[x].deviceId);
			    		}
			    	});
					pmPanelApp.loadGroupUser(deviceType);
				},
				loadGroupUser: function (deviceType) {
					$('#groupUserListCol').empty();
					$('#groupUserListCol').append('<select class="form-control" name="groupUserList" multiple="multiple" size="20" style="height: 200px"></select>');
					groupUserComponent = null;
					//全部数据
					$.ajax({
					    url: "jtss/project/findssList?zdbh="+pmPanelApp.pmzdbh+"&deviceType="+deviceType,
					    success: function(rslt){
							if(rslt.code == 200){
								pmPanelApp.devProjectList = rslt.ssList;
								$(pmPanelApp.devProjectList).each(function () {
					                var option = document.createElement("option");
					                option.value = this['deviceId'];
					                option.text = this['deviceName'];
					                if (pmPanelApp.signalList) {
					                    $.each(pmPanelApp.signalList, function (i, signal) {
					                    	
					                        if (option.value == signal.deviceId) {
					                        	option.selected = 'selected';
					                        	return;
					                        }
					                    });
					                }
					                $('select[name="groupUserList"]')[0].options.add(option);
					            });
					            //渲染dualListbox
								groupUserComponent = $('select[name="groupUserList"]').bootstrapDualListbox({
									nonSelectedListLabel: '<b><span style="color: #ff9800">未选择</span></b>',
									selectedListLabel: '<b><span class="text-success">已选择</span></b>',
									preserveSelectionOnMove: 'moved',
									moveOnSelect: true,
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				}
			}
		});
		
		loadProjectStatus();
		
		loadJqGrid();
		
		vueEureka.set("leftPanel", {
			vue: pmPanelApp,
			description: "pmPanel的vue实例"
		});
	}
	
	var loadProjectStatus = function() {
	    $.get("sys/dict/getDictList?type=project_status", function(r){
			if(r.code == 200){
				pmPanelApp.projectStatusDicts = r.dictList;
			}else{
				alert(r.msg);
			}
		});
	}
	var groupUserComponent;
	var ztreeGroup;
	var settingGroup = {
		data: {
			simpleData: {
				enable: true,
				idKey: "deviceId",
				pIdKey: "pId",
				rootPId: -1
			},
			key: {
				url:"nourl",
				name :"deviceName"
			}
		}
	};
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		
		var postDataTmp = {'xmlb': pmPanelApp.projectQ.xmlb,'xmzt': pmPanelApp.projectQ.xmzt,'zdbh': pmPanelApp.projectQ.zdbh,'xmmc': pmPanelApp.projectQ.xmmc};
	    $("#jqGrid").jqGrid({
	        url: "jtss/project/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '项目类别', name: 'xmlb', width: 100, sortable:false},
				{ label: '项目编号', name: 'zdbh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '项目名称', name: 'xmmc', width: 180, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '启动日期', name: 'qdsj', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '状态', name: 'xmzt', width: 40, sortable:false, formatter: function(value, options, row){
					var status = '规划';
					switch (value) {
					case '8':
						status = '规划';
						break;
					case '5':
						status = '招标';
						break;
					case '3':
						status = '建设';
						break;
					case '4':
						status = '验收';
						break;
					case '7':
						status = '完成';
						break;
					default:
						break;
					}
					return status ;
				}},
	        ],
			viewrecords: true,
	        height: 260,
	        rowNum: 10,
			rowList : [10,30,50],
	        rownumbers: true, 
	        rownumWidth: 25, 
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
	            layer.msg("加载完毕");
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	pmPanelApp.detail();
	        },
	        onSelectRow: function(rowid){//选中某行
	    		var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	    		pmPanelApp.pmzdbh=rowData.zdbh;
	    		//var x = rowData.latLng.split(',')[0];
	    		//var y = rowData.latLng.split(',')[1];
	    		//map.centerAndZoom(new BMap.Point(x,y), 19);
		}
	    });
	};
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})