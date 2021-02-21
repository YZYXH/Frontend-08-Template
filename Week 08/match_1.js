  // 使用状态机处理字符串abcabx，需要观察数据的特征，字符循环情况
  function match(str) {
    let state = start;
    for(let c of str) {
      // 通过每次返回的
      state = state(c);
    }
    return state === end;
  }


  // 当未匹配到的时候  那么就重置到初始化
  function start(c) {
    if(c === 'a') {
      return findA;
    }
    return start;
  }

  function end() {
    return end;
  }

    // 当未匹配到的时候  那么就重置到初始化
  function findA(c) {
    if(c === 'b') {
      return findB;
    }
    return start(c);
  }
  function findB(c) {
    if(c === 'c') {
      return findC;
    }
    return start(c);
  }

  function findC(c) {
    if(c === 'a') {
      return findA2; 
    }
    return start(c);
  }

  function findA2(c) {
    if(c === 'b') {
      return findB2; // 当查找到第二个a的时候，查找下个字符是否为b
    }
    return start(c);
  }

  function findB2(c) {
    if(c === 'x') { // 当查找到第二个b的时候，查找下个字符是否为x,，为x那么匹配结束，因为前面已经查找过ab，那么直接查找是否为c
      return end;
    }
    return findB(c);
  }

  const result = match('abxabcabcabx');
  console.log(result, '999')

  // // 查找字符abababx，观察到重复字符为ab
  function match1(str) {
    let state = start;
    for(let c of str) {
      state = state(c)
    }
    return state === end;
  }

  function start(c) {
    if(c === 'a') {
      return findA;
    }
    return start;
  }

  function end() {
    return end;
  }
  function findA(c) {
    if(c === 'b') {
      return findB2; // 查找b后面是否为X,不为的话重头开始
    }
    return start(c);
  }

  function findB2(c) {
    if(c === 'x') {
      return end;
    }
    return start(c);
  }
  const result = match1('ababaabababx');
  console.log(result, '999')