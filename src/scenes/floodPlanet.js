import {pixel,line,crystal} from '../fighters/themePixels.js';
const continents=[[[6,12],[18,7],[26,13],[24,21],[18,26],[16,32],[12,25],[7,23]],[[22,31],[30,33],[35,41],[31,51],[25,57],[24,47],[20,40]],[[34,14],[43,11],[49,18],[45,25],[50,31],[45,43],[39,46],[35,37],[33,29]],[[42,9],[54,13],[58,21],[54,28],[47,26],[43,20]],[[48,41],[56,40],[60,47],[55,51],[48,48]]];
function inside(x,y,p){let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [a,b]=p[i],[c,d]=p[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes;}return yes;}
const cells=[];for(let y=0;y<64;y++)for(let x=0;x<64;x++){const nx=(x-31.5)/31,ny=(y-31.5)/31,rr=nx*nx+ny*ny;if(rr>1)continue;const z=Math.sqrt(1-rr),light=Math.max(.1,-nx*.28-ny*.3+z*.65),land=continents.some(p=>inside(x,y,p));cells.push({x,y,light,land,group:(Math.floor(x/6)*37+Math.floor(y/6)*19)%17/17,crack:x%6===0||y%6===0,edge:rr>.94});}
export function planet(g,cx,cy,r,t,flood=0,fracture=0){
 const scene=g.scene,key='cinematic_flood_planet',state=Math.round(flood*64)+':'+Math.round(fracture*64);
 if(!scene.planetSprite){const texture=scene.textures.exists(key)?scene.textures.get(key):scene.textures.createCanvas(key,64,64);texture.setFilter(0);scene.planetSprite=scene.add.image(cx,cy,key).setOrigin(.5);scene.cineWorld.addAt(scene.planetSprite,scene.cineWorld.getIndex(g)+1);scene.planetState=null;}
 if(scene.planetState!==state){const texture=scene.textures.get(key),ctx=texture.getContext(),im=ctx.createImageData(64,64),p=im.data;let green=0;
  for(const c of cells){let land=c.land&&flood<c.group+.06;if(flood>=1)land=false;const ramp=land?[0x274b3b,0x4c8050,0x91b364]:[0x173b69,0x296e9c,0x65adc4];let color=ramp[c.light>.65?2:c.light>.4?1:0];if(land&&fracture>.05&&c.crack&&c.group<fracture)color=0xb3e5de;if(c.edge)color=0x8fcad6;if(land)green++;const n=(c.y*64+c.x)*4;p[n]=color>>16&255;p[n+1]=color>>8&255;p[n+2]=color&255;p[n+3]=255;}
  ctx.putImageData(im,0,0);texture.refresh();scene.planetState=state;scene.planetGreen=green;
 }
 scene.planetSprite.setPosition(cx,cy).setDisplaySize(r*2,r*2).setVisible(true);
 if(fracture>0&&fracture<1)for(let i=0;i<10;i++){const a=i*.63,p=Math.max(0,fracture-i*.035);if(p<=0)continue;const d=r*(.6+p*.7);pixel(g,cx+Math.cos(a)*d,cy+Math.sin(a)*d,Math.max(2,10*(1-p)),Math.max(2,7*(1-p)),i%2?0x78a85f:0x456d49,1-p);}
 return scene.planetGreen;
}

export function space(g,t){pixel(g,-160,-90,960,650,0x080e1e);for(let i=0;i<50;i++)pixel(g,(i*137)%820-90,(i*71)%450-40,i%7===0?2:1,1,i%3?0x73899f:0xc3d4df,.8);}
export function waterOrb(g,x,y,r,t){for(let yy=-r;yy<=r;yy+=2){const half=Math.floor(Math.sqrt(Math.max(0,r*r-yy*yy)));pixel(g,x-half,y+yy,half*2,2,yy<-r*.3?0x9cdce9:yy>r*.4?0x276b99:0x4b9cbe);}for(let i=0;i<10;i++){const a=t*.04+i*.628;pixel(g,x+Math.cos(a)*r*.84,y+Math.sin(a)*r*.84,2,3,0xd5fbfb,.9);}line(g,x-r*.3,y-r*.35,x+r*.25,y-r*.5,0xe6ffff,2,.8);}
export function frostEdges(g,p,t){p=Math.max(0,Math.min(1,p));for(const [cx,cy,sx,sy]of [[0,0,1,1],[640,0,-1,1],[0,360,1,-1],[640,360,-1,-1]])for(let j=0;j<8;j++){const a=.12+j*.18,len=(46+j*17)*p,ex=cx+sx*Math.cos(a)*len,ey=cy+sy*Math.sin(a)*len;line(g,cx,cy,ex,ey,0xb9ebf2,1+(j%2),.85);for(let k=1;k<5;k++){const q=k/5,bx=cx+(ex-cx)*q,by=cy+(ey-cy)*q;line(g,bx,by,bx+sx*(9+j)*p,by-sy*(8+j)*p,0x79b8d1,1,.8);}if(p>.4)crystal(g,ex,ey,3+p*3,0x83c5dc,0xe0ffff,.8);} }
