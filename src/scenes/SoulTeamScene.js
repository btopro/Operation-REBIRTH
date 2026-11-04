import {drawSoulStars} from '../ui/soulStars.js';
import {soulPower,portraitTexture,evolutionStatus} from '../souls/progression.js';
import {ownedSouls} from '../souls/collection.js';
import {FONT,VIEW_W} from '../config.js';
import {SOULS,difficultyName} from '../souls/board.js';
import {getSoulTeam,saveSoulTeam,setMainSoul,setAidSoul,mainSoul,savedSoulTeams,saveSoulPreset,loadSoulPreset} from '../souls/team.js';
import {MenuInput} from './menuInput.js';
import {playMusic} from '../audio/music.js';
import {sfx} from '../audio/sfx.js';
import {makeButton} from '../ui/button.js';
import {addFullscreenButton} from '../ui/fullscreen.js';
import {ArcadeBg,hintBar,slant} from '../ui/arcade.js';
const C=0x77bbf4,GOLD=0xffd34f;
const tx=(s,x,y,v,size=6,width)=>s.add.text(x,y,v,{fontFamily:FONT,fontSize:size+'px',color:'#e6edf6',stroke:'#080713',strokeThickness:2,lineSpacing:4,...(width?{wordWrap:{width}}:{})});
function fit(image,soul,w,h){image.setVisible(!!soul);if(soul){image.setTexture(portraitTexture(soul),soul.portrait);image.setScale(Math.min(w/image.frame.realWidth,h/image.frame.realHeight));}}
function hex(g,x,y,w,h,fill,edge){const p=[{x:x+15,y},{x:x+w-14,y},{x:x+w,y:y+h/2},{x:x+w-14,y:y+h},{x:x+15,y:y+h},{x,y:y+h/2}];g.fillStyle(fill,.94);g.fillPoints(p,true);g.lineStyle(2,edge);g.strokePoints(p,true);}
export class SoulTeamScene extends Phaser.Scene{
 constructor(){super('SoulTeam');}
 create(data={}){
  this.returnTo=data.returnTo||null;this.sys.settings.data={};this.t=0;this.slot=0;this.sel=0;this.picker=false;this.presetMode=null;this.menu=new MenuInput(this);this.bgFx=new ArcadeBg(this,0x367bd9,{second:0x82c5ff});playMusic(this,'bgm_title');
  const backdrop=this.add.graphics();for(let i=0;i<42;i++){backdrop.fillStyle(0x91d9ff,.07+i%3*.02);backdrop.fillCircle((i*97)%640,90+(i*37)%210,1+i%2);}slant(backdrop,-5,0,654,41,0x070b18,.9,12);
  tx(this,46,14,'SOUL TEAM',12).setColor('#66edac');makeButton(this,7,6,'<',()=>this.back(),{size:'12px',bg:'#195c43',depth:10});
  makeButton(this,229,9,'SAVED TEAMS',()=>this.openPresets('load'),{size:'6px',depth:10});makeButton(this,345,9,'SAVE TEAM',()=>this.openPresets('save'),{size:'6px',depth:10});makeButton(this,454,9,'AUTOPICK',()=>this.autopick(),{size:'6px',depth:10});addFullscreenButton(this,VIEW_W-8,6);
  this.g=this.add.graphics();this.power=tx(this,315,50,'0',20).setOrigin(.5,0);tx(this,315,76,'TEAM POWER',5).setOrigin(.5,0);this.stats=tx(this,484,55,'',5,140);
  this.slots=[{x:16,y:100,w:286,h:188,labels:tx(this,25,87,'MAIN SOUL',8),name:tx(this,27,270,'EMPTY',9,263),image:this.add.image(159,179,'soul_portraits',0),ability:tx(this,30,291,'',5,580)}];
  this.evolveButton=makeButton(this,18,55,'EVOLVE MAIN',()=>this.evolveMain(),{size:'6px',bg:'#8a662b',depth:10});
  this.potionButton=makeButton(this,168,83,'UPGRADE MAIN',()=>this.openPotions(),{size:'6px',pad:{x:8,y:5},bg:'#386b78',depth:10});
  this.level=tx(this,30,247,'',8);this.mainInfo=tx(this,30,304,'',5,445);
  for(let i=1;i<=3;i++){const y=101+(i-1)*63;this.slots.push({x:329,y,w:295,h:54,labels:tx(this,400,y+9,'AID '+i,7,205),name:tx(this,607,y+43,'',5,200).setOrigin(1,0),ability:tx(this,400,y+25,'',5,203),image:this.add.image(365,y+27,'soul_portraits',0)});}
  tx(this,342,87,'AID SOULS',8);this.slots.forEach((s,i)=>{s.zone=this.add.zone(s.x,s.y,s.w,s.h).setOrigin(0).setDepth(5).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.openPicker(i));});
  this.feedback=tx(this,16,324,'YOUR TEAM IS EQUIPPED FOR P1',5,460);this.fightButton=makeButton(this,490,310,'FIGHT',()=>this.fight(),{size:'14px',pad:{x:22,y:10},bg:'#cf9d29',hover:'#f0c64d',depth:10}).setFixedSize(134,36);
  // Selecting Main or an Aid opens the earned collection, leaving the overview uncluttered.
  this.modalG=this.add.graphics().setDepth(20);this.modalZone=this.add.zone(0,0,640,360).setOrigin(0).setDepth(20).setInteractive().on('pointerdown',()=>{});
  this.heading=tx(this,64,77,'CHOOSE A MAIN SOUL',8).setDepth(24);this.detail=tx(this,64,282,'',5,510).setDepth(24);
  this.clear=makeButton(this,431,74,'REMOVE',()=>this.remove(),{size:'6px',depth:25});this.closeButton=makeButton(this,550,74,'X',()=>this.closePicker(),{size:'7px',depth:25});
  this.pageLabel=tx(this,247,83,'',5).setDepth(24);this.pageButtons=[makeButton(this,310,74,'<',()=>this.page(-1),{size:'7px',depth:25}),makeButton(this,354,74,'>',()=>this.page(1),{size:'7px',depth:25})];
  this.cards=Array.from({length:6},(_,i)=>{const x=64+i%3*174,y=112+Math.floor(i/3)*82;const c={x,y,title:tx(this,x+7,y+6,'',6,145).setDepth(24),meta:tx(this,x+7,y+62,'',5,145).setDepth(24),image:this.add.image(x+79,y+39,'soul_portraits',0).setDepth(23)};c.zone=this.add.zone(x,y,158,75).setOrigin(0).setDepth(25).setInteractive({useHandCursor:true}).on('pointerover',()=>{const index=Math.floor(this.sel/6)*6+i;if(index>=this.optionCount())return;this.sel=index;this.refresh();}).on('pointerdown',()=>{const index=Math.floor(this.sel/6)*6+i;if(index>=this.optionCount())return;this.sel=index;this.confirmPicker();});return c;});
  this.q=this.input.keyboard.addKey('Q');this.e=this.input.keyboard.addKey('E');this.prev=()=>this.chooseSlot((this.slot+3)%4);this.next=()=>this.chooseSlot((this.slot+1)%4);this.q.on('down',this.prev);this.e.on('down',this.next);this.events.once('shutdown',()=>{this.q.off('down',this.prev);this.e.off('down',this.next);});
  this.fightKey=this.input.keyboard.addKey('F');this.onFight=()=>{if(!this.picker)this.fight();};this.fightKey.on('down',this.onFight);this.events.once('shutdown',()=>this.fightKey.off('down',this.onFight));
  hintBar(this,'ARROWS / Q/E SLOT   ENTER/A CHANGE   F/START FIGHT   ESC/B BACK',C);this.refresh();
 }
 page(delta){const pages=Math.ceil(this.choices.length/6),next=Math.max(0,Math.min(pages-1,Math.floor(this.sel/6)+delta));this.sel=next*6;this.refresh();}
 evolveMain(){const id=getSoulTeam().main,status=evolutionStatus(id);if(!status.eligible)return;this.scene.start('SoulEvolution',{id,returnTo:this.returnTo});}
 openPotions(){const id=getSoulTeam().main;if(!id){this.feedback.setText('EQUIP AN EARNED MAIN SOUL FIRST');return;}this.scene.start('SoulUpgrade',{id,returnTo:this.returnTo});}
 optionCount(){return this.presetMode?3:this.choices.length;}
 chooseSlot(i){this.slot=i;this.sel=0;this.presetMode=null;sfx('menu',.3);this.refresh();}
 openPicker(i){this.chooseSlot(i);const capacity=mainSoul(this.team)?.aidSlots||0;if(i>0&&i>capacity){this.feedback.setText('THIS AID SLOT IS LOCKED / CHOOSE A MAIN WITH MORE SLOTS');return;}this.picker=true;this.refresh();}
 closePicker(){this.picker=false;this.presetMode=null;this.refresh();}
 openPresets(mode){this.picker=true;this.presetMode=mode;this.sel=0;this.refresh();}
 refresh(){
  this.team=getSoulTeam();const main=mainSoul(this.team),capacity=main?.aidSlots||0,p=main&&soulPower(main.id);this.power.setText(p?p.power.toLocaleString():'0');this.stats.setText(p?'ATK +'+Math.round((p.damage-1)*100)+'%\nDMG TAKEN -'+Math.round((1-p.taken)*100)+'%':'NO MAIN EQUIPPED');
  this.choices=ownedSouls().filter(s=>s.kind===(this.slot===0?'main':'aid'));this.sel=Math.max(0,Math.min(this.sel,Math.max(0,this.optionCount()-1)));
  this.slots.forEach((s,i)=>{const open=i===0||i<=capacity,id=i===0?this.team.main:this.team.aids[i-1],soul=ownedSouls().find(s=>s.id===id);s.labels.setText(i===0?'MAIN SOUL':soul?.effect==='heal100'?'HEAL 10% AT 100%':'AID '+i+(open?'':' / LOCKED')).setColor(i===this.slot?'#ffe09d':'#b8d4ed');s.name.setText(soul?soul.name.toUpperCase():open?'EMPTY':main?'NO SLOT':'CHOOSE A MAIN');s.ability.setText(i===0?(main?main.description+' / '+capacity+' AID SLOT'+(capacity===1?'':'S'):'Win Soul Board battles to earn Main and Aid Souls.'):soul?soul.description:open?'TAP TO CHOOSE AN EARNED AID':'THIS MAIN HAS NO SLOT HERE');fit(s.image,soul,i===0?245:47,i===0?146:44);});
  const evolution=evolutionStatus(main?.id);this.evolveButton.setVisible(evolution.eligible);this.evolveButton.setText(evolution.ready?'EVOLVE MAIN':'EVOLVE AT LV. '+evolution.levelNeeded);
  this.level.setText(p?'LV. '+p.level:'NO MAIN');this.mainInfo.setText(p?'POWER '+p.power+' / MAX '+p.max+'   '+(p.nextLevel?'XP '+p.intoLevel+' / 100':'MAX LEVEL'):'CHOOSE A MAIN TO OPEN AID SLOTS');
  const selected=this.choices[this.sel],locked=this.slot>capacity&&this.slot>0;
  this.heading.setText(this.presetMode?(this.presetMode==='save'?'SAVE TEAM TO SLOT':'LOAD A SAVED TEAM'):this.slot===0?'CHOOSE A MAIN SOUL':'CHOOSE AN AID SOUL');
  this.detail.setText(locked?'THIS AID SLOT IS LOCKED.':selected?selected.name.toUpperCase()+' / '+difficultyName(selected.stars)+' / '+selected.stars+' STARS\n'+selected.description+(selected.kind==='main'?' / '+selected.aidSlots+' AID SLOTS':''):this.slot?'NO AID SOULS ADDED YET. EARN AIDS ON THE SOUL BOARD.':'WIN SOUL BOARD BATTLES TO EARN MAIN SOULS.');
  if(this.presetMode)this.detail.setText(this.presetMode==='save'?'Choose one of three slots to save the equipped team.':'Choose a saved team to equip it for P1.');
  const presets=savedSoulTeams(),start=Math.floor(this.sel/6)*6;this.cards.forEach((c,i)=>{const s=this.presetMode?mainSoul(presets[i]):this.choices[start+i],available=this.picker&&(this.presetMode?i<3:!!s);c.title.setText(this.presetMode?'TEAM '+(i+1):s?s.name.toUpperCase():'');c.meta.setText(this.presetMode?s?s.name.toUpperCase():'EMPTY':s?s.kind==='main'?'LV '+soulPower(s.id).level+' / PWR '+soulPower(s.id).power:(s.slotCost||1)+' SLOT AID':'');c.title.setVisible(available);c.meta.setVisible(available);fit(c.image,available?s:null,45,40);c.zone.setVisible(available);c.zone.input.enabled=available;});
  const paged=this.picker&&!this.presetMode&&this.choices.length>6;this.pageLabel.setText('PAGE '+(Math.floor(this.sel/6)+1)+'/'+Math.ceil(this.choices.length/6)).setVisible(paged);this.pageButtons.forEach(b=>b.setVisible(paged));
  [this.heading,this.detail,this.closeButton].forEach(o=>o.setVisible(this.picker));this.clear.setVisible(this.picker&&!this.presetMode);this.modalZone.setVisible(this.picker);this.modalZone.input.enabled=this.picker;this.draw();
 }
 draw(){const g=this.g;g.clear();slant(g,194,45,274,39,0x735b91,.9,12);this.slots.forEach((s,i)=>{if(i===0){g.fillStyle(0x09234a,.7);g.fillRect(s.x,s.y,s.w,s.h);g.lineStyle(i===this.slot?3:2,i===this.slot?GOLD:0xb5cbe2);g.strokeRect(s.x,s.y,s.w,s.h);g.fillStyle(0x050a16,.85);g.fillRect(s.x+2,s.y+s.h-28,s.w-4,26);slant(g,23,241,96,20,0x785a97,.9,6);const main=mainSoul(this.team);if(main)drawSoulStars(g,228,270,main.stars,{scale:.7,spacing:12,shadow:0x60417d});}else hex(g,s.x,s.y,s.w,s.h,0x0c1f3d,i===this.slot?GOLD:0xb5cbe2);});
  this.modalG.clear();if(!this.picker)return;const m=this.modalG;m.fillStyle(0x030713,.88);m.fillRect(0,0,640,360);m.fillStyle(0x111c36);m.fillRect(48,65,544,260);m.lineStyle(2,C);m.strokeRect(48,65,544,260);this.cards.forEach((c,i)=>{if(!c.zone.visible)return;m.fillStyle(i===this.sel%6?0x394b73:0x1c2c48);m.fillRect(c.x,c.y,158,75);m.lineStyle(i===this.sel%6?2:1,i===this.sel%6?GOLD:0x5a7196);m.strokeRect(c.x,c.y,158,75);});}
 equip(){const capacity=mainSoul(getSoulTeam())?.aidSlots||0;if(this.slot>0&&this.slot>capacity)return;const s=this.choices[this.sel];if(!s)return;if(this.slot===0)setMainSoul(s.id);else setAidSoul(this.slot-1,s.id);sfx('select',.5);this.picker=false;this.feedback.setText('EQUIPPED / YOUR TEAM WILL BE USED BY P1 IN BATTLE');this.refresh();}
 remove(){if(this.slot===0)setMainSoul(null);else setAidSoul(this.slot-1,null);this.closePicker();}
 confirmPicker(){if(!this.presetMode)return this.equip();if(this.presetMode==='save'){const saved=saveSoulPreset(this.sel);this.feedback.setText(saved?'TEAM '+(this.sel+1)+' SAVED':'TEAM COULD NOT BE SAVED');}else{if(!loadSoulPreset(this.sel)){this.detail.setText('THIS SAVED TEAM SLOT IS EMPTY.');return;}this.feedback.setText('TEAM '+(this.sel+1)+' EQUIPPED FOR P1');}this.closePicker();}
 autopick(){const souls=ownedSouls(),mains=souls.filter(s=>s.kind==='main').sort((a,b)=>soulPower(b.id).power-soulPower(a.id).power),main=mains[0];if(!main){this.feedback.setText('EARN A MAIN SOUL ON THE SOUL BOARD FIRST');return;}saveSoulTeam({main:main.id,aids:souls.filter(s=>s.kind==='aid').slice(0,main.aidSlots).map(s=>s.id)});this.feedback.setText('AUTOPICK EQUIPPED YOUR STRONGEST MAIN AND AVAILABLE AIDS');this.refresh();}
 fight(){if(this.returnTo)return this.scene.start('SoulBattle',{...this.returnTo,autoFight:true});this.scene.start('Setup');}
 back(){if(this.picker)return this.closePicker();if(this.returnTo)return this.scene.start('SoulBattle',this.returnTo);this.scene.start('SoulBoard');}
 update(){this.t++;this.bgFx.update(this.t);const m=this.menu.poll();if(m.back||m.pads.some(p=>p.button==='b'))return this.back();if(m.pads.some(p=>p.button==='lb'))this.prev();if(m.pads.some(p=>p.button==='rb'))this.next();if(m.pads.some(p=>p.button==='y'))this.autopick();if(m.pads.some(p=>p.button==='start'))return this.fight();if(this.picker){let n=this.sel;if(m.left)n--;if(m.right)n++;if(m.up)n-=3;if(m.down)n+=3;n=Math.max(0,Math.min(Math.max(0,this.optionCount()-1),n));if(n!==this.sel){this.sel=n;this.refresh();}if(m.ok||m.pads.some(p=>p.button==='a'))this.confirmPicker();}else{let n=this.slot;if(m.left)n=0;if(m.right)n=Math.max(1,n);if(m.up)n=Math.max(0,n-1);if(m.down)n=Math.min(3,n+1);if(n!==this.slot)this.chooseSlot(n);if(m.ok||m.pads.some(p=>p.button==='a'))this.openPicker(this.slot);}}
}
