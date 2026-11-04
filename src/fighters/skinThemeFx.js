import {bone,cannon,judgmentEye} from './judgmentFx.js';
import {pixel,line,crystal,leaf,moth,lantern,censer,ward,wave} from './themePixels.js';
// Cosmetic special-move identities: original hitboxes, travel and damage are retained.
export function drawSkinTheme(f,g){
 const t=f.anim,x=Math.round(f.x),y=Math.round(f.y),dir=f.facing,head=y-(f.def.headTop||48),moving=Math.abs(f.vx)>1;
 switch(f.theme){
 case 'judgment':{
   const eye=judgmentEye(f.sprite);if(eye){pixel(g,eye[0]-2,eye[1]-1,4,2,0x42eaff,.65+.3*Math.sin(t*.12));line(g,eye[0],eye[1],eye[0]-dir*7,eye[1]-Math.sin(t*.1)*2,0x4aeaff,1,.4);}
   for(let i=0;i<3;i++){const a=t*.025+i*2.094;bone(Math.sin(a)<0?f.fxBack:g,x+Math.cos(a)*26,y-23+Math.sin(a)*12,9,true,0xd7e8ff,.6);}
   if(f.state==='charge'){cannon(f.fxBack,x-dir*38,y-44,1,dir,Math.min(1,(f.charge||0)/84));}
   if(f.state==='attack'&&f.moveName==='fireball'){cannon(g,x+dir*((f.def.handOffset?.x||17)+4-34),y+(f.def.handOffset?.y||-38),1,dir,1,1-f.t/18);}
   if(f.state==='limit'){for(let i=0;i<2;i++)cannon(f.fxBack,x+(i?38:-38),y-60+Math.sin(t*.04+i)*4,1,i?-1:1,.5,.9);for(let i=-2;i<=2;i++)bone(f.fxBack,x+i*15,y-9,18,true,0xd7f4ff,.7);}
   if(moving)for(let i=0;i<3;i++)pixel(f.fxBack,x-dir*(9+i*6),y-5-i*2,2,2,0x77d9ff,(3-i)/5);
   break;}
 case 'frost':
   for(let i=-1;i<=1;i++)crystal(g,x+i*5,head-8-Math.abs(i)*2,i?3:5,0x62bde9);
   for(let i=0;i<4;i++){const k=(t+i*21)%84;pixel(g,x-19+i*11+Math.sin(k*.1)*3,head-9+k*.45,1,2,0xd9faff,.65);}
   if(moving)for(let i=0;i<3;i++)crystal(g,x-dir*(9+i*7),y-2,2,0x72b8d8,0xc9f7ff,(3-i)/5);
   if(['summon','limit'].includes(f.state))for(let i=-2;i<=2;i++){crystal(g,x+i*10,y-3,3+Math.floor((t+i*5)%12/4),0x62bde9);}
   break;
 case 'plague':{
   const cx=x-dir*15,cy=y-17+Math.sin(t*.09)*2;censer(g,cx,cy,t);
   for(let i=0;i<3;i++){const k=(t+i*14)%42;pixel(g,cx+Math.sin(k*.2)*4,cy-5-k*.5,2,2,0xaac666,(1-k/42)*.55);}
   for(let i=0;i<2;i++)moth(g,x+Math.cos(t*.06+i*3)*20,head+12+Math.sin(t*.09+i)*7,t+i*5,0xc1d47b);
   if(['summon','limit'].includes(f.state))for(let i=-2;i<=2;i++)ward(g,x+i*12,y-2,3,0xc4d780,.6);
   break;}
 case 'azure':
   wave(g,x-14,y-1,28,t,0x91d4ef,.7);
   if(moving)wave(g,x-dir*25,y-4,18,t*2,0x62b9e5,.6);
   if(f.state==='counter'&&f.counterReady()){const xx=x+dir*20;ward(g,xx,y-49,17,0xb5efff,.8);for(let i=0;i<3;i++)pixel(g,xx+dir*(4+i*3),y-50+i*9,2,5,0x62b9e5,.5);}
   if(['upb','counterstrike'].includes(f.state))for(let i=0;i<4;i++){const a=t*.2+i*1.57;pixel(g,x+Math.cos(a)*23,y-28+Math.sin(a)*12,2,3,0xd3f4ff,.8);}
   break;
 case 'hylian':
   if(moving)for(let i=0;i<3;i++)leaf(g,x-dir*(8+i*7),y-6-i*4+Math.sin(t*.12+i)*3,0x8fca7e,(3-i)/4);
   if(f.state==='counter'&&f.counterReady())ward(g,x+dir*20,y-49,16,0xffe59c,.75);
   if(f.state==='swingcharge'){const k=Math.min(1,f.swingCharge/f.def.moves.neutralB.charge.max);ward(g,x+dir*17,y-40,5+k*6,0xffedab,.4+k*.5);}
   if(f.state==='limit')for(let i=0;i<4;i++){const a=t*.035+i*1.57;leaf(g,x+Math.cos(a)*25,y-40+Math.sin(a)*12,0xffedab,.75);}
   break;
 case 'ghost':
   {const lx=x-dir*18,ly=y-30+Math.sin(t*.07)*3;line(g,lx,ly-15,lx,ly-7,0xa2b6cd,1,.65);lantern(g,lx,ly,1,.9);
   for(let i=0;i<3;i++){const k=(t+i*17)%50;pixel(g,lx+Math.sin(k*.2)*4,ly-10-k*.3,1,2,0xd4f3ff,(1-k/50)*.6);}
   if(['charge','attack','limit'].includes(f.state))for(let i=0;i<3;i++)ward(g,x+(i-1)*16,y-4,3,0xc6eaff,.45);}
   break;
 }
}
export function drawThemeFireball(p,g,x,y,r){
 if(p.owner.theme==='judgment'){
  bone(g,x,y,Math.max(12,r*2.2),false,0xf1f7ff);line(g,x-p.dir*r,y,x-p.dir*(r+9),y,0x47ddff,2,.8);for(let i=0;i<3;i++)pixel(g,x-p.dir*(r+3+i*5),y+(i%2?2:-2),2,2,0x9beeff,(3-i)/4);return true;
 }
 if(!['frost','plague'].includes(p.owner.theme))return false;
 const dir=p.dir,t=p.t;
 if(p.owner.theme==='frost'){
   crystal(g,x,y,Math.round(r),0x459dd0,0xe9ffff);line(g,x-dir*r,y,x-dir*(r+7),y,0x9edfff,2,.65);
   for(let i=0;i<3;i++)pixel(g,x-dir*(r+3+i*4),y+(i-1)*3,2,1,0xc9f7ff,(3-i)/4);
 }else{
   ward(g,x,y,Math.round(r),0x95bc55);pixel(g,x-3,y-3,6,6,0x314734);pixel(g,x-1,y-2,3,4,0xd9f89a);
   for(let i=0;i<3;i++)moth(g,x-dir*(r+3+i*4),y+Math.sin(t*.3+i)*4,t+i*3,0xc9df8b,1,(3-i)/4);
 }
 return true;
}
export function drawThemeBolt(p,g,x,y,w,h){
 if(p.owner.theme!=='ghost')return false;
 const sc=Math.max(.7,Math.min(1.25,w/12));lantern(g,x,y,sc);
 for(let i=1;i<4;i++){pixel(g,x-p.dir*(6+i*4),y-1+Math.sin(p.t*.25+i)*2,3,2,0xb8e4ff,(4-i)/5);}
 return true;
}
export function drawThemeSword(p,g,x,y,L,c,s){
 if(p.owner.theme!=='azure')return false;
 const nx=-s,ny=c;line(g,x-c*7,y-s*7,x+c*L,y+s*L,0x183459,4);line(g,x,y,x+c*L,y+s*L,0xe6faff,2);
 line(g,x-nx*5,y-ny*5,x+nx*5,y+ny*5,0x559bc2,3);
 for(let i=0;i<5;i++){const a=p.ang+i*.35;pixel(g,x-Math.cos(a)*13,y-Math.sin(a)*13,2,2,0x83d7ef,(5-i)/6);}
 return true;
}
export function drawThemePool(p,g,cx,half,fade){
 if(p.owner.theme!=='ghost')return false;
 for(let i=0;i<4;i++)wave(g,cx-half,p.y-2-i*2,half*2,p.t+i*7,i%2?0x7b98c0:0xc3e8f5,fade*(.6-i*.1));
 for(let i=0;i<3;i++){const xx=cx+(i-1)*half*.6;ward(g,xx,p.y-9-Math.sin(p.t*.1+i)*2,3,0xd4f4ff,fade*.65);}
 return true;
}
