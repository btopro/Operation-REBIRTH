// "Gravemoon Bridge": a stone bridge over a misty chasm at night. A huge full moon, castle spires
// behind a matching 64px stone tile kit, carved gargoyle piers, and a red
// lantern hanging from a crossbeam above the middle. Native 64px tile art uses one shared palette.
// Plays its own music (gravemoon).
//
// Stage hazards, one at a time every 10-14 s, each announced with a CAUTION banner first:
//   GARGOYLE GAZE - a gargoyle's head rises over one end of the bridge, its eyes burning brighter,
//                   then it fires a red eye-beam along the deck at ankle height. Jump!
//   BAT SWARM     - a swarm of bats streams across the moonlit sky in a wave, through the ledges
//                   and the air above the bridge. Stay low.
// The lantern: every attack that hits it sets it swinging on its chain and cracks the glass a little
// more. On the 10th hit the chain snaps: it falls (hurting anyone under it), shatters on the deck and
// fire spreads across the whole bridge for 10 s, burning anyone standing in it. A new lantern is
// lowered from the crossbeam a while later.
import { drawMoonArt, pixelDisc } from './moonArt.js';
import { sfx } from '../audio/sfx.js';
import { HazardCycle } from './hazardCycle.js';

export const MPAL = {
  outline: 0x0a0818,
  sky: [0x0b0922, 0x110e30, 0x17143e, 0x1e1a4c, 0x26215a, 0x2f2a6a, 0x39337a, 0x443e8a],
  streak: 0x5a56a8, star: 0xc8ccff,
  moon: 0xe6eaff, moonShade: 0xc2c8f0, crater: 0x9ca4d8, halo: 0x7470d0,
  mtnFar: 0x2c2c64, mtnFarLit: 0x4a4c90, mtnNear: 0x1a1a42, mtnNearLit: 0x3a3c76,
  window: 0xf3c358, lava: 0xff5a2a, lavaHot: 0xffb040, lavaDark: 0x8a1a10,
  stone: 0x53566c, stoneLight: 0xb3becd, stoneMid: 0x38384f, stoneDark: 0x232239, rune: 0x7ac8f0,
  iron: 0x2a2838, ironLit: 0x55526e, ironDark: 0x15131f,
  lanternFrame: 0x24182a, glass: 0xff6a20, glassHot: 0xffc060,
  eye: 0xff3a3a, fog: 0x7c8497,
};

export class MoonStage {
  constructor(scene) {
    this.scene = scene;
    this.platforms = [
      { x1: -300, x2: 300, y: 0, solid: true, bottom: 40 },
      { x1: -214, x2: -114, y: -84, solid: false },     // left horned arch
      { x1: 114, x2: 214, y: -84, solid: false },       // right horned arch
      { x1: -56, x2: 56, y: -170, solid: false },       // crossbeam the lantern hangs from
    ];
    this.spawns = [{ x: -150, y: 0 }, { x: 150, y: 0 }, { x: -50, y: 0 }, { x: 50, y: 0 }];
    this.hazardsOn = true;
    this.t = 0;
    this.music = 'bgm_gravemoon';
    this.cycle = new HazardCycle(this, ['gaze', 'bats'], { color: '#ff6a6a', stroke: '#0a0818' });
    this.lamp = { state: 'hung', hits: 0, ang: 0, vel: 0, seen: new Set(), t: 0, drop: 0 };
  }

