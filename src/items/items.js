// Items drop from the sky every 10-16 seconds. Walk over one to use it.
//   Soul Heart  - heals 25% (or 25 HP in Stamina)          helpful
//   Limit Orb   - fills half of your Limit gauge             helpful
//   Cursed Skull- 8 s curse: slower and 30% weaker attacks   harmful
import { sfx } from '../audio/sfx.js';
import { LIMIT_MAX } from '../config.js';

const MAPS = {
  heart: ['.oo..oo.', 'orrooRro', 'orrrrRro', 'orrrrrro', '.orrrro.', '..orro..', '...oo...', '........'],
  orb: ['..oooo..', '.obbwwo.', 'obbbbwbo', 'obbbbbbo', 'oddbbbbo', 'odddbbdo', '.odddbo.', '..oooo..'],
  skull: ['.oooooo.', 'owwwwwwo', 'owoowoow', 'owoowoow', 'owwwwwwo', '.owowow.', '.oooooo.', '........'],
};
const COLORS = { o: 0x1a1020, r: 0xff3b5c, R: 0xffb0c0, b: 0x78a0c6, w: 0xf0f2f3, d: 0x076cc2 };
const TYPES = ['heart', 'orb', 'skull'];
const NAMES = { heart: 'SOUL HEART', orb: 'LIMIT ORB', skull: 'CURSED SKULL' };

export function makeItemTextures(scene) {
  for (const [k, rows] of Object.entries(MAPS)) {
    if (scene.textures.exists('item_' + k)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (COLORS[ch] !== undefined) { g.fillStyle(COLORS[ch], 1); g.fillRect(x, y, 1, 1); } }));
    g.generateTexture('item_' + k, 8, 8);
    g.destroy();
  }
}

class Item {
  constructor(match, type, x) {
    this.match = match; this.type = type; this.x = x; this.y = -320; this.vy = 0;
    this.alive = true; this.t = 0; this.life = 900; this.grounded = false;
    this.sprite = match.add.sprite(x, this.y, 'item_' + type).setScale(2).setOrigin(0.5, 1);
    match.addWorld(this.sprite);
  }
  step() {
    this.t++;
    if (!this.grounded) {
      this.vy = Math.min(3, this.vy + 0.15);
      const py = this.y; this.y += this.vy;
      for (const p of this.match.stage.platforms) {
        if (this.x >= p.x1 && this.x <= p.x2 && py <= p.y && this.y >= p.y) { this.y = p.y; this.grounded = true; this.vy = 0; }
      }
      if (this.y > 400) this.kill();
    }
    if (--this.life <= 0) this.kill();
    for (const f of this.match.fighters) {
      if (!f.alive || f.state === 'respawn' || !this.alive) continue;
      if (Math.abs(f.x - this.x) < 18 && this.y > f.y - f.body.h - 6 && this.y < f.y + 8) this.apply(f);
    }
  }
  apply(f) {
    const m = this.match;
    if (this.type === 'heart') {
      if (m.mode === 'stamina') f.hp = Math.min(f.maxHp, f.hp + 25); else f.percent = Math.max(0, f.percent - 25);
      sfx('item', 0.7); m.puff(f.x, f.y - 30, 0xff3b5c, 10);
    } else if (this.type === 'orb') {
      f.limit = Math.min(LIMIT_MAX, f.limit + 50);
      sfx('item', 0.7, 1.3); m.puff(f.x, f.y - 30, 0x78a0c6, 10);
    } else {
      f.curse = 480;
      sfx('curse', 0.8); m.puff(f.x, f.y - 30, 0xb07ad0, 12);
    }
    m.popText(f, NAMES[this.type], this.type === 'skull' ? '#b07ad0' : this.type === 'heart' ? '#ff6b88' : '#78a0c6');
    this.kill();
  }
  kill() { if (!this.alive) return; this.alive = false; this.sprite.destroy(); }
  render() {
    if (!this.alive) return;
    this.sprite.setPosition(Math.round(this.x), Math.round(this.y - (this.grounded ? Math.abs(Math.sin(this.t * 0.08)) * 3 : 0)));
    this.sprite.setAlpha(this.life < 150 && this.life % 10 < 5 ? 0.3 : 1);
  }
}

export class ItemSpawner {
  constructor(match) { this.match = match; this.items = []; this.timer = 420; }
  step() {
    this.items = this.items.filter((i) => i.alive);
    if (--this.timer <= 0) {
      this.timer = 600 + Math.floor(Math.random() * 360);
      if (this.items.length < 2) {
        const type = TYPES[Math.floor(Math.random() * TYPES.length)];
        const x = Math.round(-240 + Math.random() * 480);
        this.items.push(new Item(this.match, type, x));
      }
    }
    for (const i of this.items) i.step();
  }
  render() { for (const i of this.items) i.render(); }
}
