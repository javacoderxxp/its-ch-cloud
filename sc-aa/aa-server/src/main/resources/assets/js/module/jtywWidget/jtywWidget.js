define(function(require) {
	var jtywWidgetHtml = require('text!./jtywWidget.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('zTree');

	function JtywWidget() { //
		this._init();
	}
	
	JtywWidget.prototype._init =  function(){
		$("#jtywWidgetPanel").html(jtywWidgetHtml);
		var jtywWidgetApp = new Vue({
			el: '#jtywWidget-app',
			data: {
				selectedNodes:null,
			},
			methods: {
				popupGroupUserTree: function() {
					layer.open({
						type: 1,
						offset: '50px',
						skin: 'layui-layer-rim',
						title: "组织列表",
						area: ['300px', '450px'],
						shade: 0,
						shadeClose: false,
						content: jQuery("#groupUserLayer"),
						btn: ['确定', '取消'],
						btn1: function (index) {
							var nodes = ztreeGroup.getSelectedNodes();
							jtywWidgetApp.selectedNodes  = nodes;
							layer.close(index);
			            }
					});
				}
			}
		});
		initDrag();
		constructGroupUserTree();
	}
	
	function initDrag() {
		var div1 = document.getElementById("jtywWidgetPanel");
		　　div1.onmousedown = function(ev){
		　　　　var oevent = ev || event;
		　　　　var distanceX = oevent.clientX - div1.offsetLeft;
		　　　　var distanceY = oevent.clientY - div1.offsetTop;

		　　　　document.onmousemove = function(ev){
		　　　　　　var oevent = ev || event;
		　　　　　　div1.style.left = oevent.clientX - distanceX + 'px';
		　　　　　　div1.style.top = oevent.clientY - distanceY + 'px'; 
		　　　　};
		
		　　　　document.onmouseup = function(){
		　　　　　　document.onmousemove = null;
		　　　　　　document.onmouseup = null;
		　　　　};
		}
	}

	function constructGroupUserTree() {
		$.get("aa/group/groupUserTree", function(r) {// 加载树
			ztreeGroup = $.fn.zTree.init($("#groupUserTree"), {
				data : {
					simpleData : {
						enable : true,
						idKey : "id",
						pIdKey : "pId",
						rootPId : -1
					},
					key : {
						url : "nourl",
						name : "name"
					}
				}
			}, r.treeNodeList);
			ztreeGroup.expandAll(false);// 展开所有节点
		});
	}
	
	return JtywWidget;
})
