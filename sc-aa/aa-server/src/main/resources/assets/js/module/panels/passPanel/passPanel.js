define(function(require) {
	var htmlStr = require('text!./passPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var vm = null;
	var imageNum =0;
	require('my97Datepicker');
	var jqueryFileuploadIframe = require('jqueryFileuploadIframe');
	var jqueryFileuploadUiW = require('jqueryFileuploadUiW');
	var jqueryFileupload = require('jqueryFileupload');
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#pass-panel',
			data: {
				showList: true, //显示查询
				passQ: {}, //查询参数
				pass: {hpzl:"",isdanger:"",status:""},
				imgPaths : [],
				hPaths:[],
				youtu:""
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.passQ = {};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					$("#imgDiv").show();
					vm.pass = {isNewRecord:true,hpzl:"",isdanger:"",status:"1"};
					vm.selectImage();
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$("#statusDiv").show();
					$.ajax({
						url: "provisional/pass/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								
								vm.pass = rslt.pass;
								if(vm.pass.status != "1"){
									alert("只能审批状态为待审批的数据!");
									return ;
								}
								vm.title="编辑";
								vm.showList = false;
								$("#sqrq").val(vm.pass.sqrq);
								vm.pass.status="";
								if(vm.pass.picPath != undefined &&vm.pass.picPath !=''){
									vm.hPaths=pingTaiPath(vm.pass.picPath);
									$("#ptDiv").show();
								}else{
									vm.youtu="无图";
								}
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
							var objs = document.getElementsByName("imgtt");             
							for(var i=0;i<objs.length;i++)  
							{  
								if(objs[i].src !="" && objs[i].src != null){
									vm.uploadImage(objs[i].src); 
								}
								
							}
							if(vm.pass.status==""||vm.pass.status==undefined){
								vm.pass.status=1;
							}
							vm.pass.picPath = vm.imgPaths.toString();
							vm.pass.sqrq = $("#sqrq").val();
							var url = "provisional/pass/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.pass),
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
							url: "provisional/pass/purge/"+id,
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
				openFileUpload: function(id) {
					//alert(1);
					document.getElementById("fileupload").click(); 
				},
				selectImage: function(){

					$('#fileupload').fileupload({
						change : function(e, file) {
							if(!file.files || !file.files[0]){
								 return;
							 }
							if(file.files[0].type != "image/jpeg" && file.files[0].type != "image/png" && file.files[0].type != "image/git"){
								 alert("图片类型错误，请重新选择!");
								 return;
							 }
							 var reader = new FileReader();
							 reader.onload = function(evt){
								 addElementImg(file.files[0].name,evt.target.result);
							 }
							 reader.readAsDataURL(file.files[0]);
							
						}
				    })
				},
				uploadImage: function(image){
					$.ajax({
						type:'POST',
						url: 'jtzx/hiddenDanger/getPhotoPath', 
						data: JSON.stringify(image),
						async: false,
						success: function(rslt){
							if(rslt.code == 200){
								if(rslt.filePath !=  null && rslt.filePath != ""){
									vm.imgPaths.push(rslt.filePath);
								}/*else{
									alert("上传图片失败!");
								}*/
							}else{
								alert(rslt.msg);
							}
						},
						error: function(err){
							alert('网络故障');
						   } 
						});
				},
				imgOnclick: function(url) {
					imgShow("#outerdiv", "#innerdiv", "#bigimg", url);
				},
				reload: function () {
					vm.showList = true;
					loadJqGrid();
					imageNum=0;
					vm.imgPaths = [];
					$("#imgDiv").hide();
					$("#image-list").empty();
					$("#sqrq").val("");
					$("#statusDiv").hide();
					vm.hPaths = [];
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				}
			}
		});
		loadJqGrid();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "passPanel的vue实例"
		});
	}
	
	function addElementImg(name,imgUrl) {
		imageNum++;
		var div = document.createElement("div");
		div.setAttribute("id", "div"+imageNum);
		div.setAttribute("width", "88px");
		div.setAttribute("height", "88px");
		div.setAttribute("class", "onediv");
	　　　//添加 img
	　　　var img = document.createElement("img");
	 
	　　　//设置 img 属性
		img.setAttribute("name", "imgtt");
	 	img.setAttribute("style", "margin-left: 25px;"); 
	 	img.setAttribute("width", "88px");
	 	img.setAttribute("height", "88px");
	　　　//设置 img 图片地址
	　　　img.src = imgUrl;
	　　　div.appendChild(img);
	
	　	var imgclose = document.createElement("img");
	　	//imgclose.setAttribute("id", "close");
	　	imgclose.setAttribute("class", "twodiv");
	　	imgclose.setAttribute("width", "12px");
	　	imgclose.setAttribute("height", "12px");
	　	imgclose.setAttribute("data-name", "div"+imageNum);
	　	imgclose.src = "./assets/images/iclose.png";
	　	
	　	div.appendChild(imgclose);
	　	
	　	var divs =document.getElementById("image-list");
	　	divs.appendChild(div);
	　	
	　	var dv_num = 0; 
	    $(".onediv").each(function(){
	       dv_num +=1; 
	    })
	    if(dv_num ==3 ){
			$("#shizi").hide();
		}
	    
	　	$(".twodiv").bind("click",function(e){
	　		var data = $(this).data("name");
	　		
	　　　　   	$("#"+data).remove();
	　　　　   	var dv_num = 0; 
		    $(".onediv").each(function(){
			    dv_num +=1;
			           
			   })
		    if(dv_num ==2 ){
				   $("#shizi").show();
		    } 
	　	})
	}
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = {czxm:vm.passQ.czxm};
		$("#jqGrid").jqGrid({
			url: "provisional/pass/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '车牌号', name: 'hphm', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '姓名', name: 'czxm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '驾驶证号', name: 'jszhm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '车辆类型', name: 'hpzl', width: 60, sortable:false, formatter: function(value, options, row){return  hpzlword(value);}},
				{ label: '申请通行日期', name: 'sqrq', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '手机号码', name: 'sjhm', width: 80, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '状态', name: 'status', width: 60, sortable:false, formatter: function(value, options, row){return statusword(value);}},
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
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
			}
		});
	};
	
	var statusword = function(type){
		var word = "待审批";
		switch (type) {
			case '1':
				word = "待审批";
				break;
			case '2':
				word = "已通过";
				break;
			case '3':
				word = "已拒绝";
				break;
			case '4':
				word = "已取消";
				break;
			default:
				break;
		}
		return word;
	}
	
	function pingTaiPath(polygonStr) {
		var lngLatArray= [];
		polygonStr= polygonStr.trim();
		var polygonArr = polygonStr.split(",");
		for (var i = 0; i < polygonArr.length; i++) {
			var lnglatStr = polygonArr[i];
			lngLatArray.push(lnglatStr);
		}
		return lngLatArray;
	}
	
	var hpzlword = function(type){
		var word = "其他";
		switch (type) {
			case '1':
				word = "小型车";
				break;
			case '2':
				word = "大型车";
				break;
			case '3':
				word = "挂车";
				break;
			default:
				break;
		}
		return word;
	}
	
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})