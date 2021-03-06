var qwInspectApp = null;
var groupUserComponent;
var lin;
var nid;
$(function () {
	qwInspectApp = new Vue({
		el: '#vue-app',
		data: {
			dutyGridList:[],
			scheduleList:[],
			qwab: formatDate(new Date()),
			gId:"cxzd",
			gName:"城厢中队",
			currentUser:{},
			groupList:[],
			userList :[],
			candidateGroupUserList:[],
			fileName:'',
			isZdAdmin: false,
			selectedRowDate:getDateStr(new Date()),//当前鼠标单击行的日期
			weekFlag:0,
			weekStart:"",
			dType:"",
			weekEnd:""
		},
		methods: {
			init97DateStart: function(it){
				WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy.MM',onpicked:qwInspectApp.query});
			},
			query: function () {
				var groupName = "";
				var scheduleDt= $("#scheduleDt").text();
				if(scheduleDt == ""){
					scheduleDt=qwInspectApp.qwab;
				}
				var groupId=qwInspectApp.gId;
				$.ajax({
					url: "../../../../qw/schedule/allData?ran="+getRandomNum()+"&scheduleDt="+scheduleDt+"&groupId="
					+groupId+"&weekStart="+qwInspectApp.weekStart+"&weekEnd="+qwInspectApp.weekEnd,
					success: function(rslt){
						if(rslt.code == 200){
							qwInspectApp.scheduleList = rslt.scheduleList;
							qwInspectApp.currentUser = rslt.currentUser;
							qwInspectApp.isZdAdmin = $.inArray("zdadmin",qwInspectApp.currentUser.roleIdList) >= 0 ;
							if(qwInspectApp.currentUser.jjzdUser){
								qwInspectApp.gId=qwInspectApp.currentUser.group.groupId;
							}
							for(var i=0;i<qwInspectApp.groupList.length; i++){
								if(qwInspectApp.groupList[i].groupId == qwInspectApp.gId){
									groupName=qwInspectApp.groupList[i].groupName;
								}
							}
							qwInspectApp.gName = groupName;
						}else{
							alert(rslt.msg);
						}
					}
				});
			},
			//行单击事件
			trclick: function(data,dType){
		    	qwInspectApp.selectedRowDate = data.replace('.','-').replace('.','-');
		    	qwInspectApp.dType = dType;
			},
			relation: function(ln,na){
				lin=ln;
				nid=na;
				layer.open({
					type: 1,
					skin: 'layui-layer',
					title: ["选择警员"],
					area: ['540px', '485px'],
					shade: false,
					content: jQuery("#shebeiRelation"),
					btn: []
				});
				
				initPage();
			
			},
			relationSave: function(){
        		var signalIds = groupUserComponent.val();
        		if(groupUserComponent.val()){
        			signalIds = groupUserComponent.val().toString();
        			if(signalIds.length >= 200){
        				alert("所选民警过多，请重新选择，最多可选50人。");
        				return;
        			}
        		}
        		switch(nid) {
	        		case "mPolice":
	        			qwInspectApp.scheduleList[lin].mPolice=signalIds;
	        		  break;
	        		case "nPolice":
	        			qwInspectApp.scheduleList[lin].nPolice=signalIds;
	        		  break;
	        		case "tPolice":
	        			qwInspectApp.scheduleList[lin].tPolice=signalIds;
	        		  break;
	        		case "cPolice":
	        			qwInspectApp.scheduleList[lin].cPolice=signalIds;
	        		  break;
	        		case "sPolice":
	        			qwInspectApp.scheduleList[lin].sPolice=signalIds;
	        		  break;
	        		case "zPolice":
	        			qwInspectApp.scheduleList[lin].zPolice=signalIds;
	        		  break;
	        		default:
	        		  
        		}
        		
        		$("#"+nid+lin).val(signalIds);
        		layer.closeAll();
			},
			save: function () {
				if(qwInspectApp.scheduleList.length==0){
					alert("请填写数据");
					return false;
				}
				var scList=[];
				for (var i = 0; i < qwInspectApp.scheduleList.length; i++) {  
					qwInspectApp.scheduleList[i].groupId=qwInspectApp.gId;
					scList.push(qwInspectApp.scheduleList[i]);  
				} 
				//console.log(qwInspectApp.scheduleList);
	        	$.ajax({
					type: "POST",
					url: "../../../../qw/schedule/save?ran="+getRandomNum(),
					data:  JSON.stringify(scList),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function(rslt){
						if(rslt.code == 200){
							qwInspectApp.query();
							alert('操作成功', function(index){
								layer.closeAll();
							});
						}else{
							alert(rslt.msg);
						}
					}
				});
			},
			clearCurMonth: function () {
				var groupId=qwInspectApp.gId;
				var scheduleDt= $("#scheduleDt").text();
				var r=confirm('确定清空当月排班, 清空后无法恢复?');
			    if (r==true){
			    	$.ajax({
			    		type: "POST",
			    		url: "../../../../qw/schedule/clearCurMonth?ran="+getRandomNum()+"&groupId="+groupId+"&scheduleDt="+scheduleDt,
			    		success: function(rslt){
			    			if(rslt.code == 200){
			    				qwInspectApp.query();
			    				alert('操作成功', function(index){
			    					$("#jqGrid").trigger("reloadGrid");
			    				});
			    			}else{
			    				alert(rslt.msg);
			    			}
			    		}
			    	});
			    }
			},
			cloneLastMonth: function () {
				var groupId=qwInspectApp.gId;
				var scheduleDt= $("#scheduleDt").text();
				$.ajax({
					type: "POST",
					url: "../../../../qw/schedule/cloneLastMonth?ran="+getRandomNum()+"&groupId="+groupId+"&scheduleDt="+scheduleDt,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function(rslt){
						if(rslt.code == 200){
							qwInspectApp.query();
							alert('操作成功', function(index){
								layer.closeAll();
							});
						}else{
							alert(rslt.msg);
						}
					}
				});
			},
			exportExcel: function () {
				var scheduleDt= $("#scheduleDt").text();
				var groupId=qwInspectApp.gId;
				var url = "../../../../qw/schedule/exportExcel?ran="+getRandomNum()+"&scheduleDt="+scheduleDt+"&groupId="
				+groupId+"&weekStart="+qwInspectApp.weekStart+"&weekEnd="+qwInspectApp.weekEnd;
				$.ajax({
					type: "POST",
					url: url,
				    data: JSON.stringify(qwInspectApp.zdqyQ),
					success: function(rslt){
						if(rslt.code == 200){
							alert('操作成功,请下载文件');
							qwInspectApp.exportSuccess = true;
							qwInspectApp.fileName = rslt.fileName;
							qwInspectApp.query();
						}else{
							alert(rslt.msg);
						}
					}
				});
			},
			qwGroup:function(){
				 var groupName;
	    	    var groupId ;
    	    	groupName = qwInspectApp.gName;
    	    	groupId = qwInspectApp.gId;
    	    	window.opener.itsGlobal.qwGroudScene(groupName,groupId, getDateStr(new Date()));
	    	    
			},
			downloadExcel: function () {
				var url = "../../../../jtzt/zdqy/downloadExcel?fileName="+encodeURIComponent(qwInspectApp.fileName);
				var wWidth = document.body.clientWidth/2 ;  
				var wHeight =document.body.clientHeight/2;  
				window.open(url,'newwindow','height=20,width=20,top='+wHeight+',left='+wWidth+',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no') ;  
			},
			lastWeek: function (weekFlagP) {
				qwInspectApp.weekFlag += weekFlagP;
				qwInspectApp.weekStart = adddays(getStart(),qwInspectApp.weekFlag * 7);
				qwInspectApp.weekEnd = adddays(getEnd(),qwInspectApp.weekFlag * 7);
				qwInspectApp.query();
			},
			nextWeek: function (weekFlagP) {
				qwInspectApp.weekFlag += weekFlagP;
				qwInspectApp.weekStart = adddays(getStart(),qwInspectApp.weekFlag * 7);
				qwInspectApp.weekEnd = adddays(getEnd(),qwInspectApp.weekFlag * 7);
				qwInspectApp.query();
			},
			thisWeek: function (weekFlagP) {
				qwInspectApp.weekFlag =0;
				qwInspectApp.weekStart = getStart();
				qwInspectApp.weekEnd = getEnd();
				qwInspectApp.query();
			}
			/*,
			getDutyListByTeamId: function() {
				if(qwInspectApp.gId){
					initPage();
				}else{
					alert("请选择中队");
				}
				
			},*/
		}
	});
	qwInspectApp.thisWeek();
	loadGroups();
	//initPage();
	
	
	//右键菜单事件，查询选中的中队、人员、时间的一日工作轨迹
	context.init({
	    fadeSpeed: 100,
	    filter: function ($obj){},
	    above: 'auto',
	    preventDoubleContext: true,
	    compress: false
	});
	context.settings({compress: true});
    context.attach('#qwScheduleTable', [
    	{text: '查询警员勤务', action: function(e){
    	    e.preventDefault();
    	    var policeName;
    	    var groupId ;
    	    var sd = qwInspectApp.selectedRowDate;
    	    if( window.getSelection){
    	    	var selection = window.getSelection();
    	    	policeName = selection.toString();//TODO ie下文本框无法获取值
    	    	var reg = /^[\u4E00-\u9FA5]+$/; 
    	    	if(!reg.test(policeName)){ 
    	    	alert("请选择正确的警员姓名！"); 
    	    	return false; 
    	    	} 
    	    	groupId = qwInspectApp.gId;
    	    	window.opener.itsGlobal.qwComdScene(qwInspectApp.dType+"-"+policeName,groupId, qwInspectApp.selectedRowDate);
    	    }else{
    	    	var selection = document.selection.createRange();
    	    	policeName = selection.text;
    	    	var reg = /^[\u4E00-\u9FA5]+$/; 
    	    	if(!reg.test(policeName)){ 
    	    	alert("请选择正确的警员姓名！"); 
    	    	return false; 
    	    	} 
    	    	groupId = qwInspectApp.gId;
    	    	window.opener.itsGlobal.qwComdScene(qwInspectApp.dType+"-"+policeName,groupId, qwInspectApp.selectedRowDate);
    	    }
    	   
    	}}
    ]);
  /*  context.attach('#trGn', [
        {text: '查询中队勤务', action: function(e){
    	    e.preventDefault();
    	   
    	   
    	}}
    ]);*/
});


