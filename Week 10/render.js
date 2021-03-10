
const images = require('images');
function render(viewport, element) {
  if (element.setStyle) {

    // 首先绘制出元素的宽高
    const img = images(element.setStyle.width, element.setStyle.height);

    // 当有背景时候，绘制元素背景色
    if (element.setStyle['background-color']) {
      const color = element.setStyle['background-color'] || 'rgb(0,0,0)';
      
      // 取匹配元素的rgb值
      color.match(/rbg((\d+), (\d+), (\d+))/);

      // 进行填充
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3), 1);

      // 把当前元素画出来
      viewport.draw(img, element.setStyle.left, element.setStyle.top);
    }
  }

  // 当有子元素的时候 在去一层层渲染 形成dom树
  if (element.children && element.children.length) {
    for (let child of element.children) {
      render(viewport, child);
    }
  }
}
module.exports = render;
