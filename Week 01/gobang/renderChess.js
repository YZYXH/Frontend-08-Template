// 存储棋盘
let ctx = null;

// 棋子半径大小

var pieceR = 10;

// 获取棋盘画布
const chess = document.getElementById('board');

// 初始化一个棋盘
function board() {

  ctx=chess.getContext("2d");
  const win = 10;
  const x = 30 * 3  + 15 - win/2;
  const y = 435 - 30 * 3 -  win/2;
  // 左上角点
  ctx.fillRect(x,x,win,win);

  // 左下角点
  ctx.fillRect(x,y,win,win);

  // 右上角
  ctx.fillRect(y,x,win,win);

  // 右下角
  ctx.fillRect(y,y,win,win);

  // 开始时偏移坐标
  const startDistance = 15;

  ctx.translate(0.5, 0.5); // 在绘画时候进行偏移
  for (let index = 0; index < 15; index++) {
    ctx.beginPath();
    // 绘制横向线， 
    ctx.moveTo(startDistance,  startDistance + index * 30);
    ctx.lineTo(435, startDistance + index * 30)
    // 绘制竖向线
    ctx.moveTo(startDistance + index * 30, startDistance);
    ctx.lineTo(startDistance + index * 30, 435);
    ctx.stroke();
    ctx.closePath();
  }
}

// 绘画棋子
// 当前棋子的坐标(x,y)，r为棋子半径（默认为10), type为棋子类型，1为白棋， 否则黑子
function draw(x = 0, y = 0, type = 1, r = pieceR) {
  ctx.beginPath();
  x = x * 30 + 15;
  y = y * 30 + 13;
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  const grad = ctx.createRadialGradient(x, y, 20, x + 3, y + 5, 10);
  const startColor = type !== 1 ? 'white' : 'black';
  const endColor = type !== 1 ? 'black' : 'white';
  grad.addColorStop(0, startColor);
  grad.addColorStop(1, endColor);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.closePath();
}


// 清除画布
function clearChess() {
  chess.width = chess.width;
  chess.height = chess.height;
}