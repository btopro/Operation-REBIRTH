import { SpiritualSkeleton } from './spiritualSkeleton.js';
import { GLADIATOR_EYES,GLADIATOR_SWORDS } from './gladiatorEyes.js';
import { sfx } from '../audio/sfx.js';

// The fifteenth summon: a heavy grounded swordsman, one 20-damage soul-sword swing, then a kneeling spiritual fade.
export class GladiatorSkeleton extends SpiritualSkeleton {
  constructor(match, owner, index) {
    super(match, owner, index);
    this.giant = true; this.phase = 'emerge'; this.phaseT = 0; this.emergeTicks = 56; this.life = 420;
    this.x = Math.max(this.ground.x1 + 54, Math.min(this.ground.x2 - 54, owner.x + owner.facing * 38));
    this.y = this.ground.y - 52; this.facing = owner.facing;
    this.sprite.setTexture('spirit_gladiator', 0).setScale(3).setOrigin(.5, 60/64);
    this.eyeG=match.add.graphics().setDepth(7);match.addWorld(this.eyeG);
  }
  change(phase) { this.phase = phase; this.phaseT = 0; }
  step() {
    if (!this.alive) return;
    this.age++; this.phaseT++; this.life--;
    this.y = this.ground.y - 52;
    if (this.phase === 'emerge') {
      if (this.phaseT % 10 === 0) this.match.puff(this.x, this.ground.y - 3, 0x756357, 3);
      if (this.phaseT >= this.emergeTicks) this.change('walk');
    } else if (this.phase === 'walk') {
      if (!this.target?.alive) this.target = this.match.fighters.filter(f => f.alive && f.team !== this.owner.team)
        .sort((a,b) => Math.abs(a.x-this.x)-Math.abs(b.x-this.x))[0];
      const dx = this.target ? this.target.x - this.x : this.facing * 200;
      if (Math.abs(dx) <= 82 || this.phaseT >= 180) { this.facing = Math.sign(dx) || this.facing; this.change('windup'); sfx('staff', .45, .55); }
      else {
        this.facing = Math.sign(dx) || this.facing;
        this.x = Math.max(this.ground.x1 + 45, Math.min(this.ground.x2 - 45, this.x + this.facing * 1.25));
        if (this.phaseT % 18 === 0) {
          sfx('gladiatorStep', .95, this.phaseT % 36 === 0 ? .94 : 1);
          this.match.shake(1.2, 3);
          this.match.particles.push({x:this.x-this.facing*70,y:this.ground.y-2,vx:-this.facing*.6,vy:-.6,life:10,grav:.1,size:2,color:0x9b956e});
        }
      }
    } else if (this.phase === 'windup' && this.phaseT >= 32) {
      this.change('swing'); sfx('whoosh', .85, .55);
    } else if (this.phase === 'swing') {
      if (this.phaseT === 16) { this.match.shake(6, 8); sfx('bighit', .65, .6); this.match.puff(this.x+this.facing*72,this.ground.y-4,0xa4d8de,7); }
      if (this.phaseT >= 24) this.change('recover');
    } else if (this.phase === 'recover' && this.phaseT >= 24) this.kill();
    else if (this.phase === 'kneel' && this.phaseT >= 20) this.change('fade');
    else if (this.phase === 'fade') {
      if(this.phaseT%6===0)this.match.particles.push({x:this.x+(this.phaseT%5-2)*9,y:this.ground.y-50,vx:0,vy:-1,life:20,grav:-.01,size:2,color:0xb5efff});
      if(this.phaseT>=44)this.finish();
    }
    if(this.life<=0 && !['kneel','fade'].includes(this.phase))this.kill();
  }
  hitbox() {
    if (!this.alive || this.phase !== 'swing' || this.phaseT < 8 || this.phaseT > 16) return null;
    const center = this.x + this.facing * 50;
    return {x1:center-48,x2:center+48,y1:this.ground.y-105,y2:this.ground.y-4,
      owner:this.owner,projectile:this,persist:true,facing:this.facing,id:this.id,
      h:{dmg:20,angle:42,base:6.8,growth:7.6,stun:26}};
  }
  render() {
    if (!this.alive) return;
    this.crack.clear();
    let frame=0, texture='spirit_gladiator';
    if(this.phase==='walk')frame=Math.floor(this.phaseT/9)%4;
    else if(this.phase==='windup'){texture='gladiator_attack';frame=Math.min(2,Math.floor(this.phaseT/11));}
    else if(this.phase==='swing'){texture='gladiator_attack';frame=3+Math.min(2,Math.floor(this.phaseT/8));}
    else if(this.phase==='recover'){texture='gladiator_attack';frame=6+Math.min(1,Math.floor(this.phaseT/12));}
    else if(this.phase==='kneel'){texture='gladiator_kneel';frame=this.phaseT<10?0:1;}
    else if(this.phase==='fade'){texture='gladiator_kneel';frame=1;}
    this.sprite.setTexture(texture,frame).setOrigin(.5,60/64).setScale(3).setFlipX(this.facing<0)
      .setAlpha(this.phase==='fade'?.96*Math.max(0,1-this.phaseT/44):.96);
    if(this.phase==='emerge') {
      const buried=Math.round((1-this.phaseT/this.emergeTicks)*28)*3;
      this.sprite.setPosition(Math.round(this.x),Math.round(this.ground.y)+buried).setCrop(0,0,64,Math.max(0,60-buried/3));
      this.crack.fillStyle(0x111823);this.crack.fillRect(this.x-34,this.ground.y-1,68,5);
    } else this.sprite.setCrop().setPosition(Math.round(this.x),Math.round(this.ground.y));
    // Fade exactly the same kneeling cel: changing opacity/tint never changes body size.
    this.sprite.setTint(this.phase==='fade'?0xd4efff:0xffffff);
    this.eyeG.clear();
    if(this.phase!=='emerge'){
      const [gx,gy,tx,ty]=GLADIATOR_SWORDS[texture][frame];
      for(let j=0;j<4;j++){const k=((this.age+j*7)%30)/30,fx=gx+(tx-gx)*k,fy=gy+(ty-gy)*k;this.eyeG.fillStyle(j%2?0xc9fff1:0x58e1f0,this.sprite.alpha*(1-k*.7));this.eyeG.fillRect(Math.round(this.x+this.facing*(fx-32)*3),Math.round(this.ground.y+(fy-60)*3)-3-(this.age+j)%3*3,3,6);}
      const [ex,ey]=GLADIATOR_EYES[texture][frame];
      const x=Math.round(this.x+this.facing*(ex-32)*3),y=Math.round(this.ground.y+(ey-60)*3);
      for(let i=0;i<3;i++){const drift=(this.age*2+i*5)%15;this.eyeG.fillStyle(i===0?0xffc064:0xff392c,this.sprite.alpha*(1-drift/18));this.eyeG.fillRect(x-this.facing*drift,y-Math.floor(drift/3)+(i%2)*3,3,3);}
    }
  }
  kill() {
    if(!this.alive || ['kneel','fade'].includes(this.phase))return;
    this.change('kneel');this.crack.clear();
  }
  finish() {
    if(!this.alive)return;
    this.alive=false;this.sprite.destroy();this.crack.destroy();this.eyeG?.destroy();
  }
}
