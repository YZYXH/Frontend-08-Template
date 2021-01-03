// 地图数据
const maps = localStorage['map'] ? JSON.parse(localStorage['map']) : new Array(10000).fill(0);
// 记录当前是否按下鼠标
let mousedown = false;
// 是否为右键清除
let clear = false;

const wrap = document.getElementById('root');

// 创建地图
for(let i = 0; i< 100; i++) {
  for(let j = 0; j < 100; j ++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    // 为1的时候为已选
    if(maps[100*i + j] === 1) {
      cell.style.background = '#000';
    }

    // 监控鼠标移动路径
    cell.addEventListener('mousemove', function(e) {
      if(mousedown) {
        if(clear) {
          maps[100*i + j] = 0;
          cell.style.background = 'gray';
        } else {
          maps[100*i + j] = 1;
          cell.style.background = '#000'
        }
      }
    })
    wrap.appendChild(cell)
  }
}


/**
 * 
 * @param {*} map 地图数据
 * @param {*} start 开始路径
 * @param {*} end 结束路径
 */

// 广度优先搜索
async function path(map, start, end) {
  // 创建一个新的数据
  const newMaps = Object.create(map);

  // 把起点放入进去和排序方法放进去, distance计算距离
  const queue = new Stored(start, (a, b) => distance(a) - distance(b));
    // 插入计算
  async function insert(x, y, pre) {

    // 当x, y 的横纵坐标超出棋盘范围，那么不做运算
    if(x < 0 || x >= 100 || y < 0 || y >= 100) return;

    // 当之前的已经走过来 不做重复的走
    if(newMaps[y * 100 + x]) return;
    
    // 做ui处理
    // wrap.childNodes[y * 100 + x].style.background = 'yellow';
    // 把之前走过的地方进行标记
    newMaps[y * 100 + x] = pre;
  
    queue.give([x, y]);
  }

  // 距离计算函数
  function distance(point) {
    const distance = Math.pow(point[0]- end[0],2) + Math.pow(point[1]- end[1],2);
    return distance;
  }
  while(queue.data.length) {
    // shift、push为广度优先搜索，pop、push为深度优先搜索
    // 获取每次拿到的最小路径坐标
    let [x, y] = queue.take();
    // 当找到的路径和结束点一致是  那么认为已经找到了
    if(x === end[0] && y === end[1]) {
      // 路径存储
      const path = [];
      while(x !== start[0] || y !== start[1]) {
       path.push(map[y * 100 + x]);
       // 重新给x,y赋值进行循环
       [x, y] = newMaps[y * 100 + x];
        await sleep(100)
        // 绘制路径
       wrap.childNodes[y * 100 + x].style.background = 'red';
      }

      return path;
    }
    // 分别去寻找上下左右四个点
    await insert(x-1, y, [x,y]);
    await insert(x, y -1, [x,y]);
    await insert(x + 1, y, [x,y]);
    await insert(x, y + 1, [x,y]);
    // 斜向路径
    await insert(x + 1, y + 1, [x,y]);
    await insert(x + 1, y - 1, [x,y]);
    await insert(x - 1, y + 1, [x,y]);
    await insert(x - 1, y - 1, [x,y]);
  }
  return null;
}

// 做一个异步延迟运算
function sleep(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

class Stored {
  constructor(data, compare) {
    this.data = [data];
    this.compare = compare || ((a, b) => a - b);
  }
  take() {
    if(!this.data.length) {
      return;
    }
    // 初始化最小数和下标
    let minData = this.data[0];
    let minIndex = 0;
    // 寻找出最小的数和下标
    for(let i = 1; i < this.data.length; i++) {
      if (this.compare(this.data[i], minData) < 0) {
        minData = this.data[i];
        minIndex = i;
      }
    }
    // 把数组最后一个数赋值给它删除最后数组达到删除最小数的效果
    this.data[minIndex] = this.data[this.data.length - 1];
    this.data.pop();
    return minData;
  }
  give(v) {
    this.data.push(v);
  }
}

// 监控鼠标按下事件
document.addEventListener('mousedown', (e) => {
  mousedown = true;
  // @ts-ignore
  clear = e.which === 3;  //  1为左键、2为中键、3为右键
})

// 监控鼠标放下事件
document.addEventListener('mouseup', () => {
  mousedown = false;
})

// 右键取消默认事件
// document.addEventListener('contextmenu', e => e.preventDefault())