var loadGroups = function() {
    $.get("../../../../aa/group/allData?ran="+getRandomNum()+"&zdFlag="+1, function(r){
		if(r.code == 200){
			qwInspectApp.groupList = r.groupList;
			//publishApp.groupList.unshift({groupName:'所有'});
			/*require(['bootstrapSelect','bootstrapSelectZh'],function(){
				$('#groupIdQ').selectpicker({
					noneSelectedText:'请选择一个中队',
					liveSearch: true,
					style: 'btn-default',
					size: 10
				});
			});
			$("#groupIdQ").selectpicker('val', gId);*/
		}else{
			alert(r.msg);
		}
	});
}

var initPage = function(){

	$('#groupUserListCol').empty();
	$('#groupUserListCol').append('<select class="form-control" name="groupUserList" multiple="multiple" size="20" style="height: 200px"></select>');
	groupUserComponent = null;
	
	$.ajax({
	    url: "../../../../aa/user/allData?ran="+getRandomNum()+"&type=MJ"+"&groupId="+qwInspectApp.gId,
	    success: function(rslt){
			if(rslt.code == 200){
				qwInspectApp.candidateGroupUserList = rslt.userList;
				$(qwInspectApp.candidateGroupUserList).each(function () {
	                var option = document.createElement("option");
	                option.value = this['userName'];
	                option.text = this['userName'];
	                var users = $("#"+nid+lin).val();
	                
	                if (users) {
	                	var uList= users.split(",");
	                    $.each(uList, function (i, user) {
	                        if (option.value == user) {
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
}

var getRandomNum = function(){
	return (new Date()).getTime();
}
var today=new Date();
var weekday=today.getDay();

if(weekday ==0){
	weekday=7;
}
    
var monday=new Date(1000*60*60*24*(1-weekday) + today.getTime());    
var sunday=new Date(1000*60*60*24*(7-weekday) + today.getTime());


function getDateStr(dd){
    var y = dd.getFullYear();
    
    var m = dd.getMonth()+1;//获取当前月份的日期
    m=parseInt(m,10);
    if(m<10){
        m="0"+m;
    }
    
    var d = dd.getDate();
    d=parseInt(d,10);
    if(d<10){
        d="0"+d;
    }
    
    return y+"-"+m+"-"+d;
}

function getStart() {
	return getDateStr(monday);
}

function getEnd() {
	return getDateStr(sunday);
}

function adddays(dd,DaysToAdd) { 
	var newdate=new Date(dd.replace('-','/').replace('-','/')+" 00:00:00");
	var newtimems=newdate.getTime()+(DaysToAdd*24*60*60*1000);
	newdate.setTime(newtimems); 
	var year =newdate.getFullYear();
	var month =newdate.getMonth()+1;
	var day =newdate.getDate(); 
	
	if (month >= 1 && month <= 9) {
		month = "0" + month;
    }
	if (day >= 1 && day <= 9) {
		day = "0" + day;
    }
	//得到具体时间   ——————newdate.toLocaleString()
	return year + '-' + month + '-' + day; 
	} 

var formatDate = function(DateIn) {
	var Year = 0;
	var Month = 0;
	var Day = 0;

	var CurrentDate = "";
	// 初始化时间
	Year = DateIn.getFullYear();
	Month = DateIn.getMonth() + 1;
	Day = DateIn.getDate();

	CurrentDate = Year + ".";
	if (Month >= 10) {
		CurrentDate = CurrentDate + Month + "";
	} else {
		CurrentDate = CurrentDate + "0" + Month + "";
	}
	return CurrentDate;
}

