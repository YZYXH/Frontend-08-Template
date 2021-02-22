var http = require('http');

http.createServer((req,res) => {
  let body = [];
  req.on('error', (error) => {
    console.log(error)
  }).on('data', (chunk) => {
    body.push(chunk)
  }).on('end', () => {
    // 创建一个专门存储二进制的缓冲区来存储body内容，因为处理TCP流和文件流时需要二进制
    body = Buffer.concat(body).toString();
    console.log('body:', body);
    // 设置header
    res.writeHead(200, {'Content-Type': 'text/html'});
    // 设置服务器返回内容
    res.end('Hello World');
  })
  
}).listen(8989);
console.log('server start');