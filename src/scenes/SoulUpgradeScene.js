import {ownedSouls} from '../souls/collection.js';
import {getSoulTeam} from '../souls/team.js';
import {SOUL_POTIONS,potionInventory,useSoulPotions} from '../souls/potions.js';
import {soulPower,portraitTexture,evolutionStatus} from '../souls/progression.js';
import {difficultyName} from '../souls/board.js';
import {drawSoulStars} from '../ui/soulStars.js';
import {FONT} from '../config.js';
import {MenuInput} from './menuInput.js';
import {makeButton} from '../ui/button.js';
import {ArcadeBg,hintBar,slant} from '../ui/arcade.js';
import {sfx} from '../audio/sfx.js';
const tx=(s,x,y,v,size=7,width=340)=>s.add.text(x,y,v,{fontFamily:FONT,fontSize:size+'px',color:'#eaf2ff',stroke:'#080d1e',strokeThickness:2,lineSpacing:5,wordWrap:{width}});
function bottle(g,x,y,color){g.fillStyle(0x090e23);g.fillRect(x-10,y-10,20,26);g.fillRect(x-5,y-18,10,10);g.fillStyle(color);g.fillRect(x-7,y-3,14,16);g.fillStyle(0xe1f8ff);g.fillRect(x-7,y-8,3,16);g.fillStyle(0xbe8b55);g.fillRect(x-6,y-21,12,5);g.fillStyle(0xffdf9e);g.fillRect(x-6,y-21,10,2);}
export class SoulUpgradeScene extends Phaser.Scene{
 constructor(){super('SoulUpgrade');}
 create(data={}){
  this.returnTo=data.returnTo||null;this.souls=ownedSouls().filter(s=>s.kind==='main');if(!this.souls.length)return this.scene.start('SoulTeam',{returnTo:this.returnTo});
  this.index=Math.max(0,this.souls.findIndex(s=>s.id===(data.id||getSoulTeam().main)));this.sel=0;this.quantity=1;this.t=0;this.message='CHOOSE A POTION TO PREVIEW YOUR UPGRADE';this.menu=new MenuInput(this);this.bgFx=new ArcadeBg(this,0x66c9dd,{second:0xa489e4});
  this.g=this.add.graphics();this.statsG=this.add.graphics();slant(this.g,-8,0,660,42,0x070e20,.96,12);tx(this,320,14,'SOUL UPGRADES',13,400).setOrigin(.5,0);makeButton(this,8,7,'< BACK',()=>this.back(),{size:'7px',pad:{x:9,y:8},depth:10});
  this.name=tx(this,34,63,'',10,200);this.rank=tx(this,34,87,'',6,200).setColor('#ffe59a');this.art=this.add.image(130,154,'soul_portraits',0);this.level=tx(this,34,218,'',12,210);this.xpLabel=tx(this,34,247,'',6,210);this.power=tx(this,34,264,'',9,210);this.maxPower=tx(this,34,283,'',6,210).setColor('#a8bcd7');
  makeButton(this,24,312,'<',()=>this.cycle(-1),{size:'9px',pad:{x:12,y:6},depth:10});makeButton(this,199,312,'>',()=>this.cycle(1),{size:'9px',pad:{x:12,y:6},depth:10});tx(this,130,322,'CHANGE SOUL',6,130).setOrigin(.5);
  this.cards=SOUL_POTIONS.map((p,i)=>{const y=60+i*47;const title=tx(this,315,y+8,p.name,8,215),info=tx(this,315,y+26,'',6,215),count=tx(this,608,y+9,'',8,90).setOrigin(1,0);const zone=this.add.zone(269,y,350,43).setOrigin(0).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.sel=i;this.quantity=1;this.message='CHOOSE HOW MANY TO USE';this.refresh();});return {y,title,info,count,zone};});
  tx(this,275,212,'QUANTITY',7,130);this.minus=makeButton(this,411,204,'-',()=>this.adjust(-1),{size:'11px',pad:{x:11,y:7},depth:10});this.qty=tx(this,480,214,'1',10,70).setOrigin(.5,0);this.plus=makeButton(this,507,204,'+',()=>this.adjust(1),{size:'11px',pad:{x:11,y:7},depth:10});this.max=makeButton(this,555,207,'MAX',()=>{this.quantity=this.maxQuantity();this.refresh();},{size:'7px',pad:{x:10,y:8},depth:10});
  this.preview=tx(this,275,244,'',8,345).setColor('#a9f5d5');this.useButton=makeButton(this,274,276,'USE POTION',()=>this.use(),{size:'10px',pad:{x:12,y:8},bg:'#246b66',hover:'#3b9d85',depth:10}).setFixedSize(342,30);
  this.evolveButton=makeButton(this,274,314,'EVOLUTION',()=>this.evolve(),{size:'8px',pad:{x:12,y:7},bg:'#80612e',hover:'#ac853f',depth:10}).setFixedSize(342,26);
  this.notice=tx(this,320,44,'',5,590).setOrigin(.5,0).setColor('#b6cce7');hintBar(this,'LEFT/RIGHT POTION   UP/DOWN QUANTITY   ENTER/A USE   Y EVOLUTION   ESC/B BACK',0x79dac5);this.refresh();
 }
 soul(){return this.souls[this.index];}
 maxQuantity(){const p=soulPower(this.soul().id),pot=SOUL_POTIONS[this.sel];return Math.max(0,Math.min(potionInventory()[pot.id],Math.ceil(((p.maxLevel-1)*100-p.xp)/pot.xp)));}
 cycle(d){this.souls=ownedSouls().filter(s=>s.kind==='main');this.index=(this.index+d+this.souls.length)%this.souls.length;this.quantity=1;this.message='CHOOSE A POTION TO PREVIEW YOUR UPGRADE';this.refresh();}
 adjust(d){this.quantity=Math.max(1,Math.min(this.maxQuantity(),this.quantity+d));this.refresh();}
 refresh(){
  const soul=this.soul(),p=soulPower(soul.id),pot=SOUL_POTIONS[this.sel],inv=potionInventory(),max=this.maxQuantity();this.quantity=max?Math.max(1,Math.min(max,this.quantity)):0;const after=soulPower(soul.id,p.xp+pot.xp*this.quantity),ev=evolutionStatus(soul.id);
  this.name.setText(soul.name.toUpperCase());this.rank.setText(difficultyName(soul.stars)+' / '+soul.aidSlots+' AID SLOTS');this.art.setTexture(portraitTexture(soul),soul.portrait).setScale(130/this.art.frame.realWidth);this.level.setText('LV. '+p.level+' / '+p.maxLevel);this.xpLabel.setText(p.nextLevel?'NEXT LEVEL  '+p.intoLevel+' / 100 XP':'MAXIMUM LEVEL REACHED');this.power.setText('POWER  '+p.power.toLocaleString());this.maxPower.setText('MAX POWER '+p.max.toLocaleString());
  this.cards.forEach((c,i)=>{const type=SOUL_POTIONS[i];c.info.setText('+'+type.xp.toLocaleString()+' XP EACH');c.count.setText('x'+inv[type.id]).setColor(inv[type.id]?'#f5e9bf':'#7e8799');});this.qty.setText(String(this.quantity));this.preview.setText(this.quantity?'LV. '+p.level+' > '+after.level+'   +'+(after.xp-p.xp).toLocaleString()+' XP\nPOWER '+p.power.toLocaleString()+' > '+after.power.toLocaleString():p.level===p.maxLevel?'MAX LEVEL / READY FOR BATTLE':'NO POTIONS OF THIS KIND LEFT');
  this.useButton.setText(this.quantity?'USE '+this.quantity+' '+(this.quantity===1?'POTION':'POTIONS'):'UNAVAILABLE').setAlpha(this.quantity?1:.4);this.useButton.input.enabled=!!this.quantity;for(const b of [this.minus,this.plus,this.max]){b.setAlpha(max?1:.4);b.input.enabled=!!max;}
  this.evolveButton.setText(ev.eligible?ev.ready?'EVOLUTION READY  >  PREVIEW':'EVOLUTION PREVIEW / NEED LV. '+ev.levelNeeded:'THIS SOUL HAS NO FURTHER EVOLUTION').setAlpha(ev.eligible?1:.45);this.evolveButton.input.enabled=ev.eligible;this.notice.setText(this.message);this.draw(p,soul);
 }
 draw(p,soul){const g=this.statsG;g.clear();g.fillStyle(0x0a1830,.97);g.fillRect(16,56,230,247);g.lineStyle(1,0x49718d);g.strokeRect(16,56,230,247);g.fillStyle(0x142b46);g.fillRect(32,237,198,5);g.fillStyle(0x72e8be);g.fillRect(32,237,198*(p.nextLevel?p.intoLevel/100:1),5);drawSoulStars(g,155,86,soul.stars,{scale:.6,spacing:11});
  this.cards.forEach((c,i)=>{g.fillStyle(i===this.sel?0x29395b:0x101f39);g.fillRect(269,c.y,350,43);g.lineStyle(i===this.sel?2:1,i===this.sel?0xffd76b:0x38536e);g.strokeRect(269,c.y,350,43);bottle(g,290,c.y+23,SOUL_POTIONS[i].color);});
 }
 use(){const result=useSoulPotions(this.soul().id,SOUL_POTIONS[this.sel].id,this.quantity);if(!result)return;this.message='UPGRADED! +'+result.gained.toLocaleString()+' XP / +'+(result.after.power-result.before.power)+' POWER';sfx('ding',.6);this.refresh();}
 evolve(){if(!evolutionStatus(this.soul().id).eligible)return;this.scene.start('SoulEvolution',{id:this.soul().id,returnTo:this.returnTo,returnScene:'SoulUpgrade'});}
 back(){this.scene.start('SoulTeam',{returnTo:this.returnTo});}
 update(){this.t++;this.bgFx.update(this.t);const m=this.menu.poll();if(m.back||m.pads.some(p=>p.button==='b'))return this.back();if(m.left||m.right){this.sel=(this.sel+(m.right?1:2))%3;this.quantity=1;this.refresh();}if(m.up)this.adjust(1);if(m.down)this.adjust(-1);if(m.pads.some(p=>p.button==='lb'))this.cycle(-1);if(m.pads.some(p=>p.button==='rb'))this.cycle(1);if(m.pads.some(p=>p.button==='y'))this.evolve();if(m.ok||m.pads.some(p=>p.button==='a'))this.use();}
}
