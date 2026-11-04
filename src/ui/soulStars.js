// A pixel star with a stepped extrusion and scattered shadow pixels trailing behind it.
const ROWS=['00000100000','00000100000','00001110000','00001110000','11111111111','01111111110','00111111100','00111111100','00111011100','01110001110','01100000110'];
const RUNS=ROWS.flatMap((row,y)=>[...row.matchAll(/1+/g)].map(m=>({x:m.index,y,w:m[0].length})));
export function drawSoulStars(g,x,y,count,{scale=1,spacing=18,color=0xffdd66,shadow=0x100d20,frame=0,motion=false}={}){
 const stamp=(ox,oy,c,alpha)=>{g.fillStyle(c,alpha);for(const r of RUNS){const px=Math.round(ox+r.x*scale),py=Math.round(oy+r.y*scale);g.fillRect(px,py,Math.max(1,Math.round(ox+(r.x+r.w)*scale)-px),Math.max(1,Math.round(scale)));}};
 for(let i=0;i<Math.min(5,Math.max(0,count));i++){
  const sx=Math.round(x+i*spacing),sy=Math.round(y),step=Math.max(1,Math.round(scale*2));
  stamp(sx+step*2,sy+step*2,shadow,.5);stamp(sx+step,sy+step,shadow,.95);
  for(let j=0;j<3;j++){const drift=motion?Math.floor((frame/4+j*7)%22)/3:j*2,dx=Math.round(sx+scale*8+step+drift),dy=Math.round(sy+scale*8+step+drift*.6);g.fillStyle(shadow,.65-j*.16);g.fillRect(dx,dy,j===0?2:1,j===0?2:1);}
  stamp(sx,sy,color,1);g.fillStyle(0xfff3bd,.9);g.fillRect(Math.round(sx+5*scale),Math.round(sy+3*scale),Math.max(1,Math.round(scale)),Math.max(1,Math.round(scale)));
 }
}
