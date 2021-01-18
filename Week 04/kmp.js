// kmp
// 在子类中找出共有元素的长度 ———— 部分匹配值
// 当字符串的长度 - 部分匹配值的长度 = 上一个部分匹配值的位置
// 匹配移动位数 = 已匹配的字符数 - 对应的部分匹配值


/**
 * 
 * @param {string} patter 子串
 * @param {string} source 主串
 */
function kmp(source, patter) {
  const tabel = handlePatter(patter);
  let i = 0, j = 0;
  while(i < source.length && j < patter.length) {
    if(source[i] === patter[j]) {
      i++; j++;
    } else {
      if(j > 0) {
        j = patter[j];
      } else {
        i++;
      }
    }
    if(j === patter.length) {
      return i;
    }
  }
  return -1;
}
const test = kmp('abcdeeee', 'b');
console.log(test,'999')
function handlePatter(data) {
  const table = new Array(data.length).fill(0);
  // i为当前的匹配下标， j为当前位置的部分匹配符
  let i = 1, j = 0;
  while(i < data.length) {
    // 当匹配上的时候，继续匹配下一个
    if(data[i] === data[j]) {
      i++;
      j++;
      // 存储当前的匹配值
      table[i] = j;
    } else {
      // 当有匹配值的时候，跳到匹配值位置在进行比较
      if(j > 0) {
        j = table[j];
      } else {
        // 否则的话i自增在进行下一轮比较
        i++;
      }
    }
  }
  return table;
}
const result =  handlePatter('abcdabce');
console.log(result,'888')
