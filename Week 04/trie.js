// 字典树 用于统计和排序大量的字符串（但不仅限于字符串）
const random = (length = 4) => {
  let str = '';
  // 产生随机的26位字母
  // "a".charCodeAt(0) 生产a的Unicode编码
  // Math.random() * 26 [0, 26) => [a-z];
  // String.fromCharCode将Unicode编码解析成字符串
  for(let i = 0; i < length; i++) {
    str += String.fromCharCode(Math.random() * 26 + "a".charCodeAt(0));
  }
  return str;
}

class Trie {
  constructor() {
    // 新建一个空的对象
    this.root = Object.create(null);
    // 唯一标识(Symobol具有唯一性)
    this.$ = Symbol('$');
  }
  // 插入数据
  insert(str) {
    // 此处为引用形式的赋值，会直接改变原对象
    let node = this.root;
    // 遍历出字符串的每个字符
    for(let key of str) {
      // 如果么有的话那么新建对象
      if(!node[key]) node[key] = Object.create(null);
      // 取当前对象，进行重新比对
      node = node[key];
    }
    // 创建截止符
    if(!(this.$ in node)) node[this.$] = 0;
    node[this.$] ++
  }
  // 找出最大次数值
  max() {
    // 最大次数
    let max = 0;
    // 最大次数值
    let maxWord = null;
    /**
     * 
     * @param {Object} node 比对的对象
     * @param {string} word 当前字符
     */
    const findWord = (node = this.root, word) => {
      // 当出现次数大于之前的次数值时，重置次数值和字符串
      if(node[this.$] && node[this.$] > max) {
        max = node[this.$];
        maxWord = word;
      }
      // 递归每个子类，寻找最大值
      for(let key in node) {
        findWord(node[key], `${word}${key}`)
      }
    }
    findWord(this.root, '');
    console.log(max, maxWord);
  }
}

const trie = new Trie();

// 创建字典树数据
for(let i = 0; i < 10000; i++) {
  trie.insert(random());
}
// 寻找字典树最大次数
trie.max();
console.log(trie)