  // ---------------------------------------------------------------- helpers
  // a curved horn: steps along an arc from (x, y), thick at the root and thin at the tip
  horn(g, x, y, dir, len, curl, thick, col = MPAL.iron, lit = MPAL.ironLit) {
    const steps = Math.ceil(len * 1.5), pts = [];
    for (let i = 0; i <= steps; i++) {
      const k = i / steps, a = k * curl;
      pts.push([Math.round(x + dir * Math.sin(a) * len * 0.7), Math.round(y - (1 - Math.cos(a)) * len * 0.15 - k * len * 0.6), Math.max(1, Math.round(thick * (1 - k * 0.85)))]);
    }
    for (const [px, py, w] of pts) { g.fillStyle(MPAL.outline, 1); g.fillRect(px - Math.floor(w / 2) - 1, py - 1, w + 2, 3); }
    for (const [px, py, w] of pts) { g.fillStyle(col, 1); g.fillRect(px - Math.floor(w / 2), py, w, 1); }
    for (const [px, py, w] of pts) { if (w > 2) { g.fillStyle(lit, 1); g.fillRect(px - Math.floor(w / 2), py, Math.max(1, Math.round(w / 3)), 1); } }
  }
  // ---------------------------------------------------------------- drawing
  draw(worldLayer, bgLayer) { drawMoonArt(this, worldLayer, bgLayer); }

  // ---------------------------------------------------------------- per frame
  step(match) {
    this.t++;
    const t = this.t, S = MPAL;
    // Sparse distant embers, snapped to the same two-pixel grid as the stone kit.
    const e=this.emberG;e.clear();
    for(let k=0;k<5;k++){const life=(t*.2+k*17)%68;e.fillStyle(0xba824d,.5*(1-life/68));e.fillRect(510+k*8,Math.floor((200-life)/2)*2,2,2);}
    const lampOut = [];
    this.stepLantern(match, lampOut);
    // mist rolling through the pillars below the deck
    const f = this.fogG; f.clear();
    for (let k = 0; k < 4; k++) {
      const y = 112 + k * 32, sp = 0.15 + (k % 3) * 0.08;
      for (let j = 0; j < 4; j++) {
        const x = ((j * 260 + k * 70 + t * sp) % 1040) - 520;
        f.fillStyle(S.fog, 0.07 + 0.02 * (k % 3) + k * 0.012);
        f.fillRect(Math.round(x/2)*2, y, 160, 8); f.fillRect(Math.round(x/2)*2 + 24, y - 4, 112, 4); f.fillRect(Math.round(x/2)*2 + 40, y + 8, 80, 4);
      }
    }
    f.fillStyle(0x2a2c58, 0.5); f.fillRect(-700, 230, 1400, 400);          // the chasm fades into deep mist
    this.hzG.clear();
    return this.cycle.run(match, lampOut);
  }

