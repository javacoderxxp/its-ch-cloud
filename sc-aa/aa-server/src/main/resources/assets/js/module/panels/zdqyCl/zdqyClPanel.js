define(function(require) {
	var htmlStr = require('text!./zdqyClPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	
	var show = function(zdqyClParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#zdqyCl-panel',
			data: {
				showList: true, //显示查询
				zdqyClQ: {groupId: (currentUser.jjzdUser? currentUser.group.groupId :''), gridAssigned:'0'}, //查询参数
				groupList:[],
				plateTypeDicts:[],
				zdqyCl: {},
				dutyGridList:[],
				fileName: "",
				//中队或车管所都可以更新
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0,
				isCgsAdmin: $.inArray("r_cgs",currentUser.roleIdList) >= 0 
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.zdqyClQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.zdqyCl = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "jtzt/zdqyCl/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.zdqyCl = rslt.zdqyCl;
							}else{
								alert(rslt.msg);
							}
							vm.loadGridsByGroup();
						}
					});
				},
				save: function () {
					//表单验证
					$("#detailForm").validate({
						invalidHandler : function(){//验证失败的回调
							return false;
						},
				    	rules: {
				    		sjhm: {
		    					number: true
			    			}
				    	},
				    	messages: {
				    		sjhm: {
			    				number: "手机号码必须是数字"
			    			}
				    	},
						submitHandler : function(){//验证通过的回调
							var url = "jtzt/zdqyCl/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.zdqyCl),
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
				saveGroupGrid: function () {
					var url = "jtzt/zdqyCl/saveGroupGrid";
					$.ajax({
						type: "POST",
						url: url,
						data: JSON.stringify(vm.zdqyCl),
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
				},
				checkQy: function () {
					$.ajax({
						type: "GET",
						url: "jtzt/zdqy/getByMc?mc="+encodeURIComponent(vm.zdqyCl.dwmc),
						success: function(rslt){
							if(rslt.code == 200){
								if(rslt.zdqy){
									alert("<b>该企业存在</b><br/>"
											+"<b>企业地址</b>: "+rslt.zdqy.dz+"<br/>"
											+"<b>中队已分配</b>: "+ (rslt.zdqy.zdId?'是':'否')+"<br/>"
											+"<b>责任区已分配</b>: "+(rslt.zdqy.gridId?'是':'否')+"<br/>"
										);
								}else{
									alert('该企业不存在!');
								}
							}else{
								alert(rslt.msg);
							}
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
							url: "jtzt/zdqyCl/purge/"+id,
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
				loadGridsByGroup : function() {
					vm.dutyGridList = [];
					var gid=vm.zdqyCl.gridId;
					if(vm.zdqyCl.groupId){
						$.get("qw/dutyGrid/allData?groupId="+vm.zdqyCl.groupId, function(r){
							if(r.code == 200){
								vm.dutyGridList = r.dutyGridList;
								vm.zdqyCl.gridId = gid;
							}else{
								alert(r.msg);
							}
						});
					}
				},
				loadGridsByChangeGroup : function() {
					vm.dutyGridList = [];
					vm.zdqyCl.gridId = '';
					if(vm.zdqyCl.groupId){
						$.get("qw/dutyGrid/allData?groupId="+vm.zdqyCl.groupId, function(r){
							if(r.code == 200){
								vm.dutyGridList = r.dutyGridList;
							}else{
								alert(r.msg);
							}
						});
					}
				},
				exportExcel: function () {
					var url = "jtzt/zdqyCl/exportExcel";
					$.ajax({
						type: "POST",
						url: url,
					    data: JSON.stringify(vm.zdqyClQ),
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功,请下载文件', function(index){
									vm.exportSuccess = true;
									vm.fileName = rslt.fileName;
									vm.query();
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				downloadExcel: function () {
					var url = "jtzt/zdqy/downloadExcel?fileName="+encodeURIComponent(vm.fileName);
					var wWidth = document.body.clientWidth/2 ;  
					var wHeight =document.body.clientHeight/2;  
					window.open(url,'newwindow','height=20,width=20,top='+wHeight+',left='+wWidth+',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no') ;  
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
		loadJqGrid();
		loadGroupList();
		loadPlateTypes();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "zdqyClPanel的vue实例"
		});
	}

	var loadGroupList = function() {
	    $.get("aa/group/allData?zdFlag=1", function(r){
			if(r.code == 200){
				vm.groupList = r.groupList;
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadPlateTypes = function() {
	    $.get("sys/dict/getDictList?type=PLATE_TYPE", function(r){
			if(r.code == 200){
				vm.plateTypeDicts = r.dictList;
			}else{
				alert(r.msg);
			}
		});
	};
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		$("#jqGrid").jqGrid({
			url: "jtzt/zdqyCl/pageData",
			datatype: "json",
			postData: vm.zdqyClQ,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '企业名称', name: 'dwmc', width: 120, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车辆号牌', name: 'hphm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '号牌种类', name: 'hpzlMs', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '使用性质', name: 'syxz', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '有效期止', name: 'yxqz', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '驾驶人', name: 'jsr', width: 60, sortable:false, hidden:true/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属中队', name: 'groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '所属责任区', name: 'gridName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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
			ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
	        },
			loadComplete: function(data) {//数据查询完毕
				var queryList = data.page.list;
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
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})