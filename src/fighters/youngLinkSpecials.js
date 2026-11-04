import {newAttackId} from './attackIds.js';
import {sfx} from '../audio/sfx.js';

// One geometry function drives the chain, claw and collision tip.
export function youngLinkHook(t){
 const extend=Math.max(0,Math.min(1,(t-8)/11));
 const retract=Math.max(0,Math.min(1,(t-24)/12));
 return {reach:32+94*extend*(1-retract),visible:t>=8&&t<=36};
}
export function drawYoungLinkBomb(g,x,y,t=0){
 x=Math.round(x);y=Math.round(y);
 g.fillStyle(0x090e20);g.fillRect(x-5,y-5,10,10);g.fillRect(x-7,y-3,14,6);
 g.fillStyle(t>40&&t%8<4?0xd84c37:0x273b69);g.fillRect(x-4,y-4,8,8);g.fillRect(x-6,y-2,12,4);
 g.fillStyle(0x98b9dc);g.fillRect(x-3,y-3,3,2);g.fillStyle(0x8b623a);g.fillRect(x-1,y-8,3,3);
 g.fillStyle(t%4<2?0xffde65:0xffffff);g.fillRect(x+1,y-10,2,2);
}
export class YoungLinkBomb{
 constructor(match,owner){
  this.match=match;this.owner=owner;this.alive=true;this.age=0;this.blastAge=-1;this.id='yl-bomb-'+newAttackId();
  this.x=owner.x+owner.facing*19;this.y=owner.y-28;this.vx=owner.facing*3.8;this.vy=-4.8;this.g=match.add.graphics().setDepth(4);match.addWorld(this.g);
 }
 step(){
  if(!this.alive)return;
  this.age++;
  if(this.blastAge>=0){if(++this.blastAge>15)this.kill();return;}
  const oldY=this.y;this.vy+=.24;this.x+=this.vx;this.y+=this.vy;
  for(const p of this.match.stage.platforms){
   if(p.active===false||this.vy<=0)continue;
   if(this.x>=p.x1&&this.x<=p.x2&&oldY+6<=p.y&&this.y+6>=p.y){this.y=p.y-6;this.vy=-Math.abs(this.vy)*.48;this.vx*=.72;if(Math.abs(this.vy)<.7)this.vy=0;break;}
  }
  const contact=this.age>6&&this.match.fighters.some(f=>{if(f===this.owner||!f.alive||f.team===this.owner.team)return false;const b=f.hurtbox();return this.x+6>b.x1&&this.x-6<b.x2&&this.y+6>b.y1&&this.y-6<b.y2;});
  if(this.age>=60||contact){this.blastAge=0;this.vx=this.vy=0;sfx('bighit',.65,1.3);this.match.puff(this.x,this.y,0xffd47a,12);}
  if(this.y>900)this.kill();
 }
 hitbox(){
  if(!this.alive||this.blastAge<0||this.blastAge>5)return null;
  return {x1:this.x-39,x2:this.x+39,y1:this.y-39,y2:this.y+39,owner:this.owner,facing:this.owner.facing,id:this.id,projectile:this,persist:true,h:{dmg:12,angle:65,base:3.8,growth:5.2}};
 }
 render(){
  this.g.clear();if(!this.alive)return;
  if(this.blastAge<0)return drawYoungLinkBomb(this.g,this.x,this.y,this.age);
  const r=39*(.65+.35*Math.min(1,this.blastAge/5)),a=1-this.blastAge/16;
  for(let i=0;i<12;i++){const angle=i*Math.PI/6,d=r*(.6+.4*(i%2));this.g.fillStyle(i%2?0xffb83f:0xffedb0,a);this.g.fillRect(Math.round(this.x+Math.cos(angle)*d)-7,Math.round(this.y+Math.sin(angle)*d)-7,14,14);}
  this.g.fillStyle(0xfff6df,a);this.g.fillRect(this.x-18,this.y-18,36,36);
 }
 kill(){if(!this.alive)return;this.alive=false;this.g.destroy();}
}
export function drawYoungLinkSpecial(f,g){
 f.drawCompanionFairy(g);
 if(f.state==='ylrushcharge'){const k=(f.rushCharge||0)/60,x=Math.round(f.x-16),y=Math.round(f.y+6);g.fillStyle(0x0c1021);g.fillRect(x-1,y-1,34,5);g.fillStyle(k>=1?0xffffff:0xffda72);g.fillRect(x,y,Math.round(32*k),3);g.lineStyle(1,0xffe1a0,.3+.6*k);g.strokeCircle(f.x+f.facing*12,f.y-30,3+5*k);return;}
 if(f.state==='yltether'&&f.youngLinkTether){const L=f.youngLinkTether.ledge;g.lineStyle(2,0xb6c9d3);g.lineBetween(f.x+f.facing*24,f.y-27,L.x,L.y);g.lineStyle(2,0xf6f7ee);g.strokeRect(L.x-3,L.y-3,6,6);return;}
 if(f.state==='holding'&&f.hookPullFrom&&f.grabbed){
  const y=f.y-27,tx=f.grabbed.x-f.facing*5,ty=f.grabbed.y-25;g.lineStyle(2,0xb6c9d3);g.lineBetween(f.x+f.facing*25,y,tx,ty);return;
 }
 if(f.state!=='attack')return;
 if(['neutralB','grab'].includes(f.moveName)){
  const hook=youngLinkHook(f.t);if(!hook.visible)return;
  const y=Math.round(f.y-27),tip=Math.round(f.x+f.facing*hook.reach);
  for(let d=32;d<hook.reach-3;d+=4){g.fillStyle(d%8?0xb6c9d3:0x596e82);g.fillRect(Math.round(f.x+f.facing*d),y-1,3,2);}
  g.lineStyle(2,0xe5eff5);g.lineBetween(tip-f.facing*6,y,tip,y);g.lineBetween(tip,y,tip-f.facing*4,y-4);g.lineBetween(tip,y,tip-f.facing*4,y+4);
 }
 if(f.moveName==='downB'&&f.t>=8&&f.t<22)drawYoungLinkBomb(g,f.x+f.facing*13,f.y-30,f.t);
}
export function drawTriforceSeal(g,U){
 if(U.phase!=='cutscene')return;
 const reveal=Math.min(1,(U.ct||0)/12),pulse=.7+.18*Math.sin((U.ct||0)/7);
 for(const v of U.victims){
  const c=v.center(),size=76*reveal,h=size*.866,x=c.x-size/2,y=c.y-h*2/3;
  const triangles=[[x+size/2,y,x+size/4,y+h/2,x+size*3/4,y+h/2],[x+size/4,y+h/2,x,y+h,x+size/2,y+h],[x+size*3/4,y+h/2,x+size/2,y+h,x+size,y+h]];
  for(const p of triangles){g.fillStyle(0xffd64d,.1*reveal);g.fillTriangle(...p);g.lineStyle(4,0x8d5819,pulse);g.strokeTriangle(...p);g.lineStyle(2,0xffe985,pulse);g.strokeTriangle(...p);}
 }
}

