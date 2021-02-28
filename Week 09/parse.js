/***
第一步
- 为了方便理解，把paser单独拆分出来
- paser接受html文本，并且把它渲染成DOM树

第二步
- 会使用FSM(状态机)来进行html的分析
- 状态机的状态沿用html的标准状态
- 当前我们简易版的状态机不会实现所有的状态

第三步
- 主要标签有：开始标签、结束标签、自封闭标签
- 当前不会忽略所有的属性


第四步
- 在状态机中进行逻辑处理
- 在结束标签中提交token
 * 
 **/
let currentToken = null;
const EOF = Symbol('EOF'); // line of end 创建一个独一无二的状态终止符
let currentAttribute = {};

// 提交函数
function emit(token) {
  console.log(token, '9999');
};


// 处理状态的函数
function data(c) {
  if (c === '<') {
    return tagOpen;
  } else if (c === 'EOF'){
    // 结束符标记
    emit({
      type: 'EOF'  
    });
    return;
  } else {
    // 直接提交当前字段
    emit({
      type: 'text',
      content: c
    })
    return data;
  }
}

function tagOpen(c) {
  if (c === '/') {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    // 开始标签
    currentToken = {
      type: 'startTag',
      tagName: "",
    }
    // 需要进入tagName在进行新的匹配
    return tagName(c);
  } else {
    return;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    // 结束标签
    currentToken = {
      type: 'endTag',
      tagName: "",
    }
    return tagName(c);
  } else if(c === '>') {
   
  } else if( c === EOF) {
    
  }
}

function tagName(c) {
  // 如果标签后面加空格的话,后面一般跟的是属性
  if (c.match(/^[\n\t\f ]/)) {
    return beforeAttributeName;
  // 如果跟的是/ 那么他是一个自封闭标签
  } else if (c === '/') {
    return selfCloseingTagStart;
  // 否则为正常的标签名
  } else if (c.match(/^[a-zA-Z]$/)) {
    // 需要把标签名拼接起来
    currentToken.tagName += c;
    return tagName;
  // 如果是> 说明标签结束，开始新的标签机芯
  } else if (c === '>') {
    // 当整个标签结束时候提交标签
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  // >标签终止
  if (c.match(/^[\n\t\f ]/)) {
    return beforeAttributeName;
  } else if(c === '>' || c === '/' || c === EOF) {
    afterAttributeName(c);
  } else {
    currentAttribute = {
      name: '',
      value: '',
    }
    return attributeName(c);
  }
}
function afterAttributeName(c) {

}

function attributeName(c) {
  // 当为空格，/ > 或者结束符时，那么说明属性匹配已经结束了
  if(c.match(/^[\n\t\f ]/) || c === '/' || c === '>' || c === EOF) {
    afterAttribute(c)
    // 为=那么说明要开始读取属性值
  } else if(c === '=') {
    beforeAttributeValue(c);

  } else if(c === '\'' || c === '\"' || c === '/') {

  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function beforeAttributeValue(c) {
  if(c.match(/^[\n\t\f ]/) || c === '/' || c === '>' || c === EOF) {
    return afterAttributeValue;
    // 双引号
  } else if(c === '\"') {
    doubleQuoteAttributeValue(c);
  } else if(c === '\'') {
    // 单引号
    singleQuoteAttributeValue(c);
  } else {
    // 无引号
    unQuoteAttributeValue(c);
  }
}

function doubleQuoteAttributeValue(c) {
  if(c === '\"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
   }else if(c === EOF) {

  } else {
    currentAttribute.value += c;
    return doubleQuoteAttributeValue;
  }
} 

function singleQuoteAttributeValue(c) {
  if(c === '\"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
  } else if(c === EOF) {

  } else {
    currentAttribute.value += c;
    return singleQuoteAttributeValue;
  }
}

function unQuoteAttributeValue(c) {
  // 检测为空格时候  说明开始了新属性
  if(c.match(/^[\n\t\f ]/)) {
    return beforeAttributeName;
  } else if(c === '/') {
    // 自子封闭标签
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfCloseingTagStart;
  } else if(c === '>') {
    // 为>说明属性已经结束了， 那么提交
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  }
}

function afterAttributeValue(c) {

} 

function selfCloseingTagStart(c) {
  if(c === '>') {
    // 标记自封闭标签
    currentToken.isSelfClose = true;
    return data;
  } else {

  }
}



module.exports.parseHtml = function parseHtml(html) {
  let state = data;
  // 把html里面的内容遍历处理进行状态处理
  for(let k of html) {
    state = state(k);
  }
  // 当前标识处理终结符，当前状态已经处理完毕
  state = state(EOF);
}