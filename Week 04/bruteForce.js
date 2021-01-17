// 暴力算法

/**
 * 
 * @param {string} patter 子串
 * @param {string} source 主串
 */

 // 主字符串指针不回退，计算出当前可以匹配的最大次数，每次匹配主串往前移一位
 // abc cabc 最大能匹配两次 第一次 子串匹配c，发现不匹配，往前移一位 匹配上abc
function bruteForceIndex(patter, source) {
  const patterLen = patter.length;
  const sourceLen = source.length;
  const len = sourceLen - patterLen;
  // 如果主串长度还没子串长，为未匹配上
  if (len < 0) return -1;
  // 匹配的次数子串和主串的长度差
  for(let i = 0; i <= len; i++) {
    for(let j = 0; j < patterLen; j++) {
      // 当匹配一轮没匹配上，跳出当前循环，往后移一位在进行匹配
      if(source[i+j] !== patter[j]) {
        break;
      }
      // 当前为字符串长度的时候， 那么说明已经匹配上了，return出主串的匹配位置
      if(j === patterLen -1) return i;
    }
  }
  return -1;
}

 // 主字符串指针跟随子串先移动，当不匹配的时候回移到当前位置，否则往后继续匹配
function bruteForceMoveIndex(patter, source) {
  const patterLen = patter.length;
  const sourceLen = source.length;
  // 当前子串位置
  let patterIndex = 0;
  // 当前主串位置
  let sourceIndex = 0;
  while(patterIndex < patterLen && sourceIndex < sourceLen) {
    // 当前为匹配时，子串主串都往前移，继续匹配
    if(patter[patterIndex] === source[sourceIndex]) {
      patterIndex ++;
      sourceIndex ++;
    } else {
      // 不匹配的时候，主串返回之前位置，从下一个继续匹配
      sourceIndex = sourceIndex - patterIndex + 1;
      // 子串新一轮的匹配
      patterIndex = 0;
    }
    if(patterIndex === patterLen) return sourceIndex - patterLen;
  }
  return -1;
}

const findIndex = bruteForceIndex('abc', 'wabcj');
const findIndex1 = bruteForceMoveIndex('abc', 'wabcj');
console.log(findIndex,findIndex1,'999')