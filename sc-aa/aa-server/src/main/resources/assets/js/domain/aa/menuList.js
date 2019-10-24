$(function () {
    $("#jqGrid").jqGrid({
        url: "../aaMenu/pageData",
        datatype: "json",
        colModel: [
        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
			{ label: '菜单编号', name: 'menuId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '菜单名称', name: 'menuName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '父菜单', name: 'parent.menuName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '菜单事件', name: 'href', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '菜单图标', name: 'icon', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '排序', name: 'sort', width: 60, sortable:true/*, formatter: function(value, options, row){return value;}*/},
			{ label: '可见性', name: 'active', width: 60, sortable:true, formatter: function(value, options, row){return value=='1'?'是':'否';}},
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
            var queryList = data.page.records;
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
			vm.query(true);
		}
	});
});

var ztreeMenu;
var settingMenu = {
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
	}
};

var vm = new Vue({
	el:'#vue-app',
	data:{
		title: null,
		showList: true, //显示查询
		menuQ: {}, //查询参数
		menu: {parent:{}},
	},
	methods: {
		query: function () {
			vm.reload();
		},
		add: function () {
			vm.title="新增";
			vm.showList = false;
			vm.menu = {isNewRecord:true, parent:{}, active:'1'};
			vm.getMenuTree();
		},
		edit: function () {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			$.ajax({
			    url: "../aaMenu/detail/"+id,
			    success: function(rslt){
					if(rslt.code == 200){
						vm.title="编辑";
						vm.showList = false;
						if(!rslt.menu.parent){
							rslt.menu.parent={};
						}
						vm.menu = rslt.menu;
						vm.getMenuTree();
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
			    url: "../aaMenu/detail/"+id,
			    success: function(rslt){
					if(rslt.code == 200){
						vm.title="克隆";
						vm.showList = false;
						if(!rslt.menu.parent){
							rslt.menu.parent={};
						}
						vm.menu = rslt.menu;
						vm.menu.id='';
						vm.menu.isNewRecord=true;
						vm.getMenuTree();
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
					var url = "../aaMenu/save";
					vm.menu.parentId = vm.menu.parent.menuId;
					console.info(vm.menu);
					$.ajax({
						type: "POST",
					    url: url,
					    data: JSON.stringify(vm.menu),
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
				    url: "../aaMenu/delete/"+id,
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
				    url: "../aaMenu/purge/"+id,
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
			var postDataTmp = {'menuName': vm.menuQ.menuName,'sort': vm.menuQ.sort,'active': vm.menuQ.active};
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
		getMenuTree: function() {
	    	$.get("../aaMenu/allData", function(r){//加载树
	    		console.info(r);
	    		ztreeMenu = $.fn.zTree.init($("#menuTree"), settingMenu, r.menuList);
	    		ztreeMenu.expandAll(true);//展开所有节点
				//勾选用户所拥有的组
				if(vm.menu.parent){
					var nodeTmp = ztreeMenu.getNodeByParam("menuId", vm.menu.parent.menuId);
					ztreeMenu.selectNode(nodeTmp, true, false);
				}
	    	});
	    },
	    menuTreeSelect: function(){
			layer.open({
				type: 1,
				offset: '50px',
				skin: 'layui-layer-rim',
				title: "选择组",
				area: ['300px', '450px'],
				shade: 0,
				shadeClose: false,
				content: jQuery("#menuLayer"),
				btn: ['确定', '清除', '取消'],
				btn1: function (index) {
				    var nodes = ztreeMenu.getSelectedNodes();
					for(var i=0; i< nodes.length; i++) {
						var nodeTmp = {'menuId': nodes[i].menuId, 'menuName': nodes[i].menuName};
						if(vm.menu.menuId == nodes[i].menuId){
							alert("不能选择当前节点!");
							return;
						}
						vm.menu.parent = nodeTmp;
					}
					layer.close(index);
	            },
				btn2: function (index) {
				    ztreeMenu.cancelSelectedNode();
					vm.menu.parent = {};
	            }
			});
		},
	}
});