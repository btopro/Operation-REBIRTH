import {evolutionStatus,evolutionPreview,evolveSoul,portraitTexture} from '../souls/progression.js';
import {difficultyName} from '../souls/board.js';
import {drawSoulStars} from '../ui/soulStars.js';
import {MenuInput} from './menuInput.js';
import {FONT} from '../config.js';
import {makeButton} from '../ui/button.js';
import {ArcadeBg,hintBar,panel} from '../ui/arcade.js';
import {sfx} from '../audio/sfx.js';
export class SoulEvolutionScene extends Phaser.Scene{
 constructor(){super('SoulEvolution');}
 create(data={}){
  this.returnScene=data.returnScene||'SoulTeam';this.id=data.id;this.returnTo=data.returnTo||null;this.result=evolutionPreview(this.id);if(!this.result)return this.scene.start('SoulTeam',{returnTo:this.returnTo});
  this.t=0;this.evolving=false;this.done=false;this.menu=new MenuInput(this);this.bgFx=new ArcadeBg(this,0xf2bd58,{second:0x9b82e5});
  const tx=(x,y,value,size=7,width=270)=>this.add.text(x,y,value,{fontFamily:FONT,fontSize:size+'px',color:'#fff1ce',stroke:'#080713',strokeThickness:2,lineSpacing:7,wordWrap:{width}});
  this.title=tx(320,14,'SOUL EVOLUTION',16,580).setOrigin(.5,0);this.backButton=makeButton(this,8,7,'< BACK',()=>this.back(),{size:'6px',depth:10});
  this.panels=this.add.graphics();panel(this.panels,18,61,281,232,0xc79f68);panel(this.panels,341,61,281,232,0xffd34f);
  this.fx=this.add.graphics().setDepth(1);const r=this.result;
  this.beforeName=tx(158,73,r.beforeSoul.name.toUpperCase(),9,260).setOrigin(.5,0);this.afterName=tx(482,73,r.afterSoul.name.toUpperCase(),9,260).setOrigin(.5,0);
  this.beforeArt=this.add.image(158,173,portraitTexture(r.beforeSoul),r.beforeSoul.portrait).setDepth(2);this.afterArt=this.add.image(482,173,portraitTexture(r.afterSoul),r.afterSoul.portrait).setDepth(2);
  for(const art of [this.beforeArt,this.afterArt])art.setScale(Math.min(230/art.frame.realWidth,144/art.frame.realHeight));
  this.beforeStats=tx(32,251,difficultyName(r.beforeSoul.stars)+' / LV '+r.before.level+'\nPOWER '+r.before.power+' / '+r.beforeSoul.aidSlots+' AID SLOTS',6,250);
  this.afterStats=tx(355,251,difficultyName(r.afterSoul.stars)+' / LV '+r.after.level+'\nPOWER '+r.after.power+' / '+r.afterSoul.aidSlots+' AID SLOTS',6,250);
  this.arrow=tx(320,158,'>>',13,40).setOrigin(.5);this.rating=this.add.graphics().setDepth(3);drawSoulStars(this.rating,40,95,r.beforeSoul.stars,{scale:.6,spacing:11});drawSoulStars(this.rating,363,95,r.afterSoul.stars,{scale:.6,spacing:11});
  this.description=tx(16,303,r.afterSoul.description,6,608);const status=evolutionStatus(this.id),ready=status.ready;
  this.confirmButton=makeButton(this,320,324,ready?'EVOLVE / +5 LEVELS':'REQUIRES LEVEL '+status.levelNeeded,()=>this.confirm(),{originX:.5,size:'7px',bg:'#8e6724',depth:10});this.confirmButton.setAlpha(ready?1:.5);
  this.doneButton=makeButton(this,320,324,this.returnScene==='SoulUpgrade'?'BACK TO UPGRADES':'TEAM SELECT',()=>this.back(),{originX:.5,size:'7px',bg:'#385d35',depth:10}).setVisible(false);
  hintBar(this,'EVOLUTION IS PERMANENT   ENTER/A EVOLVE   ESC/B BACK',0xffd34f);
 }
 confirm(){
  if(this.evolving||!evolutionStatus(this.id).ready)return;const result=evolveSoul(this.id);if(!result)return;
  this.result=result;this.evolving=true;this.confirmButton.setVisible(false);this.title.setText('EVOLVING...');this.panels.clear();this.rating.clear();
  [this.beforeName,this.afterName,this.beforeStats,this.afterStats,this.arrow].forEach(o=>o.setVisible(false));this.tweens.add({targets:this.beforeArt,alpha:0,duration:350});
  this.tweens.add({targets:this.afterArt,x:320,y:168,scale:this.afterArt.scaleX*1.28,duration:750,ease:'Back.Out'});sfx('limitready',.8);
  this.time.delayedCall(800,()=>{this.done=true;this.title.setText('EVOLVED!');this.afterName.setText(result.afterSoul.name.toUpperCase()).setPosition(320,53).setVisible(true);this.afterStats.setText(difficultyName(result.afterSoul.stars)+' / LV '+result.after.level+' / POWER '+result.after.power+'\nMAX LEVEL '+result.after.maxLevel+' / MAX POWER '+result.after.max+' / '+result.afterSoul.aidSlots+' AID SLOTS').setPosition(320,267).setOrigin(.5,0).setVisible(true);this.doneButton.setVisible(true);drawSoulStars(this.rating,270,247,result.afterSoul.stars,{scale:.8,spacing:18,shadow:0x57334e});sfx('ding',.8);});
 }
 back(){this.scene.start(this.returnScene,{id:this.id,returnTo:this.returnTo});}
 update(){this.t++;this.bgFx.update(this.t);if(this.evolving&&this.t%5===0){const g=this.fx;g.clear();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=76+(this.t+i*11)%75;g.fillStyle(i%2?0xffd34f:0xcbb4ff,.8*(1-(r-76)/75));g.fillRect(Math.round(320+Math.cos(a)*r),Math.round(168+Math.sin(a)*r),3,3);g.lineStyle(1,0xffd34f,.1);g.lineBetween(320,168,320+Math.cos(a)*210,168+Math.sin(a)*210);}}
  const m=this.menu.poll();if(m.back||m.pads.some(p=>p.button==='b'))return this.back();if(m.ok||m.pads.some(p=>p.button==='a')){if(this.done)this.back();else this.confirm();}
 }
}
