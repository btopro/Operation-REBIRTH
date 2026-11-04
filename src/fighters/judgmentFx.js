import {pixel,line} from './themePixels.js';
import {JUDGMENT_EYES} from './judgmentEyeData.js';
export function judgmentEye(sprite){
 const a=JUDGMENT_EYES[sprite.texture.key]?.[Number(sprite.frame.name)];if(!a)return null;
 const w=sprite.frame.realWidth,h=sprite.frame.realHeight,dx=((sprite.flipX?w-1-a[0]:a[0])-sprite.originX*w)*sprite.scaleX,dy=(a[1]-sprite.originY*h)*sprite.scaleY,c=Math.cos(sprite.rotation),s=Math.sin(sprite.rotation);
 return [sprite.x+dx*c-dy*s,sprite.y+dx*s+dy*c];
}
export function bone(g,x,y,len=16,vertical=true,c=0xf1f5ff,alpha=1){
 const dx=vertical?0:len/2,dy=vertical?len/2:0;
 line(g,x-dx,y-dy,x+dx,y+dy,0x24324c,5,alpha);line(g,x-dx,y-dy,x+dx,y+dy,c,3,alpha);
 for(const sign of [-1,1])for(const side of [-1,1])pixel(g,x+sign*dx+(vertical?side*2:0)-1,y+sign*dy+(vertical?0:side*2)-1,3,3,c,alpha);
}
// Long-snouted, horned white skull with stacked black eye sockets, matching the reference.
export function cannon(g,x,y,scale=1,dir=1,open=0,alpha=1){
 const shape=(pts,c)=>{g.fillStyle(c,alpha);g.fillPoints(pts.map(([u,v])=>({x:Math.round(x+u*scale*dir),y:Math.round(y+v*scale)})),true);};
 const W=0xffffff,B=0x020408;
 shape([[-29,-2],[-25,-5],[-24,-12],[-18,-20],[-9,-23],[1,-21],[8,-17],[18,-17],[13,-25],[24,-17],[28,-11],[34,-6],[36,0],[34,7],[28,13],[24,20],[13,27],[17,18],[7,17],[0,21],[-10,23],[-20,17],[-24,10],[-25,4]],0x182235);
 shape([[-27,-2],[-23,-4],[-22,-11],[-17,-18],[-9,-21],[0,-19],[7,-15],[20,-15],[16,-22],[23,-16],[26,-10],[32,-5],[34,0],[32,5],[26,11],[23,18],[16,23],[19,16],[7,15],[-1,19],[-10,21],[-18,16],[-22,9],[-23,3]],W);
 // Horns / ridged brow and the long black nose channel.
 shape([[-21,-12],[-17,-16],[-14,-16],[-17,-10]],B);
 shape([[-7,-16],[1,-17],[7,-13],[17,-11],[10,-10],[2,-13],[-5,-12]],B);
 shape([[-7,16],[1,17],[7,13],[17,11],[10,10],[2,13],[-5,12]],B);
 shape([[-15,-1],[7,-1],[7,-3],[13,-3],[15,0],[13,3],[7,3],[7,1],[-15,1]],B);
 // Two large hollow eye sockets with white rings and dark pupils.
 for(const sign of [-1,1]){
  const yy=sign*10;
  shape([[-4,yy-5],[4,yy-6],[9,yy-3],[8,yy+3],[2,yy+5],[-5,yy+3],[-7,yy]],B);
  shape([[-1,yy-2],[4,yy-3],[6,yy-1],[5,yy+2],[0,yy+3],[-2,yy+1]],W);
  shape([[1,yy-1],[4,yy-1],[4,yy+1],[1,yy+1]],B);
 }
 // Jagged mouth extends into a hinged lower jaw as neutral B charges.
 const jaw=2+open*8;
 shape([[17,-8],[23,-7],[23,-4],[30,-3],[30,3+jaw],[23,5+jaw],[23,8+jaw],[16,9+jaw],[20,4],[16,2],[20,-1],[16,-3]],B);
 for(let i=0;i<3;i++)shape([[18+i*4,-6+i],[20+i*4,-5+i],[20+i*4,-1+i],[18+i*4,-2+i]],W);
 shape([[17,11+jaw],[24,10+jaw],[30,5+jaw],[28,11+jaw],[22,15+jaw],[16,15+jaw]],W);
}
export function blueHeart(g,x,y,s=2,alpha=1,color=0x37caff){
 const rows=['01100110','11111111','11111111','01111110','00111100','00011000'];for(let j=0;j<rows.length;j++)for(let i=0;i<8;i++)if(rows[j][i]==='1')pixel(g,x+(i-4)*s,y+(j-3)*s,s,s,color,alpha);
}

export function redHeart(g,x,y,s=2,alpha=1){blueHeart(g,x,y,s,alpha,0xff263e);}
