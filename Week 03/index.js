 
 
 // 本周学习是根据LL构建一个四则运算解析器

/***
 *  
 * 运算表达式
 <Expression> ::= <AddExpression><EOF>
 加法表达式
 <AddExpression> ::= <MultipleExpression> | <AddExpression><+><MultiplicativeExpression> | <AddExpression><-><MultiplicativeExpression>
 乘法表达式（可以为一个Number | 乘法表达式 *|/Number
 <MultipleExpression> ::= <Number> | <MultipleExpression><*><Number> | <MultipleExpression></><Number>
*/

 // 分别去匹配数字、空格、换行、+、-、*、/
 const regexp = /([[0-9\.]+)|([ \t]+)|([\r\n]+)|(\+)|(\-)|(\*)|(\/)/g

 // 定义匹配类型
 const opation = ["Number", "WhiteSpace", "LineTerminator", "+", "-", "*", "/"];

 // 进行表达式和类型匹配
 function* math(source) {
  let result = null;
  let lastIndex = 0;
  while(true) {
    // 上次检索到的位置
    lastIndex = regexp.lastIndex;
    // exec会检索所有匹配的子表达式
    result = regexp.exec(source);

    // console.log(regexp.lastIndex, lastIndex,'999')
    // 当没有匹配的时候则跳出
    if(!result) break;

    // 新一轮的检索位置-上次检索的位置 = 当前检索的字符长度
    // 如果检索出来的长度大于所要检索的字符长度，那么说明有不能识别的字符
    if(regexp.lastIndex - lastIndex > result[0].length) {
      throw new Error('当前有不符合规范的字符');
    }

    // 创建一个对象来保存当前的数据和类型
    const token = {
      value: null, // 值
      type: null, // 类型
    }

    // 根据正则去匹配当前类型
    for(let i = 0; i <= opation.length - 1; i++) {
      // 进行匹配
      if(result[i + 1]) {
        token.type = opation[i]; // 赋值类型
      }
    }
    // 值为当前去匹配的内容
    token.value = result[0];
    yield token;
  }
  // 当整个词法分析完毕之后，定义一个结束类型 EOF
  yield {
    type: 'EOF'
  }
 
 }
 const ast = math("100 + 12 - 20")

 let source = [];
 for(let token of ast) {
   // 剔除空格和换行符
   if(token.type !== 'WhiteSpace' && token.type !== 'LineTerminator') {
      source.push(token);
   }

 }

/**
 * 乘法处理
 * @param {*处理好的词法数组} source 
 */

 /***
 *  
 * 运算表达式
 加法表达式
  <Expression> ::= <AddExpression><EOF>
 <AddExpression> ::= <MultipleExpression> | <AddExpression><+><MultiplicativeExpression> | <AddExpression><-><MultiplicativeExpression>
 乘法表达式（可以为一个Number | 乘法表达式 *|/Number
 <MultipleExpression> ::= <Number> | <MultipleExpression><*><Number> | <MultipleExpression></><Number>
*/
 function multipleExpression(source) {

  // 为Number的时候
  if(source[0].type === 'Number') {
    // 把当前的type置为MultipleExpression， 同时删除原数组的第一项换成处理好的
    let node = {
      type: 'MultipleExpression',
      children: [source[0]]
    }
    source.shift();
    source.unshift(node);
    return multipleExpression(source)
  }
  // 当第一项为数字的时候，那么来解析第二项是否为*或者触发
  if(source[0].type === 'MultipleExpression' && source[1] && (source[1].type === '*' || source[1].type === '/')) {
    let node = {
      type: 'MultipleExpression',
      operator: source[1].type,
      children: [source.shift(), source.shift(), source.shift()] //  <MultipleExpression> <*> <Number>
    }
    source.unshift(node)
    return multipleExpression(source)
  }

  if(source[0].type === 'MultipleExpression') {
    return source[0];
  }

  // 递归出口，如果第0项不是MultipleExpression，则一直递归自己
  return multipleExpression(source)
   
 }


 /**
 * 加法处理
 * @param {*处理好的词法数组} source 
 * 加法表达式（可为 乘法表达式|加法表达式+|-乘法表达式
 *  <Expression> ::= <AddExpression><EOF>
 <AddExpression> ::= <MultipleExpression> | <AddExpression><+><MultiplicativeExpression> | <AddExpression><-><MultiplicativeExpression></MultiplicativeExpression>
 */
function AddExpression(source) {
  // 加法的开头为一个乘法表达式
  if(source[0].type === 'MultipleExpression') {
    let node = {
      type: 'AddExpression',
      children: [source[0]]
    }
    source.shift();
    source.unshift(node);
    return AddExpression(source);
  }
  if(source[0].type === 'AddExpression' &&  source[1] && (source[1].type === '+' || source[1].type === '-')) {
    let node = {
      type: 'AddExpression',
      operator: source[1].type,
      children: [source.shift(), source.shift()]
    };
    // 这里需要进行multipleExpression处理，变成multipleExpression表达式
    multipleExpression(source);
    node.children.push(source.shift());
    source.unshift(node);
    return AddExpression(source);
  }

  if(source[0].type === 'AddExpression') return source[0];
  // 当不匹配的时候，需要调用已从multipleExpression来进行处理
  multipleExpression(source);
  return AddExpression(source);
}



// 加法终结符表达式
function  Expression(source) {
  // 当为加法表达式，并且又终结符时，那么运算结束
  if(source[0].type === 'AddExpression' && source[1] && source[1].type === 'EOF') {
    let node = {
      type: 'Expression',
      children: [source.shift(), source.shift()]
    }
    source.unshift(node);
    return node;
  }
  AddExpression(source);
  return Expression(source);
}






//  const result = multipleExpression(source);

 const result1 = Expression(source);
 console.log(result1,'result')

 #学号: G20200447080014
#班期: 第8期
#小组: 1组
#作业&总结链接: https://github.com/YZYXH/Frontend-08-Template/tree/main/Week%2003

 https://github.com/YZYXH/Frontend-08-Template/tree/main/Week%2003