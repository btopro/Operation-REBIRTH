import assert from 'node:assert/strict';
import {SOULS} from '../../src/souls/board.js';
import {awardSoul} from '../../src/souls/collection.js';
import {addSoulXP,evolveSoul,evolutionStatus} from '../../src/souls/progression.js';
import {soulDamageMultiplier,soulJumpMultiplier} from '../../src/souls/team.js';
const ids=['brass-marshal','boiler-beetle','chrono-owl'],newSouls=SOULS.filter(s=>ids.includes(s.id));assert.equal(newSouls.length,3);assert.equal(newSouls.filter(s=>s.evolution).length,1);
newSouls.forEach(s=>awardSoul(s.id));for(const id of ['boiler-beetle','chrono-owl']){assert.equal(evolutionStatus(id).eligible,false);assert.equal(evolveSoul(id),null);}
const owner={def:{id:'soul-summoner'},state:'attack',moveName:'neutralB',percent:99,soulTeam:{main:'brass-marshal',aids:['boiler-beetle','chrono-owl']}},shot={owner,h:{dmg:20},projectile:{}};assert.ok(Math.abs(soulDamageMultiplier(shot)-1.166)<1e-9);assert.equal(soulDamageMultiplier({...shot,projectile:null}),1);assert.equal(soulJumpMultiplier(owner),1.06);
addSoulXP('brass-marshal',1900);const result=evolveSoul('brass-marshal');assert.equal(result.afterSoul.name,'Aether Marshal');assert.equal(result.afterSoul.stars,5);assert.equal(result.after.level,25);assert.ok(result.after.power>result.before.power);assert.notEqual(result.afterSoul.portrait,result.beforeSoul.portrait);
assert.ok(Math.abs(soulDamageMultiplier(shot)-1.272)<1e-9);owner.percent=100;assert.ok(Math.abs(soulDamageMultiplier(shot)-1.3992)<1e-9);assert.equal(soulDamageMultiplier({...shot,projectile:null}),1.1);assert.equal(evolveSoul('brass-marshal'),null);
console.log('PASS: three steampunk souls, one Main evolution, projectile-only boosts, jump strength and evolved Overpressure');
