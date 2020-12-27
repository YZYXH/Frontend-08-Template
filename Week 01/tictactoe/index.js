
// 初始化数据
const arr = [
  0,0,0,
  0,0,0,
  0,0,0,
]

// 当前的棋子类型 0-为空 1——白棋 2——黑棋
let current = 1;

// 创建一个渲染函数
function show() {
  const wrap = document.getElementById('root');
  wrap.innerHTML = '';
  forFn((i, j) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.innerText = arr[i * 3 + j] === 2 ? '😆' : arr[i * 3 + j] === 1 ? '🤢' : '';
    cell.addEventListener('click', () => userMove(i, j))
    wrap.appendChild(cell);
  }, () => {
    wrap.appendChild(document.createElement('br'))
  })
}

// 添加用户下棋事件
function userMove(x,y) {
  if (arr[x * 3 + y] === 0) {
    arr[x * 3 + y] = current;
    common(arr, current);
  } else {
    alert('当前已经有棋子')
  }
  robotMove();
}

// 下棋公共事件
function common(arr) {
  if(check(arr, current)) {
    alert(current === 2 ? '😆 win' : '🤢 win');
  }
  current = 3 - current;
  if(willWin(arr, current)) {
    console.log(current === 2 ? '😆 will win' : '🤢 will win')
  }
  show();
}

// 人工机器人下棋事件
function robotMove() {
  const point = bastChoice(arr, current).point;
  // 当有最优点
  if(point) {
    arr[point] = current;
  }
  common(arr, current);
}


// 检查是否获胜
function check(arr, current) {
  // 横向成一排
  {
    for (let i = 0; i < 3; i++) {
      let win = true;
      for (let j = 0; j < 3; j++) {
        if(arr[i * 3 + j] !== current) {
          win = false;
        }
      }
      if(win) return true;
    }
  }
  // 竖向成一排
  {
    for (let i = 0; i < 3; i++) {
      let win = true;
      for (let j = 0; j < 3; j++) {
        if(arr[j * 3  + i] !== current) {
          win = false;
        }
      }
      if(win) return true;
    }
  }
  // 左侧上斜线
  {
    let win = true;
    for (let i = 0; i < 3; i++) {
      if(arr[i * 3 + i] !== current) {
        win = false;
      }
    }
    if(win) return true;
  }

  // 右侧下斜线
  {
    let win = true;
    for (let i = 0; i < 3; i++) {
      if(arr[i * 3 + 2-i] !== current) {
        win = false;
      }
    }
    if(win) return true;
  }
}

// 克隆数据
function clone(data) {
  return Object.create(data)
}

// 检查是否将要赢
function willWin(arr, current) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
     if(arr[i * 3 + j]) {
       continue;
     }
     // 深拷贝，可以拷贝多维对象，不能使用contat()或者拓展运算符代替，因为他们只能拷贝一层
     const newArr = clone(arr);
     newArr[i * 3 + j] = current;
     if(check(newArr, current)) {
       return i * 3 + j;
     }
    }
  }
  return null;
}

// 寻找最好的下棋选择
function bastChoice(arr, current) {
  let point = null;
  // point记录当前的坐标  result代表最优的下棋结局，1为赢 0为和 否则为输
  if(willWin(arr, current)) {
    point = willWin(arr, current);
    if(point) {
      return {
        point,
        result: 1,
      }
    }
  }
  let result = -1;
  //找出对方的最好解法
  outer: for(let i = 0; i < 3; i++) {
    for(let j = 0; j < 3; j ++) {
      if(arr[i * 3 + j]) {
        continue;
      }
      let newArr = clone(arr);
      newArr[i * 3 + j] = current;
      let r =  bastChoice(newArr, 3-current).result;
      if(-r  >= result) {
        point = i * 3 + j;
        result = -r ;
      }
      if (result == 1) { // 不能为=号，这样的话当不为0的时候，都会进去
        break outer;
      }
    }
  }
  return {
    point,
    result: point ? result : 0
  }
}

// for循环函数
function forFn(inCb, outCb) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      inCb && inCb(i, j);
    }
    outCb && outCb();
  }
}

// 棋盘渲染
show();

