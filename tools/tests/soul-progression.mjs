import assert from 'node:assert/strict';
import {SOULS} from '../../src/souls/board.js';
import {awardSoul,ownsSoul} from '../../src/souls/collection.js';
import {soulPower,addSoulXP,applySoulAid} from '../../src/souls/progression.js';
import {soulEncounter} from '../../src/souls/encounters.js';
assert.equal(soulPower('healing-orb'),null);assert.equal(addSoulXP('steve',100),null);
let previous=0;for(const s of SOULS.filter(s=>s.kind==='main').sort((a,b)=>a.stars-b.stars)){const base=soulPower(s.id,0),max=soulPower(s.id,100000);assert.ok(max.max>=previous);previous=max.max;assert.equal(max.level,50);assert.equal(max.power,max.max);assert.ok(max.damage>base.damage);assert.ok(max.taken<base.taken);}
awardSoul('steve');assert.equal(awardSoul('steve'),false);const leveled=addSoulXP('steve',100);assert.equal(leveled.after.level,2);assert.ok(leveled.after.power>leveled.before.power);assert.equal(addSoulXP('steve',-100),null);assert.equal(addSoulXP('healing-orb',100),null);
const f={percent:99,soulTeam:{aids:['healing-orb']}};assert.equal(applySoulAid(f),false);f.percent=100;assert.equal(applySoulAid(f),true);assert.equal(f.percent,90);f.percent=105;assert.equal(applySoulAid(f),false);assert.equal(f.percent,105);f.soulAidUsed=false;assert.equal(applySoulAid(f),true);assert.equal(f.percent,95);
assert.equal(soulEncounter('healing-orb').stars,1);assert.equal(SOULS.find(s=>s.id==='healing-orb').slotCost,1);
console.log('PASS: Main-only progression, tier caps, stronger stats, XP clamps, one-slot Wisp Aid and once-per-stock healing');
