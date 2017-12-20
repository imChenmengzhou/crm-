(function(){
//createXhr :创建ajax对象，兼容所有浏览器
function createXhr(){
	var xhr = null;
	if(window.XMLHttpRequest){
		xhr = new XMLHttpRequest();
	}else{
		//ie6
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xhr;
}
//ajax:实现ajax请求的公共方法
//当一个方法传递的参数值过多，而且还不固定，我们使用对象统一传值法（把需要传递的参数值都先放在一个对象中，一起传递进去即可）
function ajax(options){
//	options
//把需要使用的参数值设置一个规则和初始值
	var _default ={
		url :"",                   //请求地址
		type :"get",          //请求方式
		dataType :"json",  //设置请求回来的内容格式   "json"返回的就是json格式的对象  "txt"返回的就是字符串
		async :true,          //同步或异步
		data :null,            //放在请求主体中的内容
		getHead :null,        //当readyState==2时执行的回调方法
		success :null          //当readyState==4时执行的回调方法
	};
	//使用用户自己传递进来的值覆盖默认值
	for(var key in options){
		if(options.hasOwnProperty(key)){           //只把私有的方法遍历到
			_default[key] = options[key];
		}
	}
	//如果当前是get请求，那么需要在Url末尾加随机数清除缓存！
	if(_default.type === "get"){
//		_default.url+="?_="+Math.random();    这种方法无法判断原来url里有没有问号，若有问号，则应该加&，故还需再判断
		_default.url.indexOf("?")>=0?_default.url+="&":_default.url+="?";
		_default.url+="_="+Math.random();
	}
	
	//Send ajax
	var xhr = createXhr();
	xhr.open(_default.type,_default.url,_default.async);
	xhr.onreadystatechange=function(){
		if(/^2\d{2}$/.test(xhr.status)){
			//想要在readyState==2时做一些操作，需要保证ajax是异步请求！
			if(xhr.readyState===2){
				if(typeof _default.getHead === "function"){
					_default.getHead.call(xhr);
				}
			}
			if(xhr.readyState===4){
				var val = xhr.responseText;
				//如果传递的参数数据格式是json,说明获取的内容应该是json格式的对象
				if(_default.dataType === "json"){
					val = "JSON" in window?JSON.parse(val):eval("("+val+")");
				}
				_default.success && _default.success.call(xhr,val);
			}
		}
	};
	xhr.send(_default.data);
}
	window.ajax = ajax;
})();
//用法
//ajax({
//	url :"data.txt",
//	type:"get",
//	dataType:'json',
//	async:false,
//	getHead:function(){
//		//this-当前ajax对象
//	},
//	success:function(data){
//		//this-当前ajax对象
//		//data:我们从服务器获取的主体内容
//		[{"name":''}]
//	}
//})
