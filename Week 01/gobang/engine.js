// 棋盘元数据
var chessTable, maxX, maxY;
// 游戏状态: 0-初始化  1-游戏中  2-游戏结束
var gameState = 0;

initGame();
/**
 * 初始化游戏引擎
 */
function initGame() {
    chessTable = initchessTable(15,15);
    // 初始化棋盘
    board();

    console.log(chessTable)
}

/**
 * 初始化棋盘的二维数组
 * 0-空闲
 * 1-白棋
 * 2-黑棋
 * 
 * @param {*} xlength 
 * @param {*} ylength 
 */
function initchessTable(xlength,ylength) {
    maxX = xlength;
    maxY = ylength;
    var chessTable = new Array();
    var row = new Array();
    for (let index = 0; index < ylength; index++) {
        row.push(0);
    }
    for (let index = 0; index < xlength; index++) {
        chessTable.push(row.concat());
    }
    gameState = 1;
    return chessTable;
}


/**
 * 在棋盘上添加新的棋子
 * pieceType: 棋子类型 1-白棋 2-黑棋
 */
function addPiece(x, y, pieceType) {
    if (isGameOver()) {
        alert("当前游戏已结束");
        return false;
    }
    if (isOutChessTable(x, y)) {
        console.log("当前坐标超出棋盘范围");
        return false;
    }
    if (isExistsPiece(x, y)) {
        console.log("当前坐标已存在棋子");
        return false;
    }
    if (pieceType !== 1 && pieceType !== 2) {
        console.log("pieceType棋子类型有误");
        return false;
    }
    // 执行棋子添加操作
    doAddPiece(x, y, pieceType);
    return true;
}

/**
 * 将棋子写入棋盘
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} pieceType 
 */
function doAddPiece(x, y, pieceType) {
    chessTable[x][y] = pieceType;
}

/**
 * 游戏是否已经结束
 */
function isGameOver() {
    return gameState === 2;
}


/**
 * 判断棋盘上某个点是否已经存在棋子
 */
function isExistsPiece(x, y) {
    return chessTable[x][y] > 0;
}

/**
 * 判断坐标是否已经超出棋盘
 */
function isOutChessTable(x, y) {
    return x >= maxX || y >= maxY;
}


/**
 * 校验坐标位置的棋子是否已经组成5五个子
 */
function checkSuccessByXy(x, y) {
    if (isOutChessTable(x, y)) {
        console.log("当前坐标超出棋盘范围");
        return false;
    }
    if (!isExistsPiece(x, y)) {
        console.log("当前坐标不存在棋子");
        return false;
    }
    var bo = scanCheckX(x, y)
        || scanCheckY(x,y)
        || scanCheckTopLeft(x, y)
        || scanCheckTopRight(x, y);
    if (bo) {
        var currentPieceType = chessTable[x][y];
        if (currentPieceType === 1) {
            setTimeout(() => {
                alert("游戏结束,白棋获胜");
            }, 1);
            
        } else if (currentPieceType === 2) {
            setTimeout(() => {
                alert("游戏结束,黑棋获胜");
            }, 1);  
        }
        gameState = 2;
    }
}

/**
 * 横向扫描是否存在包含当棋子的五子连线
 * 横向：y坐标不变, max(x-4, 0) <= x <= min(x+4, maxX-1);
 */
function scanCheckX(x, y) {
    var currentPieceType = chessTable[x][y];
    // 连线长度
    var lineSize = 1;
    var leftEnd = false;
    var rightEnd = false;
    var leftlimt = Math.max(x-4, 0);
    var rightlimt = Math.min(x+4, maxX-1);
    for (var i = 1; i <= 4; i++) {
        if (leftEnd && rightEnd) {
            break;
        }
        var tempX = x - i;
        if (!leftEnd && tempX >= leftlimt) {
            if (chessTable[tempX][y] === currentPieceType) {
                lineSize++;
            } else {
                leftEnd = true;
            }
        }
        tempX = x + i;
        if (!rightEnd && tempX <= rightlimt) {
            if (chessTable[tempX][y] === currentPieceType) {
                lineSize++;
            } else {
                rightEnd = true;
            }
        }
    }
    return lineSize >= 5;
}

