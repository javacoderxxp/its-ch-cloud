define(function(require) {
	var htmlStr = require('text!./violationPublish.html');
	var Vue = require('vue');
	var map = require('mainMap');
	require('my97Datepicker');
	var mousetool = null;
	var publishApp = null;
	var oldQ =  '1';
	var punishIcon = new IMAP.Icon("./assets/images/punish.png", new IMAP.Size(32, 32), new IMAP.Pixel(0, 0));
	var show = function() {
		itsGlobal.showLeftPanel(htmlStr);
		
		publishApp = new Vue({
			el: '#violationPublish-panel',
			data: {
				queryObj:{startTime: TUtils.formatDateTime000(new Date()), endTime: TUtils.formatDateTime(new Date())},
				publishQuery:{},
				punish:{},
				pos:null,
				showDetail:false,
				groupId:"",
				groupList:[],
				heatmapOverlay:null
			},
			methods: {
				query: function () {
					publishApp.reload();
				},
				add: function () {
					this.showDetail = true;
					this.punish.punisherNo = currentUser.policeNo;
					$('#myTab a[href="#publishDetail"]').tab('show');
				},
				addPosition:function(){
					this.clearShape();
					mousetool=new IMAP.MarkerTool(punishIcon,false);
					mousetool.autoClose = true;//是否自动关闭绘制	
					map.addTool(mousetool);
					mousetool.open();
					mousetool.addEventListener(IMAP.Constants.ADD_OVERLAY,function(evt){
						var pos = evt.overlay;
						publishApp.pos = pos;
						var lnglat = pos.getPosition();
						$("#posShape").val(lnglat.toString());
						mousetool.close();
					},this);
				},
				submitPunish: function () {
				    //表单验证
				    $("#publishdetailForm").validate({
				        invalidHandler : function(){//验证失败的回调
				            return false;
				        },
				        submitHandler : function(){//验证通过的回调
							var lnglat = publishApp.pos.getPosition();
							var lng = lnglat.getLng();
							var lat = lnglat.getLat();
							publishApp.punish.longitude = lng;
							publishApp.punish.latitude = lat;
							publishApp.punish.violatedDt = $("#violatedDt").val();
							publishApp.punish.violatedLevel = $("#violatedLevel").val();
							publishApp.punish.type = $("#punish-type").val();
							publishApp.punish.createBy = currentUser.policeNo;
							
							var url = "./qw/violationPunish/save";
							$.ajax({
								type: "POST",
							    url: url,
							    data: JSON.stringify(publishApp.punish),
							    success: function(rslt){
							    	if(rslt.code === 200){
										alert('操作成功', function(index){
											publishApp.reload();
										});
									}else{
										alert(rslt.msg);
									}
								}
							});
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
						    url: "./qw/violationPunish/purge/"+id,
						    success: function(rslt){
								if(rslt.code == 200){
									publishApp.reload();
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
					var postDataTmp = {"groupId": publishApp.groupId,"type":$("#type").val(),"startDt": $("#startTime").val(),
							"endDt": $("#endTime").val()};
					if(TUtils.cmp(postDataTmp,oldQ)){
						oldQ = JSON.parse(JSON.stringify(postDataTmp));
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
					this.generateHeatmap();
				},
				generateHeatmap:function(){
					var type = $("#type").val();
					var startDt = $("#startTime").val();
					var endDt = $("#endTime").val();
					var groupId = this.groupId;
					var url = "./qw/violationPunish/getHeatMapData?groupId="+groupId+"&startDt="+startDt+"&endDt="+endDt+"&type="+type;
				    
					this.clearHeatmapLayer();
					
					$.get(url, function(r){
						if(r.code == 200){
							var heatmapList = r.heatmapList;
							if(heatmapList&&heatmapList.length>0){
								var datas = {data:heatmapList};
								map.plugin(['IMAP.HeatmapOverlay'], function(){
									var heatmapOverlay=new IMAP.HeatmapOverlay(datas);
									map.getOverlayLayer().addOverlay(heatmapOverlay);
									publishApp.heatmapOverlay = heatmapOverlay;
								});
							}
						}else{
							alert(r.msg);
						}
					});
				},
				close: function() {
					itsGlobal.hideLeftPanel();
					this.clearHeatmapLayer();
				},
				clearHeatmapLayer:function(){
					if(this.heatmapOverlay){
						map.getOverlayLayer().removeOverlay(this.heatmapOverlay);
						this.heatmapOverlay=null;
					}
				},
				clearShape:function(){
					if(null!=this.pos){
						map.getOverlayLayer().removeOverlay(this.pos);
					}
					$("#posShape").val("");
				},
				setDateStart:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){publishApp.queryObj.startTime = $("#startTime").val()}});
				},
				setDateEnd:function(){
					WdatePicker({lang:'zh-cn', dateFmt:'yyyy-MM-dd HH:mm:ss', onpicked:function(){publishApp.queryObj.endTime = $("#endTime").val()}});
				},
			}
		});
		oldQ=1;
		initPage();
		
//		loadJqGrid();
		
		loadGroups();
		
		vueEureka.set("leftPanel", {
			vue: publishApp,
			description: "publish的vue实例"
		});
	};
	
	var initPage = function(){
		require(['bootstrapSelect','bootstrapSelectZh'],function(){
			$("select[name='type']").selectpicker({
				noneSelectedText:'请选择处罚类型',
				liveSearch: true,
				style: 'btn-default',
				size: 10
			});
			$('#violatedLevel').selectpicker({
				noneSelectedText:'请选择事故等级',
				liveSearch: true,
				style: 'btn-default',
				size: 10
			});
		});
		publishApp.query();
	}
	
	var loadJqGrid = function() {
		$('#jqGrid').jqGrid('GridUnload');
		var postDataTmp = {"groupId": publishApp.groupId,"type":$("#type").val(),"startDt": $("#startTime").val(),
				"endDt": $("#endTime").val()};
		oldQ = JSON.parse(JSON.stringify(postDataTmp));
	    $("#jqGrid").jqGrid({
	        url: "./qw/violationPunish/pageData",
	        datatype: "json",
	        postData: postDataTmp,
	        colModel: [
	        	{ label: 'id', name: 'id', width: 1, key: true, hidden:true },
	        	{ label: '记录类型', name: 'createBy',  width: 40, sortable:false,hidden:true},
				{ label: '查获时间', name: 'violatedDt', index:'violated_dt',width: 120, sortable:true , formatter: function(value, options, row){
					return value ? value: '-';
				}},
				{ label: '查获地点', name: 'violatedPlace', width: 100, sortable:false},
				{label: '处罚类型',name: 'type',width : 40,sortable : false,formatter: function(value, options, row){
					var type = '-';
	        		if(value=='0'){
	        			type='简易程序';
	        		}else if(value=='1'){
	        			type='强制措施';
	        		}
	        		return type;
				}}, 
				{ label: '处理民警', name: 'punisherNo',  width: 50, sortable:false},
				{ label: 'latitude', name: 'latitude',  width: 50, sortable:false, hidden:true },
				{ label: 'longitude', name: 'longitude',  width: 50, sortable:false, hidden:true }
			 ],
			viewrecords: true,
	        height: 260,
	        width: 580,
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
	            layer.msg("加载完毕");
	        },
	        gridComplete:function(){
	        	//隐藏grid底部滚动条
	        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
	        },
	        onSelectRow: function(rowid, status){//选中某行
	        	var rowData = $("#jqGrid").jqGrid('getRowData', rowid);
	        	map.setCenter(new IMAP.LngLat(rowData.longitude, rowData.latitude),16);
	    	}
	    });
	    //表格左下角导航页
	    $("#jqGrid").jqGrid('navGrid','#jqGridPager',{add:false,del:false,edit:false,search:false,view:false,refreshtext:'刷新'});
	};

	var hide = function() {
		itsGlobal.hideLeftPanel();
	}

	var loadGroups = function() {
	    $.get("aa/group/allData?zdFlag="+1, function(r){
			if(r.code == 200){
				publishApp.groupList = r.groupList;
				publishApp.groupList.unshift({groupName:'所有'});
				require(['bootstrapSelect','bootstrapSelectZh'],function(){
					$('#groupIdQ').selectpicker({
						noneSelectedText:'请选择一个中队',
						liveSearch: true,
						style: 'btn-default',
						size: 10
					});
				});
			}else{
				alert(r.msg);
			}
		});
	}
	
	return {
		show : show,
		hide : hide
	};
})