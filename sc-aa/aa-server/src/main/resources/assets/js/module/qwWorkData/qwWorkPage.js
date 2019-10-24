var qwInspectApp = null;
$(function () {
	qwInspectApp = new Vue({
		el: '#vue-app',
		data: {
			dutyGridList:[],
			ddList:[],
			cxzdList:[],
			gqzdList:[],
			hjzdList:[],
			kfqzdList:[],
			lhzdList:[],
			njzdList:[],
			sfzdList:[],
			sxzdList:[]
		},
		methods: {
			init97DateStart: function(it){
				WdatePicker({lang:'zh-cn', isShowClear: false, dateFmt:'yyyy-MM-dd'});
			},
			init: function () {
			    var startDt=new Date();
			    startDt.setDate(1);
				$("#startDt").val(formatDate(startDt));
				var endDt = formatDate(new Date());
				$("#endDt").val(endDt);
				
				//$('#cxzd').collapse('show');
				$('#cxzdLink').bind("click",function(){
					if($('#cxzd').hasClass("in")){
						$("#cxzdLabel").addClass("fa-caret-right");
						$("#cxzdLabel").removeClass("fa-caret-down");
					}else{
						$("#cxzdLabel").removeClass("fa-caret-right");
						$("#cxzdLabel").addClass("fa-caret-down");
					}
				});
				
				$('#gqzdLink').bind("click",function(){
					if($('#gqzd').hasClass("in")){
						$("#gqzdLabel").addClass("fa-caret-right");
						$("#gqzdLabel").removeClass("fa-caret-down");
					}else{
						$("#gqzdLabel").removeClass("fa-caret-right");
						$("#gqzdLabel").addClass("fa-caret-down");
					}
				});
				
				$('#hjzdLink').bind("click",function(){
					if($('#hjzd').hasClass("in")){
						$("#hjzdLabel").addClass("fa-caret-right");
						$("#hjzdLabel").removeClass("fa-caret-down");
					}else{
						$("#hjzdLabel").removeClass("fa-caret-right");
						$("#hjzdLabel").addClass("fa-caret-down");
					}
				});
				
				$('#lhzdLink').bind("click",function(){
					if($('#lhzd').hasClass("in")){
						$("#lhzdLabel").addClass("fa-caret-right");
						$("#lhzdLabel").removeClass("fa-caret-down");
					}else{
						$("#lhzdLabel").removeClass("fa-caret-right");
						$("#lhzdLabel").addClass("fa-caret-down");
					}
				});
				
				$('#kfqzdLink').bind("click",function(){
					if($('#kfqzd').hasClass("in")){
						$("#kfqzdLabel").addClass("fa-caret-right");
						$("#kfqzdLabel").removeClass("fa-caret-down");
					}else{
						$("#kfqzdLabel").removeClass("fa-caret-right");
						$("#kfqzdLabel").addClass("fa-caret-down");
					}
				});
				
				$('#njzdLink').bind("click",function(){
					if($('#njzd').hasClass("in")){
						$("#njzdLabel").addClass("fa-caret-right");
						$("#njzdLabel").removeClass("fa-caret-down");
					}else{
						$("#njzdLabel").removeClass("fa-caret-right");
						$("#njzdLabel").addClass("fa-caret-down");
					}
				});
				
				$('#sxzdLink').bind("click",function(){
					if($('#sxzd').hasClass("in")){
						$("#sxzdLabel").addClass("fa-caret-right");
						$("#sxzdLabel").removeClass("fa-caret-down");
					}else{
						$("#sxzdLabel").removeClass("fa-caret-right");
						$("#sxzdLabel").addClass("fa-caret-down");
					}
				});
				
				$('#sfzdLink').bind("click",function(){
					if($('#sfzd').hasClass("in")){
						$("#sfzdLabel").addClass("fa-caret-right");
						$("#sfzdLabel").removeClass("fa-caret-down");
					}else{
						$("#sfzdLabel").removeClass("fa-caret-right");
						$("#sfzdLabel").addClass("fa-caret-down");
					}
				});
			},
			query:function(){
				qwInspectApp.cxzdList=[];
				qwInspectApp.gqzdList=[];
				qwInspectApp.hjzdList=[];
				qwInspectApp.kfqzdList=[];
				qwInspectApp.lhzdList=[];
				qwInspectApp.njzdList=[];
				qwInspectApp.sfzdList=[];
				qwInspectApp.sxzdList=[];
				qwInspectApp.ddList=[];
				var url='/sc-itsweb/pubishSummary/summary?startDt=' + $("#startDt").val()+" 00:00:00"+"&endDt="+ $("#endDt").val()+" 23:59:59";
				$.ajax({
					url: url,
					type: 'GET',
					success: function(dat) {
						var list = dat.list;
						qwInspectApp.ddList = dat.sumList;
						for(var i=0;i<list.length;i++){
							var zdId = list[i].groupId;
							switch(zdId)
							{
							case 'cxzd':
								list[i].groupName="城厢中队";
								qwInspectApp.cxzdList.push(list[i]);
								break;
							case 'gqzd':
								list[i].groupName="港区中队";
								qwInspectApp.gqzdList.push(list[i]);
								break;
							case 'kfqzd':
								list[i].groupName="开发区中队";
								qwInspectApp.kfqzdList.push(list[i]);
								break;
							case 'hjzd':
								list[i].groupName="璜泾中队";
								qwInspectApp.hjzdList.push(list[i]);
								break;
							case 'lhzd':
								list[i].groupName="浏河中队";
								qwInspectApp.lhzdList.push(list[i]);
								break;
							case 'njzd':
								list[i].groupName="南郊中队";
								qwInspectApp.njzdList.push(list[i]);
								break;
							case 'sfzd':
								list[i].groupName="双凤中队";
								qwInspectApp.sfzdList.push(list[i]);
								break;
							case 'sxzd':
								list[i].groupName="沙溪中队";
								qwInspectApp.sxzdList.push(list[i]);
								break;
							default:
								break;
							}
						}
					},
					error: function(xhr, textStatus) {
						layer.msg("获取统计数据失败！");
					}
				});
			}
		}
	});
	
	//初始化查询时间
	qwInspectApp.init();
	qwInspectApp.query();
	window.onbeforeunload = function(){  
		//vm.clearAllQwFromMainMap();
	}  
});

var formatDate = function(DateIn) {
	var Year = 0;
	var Month = 0;
	var Day = 0;

	var CurrentDate = "";
	// 初始化时间
	Year = DateIn.getFullYear();
	Month = DateIn.getMonth() + 1;
	Day = DateIn.getDate();

	CurrentDate = Year + "-";
	if (Month >= 10) {
		CurrentDate = CurrentDate + Month + "-";
	} else {
		CurrentDate = CurrentDate + "0" + Month + "-";
	}
	if (Day >= 10) {
		CurrentDate = CurrentDate + Day;
	} else {
		CurrentDate = CurrentDate + "0" + Day;
	}
	return CurrentDate;
}


