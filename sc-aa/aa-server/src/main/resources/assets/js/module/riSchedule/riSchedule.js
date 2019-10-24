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
			riScList:[],
			currentUser:{},
			fileName:'',
			selectedRowDate:'',//当前鼠标单击行的日期
			weekFlag:0,
			weekStart:"",
			weekEnd:"",
			roadId:"",
			qrData:{},
			d1:"",d2:"",d3:"",d4:"",d5:"",d6:"",d7:""
		},
		methods: {
			init97DateStart: function(it){
				WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy.MM',onpicked:qwInspectApp.query});
			},
			query: function () {
				/*qwInspectApp.scheduleList =;
				qwInspectApp.dataList =;*/
				getDays(qwInspectApp.weekStart,qwInspectApp.weekEnd);
				$.ajax({
					url: "../../../../qw/pressureIncident/findScheduleList?ran="+getRandomNum()+"&dt="+"2018-02-22"+"&groupId="
					+1111+"&weekStart="+qwInspectApp.weekStart+"&weekEnd="+qwInspectApp.weekEnd,
					success: function(rslt){
						if(rslt.code == 200){
							//qwInspectApp.scheduleList = rslt.PiScheduleList;
							var oqsp =[{groupName:"城厢中队",roadName:"无",qwTimes:"无",d1:'',d2:'',d3:'',d4:'',d5:'',d6:'',d7:''},
							           {groupName:"港区交警中队",roadName:"无",qwTimes:"无",d1:'',d2:'',d3:'',d4:'',d5:'',d6:'',d7:''},
							           {groupName:"璜泾中队",roadName:"无",qwTimes:"无",d1:'',d2:'',d3:'',d4:'',d5:'',d6:'',d7:''},
							           {groupName:"经济开发区中队",roadName:"无",qwTimes:"无",d1:'',d2:'',d3:'',d4:'',d5:'',d6:'',d7:''},
							           {groupName:"浏河中队",roadName:"无",qwTimes:"无",d1:'',d2:'',d3:'',d4:'',d5:'',d6:'',d7:''},
							           {groupName:"南郊中队",roadName:"无",qwTimes:"无",d1:'',d2:'',d3:'',d4:'',d5:'',d6:'',d7:''},
							           {groupName:"双凤中队",roadName:"无",qwTimes:"无",d1:'',d2:'',d3:'',d4:'',d5:'',d6:'',d7:''},
							           {groupName:"沙溪中队",roadName:"无",qwTimes:"无",d1:'',d2:'',d3:'',d4:'',d5:'',d6:'',d7:''}];
							qwInspectApp.scheduleList=[];
							for(var i=0;i<oqsp.length;i++){
								var flag = false;
								for(var h=0;h<rslt.PiScheduleList.length;h++){
									if(oqsp[i].groupName == rslt.PiScheduleList[h].groupName){
										flag =true;
										qwInspectApp.scheduleList.push(rslt.PiScheduleList[h]);
									}
								}
								if(!flag){
									qwInspectApp.scheduleList.push(oqsp[i]);
								}
							}
							qwInspectApp.newQuery('','');
						}else{
							alert(rslt.msg);
						}
					}
				});
			},
			newQuery: function(g,l){
				var newScList=[];
				var rdList=[];
				var newqs={groupName:""};
				var h=0;
				var r="";
				$("select[name='rId']").each(function(j,item){
				     r=r +","+ item.value;  //输出input 中的 value 值到控制台
				});
				for(var i=0;i<qwInspectApp.scheduleList.length;i++){
					var qs =qwInspectApp.scheduleList[i];
					if(newqs.groupName==qs.groupName){
						rdList.push({roadId:qs.roadId,roadName:qs.roadName});
						
						if(r.indexOf(qs.roadId) != -1){
							qs.rdList=rdList;
							newScList[h-1] = qs;
						}else{
							newScList[h-1].rdList=rdList;
						}
					}else{
						newqs=qs;
						qs.rdList=false;
						newScList.push(qs);
						h++;
						rdList=[{roadId:qs.roadId,roadName:qs.roadName}];
					}
					
				}
				qwInspectApp.riScList =newScList;
			},
			//行单击事件
			trclick: function(e){
				var tr = $(e.target).parents("tr");
		    	var date = tr.find('td').eq(0).html();
		    	qwInspectApp.selectedRowDate = date.replace('.','-').replace('.','-');
			},
			tdclick:function(i){
				qwInspectApp.qrData=qwInspectApp.riScList[i];
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
		}
	});
	qwInspectApp.thisWeek(0);
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
    	    	var groupId = qwInspectApp.qrData.groupId;
    	    	var roadId = qwInspectApp.qrData.roadId;
    	    	var qwTimes = qwInspectApp.qrData.qwTimes;
    	    	window.opener.itsGlobal.silentOpenMenu("panels/jwtWork/jwtWorkPanel",groupId, policeName, qwInspectApp.selectedRowDate,roadId,qwTimes);
    	    }else{
    	    	var selection = document.selection.createRange();
    	    	var policeName = selection.text;
    	    	var groupId = qwInspectApp.qrData.groupId;
    	    	var roadId = qwInspectApp.qrData.roadId;
    	    	var qwTimes = qwInspectApp.qrData.qwTimes;
    	    	window.opener.itsGlobal.silentOpenMenu("panels/jwtWork/jwtWorkPanel",groupId, policeName, qwInspectApp.selectedRowDate,roadId,qwTimes);
    	    }
    	}}
    ]);
});


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

//获取间隔天数
function getDays(day1, day2) {
	// 获取入参字符串形式日期的Date型日期
	var st = day1.getDate();
	var et = day2.getDate();
	
	// 定义返回的数组
	var retArr = [];
	var i =1;
	// 循环，启动日期不等于结束日期时，进行循环
	while (st.getTime() != et.getTime()) {
		
		// 将启动日期的字符串形式的日期存放进数组
		retArr.push(st.getYMD());
		// 取得开始日期的天
		var tempDate = st.getDate();
		i=i+1;
		// 将开始日期st指向构造出的新的日期
		// 新的日期较之前的日期多加一天
		st = new Date(st.getFullYear(), st.getMonth(), st.getDate() + 1);
	}
 
	// 将结束日期的天放进数组
	retArr.push(et.getYMD());
	qwInspectApp.d1=retArr[0];
	qwInspectApp.d2=retArr[1];
	qwInspectApp.d3=retArr[2];
	qwInspectApp.d4=retArr[3];
	qwInspectApp.d5=retArr[4];
	qwInspectApp.d6=retArr[5];
	qwInspectApp.d7=retArr[6];
	
	//console.log(retArr); // 或可换为return ret;
}
 
// 给Date对象添加getYMD方法，获取字符串形式的年月日
Date.prototype.getYMD = function(){
   var retDate = this.getFullYear() + "-";  // 获取年份。
   retDate += this.getMonth() + 1 + "-";    // 获取月份。          
   retDate += this.getDate();               // 获取日。
   return retDate;                          // 返回日期。
}
 
// 给String对象添加getDate方法，使字符串形式的日期返回为Date型的日期
String.prototype.getDate = function(){
	var strArr = this.split('-');
	var date = new Date(strArr[0], strArr[1] - 1, strArr[2]);
	return date;
}

