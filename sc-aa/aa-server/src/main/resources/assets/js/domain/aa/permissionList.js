$(function () {
    $("#jqGrid").jqGrid({
        url: "../aaPermission/pageData",
        datatype: "json",
        colModel: [
        	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
			{ label: '权限编号', name: 'permissionId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '权限名称', name: 'permissionName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '权限类型', name: 'type', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '访问地址', name: 'url', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
			{ label: '访问地址描述', name: 'urlDesc', width: 60, hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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
        	console.info(data);
            var queryList = data.page.records
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

   /* $.get("../sys/dict/getDictList?type=permission_type", function(r){
		if(r.code == 200){
			vm.permissionTypeDicts = r.dictList;
		}else{
			alert(r.msg);
		}
	});*/

	$(document).keypress(function(e) {
		// 回车键事件  
		if (e.which == 13) {
			vm.query();
		}
	});
});

var vm = new Vue({
	el:'#vue-app',
	data:{
		title: null,
		showList: true, //显示查询
		permissionQ: {}, //查询参数
		permission: {},
		permissionTypeDicts:[]//权限类型
	},
	methods: {
		query: function () {
			vm.reload();
		},
		add: function () {
			vm.title="新增";
			vm.showList = false;
			vm.permission = {isNewRecord:true, type:'MENU'};
			vm.popupDetail();
		},
		edit: function () {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			$.ajax({
			    url: "../aaPermission/detail/"+id,
			    success: function(rslt){
					if(rslt.code == 200){
						vm.permission = rslt.permission;
						vm.title="编辑";
						vm.showList = false;
						vm.popupDetail();
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
			    url: "../aaPermission/detail/"+id,
			    success: function(rslt){
					if(rslt.code == 200){
						vm.permission = rslt.permission;
						vm.title="克隆";
						vm.permission.id='';
						vm.permission.permissionId='';
						vm.permission.permissionName='';
						vm.permission.isNewRecord=true;
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
					var url = "../aaPermission/save";
					$.ajax({
						type: "POST",
					    url: url,
					    data: JSON.stringify(vm.permission),
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
				    url: "../aa/permission/delete/"+id,
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
				    url: "../aaPermission/purge/"+id,
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
			var postDataTmp = {'permissionName': vm.permissionQ.permissionName};
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
		}
	}
});