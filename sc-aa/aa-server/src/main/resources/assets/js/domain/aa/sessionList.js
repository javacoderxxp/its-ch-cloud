$(function () {
	vm.query();
});

var vm = new Vue({
	el:'#vue-app',
	data:{
		sessionList: [],
		validCnt: 0,
		invalidCnt: 0,
	},
	methods: {
		query: function () {
			$.ajax({
				url: ctx+"onlineSessions",
				success: function(rslt){
					if(rslt.code == 200){
						vm.sessionList = rslt.sessionList;
						vm.validCnt = rslt.validCnt;
						vm.invalidCnt = rslt.invalidCnt;
					}else{
						alert(rslt.msg);
					}
				}
			});
		},
		kickout: function (sessionId) {
			confirm('确定踢出用户？', function(){
				$.ajax({
					type: "POST",
				    url: ctx+"kickoutSession?sessionId="+sessionId,
				    success: function(rslt){
						if(rslt.code == 200){
							alert('操作成功');
							vm.query();
						}else{
							alert(rslt.msg);
						}
					}
				});
			});
		}
	}
});