  // ---------------------------------------------------------------- the lantern
  // the lantern's body in its own coordinates: (0, 0) is the chain's anchor under the crossbeam,
  // the lantern hangs 33 px below it
  drawLamp(l, flick, hits, chain = true) {
    const S = MPAL, ly = 33;
    if (chain) for (let y = 0; y < ly; y += 4) { l.fillStyle(S.ironLit, 1); l.fillRect(-1, y, 3, 2); l.fillStyle(S.ironDark, 1); l.fillRect(0, y + 2, 1, 2); }
    l.fillStyle(S.glass, 0.08 + 0.04 * flick); pixelDisc(l,0, ly + 12, 34);
    l.fillStyle(S.glass, 0.12 + 0.05 * flick); pixelDisc(l,0, ly + 12, 20);
    l.fillStyle(S.outline, 1); l.fillRect(-9, ly - 2, 18, 30);
    l.fillStyle(S.lanternFrame, 1); l.fillRect(-8, ly - 1, 16, 4); l.fillRect(-8, ly + 23, 16, 4); l.fillRect(-4, ly - 5, 8, 4);
    l.fillStyle(S.glass, 1); l.fillRect(-6, ly + 3, 12, 20);
    l.fillStyle(S.glassHot, 1); l.fillRect(-2, ly + 8 + Math.round(flick * 3), 4, 10 - Math.round(flick * 3));
    // cracks spreading over the glass, one more with every hit
    const CR = [[-5, 5, 1, 4], [3, 6, -1, 5], [-4, 14, 2, 3], [4, 16, -2, 4], [-5, 19, 3, 2], [2, 4, 2, 3], [-3, 9, -1, 4], [5, 11, -2, 3], [0, 18, 2, 3]];
    for (let i = 0; i < Math.min(hits, CR.length); i++) {
      const [x, y, dx, n] = CR[i];
      for (let k = 0; k < n; k++) { l.fillStyle(0xfff0d0, 1); l.fillRect(x + Math.round(dx * k / 2), ly + y + k, 1, 1); }
    }
    l.fillStyle(S.lanternFrame, 1); l.fillRect(-1, ly + 3, 2, 20); l.fillRect(-6, ly + 12, 12, 1);
  }
  // where the lantern's body is right now (world space), for hits
  lampBox() {
    const L = this.lamp, ax = this.lanternG.x, ay = this.lanternG.y;
    const cx = ax + Math.sin(L.ang) * 45, cy = ay + Math.cos(L.ang) * 45;
    return { x1: cx - 10, x2: cx + 10, y1: cy - 16, y2: cy + 16, cx, cy };
  }
  // MatchScene calls this with every attack hitbox each tick
  strikeTargets(match, hbs) {
    const L = this.lamp;
    if (L.state !== 'hung' || !this.hazardsOn) return;
    const b = this.lampBox();
    for (const hb of hbs) {
      if (L.seen.has(hb.id) || !(hb.x1 < b.x2 && hb.x2 > b.x1 && hb.y1 < b.y2 && hb.y2 > b.y1)) continue;
      L.seen.add(hb.id); L.hits++;
      const dir = hb.facing || Math.sign(b.cx - (hb.owner ? hb.owner.x : 0)) || 1;
      L.vel += dir * (0.07 + Math.random() * 0.03);                  // knocked swinging
      sfx('clang', 0.5, 1.3 + L.hits * 0.04); match.puff(b.cx, b.cy, MPAL.glassHot, 4);
      if (L.hits >= 10) {                                           // the chain snaps
        L.state = 'fall'; L.x = b.cx; L.y = b.cy - 12; L.vx = Math.sin(L.ang) * 1.5 + L.vel * 20; L.vy = -1; L.rot = -L.ang; L.t = 0; L.id = (L.id || 0) + 1;
        sfx('shield', 0.9, 0.5); match.shake(4, 8);
      }
    }
    if (L.seen.size > 400) L.seen.clear();
  }
  stepLantern(match, out) {
    const L = this.lamp, S = MPAL, t = this.t, l = this.lanternG, f = this.fireG;
    const flick = (Math.sin(t * 0.7) + Math.sin(t * 1.9 + 1)) * 0.25;
    l.clear(); f.clear();
    if (L.state === 'hung' || L.state === 'lower') {
      // a pendulum: knocked by hits, settling back to a gentle idle sway
      L.vel += -Math.sin(L.ang) * 0.018 + Math.sin(t * 0.03) * 0.0004; L.vel *= 0.988; L.ang += L.vel;
      l.setRotation(-L.ang);
      if (L.state === 'lower') {                                      // a new lantern let down on its chain
        L.drop = Math.min(1, L.drop + 0.012);
        l.setScale(1, 1); l.y = this.platforms[3].y + 7 - (1 - L.drop) * 40;
        if (L.drop >= 1) { L.state = 'hung'; l.y = this.platforms[3].y + 7; }
      }
      this.drawLamp(l, flick, L.hits);
      return;
    }
    l.setRotation(0);
    // the snapped chain end, still hanging from the crossbeam
    for (let y = 0; y < 14; y += 4) { l.fillStyle(S.ironLit, 1); l.fillRect(-1, y, 3, 2); }
    if (L.state === 'fall') {                                        // falling, tumbling, hurting anyone underneath
      L.t++; L.vy += 0.4; L.x += L.vx; L.y += L.vy; L.rot += L.vx * 0.04;
      f.save(); f.translateCanvas(L.x, L.y); f.rotateCanvas(L.rot); this.drawLamp(f, flick, 9, false); f.restore();
      out.push({ x1: L.x - 10, x2: L.x + 10, y1: L.y + 20, y2: L.y + 62, dmg: 8, angle: 70, base: 3.6, growth: 3.8, id: 'lampfall' + L.id, hazard: true });
      if (L.y + 60 >= 0 || L.t > 120) {                            // shatters on the deck
        L.state = 'fire'; L.t = 0; L.x = Math.max(-290, Math.min(290, L.x)); L.l = L.x; L.r = L.x;
        sfx('bighit', 1, 0.5); sfx('glitch', 0.5, 0.4); sfx('flame', 1, 0.6); match.shake(10, 12);
        for (let i = 0; i < 24; i++) match.puff(L.x, -6, i % 3 ? S.lava : S.glassHot, 1);
        match.popText({ x: L.x, y: 20 }, 'THE BRIDGE IS BURNING!', '#ff8a3a');
      }
      return;
    }
    if (L.state === 'fire') {                                        // fire across the bridge for 10 s
      L.t++;
      const P = this.platforms[0], spread = 7;
      L.l = Math.max(P.x1, L.l - spread); L.r = Math.min(P.x2, L.r + spread);
      const fade = L.t > 540 ? (600 - L.t) / 60 : 1;
      f.fillStyle(S.lava, 0.12 * fade); f.fillRect(L.l, -40, L.r - L.l, 40);           // heat glow over the deck
      for (let x = L.l; x < L.r; x += 6) {
        const h = (8 + 7 * Math.abs(Math.sin(x * 0.37 + t * 0.31)) + 4 * Math.abs(Math.sin(x * 0.11 - t * 0.17))) * fade;
        f.fillStyle(S.lavaDark, 0.9 * fade); f.fillRect(x, -Math.round(h * 0.4), 6, Math.round(h * 0.4));
        f.fillStyle(S.lava, fade); f.fillRect(x + 1, -Math.round(h * 0.75), 4, Math.round(h * 0.75) - 1);
        f.fillStyle(S.lavaHot, fade); f.fillRect(x + 2, -Math.round(h * 0.5), 2, Math.round(h * 0.5) - 2);
        if ((x + t) % 23 === 0) match.puff(x + 3, -h, (x % 2) ? S.lava : S.lavaHot, 1);       // embers
      }
      if (t % 14 === 0) sfx('flame', 0.25 * fade, 0.5 + Math.random() * 0.3);
      if (fade > 0.3) out.push({ x1: L.l, x2: L.r, y1: -18, y2: 2, dmg: 3, angle: 85, base: 3.2, growth: 1.0, id: 'lampfire' + L.id + ':' + Math.floor(L.t / 40), hazard: true });
      if (L.t >= 600) { L.state = 'gone'; L.t = 0; }
      return;
    }
    if (L.state === 'gone' && ++L.t >= 900) {                        // a fresh lantern is lowered 15 s later
      Object.assign(L, { state: 'lower', hits: 0, ang: 0, vel: 0, drop: 0, t: 0 }); L.seen.clear();
    }
  }

