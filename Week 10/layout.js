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
    style.flexWrap = 'nowrap';
  }
  
  // 多条轴线排列方向
  if(!style.alignContent || style.alignContent === 'auto') {
    style.flexWrap = 'stretch';
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