import { VIEW_W, FONT } from '../config.js';
import { CHALLENGES, CHALLENGE_REWARD, challengeProgress } from '../challenges.js';
import { ROSTER, showFighter } from '../fighters/roster.js';
import { settings } from '../settings.js';
import { MenuInput } from './menuInput.js';
import { playMusic } from '../audio/music.js';
import { sfx } from '../audio/sfx.js';
import { makeButton } from '../ui/button.js';
import { ArcadeBg, titleBanner, hintBar, panel, ARC } from '../ui/arcade.js';

export class ChallengesScene extends Phaser.Scene {
  constructor() { super('Challenges'); }
  create() {
    this.t = 0; this.index = 0; this.menu = new MenuInput(this);
    this.bgFx = new ArcadeBg(this, ARC.sections.other);
    playMusic(this, 'bgm_title');
    titleBanner(this, 'CHARACTER CHALLENGES', ARC.sections.other, { crumb: 'OTHER  >  CHARACTER CHALLENGES' });
    const g = this.add.graphics();
    panel(g, 16, 58, 154, 262, ARC.sections.other);
    panel(g, 182, 58, 442, 262, ARC.sections.other);
    this.hero = this.add.sprite(92, 218, 'ss_idle', 0).setScale(1.6);
    this.nameT = this.add.text(92, 78, '', { fontFamily: FONT, fontSize: '7px', color: '#ffffff' }).setOrigin(0.5);
    this.countT = this.add.text(92, 246, '', { fontFamily: FONT, fontSize: '7px', color: '#ffd34f', align: 'center', lineSpacing: 8 }).setOrigin(0.5);
    this.cards = [0, 1, 2].map((i) => this.add.text(198, 76 + i * 70, '', { fontFamily: FONT, fontSize: '6px', color: '#e8e4f4', lineSpacing: 6 }));
    this.bars = this.add.graphics();
    makeButton(this, 28, 282, '<', () => this.pick(-1));
    makeButton(this, 130, 282, '>', () => this.pick(1));
    makeButton(this, 404, 288, 'PRACTISE THIS FIGHTER', () => this.practise(), { originX: 0.5, size: '7px' });
    makeButton(this, 8, 6, '< BACK', () => this.scene.start('Other'));
    hintBar(this, 'LEFT/RIGHT FIGHTER   ENTER / A PRACTISE   ESC / B BACK', ARC.sections.other);
    this.refresh();
  }
  pick(d) { this.index = (this.index + d + ROSTER.length) % ROSTER.length; sfx('menu', 0.4); this.refresh(); }
  refresh() {
    const r = ROSTER[this.index], list = CHALLENGES.filter((c) => c.fighter === r.id);
    this.nameT.setText(r.name);
    this.countT.setText(list.filter((c) => challengeProgress(c) >= c.goal).length + '/3 COMPLETE\n+' + CHALLENGE_REWARD + ' COINS EACH');
    this.bars.clear();
    list.forEach((c, i) => {
      const n = challengeProgress(c), done = n >= c.goal, y = 76 + i * 70;
      this.cards[i].setText((done ? 'DONE  ' : '') + c.name + '  ' + n + '/' + c.goal + '\n' + c.tip).setColor(done ? '#7aff8a' : '#e8e4f4');
      this.bars.fillStyle(0x191526); this.bars.fillRect(198, y + 48, 406, 4);
      this.bars.fillStyle(done ? 0x7aff8a : ARC.gold); this.bars.fillRect(198, y + 48, Math.floor(406 * n / c.goal), 4);
    });
  }
  practise() {
    // One human and a standing dummy: a lesson is one click away.
    Object.assign(settings, { mode: 'training', dummy: 'stand', cpuCount: 1, extraPads: [],
      picks: [ROSTER[this.index].id, 'soul-summoner'], skins: [0, 0], stage: 'sky-sanctum', from: 'Challenges' });
    sfx('go', 0.6); this.scene.start('Match');
  }
  update() {
    this.t++; this.bgFx.update(this.t);
    showFighter(this.hero, ROSTER[this.index].def, Math.floor(this.t / 6)).setScale(1.6);
    const m = this.menu.poll();
    if (m.left) this.pick(-1); if (m.right) this.pick(1);
    if (m.back || m.pads.some((p) => p.button === 'b')) return this.scene.start('Other');
    if (m.ok || m.pads.some((p) => p.button === 'a')) this.practise();
  }
}
