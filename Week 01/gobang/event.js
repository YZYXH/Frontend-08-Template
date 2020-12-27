
// 获取画布
const wrap = document.getElementById('board');

// 记录最后所下棋子的位置
let lastPosition = { x: 0, y: 0};

// 初始化棋子类型
let current = 1;

//下棋点击事件
wrap.addEventListener('click', e => {
  const offX = e.offsetX;
  const offY = e.offsetY;
  const numX = Math.round((offX - 15)/30)
  const numY = Math.round((offY - 15)/30)
  var bo = addPiece(numX, numY, current);
  if (bo) {
    draw(numX,numY, current);
    checkSuccessByXy(numX, numY);
    lastPosition = {x: numX, y: numY }
  }
  current = 3 - current;
})

// 重来一局按钮
const againBotton = document.getElementsByClassName('again-botton')[0];

// 悔棋按钮
const repentanceBotton = document.getElementsByClassName('repentance-botton')[0];

// 重来一局点击
againBotton.addEventListener('click', () => {
  // 清除棋盘
  clearChess();
  // 初始化游戏
  initGame();
})


// repentanceBotton.addEventListener('click', () => {
//   const x = lastPosition.x * 30 + 15 - 5;
//   const y = lastPosition.y * 30 + 15 - 5;
//   ctx.clearRect(x,y,pieceR,pieceR);
// })