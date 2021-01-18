// *匹配任意字符，可为空，表示任意多的字符
// ？匹配非空字符，表示单一字符串

function windCard(patter, source) {
  let str = '';
  let patterCount = 0;
  let lastIndex = 0;
  for(let i= 0; i< patter.length; i++) {
    if(patter[i] === '*') {
      // 从第一个*开始匹配
      if(patterCount > 0) {
        const newStr = str.replace(/\?/g, "[\\s]"); // 把？变为正则去匹配，匹配非空字符
        const reg = new RegExp(newStr,'g');
        const result = reg.exec(source);
        str = '';
        lastIndex = reg.lastIndex;
        console.log(result, reg.lastIndex)
        // 当为null的时候说明没匹配上
        if(result === null) {
          return false;
        }
      }
      patterCount ++;
    } else {
      // 匹配头部部分（第一个*之前)
      if(patter[i] !== source[i] && patter[i] !== '?' && !patterCount) {
        return false;
      }

      // 拼接中间的字符串进行匹配符
      if(patterCount) {
        str += patter[i];
      };
    }
  }

  // 从后面开始往前面匹配
  for(let j = 0; j <= source.length - lastIndex && patter[patter.length - j] !== '*'; j++) {
    if(source[source.length - j] !== patter[patter.length - j] && patter[patter.length - j] !== '?') {
      return false;
    }
  }
  return true;
}

const isMath = windCard('a*b*bx*c', 'abcabcabxaac');
console.log(isMath)