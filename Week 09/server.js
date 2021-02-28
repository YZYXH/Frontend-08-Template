var http = require('http');
var fs = require('fs');

http.createServer((request, response) => {
  let body = [];
  request.on('error', error => {
    console.log('error', error);
  }).on('data', chunk => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<html><body><p id="p">Hello World</p ></body></html>');
  })
}).listen(8989);
console.log('server start');