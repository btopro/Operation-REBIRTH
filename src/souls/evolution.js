import {SOULS} from './board.js';
const KEY='rebirth.soulEvolutions';
let records={};try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))records=saved;}catch{}
// Retired forms must not return when another soul's evolution is saved.
for(const id of Object.keys(records))if(!SOULS.some(s=>s.id===id&&s.kind==='main'&&s.evolution))delete records[id];
export function soulEvolutionStage(id){const base=SOULS.find(s=>s.id===id&&s.kind==='main');if(!base?.evolution||!records[id])return 0;let node=base,count=0;while(node.evolution){count++;node=node.evolution;}return Math.min(count,Math.max(1,Math.floor(Number(records[id].stage)||1)));}
export const isSoulEvolved=id=>soulEvolutionStage(id)>0;
export const evolutionXPFloor=id=>isSoulEvolved(id)?Math.max(0,Math.min(6900,Number(records[id]?.xpFloor)||0)):0;
export function resolveSoul(soul){if(!soul||soul.evolutionStage!==undefined)return soul;const stage=soulEvolutionStage(soul.id);let resolved=soul;for(let i=0;i<stage;i++)resolved={...resolved,...resolved.evolution,evolution:resolved.evolution.evolution||null};return stage?{...resolved,evolved:true,evolutionStage:stage}:soul;}
export function recordSoulEvolution(id,xpFloor){const base=SOULS.find(s=>s.id===id),soul=resolveSoul(base);if(!soul||soul.kind!=='main'||!soul.evolution)return false;records[id]={stage:soulEvolutionStage(id)+1,xpFloor:Math.max(0,Math.min(6900,xpFloor))};try{localStorage.setItem(KEY,JSON.stringify(records));}catch{}return true;}
