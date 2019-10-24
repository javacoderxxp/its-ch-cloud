var classMap={};
$(function () {
	
	var searchStr = location.search;
	 
	//由于searchStr属性值包括“?”，所以除去该字符
	searchStr = searchStr.substr(1);
	 
	//获得第一个参数和值
	var id = searchStr.split("=");
	loadDicts(id[1]);
});

var vm = new Vue({
	el: '#validCatch-panel',
	data: {
		showList: true, //显示查询
		validCatch: {},
		groupList:[],
		plateTypeDicts:[],
		imgPaths:[],
		hPaths:[]
	},
	methods: {
		edit: function(id){
			$.ajax({
				url: "../../../../qw/validCatch/detail/"+id,
				success: function(rslt){
					if(rslt.code == 200){
						vm.validCatch = rslt.validCatch;
						if(vm.validCatch.type == "CL"){
							vm.validCatch.type = "车辆";
							vm.showList = true;
						}
						if(vm.validCatch.type == "JSY"){
							vm.validCatch.type = "驾驶员";
							vm.showList = false;
						}
						if(vm.validCatch.module == "BKBJ"){
							vm.validCatch.module ="布控告警";
						}
						if(vm.validCatch.module == "FXBJ"){
							vm.validCatch.module ="分析告警";
						}
						if(vm.validCatch.module == "BJBK"){
							vm.validCatch.module = "部局布控";
						}
						if(vm.validCatch.module == "QT"){
							vm.validCatch.module = "其他";
						}
						vm.validCatch.catchHpzl = classMap[vm.validCatch.catchHpzl];
							
						//vm.validCatch.groupId
						
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
		imgOnclick: function(url) {
			imgShow("#outerdiv", "#innerdiv", "#bigimg", url);
		},
		openFileUpload: function(id) {
			//alert(1);
			document.getElementById("fileupload").click(); 
		}
	}
});


var loadDicts = function(id) {
    $.get("../../../../sys/dict/getDictList?type=PLATE_TYPE", function(r){
		if(r.code == 200){
			vm.plateTypeDicts = r.dictList;
			classMap=forMap(vm.plateTypeDicts);
			vm.edit(id);
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

function pingTaiPath(polygonStr) {
	var lngLatArray= [];
	polygonStr= polygonStr.trim();
	var polygonArr = polygonStr.split(",");
	for (var i = 0; i < polygonArr.length; i++) {
		var lnglatStr = polygonArr[i];
		lngLatArray.push("../../../../"+lnglatStr);
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