  // ---------------------------------------------------------------- hazards
  // ---- GARGOYLE GAZE: a stone head rises at one end and sweeps an ankle-high eye-beam down the bridge
  start_gaze(match, h) {
    h.side = Math.random() < 0.5 ? -1 : 1;
    h.title = 'GARGOYLE GAZE - JUMP!';
  }
  gargoyleHead(g, x, y, dir, glow) {
    const S = MPAL;
    g.fillStyle(S.outline, 1); g.fillRect(x - 15, y - 14, 30, 30);
    g.fillStyle(S.stoneMid, 1); g.fillRect(x - 13, y - 12, 26, 26);
    g.fillStyle(S.stoneLight, 1); g.fillRect(x - 13, y - 12, 8, 26);
    g.fillStyle(S.stoneDark, 1); g.fillRect(x + dir * 2 - 9, y + 6, 18, 6);                  // jaw
    g.fillStyle(0xe6eaff, 1); for (let k = -2; k <= 2; k++) g.fillRect(x + dir * 2 + k * 4 - 1, y + 6, 2, 3);   // fangs
    this.horn(g, x - 9, y - 12, -1, 16, 1.6, 5); this.horn(g, x + 9, y - 12, 1, 16, 1.6, 5);
    g.fillStyle(S.eye, 0.25 * glow); pixelDisc(g,x + dir * 4, y - 3, 10 + glow * 6);             // eye glow
    for (const ex of [-5, 5]) { g.fillStyle(S.outline, 1); g.fillRect(x + dir * 3 + ex - 3, y - 6, 6, 5); g.fillStyle(glow > 0.9 ? 0xffd0d0 : S.eye, 0.4 + 0.6 * glow); g.fillRect(x + dir * 3 + ex - 2, y - 5, 4, 3); }
  }
  step_gaze(match, h, out) {
    const g = this.hzG, S = MPAL, hx = h.side * 274, dir = -h.side, beamY = -9;
    const rise = h.t < 30 ? h.t / 30 : h.t > 160 ? Math.max(0, 1 - (h.t - 160) / 24) : 1;
    const hy = Math.round(30 - rise * 48);
    if (h.t === 2) sfx('rumble', 0.6, 0.7);
    const glow = Math.min(1, h.t / 88);
    this.gargoyleHead(g, hx, hy, dir, h.t < 140 ? glow : 1 - (h.t - 140) / 20);
    if (h.t > 60 && h.t < 90) for (let i = 0; i < 3; i++) {       // light gathering in its eyes
      const a = h.t * 0.4 + i * 2.1, d = 20 - (h.t - 60) * 0.6;
      g.fillStyle(S.eye, 1); g.fillRect(Math.round(hx + dir * 4 + Math.cos(a) * d), Math.round(hy - 3 + Math.sin(a) * d), 2, 2);
    }
    if (h.t === 90) { sfx('laser', 0.9); match.shake(5, 50); }
    if (h.t >= 90 && h.t < 140) {                               // the beam: shoots out fast, then holds
      const bt = h.t - 90, len = Math.min(640, bt * 26), x0 = hx + dir * 8, x1 = x0 + dir * len;
      const fade = bt > 42 ? (50 - bt) / 8 : 1, wob = (bt % 4 < 2 ? 1 : 0);
      const lo = Math.min(x0, x1), w = Math.abs(x1 - x0);
      g.fillStyle(S.eye, 0.35 * fade); g.fillRect(lo, beamY - 7 - wob, w, 14 + wob * 2);
      g.fillStyle(S.eye, fade); g.fillRect(lo, beamY - 4, w, 8);
      g.fillStyle(0xffd0d0, fade); g.fillRect(lo, beamY - 1, w, 2);
      for (let k = 0; k < 8; k++) { const sx = x0 + dir * ((bt * 9 + k * 83) % Math.max(1, len)); g.fillStyle(0xffffff, fade); g.fillRect(Math.round(sx), beamY - 5 + (k % 3) * 4, 3, 1); }
      if (bt % 3 === 0) match.puff(x1, beamY, S.eye, 2);                          // scorching the stones where it ends
      if (bt % 12 === 0 && bt) sfx('laser', 0.35, 0.7);
      if (bt < 46) out.push({ x1: lo, x2: lo + w, y1: beamY - 6, y2: beamY + 6, dmg: 10, angle: 72, base: 4.6, growth: 4.4, dirX: dir, id: 'gaze' + h.id, hazard: true });
    }
    return h.t > 186;
  }

