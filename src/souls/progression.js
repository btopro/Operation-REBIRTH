import {resolveSoul,isSoulEvolved,evolutionXPFloor,recordSoulEvolution} from './evolution.js';
import {SOULS} from './board.js';
import {ownsSoul} from './collection.js';
const KEY='rebirth.soulLevels',MAX_LEVEL=50,XP_PER_LEVEL=100;
let xp={};try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');if(s&&typeof s==='object'&&!Array.isArray(s))xp=s;}catch{}
// Retain earned levels when Static Imp's retired evolution forms are removed.
try{const records=JSON.parse(localStorage.getItem('rebirth.soulEvolutions')||'{}'),record=records['static-imp'];if(record){const retained=Math.min(4900,Math.max(Number(xp['static-imp'])||0,Number(record.xpFloor)||0));xp['static-imp']=retained;localStorage.setItem(KEY,JSON.stringify(xp));delete records['static-imp'];localStorage.setItem('rebirth.soulEvolutions',JSON.stringify(records));}}catch{}
function powerStats(soul,total){
 const maxLevel=soul.evolved?50+10*(soul.evolutionStage||1):MAX_LEVEL,stars=soul.stars,bounded=Math.max(0,Math.min((maxLevel-1)*XP_PER_LEVEL,Math.floor(total))),level=1+Math.floor(bounded/XP_PER_LEVEL),base=[400,800,1400,2200,3200][stars-1],max=[1500,3000,5000,7500,10000][stars-1],power=Math.round(base+(max-base)*(level-1)/(maxLevel-1));
 return {level,maxLevel,xp:bounded,intoLevel:bounded%XP_PER_LEVEL,nextLevel:level<maxLevel?XP_PER_LEVEL:null,power,max,damage:1+power/20000,taken:1/(1+power/25000)};
}
export function soulPower(id,experience){const soul=resolveSoul(SOULS.find(s=>s.id===id&&s.kind==='main'));if(!soul)return null;return powerStats(soul,Number.isFinite(experience)?experience:Math.max(Number(xp[id])||0,evolutionXPFloor(id)));}
export function addSoulXP(id,amount){if(!ownsSoul(id)||!Number.isFinite(amount)||amount<=0)return null;const before=soulPower(id);if(!before)return null;xp[id]=Math.min((before.maxLevel-1)*XP_PER_LEVEL,before.xp+Math.floor(amount));try{localStorage.setItem(KEY,JSON.stringify(xp));}catch{}return {before,after:soulPower(id),gained:xp[id]-before.xp};}
export function applySoulAid(fighter){
 const main=resolveSoul(SOULS.find(s=>s.id===fighter.soulTeam?.main)),has=effect=>fighter.soulTeam?.aids?.some(id=>SOULS.some(s=>s.id===id&&s.effect===effect));
 let amount=0;
 // Check both thresholds before healing so simultaneous effects can stack.
 if(!fighter.soulAidUsed&&fighter.percent>=100){const heal=(has('heal100')?10:0)+(['phoenixHeart','inkRenewal'].includes(main?.passive)?15:0);if(heal){amount+=heal;fighter.soulAidUsed=true;}}
 if(!fighter.sugarAidUsed&&fighter.percent>=120&&has('heal12012')){amount+=12;fighter.sugarAidUsed=true;}
 if(!amount)return false;fighter.soulHealAmount=amount;fighter.percent=Math.max(0,fighter.percent-amount);return true;
}
export function portraitTexture(soul){return soul?.portraitTexture||'soul_portraits';}
export function soulBenefits(soul){if(!soul)return '';return soul.description+(soul.kind==='main'?'\n'+soul.aidSlots+' Aid slots':'\n'+(soul.slotCost||1)+' Aid slot');}

export function evolutionStatus(id){const soul=resolveSoul(SOULS.find(s=>s.id===id)),p=soulPower(id),eligible=!!soul&&soul.kind==='main'&&!!soul.evolution,levelNeeded=soul?.evolutionStage?40:20;return {eligible,ready:eligible&&ownsSoul(id)&&!!p&&p.level>=levelNeeded,evolved:isSoulEvolved(id),levelNeeded};}
export function evolutionPreview(id){const soul=resolveSoul(SOULS.find(s=>s.id===id));if(!soul||soul.kind!=='main'||!soul.evolution)return null;const before=soulPower(id),afterSoul={...soul,...soul.evolution,evolution:soul.evolution.evolution||null,evolved:true,evolutionStage:(soul.evolutionStage||0)+1};return {beforeSoul:soul,afterSoul,before,after:powerStats(afterSoul,before.xp+500)};}
export function evolveSoul(id){if(!evolutionStatus(id).ready)return null;const result=evolutionPreview(id);if(!recordSoulEvolution(id,result.after.xp))return null;return {...result,afterSoul:resolveSoul(SOULS.find(s=>s.id===id)),after:soulPower(id)};}
