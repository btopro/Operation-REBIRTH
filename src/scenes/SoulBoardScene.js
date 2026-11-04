import {resolveSoul} from '../souls/evolution.js';
import {drawSoulStars} from '../ui/soulStars.js';
import {portraitTexture} from '../souls/progression.js';
import {ownsSoul} from '../souls/collection.js';
import {soulEncounter} from '../souls/encounters.js';
import {getSoulTeam,mainSoul} from '../souls/team.js';
import {VIEW_W,FONT} from '../config.js';
import {MenuInput} from './menuInput.js';
import {playMusic} from '../audio/music.js';
import {sfx} from '../audio/sfx.js';
import {makeButton} from '../ui/button.js';
import {addFullscreenButton} from '../ui/fullscreen.js';
import {hintBar,slant} from '../ui/arcade.js';
import {getSoulBoard,cycleTime,SOUL_ROLES,difficultyName} from '../souls/board.js';

const C=0x40d589,GOLD=0xffd63d;
const GRID={x:16,y:53,w:143,h:122,gap:12};
function text(scene,x,y,value,size=6,color='#29251f',width){return scene.add.text(x,y,value,{fontFamily:FONT,fontSize:size+'px',color,lineSpacing:3,...(width?{wordWrap:{width}}:{})});}
export class SoulBoardScene extends Phaser.Scene{
 constructor(){super('SoulBoard');}
 create(){
  this.t=0;this.sel=0;this.menu=new MenuInput(this);this.board=getSoulBoard();this.lastSecond=-1;playMusic(this,'bgm_title');
  // A parchment target list with framed portrait cards, like the supplied board reference.
  const paper=this.add.graphics();paper.fillStyle(0xe7dfc8);paper.fillRect(0,0,640,360);
  for(let i=0;i<450;i++){paper.fillStyle(i%2?0xffffff:0x8b7957,.055);paper.fillRect((i*97)%640,43+(i*53)%270,2+i%5,1+i%3);}
  slant(paper,-12,0,665,45,0x101916,1,17);slant(paper,-4,0,46,45,0x136d43,1,10);slant(paper,548,352,110,8,C,1,8);
  this.boardLabel=text(this,53,13,'SOUL BOARD > TARGET LIST',11,'#68f2a7');
  makeButton(this,5,8,'<',()=>this.back(),{size:'12px',bg:'#136d43',depth:10});addFullscreenButton(this,VIEW_W-8,6);
  this.teamButton=makeButton(this,476,8,'TEAM SELECT',()=>this.scene.start('SoulTeam'),{size:'7px',bg:'#233d31',depth:10});
  const team=mainSoul(getSoulTeam());this.teamLabel=text(this,55,32,team?'MAIN: '+team.name.toUpperCase()+' / '+team.aidSlots+' AID SLOTS':'EARN SOULS TO BUILD YOUR TEAM',5,'#bcd4c3');
  this.timer=text(this,459,12,'',6,'#fff0b5').setOrigin(1,0);this.count=text(this,459,30,'',5,'#bcd4c3').setOrigin(1,0);
  this.teamKey=this.input.keyboard.addKey('T');this.openTeam=()=>this.scene.start('SoulTeam');this.teamKey.on('down',this.openTeam);this.events.once('shutdown',()=>this.teamKey.off('down',this.openTeam));
  this.g=this.add.graphics();this.cards=Array.from({length:8},(_,i)=>{
   const x=GRID.x+(i%4)*(GRID.w+GRID.gap),y=GRID.y+Math.floor(i/4)*(GRID.h+GRID.gap);
   const c={x,y,rating:text(this,x+45,y+8,'',6),role:text(this,x+12,y+29,'',5,'#ffffff'),title:text(this,x+GRID.w/2,y+108,'',6,'#ffffff',GRID.w-14).setOrigin(.5,0),portrait:this.add.image(x+GRID.w/2,y+62,'soul_portraits',0).setVisible(false),timer:text(this,x+GRID.w-9,y+91,'',6,'#ffe231').setOrigin(1,0)};
   c.portrait.setDepth(1);c.role.setDepth(2);c.timer.setDepth(3);this.add.zone(x,y,GRID.w,GRID.h).setOrigin(0).setDepth(5).setInteractive({useHandCursor:true}).on('pointerover',()=>this.select(i)).on('pointerdown',()=>{this.select(i);this.challenge();});return c;
  });
  this.detailTitle=text(this,16,320,'',7,'#f8f3df');this.detailStats=text(this,208,321,'',5,'#ffe296');this.notice=text(this,393,321,'',5,'#b7e9ca');this.detailBody=text(this,16,334,'',5,'#d9d9cc',480);
  this.fightButton=makeButton(this,515,320,'OPEN FIGHT',()=>this.challenge(),{size:'6px',bg:'#375e3d',depth:10});
  hintBar(this,'ARROWS SELECT   TAP / ENTER OPEN   T TEAM SELECT   ESC / B BACK',C);this.refresh();
 }
 select(i){if(this.sel===i)return;this.sel=i;sfx('menu',.25);this.refresh();}
 refresh(){
  this.visibleSouls=this.board.souls.map(resolveSoul);this.count.setText(this.visibleSouls.length+' / '+this.board.total+' TARGETS');
  this.cards.forEach((c,i)=>{const s=this.visibleSouls[i];c.title.setText(s?s.name.toUpperCase():'EMPTY SLOT');c.rating.setText(s?difficultyName(s.difficultyStars||s.stars):'AWAITING');c.role.setText(s?SOUL_ROLES[s.kind].label:'');c.portrait.setVisible(!!s&&Number.isInteger(s.portrait));if(s&&Number.isInteger(s.portrait)){c.portrait.setTexture(portraitTexture(s),s.portrait);c.portrait.setScale(Math.min((GRID.w-18)/c.portrait.frame.realWidth,78/c.portrait.frame.realHeight));}});
  const s=this.visibleSouls[this.sel];this.detailTitle.setText(s?s.name.toUpperCase():'EMPTY SLOT');this.detailStats.setText(s?SOUL_ROLES[s.kind].label+' / '+difficultyName(s.difficultyStars||s.stars)+' / '+s.stars+' STARS':'AWAITING A NEW SOUL');
  this.detailBody.setText(s?s.description+(s.kind==='main'?' / '+s.aidSlots+' AID SLOTS':''):'New souls will appear here as they are added.');this.notice.setText(s?(ownsSoul(s.id)?'REPLAY / COINS + XP':'WIN TO EARN'):'');
  this.fightButton.setVisible(!!s&&!!soulEncounter(s.id));this.updateTimers();this.drawBoard();
 }
 updateTimers(now=Date.now()){
  const time=cycleTime(this.board.nextCycleAt,now);this.timer.setText('NEXT '+time);this.cards.forEach((c,i)=>{const s=this.visibleSouls[i];c.timer.setText(s?(ownsSoul(s.id)?'EARNED':time):'');c.timer.setColor(s&&ownsSoul(s.id)?'#9bffb8':'#ffe231');});
 }
 drawBoard(){
  const g=this.g;g.clear();g.fillStyle(0x17221c);g.fillRect(0,315,640,33);
  this.cards.forEach((c,i)=>{const s=this.visibleSouls[i],on=i===this.sel,earned=s&&ownsSoul(s.id),edge=s?.kind==='aid'?0x55613b:0x523a29;
   g.fillStyle(0x473b2a,.18);g.fillRect(c.x+3,c.y+3,GRID.w,GRID.h);
   g.fillStyle(s?0xfffbec:0xd3ccba);g.fillRect(c.x,c.y,GRID.w,GRID.h);g.lineStyle(on?4:2,on?GOLD:edge);g.strokeRect(c.x,c.y,GRID.w,GRID.h);
   g.lineStyle(1,s?0x453b2c:0xa39a85);g.lineBetween(c.x+5,c.y+4,c.x+GRID.w-5,c.y+4);g.lineBetween(c.x+5,c.y+19,c.x+GRID.w-5,c.y+19);
   if(s)drawSoulStars(g,c.x+5,c.y+6,s.stars,{scale:.45,spacing:7,color:0xd79d28,shadow:0x493627});
   g.fillStyle(s?(s.kind==='aid'?0x273b40:0x282238):0xc4bcaa);g.fillRect(c.x+6,c.y+23,GRID.w-12,78);
   if(s){slant(g,c.x+6,c.y+23,GRID.w-12,78,s.kind==='aid'?0x65b9ab:0x9375bc,.2,28);g.fillStyle(0x070a0a,.9);g.fillRoundedRect(c.x+8,c.y+27,28,12,3);g.fillRect(c.x+GRID.w-62,c.y+87,56,14);}
   else{g.lineStyle(1,0x998f79,.6);g.strokeCircle(c.x+GRID.w/2,c.y+61,16);g.fillStyle(0x998f79,.5);g.fillRect(c.x+GRID.w/2-2,c.y+53,4,16);g.fillRect(c.x+GRID.w/2-8,c.y+59,16,4);}
   g.fillStyle(s?edge:0x96917e);g.fillRect(c.x+1,c.y+102,GRID.w-2,GRID.h-103);
   if(earned){g.lineStyle(2,0x159538);g.beginPath();g.moveTo(c.x+GRID.w-16,c.y+9);g.lineTo(c.x+GRID.w-12,c.y+13);g.lineTo(c.x+GRID.w-5,c.y+5);g.strokePath();}
  });
 }
 challenge(){const s=this.visibleSouls[this.sel];if(s&&soulEncounter(s.id))this.scene.start('SoulBattle',{soulId:s.id});}
 back(){sfx('menu',.6);this.scene.start('Trinkets');}
 update(){
  this.t++;const m=this.menu.poll();if(m.back||m.pads.some(p=>p.button==='b'))return this.back();if(m.ok||m.pads.some(p=>p.button==='a'))return this.challenge();
  let next=this.sel;if(m.left)next=Math.max(0,next-1);if(m.right)next=Math.min(7,next+1);if(m.up)next=Math.max(0,next-4);if(m.down)next=Math.min(7,next+4);if(next!==this.sel)this.select(next);
  const now=Date.now(),second=Math.floor(now/1000);if(second!==this.lastSecond){this.lastSecond=second;if(now>=this.board.nextCycleAt){this.board=getSoulBoard(now);this.sel=0;this.refresh();}this.updateTimers(now);}
 }
}
