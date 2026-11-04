// Small pixel companion: one FX layer, no particles, collision or audio.
export function drawNavi(g,x,y,t=0,scale=1){
 const flap=(Math.floor(t/4)%2),rect=(dx,dy,w,h)=>g.fillRect(Math.round(x+dx*scale),Math.round(y+dy*scale),w*scale,h*scale);
 g.fillStyle(0x72ddff,.16);rect(-5,-5,11,11);
 g.fillStyle(0xe5fcff,.85);rect(-6,-(flap?4:1),3,flap?4:2);rect(4,-(flap?4:1),3,flap?4:2);rect(-4,2,2,3);rect(3,2,2,3);
 g.fillStyle(0x52c9ee);rect(-2,-2,5,5);g.fillStyle(0xffffff);rect(-1,-1,3,3);
}
