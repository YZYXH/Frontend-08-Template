var http = require('http');
var fs = require('fs');

const responseBody =`<style>#main { width: 100px; display: flex;} .content {width: 200px; height: 200px} .content1 { width: 100px; height: 100px;}</style><div id="main"><p class="content">hello</p><div class="content1">world</div></div>`;

http.createServer((request, response) => {
  let body = [];
  request.on('error', error => {
    console.log('error', error);
  }).on('data', chunk => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(responseBody);
  })
}).listen(8989);
console.log('server start');