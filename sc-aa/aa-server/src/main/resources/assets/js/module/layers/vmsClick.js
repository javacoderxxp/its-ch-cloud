define(function(require) {
	var htmlStr = require('text!./vmsCtrlHtml/vmsCtrl.html');
	var Vue = require('vue');
	//在地图中添加MouseTool插件
	var vmsId=null;
	var vmsApp = null;
	
	var show = function(vitem) {
		itsGlobal.showLeftPanel(htmlStr);
		vmsApp = new Vue({
			el: '#vms-app',
			data: {
				title: null,
	    		vms:{},
	    		programList:[],
	    		addNewContent:false,
	    		pword:"",
	    		programId:"",
	    		programItemList:[],
	    		newBtn:true,
	    		editWordContent:false,
	    		editPicContent:false,
	    		programItemWord:{},
	    		programItemPic:{},
	    		editWordProgramItem:{},
	    		editPicProgramItem:{},
	    		editPicUrl:"",
	    		addProgramForm:false,
	    		picTypeFlag0:false,
	    		picTypeFlag1:false,
	    		ratioPicType:"0",
	    		showBtn:true
			},
			methods: {
				loadData:function(){
					vmsApp.title = vitem.vmsName;
					$.ajax({
						url: "vms/getProgramByVmsId?vmsId="+vmsApp.vms.vmsId,
						async :false,
						success: function(rslt){
							if(rslt.code == 200){
								vmsApp.programList = rslt.programList;
								if(null != vmsApp.programList && vmsApp.programList.length >= 1){
									vmsApp.showBtn = false;
								}
								if(null != vmsApp.programList && vmsApp.programList.length > 0)
								vmsApp.programId = vmsApp.programList[0].id;
							}
						}
					});
					$.ajax({
						url: "vms/getProgramItemByProgramId?programId="+vmsApp.programId,
						async :false,
						success: function(rslt){
							if(rslt.code == 200){
								vmsApp.programItemList = rslt.programItemList;
							}
						}
					});
				},
			    
				fileChange: function(e){
					vmsApp.ratioPicType=$('input:radio[name="picType"]:checked').val();
					/*var file = document.getElementById("uploadPicBtn");
					var isIE = navigator.userAgent.match(/MSIE/)!= null;
					var isIE6 = navigator.userAgent.match(/MSIE 6.0/)!= null;
					var pic = document.getElementById("preview");
					if(isIE) {
				        file.select();
				        var reallocalpath = document.selection.createRange().text;
				        // IE6浏览器设置img的src为本地路径可以直接显示图片
				         if (isIE6) {
				            pic.src = reallocalpath;
				         }else {
				            // 非IE6版本的IE由于安全问题直接设置img的src无法显示本地图片，但是可以通过滤镜来实现
				             pic.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + reallocalpath + "\")";
				             // 设置img的src为base64编码的透明图片 取消显示浏览器默认图片
				             pic.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
				         }
				     } else {
				    	 this.html5Reader(file,pic);
				     }*/
					
			       // this.addInput();
				},
				uploadFileChange: function(e){
					vmsApp.ratioPicType=$('input:radio[name="picType"]:checked').val();
					/*var file = document.getElementById("editUploadPicBtn");
					var isIE = navigator.userAgent.match(/MSIE/)!= null;
					var isIE6 = navigator.userAgent.match(/MSIE 6.0/)!= null;
					var pic = document.getElementById("updatePreview");
					if(isIE) {
				        file.select();
				        var reallocalpath = document.selection.createRange().text;
				        // IE6浏览器设置img的src为本地路径可以直接显示图片
				         if (isIE6) {
				            pic.src = reallocalpath;
				         }else {
				             // 非IE6版本的IE由于安全问题直接设置img的src无法显示本地图片，但是可以通过滤镜来实现
				             pic.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + reallocalpath + "\")";
				             // 设置img的src为base64编码的透明图片 取消显示浏览器默认图片
				             pic.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
				         }
				     } else {
				    	 this.html5Reader(file,pic);
				     }*/
					
			       // this.addInput();
				},
				html5Reader:function(file,pic){
				     var file = file.files[0];
				     var reader = new FileReader();
				     reader.readAsDataURL(file);
				     reader.onload = function(e){
				         pic.src=this.result;
				     }
				 },
				clickToAddNewCont:function(){
					this.addNewContent = !this.addNewContent;
					this.newBtn = false;
				},
				addProgram:function(){
					this.newBtn=false;
					this.addProgramForm=true;
					vmsApp.editPicContent=false;
					vmsApp.editWordContent=false;
					vmsApp.addNewContent=false;
				},
				saveProgram:function(){
					 //表单验证
	    		    $("#programForm").validate({
	    		        invalidHandler : function(){//验证失败的回调
	    		            return false;
	    		        },
	    		        submitHandler : function(){//验证通过的回调
	    					var url  = encodeURI("vms/saveProgram?vmsId="+vmsApp.vms.vmsId+"&programName="+$('#programName').val());
	    					$.ajax({
	    						type: "POST",
	    					    url: url,
	    					    async :false,
	    					    success: function(rslt){
	    					    	if(rslt.code === 200){
	        							alert('操作成功');
	        							$.ajax({
	        									url: "vms/getProgramByVmsId?vmsId="+vmsApp.vms.vmsId+"&random="+new Date().getTime(),
	        									async :false,
	        									success: function(rslt){
	        										if(rslt.code == 200){
	        											vmsApp.programList = rslt.programList;
	        											if(null != vmsApp.programList && vmsApp.programList.length >= 1){
	        												vmsApp.showBtn = false;
	        											}
	        											/*if(null != vmsApp.programList && vmsApp.programList.length >0)
	        											vmsApp.programId = vmsApp.programList[0].id;*/
	        										}
	        									}
	        								});
	        							 vmsApp.cancelItem();
	    							}else{
	    								alert(rslt.msg);
	    							}
	    						}
	    					});
	    		            return false;//已经用AJAX提交了，需要阻止表单提交
	    		        }
	    			});
	    		   
				},
				addWord:function(){
					//表单验证
	    		    $("#addWordForm").validate({
	    		        invalidHandler : function(){//验证失败的回调
	    		            return false;
	    		        },
	    		        submitHandler : function(){//验证通过的回调
	    		        	var data = "programId="+$('#programSelectedId').val()+"&fontSize="+vmsApp.programItemWord.fontSize+"&fontColor="+vmsApp.programItemWord.fontColor
	    		        	+"&inStyle="+vmsApp.programItemWord.inStyle+"&time="+vmsApp.programItemWord.time+"&content="+vmsApp.programItemWord.content+"&sequence="
	    		        	+vmsApp.programItemWord.sequence+"&nAlignment="+vmsApp.programItemWord.nAlignment;;
	    					var url = encodeURI("vms/saveProgramItem?"+data);
	    		        	$.ajax({
	    						type: "POST",
	    					    url: url,
	    					    data: data,
	    					    dataType: "json",
	    						async :false,
	    					    success: function(result){
	    							if(result.code == 200){
	    								alert('操作成功');
	    								$.ajax({
	    									url: "vms/getProgramItemByProgramId?programId="+$('#programSelectedId').val(),
	    									async :false,
	    									 dataType: "json",
	    									success: function(rslt){
	    										if(rslt.code == 200){
	    											vmsApp.programItemList = rslt.programItemList;
	    										}
	    									}
	    								});
	    							}else{
	    							}
	    						}
	    					});
	    		            return false;//已经用AJAX提交了，需要阻止表单提交
	    		        }
	    			});
				},
				updateWordItem:function(){
					//表单验证
	    		    $("#editWordForm").validate({
	    		        invalidHandler : function(){//验证失败的回调
	    		            return false;
	    		        },
	    		        submitHandler : function(){//验证通过的回调
	    		        	var data = "id="+vmsApp.editWordProgramItem.id+"&fontSize="+vmsApp.editWordProgramItem.fontSize+"&fontColor="+vmsApp.editWordProgramItem.fontColor
	    		        	+"&inStyle="+vmsApp.editWordProgramItem.inStyle+"&time="+vmsApp.editWordProgramItem.time+"&content="+vmsApp.editWordProgramItem.content
	    		        	+"&sequence="+vmsApp.editWordProgramItem.sequence+"&nAlignment="+vmsApp.editWordProgramItem.nAlignment;
	    					var url = encodeURI("vms/updateProgramItem?"+data);
	    		        	$.ajax({
	    						type: "POST",
	    					    url: url,
	    					    data: data,
	    					    dataType: "json",
	    						async :false,
	    					    success: function(result){
	    							if(result.code == 200){
	    								alert('操作成功');
	    								$.ajax({
	    									url: "vms/getProgramItemByProgramId?programId="+$('#programSelectedId').val(),
	    									async :false,
	    									 dataType: "json",
	    									success: function(rslt){
	    										if(rslt.code == 200){
	    											vmsApp.programItemList = rslt.programItemList;
	    										}
	    									}
	    								});
	    							}else{
	    							}
	    						}
	    					});
	    		            return false;//已经用AJAX提交了，需要阻止表单提交
	    		        }
	    			});
				},
				updatePicItem:function(){
					//表单验证
	    		    $("#editUploadForm").validate({
	    		        invalidHandler : function(){//验证失败的回调
	    		            return false;
	    		        },
	    		        submitHandler : function(){//验证通过的回调
	    		        	$('#editItemId').val(vmsApp.editPicProgramItem.id);
	    		        	$('#editPicProgramId').val($('#programSelectedId').val());
	    		        	var options = {
	    		        			type:'POST',
	    		        			url:'vms/updatePicItem',
	    		        			dataType:'json',
	    		        			async :false,
	    		        			success: function(rslt){
	    		        					alert('操作成功');
	    		        					if(rslt.code == 200){
	    		        						vmsApp.editPicProgramItem = rslt.programItem;
	    		        						if(vmsApp.editPicProgramItem.picType == "0"){
	    											vmsApp.editPicProgramItem.picTypeFlag0 = true;
	    											vmsApp.editPicProgramItem.picTypeFlag1 = false;
	    										}else{
	    											vmsApp.editPicProgramItem.picTypeFlag0 = false;
	    											vmsApp.editPicProgramItem.picTypeFlag1 = true;
	    										}
												vmsApp.editPicUrl = "vms/IoReadImage?itemId="+vmsApp.editPicProgramItem.id+"&random="+new Date().getTime();
			  									vmsApp.programItemList = rslt.programItemList;
			  									$('#updatePreview').removeAttr("style");
			  									vmsApp.reloadFile();
			  								}
	    							},error:function(){
	    									alert("保存错误，请联系系统管理员");
	    							}
	    		        	};
	    		        	$("#editUploadForm").ajaxSubmit(options);
	    		            return false;//已经用AJAX提交了，需要阻止表单提交
	    		        }
	    			});
				},
				reloadFile:function(){ //重置file,防止file change无效
					var file = document.getElementById("editUploadPicBtn");
					if(null!=file) {
						file.outerHTML = file.outerHTML;
					}
						$("#editUploadPicBtn").change(function(){
							vmsApp.ratioPicType=$('input:radio[name="picType"]:checked').val();
							var file = document.getElementById("editUploadPicBtn");
							var isIE = navigator.userAgent.match(/MSIE/)!= null;
							var isIE6 = navigator.userAgent.match(/MSIE 6.0/)!= null;
							var pic = document.getElementById("updatePreview");
							if(isIE) {
						        file.select();
						        var reallocalpath = document.selection.createRange().text;
						 
						        // IE6浏览器设置img的src为本地路径可以直接显示图片
						         if (isIE6) {
						            pic.src = reallocalpath;
						         }else {
						            // 非IE6版本的IE由于安全问题直接设置img的src无法显示本地图片，但是可以通过滤镜来实现
						             pic.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + reallocalpath + "\")";
						             // 设置img的src为base64编码的透明图片 取消显示浏览器默认图片
						             pic.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
						         }
						     } else {
						    	 html5Reader(file,pic);
						     }
							
						});
						
						function html5Reader(file,pic){
							     var file = file.files[0];
							     var reader = new FileReader();
							     reader.readAsDataURL(file);
							     reader.onload = function(e){
							         pic.src=this.result;
							     }
							 }
				},
				detail:function(e){
					$.ajax({
						url: "vms/getProgramItem?id="+e.target.getAttribute("data-item-id"),
						success: function(rs){
							if(rs.code == 200){
								vmsApp.addNewContent=false;
								vmsApp.newBtn=false;
								if(rs.programItem.type == "1"){
									vmsApp.editWordContent=true;
									vmsApp.editPicContent=false;
									vmsApp.editWordProgramItem = rs.programItem;
								}else {
									vmsApp.editPicContent=true;
									vmsApp.editWordContent=false;
									vmsApp.editPicProgramItem = rs.programItem;
									if(vmsApp.editPicProgramItem.picType == "0"){
										vmsApp.editPicProgramItem.picTypeFlag0 = true;
										vmsApp.editPicProgramItem.picTypeFlag1 = false;
									}else{
										vmsApp.editPicProgramItem.picTypeFlag0 = false;
										vmsApp.editPicProgramItem.picTypeFlag1 = true;
									}
									vmsApp.editPicUrl = "vms/IoReadImage?itemId="+vmsApp.editPicProgramItem.id+"&random="+new Date().getTime();
								}
								$('#updatePreview').removeAttr("style");
								vmsApp.reloadFile();
							}
						}
					});
				},
				addPic:function(){
					//表单验证
	    		    $("#uploadForm").validate({
	    		        invalidHandler : function(){//验证失败的回调
	    		            return false;
	    		        },
	    		        submitHandler : function(){//验证通过的回调
	    		        	$('#picProgramId').val($('#programSelectedId').val());
	    		        	var options = {
	    		        			type:'POST',
	    		        			url:'vms/upload',
	    		        			dataType:'json',
	    		        			async :false,
	    		        			success: function(rslt){
	    		        					alert('操作成功');
	    		        					if(rslt.code == 200){
			  									vmsApp.programItemList = rslt.programItemList;
			  								}
	    							},error:function(){
	    									alert("保存错误，请联系系统管理员");
	    							}
	    		        	};
	    		        	 $("#uploadForm").ajaxSubmit(options);
	    		            return false;//已经用AJAX提交了，需要阻止表单提交
	    		        }
	    			});
				},
				cancelItem:function(){
					this.addNewContent = false;
					this.newBtn = true;
					vmsApp.editPicContent=false;
					vmsApp.editWordContent=false;
					vmsApp.addProgramForm=false;
				},
	    		add: function () {
	    			vmsApp.title="新增";
	    			vmsApp.vms = {isNewRecord:true};
	    		},
	    		delWord: function () {
	    			confirm('确定删除？', function(){
	    				$.ajax({
	    					type: "POST",
	    					async :false,
	    				    url: "vms/deleteProgramItem?id="+vmsApp.editWordProgramItem.id,
	    				    success: function(rslt){
	    						if(rslt.code == 200){
	    							alert('操作成功');
	    							vmsApp.addNewContent = false;
	    							vmsApp.newBtn = true;
	    							vmsApp.editPicContent=false;
	    							vmsApp.editWordContent=false;
	    						}else{
	    							alert(rslt.msg);
	    						}
	    					}
	    				});
	    				$.ajax({
	    					url: "vms/getProgramItemByProgramId?programId="+$('#programSelectedId').val(),
	    					async :false,
	    					dataType: "json",
	    					success: function(rslt){
	    						if(rslt.code == 200){
	    							vmsApp.programItemList = rslt.programItemList;
	    						}
	    					}
	    				});
	    				
	    			});
	    		},
	    		delPic:function(){
	    			confirm('确定删除？', function(){
	    				$.ajax({
	    					type: "POST",
	    					async :false,
	    				    url: "vms/deleteProgramItem?id="+vmsApp.editPicProgramItem.id,
	    				    success: function(rslt){
	    						if(rslt.code == 200){
	    							alert('操作成功');
	    							vmsApp.addNewContent = false;
	    							vmsApp.newBtn = true;
	    							vmsApp.editPicContent=false;
	    							vmsApp.editWordContent=false;
	    						}else{
	    							alert(rslt.msg);
	    						}
	    					}
	    				});
	    				$.ajax({
	    					url: "vms/getProgramItemByProgramId?programId="+$('#programSelectedId').val(),
	    					async :false,
	    					dataType: "json",
	    					success: function(rslt){
	    						if(rslt.code == 200){
	    							vmsApp.programItemList = rslt.programItemList;
	    						}
	    					}
	    				});
	    			});	
	    		},
	    		playProgram:function(){
	    			$.ajax({
						type: "POST",
					    url: "vms/playProgram?programId="+$('#programSelectedId').val()+"&vmsId="+vmsApp.vms.vmsId,
					    success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功');
							}else{
								alert(rslt.msg);
							}
						}
					});
	    		},
	    		programChange:function(){
	    			var that = vueEureka.get("leftPanel").vue;
	    			$.ajax({
						url: "vms/getProgramItemByProgramId?programId="+$('#programSelectedId').val(),
						async :false,
						success: function(rslt){
							if(rslt.code == 200){
								that.programItemList = rslt.programItemList;
								that.$set(that.$data,"programItemList",rslt.programItemList);
							}
						}
					});
	    		},
	    		setBrightness:function(){
	    			$.ajax({
	    				type:"POST",
						url: "vms/setBrightness?vmsId="+vmsApp.vms.vmsId+"&brightness="+$('#screenBrightnessVal').val(),
						async :false,
						success: function(rslt){
							if(rslt.code == 200){
								alert('操作成功');
							}else{
								alert(rslt.msg);
							}
						}
					});
	    		},
	    		close: function() {//关闭面板
	    			itsGlobal.hideLeftPanel();
				}
			}
		});
		vmsApp.vms = vitem;
		vmsApp.loadData();
		
		vueEureka.set("leftPanel", {
			vue: vmsApp,
			description: "vms的vue实例"
		});
	};
	
	
	var hide = function() {
		itsGlobal.hideLeftPanel();
	};

	return {
		show : show,
		hide : hide
	};
})