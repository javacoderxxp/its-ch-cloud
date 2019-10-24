define(function(require) {
	var htmlStr = require('text!./hiddenDangerPanel.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('my97Datepicker');
	var jqueryFileuploadIframe = require('jqueryFileuploadIframe');
	var jqueryFileuploadUiW = require('jqueryFileuploadUiW');
	var jqueryFileupload = require('jqueryFileupload');
	var vm = null;
	var oldQ = '1';
	var mousetool = null;
	//var image = '';
	var imageNum =0;
	map.plugin(['IMAP.Tool'], function() {
		mousetool = new IMAP.MarkerTool(new IMAP.Icon(("./assets/images/yinhuan.png"), new IMAP.Size(32, 32)));
		mousetool.follow=true;
		mousetool.autoClose=true;
		mousetool.title="点击左键标注隐患点";
		map.addTool(mousetool);
	});
	var rhMarker;
	
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		vm = new Vue({
			el: '#hiddenDanger-panel',
			data: {
				showList: 0, //显示查询
				hiddenDangerQ: {source:'',status:'',groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')}, //查询参数
				hiddenDanger: {},
				selectedRow:{},
				StatusList:"",
				StatusMap:{1:"待确认",2:"上报大队",3:"上报设施主管部门",4:"重复上报",5:"无效上报",6:"有效",7:"无效",8:"退回中队 "},
				hPaths:[],
				imgPaths:[],
				repairUnits:[],
				unitNames:[],
				st:'',
				youtu:'',
				groupListQ:[],
				teamList:[],
				dutyGridList:[],
				facilitiesRepair: {results:1,priority:'',wxId:'',repairUnitId:'',type:''},
				dangerTypes:{1:"路面",2:"路灯",3:"绿化",4:"标线",5:"标志",6:"信号灯",7:"线缆",8:"其它",9:"违法"},
				isZdAdmin: $.inArray("zdadmin",currentUser.roleIdList) >= 0 
			},
			methods: {
				query: function () {
					vm.reload();
				},
				reset: function () {
					vm.hiddenDangerQ = {source:'',status:'',groupId: (currentUser.jjzdUser? currentUser.group.groupId :'')};
					map.getOverlayLayer().clear();
				},
				add: function () {
					$("#statusDiv").hide();
					vm.selectImage();
					vm.title="新增";
					vm.showList = 1;
					$("#imgDiv").show();
					vm.hiddenDanger = {isNewRecord:true,status:"1",dangerType:""};
				},
				detail: function () {
					//console.log(currentUser);
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$("#statusDiv").show();
					$("#submit").hide();
					$.ajax({
						url: "jtzx/hiddenDanger/detail/"+id,
						success: function(rslt){
							if(rslt.code == 200){
								vm.title="编辑";
								vm.showList = 1;
								vm.hiddenDanger = rslt.hiddenDanger;
								$("#inspectTime").val(vm.hiddenDanger.inspectTime);
								if(vm.hiddenDanger.status == 6 || vm.hiddenDanger.status == 7|| vm.hiddenDanger.status == 8){
									$("#zdDesc").show();
									$("#ddDesc").show();
									vm.StatusList=[{vl:vm.hiddenDanger.status,dt:vm.StatusMap[vm.hiddenDanger.status]}];
								}else{
									$("#zdDesc").show();
									vm.StatusList=[{vl:vm.hiddenDanger.status,dt:vm.StatusMap[vm.hiddenDanger.status]}];
								}
								if(vm.hiddenDanger.status == 3){
									$("#zgdw").show();
								}
								if(vm.hiddenDanger.bigDesc){
									$("#ddDesc").show();
								}
								vm.hPaths=[];
								if(vm.hiddenDanger.qwRelevanceId!= undefined && vm.hiddenDanger.qwRelevanceId !=''){
									getQwPhoto(vm.selectedRow.qwRelevanceId);
									$("#qwDiv").show();
								}else{
									vm.youtu="无图";
								}
								if(vm.hiddenDanger.wxId != undefined && vm.hiddenDanger.wxId !=''){
									vm.hPaths=polygonStr2Path(vm.hiddenDanger.panths);
									$("#wxDiv").show();
								}else{
									vm.youtu="无图";
								}
								if(vm.hiddenDanger.source == 1 && vm.hiddenDanger.panths != undefined &&vm.hiddenDanger.panths !=''){
									vm.hPaths=pingTaiPath(vm.hiddenDanger.panths);
									$("#ptDiv").show();
								}else{
									vm.youtu="无图";
								}
								$("#groupId").selectpicker('val', vm.hiddenDanger.groupId);
								vm.getDutyListByTeamId();
							}else{
								alert(rslt.msg);
							}
						}
					});
					//getAro(vm.selectedRow.position);
				},
				edit: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					$('#status').on('change',function(){
						//判断是否选取prompt属性，无返回值；
						    if($(this).val() == 3){
						    	$("#zgdw").show();
						    }else if($(this).val() == 6){
						    	$("#cjwxd").show();
						    	//$("#submit").hide();
						    }else{
						    	$("#zgdw").hide();
						    	$("#cjwxd").hide();
						    	$("#submit").show();
						    }
						});
					$("#statusDiv").show();
					vm.selectImage();
					if(vm.selectedRow.source == "警务通" && vm.selectedRow.status == vm.StatusMap[1]){
						vm.title="编辑";
						vm.showList = 1;
						vm.hiddenDanger = vm.selectedRow;
						vm.hiddenDanger.status="";
						vm.hiddenDanger.dangerType="";
						vm.hPaths=[];
						$("#inspectTime").val(vm.hiddenDanger.inspectTime);
						vm.StatusList=[{vl:2,dt:"上报大队"},{vl:3,dt:"上报设施主管部门"},{vl:4,dt:"重复上报"},{vl:5,dt:"无效上报"}];
						$("#zdDesc").show();
						//alert(vm.hiddenDanger.position);
						if(vm.selectedRow.panths="有"){
							$("#qwDiv").show();
							getQwPhoto(vm.selectedRow.id);
						}else{
							vm.youtu="无图";
						}
						$("#imgDiv").hide();
						if(!vm.hiddenDanger.groupId){
							vm.hiddenDanger.groupId = (currentUser.jjzdUser? currentUser.group.groupId :'');
						}
						$("#groupId").selectpicker('val',(currentUser.jjzdUser? currentUser.group.groupId :''));
						vm.getDutyListByTeamId();
					}else{
						$.ajax({
							url: "jtzx/hiddenDanger/detail/"+id,
							success: function(rslt){
								if(rslt.code == 200){
									vm.title="编辑";
									vm.showList = 1;
									vm.hiddenDanger = rslt.hiddenDanger;
									$("#inspectTime").val(vm.hiddenDanger.inspectTime);
									vm.hPaths=[];
									//$("#imgDiv").show();
									if(vm.hiddenDanger.status == 1 || vm.hiddenDanger.status == 8){
										$("#zdDesc").show();
										if(vm.hiddenDanger.status == 8){
											$("#ddDesc").show();
											$("#bigDesc").attr("readOnly","true");
										}
										vm.StatusList=[{vl:2,dt:"上报大队"},{vl:3,dt:"上报设施主管部门"},{vl:4,dt:"重复上报"},{vl:5,dt:"无效上报"}];
									}else if(vm.hiddenDanger.status == 2){
										$("#ddDesc").show();
										$("#zdDesc").show();
										$("#mediumDesc").attr("readOnly","true");
										vm.StatusList=[{vl:6,dt:"有效"},{vl:7,dt:"无效"},{vl:8,dt:"退回中队 "}];
									}else{
										vm.StatusList=[{vl:vm.hiddenDanger.status,dt:vm.StatusMap[vm.hiddenDanger.status]}];
									}
									vm.hiddenDanger.status="";
									if(vm.hiddenDanger.wxId != undefined && vm.hiddenDanger.wxId !=''){
										vm.hPaths=polygonStr2Path(vm.hiddenDanger.panths);
										$("#wxDiv").show();
										$("#imgDiv").hide();
									}else{
										vm.youtu="无图";
									}
									
									if(vm.hiddenDanger.source == 1 && vm.hiddenDanger.panths != undefined &&vm.hiddenDanger.panths !=''){
										vm.hPaths=pingTaiPath(vm.hiddenDanger.panths);
										$("#ptDiv").show();
									}else{
										vm.youtu="无图";
									}
									
									if(vm.hiddenDanger.qwRelevanceId!= undefined && vm.hiddenDanger.qwRelevanceId !=''){
										getQwPhoto(vm.selectedRow.qwRelevanceId);
										$("#qwDiv").show();
									}else{
										vm.youtu="无图";
									}
									if(!vm.hiddenDanger.groupId){
										vm.hiddenDanger.groupId = (currentUser.jjzdUser? currentUser.group.groupId :'');
									}
									$("#groupId").selectpicker('val', vm.hiddenDanger.groupId);
									vm.getDutyListByTeamId();
								}else{
									alert(rslt.msg);
								}
							}
						});
					}
					//getAro(vm.selectedRow.position);
				},
				save: function (ine) {
					//表单验证
					$("#detailForm").validate({
						invalidHandler : function(){//验证失败的回调
							return false;
						},
						submitHandler : function(){//验证通过的回调
							if(!vm.hiddenDanger.groupId || vm.hiddenDanger.groupId == ''){
								alert('中队不能为空');
								return;
							}
							if(vm.hiddenDanger.status ==6 && ine==1){
								vm.cjwxd();
							}else{
								vm.tjiao();
								return false;//已经用AJAX提交了，需要阻止表单提交
							}
						}
					});
				},
				tjiao: function (){
					var rId = vm.selectedRow.id;
					var stext = vm.selectedRow.source
					vm.hiddenDanger.source=1;
					var objs = document.getElementsByName("imgtt");             
					for(var i=0;i<objs.length;i++)  
					{  
						if(objs[i].src !="" && objs[i].src != null){
							vm.uploadImage(objs[i].src); 
						}
						
					}
					vm.hiddenDanger.panths = vm.imgPaths.toString();
					
					if(stext == "警务通" && vm.st == vm.StatusMap[1]){
						vm.hiddenDanger.id="";
						vm.hiddenDanger.source=2;
						if(vm.selectedRow.panths="有"){
							vm.hiddenDanger.panths ='有';
						}else{
							vm.hiddenDanger.panths ='无';
						}
						
					}
					if(vm.hiddenDanger.status== undefined){
						vm.hiddenDanger.status=1;
					}
					vm.hiddenDanger.inspectTime=$("#inspectTime").val();
					
					vm.hiddenDanger.gridId=$("#gridId").val();
					var url = "jtzx/hiddenDanger/save";
					$.ajax({
						type: "POST",
						url: url,
						data: JSON.stringify(vm.hiddenDanger),
						success: function(rslt){
							if(rslt.code == 200){
								if(stext == "警务通" && vm.st == vm.StatusMap[1]){
									$.ajax({
										url: "qw/repairmentInfo/relevanceQw?repairNum="+rId+"&id="+''+"&qwType="+''+"&qwRelevanceFlag="+"2",
										success: function(rstl){
										}
									});
								}
								alert('操作成功', function(index){
									layer.closeAll();
									vm.reload();
								});
							}else{
								alert(rslt.msg);
							}
						}
					});
				},
				cjwxd: function (){
					vm.facilitiesRepair.position = vm.hiddenDanger.priority;
					vm.facilitiesRepair.content = vm.hiddenDanger.content;
					vm.facilitiesRepair.title = vm.hiddenDanger.content;
					$("#startDtfr").val(TUtils.formatDateTime(new Date()));
					layer.open({
						type: 1,
						skin: 'layui-layer',
						title: ["创建维修工单"],
						area: ['690px', '455px'],
						shade: false,
						content: jQuery("#facilitiesRepairDetail"),
						btn: []
					});
					getUnit("");
					$("select#typefr").change(function(){
						getUnit(vm.facilitiesRepair.type);
					});
					
					$("select#repairUnitId").change(function(){
						getRepair();
					});
				},
				frSave: function (){
					$("#frForm").validate({
				        invalidHandler : function(){//验证失败的回调
				        	return false;
				        },
				        submitHandler : function(){//验证通过的回调
				        	
							var url = "./jtss/facilitiesRepair/save";
							vm.facilitiesRepair.startDt=$("#startDtfr").val();
							vm.facilitiesRepair.endDt=$("#endDtfr").val();
							var repairName = $("#wxId").find("option:selected").text().trim();
							vm.facilitiesRepair.repairName = repairName;
							var unitNames = $("#repairUnitId").find("option:selected").text().trim();
							vm.facilitiesRepair.repairUnit = unitNames;
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(vm.facilitiesRepair),
							    success: function(rslt){
							    	if(rslt.code === 200){
							    		vm.tjiao();
									}else{
										alert(rslt.msg);
									}
								}
							});
				            return false;//已经用AJAX提交了，需要阻止表单提交
				        }
					});
				},
				showOneRhPost: function (rhPost) {
					vm.clearRhPost();
					
					var markerOpts = new IMAP.MarkerOptions();
					markerOpts.icon = new IMAP.Icon("./assets/images/yinhuan.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
		    		var lngLat = TUtils.str2Lnglat(rhPost.position);
					rhMarker = new IMAP.Marker(lngLat, markerOpts);
					rhMarker.data = rhPost;
		        	map.getOverlayLayer().addOverlay(rhMarker, false);
		    		map.setCenter(lngLat);
				},
				purge: function () {
					var id = TUtils.getSelectedRow();
					if(id == null){
						return ;
					}
					confirm('确定删除？', function(){
						$.ajax({
							type: "POST",
							url: "jtzx/hiddenDanger/purge/"+id,
							success: function(rslt){
								if(rslt.code == 200){
									alert('操作成功', function(index){
										var postDataTmp = vm.hiddenDangerQ;
										var postData = $('#jqGrid').jqGrid("getGridParam", "postData");
										$.each(postData, function (k, v) {  
											delete postData[k];
										});
										var page = $('#jqGrid').getGridParam('page');
										if(!page){
											page = 1;
										}
										$("#jqGrid").jqGrid('setGridParam',{ 
											postData: postDataTmp,
											page:page
										}).trigger("reloadGrid");
									});
								}else{
									alert(rslt.msg);
								}
							}
						});
					});
				},
				addRhPost: function () {
					vm.clearRhPost();
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						rhMarker = evt.overlay;
						vm.hiddenDanger.position = TUtils.lnglat2Str(evt.overlay.getPosition());
						$("#position").val(vm.hiddenDanger.position);
						mousetool.close();

						//getAro(vm.hiddenDanger.position);
					},this);
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
				clearRhPost: function(){
					if(rhMarker){
						map.getOverlayLayer().removeOverlay(rhMarker);
					}
					rhMarker = null; 
					vm.hiddenDanger.position='';
					$("#position").val("");
					vm.hiddenDanger.gridId = "";
					vm.hiddenDanger.gridIdName = "";
					$("#gridIdName").val("");
					vm.hiddenDanger.groupId = "";
					vm.hiddenDanger.groupIdName = "";
					$("#groupIdName").val("");
				},
				reload: function () {
					$("#cjwxd").hide();
					$("#submit").show();
					vm.selectedRow={};
					//$("#gDiv").show();
					//$("#statusDiv").hide();
					vm.showList = 0;
					vm.youtu='';
					vm.imgPaths = [];
					$("#tjlb").show();
					$("#tjdiv").show();
					$("#wubao").hide();
					$("#qwDiv").hide();
					$("#wxDiv").hide();
					$("#ptDiv").hide();
					$("#shizi").show();
					$("#imgDiv").hide();
					$("#image-list").empty();
					$("#zdDesc").hide();
					$("#ddDesc").hide();
					$("#bigDesc").attr("readOnly",false);
					$("#mediumDesc").attr("readOnly",false);
					$("#zgdw").hide();
					imageNum=0;
					$("#status").attr("disabled", false);
					$("#inspectTime").val('');
					if(TUtils.cmp(vm.hiddenDangerQ,oldQ)){
						var postDataTmp = vm.hiddenDangerQ;
						oldQ = JSON.parse(JSON.stringify(vm.hiddenDangerQ));
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
					}else{
						loadJqGrid();
					}
				},
				imgOnclick: function(url) {
					imgShow("#outerdiv", "#innerdiv", "#bigimg", url);
				},
				getDutyListByTeamId: function() {
					var gid=vm.hiddenDanger.gridId;
					$.get("./qw/dutyGrid/getDutyAreaByGroupId?teamId="+vm.hiddenDanger.groupId, function(r){
						if(r.code == 200){
							vm.dutyGridList = r.dutyGridList;
							var refreshGridId = setInterval(function(){
								$('#gridId').selectpicker('refresh');
								var a = $('#gridId option').text();
								var arr = $('#ze_ren_qu div li a');
								if(arr.length <=1){
									clearInterval(refreshGridId);
									$("#gridId").selectpicker('val', gid);
								}else{
									var b = arr[1].innerText;
									if(!b){
										clearInterval(refreshGridId);
										return;
									}
									if(a.indexOf(b)>=0){
										clearInterval(refreshGridId);
										$("#gridId").selectpicker('val', gid);
									}
								}
							}, 10);
						}else{
							alert(r.msg);
						}
					});
				},
				close: function() {
					vm.reset();
					map.setCenter(new IMAP.LngLat(121.128187, 31.464808),14);
					itsGlobal.hideLeftPanel();
				}
			}
		});
		oldQ=1;
		loadJqGrid();
		loadGroups();
		vueEureka.set("leftPanel", {
			vue: vm,
			description: "hiddenDangerPanel的vue实例"
		});
	}
	
	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				//if(currentUser.jjddUser){
				vm.teamList = r.groupList;
				vm.groupListQ =  r.groupList;
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
					$('#groupId').selectpicker({
						noneSelectedText:'请选择',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
					$('#gridId').selectpicker({
						noneSelectedText:'请选择',
						liveSearch: true,
						style: 'btn-default',
						size: 7
					});
				});
			}else{
				alert(r.msg);
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
	
	var loadJqGrid = function() {
		$("#jqGrid").jqGrid('GridUnload');
		var postDataTmp = vm.hiddenDangerQ;
		oldQ = JSON.parse(JSON.stringify(vm.hiddenDangerQ));
		$("#jqGrid").jqGrid({
			url: "jtzx/hiddenDanger/pageData",
			datatype: "json",
			postData: postDataTmp,
			colModel: [
				{ label: 'id', name: 'id', width: 5, key: true, hidden:true },
				{ label: '位置', name: 'position', width: 60, hidden:true, sortable:false},
				{ label: 'qwId', name: 'qwRelevanceId', width: 60, hidden:true, sortable:false},
				{ label: '隐患描述', name: 'content', width: 105, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				{ label: '位置描述', name: 'priority', width: 105, sortable:false},
				{ label: '排查时间', name: 'inspectTime', width: 100, hidden:true,sortable:false},
				{ label: '更新时间', name: 'updateDt', width: 100, sortable:false},
				{ label: '隐患类型', name: 'dangerType', width: 35, sortable:false, formatter: function(value, options, row){
					return dangerWord(value);}},
				{ label: '隐患来源', name: 'source', width: 50, sortable:false, formatter: function(value, options, row){
					return type2word(value);}},
				{ label: '警号', name: 'policeNo', width: 50, sortable:false},
				{ label: '图片', name: 'panths', width: 35, sortable:false, formatter: function(value, options, row){
					return isPaths(value);}},
				{ label: '所属中队', name: 'groupIdName', width: 70, sortable:false/*, formatter: function(value, options, row){return value;}*/},
				
				{ label: '状态', name: 'status', width: 60, sortable:false, formatter: function(value, options, row){
					return vm.StatusMap[value];}},
			],
			viewrecords: true,
			height: 290,
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
			},
			gridComplete:function(){
				//隐藏grid底部滚动条
				$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
			},
	        ondblClickRow: function(rowid){
	        	var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	        	vm.selectedRow = rowData;
	        	if(rowData.source == "警务通" && rowData.status == vm.StatusMap[1] ){
	        		if(vm.isZdAdmin || currentUser.jjddUser){
        				vm.edit();
        				$("#submit").show();
        			}else{
        				$("#status").attr("disabled", true);
        				$("#imgDiv").hide();
        				vm.detail();
        			}
	        	}else{
	        		if(rowData.status == vm.StatusMap[1] || rowData.status == vm.StatusMap[2] 
	        		|| rowData.status == vm.StatusMap[8]){
	        			if(vm.isZdAdmin || currentUser.jjddUser){
	        				vm.edit();
	        				$("#submit").show();
	        			}else{
	        				$("#status").attr("disabled", true);
	        				$("#imgDiv").hide();
	        				vm.detail();
	        			}
	        			
	        		}else{
	        			$("#status").attr("disabled", true);
	        			$("#imgDiv").hide();
	        			vm.detail();
	        		}
	        	}
	        	
	        },
			onSelectRow: function(rowid){//选中某行
				var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
				vm.selectedRow = rowData;
				vm.st=vm.selectedRow.status;
				vm.showOneRhPost(rowData);
			}
		});
	};
	
	
	var type2word = function(type){
		var word = "其他";
		switch (type) {
			case 1:
				word = "平台";
				break;
			case 2:
				word = "警务通";
				break;
			case 3:
				word = "微信";
				break;
			default:
				break;
		}
		return word;
	}
	var dangerWord = function(type){
		var t =parseInt(type);
		var word = "其他";
		switch (t) {
			case 1:
				word = "路面";
				break;
			case 2:
				word = "路灯";
				break;
			case 3:
				word = "绿化";
				break;
			case 4:
				word = "标线";
				break;
			case 5:
				word = "标志";
				break;
			case 6:
				word = "信号灯";
				break;
			case 7:
				word = "线缆";
				break;
			case 8:
				word = "其他";
				break;
			case 9:
				word = "违法";
				break;	
			case 0:
				word = "";
				break;
			default:
				break;
		}
		return word;
	}
	
	var isPaths = function(path){
		var word = "有";
		if(path == "" || path == null|| path == 0){
			word = "无";
		}
		return word;
	}
	
/*	var forMap = function(dList){
		var n = {};
		for(var i =0;i<dList.length;i++){
			n[dList[i].value]  = dList[i].label;
		}
		return n;
	}*/
	
	var getQwPhoto = function(repairNum){
    	var slideCnt;
    	var picCnt;
    	$.ajax({
    	    url: "qw/repairmentInfo/getNumber?repairNum="+repairNum,
    	    async: false,
    	    success: function(rstl){
    			if(rstl.code == 200){
    				picCnt = rstl.picNum;
    			}
    		}
    	});
    	
    	var itemCnt = 4;
    	if(null != picCnt){
    		itemCnt = picCnt < itemCnt?picCnt:itemCnt;
    		slideCnt = picCnt%itemCnt==0?picCnt/itemCnt:(Number(picCnt)+Number(itemCnt)-picCnt%itemCnt)/itemCnt;
    	}
    	for(var i = 0; i<slideCnt;i++){
    		var url = '';
    		for(var j = i*itemCnt; j<itemCnt*(i+1);j++){
    			url = 'qw/repairmentInfo/getPicById?repairNum='+repairNum+'&seq='+(j+1)+"&random="+new Date().getTime();
    			vm.hPaths.push(url);
    		}
    	}
	}
	
	function getAro(position){
		var rurl = "./qw/oftenJam/getRegion?shape="+position;
		$.ajax({
    	    url: rurl,
    	    success: function(rslt){
    	    	if(rslt.code == 200){
    				if(rslt.dutyGrid == null || rslt.dutyGrid == ""){
    					if(vm.selectedRow.source == "警务通" && vm.st == vm.StatusMap[1]){
    						
    					}else{
    						vm.clearRhPost();
    					}
    					alert("点位附件没有责任区，请重新选择点位!");
    				}else{
    					vm.hiddenDanger.gridId = rslt.dutyGrid.gridId;
    					vm.hiddenDanger.gridIdName = rslt.dutyGrid.gridName;
    					$("#gridIdName").val(rslt.dutyGrid.gridName);
    					
    					vm.hiddenDanger.groupId = rslt.dutyGrid.group.groupId;
    					vm.hiddenDanger.groupIdName = rslt.dutyGrid.group.groupName;
    					$("#groupIdName").val(rslt.dutyGrid.group.groupName);
    				}
    			}else{
    				alert(rslt.msg);
    			}
    		}
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
	
	function polygonStr2Path(polygonStr) {
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
			lngLatArray.push(lnglatStr);
		}
		return lngLatArray;
	}
	
	var getUnit = function(fIds){
		$.get("./jtss/repairUnit/allData?type="+fIds, function(r){
	    	if(r.code == 200){
	    		vm.unitNames = r.repairUnitList;
	    	}else{
	    		alert(r.msg);
	    	}
	    });
	}
	
	var getRepair = function(){
		vm.repairUnits=[];
		var repairUnitId = vm.facilitiesRepair.repairUnitId;
		if(repairUnitId !="" && repairUnitId !=undefined){
			$.get("./jtss/repairUnit/detail/"+repairUnitId, function(r){
				if(r.code == 200){
					
					if(r.repairUnit.repairMan1 !=undefined && r.repairUnit.repairMan1 != ""){
						vm.repairUnits.push(strs(r.repairUnit.repairMan1));
					}
					if(r.repairUnit.repairMan2 !=undefined && r.repairUnit.repairMan2 != ""){
						vm.repairUnits.push(strs(r.repairUnit.repairMan2));
					}
					if(r.repairUnit.repairMan3 !=undefined && r.repairUnit.repairMan3 != ""){
						vm.repairUnits.push(strs(r.repairUnit.repairMan3));
					}
				}else{
					alert(r.msg);
				}
			});
		}else{
			vm.repairUnits=[];
		}
	}
	
	var strs = function(arr) {
		var ru={};
		var lArr = arr.split(",");
		ru.name = lArr[0];
		ru.wxId = lArr[1];
		return ru;
	}
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	return {
		show: show,
		hide: hide
	};
})