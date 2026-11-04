// Regular phantoms climb and make contact, then settle, kneel and fade as harmless spirits.
let serial = 900000;
export class SpiritualSkeleton {
  constructor(match, owner, index) {
    Object.assign(this, { match, owner, index, id: 'spirit' + serial++, alive: true, age: 0,
      life: owner.def.limit.spiritLife, emergeTicks: owner.def.limit.emergeTicks, variant: index % 3 });
    this.phase = 'approach'; this.phaseT = 0; this.facing = owner.facing;
    this.ground = owner.spiritGround || owner.platform || match.stage.platforms[0];
    const enemies = match.fighters.filter(f => f.alive && f.team !== owner.team);
    this.target = enemies.length ? enemies[index % enemies.length] : null;
    const wanted = owner.x + owner.facing * (30 + index % 7 * 34);
    this.x = Math.max(this.ground.x1 + 24, Math.min(this.ground.x2 - 24, wanted));
    this.y = this.ground.y - 31; this.vx = owner.facing * 1.5; this.vy = -2;
    this.sprite = match.add.sprite(this.x, this.ground.y, 'spirit_flight', this.variant * 4)
      .setScale(1).setOrigin(.5, 1).setDepth(6);
    this.crack = match.add.graphics().setDepth(3);
    match.addWorld(this.crack, this.sprite);
  }
  get flightAge() { return this.age - this.emergeTicks; }
  step() {
    if (!this.alive) return;
    this.age++; this.life--;
    if (this.phase !== 'approach') {
      this.phaseT++;
      if (this.phase === 'settle') {
        this.x += (this.fadeX-this.x)*.22;
        this.fadeFootY += (this.ground.y-this.fadeFootY)*.28;
        if (this.phaseT >= 18) { this.x=this.fadeX;this.fadeFootY=this.ground.y;this.phase='kneel';this.phaseT=0; }
      } else if (this.phase === 'kneel' && this.phaseT >= 20) { this.phase='fade';this.phaseT=0; }
      else if (this.phase === 'fade') {
        if(this.phaseT%6===0)this.match.particles.push({x:this.x+(this.phaseT%3-1)*7,y:this.ground.y-27,vx:0,vy:-.8,life:16,grav:-.01,size:1,color:0xc9f5ff});
        if(this.phaseT>=36)this.finish();
      }
      return;
    }
    if (this.flightAge <= 0) {
      this.y = this.ground.y - 31;
      if (this.age % 9 === 0) {
        for (const side of [-1, 1]) this.match.particles.push({ x: this.x + side * 14, y: this.ground.y - 1,
          vx: side * .7, vy: -1.4, life: 12, grav: .15, size: 2, color: 0x74604d });
      }
    } else {
      if (this.flightAge === 1) {
        this.sprite.setCrop().setOrigin(.5, .5); this.match.puff(this.x, this.ground.y - 3, 0xa1eaff, 3);
      }
      if (this.flightAge < 12) { this.x += this.vx; this.y -= 2.5; }
      else if (this.flightAge < 66 && this.target?.alive) {
        const dx = this.target.x - this.x, dy = this.target.y - 26 - this.y, distance = Math.hypot(dx, dy) || 1;
        this.vx += (dx / distance * 4.8 - this.vx) * .16;
        this.vy += (dy / distance * 4.8 - this.vy) * .16;
        this.x += this.vx; this.y += this.vy;
      } else { this.x += this.vx; this.y += this.vy - .35; }
      if (this.age % 8 === 0) this.match.particles.push({ x: this.x - this.vx * 2, y: this.y + 4,
        vx: -.15 * this.vx, vy: -.2, life: 8, grav: 0, size: 1, color: 0x8fdcf0 });
    }
    if (this.life <= 0) this.kill();
  }
  hitbox() {
    if (!this.alive || this.phase !== 'approach' || this.flightAge < 12 || this.flightAge > 73) return null;
    return { x1: this.x - 17, x2: this.x + 17, y1: this.y - 22, y2: this.y + 19,
      owner: this.owner, projectile: this, persist: false, facing: Math.sign(this.vx) || 1, id: this.id,
      h: { dmg: 3, angle: 65, base: .6, growth: .6, stun: 9 } };
  }
  render() {
    if (!this.alive) return;
    this.crack.clear();
    this.sprite.setTint(this.owner.theme==='judgment'?0xb8f3ff:this.owner.theme==='frost'?0xc5efff:this.owner.theme==='plague'?0xb9dc85:0xffffff);
    if (this.flightAge < 12) {
      const y = Math.round(this.ground.y), x = Math.round(this.x);
      this.crack.fillStyle(0x111823); this.crack.fillRect(x - 17, y - 1, 34, 4);
      this.crack.fillStyle(0x8ec5d1); this.crack.fillRect(x - 13, y - 2, 10, 1); this.crack.fillRect(x + 5, y - 2, 9, 1);
    }
    const base = this.variant * 4;
    if(this.phase!=='approach') {
      const frame=this.phase==='settle'?0:this.phase==='kneel'?1:this.phaseT<18?2:3;
      const alpha=this.phase==='fade'?.94*Math.max(0,1-this.phaseT/36):.94;
      this.sprite.setTexture('spirit_kneel',base+frame).setCrop().setOrigin(.5,52/56)
        .setPosition(Math.round(this.x),Math.round(this.fadeFootY)-(this.phase==='fade'?Math.floor(this.phaseT/9):0))
        .setFlipX(this.facing<0).setAlpha(alpha);
      return;
    }
    if (this.flightAge <= 0) {
      const k = Math.min(1, this.age / this.emergeTicks), buried = Math.round((1 - k) * 18) * 2;
      this.sprite.setFrame(base + Math.min(2, Math.floor(k * 3))).setPosition(Math.round(this.x), Math.round(this.ground.y) + buried)
        .setCrop(0, 0, 48, 56 - buried).setFlipX(this.owner.facing < 0).setAlpha(.94);
    } else {
      this.sprite.setFrame(base + 3).setPosition(Math.round(this.x), Math.round(this.y)).setFlipX(this.vx < 0)
        .setAlpha(.94);
    }
  }
  kill() {
    if (!this.alive || this.phase !== 'approach') return;
    this.phase='settle';this.phaseT=0;this.facing=Math.sign(this.vx)||this.facing;
    const surfaces=this.match.stage.platforms.filter(p=>this.x>=p.x1+10 && this.x<=p.x2-10 && p.y>=this.y-28).sort((a,b)=>a.y-b.y);
    this.ground=surfaces[0]||this.ground;
    this.fadeX=Math.max(this.ground.x1+20,Math.min(this.ground.x2-20,this.x));
    this.fadeFootY=Math.min(this.ground.y,this.y+26);this.crack.clear();
  }
  finish() {
    if(!this.alive)return;
    this.alive=false;this.sprite.destroy();this.crack.destroy();
  }
}
