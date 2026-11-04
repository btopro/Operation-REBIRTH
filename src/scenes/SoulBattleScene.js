import {drawSoulStars} from '../ui/soulStars.js';
import {soulEncounter} from '../souls/encounters.js';
import {difficultyName} from '../souls/board.js';
import {ownsSoul} from '../souls/collection.js';
import {soulPower,portraitTexture} from '../souls/progression.js';
import {getSoulTeam,mainSoul} from '../souls/team.js';
import {ROSTER,TEST_ROSTER,fighterById,showFighter} from '../fighters/roster.js';
import {stepSkin,skinInfo} from '../fighters/skins.js';
import {stageById} from '../stage/stages.js';
import {settings} from '../settings.js';
import {FONT} from '../config.js';
import {MenuInput} from './menuInput.js';
import {makeButton} from '../ui/button.js';
import {ArcadeBg,hintBar,slant} from '../ui/arcade.js';
export class SoulBattleScene extends Phaser.Scene{
 constructor(){super('SoulBattle');}
 create(data={}){
  this.enc=soulEncounter(data.soulId);if(!this.enc)return this.scene.start('SoulBoard');
  this.sys.settings.data={};this.soulId=data.soulId;this.t=0;this.roster=[...ROSTER,...TEST_ROSTER];this.sel=Math.max(0,this.roster.findIndex(f=>f.id===data.fighter));this.skin=data.skin||0;this.menu=new MenuInput(this);
  const e=this.enc,accent=[0x84c9ab,0x72b8ca,0xa99bdd,0xd78bab,0xd6b565][e.stars-1];this.bgFx=new ArcadeBg(this,accent,{second:0xb596f5});
  const txt=(x,y,v,size=7,width=170,color='#eee4ff')=>this.add.text(x,y,v,{fontFamily:FONT,fontSize:size+'px',color,stroke:'#080713',strokeThickness:2,lineSpacing:5,wordWrap:{width}});
  // The stage fills the backdrop; the left thumbnail is the same encounter's actual map.
  this.stageBackdrop=this.add.graphics().setAlpha(.3);const stage=stageById(e.stage);stage.preview?.(this.stageBackdrop,0,70,640,278);
  const g=this.add.graphics();g.fillStyle(0x07060e,.45);g.fillRect(0,72,640,280);
  slant(g,-16,11,675,65,accent,1,20);slant(g,-18,16,212,58,0x151423,.65,16);
  this.difficulty=txt(18,30,difficultyName(e.stars),10,174,'#ffdf96');drawSoulStars(g,18,48,e.stars,{scale:.7,spacing:12});txt(23+e.stars*12,52,e.soul.kind.toUpperCase(),6,104);
  txt(337,20,ownsSoul(this.soulId)?'SOUL REPLAY / COINS + MAIN XP':'SOUL BOARD CHALLENGE',6,290).setOrigin(.5,0);this.soulName=txt(337,36,e.soul.name.toUpperCase(),19,310,'#ffffff').setOrigin(.5,0);
  const power=soulPower(e.soul.id);txt(625,28,power?'POWER\n'+power.power.toLocaleString():'AID SOUL\n'+(e.soul.slotCost||1)+' SLOT',7,100,'#ffdf96').setOrigin(1,0);
  slant(g,367,79,286,29,0x07060e,.96,10);this.puppetName=txt(385,88,fighterById(e.puppet).name,12,245,'#fff5cc');
  // Large soul and puppet portraits occupy the center and right, like the supplied reference.
  this.puppet=showFighter(this.add.sprite(506,328,'ss_idle'),fighterById(e.puppet).def,0,e.skin||0);const ph=this.puppet.frame.realHeight;this.puppet.setScale(['hero-knight','young-link'].includes(e.puppet)?4.2:215/ph).setAlpha(.95);if(['hero-knight','young-link'].includes(e.puppet))this.puppet.y=305;if(e.tint)this.puppet.setTint(e.tint);
  this.portrait=this.add.image(302,188,portraitTexture(e.soul),e.soul.portrait).setDisplaySize(180,180);
  this.portraitHomeY=188;
  // Rules and map remain truthful to the encounter instead of copying the reference's hazards.
  const rule=(y,label,value)=>{slant(g,8,y,190,17,0x07060e,.94,5);txt(18,y+5,label,6,169,'#e8ddba');slant(g,8,y+17,190,23,accent,.9,5);txt(18,y+24,value,7,167,'#ffffff');};
  rule(112,'RULE / STOCK BATTLE','YOU: 2 / ENEMY: '+e.stocks);rule(157,'HAZARDS / ITEMS','OFF / OFF');
  g.fillStyle(0x07060e,.95);g.fillRect(13,204,182,63);this.stagePreview=this.add.graphics();stage.preview?.(this.stagePreview,17,207,174,47);const stageClip=this.make.graphics({x:0,y:0,add:false});stageClip.fillRect(17,207,174,47);this.stagePreview.setMask(stageClip.createGeometryMask());this.events.once('shutdown',()=>stageClip.destroy());txt(17,257,e.stageName,5,176);
  slant(g,8,273,410,31,0x07060e,.86,8);txt(18,278,'CONDITIONS',6,380,'#ffdf96');this.conditions=txt(18,289,e.brief,5,386);
  // A compact player picker stays available, while Team and Fight anchor the lower right.
  slant(g,8,309,410,36,0x141126,.98,8);this.name=txt(19,314,'',6,292);this.skinLabel=txt(19,330,'',5,170,'#bfc3e0');
  makeButton(this,214,322,'<',()=>this.select(-1),{size:'8px',depth:10});makeButton(this,253,322,'>',()=>this.select(1),{size:'8px',depth:10});makeButton(this,301,322,'PALETTE',()=>this.color(),{size:'6px',depth:10});
  this.hero=showFighter(this.add.sprite(402,341,'ss_idle'),this.roster[this.sel].def,0,this.skin).setScale(.4);
  this.teamButton=makeButton(this,460,242,'TEAM',()=>this.changeTeam(),{size:'13px',pad:{x:18,y:9},bg:'#b68b2b',hover:'#dfb443',depth:10});this.teamButton.setFixedSize(168,49);
  this.teamLabel=txt(480,274,'',5,140,'#fff0b5').setDepth(11);
  this.fightButton=makeButton(this,460,301,'FIGHT',()=>this.fight(),{size:'19px',pad:{x:22,y:10},bg:'#e1ae29',hover:'#f8d055',depth:10}).setFixedSize(168,44);
  makeButton(this,7,0,'< BACK',()=>this.scene.start('SoulBoard'),{size:'7px',bg:'#245846',depth:10});
  this.teamKey=this.input.keyboard.addKey('T');this.colorKey=this.input.keyboard.addKey('C');this.onTeam=()=>this.changeTeam();this.onColor=()=>this.color();this.teamKey.on('down',this.onTeam);this.colorKey.on('down',this.onColor);this.events.once('shutdown',()=>{this.teamKey.off('down',this.onTeam);this.colorKey.off('down',this.onColor);});
  hintBar(this,'LEFT/RIGHT FIGHTER   C PALETTE   T TEAM   ENTER/A FIGHT   ESC/B BACK',accent);this.select(0);this.refreshTeam();if(data.autoFight)this.fight();
 }
 refreshTeam(){const t=getSoulTeam(),s=mainSoul(t),p=s&&soulPower(s.id);this.teamLabel.setText(s?s.name.toUpperCase()+' / '+p.power+' PWR':'NO MAIN EQUIPPED');}
 select(d){this.sel=(this.sel+d+this.roster.length)%this.roster.length;if(d)this.skin=0;const f=this.roster[this.sel];this.name.setText('YOUR FIGHTER: '+f.name);showFighter(this.hero,f.def,0,this.skin);this.hero.setScale(30/this.hero.frame.realHeight);this.skinLabel.setText(skinInfo(f.id,this.skin).name);}
 color(){this.skin=stepSkin(this.roster[this.sel].id,this.skin,1);this.select(0);}
 changeTeam(){this.scene.start('SoulTeam',{returnTo:{soulId:this.soulId,fighter:this.roster[this.sel].id,skin:this.skin}});}
 fight(){const e=this.enc;const setup={...settings,mode:'stock',stocks:2,minutes:0,cpuCount:1,difficulty:2,cpuLevels:[2,2],items:false,hazards:false,stage:e.stage,track:'auto',extraPads:[],picks:[this.roster[this.sel].id,e.puppet],skins:[this.skin,e.skin||0],from:'SoulBoard'};this.scene.start('Match',{soulBattle:{soulId:this.soulId,setup}});}
 update(){this.t++;this.bgFx.update(this.t);this.portrait.y=this.portraitHomeY+Math.sin(this.t*.035)*2;showFighter(this.hero,this.roster[this.sel].def,Math.floor(this.t/6),this.skin);showFighter(this.puppet,fighterById(this.enc.puppet).def,Math.floor(this.t/6),this.enc.skin||0);const m=this.menu.poll();if(m.back||m.pads.some(p=>p.button==='b'))return this.scene.start('SoulBoard');if(m.left)this.select(-1);if(m.right)this.select(1);if(m.pads.some(p=>p.button==='y'))return this.changeTeam();if(m.pads.some(p=>p.button==='x'))this.color();if(m.ok||m.pads.some(p=>p.button==='a'))this.fight();}
}
