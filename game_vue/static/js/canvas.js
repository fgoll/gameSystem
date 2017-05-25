/**
 * Created by SwiftJ on 17/1/29.
 */
function drawChessPiece(context,width,x,y,color){     //绘制棋子函数

  context.beginPath();
  context.arc(x,y,width,0,2*Math.PI);
  context.closePath();
  var gradient= context.createRadialGradient(x,y,10,x+2,y-2,0);//创建圆形渐变，两个圆之间为渐变区域；
  if(color == 'black'){                      //绘制黑棋；
    gradient.addColorStop(0,"#0a0a0a");
    gradient.addColorStop(1,"#636363");
  }
  else{                                 //绘制白棋；
    gradient.addColorStop(0,"#e1e1e1");
    gradient.addColorStop(1,"#f1f1f1");
  }
  context.fillStyle=gradient;
  context.fill();
}

function resize(){
  var canvas = document.getElementById('cas');

  if (canvas) {
  var parent = canvas.parentNode;
    canvas.width=parent.innerWidth||parent.clientWidth||1000;
    canvas.height=(parent.innerHeight||parent.clientHeight||parent.clientHeight||600) - 50;
    // console.log("canvasWidth:"+canvas.width,"canvasHeight:"+canvas.height);

  }


}
// window.onresize = resize;
window.onload = resize;



