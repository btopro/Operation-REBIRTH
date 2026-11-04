import {resolveSoul} from './evolution.js';
import {SOULS} from './board.js';
import {ownedSouls} from './collection.js';
const KEY='rebirth.soulTeam';
export function normalizeSoulTeam(team={},catalog=SOULS){
 const main=resolveSoul(catalog.find(s=>s.id===team.main&&s.kind==='main'));
 const aids=Array(3).fill(null),seen=new Set();
 if(main)for(let i=0;i<Math.min(3,main.aidSlots||0);i++){const aid=catalog.find(s=>s.id===team.aids?.[i]&&s.kind==='aid');if(aid&&!seen.has(aid.id)){aids[i]=aid.id;seen.add(aid.id);}}
 return {main:main?.id||null,aids};
}
let current={main:null,aids:[null,null,null]};
try{current=normalizeSoulTeam(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch{}
export function getSoulTeam(){return normalizeSoulTeam(current,ownedSouls());}
export function saveSoulTeam(team){current=normalizeSoulTeam(team,ownedSouls());try{localStorage.setItem(KEY,JSON.stringify(current));}catch{}return getSoulTeam();}
export function setMainSoul(id){return saveSoulTeam({...getSoulTeam(),main:id});}
export function setAidSoul(slot,id){const t=getSoulTeam();const capacity=mainSoul(t)?.aidSlots||0;if(slot<0||slot>=capacity)return t;t.aids=t.aids.map(x=>x===id?null:x);t.aids[slot]=id;return saveSoulTeam(t);}
export const mainSoul=team=>resolveSoul(SOULS.find(s=>s.id===team?.main&&s.kind==='main'))||null;
const SWORD_MOVES=new Set(['jab','ftilt','utilt','dtilt','dashAttack','fsmash','usmash','dsmash','nair','fair','bair','uair','dair','sideB','neutralB']);
export function soulDamageType(hb){
 if(hb.h?.damageType)return hb.h.damageType;
 if(hb.projectile?.soulDamageType)return hb.projectile.soulDamageType;
 if(hb.h?.possess||hb.h?.curse)return 'psychic';
 const o=hb.owner;if(!o)return null;
 if(hb.pillar&&o.def.limit?.type==='blade')return 'sword';
 if(!['hero-knight','young-link'].includes(o.def.id)||hb.projectile||hb.soul||hb.grab)return null;
 if(o.swordOut)return null;
 if(['upb','counterstrike','ledgeattack'].includes(o.state))return 'sword';
 if(o.state==='attack'&&SWORD_MOVES.has(o.moveName)&&!o.move?.hookshot)return 'sword';
 return null;
}
export const hasSoulAid=(fighter,effect)=>fighter?.soulTeam?.aids?.some(id=>SOULS.some(s=>s.id===id&&s.kind==='aid'&&s.effect===effect))||false;
export const soulShieldMultiplier=fighter=>(hasSoulAid(fighter,'shield15')?0.85:1)*(mainSoul(fighter?.soulTeam)?.passive==='lionGuard20'?0.8:1);
export const soulJumpMultiplier=fighter=>hasSoulAid(fighter,'jump6')?1.06:1;
export const soulShieldRegenMultiplier=fighter=>(hasSoulAid(fighter,'shieldRegen20')?1.2:1)*(mainSoul(fighter?.soulTeam)?.passive==='runeWard30'?1.3:1);
export const soulShieldDrainMultiplier=fighter=>hasSoulAid(fighter,'shieldDrain20')?0.8:1;
export const soulIncomingMultiplier=(fighter,hb)=>(mainSoul(fighter?.soulTeam)?.passive==='shadowVeil'?0.94:1)*(hb.projectile?(hasSoulAid(fighter,'projectileGuard8')?0.92:1)*(mainSoul(fighter?.soulTeam)?.passive==='stormMantle'?0.9:1)*(mainSoul(fighter?.soulTeam)?.passive==='frostArmor'?0.85:1):1);
export const isSoulAerial=hb=>!hb.projectile&&!hb.grab&&hb.owner?.state==='attack'&&['nair','fair','bair','uair','dair'].includes(hb.owner.moveName);
export function soulDamageMultiplier(hb){const main=mainSoul(hb.owner?.soulTeam),bonus=main?.bonus,aerial=isSoulAerial(hb),type=soulDamageType(hb),o=hb.owner;let mult=bonus&&(bonus.type==='ground'?o?.grounded&&!aerial&&!hb.projectile&&!hb.grab&&o?.state==='attack':bonus.type==='aerial'?aerial:bonus.type==='projectile'?!!hb.projectile&&!hb.grab:type===bonus.type)?1+bonus.percent/100:1;if(['overpressure','inferno'].includes(main?.passive)&&o?.percent>=100)mult*=1.1;if(main?.passive==='carnageFrenzy'&&o?.percent>=100)mult*=1.12;if(hasSoulAid(o,'projectile6')&&hb.projectile&&!hb.grab)mult*=1.06;if(hasSoulAid(o,'aerial8')&&aerial)mult*=1.08;if(hasSoulAid(o,'ground6')&&o?.grounded&&!aerial&&!hb.projectile&&!hb.grab&&o?.state==='attack')mult*=1.06;if(hasSoulAid(o,'psychic8')&&type==='psychic')mult*=1.08;return mult;}


const PRESETS_KEY='rebirth.soulPresets';
export function savedSoulTeams(){let presets=[];try{const value=JSON.parse(localStorage.getItem(PRESETS_KEY)||'[]');if(Array.isArray(value))presets=value;}catch{}return Array.from({length:3},(_,i)=>presets[i]?normalizeSoulTeam(presets[i],ownedSouls()):null);}
export function saveSoulPreset(slot){if(!Number.isInteger(slot)||slot<0||slot>2)return false;const presets=savedSoulTeams();presets[slot]=getSoulTeam();try{localStorage.setItem(PRESETS_KEY,JSON.stringify(presets));}catch{return false;}return true;}
export function loadSoulPreset(slot){const presets=savedSoulTeams();if(!Number.isInteger(slot)||!presets[slot])return null;return saveSoulTeam(presets[slot]);}
