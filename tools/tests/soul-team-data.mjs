import assert from 'node:assert/strict';
import {SOULS} from '../../src/souls/board.js';
import {normalizeSoulTeam,soulDamageMultiplier,soulDamageType,setMainSoul,getSoulTeam} from '../../src/souls/team.js';
const aids=Array.from({length:3},(_,i)=>({id:'aid-'+i,name:'Aid '+i,kind:'aid',stars:1})),catalog=[...SOULS,...aids];
const team={main:'bill-cipher',aids:aids.map(a=>a.id)};
assert.deepEqual(normalizeSoulTeam(team,catalog).aids,team.aids);
assert.deepEqual(normalizeSoulTeam({...team,main:'cloud'},catalog).aids,['aid-0','aid-1',null]);
assert.deepEqual(normalizeSoulTeam({...team,main:'steve'},catalog).aids,team.aids);
assert.deepEqual(normalizeSoulTeam({...team,main:null},catalog).aids,[null,null,null]);
assert.deepEqual(normalizeSoulTeam({...team,aids:['aid-0','aid-0','bad']},catalog).aids,['aid-0',null,null]);
const hit=(main,type)=>({owner:{soulTeam:{main},def:{id:'test'},state:'attack'},h:{dmg:20,damageType:type}});
assert.equal(soulDamageMultiplier(hit('bill-cipher','psychic')),1.2);assert.equal(soulDamageMultiplier(hit('cloud','sword')),1.1);
assert.equal(soulDamageMultiplier(hit('bill-cipher','sword')),1);assert.equal(soulDamageMultiplier(hit('cloud','fire')),1);assert.equal(soulDamageMultiplier(hit('steve','sword')),1);
assert.equal(soulDamageType({owner:{def:{id:'young-link'},state:'attack',moveName:'downB'},projectile:{},h:{}}),null);
assert.equal(soulDamageType({owner:{def:{id:'hero-knight'},state:'holding',moveName:'jab'},h:{}}),null);
assert.equal(soulDamageType({owner:{def:{id:'soul-summoner'},state:'attack'},h:{possess:120}}),'psychic');
setMainSoul('bill-cipher');assert.equal(getSoulTeam().main,null);const {awardSoul}=await import('../../src/souls/collection.js');awardSoul('bill-cipher');setMainSoul('bill-cipher');assert.equal(getSoulTeam().main,'bill-cipher');setMainSoul(null);assert.equal(getSoulTeam().main,null);
const shadow={main:'shadow-young-link',aids:aids.map(a=>a.id)};assert.deepEqual(normalizeSoulTeam(shadow,catalog).aids,['aid-0',null,null]);assert.equal(soulDamageMultiplier(hit('shadow-young-link','sword')),1.05);assert.equal(soulDamageMultiplier(hit('shadow-young-link','fire')),1);
console.log('PASS: Main capacity, invalid/duplicate Aid cleanup, saved teams and category-specific damage bonuses');

const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};const {saveSoulPreset,loadSoulPreset,savedSoulTeams}=await import('../../src/souls/team.js');setMainSoul('bill-cipher');assert.equal(saveSoulPreset(0),true);setMainSoul(null);assert.equal(loadSoulPreset(0).main,'bill-cipher');assert.equal(savedSoulTeams().length,3);assert.equal(saveSoulPreset(3),false);assert.equal(loadSoulPreset(2),null);console.log('PASS: saved team slots restore earned loadouts and reject invalid slots');

const {soulShieldMultiplier}=await import('../../src/souls/team.js');const aerial={owner:{def:{id:'hero-knight'},soulTeam:{main:'ember-ronin',aids:['moon-moth','gearling']},state:'attack',moveName:'fair'},h:{damageType:'sword'}};assert.ok(Math.abs(soulDamageMultiplier(aerial)-1.242)<1e-9);assert.equal(soulDamageMultiplier({...aerial,projectile:{}}),1.15);assert.equal(soulDamageMultiplier({...aerial,owner:{...aerial.owner,moveName:'jab'}}),1.15);assert.equal(soulShieldMultiplier(aerial.owner),.85);assert.equal(soulShieldMultiplier({soulTeam:{aids:[]}}),1);console.log('PASS: Ember Ronin sword bonus, Moon Moth aerial-only bonus and Gearling shield protection');
