$(function () {
    $("#jqGrid").jqGrid({
        url: "../aaRole/pageData",
        datatype: "json",
        colModel: [
        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
			{ label: '角色编号', name: 'roleId', width: 300, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '角色名称', name: 'roleName', width: 300, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '创建时间', name: 'createDt', width: 300, sortable:false/*, formatter: function(value, options, row){return value;}*/},
        ],
        viewrecords: true,
        height: 510,
        rowNum: 20,
	rowList : [20,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth: true,
        multiselect: false,
        pager: "#jqGridPager",
        jsonReader : {
            root: "page.records",
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
    		//var x = rowData.latLng.split(',')[0];
    		//var y = rowData.latLng.split(',')[1];
    		//map.centerAndZoom(new BMap.Point(x,y), 19);
    	}
    });
    //表格左下角导航页
    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});

	$(document).keypress(function(e) {
		// 回车键事件  
		if (e.which == 13) {
			vm.query();
		}
	});
});

var ztreePermission;
var settingPermission = {
	callback: {
		onCheck: function(event, treeId, treeNode) {
		    vm.role.permissionList = [];
		    var nodes = ztreePermission.getCheckedNodes(true);
			for(var i=0; i<nodes.length; i++) {
				var permissionTmp = {'permissionId': nodes[i].permissionId};
				vm.role.permissionList.push(permissionTmp);
			}
		}
	},
	data: {
		simpleData: {
			enable: true,
			idKey: "permissionId",
			pIdKey: "parentId",
			rootPId: -1
		},
		key: {
			url:"nourl",
			name :"permissionName"
		}
	},
	check:{
		enable:true,
		nocheckInherit:true
	}
};

var ztreeMenu;
var settingMenu = {
	callback: {
		onCheck: function(event, treeId, treeNode) {
		    vm.role.menuList = [];
		    var nodes = ztreeMenu.getCheckedNodes(true);
			for(var i=0; i<nodes.length; i++) {
				var menuTmp = {'menuId': nodes[i].menuId};
				vm.role.menuList.push(menuTmp);
			}
		}
	},
	data: {
		simpleData: {
			enable: true,
			idKey: "menuId",
			pIdKey: "pid",
			rootPId: -1
		},
		key: {
			url:"nourl",
			name :"menuName"
		}
	},
	check:{
		enable:true,
		nocheckInherit:true
	}
};

var vm = new Vue({
	el:'#vue-app',
	data:{
		title: null,
		showList: true, //显示查询
		roleQ: {}, //查询参数
		role: {}
	},
	methods: {
		query: function () {
			vm.reload();
		},
		add: function () {
			vm.title="新增";
			vm.showList = false;
			vm.role = {isNewRecord:true};
			vm.getPermissionTree();
			vm.getMenuTree();
		},
		edit: function () {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			$.ajax({
			    url: "../aaRole/detail/"+id,
			    success: function(rslt){
					if(rslt.code == 200){
						vm.title="编辑";
						vm.showList = false;
						vm.role = rslt.role;
						vm.getPermissionTree();
						vm.getMenuTree();
					}else{
						alert(rslt.msg);
					}
				}
			});
		},
		save: function () {
            console.info(vm.role);
		    //表单验证
		    $("#detailForm").validate({
		        invalidHandler : function(){//验证失败的回调
		            return false;
		        },
		        submitHandler : function(){//验证通过的回调
					var url = "../aaRole/save";
					$.ajax({
						type: "POST",
					    url: url,
					    data: JSON.stringify(vm.role),
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
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			confirm('确定删除？', function(){
				$.ajax({
					type: "POST",
				    url: "../aa/role/delete/"+id,
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
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			confirm('确定清除？', function(){
				$.ajax({
					type: "POST",
				    url: "../aaRole/purge/"+id,
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
		popupDetail: function (event) {
			/*
			layer.open({
			  type: 1,
			  title: vm.title,
			  skin: 'layui-layer-rim', //加上边框
			  area: ['550px','500px'], //宽
			  content: $("#detailDiv")
			});
			*/
		},
		reload: function (event) {
			vm.showList = true;
			var postDataTmp = {'roleId': vm.roleQ.roleId, 'roleName': vm.roleQ.roleName};
			var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
			$.each(postData, function (k, v) {  
				delete postData[k];
			});
			//var page = $("#jqGrid").jqGrid('getGridParam','page');
			var page = 1;//按钮触发，总是从第一页查
			$("#jqGrid").jqGrid('setGridParam',{ 
				postData: postDataTmp,
				page:page
			}).trigger("reloadGrid");
		},
		getPermissionTree: function() {
	    	$.get("../aaPermission/allData", function(r){//加载树
	    		ztreePermission = $.fn.zTree.init($("#permissionTree"), settingPermission, r.permissionList);
	    		ztreePermission.expandAll(true);//展开所有节点
				//勾选用户所拥有的角色
				if(vm.role.permissionList){
					for(var i=0; i< vm.role.permissionList.length; i++) {
						var nodeTmp = ztreePermission.getNodeByParam("permissionId",  vm.role.permissionList[i].permissionId);
						ztreePermission.checkNode(nodeTmp, true, false);
					}
				}
	    	});
	    },
		getMenuTree: function() {
	    	$.get("../aaMenu/allData", function(r){//加载树
	    		ztreeMenu = $.fn.zTree.init($("#menuTree"), settingMenu, r.menuList);
	    		ztreeMenu.expandAll(true);//展开所有节点
				//勾选用户所拥有的角色
				if(vm.role.menuList){
					for(var i=0; i< vm.role.menuList.length; i++) {
						var nodeTmp = ztreeMenu.getNodeByParam("menuId",  vm.role.menuList[i].menuId);
						ztreeMenu.checkNode(nodeTmp, true, false);
					}
				}
	    	});
	    }
	}
});
