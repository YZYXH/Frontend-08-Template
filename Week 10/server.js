var http = require('http');
var fs = require('fs');

const responseBody =`<style>#main { width: 100px; display: flex; flex-wrap: wrap; background-color:rgb(0,0,255);} .content {width: 200px; height: 200px;  background-color:rgb(0,255,255);} .content1 { width: 100px; height: 100px; background-color:rgb(255,255,0);}</style><div id="main"><p class="content">hello</p><div class="content1">world</div></div>`;

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
