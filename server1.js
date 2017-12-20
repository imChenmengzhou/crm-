var http = require("http"),
       url = require("url"),
       fs = require("fs");
       //创建一个服务
var server1 = http.createServer(function (req,res) {
	//解析url
	var urlObj = url.parse(req.url,true),
	       pathname = urlObj.pathname,
	       query = urlObj.query;     //存储的是客户端请求的URL地址中问号传参后面的信息（加true后，信息以键值对方式存储）
	var reg = /\.(HTML|CSS|JS|JSON)/i;
	if(reg.test(pathname)){
		var suffix = reg.exec(pathname)[1].toUpperCase();
		var suffixMIME = "text/html";
		switch(suffix){
			case "CSS":
				suffixMIME = "text/css";
				break;
			case "JS":
				suffixMIME = "text/javascript";
				break;
			case "JSON":
				suffixMIME = "application/json";
				break;
		}
		//读取内容并重写
		try{
			var conFile = fs.readFileSync("."+pathname,"utf-8");       //读取的都是字符串形式
			res.writeHead(200,{"content-type":suffixMIME+";charset=utf-8"});
			res.end(conFile);
		}catch(e){
			res.writeHead(404,{"content-type":"text/plain;charset=utf-8"});
			res.end("request file is not find!");
		} 
	}//if结束
	//API接口的处理
	var con = null,
	       result = null,
	       customId = null,
	       customPath = "./json/customer.json";
	 //(1)收先我们把customer.json中的内容都获取到，即43-46和70-72代码可提取出来，放到此处
	if(pathname ==="/getList"){
		//(1)获取所有客户信息
		con = fs.readFileSync(customPath,"utf-8");
		con.length===0?con='[]':null;   //为了防止json文件中什么都没有，con是一个空字符串，使用JSON.parse转换的时候会
		//报错，我们让其等于一个空数组。null为不做处理的意思！
		con = JSON.parse(con);     //将json字符串转化为json对象

		//开始按照API文档中的规范准备给客户端返回的数据
		result = {
			"code" : 1,
			"msg" :"没有任何的客户信息",
			"data" :null
		};
		if(con.length>0){
			result = {
				"code" : 0,
				"msg" :"成功",
				"data" : con
			}
		}
		res.writeHead(200,{'content-type':'application/json;charset=utf-8'});
		res.end(JSON.stringify(result));        //将result对象转化为json字符串
		return;
	}

	//（2）根据传来的ID获取具体的客户信息
	if(pathname === "/getInfo"){
		//把客户端传递的ID获取到（利用query）
		customId = query.id;
		con = fs.readFileSync(customPath,"utf-8");
		con.length === 0 ?con = '[]':null;
		con = JSON.parse(con);   //con成为一个数组对象
		result = {
			code :1,
			msg :"当前请求的客户不存在",
			data:null
		}
		for (var i=0;i<con.length;i++){
			if(con[i]["id"] == customId){
				result = {
					code :0,
					msg :"成功",
					data :con[i]
				};
				break;
			};
			
		}
		res.writeHead(200,{'content-type':'application/json;charset=utf-8'});
		res.end(JSON.stringify(result));        //将result对象转化为json字符串
		return;
	}

	//(3)根据客户端传来的ID，删除该客户信息
	if(pathname === "/removeInfo"){
		customId = query["id"];
		con = fs.readFileSync(customPath,"utf-8");
		con.length === 0 ?con = '[]':null;
		con = JSON.parse(con);   //con成为一个数组对象
		var flag =false;   //假设当前没有删除
		//以上三行是重复代码
		for(var i=0;i<con.length;i++){
			if(con[i]["id"]==customId){
				con.splice(i,1);
				flag =true;
				break;
			}else{
				result = {
				code :1,
				msg:"删除失败"
				}
			}
		}		
		if(flag){
			fs.writeFileSync(customPath,JSON.stringify(con),"utf-8");
			result ={
				code :0,
				msg:"删除成功"
			};
		}
		res.writeHead(200,{'content-type':'application/json;charset=utf-8'});
		res.end(JSON.stringify(result));        //将result对象转化为json字符串
		return;
	}

	//(4)增加客户信息
	if(pathname === "/addInfo"){
		con = fs.readFileSync(customPath,"utf-8");
		con.length === 0 ?con = '[]':null;
		con = JSON.parse(con);   //con成为一个数组对象
		//获取客户端通过请求主体传递进来的内容  -- POST方法
		var str ='';
		req.on("data",function (chunk) {
			str +=chunk;
		});
		req.on("end",function () {
			//str='{"name":"","age":"","phone":"","address":""}'
			if(str.length ===0){
				res.writeHead(200,{'content-type':'application/json;charset=utf-8'});
				res.end(JSON.stringify({
					code:1,
					msg:"增加失败，没有传递任何需要添加的信息"
				}));        //将result对象转化为json字符串
				return;
			} 
			var data = JSON.parse(str);
			//在现有的DATA中增加一个ID；获取CON中最后一项的ID，新一项的ID就是原有基础+1
			//如果之前一项都没有。那么ID为1
			if(con.length ===0){
				data["id"]=1;
			}else{
				data["id"]=parseFloat(con[con.length-1]["id"])+1;      //防止获取到的id为字符串，所有转换一下
			}
			con.push(data);
			fs.writeFileSync(customPath,JSON.stringify(con),"utf-8");
			res.end(JSON.stringify({
				code:0,
				msg:"增加成功！"
			}));
		});
		return;
		//以上通过on绑定的data和end事件都是异步编程的！！！
		//console.log(str);   输出为空
	}

	//(5)修改客户信息
	if(pathname === "/updateInfo"){
		con = fs.readFileSync(customPath,"utf-8");
		con.length === 0 ?con = '[]':null;
		con = JSON.parse(con);   //con成为一个数组对象
		str='';
		req.on("data",function (chunk) {
			str+=chunk;
		});
		req.on("end",function () {
			if(str.length ===0){
				res.writeHead(200,{'content-type':'application/json;charset=utf-8'});
				res.end(JSON.stringify({
					code:1,
					msg:"修改失败，没有传递任何需要修改的信息"
				}));        //将result对象转化为json字符串
				return;
			};
			var flag=false;
			var data = JSON.parse(str);
			for(var i=0;i<con.length;i++){
				if(con[i]["id"]==data["id"]){
					con[i]=data;
					flag = true;
					break;
				}else{
					result={
						code:1,
						msg:"修改失败，需要修改的客户不存在"
					}
				}
			}			
			if(flag){
				fs.writeFileSync(customPath,JSON.stringify(con),"utf-8");
				result={
					code:0,
					msg:"修改成功！"
				}
			}
			res.writeHead(200,{'content-type':'application/json;charset=utf-8'});
			res.end(JSON.stringify(result));				
		})
		return;
	}
	//如果请求的地址不是上面任何一种，则做出错误提示
	res.writeHead(404,{'content-type':'text/plain;charset=utf-8'});
	res.end("请求的数据接口不存在！");		
});
server1.listen("800",function () {
	console.log("server is running at 800 port!")
})