export class YoungLinkActions {
 triangleLimit(L){
  const m=this.match;
  if(this.t===1)this.ult={phase:'aim',victims:[],slashes:[],cut:0,origin:{x:this.x,y:this.y},direction:this.facing};
  const U=this.ult;if(!U)return;
  this.vx=this.vy=0;
  if(U.phase==='cutscene')return this.bladeCutscene(L,U);
  if(U.phase==='aim'&&this.t>=L.launchAt){U.phase='flight';U.triangle={x:this.x+U.direction*20,y:this.y-29};sfx('shing',.9,1.4);}
  if(U.phase==='flight'){
   const p=U.triangle,oldX=p.x;p.x+=U.direction*L.triangleSpeed;
   for(const v of m.fighters){
    if(v===this||!v.alive||v.team===this.team||['respawn','dying'].includes(v.state)||v.isIntangible())continue;
    const h=v.hurtbox();
    if(Math.min(oldX,p.x)-15>=h.x2||Math.max(oldX,p.x)+15<=h.x1||p.y+13<=h.y1||p.y-13>=h.y2)continue;
    U.victims=[v];U.phase='cutscene';U.ct=0;m.frozen=9999;m.cutscene=this;
    if(v.grabbedBy){v.grabbedBy.grabbed=null;v.grabbedBy=null;}
    v.youngLinkJuggle=null;v.vx=v.vy=v.lx=v.ly=0;v.stopChargeSound();v.setState('hitstun');v.hitstun=999;
    sfx('limitready',1,.8);m.shake(8,8);return;
   }
   if(this.t>=L.launchAt+L.triangleLife)this.endBladeLimit();
  }
 }

