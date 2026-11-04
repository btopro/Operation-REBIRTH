import {resolveSoul} from './evolution.js';
import {SOULS} from './board.js';
const KEY='rebirth.soulCollection';
let earned=[];try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))earned=SOULS.filter(s=>saved.includes(s.id)).map(s=>s.id);}catch{}
export const ownsSoul=id=>earned.includes(id);
export const ownedSouls=()=>SOULS.filter(s=>ownsSoul(s.id)).map(resolveSoul);
// Called only after a completed, victorious Soul Board encounter.
export function awardSoul(id){if(!SOULS.some(s=>s.id===id)||ownsSoul(id))return false;earned.push(id);try{localStorage.setItem(KEY,JSON.stringify(earned));}catch{}return true;}
