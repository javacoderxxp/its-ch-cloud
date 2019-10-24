define(function(require) {
	var htmlStr = require('text!./epPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	
	var show = function(epParam) {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#ep-panel',
			data: {
				showList: false, //显示查询
				epQ: {}, //查询参数
				ep: epParam,
				fxdmDictList: [],
				dictList:[],
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0
			},
			methods: {
				query: function () {
					vm.reload();
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					vm.ep = {isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "dev/ep/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.ep = rslt.ep;
								if(rslt.ep.usedFor == ""){
									vm.ep.usedFor = "";
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				clone: function () {
					var id = getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "dev/ep/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="克隆";
								vm.showList = false;
								vm.ep = rslt.ep;
								vm.ep.id='';
								vm.ep.isNewRecord=true;
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				save: function () {
					vm.ep.installDt = $("#installDt").val();
					//表单验证
					$("#detailForm").validate({
						invalidHandler : function(){//验证失败的回调
							return false;
						},
						submitHandler : function(){//验证通过的回调
							var url = "dev/ep/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.ep),
								success: function(rslt){
									if(rslt.code === 200){
										alert('操作成功', function(index){
											vm.reload();
											//layer.closeAll('page');
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
				del: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "dev/ep/delete/"+id,
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
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定清除？', function(){
						$.ajax({
							type: "POST",
							url: "dev/ep/purge/"+id,
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
				reload: function (event) {
					vm.showList = true;
					loadJqGrid();
				},
				init97DateInstall: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd', onpicked:function(){vm.ep.installDt = $("#installDt").val()}});
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "purePanel的vue实例"
		});
	}
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');

		var postDataTmp = {'deviceId': vm.epQ.deviceId,'deviceName': vm.epQ.deviceName,'type': vm.epQ.type,'usedFor': vm.epQ.usedFor};
		$("#jqGrid").jqGrid({
			url: "dev/ep/pageData",
			postData: postDataTmp,
			datatype: "json",
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '设备编码', name: 'deviceId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备名称', name: 'deviceName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '设备IP地址', name: 'ipAddress', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '拍摄方向', name: 'psfx', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '类型', name: 'type', width: 60, sortable:false, formatter: function(value, options, row){
					return value=='DJ'?'电警':'卡口';
				}},
				{ label: '用途', name: 'usedFor', width: 60, sortable:false, formatter: function(value, options, row){
					switch (value) {
					case 'CS':
						return '测速抓拍';
						break;
					case 'CHD':
						return '闯红灯抓拍';
						break;
					case 'CJQ':
						return '闯禁区抓拍';
						break;
					case 'DXD':
						return '单行道抓拍';
						break;
					case 'FJDCD':
						return '机动车不在机动车道内行驶';
						break;
					case 'JZ':
						return '禁左抓拍';
						break;
					case 'LRBMX':
						return '礼让斑马线抓拍';
						break;
					case 'NX':
						return '逆行';
						break;
					case 'WGX':
						return '网格线抓拍';
						break;
					case 'ZYCD':
						return '专用车道抓拍';
						break;
					case 'DGN':
						return '多功能高速球';
						break;
					default:
						return '未知';
						break;
					}
					return value;
				}},
				{ label: '路口号', name: 'crossId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '路段号', name: 'linkId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			],
			viewrecords: true,
			height: 290,
			rowNum: 15,
			rowList : [15,30,50],
			rownumbers: true, 
			rownumWidth: 25, 
			autowidth:true,
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
			ondblClickRow: function(rowid, iRow, iCol, e){
	        	vm.edit();
	        },
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
			}
		});

		/*require(['datetimepicker'],function(){
			$(".form_datetime").datetimepicker({language: "zh-CN", minView: 2, format: 'yyyy-mm-dd', autoclose: true});
		});*/
		
		$.get("sys/dict/getDictList?type=FXDM", function(r){
			if(r.code == 200){
				vm.fxdmDictList = r.dictList;
			}else{
				alert(r.msg);
			}
		});
		
		$.get("sys/dict/getDictList?type=tollgate_used_for", function(r){
			if(r.code == 200){
				vm.dictList = r.dictList;
			}else{
				alert(r.msg);
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