 startYoungLinkRush(){this.setState('ylrushcharge');this.rushCharge=0;this.vx*=.25;this.lx=0;}
 st_ylrushcharge(c){
  this.rushCharge=Math.min(60,this.rushCharge+1);this.vx*=.7;
  if(!this.grounded)this.vy=Math.min(this.vy,1);
  if(c.held('special')&&this.rushCharge<60&&!(this.isCpu&&this.rushCharge>=30))return;
  const k=this.rushCharge/60,base=this.def.moves.sideB;
  this.move={...base,frames:32+Math.round(12*k),rush:{from:4,to:16+Math.round(10*k),speed:6+7*k},hits:base.hits.map(h=>({...h,from:4,to:16+Math.round(10*k),dmg:Math.round(8+14*k),base:3+2*k,growth:4.5+2.5*k}))};
  this.moveName='sideB';this.attackId=newAttackId();this.hitList=new Set();this.setState('attack');this.swingSound(.8,.9-k*.25);
 }
 tryYoungLinkTether(c){
  if(this.def.id!=='young-link'||this.state!=='attack'||!this.move?.hookshot||this.t<9||this.t>29||c.y>.5)return false;
  const reach=youngLinkHook(this.t).reach;
  for(const p of this.match.stage.platforms){
   if(!p.solid||p.active===false)continue;
   for(const side of [-1,1]){
    if(p.ledgeSides&&!p.ledgeSides.includes(side))continue;
    const x=side<0?p.x1:p.x2,dx=(x-this.x)*this.facing;
    if(this.facing!==-side||dx<18||dx>reach+6||Math.abs(p.y-(this.y-27))>42)continue;
    if(side<0?this.x>x:this.x<x)continue;
    if(this.match.fighters.some(f=>f!==this&&f.alive&&f.ledge?.p===p&&f.ledge.side===side&&f.state.startsWith('ledge')))continue;
    this.youngLinkTether={ledge:{p,side,x,y:p.y},from:{x:this.x,y:this.y}};
    this.setState('yltether');this.vx=this.vy=this.lx=this.ly=0;sfx('clang',.5,1.6);return true;
   }
  }
  return false;
 }
 st_yltether(c){
  const T=this.youngLinkTether,L=T?.ledge;
  const occupied=L&&this.match.fighters.some(f=>f!==this&&f.alive&&f.ledge?.p===L.p&&f.ledge.side===L.side&&f.state.startsWith('ledge'));
  if(!L||!this.match.stage.platforms.includes(L.p)||L.p.active===false||occupied||c.y>.5){this.youngLinkTether=null;this.ledgeCooldown=20;this.setState('air');return;}
  L.x=L.side<0?L.p.x1:L.p.x2;L.y=L.p.y;
  const target=this.hangPos(L),k=Math.min(1,this.t/12),ease=1-(1-k)*(1-k);
  this.x=T.from.x+(target.x-T.from.x)*ease;this.y=T.from.y+(target.y-T.from.y)*ease;
  this.vx=this.vy=this.lx=this.ly=0;
  if(k>=1){this.youngLinkTether=null;this.grabLedge(L);}
 }
}

export function drawTriforceProjectile(g,f,U){
 const flight=U.phase==='flight',p=U.triangle||{x:f.x+f.facing*18,y:f.y-29},dir=U.direction||f.facing,r=flight?15:5+Math.min(1,f.t/40)*7;
 if(!flight&&U.phase!=='aim')return;
 const points=[p.x+dir*r,p.y,p.x-dir*r*.7,p.y-r*.85,p.x-dir*r*.7,p.y+r*.85];
 if(flight)for(let i=1;i<=4;i++){g.fillStyle(0xffd35a,.2/i);g.fillRect(Math.round(p.x-dir*(18+i*8)),p.y-2,10,4);}
 g.fillStyle(0xffc83d,flight ? .8 : .3);g.fillTriangle(...points);g.lineStyle(3,0x9c611b);g.strokeTriangle(...points);g.lineStyle(1,0xfff3ba);g.strokeTriangle(...points);
}
