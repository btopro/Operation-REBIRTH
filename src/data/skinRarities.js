// Cosmetic quality tiers; item prices, ownership and capsule pools remain independent.
export const SKIN_RARITIES={
 common:{rank:0,label:'COMMON',color:0xb9c4ce,css:'#b9c4ce'},
 rare:{rank:1,label:'RARE',color:0x69b8ff,css:'#69b8ff'},
 epic:{rank:2,label:'EPIC',color:0xc18bff,css:'#c18bff'},
 legendary:{rank:3,label:'LEGENDARY',color:0xffcf70,css:'#ffcf70'},
 miracle:{rank:4,label:'MIRACLE',color:0xa8f7e8,css:'#a8f7e8'},
};
export function rarityFor(item){return item?.kind==='costume'?(SKIN_RARITIES[item.rarity]||SKIN_RARITIES.common):null;}
