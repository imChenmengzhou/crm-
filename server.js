var http=require("http"),
fs=require("fs"),
url=require("url");
//创建一个服务
var server1=http.createServer(function(req,res){
//解析客户端请求地址中的文件的目录名称以及传递给当前服务器的数据内容
var urlObj=url.parse(req.url,true),
    pathname=urlObj.pathname,
    query=urlObj["query"];

//处理静态资源文件的请求（HTML/CSS/JS...） ---- 前端路由！！！！
//IE浏览器不能自动识别后缀名代表的文件类型，需要我们完善代码告诉它
var reg = /\.(HTML|JS|CSS|JSON|TXT|ICO|JPG|GIF|PNG|BMP)/i;
if(reg.test(pathname)){
    //获取请求文件的后缀名--suffix 
    var suffix=reg.exec(pathname)[1].toUpperCase();
    //根据请求文件的后缀名获取到当前文件的MIME类型
    var suffixMIME = "text/plain";       //TXT文本的MIME类型
    switch(suffix){
        case "HTML":
            suffixMIME="text/html";
            break;
        case "CSS":
            suffixMIME="text/css";
            break;   
        case "JS":
            suffixMIME="text/javascript";
            break; 
        case "JSON":
            suffixMIME="application/json";
            break;
        case "ICO":
            suffixMIME="application/octet-stream";
            break;
    }
        try{
            //按照指定的目录读取文件中的代码或内容（读取出来的内容都是字符串格式的！！！）

            //重写响应头信息！告诉客户端的浏览器我返回的内容是什么样的MIME类型--格式！
            //res.writeHead(200,{'content-type':'text/html;charset=utf=8;'})   正常应该是这样写！指定返回内容是utf-8编码，中文不会乱码
            var conFile=fs.readFileSync("."+pathname,"utf-8");
            res.writeHead(200,{'content-type':suffixMIME+';charset=utf-8;'})
            //服务端向客户端返回的内容应该也是字符串！！
            res.end(conFile);
        }catch(e){
            res.writeHead(404,{'content-type':'text/plain;charset=utf-8;'})
            res.end("requset file is not find!");
        }
        return;
    }    //if结束
     
    //->API数据接口的处理
    //1)获取所有的客户信息
    // if(pathname === "./getList")

});
//为当前服务配置端口
server1.listen("8001",function(){
console.log("server is success,listening on 8001 port");
})