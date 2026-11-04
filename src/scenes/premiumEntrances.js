import {bone,cannon,blueHeart} from '../fighters/judgmentFx.js';
import {pixel,line,crystal} from '../fighters/themePixels.js';
import {premiumAnimationFor} from '../fighters/premiumAnimations.js';
import {skinInfo} from '../fighters/skins.js';
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
function ring(g,x,y,rx,ry,c,a=1){for(let i=0;i<72;i++){const q=i*Math.PI/36;pixel(g,x+Math.cos(q)*rx,y+Math.sin(q)*ry,2,1,c,a);}}
export function drawPremiumEntrance(g,e,p,t){
 if(!['clockwork','prism-shell','choir-tide','quarantine-lantern','judgment-door'].includes(e.I.kind))return null;
 const {f,x,y,I}=e,reveal=ease((p-.38)/.3),settle=ease((p-.65)/.35),fade=1-ease((p-.76)/.3);
 e.premiumPhase=p<.38?'summon':p<.68?'materialize':'settle';
 if(p<=0)return {vis:0,dy:0,sc:1};
 const spec=e.premiumSpec??=premiumAnimationFor(f.def.id,skinInfo(f.def.id,f.skin).name);
 if(spec)f.sprite.setTexture(spec.idleKey,Math.floor(t/2)%spec.idle[1]).setOrigin(...spec.idleOrigin).setPosition(Math.round(x),Math.round(y)).setRotation(0).setScale(1);
 if(p>1.06)return {vis:1,dy:0,sc:1};
 if(I.kind==='judgment-door'){
  const open=ease(p/.4),vanish=1-ease((p-.58)/.35);g.fillStyle(0x050a14,.94*vanish);g.fillRect(x-27*open,y-76,54*open,76);
  for(const sign of [-1,1]){line(g,x+sign*27*open,y-76,x+sign*27*open,y,0x8adfff,2,vanish);for(let i=0;i<3;i++)bone(g,x+sign*(32+10*fade),y-16-i*19,10,true,0xeaf6ff,fade*.75);}
  line(g,x-27*open,y-76,x+27*open,y-76,0xd7f3ff,2,vanish);if(p<.5)blueHeart(g,x,y-35,1.1,vanish);if(p>.48&&p<.87)cannon(g,x-34,y-51,.6,1,Math.sin(p*Math.PI),fade);
  return {vis:ease((p-.3)/.25),dy:0,sc:1};
 }
 if(I.kind==='quarantine-lantern'){
  const rise=ease(p/.5),cx=x-19,cy=y-14-rise*36,lit=1-ease((p-.72)/.28);
  g.fillStyle(0xb5db81,.12*lit);g.fillEllipse(cx,cy,32,40);
  g.fillStyle(0x273f36,lit);g.fillRect(cx-7,cy-10,14,22);g.lineStyle(1,0xc4a66c,lit);g.strokeRect(cx-7,cy-10,14,22);
  for(let j=-1;j<=1;j++)line(g,cx+j*4,cy-10,cx+j*4,cy+12,0xb69760,1,lit);
  pixel(g,cx-2,cy-5,5,12,0xd9f6ad,lit);line(g,cx,cy-10,cx,cy-17,0xb69760,1,lit);
  for(let i=0;i<8;i++){const a=i*Math.PI/4+t*.04,rr=12+40*(1-settle),xx=x+Math.cos(a)*rr,yy=y-25+Math.sin(a)*rr*.5;line(g,xx-3,yy-2,xx,yy+1,0xd5e8a6,1,fade);line(g,xx,yy+1,xx+3,yy-2,0xb7c98a,1,fade);}
  for(let i=0;i<4;i++){g.fillStyle(0x8baf6a,fade*.12);g.fillEllipse(x+Math.sin(t*.03+i)*22,y-i*5,32+i*6,8);}
  return {vis:ease((p-.25)/.45),dy:6*(1-settle),sc:1};
 }
 if(I.kind==='clockwork'){
  const r=24+60*(1-ease(p/.65));
  ring(g,x,y-31,r,r,0xd9bb74,fade*.85);ring(g,x,y-31,r-5,r-5,0x93decb,fade*.65);
  for(let i=0;i<12;i++){const q=i*Math.PI/6+t*.026,xx=x+Math.cos(q)*r,yy=y-31+Math.sin(q)*r;line(g,xx,yy,xx+Math.cos(q)*4,yy+Math.sin(q)*4,0xffedb0,2,fade);}
  const a=t*.15;line(g,x,y-31,x+Math.cos(a)*r*.7,y-31+Math.sin(a)*r*.7,0xd5ffeb,2,fade);
  for(let i=0;i<6;i++){const q=i*Math.PI/3+t*.05,rr=18+35*fade,xx=x+Math.cos(q)*rr,yy=y-30+Math.sin(q)*rr*.58;pixel(g,xx-2,yy-2,5,5,0x5b7464,fade);line(g,xx-2,yy-2,xx+2,yy-2,0xe8cc88,1,fade);}
  if(reveal>0&&settle<1){g.fillStyle(0xd4ffe8,(1-settle)*.1);g.fillEllipse(x,y-27,35,68);}
  return {vis:reveal,dy:10*(1-settle),sc:1};
 }
 if(I.kind==='prism-shell'){
  const form=ease(p/.38),split=ease((p-.58)/.28),height=67*form;
  if(split<1){g.fillStyle(0x9edee9,(1-split)*.19);g.fillTriangle(x,y-height,x-22,y-26,x,y+2);g.fillStyle(0xd0b5ef,(1-split)*.22);g.fillTriangle(x,y-height,x+22,y-26,x,y+2);line(g,x,y-height,x-22,y-26,0xd7ffff,1,1-split);line(g,x-22,y-26,x,y+2,0xd7ffff,1,1-split);line(g,x,y-height,x+22,y-26,0xe9d4ff,1,1-split);}
  for(let i=0;i<8;i++){const q=i*Math.PI/4+t*.025,r=22+split*35,xx=x+Math.cos(q)*r,yy=y-30+Math.sin(q)*r*.6;crystal(g,xx,yy,3+i%2,[0xa2eee7,0xe4b5f5,0xd9e7ff][i%3],0xf2ffff,form*fade);}
  ring(g,x,y,30*form,7*form,0xb9f4ec,fade*.8);
  return {vis:reveal,dy:-22*(1-settle),sc:1};
 }
 const open=ease(p/.45),width=30*open;
 ring(g,x,y,width,7*open,0x86dcca,fade);ring(g,x,y-34,width*.75,32*open,0xbdb48c,fade*.7);
 for(let i=0;i<5;i++){const xx=x+(i-2)*10;line(g,xx,y,xx+Math.sin(t*.045+i)*3,y-60*open,0x7bbfb8,1,fade*.25);}
 for(let i=0;i<16;i++){const q=(t+i*7)%68/68,xx=x+Math.sin(i*2+t*.025)*(12+open*20);ring(g,xx,y-q*76,1+i%2,1+i%2,0xb7e9d6,fade*.6);}
 const bellY=y-71+Math.sin(t*.08)*2;line(g,x,y-105,x,bellY-7,0xbeb58c,1,fade);g.fillStyle(0x8ccdbb,fade);g.fillTriangle(x,bellY-7,x-6,bellY+4,x+6,bellY+4);pixel(g,x-1,bellY+5,2,2,0xf2e5b5,fade);
 for(let i=0;i<3;i++)ring(g,x,y-3,24+((t+i*12)%40),6+((t+i*12)%40)*.16,0x8cebd4,fade*.25);
 return {vis:reveal,dy:22*(1-settle),sc:1};
}
