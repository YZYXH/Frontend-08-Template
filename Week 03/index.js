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
    token.value = result[0];
    yield token;
  }
 
 }
 const result = math("100 * 12 + 20")

 for(let token of result) {
  console.log(token,'999')
 }
