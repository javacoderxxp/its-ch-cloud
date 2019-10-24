define(function(require){
	
	var map = require('mainMap');
	//require('datetimepicker');
	var Vue = require('vue');
	var htmlStr = require('text!./sendNotice.html');
	require('jquery');
	var showLayer = function(isShow,policeNos,title,content,publisher) {
		if(isShow){
			// init left panel
			itsGlobal.showLeftPanel(htmlStr);
			//$(".form_datetime").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss:SSS'});
			
			var noticeApp = new Vue({
				el : '#notice-panel',
				data : {
					notice:{title:title, content:content, publisher: publisher}, //任务结果
					imgList:[],
					size: 0,
					policeNos:policeNos,
					isIE: false,
					policeList:[]
				},
				methods: {
					close: function(){
						require(['layers/alarmTask/realtimeAlarm'],function(realtimeAlarm){
							realtimeAlarm.clearJwtMarkers();
						});
						close();
					},
					fileClick: function(){
						$("upload_file").click;
					},
					fileChange: function(e){
						
						var userAgent = navigator.userAgent.toLowerCase();
						if(!!window.ActiveXObject || "ActiveXObject" in window){
							var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
							reIE.test(userAgent);
							var fIEVersion = parseFloat(RegExp["$1"]);
							if(fIEVersion == 9) {
								noticeApp.isIE = true;
								var filepath;
								if(this.imgList.length == 0){
									filepath=e.target.form.all.uploadFile.value;
								}else{
									filepath=e.target.form.all.uploadFile[this.imgList.length].value;
								}
								//this.fileList(file)
								this.imgList.push(filepath);
								this.addInput();
							} 
						}/*else {
							noticeApp.isIE = false;
							if (!e.target.files[0].size) return;
							this.fileList(e.target.files);
							this.addInput();
						}*/
					},
					addInput: function(){
						var div = $("#test");
						div.children().hide();
						var input = $('<input type="file" name="uploadFile"  class="sendNoticeUpLoad">');
						input.appendTo(div);
						var copyObj = this;
						$(".sendNoticeUpLoad").bind("change",function(){
							copyObj.fileChange({target:this})
						})
					},
					delInput: function(index){
						$("#test").children().eq(index).remove();
					},
					/*fileList: function(files){
						for (var i = 0; i < files.length; i++) {
						  this.fileAdd(files[i]);
						}
					},
					fileAdd: function(file){
						this.size = this.size + file.size;//总大小
						var reader = new FileReader();
						reader.vue = this;
						reader.readAsDataURL(file);
						reader.onload = function () {
						  file.src = this.result;
						  if(noticeApp.isIE){
							  this.vue.imgList.push(file);
						  }else{
							  this.vue.imgList.push({
									file
								  });
						  }
						  
						}
					},
					fileDel: function(index){
						this.size = this.size - this.imgList[index].file.size;//总大小
						this.imgList.splice(index, 1);
						this.delInput(index);
					},*/
					sendNotice: function(){
						//表单验证
						layer.load();
						$("#sendNoticeForm").validate({
												
							invalidHandler : function(){//验证失败的回调
								return false;
							},
							submitHandler : function(){//验证通过的回调
								var ids = $("#policeNos").selectpicker('val');
								var polices = "";
								if(ids && ids.length>0){
									polices = ids.join(",");
								}
								if("" == polices){
									alert("警员不能为空");
									return false;
								}
								var url = 'jw/notice/sendNotice?text='+polices;
								var options = {
										type:'POST',
										url:url,
										contentType: false,
										processData: false,
										contentType : "application/x-www-form-urlencoded; charset=UTF-8",
										//data: JSON.stringify(noticeApp.notice),
										async :false,
										success: function(rslt){
											layer.closeAll('loading');
											if(rslt.code === 200){
												alert('操作成功',function(){
													noticeApp.close();
												});
											}else{
												alert(rslt.msg);
											}
										}
									};
								$("#sendNoticeForm").ajaxSubmit(options);
								return false;
							}
						});
					},
					loadMultiPolice:function(){
						var url = "jw/notice/getPoliceNameByIds?policeNos="+ this.policeNos;
						$.get(url, function(r) {
							if(r.code == '200'){
								noticeApp.policeList = r.userList;
								setTimeout(function(){
									 require(['bootstrapSelect','bootstrapSelectZh'],function(){
											$('#policeNos').selectpicker({
												noneSelectedText:'请选择警员',
												liveSearch: true,
												style: 'btn-default',
												size: 10
											});
											setTimeout(function(){
												$('#policeNos').selectpicker('selectAll');
											},1000);
										});
								}, 400);
							}
						});
					}
				}
			});
			noticeApp.notice.policeNos = policeNos;
			noticeApp.loadMultiPolice();
		}else{
			
		}
	}
	
	var distinctBrowser = function(){
		var userAgent = navigator.userAgent.toLowerCase();
		if(userAgent.indexOf('opera') > -1){
			return "Opera";
		}else if(userAgent.indexOf('firefox') > -1){
			return "Firefox";
		}else if(!!window.ActiveXObject || "ActiveXObject" in window){
			var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
			reIE.test(userAgent);
			var fIEVersion = parseFloat(RegExp["$1"]);
			if(fIEVersion == 9) {
				return "IE9";
			} else {
				return "not IE9";//IE版本<=7
			}   
			//return "IE";//+(userAgent.match(/msie\s(\d+)/) || [])[1] || '11'; //由于ie11并没有msie的标识
		}else if(userAgent.indexOf('chrome') > -1){
			return "Chrome";
		}
	}
	
	var close = function(){
		itsGlobal.hideLeftPanel();
	}
	
	return {
		showLayer:showLayer,
		close:close()
	};
});