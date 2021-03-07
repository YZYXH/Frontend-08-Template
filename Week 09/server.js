var http = require('http');
var fs = require('fs');

const responseBody =`<style>#main { width: 100px; display: flex;}</style><div id="main"><p>hello</p><div>world</div></div>`;

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