  // ---- BAT SWARM: bats pour across the sky above the bridge in a wave
  start_bats(match, h) {
    h.side = Math.random() < 0.5 ? -1 : 1;
    h.title = 'BAT SWARM - STAY LOW!';
    h.bats = [];
    for (let i = 0; i < 12; i++) h.bats.push({ x: h.side * (360 + i * 30 + Math.random() * 20), y: -80 - Math.random() * 80, ph: Math.random() * 6, sp: 3 + Math.random() * 0.8, id: i, hit: true });
  }
  bat(g, x, y, flap) {                                          // a chunky bat, rimmed in moonlight so it reads on the night sky
    const S = MPAL, up = flap ? -6 : 3;
    const wing = (c, o) => {
      g.fillStyle(c, 1);
      g.fillRect(x - 4 - o, y - 4 - o, 9 + o * 2, 9 + o * 2);                                  // body
      g.fillRect(x - 15 - o, y + up - o, 11 + o, 4 + o * 2); g.fillRect(x - 9 - o, y + up / 2 - o, 5 + o, 4 + o * 2);   // wings
      g.fillRect(x + 5, y + up - o, 11 + o, 4 + o * 2); g.fillRect(x + 5, y + up / 2 - o, 5 + o, 4 + o * 2);
      g.fillRect(x - 4 - o, y - 8 - o, 2 + o * 2, 4 + o); g.fillRect(x + 3 - o, y - 8 - o, 2 + o * 2, 4 + o);   // ears
    };
    wing(S.streak, 1); wing(S.outline, 0);
    g.fillStyle(S.eye, 1); g.fillRect(x - 2, y - 2, 2, 2); g.fillRect(x + 1, y - 2, 2, 2);
  }
  step_bats(match, h, out) {
    const g = this.hzG, dir = -h.side;
    if (h.t < 90) {                                              // a few scouts flit about the far edge
      if (h.t % 30 === 5) sfx('bats', 0.4);
      for (let i = 0; i < 4; i++) { const a = h.t * 0.12 + i * 1.6; this.bat(g, Math.round(h.side * 262 + Math.cos(a) * 26), Math.round(-120 + Math.sin(a * 1.3) * 22), (h.t >> 2) % 2 === i % 2); }
      return false;
    }
    if (h.t % 18 === 0) sfx('bats', 0.5, 0.9 + Math.random() * 0.3);
    let left = 0;
    for (const b of h.bats) {
      b.x += dir * b.sp;
      const y = Math.round(b.y + Math.sin(h.t * 0.12 + b.ph) * 18), x = Math.round(b.x);
      if (dir * b.x > 420) continue;                             // flown off the far side
      left++;
      this.bat(g, x, y, ((h.t >> 2) + b.id) % 2 === 0);
      out.push({ x1: x - 12, x2: x + 12, y1: y - 7, y2: y + 7, dmg: 3, angle: 65, base: 3, growth: 2.2, dirX: dir, id: 'bat' + h.id + ':' + b.id, hazard: true });
    }
    return left === 0;
  }
}

