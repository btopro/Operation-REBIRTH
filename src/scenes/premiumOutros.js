import {youngLinkClip} from '../fighters/youngLinkAnimation.js';
import {bone,redHeart,judgmentEye} from '../fighters/judgmentFx.js';
import {pixel,line,crystal} from '../fighters/themePixels.js';
import {premiumAnimationFor} from '../fighters/premiumAnimations.js';
import {skinSheets} from '../fighters/skins.js';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
const cut=(fn,len,card,name,sub,text,color,shots)=>({fn,len,card,name,sub,line:text,color,stroke:'#130c18',cinematic:true,shots});
export const PREMIUM_CUTS={
 'soul-summoner:JUDGMENT':{...cut('judgment_hall',600,500,'','','','#ff9cac',[[0,'hall'],[80,'eye'],[150,'heart'],[260,'swarm'],[360,'fade'],[470,'silence']]),minimalCard:true,rivalLine:' had a bad time.'},
 'soul-summoner:ORRERY':{...cut('orrery_twelve',690,540,'','','','#e9d49b',[[0,'count']]),minimalCard:true,rivalLine:' was lost to time.'},
 'hero-knight:PRISM REGENT':{...cut('prism_ascent',690,455,'','','shine bright, today was a good fight','#d8f6ff',[[0,'gather'],[105,'orbit'],[220,'rise'],[350,'radiance'],[455,'blessing'],[580,'white']]),minimalCard:true,fadeWhiteFrom:580,fadeWhiteDuration:85},
 'mr-wake:ABYSSAL CHOIR':{...cut('choir_cathedral',540,425,'','','','#b8f5e6',[[0,'painting'],[90,'charge'],[215,'slam'],[252,'fall'],[290,'impact'],[360,'stillness']]),minimalCard:true,rivalLine:' met the final bell.'},
 'hero-knight:OBSIDIAN':cut('obsidian_volcano',720,555,'OBSIDIAN','ASHES OF THE FALLEN','Burn like the rest of them.','#ffc37a',[[0,'duel'],[130,'clash'],[220,'windup'],[310,'swing'],[370,'launch'],[465,'crater'],[545,'embers']]),
};
function ring(g,x,y,r,c,a=1){for(let i=0;i<144;i++){const q=i*Math.PI/72;pixel(g,x+Math.cos(q)*r,y+Math.sin(q)*r,2,2,c,a);}}
function cog(g,x,y,r,t){ring(g,x,y,r,0x8c7041,.6);ring(g,x,y,r-3,0x343738,.9);for(let i=0;i<12;i++){const q=t+i*Math.PI/6;line(g,x+Math.cos(q)*(r-4),y+Math.sin(q)*(r-4),x+Math.cos(q)*(r+3),y+Math.sin(q)*(r+3),0xc0a262,2,.7);}for(let i=0;i<4;i++){const q=t+i*Math.PI/2;line(g,x,y,x+Math.cos(q)*(r-5),y+Math.sin(q)*(r-5),0x66583d,2);}}
function chamber(g,t){
 for(let i=0;i<6;i++)pixel(g,-220,-130+i*90,1100,90,[0x050f19,0x0a1922,0x142a30,0x1b3438,0x14272d,0x0b1821][i]);
 for(let i=0;i<8;i++){const x=-170+i*145;pixel(g,x,10,20,290,0x101e27);pixel(g,x+3,10,3,290,0x62705a,.45);pixel(g,x-5,4,30,6,0x9e8e5c);}
 for(const [x,y,r]of [[90,95,47],[555,80,56],[80,245,30],[585,255,41]])cog(g,x,y,r,t*(x<300?.003:-.002));
 pixel(g,-220,301,1100,250,0x101c25);for(let i=0;i<5;i++){pixel(g,40-i*50,301+i*12,560+i*100,4,0x5d6251,.7);}
 for(let i=0;i<28;i++)pixel(g,(i*83+t*.13)%940-160,(i*41+t*.11)%320,1,2,0xe1c58a,.35);
}
const DIGITS=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001001001001','111101111101111','111101111001111'];
function digits(g,n,x,y,sc=1,c=0xe6e6b7){const str=String(n),w=(str.length*4-1)*sc;for(let j=0;j<str.length;j++)for(let q=0;q<15;q++)if(DIGITS[Number(str[j])][q]==='1')pixel(g,x-w/2+j*4*sc+q%3*sc,y+Math.floor(q/3)*sc,sc,sc,c);}
function clock(g,t,count){
 const x=320,y=151,r=111;ring(g,x,y,r+8,0x312c24);ring(g,x,y,r+5,0xc4a969);ring(g,x,y,r,0xead79b);ring(g,x,y,r-7,0x617e74);
 g.fillStyle(0x071921);g.fillCircle(x,y,r-9);ring(g,x,y,r-13,0x375f5f);
 for(let i=0;i<60;i++){const q=i*Math.PI/30-Math.PI/2,l=i%5===0?12:4;line(g,x+Math.cos(q)*(r-18),y+Math.sin(q)*(r-18),x+Math.cos(q)*(r-18-l),y+Math.sin(q)*(r-18-l),i%5===0?0xf0dda5:0x7a927f,i%5===0?2:1);}
 for(let i=1;i<=12;i++){const q=i*Math.PI/6-Math.PI/2;digits(g,i,x+Math.cos(q)*76,y+Math.sin(q)*76-3,1,0xd5d1a2);}
 cog(g,x-24,y+32,21,t*.008);cog(g,x+22,y+36,16,-t*.009);
 const ang=count*Math.PI/6-Math.PI/2;
 line(g,x,y,x,y-41,0xd0b77a,4);
 line(g,x,y,x+Math.cos(ang)*82,y+Math.sin(ang)*82,0xd3fff0,2);pixel(g,x-3,y-3,7,7,0xffedb2);
 pixel(g,x-19,y+57,38,21,0x132d32);digits(g,count,x,y+61,2,0xd8ffe9);
 // The pendulum swings once between each of the twelve ticks.
 const swing=Math.sin(t*Math.PI/45)*.22,px=x+Math.sin(swing)*95,py=263+Math.cos(swing)*47;
 line(g,x,253,px,py,0xb39a62,2);ring(g,px,py,9,0xe8ce88);pixel(g,px-3,py-3,6,6,0x8cd9c1);
}
function volcano(g,t){
 const cols=[0x100e21,0x23162a,0x412133,0x713135,0xa54532];cols.forEach((c,i)=>pixel(g,-220,-100+i*90,1100,90,c));
 for(let i=0;i<10;i++){const x=-160+i*103;g.fillStyle(0x271b2b);g.fillTriangle(x-130,330,x,104+i%3*30,x+170,330);}
 // The fighters are on the enormous cone's rim, above multiple rivers of lava.
 g.fillStyle(0x2a202b);g.fillTriangle(-250,650,514,214,1010,650);
 g.fillStyle(0x493033);g.fillTriangle(-120,620,488,237,480,620);g.fillStyle(0x1b1926);g.fillTriangle(535,242,980,650,570,650);
 for(let j=0;j<6;j++){const xx=340+j*55;for(let row=0;row<38;row++){const y=300+row*7,x=xx+Math.sin(row*.3+j)*13+(row-3)*(j-2)*.7;pixel(g,x,y,5+row*.2,8,row%5===0?0xffc260:0xd75c31,.85);}}
 for(let i=0;i<8;i++){const x=460+Math.sin(i*8+t*.002)*45,y=90-i*21+Math.sin(t*.01+i)*4;g.fillStyle(i%2?0x322736:0x45303c,.7);g.fillEllipse(x,y,110+i*12,28+i*3);}
 g.fillStyle(0x150f1c);g.fillEllipse(515,295,266,66);g.fillStyle(0xb63f26);g.fillEllipse(515,302,228,45);g.fillStyle(0xf38b3f);g.fillEllipse(515,307,192,27);
 for(let x=407;x<624;x+=8)pixel(g,x,303+Math.sin(x*.08+t*.045)*5,8,3,0xffd06d,.8);
 pixel(g,-80,280,480,12,0x382a30);pixel(g,-80,280,480,3,0x886157);for(let x=-70;x<400;x+=28){pixel(g,x,287,20,3,0x1b1722);}
 for(let i=0;i<48;i++){const x=(i*79+t*(i%3-.8))%1000-150,y=380-(i*53+t*(.3+i%4*.12))%520;pixel(g,x,y,2,3,i%3?0xf89b48:0xffdb88,.65);}
}
// This near wall is present in every shot. Its upper edge follows the crater ellipse.
function craterForeground(g,t){
 const edge=[];for(let i=0;i<=48;i++){const x=382+i*266/48,u=(x-515)/133;edge.push({x,y:295+33*Math.sqrt(Math.max(0,1-u*u))});}
 g.fillStyle(0x2a202b);g.fillPoints([...edge,{x:1010,y:650},{x:-250,y:650}],true);
 for(let i=0;i<edge.length-1;i++)line(g,edge[i].x,edge[i].y,edge[i+1].x,edge[i+1].y,0x86514a,3);
 for(let j=0;j<6;j++)for(let row=0;row<38;row++){const y=332+row*7,x=340+j*55+Math.sin((row+4)*.3+j)*13+(row+1)*(j-2)*.7;pixel(g,x,y,4+row*.2,7,row%5===0?0xffb75b:0xc65832,.8);}
 for(let i=0;i<12;i++)pixel(g,421+i*17,319+Math.sin(i*3+t*.035)*2,2,1,0xffd176,.55);
}
export class PremiumShots{
 judgmentCamera(...args){const visible=this.losers.map(l=>l.s.visible);this.cineCamera(...args);this.losers.forEach((l,i)=>l.s.setVisible(visible[i]));}
 judgmentHall(t){
  [0x090c19,0x12172a,0x20243a,0x302d40,0x211e31,0x121827].forEach((c,i)=>pixel(this.bg,-220,-100+i*90,1100,90,c));
  for(let i=0;i<9;i++){const x=-180+i*130;pixel(this.bg,x,48,18,255,0x675e55);pixel(this.bg,x+3,50,5,249,0xd2c594);pixel(this.bg,x-6,39,30,10,0xaa956d);pixel(this.bg,x-7,294,32,9,0x75694f);line(this.bg,x+9,39,x+65,-16,0xb29b74,4);line(this.bg,x+65,-16,x+139,39,0xb29b74,4);}
  pixel(this.mid,-220,303,1100,180,0x11182a);for(let i=0;i<6;i++)line(this.mid,-220,303+i*15,880,303+i*15,0x5c6371,1,.35);for(let i=-3;i<13;i++)line(this.mid,320+i*70,303,320+i*135,470,0x5c6371,1,.4);
  for(let i=0;i<26;i++)pixel(this.fx,(i*83+t*.12)%940-140,320-(i*37+t*.16)%360,1,1,0xb5d5e2,.3);
 }
 judgmentRival(t,fade=0){
  this.premiumRival(t,456,300,3);const rival=this.losers[0];if(!rival)return [456,205];rival.s.setAlpha(1-fade).setVisible(fade<1);
  return [rival.s.x,rival.s.y-(rival.def.body?.h||48)*rival.s.scaleY*.64];
 }
 judgmentSwarm(t,p,cx,cy,alpha=1,scatter=0){
  for(let i=0;i<28;i++){
   const a=i*Math.PI*2/28,local=ease((p-i*.008)/.73),side=i%4;
   const start=side===0?[-90,45+i*11]:side===1?[740,340-i*7]:side===2?[70+i*19,-90]:[620-i*17,430];
   const tx=cx+Math.cos(a)*(18+i%3*8+scatter*65),ty=cy+Math.sin(a)*(20+i%4*10+scatter*55);
   const x=start[0]*(1-local)+tx*local+Math.sin(a+t*.045)*(1-local)*12,y=start[1]*(1-local)+ty*local;
   bone(this.front,x,y,14+i%4*5,i%2===0,i%5===0?0x9fe8ff:0xffffff,alpha);
  }
 }
 shot_judgment_hall_hall(t,k,s){this.judgmentHall(t);this.idle(160,300,3,t);this.judgmentRival(t);this.judgmentCamera('wide view through the last corridor',.84,320,180);this.cineAction={phase:'hall'};}
 shot_judgment_hall_eye(t,k,s){this.judgmentHall(t);this.idle(160,300,3,t);this.judgmentCamera('close-up on the cyan judgment eye',1.8,160,166);const eye=judgmentEye(this.hero);if(eye){pixel(this.front,eye[0]-5,eye[1]-3,10,6,0x4eeeff,.65);line(this.front,eye[0]-10,eye[1],eye[0]+28,eye[1],0xa2f8ff,1,.7);}this.cineCue('judgment-eye','glass',.3,1.2);this.cineAction={phase:'eye',eyeTracked:!!eye};}
 shot_judgment_hall_heart(t,k,s){
  this.judgmentHall(t);this.idle(160,300,3,t);const chest=this.judgmentRival(t),p=ease(k),heart=[chest[0]-26*p,chest[1]-55*p];
  this.judgmentCamera('red soul emerges from the actual opponent chest',.94,350,202);redHeart(this.front,...heart,.8+1.7*Math.min(1,p*3),1);
  if(p>.1)this.cineCue('judgment-red-soul','ding',.32,.75);this.cineAction={phase:'heart',heartColor:'red',chest,heart,extraction:p};
 }
 shot_judgment_hall_swarm(t,k,s){
  this.judgmentHall(t);this.move('charge',Math.min(23,Math.floor(s/4)),160,300,3);const chest=this.judgmentRival(t),heart=[chest[0]-26,chest[1]-55];
  this.judgmentCamera('a swarm of bones rushes toward the red soul',.94,350,202);this.judgmentSwarm(t,k,...heart);redHeart(this.front,...heart,2.5);
  this.cineCue('judgment-bone-swarm','whoosh',.4,.65);this.cineAction={phase:'swarm',heartColor:'red',heart,bones:28,swarm:k};
 }
 shot_judgment_hall_fade(t,k,s){
  this.judgmentHall(t);this.idle(160,300,3,t);const p=ease(k),chest=this.judgmentRival(t,p),heart=[chest[0]-26,chest[1]-55];
  this.judgmentCamera('opponent, red heart and bones dissolve into silence',.94,350,202);this.judgmentSwarm(t,1,...heart,1-p,p);redHeart(this.front,...heart,2.5,1-p);
  for(let i=0;i<24;i++)pixel(this.front,heart[0]+Math.sin(i*9)*p*80,heart[1]+Math.cos(i*3)*p*50-p*20,1,2,i%4?0xf0f5ff:0xff6980,p*(1-p));
  this.cineAction={phase:'fade',heartColor:'red',heartAlpha:1-p,boneAlpha:1-p,rivalAlpha:1-p,rivalGone:p>.98};
 }
 shot_judgment_hall_silence(t,k,s){this.judgmentHall(t);this.idle(160,300,3,t);this.losers.forEach(l=>l.s.setVisible(false));this.judgmentCamera('empty corridor after the last bones fade',.95-.1*ease(k),320,180);this.cineAction={phase:'silence',rivalGone:true,heartAlpha:0,boneAlpha:0};}
 premiumRival(t,x,y,scale=3,action='idle',progress=0,rotation=0){
  const l=this.losers[0];if(!l?.def)return;
  const d=l.def,skin=this.data0.results[1]?.skin||0,S=skinSheets(this,d,skin),A=action==='attack'&&d.moveAnims?.ftilt;
  const key=A&&S.moves?S.moves:S.idle,n=d.frameCounts?.idle||Math.max(1,this.textures.get(S.idle).frameTotal-1),frame=A&&S.moves?(d.id==='young-link'?youngLinkClip('ftilt',t%A[1]):A[0]+Math.floor(t/3)%A[1]):Math.floor(t/7)%n;
  const origin=A&&S.moves?d.movesOrigin:[d.originX??.5,d.originY],flip=!d.facesLeft;
  const sp=l.s;sp.setTexture(key,frame).setCrop().setOrigin(flip?1-origin[0]:origin[0],origin[1]).setPosition(x,y).setScale(scale).setFlipX(flip).setRotation(rotation).setAlpha(1-progress).clearTint().setTintMode(Phaser.TintModes.MULTIPLY).setVisible(progress<1);
  if(progress>0)sp.setCrop(0,0,Math.max(1,sp.frame.realWidth*(1-progress)),sp.frame.realHeight);
 }
 shot_orrery_twelve_count(t,k,s){
  const count=Math.min(12,Math.floor(t/45));chamber(this.bg,t);clock(this.mid,t,count);
  this.cineCamera('continuous push into the clock counting to twelve',.8+.48*ease(t/540),320,158);this.cineHide();
  if(count>0)this.cineCue('orrery-twelve-'+count,'clocktick',.36,count%2?.84:1);
  if(count===12)this.cineCue('orrery-twelve-end','ding',.24,.55);
  this.cineAction={count,clockAngle:count*Math.PI/6,captionReady:count===12,objectOnly:true};
 }
 prismCourt(t,lift=0,glow=0,gather=1){
  const cols=[0x11172f,0x202f4e,0x3d5272,0x5b7793,0x405878,0x203653];cols.forEach((c,i)=>pixel(this.bg,-220,-100+i*90,1100,90,c));
  for(let i=0;i<7;i++){const x=-90+i*130;pixel(this.bg,x,40,15,290,0x253b5a);line(this.bg,x+2,40,x+2,300,0xa7c5db,2,.5);line(this.bg,x+7,45,x+65,-38,0x758eae,3);line(this.bg,x+65,-38,x+130,45,0x758eae,3);}
  pixel(this.bg,-220,300,1100,190,0x1d304d);for(let i=0;i<5;i++){pixel(this.mid,258-i*12,300+i*7,124+i*24,3,0x718ea9);}
  const cx=320,cy=219-lift;this.idle(cx,300-lift,3,t);
  for(let r=0;r<7;r++){this.mid.fillStyle(0xd5ffff,glow*.025*(7-r));this.mid.fillEllipse(cx,cy,55+r*13,95+r*12);}
  for(let i=0;i<8;i++){
   const a=t*.025+i*Math.PI/4,ex=cx+Math.cos(a)*85,ey=cy+Math.sin(a)*47,x=(145+i*49)*(1-gather)+ex*gather,y=(293-i%2*5)*(1-gather)+ey*gather;
   const layer=Math.sin(a)<0?this.mid:this.front,c=[0x92dce3,0xc4b5ed,0xcfe8fa][i%3];crystal(layer,x,y,8+i%3,c,0xf3ffff);
   line(layer,x,y+10,x-Math.sin(a)*9,y+25,c,1,.28*gather);
  }
  if(glow>0){for(let i=0;i<16;i++){const a=i*Math.PI/8+t*.003;line(this.fx,cx+Math.cos(a)*40,cy+Math.sin(a)*60,cx+Math.cos(a)*(58+glow*25),cy+Math.sin(a)*(78+glow*25),i%2?0xe3f8ff:0xfff7d3,1,glow*.45);}this.hero.setTint(0xe8ffff);}
  for(let i=0;i<28;i++)pixel(this.fx,(i*79+t*.13)%840-100,330-(i*43+t*.3)%390,1,2,0xe2f6ff,.3+glow*.2);
  this.cineAction={phase:'crystal-court',rise:lift,glow,crystals:8,gather};
 }
 shot_prism_ascent_gather(t,k,s){this.prismCourt(t,0,0,ease(k));this.cineCamera('wide crystal court: shards wake and float',.85,320,194);this.cineAction.phase='gather';if(s>25)this.cineCue('prism-awaken','glass',.27,.8);}
 shot_prism_ascent_orbit(t,k,s){this.prismCourt(t,0,.08,1);this.cineCamera('close orbit around the crowned knight',1.12,320,210);this.cineAction.phase='orbit';}
 shot_prism_ascent_rise(t,k,s){const lift=ease(k)*68;this.prismCourt(t,lift,.1+ease(k)*.4,1);this.cineCamera('follow Lacy and her crystals levitating',1.02,320,207-lift*.65);this.cineAction.phase='levitate';this.cineCue('prism-lift','whoosh',.28,.65);}
 shot_prism_ascent_radiance(t,k,s){this.prismCourt(t,68+Math.sin(t*.04)*2,.5+ease(k)*.5,1);this.cineCamera('radiant crystal halo in the air',1.12,320,166);this.cineAction.phase='glow';}
 shot_prism_ascent_blessing(t,k,s){this.prismCourt(t,68+Math.sin(t*.04)*2,1,1);this.cineCamera('hold the luminous knight and her blessing',1.06,320,165);this.cineAction.phase='quote';}
 shot_prism_ascent_white(t,k,s){this.prismCourt(t,68+ease(k)*12,1,1);this.cineCamera('radiance dissolves the court into white',1.06+.06*ease(k),320,165);this.cineAction.phase='white';}
 choirRuins(t){
  [0x030f1c,0x071e2e,0x103347,0x164650,0x0a293b,0x051b2c].forEach((c,i)=>pixel(this.bg,-220,-100+i*90,1100,90,c));
  for(let i=0;i<8;i++){const x=-130+i*122;pixel(this.bg,x,45,18,310,0x071c2d);pixel(this.bg,x+3,48,2,255,0x4b7777,.4);line(this.bg,x+8,48,x+60,-25,0x315460,4);line(this.bg,x+60,-25,x+122,48,0x315460,4);}
  for(const wx of [80,385]){this.bg.fillStyle(0x1c4c56);this.bg.fillEllipse(wx,127,48,100);for(let j=0;j<4;j++){pixel(this.bg,wx-15+j*9,99,4,73,0x6ba49a,.4);line(this.bg,wx-20,135+j*11,wx+20,135+j*11,0x192d36,2);}}
  // A drowned nave: broken steps, dark doorway, algae and moving bands of caustic light.
  this.bg.fillStyle(0x020e1b);this.bg.fillEllipse(531,182,86,145);pixel(this.bg,488,182,86,120,0x020e1b);
  pixel(this.mid,-220,300,1100,130,0x0b2637);for(let i=0;i<4;i++)pixel(this.mid,330+i*16,300+i*9,260,3,0x436e72,.6);
  for(let i=0;i<14;i++){const x=-160+i*68+Math.sin(t*.013+i)*16;line(this.fx,x,304+i%3*7,x+43,304+i%3*7,0x78c7ba,1,.3);}
  for(let i=0;i<38;i++){const x=(i*79+Math.sin(t*.012+i)*9)%840-100,y=350-(i*51+t*.35)%450;pixel(this.fx,x,y,1+i%2,2,0xa1d2cb,.25);}
 }
 choirRelic(g,x,y,sc=1,angle=0,lit=1,clapper=0){
  const point=(u,v)=>({x:x+(u*Math.cos(angle)-v*Math.sin(angle))*sc,y:y+(u*Math.sin(angle)+v*Math.cos(angle))*sc}),shape=(pts,c)=>{g.fillStyle(c);g.fillPoints(pts.map(([u,v])=>point(u,v)),true);};
  const rope=point(0,-60);line(g,rope.x,rope.y-80*sc,rope.x,rope.y,0x9d9471,2*sc);
  shape([[-16,-51],[16,-51],[28,-28],[34,24],[49,38],[-49,38],[-34,24],[-28,-28]],0x9a8552);
  shape([[-11,-48],[11,-48],[23,-25],[28,22],[37,32],[-35,32],[-25,19],[-21,-25]],0x2d535a);
  shape([[-11,-48],[-6,-48],[-12,28],[-35,32],[-25,19],[-21,-25]],0x547c76);
  for(let i=-2;i<=2;i++){const a=point(i*10,-14),b=point(i*11,25);line(g,a.x,a.y,b.x,b.y,lit?0x9aeed0:0x4b6863,sc,lit*.8);}
  const a=point(-48,38),b=point(48,38);line(g,a.x,a.y,b.x,b.y,0xe6d5a0,2*sc);
  const cl=point(Math.sin(clapper||angle)*19,47-Math.abs(Math.sin(clapper))*5),rod=point(0,-4);line(g,rod.x,rod.y,cl.x,cl.y,0xa79b70,2*sc);ring(g,cl.x,cl.y,7*sc,0xd3c28e);pixel(g,cl.x-2*sc,cl.y-2*sc,4*sc,6*sc,0xc9bc86);
 }
 choirBells(t,centerX=270,centerY=191,spread=1){for(let i=0;i<7;i++){const a=t*.018+i*Math.PI*2/7,x=centerX+Math.cos(a)*90*spread,y=centerY+Math.sin(a)*42*spread;this.choirRelic(Math.sin(a)<0?this.mid:this.front,x,y,.13,Math.sin(t*.04+i)*.15);}}
 choirPainting(t){
  this.choirRuins(t);const g=this.bg,x=470,y=122;
  g.fillStyle(0x817c65);g.fillEllipse(x,y,118,190);pixel(g,x-59,y,118,136,0x817c65);
  g.fillStyle(0x071522);g.fillEllipse(x,y,106,178);pixel(g,x-53,y,106,132,0x071522);
  // A leaded-glass painting: a haloed bell keeper over an emerald sea.
  const colors=[0x386f83,0x407e78,0x94794e,0x6e6084,0x3f5977];
  for(let row=0;row<12;row++)for(let col=0;col<8;col++){const xx=x-48+col*12,yy=45+row*17;if(yy<90&&Math.abs(xx+6-x)>Math.sqrt(Math.max(0,1-((yy-122)/84)**2))*49)continue;g.fillStyle(colors[(row*3+col*7)%5],.8);g.fillTriangle(xx,yy,xx+11,yy,xx+11,yy+16);g.fillStyle(colors[(row+col+2)%5],.8);g.fillTriangle(xx,yy,xx,yy+16,xx+11,yy+16);}
  ring(g,x,98,22,0xe6ca83);g.fillStyle(0xd5d5a0);g.fillCircle(x,100,9);g.fillStyle(0x243f58);g.fillTriangle(x,110,x-28,191,x+28,191);line(g,x-20,146,x+20,146,0xdbcc97,3);this.choirRelic(g,x,156,.25,0,1);
  for(let i=0;i<5;i++)line(g,x-46,213+i*6,x+46,213+i*6,0x8ec3b5,1,.7);
  line(g,x-54,122,x+54,122,0x141f2c,3);line(g,x,35,x,246,0x141f2c,2);
  g.fillStyle(0x9ee8d0,.035);g.fillTriangle(425,238,510,238,355,300);
 }
 choirWitness(t,slam=0){
  this.idle(446,300,1.6,t); // Looks right at the glass, away from the attacker on the left.
  if(slam>0){
   const frame=slam<.76?Math.floor(slam/.76*9):Math.floor(10+(slam-.76)/.24*5);this.move('downB',frame,446,300,1.6);
   if(slam>=.76){this.front.lineStyle(1,0x9fe8d3,clamp((1-slam)*3));this.front.strokeEllipse(466,300,10+(slam-.76)*240,4+(slam-.76)*50);}
  }
 }
 choirRunner(t,x,attack=false){
  this.premiumRival(t,x,300,1.65,attack?'attack':'idle');const l=this.losers[0];if(!l?.def)return;const d=l.def,S=skinSheets(this,d,this.data0.results[1]?.skin||0);
  if(!attack&&S.run){const range=d.runCycle||[0,Math.max(1,this.textures.get(S.run).frameTotal-1)];l.s.setTexture(S.run,range[0]+Math.floor(t/4)%range[1]);}
  l.s.setFlipX(!!d.facesLeft); // Every opponent runs right toward Choir.
  for(let i=0;i<4;i++)line(this.mid,x-24-i*11,267+i*8,x-12-i*11,267+i*8,0x8da9a9,.7,.35);
 }
 choirWide(t){this.choirPainting(t);this.cineCamera('distant cathedral nave, stained-glass witness and charging rival',.82,320,180);}
 shot_choir_cathedral_painting(t,k,s){this.choirWide(t);this.choirWitness(t);this.premiumRival(t,72,300,1.65);this.losers[0]?.s.setFlipX(!!this.losers[0].def.facesLeft);this.cineAction={phase:'painting',lookingAway:true,distance:374};}
 shot_choir_cathedral_charge(t,k,s){this.choirWide(t);this.choirWitness(t);const x=72+ease(k)*212;this.choirRunner(t,x);this.cineAction={phase:'charge',runnerX:x,lookingAway:true};}
 shot_choir_cathedral_slam(t,k,s){this.choirWide(t);this.choirWitness(t,k);const x=284+k*16;this.choirRunner(t,x,k>.7);if(k>=.76)this.cineCue('choir-staff-slam','clang',.5,.55);this.cineAction={phase:'slam',runnerX:x,staffDown:k>=.76,lookingAway:true};}
 shot_choir_cathedral_fall(t,k,s){this.choirWide(t);this.choirWitness(t,1);const x=300+k*10;this.choirRunner(t,x,true);const bellY=-135+ease(k)*349;this.choirRelic(this.front,310,bellY,2.25,0,1);for(let i=0;i<7;i++)line(this.front,258+i*28,bellY-180,258+i*28,bellY-120,0xa4c6bb,1,.4);this.cineAction={phase:'bell-fall',runnerX:x,bellY,lookingAway:true};}
 shot_choir_cathedral_impact(t,k,s){this.choirWide(t);this.choirWitness(t,1);this.losers.forEach(l=>l.s.setVisible(false));this.choirRelic(this.front,310,214+Math.sin(s*.7)*Math.exp(-s*.12)*3,2.25,0,1);this.cineCamera('wide hold on the fallen bell, Choir never turns',.82,320+Math.sin(s*2)*Math.exp(-s*.12)*4,180);this.cineCue('choir-bell-crush','clang',.65,.28);this.cineCue('choir-bell-toll','ding',.5,.35);
  for(let i=0;i<32;i++){const a=i*Math.PI*2/32,r=s*(.8+i%4*.3);pixel(this.front,310+Math.cos(a)*r,298-Math.abs(Math.sin(a))*r*.25,2+i%3,2,0x9cb6aa,clamp(1-k)*.65);}this.front.lineStyle(2,0xa3e4d1,1-k);this.front.strokeEllipse(310,300,100+k*250,10+k*35);this.cineAction={phase:'impact',rivalGone:true,bellGrounded:true,lookingAway:true};}
 shot_choir_cathedral_stillness(t,k,s){this.choirWide(t);this.choirWitness(t);this.losers.forEach(l=>l.s.setVisible(false));this.choirRelic(this.front,310,214,2.25,0,.6);this.cineAction={phase:'stillness',rivalGone:true,bellGrounded:true,lookingAway:true};}

