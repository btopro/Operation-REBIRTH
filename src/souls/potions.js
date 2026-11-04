import {addSoulXP,soulPower} from './progression.js';
import {ownsSoul} from './collection.js';
export const SOUL_POTIONS=[{id:'small',name:'WISP DROPS',xp:100,color:0x69e6bd},{id:'medium',name:'SOUL TONIC',xp:500,color:0x72b9ff},{id:'large',name:'ETERNAL ELIXIR',xp:1500,color:0xe79bff}];
const KEY='rebirth.soulPotions';
function inventory(){let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}const counts={};for(const p of SOUL_POTIONS)counts[p.id]=Math.max(0,Math.min(999999,Math.floor(Number(saved[p.id])||0)));if(!saved.starterGift){for(const p of SOUL_POTIONS)counts[p.id]+=200;persist(counts);}return counts;}
function persist(counts){try{localStorage.setItem(KEY,JSON.stringify({...counts,starterGift:true}));}catch{}}
let counts=inventory();
export const potionInventory=()=>({...counts});
export const useSoulPotion=(id,type)=>useSoulPotions(id,type,1);
export function useSoulPotions(id,type,quantity=1){const potion=SOUL_POTIONS.find(p=>p.id===type),power=soulPower(id);if(!potion||!ownsSoul(id)||!power||power.level>=power.maxLevel||!Number.isInteger(quantity)||quantity<1||quantity>counts[type])return null;const needed=Math.ceil(((power.maxLevel-1)*100-power.xp)/potion.xp);if(quantity>needed)return null;const result=addSoulXP(id,potion.xp*quantity);if(!result?.gained)return null;counts[type]-=quantity;persist(counts);return {...result,potion,quantity};}
