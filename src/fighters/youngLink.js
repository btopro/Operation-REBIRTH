import {HERO_KNIGHT} from './heroKnight.js';
import { DEFAULT_GRAB, PAL_BLUE } from './common.js';
import { YOUNG_LINK_ANIMS } from './youngLinkAnims.js';
const strike=(frames,from,to,box,dmg,angle=40,growth=5)=>({frames,hits:[{from,to,box,dmg,angle,base:3,growth}]});
export const YOUNG_LINK={
 id:'young-link',name:'YOUNG LINK',
 sheets:Object.fromEntries(['idle','walk','run','jump','fall','moves'].map(k=>[k,'yl_'+k])),
 originX:.5,originY:112/128,movesOrigin:[.5,112/128],frameCounts:{idle:32},runCycle:[0,8],
 moveAnims:YOUNG_LINK_ANIMS,handOffset:{x:12,y:-27},portrait:[66,62,28,30],
 fxColor:0xb4e8ff,pal:PAL_BLUE,swingSfx:'shing',body:{w:18,h:39},headTop:43,tagY:54,
 weight:.92,walkSpeed:3.5,runAccel:.62,groundFriction:.5,airSpeed:2.9,airAccel:.26,airFriction:.035,
 jumpV:-10.4,shortHopV:-6.6,doubleJumpV:-9.6,
 taunt:{name:'KOKIRI COURAGE',frames:108,lines:['READY!'],sounds:[[12,'shing',.4,1.2]]},
 moves:{...DEFAULT_GRAB,
 jab:{frames:30,multi:true,hits:[{from:3,to:6,box:[5,-32,39,28],dmg:3,angle:40,base:2,growth:1},{from:18,to:23,box:[4,-54,51,50],dmg:5,angle:45,base:3,growth:4}]},
 ftilt:strike(28,8,17,[4,-32,53,22],8),utilt:strike(32,7,22,[-20,-72,63,64],8,88),
 dtilt:strike(24,5,16,[3,-17,51,18],6,28,3),
 dashAttack:{...strike(26,5,16,[3,-31,50,25],8,55),slide:{from:3,to:15,vx:5.2,dust:0x99b979}},
 fsmash:strike(42,12,30,[2,-55,65,54],15,38,7),usmash:strike(44,11,30,[-25,-78,70,72],14,88,7),
 dsmash:strike(38,10,27,[-50,-27,100,27],13,30,6),
 nair:{...strike(32,5,23,[-38,-34,76,34],8,45),landLag:8},
 fair:{...strike(30,7,23,[2,-40,58,39],10,40),landLag:10},
 bair:{...strike(30,7,23,[-58,-40,58,39],10,140),landLag:10},
 uair:{...strike(32,9,23,[-20,-78,63,67],10,85),landLag:9},
 dair:{...strike(36,9,25,[-15,-14,30,33],12,-80),landLag:15},
 grab:{frames:42,grab:true,grabAir:true,hookshot:true,hits:[{from:9,to:29,box:[26,-33,12,12]}]},
 neutralB:{frames:42,grab:true,grabAir:true,hookshot:true,hits:[{from:9,to:29,box:[26,-33,12,12]}]},
 sideB:{...strike(32,10,21,[5,-31,55,24],10,38)},
 upb:{frames:40,riseAt:6,riseV:-12.8,drift:3.2,hits:[{from:7,to:13,box:[-42,-35,84,40],dmg:3,angle:88,base:1.4,growth:0,stun:14,pull:true,juggle:true},{from:17,to:22,box:[-42,-35,84,40],dmg:3,angle:88,base:1.4,growth:0,stun:14,pull:true,juggle:true},{from:26,to:31,box:[-46,-39,92,44],dmg:5,angle:55,base:3.6,growth:5}]},
 downB:{frames:42,spawnAt:22,bomb:true},
 },
 limit:{...HERO_KNIGHT.limit,name:'TRIFORCE SLASH',triforce:true,triangle:true,reach:480,launchAt:40,triangleSpeed:12,triangleLife:40,cuts:20,cutEvery:4,final:{dmg:15,angle:40,base:6.5,growth:7},colors:{outline:0x614016,deep:0xb8781d,mid:0xf5bd39,light:0xffe889,core:0xfffcdf}},
};
