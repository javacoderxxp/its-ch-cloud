$(function () {
    $("#jqGrid").jqGrid({
        url: "../aaGroup/pageData",
        datatype: "json",
        colModel: [
        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
			{ label: '部门编号', name: 'groupId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '部门名称', name: 'groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '上级部门', name: 'parent.groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			/*{ label: '六合一平台编码', name: 'organizeId', width: 60, sortable:false, formatter: function(value, options, row){return value;}},*/
        ],
        viewrecords: true,
	    height: 390,
	    rowNum: 15,
		rowList : [15,30,50],
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
        onSelectRow: function(rowid){//选中某行
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

});

var ztreeGroup;
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
var groupUserComponent;

var vm = new Vue({
	el:'#vue-app',
	data:{
		title: null,
		showList: true, //显示查询
		groupQ: {}, //查询参数
		group: {zdFlag: '1', parent:{}},
		candidateGroupUserList:[]
	},
	methods: {
		query: function () {
			vm.reload();
		},
		add: function () {
			vm.title="新增";
			vm.showList = false;
			vm.group = {isNewRecord:true, zdFlag: '1', parent:{}};
			vm.constructGroupTree();
			vm.loadGroupUser('');
		},
		edit: function () {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			$.ajax({
			    url: "../aaGroup/detail/"+id,
			    success: function(rslt){
					if(rslt.code == 200){
						vm.title="编辑";
						vm.showList = false;
						if(!rslt.group.parent){
							rslt.group.parent={};
						}
						vm.group = rslt.group;
						vm.constructGroupTree();
						vm.loadGroupUser(rslt.group.groupId);
					}else{
						alert(rslt.msg);
					}
				}
			});
		},
		save: function () {
		    //表单验证
		    $("#detailForm").validate({
		    	/* !!!验证时请替换为真实字段
		    	rules: {
		    		version: {
    					number: true
	    			}
		    	},
		    	messages: {
		    		version: {
	    				number: "版本号必须是数字"
	    			}
		    	},*/
		        invalidHandler : function(){//验证失败的回调
		            return false;
		        },
		        submitHandler : function(){//验证通过的回调
		        	if(groupUserComponent){
		        		var userIds = groupUserComponent.val();
		        		var users = [];
		        		if(userIds){
		        			for(var x=0; x < userIds.length; x++){
		        				var userTmp = {'userId': userIds[x]};
		        				users.push(userTmp);
		        			}
		        			vm.group.userList = users;
		        		}else{
		        			vm.group.userList = [];
		        		}
		        	}
					var url = "../aaGroup/save";
					$.ajax({
						type: "POST",
					    url: url,
					    data: JSON.stringify(vm.group),
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
				    url: "../aaGroup/delete/"+id,
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
				    url: "../aaGroup/purge/"+id,
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
			var postDataTmp = {'groupId': vm.groupQ.groupId, 'groupName': vm.groupQ.groupName};
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
		loadGroupUser: function (groupId) {
			$('#groupUserListCol').empty();
			$('#groupUserListCol').append('<select class="form-control" name="groupUserList" multiple="multiple" size="20" style="height: 200px"></select>');
			groupUserComponent = null;
			
			$.ajax({
			    url: "../aaGroup/candidateGroupUserList?groupId="+groupId,
			    success: function(rslt){
					if(rslt.code == 200){
						vm.candidateGroupUserList = rslt.candidateGroupUserList;
						$(vm.candidateGroupUserList).each(function () {
			                var option = document.createElement("option");
			                option.value = this['userId'];
			                option.text = this['userName'];
			                if (vm.group.userList) {
			                    $.each(vm.group.userList, function (i, user) {
			                        if (option.value == user.userId) {
			                        	option.selected = 'selected';
			                        	return;
			                        }
			                    });
			                }
			                $('select[name="groupUserList"]')[0].options.add(option);
			            });
			            //渲染dualListbox
						groupUserComponent = $('select[name="groupUserList"]').bootstrapDualListbox({
							nonSelectedListLabel: '<b><span class="text-warning">未选择</span></b>',
							selectedListLabel: '<b><span class="text-success">已选择</span></b>',
							preserveSelectionOnMove: 'moved',
							moveOnSelect: true,
						});
					}else{
						alert(rslt.msg);
					}
				}
			});
		},
		constructGroupTree: function() {
	    	$.get("../aaGroup/allData", function(r){//加载树
	    		ztreeGroup = $.fn.zTree.init($("#groupTree"), settingGroup, r.groupList);
	    		ztreeGroup.expandAll(true);//展开所有节点
				//勾选用户所拥有的组
				if(vm.group.parent){
					var nodeTmp = ztreeGroup.getNodeByParam("groupId", vm.group.parent.groupId);
					ztreeGroup.selectNode(nodeTmp, true, false);
				}
	    	});
	    },
	    popupGroupTree: function(){
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
						if(vm.group.groupId == nodes[i].groupId){
							alert("不能选择当前节点!");
							return;
						}
						vm.group.parent = nodeTmp;
					}
					layer.close(index);
	            },
				btn2: function (index) {
				    ztreeGroup.cancelSelectedNode();
					vm.group.parent = {};
	            }
			});
		},
	}
});