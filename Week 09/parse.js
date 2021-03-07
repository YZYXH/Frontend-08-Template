/***
 * DOM树构建
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
- 遇到style时，需要把css规则保存起来
- 调用CSS Parse来分析css语法规则
- 需要仔细研究此库分析css的格式

第二步
- 当我们创建一个css元素的时候，就要去进行css计算（意思是：在startTag的时候进去计算）
- 当我们进行css分析的时候，理论上认为css规则已经收集完毕了
- 此处我们只分析直接的style情况，写在body上的在计算style不做考虑

第三步
- computeCSS中我们必须要知道所有的父元素才能进行匹配
- 在stack中我们可以获取到所有的父元素
- 由于在css中 我们最先获取的是当前元素，是一个从内向外的选择过程和我们的stack是相反的，因此需要对之前的数据进行reverse

第四步
- 选择器也要从当前像外排列
- 复杂选择器可以拆成简单选择器，然后循环去匹配父元素
 * 
 **/
const css = require('css');
const layout = require('./layout');
let currentToken = null;
const EOF = Symbol('EOF'); // line of end 创建一个独一无二的状态终止符
let currentAttribute = {};
const stack = [{ type: 'document', children: [] }];
let currentTextNode = null;
let rules = [];

// css处理函数
function cssRules(content) {
  const ruleContent = css.parse(content);
  rules.push(...ruleContent.stylesheet.rules);
}

// css优先级计算函数
function specificity(select) { 
  // select 类似body div #img-id
  const selects = select.split(' ');
  let p = [0, 0, 0, 0];
  for (let key of selects) {
    if (key.charAt(0) === '#') {
      p[1] += 1; 
    } else if (key.charAt[1] === '.') {
      p[2] += 1
    } else {
      p[3] += 1;
    }
  }
  return p;
}

// 优先级比较函数
function compare(sp1, sp2) {
  // 依次去比较优先级
  if (sp1[0] - sp2[0]) return sp1[0] - sp2[0];
  if (sp1[1] - sp2[1]) return sp1[1] - sp2[1];
  if (sp1[2] - sp2[2]) return sp1[2] - sp2[2];
  return sp1[3] - sp2[3];
}

// css和html匹配函数
function match(element, select) {
  const attributes = element.attributes || '';

  // 没有匹配规则，或者当前元素为文本节点
  if (!select || !attributes) return false;

  // 如果检测到当前第一个字符为#  那么为id选择器
  if (select.charAt(0) === '#') {
    const attr = attributes.filter(v => v.name === 'id')[0];
    if (attr && attr.value === select.replace('#', '')) return true;

  // 如 果检测到第一个字符为.  那么为class选择器
  } else if (select.charAt(0) === '.') {
    const attr = attributes.filter(v => v.name = 'class')[0];
    if (attr && attr.value === select.replace('.', '')) return true;
  } else {

    // 否则为标签选择器
    if (element.tagName === select) return true;
  }
}

// 计算css
function computeCSS(element) {

  // 获取父元素序列，因为stack是会变化的 因此需要slice 同时由于父元素是从外到里  css解析是从里到外 因此需要reverse
  const elements = stack.slice().reverse();
  if (!element.computedStyle) {
element.computedStyle = {};
}
  for (let rule of rules) {
    const rulePares = rule.selectors[0].split(' ').reverse();
    // 如果是当前元素都不匹配的话，那么不需要在像后匹配了
    if (!match(element, rulePares[0])) continue;

    // 是否可以匹配
    let matched = false;
    let j = 1;
    for (let i = 0; i < elements.length; i++) {
      if (match(elements[i], rulePares[j])) {
        j++;
      }
    }
    // j >= rulePares.length说明当前的选择器全部都有匹配到
    if (j >= rulePares.length) matched = true;
    if (matched) {
      const sp = specificity(rule.selectors[0]);
      // 获取计算之后的属性
      const computedStyle = element.computedStyle || {};

      // rule.declarations为当前属性的集合
      for (let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) computedStyle[declaration.property] = { };
        // 如果当前属性不存在的话, 给他赋值
        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
          // 当之前的优先级不如后面的css高的时候，进行css覆盖 否则不做操作
        } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
    }
  }
}


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

    // 计算css属性
    computeCSS(element);

    // 设置元素父元素
    element.parent = top;

    // 将字元素放进去
    top.children.push(element);

    // 不为自封闭标签时候，入栈，因为自封闭是没有子元素的
    if (!token.isSelfClose) { stack.push(element) };
    currentTextNode = null;

  } else if (token.type === 'endTag') {

    // 当为style标签的时候
    if (token.tagName === 'style') {
      cssRules(top.children[0].content)
    }

    // 当标签不匹配时候，报错（正常浏览器会把为封闭的标签自封闭）
    if (token.tagName !== top.tagName) {
      throw new Error('Tag start end doesn‘t match');
    } else {
      // 进行排版
      layout(top);

      // 出栈当前元素已经挂载到父元素上面，入栈的目的是为了能获取到父元素
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
    return data;
  } else if( c === EOF) {
    
  }
}

function tagName(c) {

  // 如果标签后面加空格的话,后面一般跟的是属性
  if (c.match(/^[\t\n\f ]$/)) {
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
  if (c.match(/^[\n\t\f ]/)) {
    return beforeAttributeName;
  } else if(c === '>' || c === '/' || c === EOF) {
    return afterAttributeName(c);
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
  if (c.match(/^[\n\t\f ]$/) || c === '/' || c === '>' || c === EOF) {
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
  if (c.match(/^[\n\t\f ]/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue;

    // 双引号
  } else if(c === '\"') {
    return doubleQuoteAttributeValue;
  } else if (c === '\'') {

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
  if (c.match(/^[\n\t\f ]/)) {
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
  if (c.match(/^[\n\t\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c === '/') {

    // 自子封闭标签
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfCloseingTagStart;
  } else if (c === '>') {

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
  if (c.match(/^[\n\t\f ]/)) {
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
  if (c === '>') {

    // 标记自封闭标签
    currentToken.isSelfClose = true;
    emit(currentToken);
    return data;
  } else {

  }
}



module.exports.parseHtml = function parseHtml(html) {
  let state = data;
  // 把html里面的内容遍历处理进行状态处理
  for (let k of html) {
    state = state(k);
  }
  // 当前标识处理终结符，当前状态已经处理完毕
  state = state(EOF);
  return stack[0];
}