/**
 * 纵向扫描是否存在包含当棋子的五子连线
 * 纵向: x坐标不变, max(y-4, 0) <= y <= min(y+4, maxY-1);
 */
function scanCheckY(x, y) {
    var currentPieceType = chessTable[x][y];
    // 连线长度
    var lineSize = 1;
    var topEnd = false;
    var downEnd = false;
    var toplimt = Math.max(y-4, 0);
    var downlimt = Math.min(y+4, maxY-1);
    for (var i = 1; i <= 4; i++) {
        if (topEnd && downEnd) {
            break;
        }
        var tempY = y - i;
        if (!topEnd && tempY >= toplimt) {
            if (chessTable[x][tempY] === currentPieceType) {
                lineSize++;
            } else {
                topEnd = true;
            }
        }
        tempY = y + i;
        if (!downEnd && tempY <= downlimt) {
            if (chessTable[x][tempY] === currentPieceType) {
                lineSize++;
            } else {
                downEnd = true;
            }
        }
    }
    return lineSize >= 5;
}


/**
 * 左侧上斜线扫描是否存在包含当棋子的五子连线
 * 左侧上斜线: x坐标不变, max(y-4, 0) <= y <= min(y+4, maxY-1);
 */
function scanCheckTopLeft(x, y) {
    var currentPieceType = chessTable[x][y];
    // 连线长度
    var lineSize = 1;
    var topEnd = false;
    var downEnd = false;
    var toplimt = Math.max(y-4, 0);
    var downlimt = Math.min(y+4, maxY-1);
    var leftlimt = Math.max(x-4, 0);
    var rightlimt = Math.min(x+4, maxX-1);
    for (var i = 1; i <= 4; i++) {
        if (topEnd && downEnd) {
            break;
        }
        // 扫描上半区，左侧斜上方相邻的第一颗棋子
        var tempX = x - i;
        var tempY = y - i;
        if (!topEnd && tempY >= toplimt && tempX >= leftlimt) {
            if (chessTable[tempX][tempY] === currentPieceType) {
                lineSize++;
            } else {
                topEnd = true;
            }
        }
        // 扫描下半区，右侧斜下方相邻的第一颗棋子
        tempX = x + i;
        tempY = y + i;
        if (!downEnd && tempY <= downlimt && tempX <= rightlimt) {
            if (chessTable[tempX][tempY] === currentPieceType) {
                lineSize++;
            } else {
                downEnd = true;
            }
        }
    }
    return lineSize >= 5;
}

/**
 * 左侧上斜线扫描是否存在包含当棋子的五子连线
 * 左侧上斜线: x坐标不变, max(y-4, 0) <= y <= min(y+4, maxY-1);
 */
function scanCheckTopRight(x, y) {
    var currentPieceType = chessTable[x][y];
    // 连线长度
    var lineSize = 1;
    var topEnd = false;
    var downEnd = false;
    var toplimt = Math.max(y-4, 0);
    var downlimt = Math.min(y+4, maxY-1);
    var leftlimt = Math.max(x-4, 0);
    var rightlimt = Math.min(x+4, maxX-1);
    for (var i = 1; i <= 4; i++) {
        if (topEnd && downEnd) {
            break;
        }
        // 扫描上半区，右侧斜上方相邻的第一颗棋子
        var tempX = x + i;
        var tempY = y - i;
        if (!topEnd && tempY >= toplimt && tempX <= rightlimt) {
            if (chessTable[tempX][tempY] === currentPieceType) {
                lineSize++;
            } else {
                topEnd = true;
            }
        }
        // 扫描下半区，左侧斜下方相邻的第一颗棋子
        tempX = x - i;
        tempY = y + i;
        if (!downEnd && tempY <= downlimt && tempX >= leftlimt) {
            if (chessTable[tempX][tempY] === currentPieceType) {
                lineSize++;
            } else {
                downEnd = true;
            }
        }
    }
    return lineSize >= 5;
}
