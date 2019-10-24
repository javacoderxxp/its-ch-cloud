define(function(require) {
	var htmlStr = require('text!./quickRepair.html');
	var Vue = require('vue');
	var map = require('mainMap');
	//equire('datetimepicker');
	require('my97Datepicker');
	var imageNum =0;
	var oldQ =1;
	var jqueryFileuploadIframe = require('jqueryFileuploadIframe');
	var jqueryFileuploadUiW = require('jqueryFileuploadUiW');
	var jqueryFileupload = require('jqueryFileupload');
	var queryResPolygons = []; //查询后绘制至地图的施工区域集合
	//在地图中添加MouseTool插件
	var opts = new IMAP.MarkerOptions();
	opts.anchor = IMAP.Constants.BOTTOM_CENTER;
	var icon_d = new IMAP.Icon("./assets/images/chuang.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var icon_w = new IMAP.Icon("./assets/images/wan.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	
	var rName = "";
	var fIds = "";
	
	var facilitiesRepairApp = null;
	
	var show = function(shape,isShow) {
		itsGlobal.showLeftPanel(htmlStr);
		
		facilitiesRepairApp = new Vue({
			el: '#facilitiesRepair-panel',
			data: {
				facilitiesRepairQ: {results:'',typeId:'',wxId:'',repairUnitId:'',timeType:'1',createBy: (currentUser.jjzdUser? currentUser.group.groupId :'')}, //查询参数
				facilitiesRepair: {results:1,priority:'',wxId:'',repairUnitId:'',type:''},
				newGridPolygon:null,
				repairUnits:[],
				unitNames:[],
				repairUnitsQ:[],
				unitNamesQ:[],
				wxID:"",
				rId:"",
				imgPaths:[],
				oFilePaths:[],
				nFilePaths:[],
				ptPaths:[],
				fileName:"",
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0,
				isXtgl: $.inArray("xtgl",currentUser.roleIdList) >= 0,
				groupList:[]
			},
			methods: {
				query: function () {
					facilitiesRepairApp.reload();
				},
				reset: function () {
					queryResPolygons = [];
				},
				add: function () {
					$("#divDesc").hide();
					$("#imgDiv").show();
					facilitiesRepairApp.facilitiesRepair = {isNewRecord:true};
				},
				editState: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$.ajax({
					    url: "./jtss/facilitiesRepair/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								
								facilitiesRepairApp.facilitiesRepair = rslt.facilitiesRepair;
								facilitiesRepairApp.wxID=rslt.facilitiesRepair.wxId;
								if(facilitiesRepairApp.facilitiesRepair.results==3 ||facilitiesRepairApp.facilitiesRepair.results==4 ){
									alert("该工单状态不容许更改！");
									return ;
								}else{
									layer.open({
										type: 1,
										skin: 'layui-layer',
										title: ["更改工单状态"],
										area: ['480px', '220px'],
										shade: false,
										content: jQuery("#postAlarmTaskDiv"),
										btn: []
									});
								}
							}else{
								alert(rslt.msg);
							}
						}
					});
					
					
					
				},
				saveState: function () {
					var stateRepairResults = $("#stateRepairResults").val();
					var stateRepairDescText = $("#stateRepairDescText").val();
					if(!stateRepairResults){
						alert("请选择状态！");
						return ;
					}
					if(!stateRepairDescText){
						alert("请填写备注！");
						return ;
					}
					facilitiesRepairApp.facilitiesRepair.results=stateRepairResults;
					facilitiesRepairApp.facilitiesRepair.resultDesc=stateRepairDescText;
					facilitiesRepairApp.facilitiesRepair.wxId=facilitiesRepairApp.wxID;
					var url = "./jtss/facilitiesRepair/save";
					$.ajax({
						type: "POST",
					    url: url,
					    data: JSON.stringify(facilitiesRepairApp.facilitiesRepair),
					    success: function(rslt){
					    	if(rslt.code === 200){
								alert('操作成功', function(index){
									$("#stateRepairResults").val("");
									$("#stateRepairDescText").val("");
									facilitiesRepairApp.reload();
									layer.closeAll();
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
		            return false;//已经用AJAX提交了，需要阻止表单提交
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$("#imgDiv").hide();
					$("#liEdit").show();
					$("#liEdit").addClass("active");
					$("#editB").show();
					
					$("#liQuery").hide();
					$("#liDetail").hide();
					$("#facilitiesRepairQuery").removeClass("tab-pane fade in active");
					$("#facilitiesRepairQuery").addClass("tab-pane fade");
					$("#facilitiesRepairDetail").removeClass("tab-pane fade");
					$("#facilitiesRepairDetail").addClass("tab-pane fade in active");
					$.ajax({
					    url: "./jtss/facilitiesRepair/detail/"+id,
					    success: function(rslt){
							if(rslt.code == 200){
								
								facilitiesRepairApp.facilitiesRepair = rslt.facilitiesRepair;
								$("#startDt").val(facilitiesRepairApp.facilitiesRepair.startDt);
								$("#endDt").val(facilitiesRepairApp.facilitiesRepair.endDt);
								$("#finishDt").val(facilitiesRepairApp.facilitiesRepair.finishDt);
								facilitiesRepairApp.wxID = facilitiesRepairApp.facilitiesRepair.wxId;
								facilitiesRepairApp.rId = facilitiesRepairApp.facilitiesRepair.repairUnitId;
								getUnit(facilitiesRepairApp.facilitiesRepair.type);
								getRepair();
								if(facilitiesRepairApp.facilitiesRepair.ptFilePaths !=null && facilitiesRepairApp.facilitiesRepair.ptFilePaths !=""
									&& facilitiesRepairApp.facilitiesRepair.ptFilePaths != undefined){
									facilitiesRepairApp.ptPaths = [];
									facilitiesRepairApp.ptPaths = pingTaiPath(facilitiesRepairApp.facilitiesRepair.ptFilePaths);
									$("#ptDiv").show();
								}
								if(facilitiesRepairApp.facilitiesRepair.oldFilePaths !=null && facilitiesRepairApp.facilitiesRepair.oldFilePaths !=""
									&& facilitiesRepairApp.facilitiesRepair.oldFilePaths != undefined){
									facilitiesRepairApp.oFilePaths = [];
									facilitiesRepairApp.oFilePaths = polygonStr2Path("oldImage",facilitiesRepairApp.facilitiesRepair.oldFilePaths);
									$("#oldDiv").show();
								}
								if(facilitiesRepairApp.facilitiesRepair.newFilePaths !=null && facilitiesRepairApp.facilitiesRepair.newFilePaths !=""
									&& facilitiesRepairApp.facilitiesRepair.newFilePaths != undefined){
									facilitiesRepairApp.nFilePaths = [];
									facilitiesRepairApp.nFilePaths = polygonStr2Path("newImage",facilitiesRepairApp.facilitiesRepair.newFilePaths);
									$("#newDiv").show();
								}
								if(facilitiesRepairApp.facilitiesRepair.results!=1){
									$("#sButton").hide();
								}
								/*if(facilitiesRepairApp.facilitiesRepair.results!=3 && facilitiesRepairApp.facilitiesRepair.results!=4){
									$("#divDesc").hide();
								}else{*/
								$("#divDesc").show();
								if(facilitiesRepairApp.facilitiesRepair.results==3 ||facilitiesRepairApp.facilitiesRepair.results==4 ){
									$("#yyButton").show();
									$("#tsyy").show();
								}
								var pos = facilitiesRepairApp.facilitiesRepair.createPoint.split(",");
								map.setCenter(new IMAP.LngLat(pos[0], pos[1]),16);
							}else{
								alert(rslt.msg);
							}
						}
					});
					
				},
				quote: function (){
					$("#sButton").show();
					$("#yyButton").hide();
					$("#tsyy").hide();
					$("#startDt").val(TUtils.formatDateTime(new Date()));
					$("#finishDt").val("");
					$("#endDt").val("");
					facilitiesRepairApp.facilitiesRepair.repairUnitId ="";
					facilitiesRepairApp.facilitiesRepair.wxId ="";
					facilitiesRepairApp.facilitiesRepair.id ="";
					facilitiesRepairApp.facilitiesRepair.results =1;
					facilitiesRepairApp.facilitiesRepair.arriveDt ="";
					facilitiesRepairApp.facilitiesRepair.receiveDt ="";
					facilitiesRepairApp.facilitiesRepair.finishDt ="";
					$("divDesc").hide();
					$("#oldDiv").hide();
					$("#newDiv").hide();
					//$("#imgDiv").show();
				},
				isQure: function (){
					document.getElementById("aQuery").click();
					var ul=document.getElementById('myTab');
					var li=document.getElementById('liDetail');
					ul.removeChild(li);
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
						url: './jtss/facilitiesRepair/pingTaiPhoto', 
						data: JSON.stringify(image),
						async: false,
						success: function(rslt){
							if(rslt.code == 200){
								if(rslt.filePath !=  null && rslt.filePath != ""){
									facilitiesRepairApp.imgPaths.push(rslt.filePath);
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
				save: function () {
					//表单验证
				    $("#detailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
				        	if(facilitiesRepairApp.facilitiesRepair.facilitiesId){
				        		var reg = /([\u4E00-\u9FA5]|[A-Za-z])+/;//只要包含中文或者字母就提示
				                if(reg.test(facilitiesRepairApp.facilitiesRepair.facilitiesId)){
				                	facilitiesRepairApp.facilitiesRepair.facilitiesId='';
				                	alert("不能输入中文或者字母");
				                    return false;
				                }
				        	}
				        	layer.load();
				        	var objs = document.getElementsByName("imgtt");             
							for(var i=0;i<objs.length;i++)  
							{  
								if(objs[i].src !="" && objs[i].src != null){
									facilitiesRepairApp.uploadImage(objs[i].src); 
								}
								
							}
							if(facilitiesRepairApp.facilitiesRepair.ptFilePaths !=null && facilitiesRepairApp.facilitiesRepair.ptFilePaths !=""
								&& facilitiesRepairApp.facilitiesRepair.ptFilePaths != undefined){
							}else{
								facilitiesRepairApp.facilitiesRepair.ptFilePaths=facilitiesRepairApp.imgPaths.toString();
							}
							
							var url = "./jtss/facilitiesRepair/save";
							facilitiesRepairApp.facilitiesRepair.startDt=$("#startDt").val();
							facilitiesRepairApp.facilitiesRepair.endDt=$("#endDt").val();
							facilitiesRepairApp.facilitiesRepair.finishDt=$("#finishDt").val();
							var repairName = $("#wxId").find("option:selected").text().trim();
							facilitiesRepairApp.facilitiesRepair.repairName = repairName;
							var unitNames = $("#repairUnitId").find("option:selected").text().trim();
							facilitiesRepairApp.facilitiesRepair.repairUnit = unitNames;
							if(!facilitiesRepairApp.facilitiesRepair.createPoint){
								facilitiesRepairApp.facilitiesRepair.createPoint = shape.lng+","+shape.lat;
							}
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(facilitiesRepairApp.facilitiesRepair),
							    success: function(rslt){
							    	if(rslt.code === 200){
							    		layer.closeAll('loading');
										alert('操作成功', function(index){
											facilitiesRepairApp.reload();
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
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定清除？', function(){
						$.ajax({
							type: "POST",
						    url: "./jtss/facilitiesRepair/purge/"+id,
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
				reload: function () {
					$("#divDesc").hide();
					$("#oldDiv").hide();
					$("#newDiv").hide();
					$("#ptDiv").hide();
					facilitiesRepairApp.repairUnits=[];
					$("#liDetail").removeClass("active");
					$("#liQuery").addClass("active");
					$("#liEdit").hide();
					$("#editB").hide();
					$("#liQuery").show();
					$("#liDetail").show();
					$("#facilitiesRepairDetail").removeClass("tab-pane fade in active");
					$("#facilitiesRepairDetail").addClass("tab-pane fade");
					$("#facilitiesRepairQuery").removeClass("tab-pane fade");
					$("#facilitiesRepairQuery").addClass("tab-pane fade in active");
					facilitiesRepairApp.facilitiesRepair ={results:1,priority:'',type:"",wxId:'',repairUnitId:''};
					$("#startDt").val(TUtils.formatDateTime(new Date()));
					$("#endDt").val("");
					$("#finishDt").val("");
					$("#sButton").show();
					$("#yyButton").hide();
					$("#tsyy").hide();
					facilitiesRepairApp.rId = "";
					facilitiesRepairApp.reset();
					facilitiesRepairApp.imgPaths = [];
					imageNum=0;
					$("#shizi").show();
					$("#imgDiv").hide();
					$("#image-list").empty();
					
					facilitiesRepairApp.facilitiesRepairQ.startTime=$("#startTime").val();
					facilitiesRepairApp.facilitiesRepairQ.endDTime=$("#endTime").val();
					if(TUtils.cmp(facilitiesRepairApp.facilitiesRepairQ,oldQ)){
						var postDataTmp = facilitiesRepairApp.facilitiesRepairQ;
						oldQ = JSON.parse(JSON.stringify(facilitiesRepairApp.facilitiesRepairQ));
						var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
						$.each(postData, function (k, v) {  
							delete postData[k];
						});
						//var page = $("#jqGrid").jqGrid('getGridParam','page');
						var page = $('#jqGrid').getGridParam('page');
						if(!page){
							page = 1;
						}
						$("#jqGrid").jqGrid('setGridParam',{ 
							postData: postDataTmp,
							page:page
						}).trigger("reloadGrid");
						showAll();
					}else{
						loadJqGrid();
					}
					
					map.getOverlayLayer().clear();
				},
				close: function() {
					itsGlobal.hideLeftPanel();
					map.getOverlayLayer().clear();
				},
				exportExcel: function () {
					var url = "./jtss/facilitiesRepair/exportExcel";
					$.ajax({
						type: "POST",
						url: url,
					    data: JSON.stringify(facilitiesRepairApp.facilitiesRepairQ),
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功,请下载文件', function(index){
									facilitiesRepairApp.fileName = rslt.fileName;
									facilitiesRepairApp.query();
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				downloadExcel: function () {
					var url = "./jtzt/zdqy/downloadExcel?fileName="+encodeURIComponent(facilitiesRepairApp.fileName);
					var wWidth = document.body.clientWidth/2 ;  
					var wHeight =document.body.clientHeight/2;  
					window.open(url,'newwindow','height=20,width=20,top='+wHeight+',left='+wWidth+',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no') ;  
				}
			}
		});
		$("#startTime").val(TUtils.formatDateTime000(TUtils.addDate(new Date(),-30)));
		$("#endTime").val(TUtils.formatDate(new Date())+" 23:59:59");
		loadGroups();
		oldQ = 1;
		getUnit("");
		getUnitQ("");
		if(isShow == 1){
			facilitiesRepairApp.isQure();
			loadJqGrid();
		}else{
			$("#imgDiv").show();
			facilitiesRepairApp.selectImage();
			document.getElementById("addQuery").onclick = function(){
				$("#imgDiv").show();
				$("#startDt").val(TUtils.formatDateTime(new Date()));
			};
		}
		
		if(shape !=null && shape !="" &&  shape !=undefined){
			toGeocoder(shape);
		}
		
		$("#startDt").val(TUtils.formatDateTime(new Date()));
		
		$("select#type").change(function(){
			getUnit(facilitiesRepairApp.facilitiesRepair.type);
		});
		
		$("select#repairUnitId").change(function(){
			getRepair();
		});
		
		$("select#typeId").change(function(){
			getUnitQ(facilitiesRepairApp.facilitiesRepairQ.typeId);
		});
		
		$("select#repairUnitIdQ").change(function(){
			getRepairQ();
		});
		
		vueEureka.set("leftPanel", {
			vue: facilitiesRepairApp,
			description: "facilitiesRepair的vue实例"
		});
	};
	
	var loadJqGrid = function() {
		facilitiesRepairApp.facilitiesRepairQ.startTime=$("#startTime").val();
		facilitiesRepairApp.facilitiesRepairQ.endDTime=$("#endTime").val();
		oldQ = JSON.parse(JSON.stringify(facilitiesRepairApp.facilitiesRepairQ));
		$('#jqGrid').jqGrid('GridUnload');
	    $("#jqGrid").jqGrid({
	    	 url: "./jtss/facilitiesRepair/pageData",
	         datatype: "json",
	         postData: facilitiesRepairApp.facilitiesRepairQ,
	         colModel: [
	         	{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
	 			{ label: '设施编号', name: 'facilitiesId', width: 60,hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
	 			{ label: '结束时间', name: 'endDt', width: 60,hidden:true, sortable:false/*, formatter: function(value, options, row){return value;}*/},
	 			{ label: '创建时间', name: 'createDt', width: 90, sortable:false/*, formatter: function(value, options, row){return value;}*/},
	 			{ label: '设备类型', name: 'type', width: 60, sortable:false, formatter: function(value, options, row){return type2word(value);}},
	 			{ label: '标题', name: 'title', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
	 			{ label: '问题描述或原因', name: 'content', width: 100, sortable:false/*, formatter: function(value, options, row){return value;}*/},
	 			{ label: '维修者', name: 'repairName', width: 60, sortable:false/*, formatter: function(value, options, row){return value;}*/},
	 			{ label: '点位', name: 'createPoint', hidden:true , sortable:false/*, formatter: function(value, options, row){return value;}*/},
	 			{ label: '优先级', name: 'priority', width: 30, sortable:false, formatter: function(value, options, row){return priorityword(value);}},
	 			{ label: '维护结果', name: 'results', width: 60, sortable:false, formatter: function(value, options, row){return resultsword(value);}},
	         ],
			viewrecords: true,
	        height: 260,
	        rowNum: 10,
			rowList : [10,30,50],
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
	            //layer.msg("加载完毕");
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	var ids = $("#jqGrid").getDataIDs();
	        	for(var i = 0;i<ids.length;i++){
	        		var rowData = $("#jqGrid").getRowData(ids[i]);
	        		if(rowData.results != "已维护" && rowData.results != "无需维护"){
	        			var yourtime=rowData.endDt;  
	        			yourtime = yourtime.replace(/-/g,"/");//替换字符，变成标准格式  
	        			var d2=new Date();//取今天的日期  
	        			var d1 = new Date(Date.parse(yourtime));  
	        			if(d1<d2){  //今天时间大于结束  红色字体显示
	        				$('#' + rowData.id).find("td").addClass("SelectRed");
	        			}  
	        		}
	        	}
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        ondblClickRow: function(rowid, iRow, iCol, e){
	        	facilitiesRepairApp.edit();
	        },
	        onSelectRow: function(rowid, status){//选中某行
	    		var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	    		var pos = rowData.createPoint.split(",");
	    		map.setCenter(new IMAP.LngLat(pos[0], pos[1]),16);
				//facilitiesRepairApp.showOnefacilitiesRepair(rowData);
	    		
	    	}
	    });
	    
	    showAll();
	    
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	};
	
	function showAll(){
		//在地图上显示全部的工单位置
	    $.ajax({
	    	url: "./jtss/facilitiesRepair/allData",
	    	data:facilitiesRepairApp.facilitiesRepairQ,
	    	type:"GET",
		    success:function(dat,textStatus){
		        if(dat.code == 200){
		        	map.getOverlayLayer().clear();
		        	var queryList = dat.facilitiesRepairList;
		        	for (var ind = 0; ind < queryList.length; ind++) {
						var oneData = queryList[ind];
						if(oneData.createPoint){
							var pos = oneData.createPoint.split(",");
							var point = new IMAP.Marker(new  IMAP.LngLat(pos[0],pos[1]), opts);
				    		if(oneData.results==3 || oneData.results==4 ){
				    			point.setIcon(icon_w);
				    		}else{
				    			point.setIcon(icon_d);
				    		}
							map.getOverlayLayer().addOverlay(point, false);
							point.setTitle(oneData.title);
						}
					}
		        }
		    },
		    error:function(xhr){
		    	layer.msg("查询失败！");
		    }
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
	
	var getRepair = function(){
		facilitiesRepairApp.repairUnits=[];
		var repairUnitId = facilitiesRepairApp.facilitiesRepair.repairUnitId;
		if(repairUnitId !="" && repairUnitId !=undefined){
			$.get("./jtss/repairUnit/detail/"+repairUnitId, function(r){
				if(r.code == 200){
					
					if(r.repairUnit.repairMan1 !=undefined && r.repairUnit.repairMan1 != ""){
						facilitiesRepairApp.repairUnits.push(strs(r.repairUnit.repairMan1));
					}
					if(r.repairUnit.repairMan2 !=undefined && r.repairUnit.repairMan2 != ""){
						facilitiesRepairApp.repairUnits.push(strs(r.repairUnit.repairMan2));
					}
					if(r.repairUnit.repairMan3 !=undefined && r.repairUnit.repairMan3 != ""){
						facilitiesRepairApp.repairUnits.push(strs(r.repairUnit.repairMan3));
					}
					facilitiesRepairApp.facilitiesRepair.wxId = facilitiesRepairApp.wxID;
					$('#wxId').val(facilitiesRepairApp.wxID);
				}else{
					alert(r.msg);
				}
			});
		}else{
			facilitiesRepairApp.repairUnits=[];
		}
	}
	
	var getRepairQ = function(){
		facilitiesRepairApp.repairUnitsQ=[];
		var repairUnitId = facilitiesRepairApp.facilitiesRepairQ.repairUnitId;
		if(repairUnitId !="" && repairUnitId !=undefined){
			$.get("./jtss/repairUnit/detail/"+repairUnitId, function(r){
				if(r.code == 200){
					
					if(r.repairUnit.repairMan1 !=undefined && r.repairUnit.repairMan1 != ""){
						facilitiesRepairApp.repairUnitsQ.push(strs(r.repairUnit.repairMan1));
					}
					if(r.repairUnit.repairMan2 !=undefined && r.repairUnit.repairMan2 != ""){
						facilitiesRepairApp.repairUnitsQ.push(strs(r.repairUnit.repairMan2));
					}
					if(r.repairUnit.repairMan3 !=undefined && r.repairUnit.repairMan3 != ""){
						facilitiesRepairApp.repairUnitsQ.push(strs(r.repairUnit.repairMan3));
					}
				}else{
					alert(r.msg);
				}
			});
		}else{
			facilitiesRepairApp.repairUnitsQ=[];
		}
	}
	
	var strs = function(arr) {
		var ru={};
		var lArr = arr.split(",");
		ru.name = lArr[0];
		ru.wxId = lArr[1];
		return ru;
	}
	
	var getUnit = function(fIds){
		$.get("./jtss/repairUnit/allData?type="+fIds, function(r){
	    	if(r.code == 200){
	    		facilitiesRepairApp.unitNames = r.repairUnitList;
	    		if(facilitiesRepairApp.rId != ""){
	    			facilitiesRepairApp.facilitiesRepair.repairUnitId = facilitiesRepairApp.rId;
		    		$('#repairUnitId').val(facilitiesRepairApp.facilitiesRepair.repairUnitId);
	    		}
	    		
	    	}else{
	    		alert(r.msg);
	    	}
	    });
	}
	
	var getUnitQ = function(fIds){
		$.get("./jtss/repairUnit/allData?type="+fIds, function(r){
	    	if(r.code == 200){
	    		facilitiesRepairApp.unitNamesQ = r.repairUnitList;
	    	}else{
	    		alert(r.msg);
	    	}
	    });
	}
	
	var type2word = function(type){
		var word = "其他";
		switch (type) {
			case 1:
				word = "信号机";
				break;
			case 2:
				word = "监控设备";
				break;
			case 3:
				word = "诱导屏";
				break;
			case 4:
				word = "交通标志";
				break;
			case 6:
				word = "卡口电警";
				break;
			default:
				break;
		}
		return word;
	}
	
	var resultsword = function(type){
		var word = "其他";
		switch (type) {
			case 1:
				word = "待维护";
				break;
			case 2:
				word = "维护中";
				break;
			case 3:
				word = "已维护";
				break;
			case 4:
				word = "无需维护";
				break;
			default:
				break;
		}
		return word;
	}
	
	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				facilitiesRepairApp.groupList =r.groupList;
			}else{
				alert(r.msg);
			}
		});
	};
	
	function polygonStr2Path(ni,polygonStr) {
		var lngLatArray= [];
		polygonStr= polygonStr.trim();
		var polygonArr = polygonStr.split(",");
		for (var i = 0; i < polygonArr.length; i++) {
			var lnglatStr = polygonArr[i];
			lngLatArray.push("http://192.168.14.4:81/filestorage/permanent/weixin/"+lnglatStr);
		}
		return lngLatArray;
	}
	
	function pingTaiPath(polygonStr) {
		var lngLatArray= [];
		polygonStr= polygonStr.trim();
		var polygonArr = polygonStr.split(",");
		for (var i = 0; i < polygonArr.length; i++) {
			var lnglatStr = polygonArr[i];
			lngLatArray.push("http://192.168.14.4:81/filestorage/permanent/weixin/"+lnglatStr);
		}
		return lngLatArray;
	}
	
	var priorityword = function(type){
		var word = "其他";
		switch (type) {
			case 1:
				word = "高";
				break;
			case 2:
				word = "中";
				break;
			case 3:
				word = "低";
				break;
			default:
				break;
		}
		return word;
	}
	
	//地理编码
	function toGeocoder(shape){
		//var pos = shape;
		map.plugin(['IMAP.Geocoder'], function(){
			var geocoder=new IMAP.Geocoder({city:"太仓市", pois:true});
			geocoder.getAddress(shape,function(status, result) {
	            if (status == 0) {
	            	var plnglat=result.result;
	            	$("#position").val(plnglat[0].formatted_address);
	            	facilitiesRepairApp.facilitiesRepair.position = plnglat[0].formatted_address;
	            }
	        });
		});
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
		show : show,
		hide : hide
	};
})