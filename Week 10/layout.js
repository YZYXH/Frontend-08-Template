// 对style的预处理
function layout(dom) {

  // 不存在样式的时候,停止解析
  if(!dom.computedStyle) {
    return;
  };

  // 获取处理之后的样式
  const elementStyle = getStyle(dom);

  // 当前只处理flex布局
  if(elementStyle.display !== 'flex') {
    return;
  }

  // 过滤文本元素
  const items = dom.children.filter(item => item.type === 'element');

  // 对元素进行排序? 目的
  items.sort((a,b) => {
    return (a.order | 0) - (b.order | 0);
  });

  // 取出style
  const style = elementStyle;

  // 初始化width或者height值
  ['width', 'height'].forEach(k => {
    if(style[k] === 'auto' || style[k] === '') {
      style[k] = null;
    }
  })

  // 排列方向
  if(!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row';
  }

  // 交叉轴排列方向
  if(!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch';
  }

  // 主轴排列方向
  if(!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start';
  }

  // 是否换行
  if(!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'noWrap';
  }
  
  // 多条轴线排列方向
  if(!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch';
  }

  let mainSize, mainEnd, mainStart, mainSign, mainBase, crossSize, crossEnd, crossStart,
  crossSign, crossBase = '';

  // 横向排列（从左向右）
  if(style.flexDirection === 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1;
    mainBase = 0;
    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  // 横向排列（从右向左）
  if(style.flexDirection === 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainSign = -1;
    mainBase = style.width;
    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }
  // 竖向排列（从上向下）
  if(style.flexDirection === 'column') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainSign = -1;
    mainBase = style.height;
    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }
  // 竖向排列（从下向上）
  if(style.flexDirection === 'column-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainSign = -1;
    mainBase = style.height;
    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }
  // 反向换行
  if(style.flexWrap === 'wrap-reverse') {
    const tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSign = -1;
  } else {
    crossSign = 1;
    crossBase = 0;
  }

  // 是否为自动轴
  const isAutoMainSize = false;

  // 如果父元素没有设大小，那么由子元素撑开
  if(!style[mainSize]) {

    // 把父元素设置默认值0
    elementStyle[mainSize] = 0;

    // 便利子元素然后相关属性相加
    for(let item of items) {
      const itemStyle = getStyle(item);
      if(itemStyle[mainSize] !== null && itemStyle[mainSize] !== (void 0)) {
        elementStyle[mainSize] += elementStyle[mainSize] + itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  // 存储每行元素
  let flexLine = [];

  // 存储所有行元素
  const flexLines = [flexLine];

  // 获取父元素大小
  let mainSpace = elementStyle[mainSize];
  // 设置交叉轴的尺寸默认值
  var crossSpace = 0;

  for(let item of items) {
    const itemStyle = getStyle(item);
    // 如果元素没有设置属性的话那么把属性设置为0
    if(itemStyle[mainSize] === null || !itemStyle[mainSize]) {
      itemStyle[mainSize] = 0;
    }

    // 如果当前元素是存在flex的话 那么元素是可以被压缩的，直接把当前元素放进去行里面
    if(itemStyle.flex) {
      flexLine.push(item);

    // 如果是不换行的话，并且当前父元素是没有大小的
    } else if(style.flexWrap === 'noWrap' || isAutoMainSize) {

      // 计算父元素剩余空间
      mainSpace -= itemStyle[mainSize];
      // 计算当前元素的交叉轴值（为最高的元素所占据的空间）
      if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(itemStyle[crossSize], crossSpace);
      }

      flexLine.push(item);
    } else {
      // 当前元素超过父元素的值时，那么把子元素压缩到父元素大小
      if(itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }
      // 如果当前剩余的空间比子元素空间小，那么新开一行
      if(mainSpace < itemStyle[mainSize]) {

        // 存储当前行剩余主轴空间
        flexLine.mainSpace = mainSpace;

        // 存储当前行交叉轴大小
        flexLine.crossSpace = crossSpace;

        // 新开一行
        flexLine = [item];
        flexLines.push(flexLine);
        
        //重置父元素空间
        mainSpace = style[mainSize];
        crossSpace = 0;
        console.log(mainSpace, 'mainSpace1')
      } else {
        // 空间足够，直接把元素放进行里面
        flexLine.push(item);
      }

      // 计算当前元素的交叉轴值（为最高的元素所占据的空间）
      if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(itemStyle[crossSize], crossSpace);
      }
    }
  }

  // 最后一行加上mainSpace
  flexLine.mainSpace = mainSpace;

  /****
   * 计算主轴，进行空间分配
   */
  
  /**
   * 当不换行或者父元素么有尺寸的时候，那么为一行展示
   */
  if(style.flexWrap === 'noWrap' || isAutoMainSiz) {
    /**
     * 当父元素有交叉轴尺寸的时候，那么当前最大为父元素高度
     */
    flexLine.crossSpace = style[crossSize] ? style[crossSize] : crossSpace;
  } else {
    /**
     * 否则为之前记录的子元素最高高度
     */
    flexLine.crossSpace = crossSpace
  }

  /***
   * 当剩空间<0,需要对所有元素进行等比压缩
   */
  if(mainSpace < 0) {
    /**
     * 等比的比例
     *  */ 
    const scale = style[mainSize]/ (style[mainSize] - mainSpace);
    /**
     * 当前主轴位置
     */
    let currentMain = mainBase;
    for(let item of items) {
      const itemStyle = getStyle(item);
      /**
       * 当属性有flex,不参与压缩
       */
      if(itemStyle.flex) {
        itemStyle[mainSize] = 0;
      } else {
        itemStyle[mainSize] = itemStyle[mainSize] * scale;
      }

      // 当前元素开始位置
      itemStyle[mainStart] = currentMain;

      // 当前主轴的结束位置
      itemStyle[mainEnd] = itemStyle[mainStart] + itemStyle[mainSize] * mainSign;

      // 下次元素的开始位置为上个元素的结束位置
      currentMain = itemStyle[mainEnd];

    }
  } else {
    flexLines.forEach(items => {
      // 当前剩余的主轴空间
      let mainSpace = items.mainSpace;

      // 总共的flex值
      let flexTotal = 0;
      for(let item of items) {
        const itemStyle = getStyle(item);
        if(itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
          flexTotal += itemStyle.flex;
        }
      }
      // 当存在flex元素的时候 按照比例划分空间
      if(flexTotal) {
        let currentMain = mainBase;
        for(let item of items) {
          const itemStyle = getStyle(item);

          // 按照当前的flex进行等比划分
          if(itemStyle.flex) {
            itemStyle[mainSize] = mainSpace/flexTotal * itemStyle.flex;
          }

          // 当前元素开始位置
          itemStyle[mainStart] = currentMain;

          // 当前主轴的结束位置
          itemStyle[mainEnd] = itemStyle[mainStart] + itemStyle[mainSize] * mainSign;
          
          // 下次元素的开始位置为上个元素的结束位置
          currentMain = itemStyle[mainEnd];
        }
      } else {
        /**
         * 当没有flex划分属性的时候  按照当前flex的排版方式划分
        */
        let currentMain = mainBase;
        let step = 0;

        // flex-start左对齐,不需要变化

        // flex-start右对齐
        if (style.justifyContent === 'flex-end') { 
          currentMain = mainBase + mainSpace * mainSize;
        }

        // center： 居中
        if (style.justifyContent === 'center') { 
          currentMain = mainBase + mainSpace/2 * mainSize;
        }

        // space-between：两端对齐，项目之间的间隔都相等。
        if (style.justifyContent === 'space-between') {

          // 计算项目之间的间隔
          step = mainSpace / (items.length - 1) * mainSize;
        }

        // space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。
        if (style.justifyContent === 'space-around') {
          // 计算项目之间的间隔
          step = mainSpace / items.length * mainSize;

          // 初始的位置是之前的位置 + 间隔的一半
          currentMain = step / 2 + mainBase;
        }
        for(let item of items) {
          const itemStyle = getStyle(item);

          // 当前元素开始位置
          itemStyle[mainStart] = currentMain;

          // 当前主轴的结束位置
          itemStyle[mainEnd] = itemStyle[mainStart] + itemStyle[mainSize] * mainSign;
          
          // 下次元素的开始位置为上个元素的结束位置+中间间隔的位置
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    })
  }
  console.log(flexLines, 'flexLines');

  /****
   * 计算交叉轴，进行空间分配
   */

  // 交叉轴剩余空间
  var crossSpace = 0;

  if (!style[crossSize]) {
    // 如果父元素没有高度 那么高度为0
    elementStyle[crossSize] = 0;

    // 交叉轴剩余空间永远为0  因为他本身就是子元素撑开的
    crossSpace = 0;

    for (let flexLine of flexLines) {
      const flexLineCross = flexLine.crossSpace || 0;
      // 剩余的高度由子元素高度撑开
      elementStyle[crossSize] += flexLineCross;
    }
  } else {
     // 当前父元素有行高的时候
    crossSpace = style[crossSize] || 0;

    for (let flexLine of flexLines) {
      const flexLineCross = flexLine.crossSpace || 0;
      // 剩余的高度由子元素高度撑开
      elementStyle[crossSize] -= flexLineCross;
    }
  }

  // 从底部向上排列
  if (style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }

  // 计算每个线中间的距离
  const lineSpace = crossSpace / flexLine.length;

  // 每个元素中间的间隔

  let step = 0;

  // flex-start：与交叉轴的起点对齐
  if (style.alignContent === 'flex-start') {

    // 当前的开始距离
    crossBase += 0;
    step = 0;
  }


  // flex-start：与交叉轴的终点对齐
  if (style.alignContent === 'flex-end') {
    crossBase += crossSpace * crossSign;
    step = 0;
  }

  // center：与交叉轴的中点对齐
  if (style.alignContent === 'center') {

    // 起始点在中间
    crossBase += crossSpace * crossSign / 2;
    step = 0;
  }

  // space-between：与交叉轴两端对齐，轴线之间的间隔平均分布
  if (style.alignContent === 'space-between') {
    // 起始点在中间
    crossBase += crossSpace / flexLines.length - 1;
    step = 0;
  }

  // space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍
  if (style.alignContent === 'space-around') {
    // 起始点为轴线的一半
    step = crossSign / flexLines.length;
    crossBase += step / 2;
  }

  // stretch（默认值）：轴线占满整个交叉轴。
  if (style.alignContent === 'stretch') {
    // 起始点为轴线的一半
    step = 0;
    crossBase = 0;
  }
  flexLines.forEach(items => {
    // 计算当前真实的交叉轴尺寸

    // 在stretch的情况下  如果父元素有空间需要占满  其他正常排序
    const lineCrossSize = style.alignContent === 'stretch' ? items.crossSpace + crossSpace / (flexLines.length) : items.crossSpace;

    for (let item of items) {
      let itemStyle = getStyle(item);
      const align = itemStyle.alignItems || itemStyle.alignSelf;

      if (!itemStyle.crossSize) {
        itemStyle.crossSize = align === 'stretch' ? lineCrossSize : 0;
      }
      
      //  flex-start：交叉轴的起点对齐。
      if (align === 'flex-start') {

        // 开始的位置是交叉轴的起点
        itemStyle[crossStart] = crossBase;

        // 结束的位置是叉轴的起点 + 当前元素的交叉轴大小
        itemStyle[crossEnd] = itemStyle[crossStart] + itemStyle[crossSize] * crossSign;
      }

      // flex-end：交叉轴的终点对齐。
      if (align === 'flex-end') {

        // 结束的位置是交叉轴的起点 + 每个交叉轴的尺寸
        itemStyle[crossEnd] = crossBase + lineCrossSize * crossSign;

        // 开始的的位置是交叉轴终点 - 当前元素的交叉轴尺寸
        itemStyle[crossStart] = itemStyle[crossEnd] - itemStyle[crossSize] * crossSign;
      }

      // center：交叉轴的中点对齐。
      if (align === 'center') {
        itemStyle[crossStart] = crossBase + (lineCrossSize - itemStyle[crossSize]) / 2 * crossSign;
        itemStyle[crossEnd] = itemStyle[crossStart] + itemStyle[crossSize] * crossSign;
      }

      // stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。
      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = itemStyle[crossStart] + (itemStyle[crossSize] || lineCrossSize) * crossSign;
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
      }
    }

    // 每一行的中间间隔不一样 会改变交叉轴位置
    crossBase += crossSign * (lineSpace + step);
  })
};

function getStyle(element) {
  // 设置setStyle存储样式
  if(!element.setStyle) {
    element.setStyle = {};
  }
  for(let prop in element.computedStyle) {
    element.setStyle[prop] = element.computedStyle[prop].value;
    // 转化px的|转化纯数字
    if(element.setStyle[prop].toString().match(/px$|^[0-9\.]+/)) {
      element.setStyle[prop] = parseInt(element.setStyle[prop]);
    }
    // // 转化纯数字
    // if(element.setStyle[prop].toString().math(/^[0-9\.]+/)) {
    //   element.setStyle[prop] = parsetInt(element.setStyle[prop]);
    // }
  }
  return element.setStyle;

}
module.exports = layout;
