var zxxdSchVm = null;
var groupUserComp;
var rowIdx;
var rowAttr;
$(function () {
	zxxdSchVm = new Vue({
		el: '#vue-app',
		data: {
			scheduleList:[],
			qwab: formatDate(new Date()),
			gId:"cxzd",
			currentUser:{},
			groupList:[],
			userList :[],
			candidateGroupUserList:[],
			isZdAdmin: false,
			selectedRowDate:'',//当前鼠标单击行的日期
			weekFlag:0,
			weekStart:"",
			weekEnd:""
		},
		methods: {
			init97DateStart: function(it){
				WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy.MM',onpicked:zxxdSchVm.query});
			},
			query: function () {
				var scheduleDt= $("#scheduleDt").text();
				if(scheduleDt == ""){
					scheduleDt=zxxdSchVm.qwab;
				}
				var groupId=zxxdSchVm.gId;
				$.ajax({
					url: "../../../../qw/zxxdSchedule/allData?ran="+getRandomNum()+"&scheduleDt="+scheduleDt+"&groupId="
					+groupId+"&weekStart="+zxxdSchVm.weekStart+"&weekEnd="+zxxdSchVm.weekEnd,
					success: function(rslt){
						if(rslt.code == 200){
							zxxdSchVm.scheduleList = rslt.scheduleList;
							zxxdSchVm.currentUser = rslt.currentUser;
							zxxdSchVm.isZdAdmin = $.inArray("zdadmin",zxxdSchVm.currentUser.roleIdList) >= 0 ;
							if(zxxdSchVm.currentUser.jjzdUser){
								zxxdSchVm.gId=zxxdSchVm.currentUser.group.groupId;
							}
						}else{
							alert(rslt.msg);
						}
					}
				});
			},
			//行单击事件
			trclick: function(e){
				var tr = $(e.target).parents("tr");
		    	var date = tr.find('td').eq(0).html();
		    	if(date){
		    		zxxdSchVm.selectedRowDate = date.replace('.','-').replace('.','-');
		    		var tdIdx = tr.find("td").index($(e.target));
		    		switch (tdIdx) {
					case 2:
						zxxdSchVm.gId='cxzd';
						break;
					case 3:
						zxxdSchVm.gId='gqzd';
						break;
					case 4:
						zxxdSchVm.gId='hjzd';
						break;
					case 5:
						zxxdSchVm.gId='kfqzd';
						break;
					case 6:
						zxxdSchVm.gId='lhzd';
						break;
					case 7:
						zxxdSchVm.gId='njzd';
						break;
					case 8:
						zxxdSchVm.gId='sxzd';
						break;
					case 9:
						zxxdSchVm.gId='sfzd';
						break;
					default:
						break;
					}
		    	}
			},
			relation: function(ln,na,gId){
				rowIdx=ln;
				rowAttr=na;
				zxxdSchVm.gId=gId;
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
        		var userNames = groupUserComp.val();
        		if(groupUserComp.val()){
        			userNames = groupUserComp.val().toString();
        			if(userNames.length >= 200){
        				alert("所选民警过多，请重新选择，最多可选50人。");
        				return;
        			}
        		}
        		switch(rowAttr) {
	        		case "cxJyxm":
	        			zxxdSchVm.scheduleList[rowIdx].cxJyxm=userNames;
	        		  break;
	        		case "gqJyxm":
	        			zxxdSchVm.scheduleList[rowIdx].gqJyxm=userNames;
	        		  break;
	        		case "kfqJyxm":
	        			zxxdSchVm.scheduleList[rowIdx].kfqJyxm=userNames;
	        		  break;
	        		case "hjJyxm":
	        			zxxdSchVm.scheduleList[rowIdx].hjJyxm=userNames;
	        		  break;
	        		case "lhJyxm":
	        			zxxdSchVm.scheduleList[rowIdx].lhJyxm=userNames;
	        		  break;
	        		case "njJyxm":
	        			zxxdSchVm.scheduleList[rowIdx].njJyxm=userNames;
	        			break;
	        		case "sxJyxm":
	        			zxxdSchVm.scheduleList[rowIdx].sxJyxm=userNames;
	        			break;
	        		case "sfJyxm":
	        			zxxdSchVm.scheduleList[rowIdx].sfJyxm=userNames;
	        		  break;
	        		default:
	        		  
        		}
        		
        		$("#"+rowAttr+rowIdx).val(userNames);
        		layer.closeAll();
			},
			save: function () {
				if(zxxdSchVm.scheduleList.length==0){
					alert("请填写数据");
					return false;
				}
				var scList=[];
				for (var i = 0; i < zxxdSchVm.scheduleList.length; i++) {  
					zxxdSchVm.scheduleList[i].groupId=zxxdSchVm.gId;
					scList.push(zxxdSchVm.scheduleList[i]);  
				} 
	        	$.ajax({
					type: "POST",
					url: "../../../../qw/zxxdSchedule/save?ran="+getRandomNum(),
					data:  JSON.stringify(scList),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function(rslt){
						if(rslt.code == 200){
							zxxdSchVm.query();
							alert('操作成功', function(index){
								layer.closeAll();
							});
						}else{
							alert(rslt.msg);
						}
					}
				});
			},
			lastWeek: function (weekFlagP) {
				zxxdSchVm.weekFlag += weekFlagP;
				zxxdSchVm.weekStart = adddays(getStart(),zxxdSchVm.weekFlag * 7);
				zxxdSchVm.weekEnd = adddays(getEnd(),zxxdSchVm.weekFlag * 7);
				zxxdSchVm.query();
			},
			nextWeek: function (weekFlagP) {
				zxxdSchVm.weekFlag += weekFlagP;
				zxxdSchVm.weekStart = adddays(getStart(),zxxdSchVm.weekFlag * 7);
				zxxdSchVm.weekEnd = adddays(getEnd(),zxxdSchVm.weekFlag * 7);
				zxxdSchVm.query();
			},
			thisWeek: function (weekFlagP) {
				zxxdSchVm.weekFlag =0;
				zxxdSchVm.weekStart = getStart();
				zxxdSchVm.weekEnd = getEnd();
				zxxdSchVm.query();
			}
			/*,
			getDutyListByTeamId: function() {
				if(zxxdSchVm.gId){
					initPage();
				}else{
					alert("请选择中队");
				}
				
			},*/
		}
	});
	zxxdSchVm.thisWeek();
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
    	{text: '查询当日轨迹', action: function(e){
    	    e.preventDefault();
    	    if( window.getSelection){
    	    	var selection = window.getSelection();
    	    	var policeName = selection.toString();//TODO ie下文本框无法获取值
    	    	var groupId = zxxdSchVm.gId;
    	    	window.opener.itsGlobal.silentOpenMenu("panels/jwtWork/jwtWorkPanel",groupId, policeName, zxxdSchVm.selectedRowDate,"","");
    	    }else{
    	    	var selection = document.selection.createRange();
    	    	var policeName = selection.text;
    	    	var groupId = zxxdSchVm.gId;
    	    	window.opener.itsGlobal.silentOpenMenu("panels/jwtWork/jwtWorkPanel",groupId, policeName, zxxdSchVm.selectedRowDate,"","");
    	    }
    	}}
    ]);
});


var loadGroups = function() {
    $.get("../../../../aa/group/allData?ran="+getRandomNum()+"&zdFlag="+1, function(r){
		if(r.code == 200){
			zxxdSchVm.groupList = r.groupList;
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
	groupUserComp = null;
	
	$.ajax({
	    url: "../../../../aa/user/allData?ran="+getRandomNum()+"&type=MJ"+"&groupId="+zxxdSchVm.gId,
	    success: function(rslt){
			if(rslt.code == 200){
				zxxdSchVm.candidateGroupUserList = rslt.userList;
				$(zxxdSchVm.candidateGroupUserList).each(function () {
	                var option = document.createElement("option");
	                option.value = this['userName'];
	                option.text = this['userName'];
	                var users = $("#"+rowAttr+rowIdx).val();
	                
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
				groupUserComp = $('select[name="groupUserList"]').bootstrapDualListbox({
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


