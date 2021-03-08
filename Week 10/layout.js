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
  let crossSpace = 0;

  for(let item of items) {
    const itemStyle = getStyle(item);
    // 如果元素没有设置属性的话那么把属性设置为0
    if(itemStyle[mainSize] === null) {
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
    flexLine.forEach(items => {
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
        

      }

    })
  }


  console.log(style, 'flexLines');
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