// Miniature of Gravemoon Bridge drawn into a box (x, y, w, h), for the stage select screen.
export function drawMoonPreview(g, x, y, w, h) {
  // Compose the same scene on a logical 64px grid for stage selection.
  const r=(px,py,pw,ph,c)=>{g.fillStyle(c);g.fillRect(Math.round(x+px*w/64),Math.round(y+py*h/64),Math.ceil(pw*w/64),Math.ceil(ph*h/64));};
  r(0,0,64,64,0x19172d);r(0,32,64,32,0x222039);
  for(let yy=-14;yy<14;yy+=2){const half=Math.floor(Math.sqrt(Math.max(0,196-(yy+1)**2)));r(34-half,19+yy,half*2,2,0xd9dfdf);}
  r(30,11,6,3,0x7c8497);r(38,21,5,3,0xb3becd);
  for(const [tx,ty]of [[6,32],[12,28],[20,34]]){r(tx,ty,5,18,0x232239);r(tx+2,ty+3,1,2,0xba824d);}
  for(const [px,py,pw]of [[10,36,12],[42,36,12],[25,20,14]]){
    r(px+1,py,1,52-py,0x100f23);r(px+pw-2,py,1,52-py,0x100f23);r(px,py,pw,3,0x53566c);r(px,py,pw,1,0xb3becd);
  }
  r(31,23,1,8,0x53566c);r(30,30,4,7,0x100f23);r(31,31,2,5,0xe36b48);
  r(3,50,58,2,0x38384f);r(3,52,58,7,0x53566c);r(3,52,58,1,0xb3becd);r(3,59,58,5,0x232239);
  for(let px=5;px<60;px+=8){r(px,55,1,3,0x232239);r(px,47,1,5,0x53566c);}
}
