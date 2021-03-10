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
 * 1、设计支持已有的connection或者新建connection
 * 2、把接受到的数据发送到parse
 * 3、根据parse的状态resolve Promise
*/
var net = require('net');
var parse = require('./parse');
class Request{
  constructor(props) {
    this.headers = props.headers || {};
    this.method = props.method || 'GET';
    this.port = props.port || 80;
    this.host = props.host;
    this.path = props.path || '/';
    this.body = props.body || {};
    // 默认Content-Type为application/x-www-form-urlencoded Content-Type是一个必须的字段
    if(!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      // 对不同的Content-Type进行处理
    }
    if(this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    } else if(this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      // 此处的解析需要注意格式需要为表单形式
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
    }
    this.headers['Content-Length'] = this.bodyText.length;
  }
  send(connection) {
    return new Promise((resolve, reject) => {
      const parse = new ResponseParser;
      // 建立一个请求
      if(connection) {
        connection.write(this.toString())
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.port,
        }, () => {
          console.log(this.toString())
          connection.write(this.toString());
        })
      }
      // 监听当前请求的数据信息 无论成功失败都要把这个请求给关闭
      connection.on('data', data => {
        console.log(data.toString())
        parse.receive(data.toString());
        if(parse.isFinished) {
          resolve(parse.response);
        }
        connection.end();
      });
      connection.on('error', error => {
        console.log(error, 'error')
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
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(k => `${k}: ${this.headers[k]}`).join('\r\n')}\r
\r
${this.bodyText}`
  }
}

// 相应数据处理
class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0;
    this.WAITING_STATUS_LINE_END = 1;
    this.WAITING_HEADER_NAME = 2;
    this.WAITING_HEADER_SPACE = 3;
    this.WAITING_HEADER_VALUE = 4;
    this.WAITING_HEADER_LINE_END = 5;
    this.WAITING_HEADER_BLOCK_END = 6;
    this.WAITING_BODY = 7;
    this.headers = {};
    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = '';
    this.headerName = '';
    this.headerValue = '';
    this.bodyParse = null;
  }
  receive(str) {
    for(let i = 0; i < str.length; i++) {
      this.receiveChar(str.charAt(i))
    }
  }

  // 是否完成状态
  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished
  }
  // 返回相应信息
  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join('')
    }
  }

  // 对接收到的数据进行处理
  receiveChar(char) {
    if (this.current === this.WAITING_STATUS_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_STATUS_LINE_END
      } else {
        this.statusLine += char
      }
    } else if (this.current === this.WAITING_STATUS_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    } else if (this.current === this.WAITING_HEADER_NAME) {
      if (char === ':') {
        this.current = this.WAITING_HEADER_SPACE
      } else if (char === '\r') {
        this.current = this.WAITING_HEADER_BLOCK_END
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new TrunkedBodyParser()
        }
      } else {
        this.headerName += char
      }
    } else if (this.current === this.WAITING_HEADER_SPACE) {
      if (char === ' ') {
        this.current = this.WAITING_HEADER_VALUE
      }
    } else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === '\r') {
        this.current = this.WAITING_HEADER_LINE_END
        this.headers[this.headerName] = this.headerValue
        this.headerName = ''
        this.headerValue = ''
      } else {
        this.headerValue += char
      }
    } else if (this.current === this.WAITING_HEADER_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      if (char === '\n') {
        this.current = this.WAITING_BODY
      }
    } else if (this.current === this.WAITING_BODY) {
      this.bodyParser.receiveChar(char)
    }
  }
}

// 相应数据body解析
class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0
    this.WAITING_LENGTH_END = 1
    this.READING_TRUNK = 2
    this.WAITING_NEW_LINE = 3
    this.WAITING_NEW_LINE_END = 4
    this.length = 0
    this.content = []
    this.isFinished = false
    this.current = this.WAITING_LENGTH
  }
  receiveChar(char) {
    if (this.current === this.WAITING_LENGTH) {
      if (char === '\r') {
        if (this.length === 0) {
          this.isFinished = true
        }
        this.current = this.WAITING_LENGTH_END
      } else {
        this.length *= 16
        this.length += parseInt(char, 16)
      }
    } else if (this.current === this.WAITING_LENGTH_END) {
      if (char === '\n') {
        this.current = this.READING_TRUNK
      }
    } else if (this.current === this.READING_TRUNK) {
      this.content.push(char)
      this.length--
      if (this.length === 0) {
        this.current = this.WAITING_NEW_LINE
      }
    } else if (this.current === this.WAITING_NEW_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_NEW_LINE_END
      }
    } else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_LENGTH
      }
    }
  }
}

void async function () {
  const http = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: 8989,
    headers: {
    },
    body: {
      name: 'ken',
    }
  });
  // const http = new Http({
  //   method: 'GET',
  //   host: 'www.baidu.com',
  //   port: 80,
  //   // header: {
  //   //   'Content-Type': 'application/x-www-form-urlencoded',
  //   // },
  //   // body: {
  //   //   name: 'http'
  //   // }
  // });
  const response = await http.send();
  console.log(response, 'response');
//   // 获取到接口返回的html数据
  const dom = parse.parseHtml(response.body);
   // 设定绘画的范围
  let viewport = images(800, 600);
  render(viewport, dom)
  // // 保存当前的绘画文件
  viewport.save('viewport.jpg');
// console.log(dom.children[1].computedStyle)
// console.log(000000111111);
}()