 lavaSet(t){volcano(this.bg,t);craterForeground(this.front,t);this.cineAction={volcano:true,curvedRim:true,rival:this.losers[0]?.name};}
 shot_obsidian_volcano_duel(t,k,s){this.lavaSet(t);this.cineCamera('wide duel on giant volcanic rim',.85,330,190);const beat=Math.floor(s/26)%2;this.move(beat?'ftilt':'fair',Math.floor(s/3)%14,170+Math.sin(s*.07)*18,280,3);this.premiumRival(t,375-Math.sin(s*.07)*14,280,3,'attack');line(this.front,294,184,308,173,0xffcb87,2,Math.sin(s*.2)>.7?1:0);}
 shot_obsidian_volcano_clash(t,k,s){this.lavaSet(t);this.cineCamera('tight blades clash above the crater',1.05,293,198);this.move('ftilt',Math.floor(s/4)%14,205,280,3);this.premiumRival(t,365,280,3,'attack');for(let i=0;i<12;i++){const p=(s%26)/26,a=i*.52;pixel(this.front,298+Math.cos(a)*p*50,186+Math.sin(a)*p*32,2,2,0xffcf8b,1-p);}if(s%26===0)this.cineCue('obs-clash-'+s,'clang',.45,.7);}
 shot_obsidian_volcano_windup(t,k,s){this.lavaSet(t);this.move('fsmash',Math.min(8,Math.floor(s/9)),190,280,3);this.cineCamera('low angle heavy overhead wind-up',1.22,220,182);this.premiumRival(t,380,280,3);this.cineAction.phase='windup';}
 shot_obsidian_volcano_swing(t,k,s){this.lavaSet(t);this.move('fsmash',Math.min(23,8+Math.floor(s/3)),190+ease(k)*55,280,3);this.cineCamera('rapid overhead cleave and impact',1.02,322,194);this.premiumRival(t,380+ease(k)*30,280,3);for(let i=0;i<30;i++){const q=i/29,a=-1.6+q*2.9;line(this.front,247+Math.cos(a)*105,190+Math.sin(a)*83,247+Math.cos(a)*114,190+Math.sin(a)*90,i%3?0xf88b39:0xffe6a7,3,clamp(1-Math.abs(k-.45)*1.7));}this.cineCue('obs-swing','slash',.6,.65);if(s>=20)this.cineCue('obs-impact','bighit',.6,.65);this.cineAction.phase='swing';}
 shot_obsidian_volcano_launch(t,k,s){this.lavaSet(t);this.move('fsmash',23,245,280,3);this.cineCamera('track the opponent over the molten crater',.9,440,230);const x=410+155*k,y=280-145*Math.sin(k*Math.PI*.8)+80*k;this.premiumRival(t,x,y,3,'idle',0,k*3.5);this.cineAction.phase='launched';this.cineAction.rivalPosition=[x,y];}
 shot_obsidian_volcano_crater(t,k,s){
  this.lavaSet(t);this.idle(245,280,3,t);this.cineCamera('opponent disappears behind the curved volcanic rim',1.08,523,281);
  this.premiumRival(t,565-35*k,275+180*k,3*(1-k*.55),'idle',0,2.8+k*2);
  if(k>.82)this.hideLosers();
  // Individual molten droplets spring from the impact point and fall back into the existing crater.
  if(s>=18)for(let i=0;i<26;i++){const age=s-18-i%4*2;if(age<0)continue;const vx=Math.cos(i*2.4)*(1+i%4*.35),vy=-2.5-i%5*.55,x=543+vx*age,y=310+vy*age+.105*age*age;if(y<326)pixel(this.front,x,y,2+i%2,3,age<10?0xffe3a1:0xf8a447,clamp(1-age/65));}
  if(s>=18)this.cineCue('obs-lava','geyser',.6,.65);
  this.cineAction.phase='submerged';this.cineAction.splash=s>=18;
 }
 shot_obsidian_volcano_embers(t,k,s){this.lavaSet(t);this.idle(245,280,3,t);this.cineCamera('Lacy watches the crater burn',1.08,290,184);this.cineAction.phase='final';}
}
