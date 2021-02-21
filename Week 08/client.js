/** http请求设计的思路
 * // 第一步 构建服务器和http请求
 * 1、设计一个http请求的类
 * 2、Content-Type是一个必须的字段
 * 3、body是一个KV格式
 * 4、不同Content-type影响body返回的不同
 * 
 * 第二步 设计一个send函数
 * 1、在request中收集信息
 * 2、把真实的请求通过send函数发送到服务器中
 * 3、send是一个异步函数，需要返回一个Promsie
 * 
 * 第三步  发送请求
 * 1、
*/
var net = require('net');

class Http{
  constructor(props) {
    this.header = props.header || {};
    this.method = props.method || 'GET';
    this.port = props.port || 80;
    this.host = props.host;
    this.path = props.path || '/';
    this.body = props.body;
    this.bodyText = this.body;
    // 默认Content-Type为application/x-www-form-urlencoded Content-Type是一个必须的字段
    if(!this.header['Content-Type']) {
      this.header['Content-type'] = 'application/x-www-form-urlencoded';
      // 对不同的Content-Type进行处理
    } else if(this.header['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    } else if(this.header['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`);
    }
    this.header['Content-Length'] = this.bodyText.length;
  }
  send(connection) {
    return new Promise((resolve, reject) => {
      const parse = new ResponseParse;
      // 建立一个请求
      if(connection) {
        connection.write(this.toString())
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.host
        }, () => {
          connection.write(this.toString())
        })
      }
      // 监听当前请求的数据信息 无论成功失败都要把这个请求给关闭
      connection.on('data', data => {
        parse.receive(data.toString());
        if(parse.isFinished) {
          resolve(parse.response);
        }
        connection.end();
      })
      connection.on('error', error => {
        reject(error);
        connection.end();
      })
    })
  }
  toString() {
    /**
     * GET/HTTP/1.1
     * HOST 127.0.0.1
     * Content-Type application/json
     */
    const message = `${this.method} ${this.path} HTTP/1.1\r
    ${Object.keys(this.header).map(key => `${key}=${this.header[key]}`).join('\r\n')}\r\n${this.bodyText}`;
    return message;
  }
}

class ResponseParse {
  constructor(options) {

  }
  receive(str) {
    for(let k in str) {
      this.char(str.chatAt(k))
    }
  }

  char() {

  }
}


void async function () {
  const http = new Http({
    method: 'POST',
    path: '/',
    port: '8989',
    host: '127.0.0.1',
    header: {
      'Content-Type': 'application/json',
    },
    body: {
      name: 'http'
    }
  });
  const response = await http.send();
  console.log(response, 'response')
}()