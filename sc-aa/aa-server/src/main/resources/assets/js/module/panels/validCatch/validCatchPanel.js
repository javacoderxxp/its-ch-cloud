define(function(require) {
	var htmlStr = require('text!./validCatchPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	var my97Datepicker = require('my97Datepicker');
	var vm = null;
	var classMap={};
	var jqueryFileuploadIframe = require('jqueryFileuploadIframe');
	var jqueryFileuploadUiW = require('jqueryFileuploadUiW');
	var jqueryFileupload = require('jqueryFileupload');
	var imageNum =0;
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#validCatch-panel',
			data: {
				showList: true, //显示查询
				validCatchQ: {type:'', module:'',groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')}, //查询参数
				validCatch: {type:'CL', module:'QT',groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')},
				groupList:[],
				plateTypeDicts:[],
				imgPaths:[],
				hPaths:[]
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.validCatchQ = {type:'', module:'',groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')};
				},
				add: function () {
					vm.title="新增";
					vm.showList = false;
					$("#imgDiv").show();
					vm.selectImage();
					vm.validCatch = {type:'CL', module:'QT',groupId: (currentUser.jjzdUser? currentUser.group.groupId :''), isNewRecord:true};
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
						url: "qw/validCatch/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = false;
								vm.validCatch = rslt.validCatch;
								if(vm.validCatch.panths){
									vm.hPaths=pingTaiPath(vm.validCatch.panths);
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
							if(vm.validCatch.type=='CL'){
								if(!vm.validCatch.catchHphm){
									alert("号牌号码不能为空");
									return;
								}
								if(!vm.validCatch.catchHpzl){
									alert("号牌种类不能为空");
									return;
								}
								re = /[\u4E00-\u9FA5]/g;
								if (re.test(vm.validCatch.catchHphm)){
									if (vm.validCatch.catchHphm.match(re).length > 1) { 
										alert("号牌号码格式错误");
										return;
									}
								}
							}else if(vm.validCatch.type=='JSY'){
								if(!vm.validCatch.catchJszh){
									alert("驾驶证号不能为空");
									return;
								}
								re = /[\u4E00-\u9FA5]/g;
								if (re.test(vm.validCatch.catchJszh)){
									if (vm.validCatch.catchJszh.match(re).length > 0) { 
										alert("驾驶证号格式错误");
										return;
									}
								}
								/*if(!vm.validCatch.catchXm){
									alert("驾驶人不能为空");
									return;
								}*/
							}
							
							var objs = document.getElementsByName("imgtt");             
							for(var i=0;i<objs.length;i++)  
							{  
								if(objs[i].src !="" && objs[i].src != null){
									vm.uploadImage(objs[i].src); 
								}
								
							}
							vm.validCatch.panths = vm.imgPaths.toString();
							
							var url = "qw/validCatch/save";
							$.ajax({
								type: "POST",
								url: url,
								data: JSON.stringify(vm.validCatch),
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
							url: "qw/validCatch/purge/"+id,
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
				init97Date: function(it){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', isShowClear: false, onpicked:function(){vm.validCatch.catchDate = $("#catchDate").val()}});
				},
				reload: function () {
					vm.showList = true;
					vm.imgPaths = [];
					$("#shizi").show();
					$("#image-list").empty();
					imageNum=0;
					$("#imgDiv").hide();
					$("#ptDiv").hide();
					loadJqGrid();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
				},
				imgOnclick: function(url) {
					imgShow("#outerdiv", "#innerdiv", "#bigimg", url);
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
			}
		});
		loadJqGrid();
		loadGroups();
		loadDicts();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "validCatchPanel的vue实例"
		});
	}

	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				if(currentUser.jjddUser){
					vm.groupList = r.groupList;
				}else if(currentUser.jjzdUser){
					vm.groupList.push(currentUser.group);
				}
				
			}else{
				alert(r.msg);
			}
		});
	}
	
	var loadDicts = function() {
	    $.get("sys/dict/getDictList?type=PLATE_TYPE", function(r){
			if(r.code == 200){
				vm.plateTypeDicts = r.dictList;
				classMap=forMap(r.dictList);
			}else{
				alert(r.msg);
			}
		});
	}
	
	var forMap = function(dList){
		var n = {};
		for(var i =0;i<dList.length;i++){
			n[dList[i].value]  = dList[i].label;
		}
		return n;
	}
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = vm.validCatchQ;
		$("#jqGrid").jqGrid({
			url: "qw/validCatch/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '类型', name: 'type', width: 60, sortable:false, formatter: function(value, options, row){
					return typeWord(value);}},
				{ label: '查获来源', name: 'module', width: 60, sortable:false, formatter: function(value, options, row){
					return moduleWord(value);}},
				{ label: '中队', name: 'groupName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '警员(辅)姓名', name: 'userId', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '驾驶证号', name: 'catchJszh', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '驾驶员姓名', name: 'catchXm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '号牌号码', name: 'catchHphm', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '号牌类型', name: 'catchHpzl', width: 60, sortable:false, formatter: function(value, options, row){
					return tw(value);}},
				{ label: '查获日期', name: 'catchDate', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
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
			loadComplete: function(data) {//数据查询完毕
				var queryList = data.page.list;
			},
			gridComplete:function(){
				//隐藏grid底部滚动条
				$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	        	require(['qwSchedule/initQwSchedule'],function(qwSchedule){
					qwSchedule.showValidCatch(rowData.id);
				});
	        	//vm.edit();
	        },
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
			}
		});
	};
	var tw=function(type){
		if(type){
			return classMap[type];
		}
		return "";
	}
	
	var typeWord = function(type){
		var word = "其他";
		switch (type) {
			case 'CL':
				word = "车辆";
				break;
			case 'JSY':
				word = "驾驶员";
				break;
			default:
				break;
		}
		return word;
	}
	
	var moduleWord = function(type){
		var word = "其他";
		switch (type) {
			case 'BKBJ':
				word = "布控告警";
				break;
			case 'FXBJ':
				word = "分析告警";
				break;
			case 'BJBK':
				word = "部局布控";
				break;
			case 'QT':
				word = "其他";
				break;
			default:
				break;
		}
		return word;
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
	
	function imgShow(outerdiv, innerdiv, bigimg, src){  
        //var src = _this.attr("src");//获取当前点击的pimg元素中的src属性  
        $(bigimg).attr("src", src);//设置#bigimg元素的src属性  
      
            /*获取当前点击图片的真实大小，并显示弹出层及大图*/  
        $("<img/>").attr("src", src).load(function(){  
            var windowW = $(window).width();//获取当前窗口宽度  
            var windowH = $(window).height();//获取当前窗口高度  
            var realWidth = this.width;//获取图片真实宽度  
            var realHeight = this.height;//获取图片真实高度  
            var imgWidth, imgHeight;  
            var scale = 0.8;//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放  
              
            if(realHeight>windowH*scale) {//判断图片高度  
                imgHeight = windowH*scale;//如大于窗口高度，图片高度进行缩放  
                imgWidth = imgHeight/realHeight*realWidth;//等比例缩放宽度  
                if(imgWidth>windowW*scale) {//如宽度扔大于窗口宽度  
                    imgWidth = windowW*scale;//再对宽度进行缩放  
                }  
            } else if(realWidth>windowW*scale) {//如图片高度合适，判断图片宽度  
                imgWidth = windowW*scale;//如大于窗口宽度，图片宽度进行缩放  
                            imgHeight = imgWidth/realWidth*realHeight;//等比例缩放高度  
            } else {//如果图片真实高度和宽度都符合要求，高宽不变  
                imgWidth = realWidth;  
                imgHeight = realHeight;  
            }  
                    $(bigimg).css("width",imgWidth);//以最终的宽度对图片缩放  
              
            var w = (windowW-imgWidth)/2;//计算图片与窗口左边距  
            var h = (windowH-imgHeight)/2;//计算图片与窗口上边距  
            $(innerdiv).css({"top":h, "left":w});//设置#innerdiv的top和left属性  
            $(outerdiv).fadeIn("fast");//淡入显示#outerdiv及.pimg  
        });  
          
        $(outerdiv).click(function(){//再次点击淡出消失弹出层  
            $(this).fadeOut("fast");  
        });  
    }
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})