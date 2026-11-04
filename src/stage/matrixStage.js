// Original simulation rooftop inspired by The Matrix. Geometry stays solid while the system rewrites.
import { HazardCycle } from './hazardCycle.js';
export const REWRITE_PERIOD = 720;
const LAYOUTS = [[[-185,-85],[185,-85],[0,-172]],[[-140,-145],[140,-145],[0,-70]],[[-210,-65],[210,-125],[0,-200]]];
export class MatrixStage {
  constructor(scene) {
    this.scene=scene; this.t=0; this.music='bgm_construct'; this.hazardsOn=true;
    this.platforms=[{x1:-270,x2:270,y:0,bottom:64,solid:true},...LAYOUTS[0].map(([x,y])=>({x1:x-52,x2:x+52,y,solid:false}))];
    this.spawns=[{x:-155,y:0},{x:155,y:0},{x:-65,y:0},{x:65,y:0}];
    this.cycle=new HazardCycle(this,['scan'],{first:420,gap:500,jitter:120,color:'#a4ffba',stroke:'#031309'});
  }
  draw(world,bg) {
    const s=this.scene,sky=s.add.graphics().setScrollFactor(0);
    sky.fillStyle(0x020907);sky.fillRect(-600,-400,1900,1400);
    // Dense skyline: windows, rooftop aerials, and lit data trunks.
    for(let i=0;i<32;i++) {const x=-240+i*36,h=35+(i*47)%150;
      sky.fillStyle(i%2?0x071b14:0x0b241c);sky.fillRect(x,310-h,32,h+100);
      sky.fillStyle(0x205c3b,.7);for(let y=320-h;y<310;y+=11)for(let k=0;k<3;k++)if((i+k+y)%4)sky.fillRect(x+4+k*9,y,3,4);
      sky.fillStyle(0x277747);sky.fillRect(x+15,298-h,1,12);
    }
    bg.push(sky);this.rain=s.add.graphics().setScrollFactor(.12);bg.push(this.rain);
    this.arena=s.add.graphics();world.push(this.arena);this.hzG=s.add.graphics();world.push(this.hzG);
    this.cycle.makeBanner(s);this.paint();
  }
  movePlatforms(match) {
    const phase=Math.floor(this.t/REWRITE_PERIOD)%3,next=(phase+1)%3,local=this.t%REWRITE_PERIOD;
    // 1.5 seconds of visible warning, then a smooth three-second rebuild.
    const u=Math.max(0,Math.min(1,(local-450)/180)),ease=u*u*(3-2*u);
    this.rewriting=local>=360&&local<630;
    for(let i=0;i<3;i++) {
      const p=this.platforms[i+1],a=LAYOUTS[phase][i],b=LAYOUTS[next][i];
      const x=a[0]+(b[0]-a[0])*ease,y=a[1]+(b[1]-a[1])*ease+Math.sin(this.t*.015+i*2)*5;
      const dx=x-52-p.x1,dy=y-p.y;
      p.x1=x-52;p.x2=x+52;p.y=y;
      for(const f of match.fighters)if(f.alive&&f.grounded&&f.platform===p){f.x+=dx;f.y+=dy;}
    }
  }
  paint() {
    const g=this.arena,r=this.rain,t=this.t;g.clear();r.clear();
    // Pixel glyphs rather than antialiased text. Bright heads and dim trailing code.
    for(let i=0;i<76;i++)for(let j=0;j<13;j++) {
      const x=-420+i*17,y=((t*(.65+(i%5)*.16)+i*71-j*11)%650+650)%650-280;
      r.fillStyle(j===0?0xc9ffdc:0x2de879,j===0?.8:(1-j/13)*.25);
      const n=(i*37+j*13+Math.floor(t/9))%16;
      r.fillRect(x,y,1,6);r.fillRect(x+3,y+(n%3),1,5);if(n%2)r.fillRect(x,y+2,4,1);if(n%4)r.fillRect(x,y+5,4,1);
    }
    // Perspective grid falls away beneath the rooftop.
    g.lineStyle(1,0x126238,.55);
    for(let i=-8;i<=8;i++)g.lineBetween(i*25,38,i*90,260);
    for(let i=0;i<9;i++){const y=40+i*i*3;g.lineBetween(-650,y,650,y);}
    const base=this.platforms[0];g.fillStyle(0x0a1916);g.fillRect(base.x1,0,540,48);
    g.fillStyle(0x183c2c);g.fillRect(-270,0,540,5);g.fillStyle(0x86ffb2);g.fillRect(-270,0,540,1);
    for(let x=-266;x<270;x+=18){g.fillStyle(0x235039);g.fillRect(x,8,12,3);g.fillStyle(0x030a08);g.fillRect(x,16,13,26);}
    for(let i=1;i<4;i++) {
      const p=this.platforms[i],warn=this.rewriting&&t%24<12;
      g.fillStyle(warn?0xb0ffcd:0x32e687,.1);g.fillRect(p.x1-3,p.y-3,110,18);
      g.fillStyle(0x0c3022);g.fillRect(p.x1,p.y,104,9);g.fillStyle(warn?0xe3ffe9:0x63ffa2);g.fillRect(p.x1,p.y,104,2);
      for(let x=p.x1+4;x<p.x2-4;x+=8){g.fillStyle(0x27a765);g.fillRect(x,p.y+5,4,1);}
      if(this.rewriting){g.lineStyle(1,0x65ffa0,.25);g.lineBetween((p.x1+p.x2)/2,p.y+10,(p.x1+p.x2)/2,0);}
    }
    // A rooftop access door and two ventilator banks establish the physical world.
    for(const x of [-235,212]){g.fillStyle(0x1a3329);g.fillRect(x,-23,24,23);g.fillStyle(0x3f6850);g.fillRect(x,-23,24,3);for(let y=-17;y<-3;y+=4){g.fillStyle(0x07120d);g.fillRect(x+3,y,18,2);}}
    g.fillStyle(0x133823);g.fillRect(-21,12,42,23);g.fillStyle(this.rewriting?0xafffd0:0x37c97a);g.fillRect(-15,16,30,2);
  }
  step(match) {this.t++;this.movePlatforms(match);this.paint();this.hzG.clear();return this.cycle.run(match,[]);}
  start_scan(match,h) {
    h.title='SYSTEM SCAN: CLEAR THE MARKED LANES';
    const target=match.fighters.find(f=>f.alive);h.x=Math.max(-190,Math.min(190,target?.x||0));
  }
  step_scan(match,h,out) {
    const g=this.hzG,active=h.t>=90&&h.t<118;
    for(const x of [h.x-68,h.x+68]) {
      if(h.t<90){g.fillStyle(0x83ffae,h.t%16<8?.35:.12);g.fillRect(x-12,-260,24,260);g.lineStyle(1,0x8effb9,.7);g.lineBetween(x,-260,x,0);}
      else if(active){g.fillStyle(0x20e574,.35);g.fillRect(x-17,-270,34,320);g.fillStyle(0xd9ffe5);g.fillRect(x-5,-270,10,320);
        out.push({x1:x-12,x2:x+12,y1:-270,y2:45,dmg:9,angle:82,base:4,growth:3,dirX:x<0?-1:1,id:'construct-scan'+h.id+':'+x,hazard:true});}
    }
    return h.t>=140;
  }
}
export function drawMatrixPreview(g,x,y,w,h) {
  g.fillStyle(0x020c08);g.fillRect(x,y,w,h);
  for(let i=0;i<28;i++){g.fillStyle(0x24cc6a,.25+(i%3)*.15);for(let j=0;j<7;j++)g.fillRect(x+i*w/28,y+((i*13+j*7)%Math.max(1,h)),1,3);}
  g.fillStyle(0x173e2b);g.fillRect(x+w*.12,y+h*.76,w*.76,h*.14);g.fillStyle(0x95ffc0);g.fillRect(x+w*.12,y+h*.76,w*.76,1);
  for(const [cx,cy] of [[.28,.5],[.72,.5],[.5,.26]]){g.fillStyle(0x48f594);g.fillRect(x+w*(cx-.09),y+h*cy,w*.18,2);}
}
