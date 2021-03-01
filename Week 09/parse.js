/***
 * DOM树构建
第一步
- 为了方便理解，把paser单独拆分出来
- paser接受html文本，并且把它渲染成DOM树

第二步
- 会使用FSM(状态机)来进行html的分析
- 状态机的状态沿用html的标准状态
- 当前我们简易版的状态机不会实现所有的状态

第三步
- 主要标签有：开始标签、结束标签、自封闭标签
- 当前不会忽略所有的属性


第四步
- 在状态机中进行逻辑处理
- 在结束标签中提交token

第六步  构建dom树
- 从标签构建dom树的使用技巧是栈
- 每个标签在开始标签的时候入栈，在结束的时候出栈
- 自封闭标签直接入栈后立刻出栈
- 任何元素的父元素都是它的栈顶

CSSOM树构建
第一步
- 遇到style时，需要把css规则保存起来
- 调用CSS Parse来分析css语法规则
- 需要仔细研究此库分析css的格式
 * 
 **/
const css = require('css');
let currentToken = null;
const EOF = Symbol('EOF'); // line of end 创建一个独一无二的状态终止符
let currentAttribute = {};
const stack = [{ type: 'document', children: [] }];
let currentTextNode = null;
// 提交函数
function emit(token) {

  // 获取每个的父元素作为栈顶
  const top = stack[stack.length - 1];
  if (token.type === 'startTag') {
    // 在dom树中，只有document和element
    let element = {
      type: 'element',
      children: [],
      attributes: [],
    }
    // 获取元素tag属性
    element.tagName = token.tagName;
    for (let key in token) {
      // 获取元素的属性
      if (key !== 'tagName' && key !== 'type') {
        element.attributes.push({
          name: key,
          value: token[key],
        })
      }
    }

    // 设置元素父元素
    element.parent = top;
    // 将字元素放进去
    top.children.push(element);
    // 不为自封闭标签时候，入栈，因为自封闭是没有子元素的
    if (!token.isSelfClose) { stack.push(element) };
    currentTextNode = null;
  } else if (token.type === 'endTag') {
    // 当标签不匹配时候，报错（正常浏览器会把为封闭的标签自封闭）
    if (token.tagName !== top.tagName) {
      throw new Error('Tag start end doesn‘t match');
    } else {
      // 出栈，入栈的目的是为了能获取到父元素
      stack.pop();
    }
    currentTextNode = null;
   // 当为文本节点的时候
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: '',
      }
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
};


// 处理状态的函数
function data(c) {
  if (c === '<') {
    return tagOpen;
  } else if (c === EOF){
    // 结束符标记
    emit({
      type: 'EOF'  
    });
    return;
  } else {
    // 直接提交当前字段
    emit({
      type: 'text',
      content: c
    })
    return data ;
  }
}

function tagOpen(c) {
  if (c === '/') {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    // 开始标签
    currentToken = {
      type: 'startTag',
      tagName: "",
    }
    // 需要进入tagName在进行新的匹配
    return tagName(c);
  } else {
    return;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    // 结束标签
    currentToken = {
      type: 'endTag',
      tagName: "",
    }
    return tagName(c);
  } else if(c === '>') {
   
  } else if( c === EOF) {
    
  }
}

function tagName(c) {
  // 如果标签后面加空格的话,后面一般跟的是属性
  if (c.match(/^[\n\t\f ]/)) {
    return beforeAttributeName;
  // 如果跟的是/ 那么他是一个自封闭标签
  } else if (c === '/') {
    return selfCloseingTagStart;
  // 否则为正常的标签名
  } else if (c.match(/^[a-zA-Z]$/)) {
    // 需要把标签名拼接起来
    currentToken.tagName += c;
    return tagName;
  // 如果是> 说明标签结束，开始新的标签机芯
  } else if (c === '>') {
    // 当整个标签结束时候提交标签
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  // >标签终止
  if (c.match(/^[\n\t\f ]/)) {
    return beforeAttributeName;
  } else if(c === '>' || c === '/' || c === EOF) {
    afterAttributeName(c);
  } else {
    currentAttribute = {
      name: '',
      value: '',
    }
    return attributeName(c);
  }
}

function attributeName(c) {
  // 当为空格，/ > 或者结束符时，那么说明属性匹配已经结束了
  if (c.match(/^[\n\t\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c)
    // 为=那么说明要开始读取属性值
  } else if (c === '=') {
    return beforeAttributeValue;
  } else if(c === '\'' || c === '\"' || c === '/') {

  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\n\t\f ]/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue;
    // 双引号
  } else if(c === '\"') {
    return doubleQuoteAttributeValue;
  } else if(c === '\'') {
    // 单引号
    return singleQuoteAttributeValue;
  } else if (c === '>') {
    
  } else {
    // 无引号
    return UnquotedAttributeValue(c);
  }
}

function doubleQuoteAttributeValue(c) {
  // 当在检测到"时，说明属性已经读取完毕了
  if(c === '\"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
   } else if(c === EOF) {

  } else if (c === '\u0000') {

  } else {
    currentAttribute.value += c;
    return doubleQuoteAttributeValue;
  }
} 

function singleQuoteAttributeValue(c) {
  if(c === '\"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if(c === EOF) {

  } else if (c === '\u0000') {

  } else {
    currentAttribute.value += c;
    return singleQuoteAttributeValue;
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\n\t\f ]/)) {
    return beforeAttributeName;
  } else if (c === '/') { 
    return selfCloseingTagStart;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
    
  } else{
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function UnquotedAttributeValue(c) {
  // 检测为空格时候  说明开始了新属性
  if (c.match(/^[\n\t\f ]/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if(c === '/') {
    // 自子封闭标签
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfCloseingTagStart;
  } else if(c === '>') {
    // 为>说明属性已经结束了， 那么提交
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}

function afterAttributeName(c) {
  // 检测到空格说明要开始新的属性匹配
  if (c.match(/^[\n\t\f ]/)) {
    return afterAttributeName;
  } else if (c === '/') {
    return selfCloseingTagStart;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken)
    return data;
  } else if (c === EOF) {
    
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name:"",
      value:""
    }
    return attributeName(c);
  }
} 

function selfCloseingTagStart(c) {
  if(c === '>') {
    // 标记自封闭标签
    currentToken.isSelfClose = true;
    return data;
  } else {

  }
}



module.exports.parseHtml = function parseHtml(html) {
  let state = data;
  // 把html里面的内容遍历处理进行状态处理
  for(let k of html) {
    state = state(k);
  }
  // 当前标识处理终结符，当前状态已经处理完毕
  state = state(EOF);
console.log(stack[0])
  return stack[0];
}