import {resolveSoul} from '../souls/evolution.js';
import {SOULS,difficultyName} from '../souls/board.js';
import {soulPower,portraitTexture} from '../souls/progression.js';
import {drawSoulStars} from '../ui/soulStars.js';
import {lowEffects} from '../performance.js';
import {MenuInput} from './menuInput.js';
import {FONT} from '../config.js';
import {makeButton} from '../ui/button.js';
import {hintBar,slant} from '../ui/arcade.js';
import {sfx} from '../audio/sfx.js';
import {playMusic} from '../audio/music.js';
export class SoulRewardScene extends Phaser.Scene{
 constructor(){super('SoulReward');}
 create(data){
  this.soul=resolveSoul(SOULS.find(s=>s.id===data.soulBattle?.soulId));if(!this.soul||!data.soulWon)return this.scene.start('SoulBoard');
  this.t=0;this.choice=0;this.menu=new MenuInput(this);playMusic(this,'bgm_title');sfx('limitready',.8);
  const txt=(x,y,v,size=8,width=320,color='#ffffff')=>this.add.text(x,y,v,{fontFamily:FONT,fontSize:size+'px',color,stroke:'#06110c',strokeThickness:3,lineSpacing:4,wordWrap:{width}});
  this.burst=this.add.graphics();this.drawBurst();
  const g=this.add.graphics();slant(g,69,40,600,43,0x16813b,.9,28);slant(g,86,49,570,28,0x5fee5e,.12,24);
  this.gotIt=txt(20,25,'GOT IT!',25,300,'#ffe991').setAngle(-5);this.soulName=txt(340,53,this.soul.name.toUpperCase(),18,535).setOrigin(.5,0);
  this.portrait=this.add.image(320,173,portraitTexture(this.soul),this.soul.portrait);const scale=Math.min(236/this.portrait.frame.realWidth,175/this.portrait.frame.realHeight);this.portrait.setScale(scale*.8).setAlpha(0);this.tweens.add({targets:this.portrait,scale,alpha:1,duration:420,ease:'Back.Out'});
  this.sparkles=this.add.graphics();this.starG=this.add.graphics();
  // Main and Aid rewards share the card layout, but only Mains have power and levels.
  slant(g,-10,260,660,48,0x02170d,.95,12);slant(g,190,260,118,48,0x27883e,.96,12);g.lineStyle(1,0x7ee293,.8);g.lineBetween(16,279,174,279);g.lineBetween(16,303,174,303);
  txt(19,265,this.soul.kind==='main'?'MAIN SOUL':'AID SOUL',8,165);this.tier=txt(23+this.soul.stars*18,290,difficultyName(this.soul.difficultyStars||this.soul.stars),6,120,'#fff2c3');
  const p=soulPower(this.soul.id);this.power=txt(245,265,p?String(p.power):String(this.soul.slotCost||1),18,105).setOrigin(.5,0);txt(245,291,p?'POWER / MAX '+p.max:'AID SLOT',5,125,'#d3f6d2').setOrigin(.5,0);
  this.level=txt(320,266,p?'LV. '+p.level+' / '+p.maxLevel:'ABILITY SOUL',8,180);txt(320,285,p?'ATK +'+Math.round((p.damage-1)*100)+'% / TAKEN -'+Math.round((1-p.taken)*100)+'%':'AIDS DO NOT LEVEL',5,180,'#d3f6d2');
  txt(529,266,p?this.soul.aidSlots+' AID SLOTS':this.soul.effect==='heal100'?'ONCE / STOCK':'EQUIP IN TEAM',7,105,'#fff2c3');txt(529,285,p?(p.nextLevel?'XP '+p.intoLevel+' / 100':'MAX LEVEL'):'SPECIAL ABILITY',5,105,'#d3f6d2');
  this.benefits=txt(16,311,this.soul.description,5,608,'#e8f9dc');
  this.actions=[makeButton(this,210,323,'SOUL BOARD',()=>this.leave(0),{originX:.5,size:'7px',bg:'#195a35',depth:10}),makeButton(this,430,323,'TEAM SELECT',()=>this.leave(1),{originX:.5,size:'7px',bg:'#195a35',depth:10})];
  hintBar(this,'SOUL EARNED / SAVED   LEFT/RIGHT CHOOSE   ENTER/A CONFIRM   ESC/B BOARD',0x66ed87);this.drawRating();
 }
 drawBurst(){const g=this.burst;g.fillStyle(0x052315);g.fillRect(0,0,640,360);for(let i=0;i<32;i++){const a=i*Math.PI/16,b=a+.035+(i%3)*.014,cx=320,cy=174;g.fillStyle(i%3===0?0xa8f176:i%2?0x1c8a3c:0x0d5b2e,i%3===0?.6:.8);g.fillTriangle(cx,cy,cx+Math.cos(a)*760,cy+Math.sin(a)*760,cx+Math.cos(b)*760,cy+Math.sin(b)*760);}g.fillStyle(0x9fe889,.08);g.fillCircle(320,174,113);g.lineStyle(1,0xc4ff94,.35);for(let i=0;i<12;i++){const a=i*Math.PI/6+.17;g.lineBetween(320+Math.cos(a)*65,174+Math.sin(a)*65,320+Math.cos(a)*700,174+Math.sin(a)*700);}}
 drawRating(){this.starG.clear();drawSoulStars(this.starG,19,285,this.soul.stars,{scale:.85,spacing:18,shadow:0x3b2447,frame:this.t,motion:true});}
 leave(choice){this.scene.start(choice===1?'SoulTeam':'SoulBoard');}
 update(){this.t++;this.portrait.y=173+Math.sin(this.t*.035)*2;if(this.t%(lowEffects()?8:4)===0){this.drawRating();const g=this.sparkles;g.clear();for(let i=0;i<7;i++){const phase=(this.t+i*29)%100;if(phase>52)continue;const a=i*2.399,x=320+Math.cos(a)*(75+i*8),y=174+Math.sin(a)*(58+i*6),r=phase<26?2:1;g.fillStyle(0xe8ffd4,(52-phase)/52);g.fillRect(Math.round(x)-r*2,Math.round(y),r*4,r);g.fillRect(Math.round(x),Math.round(y)-r*2,r,r*4);}}
  this.actions.forEach((a,i)=>a.setColor(i===this.choice?'#ffdf83':'#ffffff'));const m=this.menu.poll();if(m.left)this.choice=0;if(m.right)this.choice=1;if(m.back||m.pads.some(p=>p.button==='b'))return this.leave(0);if(m.ok||m.pads.some(p=>p.button==='a'))this.leave(this.choice);
 }
}
