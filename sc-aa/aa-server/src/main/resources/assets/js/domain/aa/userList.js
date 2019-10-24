$(function () {
    $("#jqGrid").jqGrid({
        url: "../aaUser/pageData",
        datatype: "json",
        colModel: [
        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
			{ label: '用户编号', name: 'userId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '姓名', name: 'userName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '部门', name: 'group.groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '类型', name: 'type', width: 60, sortable:false, formatter: function(value, options, row){
				var lx = '其他';
				switch (value) {
				case 'MJ':
					lx = '民警';
					break;
				case 'JF':
					lx = '警辅';
					break;
				case 'QT':
				default:
					lx = '其他';
					break;
				}
				return lx;
			}},
			{ label: '性别', name: 'sex', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '警号', name: 'policeNo', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '电话', name: 'phoneNum', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '允许登录', name: 'active', width: 60, sortable:false, formatter: function(value, options, row){
				return value == '1'? '是':'否';
			}},
			{ label: '上次登录时间', name: 'lastLoginDt', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '上次登录IP', name: 'lastLoginIp', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
        ],
        viewrecords: true,
        height: 510,
        rowNum: 20,
		rowList : [20,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth:true,
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
        onSelectRow: function(rowid, status){//选中某行
    		var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
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
	
    $.get("../aaGroup/allData", function(r){
		if(r.code == 200){
			vm.groupList = r.groupList;
		}else{
			alert(r.msg);
		}
	});
});

var ztreeRole;
var ztreeGroup;

var settingRole = {
	callback: {
		onCheck: function(event, treeId, treeNode) {
		    vm.user.roleList = [];
		    var nodes = ztreeRole.getCheckedNodes(true);
			for(var i=0; i<nodes.length; i++) {
				var roleTmp = {'roleId': nodes[i].roleId};
				vm.user.roleList.push(roleTmp);
			}
		}
	},
	data: {
		simpleData: {
			enable: true,
			idKey: "roleId",
			pIdKey: "parentId",
			rootPId: -1
		},
		key: {
			url:"nourl",
			name :"roleName"
		}
	},
	check:{
		enable:true,
		nocheckInherit:true
	}
};

var settingGroup = {
	data: {
		simpleData: {
			enable: true,
			idKey: "groupId",
			pIdKey: "parentId",
			rootPId: -1
		},
		key: {
			url:"nourl",
			name :"groupName"
		}
	}
};

var vm = new Vue({
	el:'#vue-app',
	data:{
		title: null,
		showList: true, //显示查询
		userQ: {}, //查询参数
		user: {group:{}},
		groupList:[]
	},
	methods: {
		query: function () {
			vm.reload();
		},
		importData: function () {
			vm.showList = true;
			layer.open({
			  type: 1,
			  title: vm.title,
			  skin: 'layui-layer-rim', //加上边框
			  area: ['550px','500px'], //宽
			  content: $("#importDiv")
			});
		},
		add: function () {
			vm.title="新增";
			vm.showList = false;
			vm.user = {isNewRecord:true, group:{}, active:'0'};

			vm.getRoleTree();
			vm.getGroupTree();
		},
		edit: function () {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			$.ajax({
			    url: "../aaUser/detail/"+id,
			    success: function(rslt){
					if(rslt.code == 200){
						vm.title="编辑";
						vm.showList = false;
						if(!rslt.user.group){
							rslt.user.group={};
						}
						vm.user = rslt.user;

						vm.getRoleTree();
						vm.getGroupTree();
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
					var url = "../aaUser/save";
					$.ajax({
						type: "POST",
					    url: url,
					    data: JSON.stringify(vm.user),
					    success: function(rslt){
					    	if(rslt.code === 200){
								alert('操作成功', function(index){
									vm.reload(true);
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
				    url: "../aaUser/delete/"+id,
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
				    url: "../aaUser/purge/"+id,
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
		reload: function (keepCurrentPage) {
			vm.showList = true;
			var postDataTmp = {'userId': vm.userQ.userId,'userName': vm.userQ.userName,'policeNo': vm.userQ.policeNo,'groupId': vm.userQ.groupId};
			var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
			$.each(postData, function (k, v) {  
				delete postData[k];
			});
			
			//var page = $("#jqGrid").jqGrid('getGridParam','page');
			var page = 1;
			if(keepCurrentPage){
				var page = $('#jqGrid').getGridParam('page');
				if(!page){
					page = 1;
				}
			}else{
				page = 1;//按钮触发，总是从第一页查
			}
			
			$("#jqGrid").jqGrid('setGridParam',{ 
				postData: postDataTmp,
				page:page
			}).trigger("reloadGrid");
		},
		getRoleTree: function() {
	    	$.get("../aaRole/allData", function(r){//加载树
	    		ztreeRole = $.fn.zTree.init($("#roleTree"), settingRole, r.roleList);
	    		ztreeRole.expandAll(true);//展开所有节点
				//勾选用户所拥有的角色
				if( vm.user.roleList){
					for(var i=0; i< vm.user.roleList.length; i++) {
						var nodeTmp = ztreeRole.getNodeByParam("roleId", vm.user.roleList[i].roleId);
						ztreeRole.checkNode(nodeTmp, true, false);
					}
				}
	    	});
	    },
		getGroupTree: function() {
	    	$.get("../aaGroup/allData", function(r){//加载树
	    		ztreeGroup = $.fn.zTree.init($("#groupTree"), settingGroup, r.groupList);
	    		ztreeGroup.expandAll(true);//展开所有节点
				//勾选用户所拥有的组
				if( vm.user.group){
					var nodeTmp = ztreeGroup.getNodeByParam("groupId", vm.user.group.groupId);
					ztreeGroup.selectNode(nodeTmp, true, false);
				}
	    	});
	    },
	    groupTreeSelect: function(){
			layer.open({
				type: 1,
				offset: '50px',
				skin: 'layui-layer-rim',
				title: "选择组",
				area: ['300px', '450px'],
				shade: 0,
				shadeClose: false,
				content: jQuery("#groupLayer"),
				btn: ['确定', '清除', '取消'],
				btn1: function (index) {
					var nodes = ztreeGroup.getSelectedNodes();
					for(var i=0; i< nodes.length; i++) {
						var nodeTmp = {'groupId': nodes[i].groupId, 'groupName': nodes[i].groupName};
						vm.user.group = nodeTmp;
					}
					layer.close(index);
	            },
				btn2: function (index) {
				    ztreeGroup.cancelSelectedNode();
					vm.user.group = {};
	            }
			});
		},
	}
});