import assert from 'node:assert/strict';
import {YOUNG_LINK_TIMELINES as clips} from '../../src/fighters/youngLinkAnims.js';
import {YOUNG_LINK} from '../../src/fighters/youngLink.js';
import {youngLinkPose,youngLinkClip} from '../../src/fighters/youngLinkAnimation.js';
const f={def:YOUNG_LINK,sheets:YOUNG_LINK.sheets,age:0,t:0,vx:0,vy:0,state:'idle'};
for(const [name,frames] of Object.entries(clips)){
 assert.ok(frames.every(i=>Number.isInteger(i)&&i>=0&&i<166),name);
 if(YOUNG_LINK.moves[name]&&name!=='throws')assert.equal(frames.length,YOUNG_LINK.moves[name].frames,name+' must fit gameplay timing');
}
for(const name of ['jab','ftilt','utilt','dtilt','dashAttack','fsmash','usmash','dsmash','fair','bair','uair','dair','neutralB','sideB','downB']){
 const frames=clips[name];assert.equal(frames.at(-1),4,name+' must recover to ready');
}
f.state='holding';f.hookPullFrom={x:100,y:0};f.t=4;assert.equal(youngLinkPose(f).frame,youngLinkClip('grab',33),'keep the hookshot equipped while pulling');f.hookPullFrom=null;
f.state='hitstun';f.t=500;assert.equal(youngLinkPose(f).frame,clips.hitstun.at(-1));
assert.equal(new Set(clips.shield).size,1);assert.equal(new Set(clips.holding).size,1);
f.state='air';let last=-1;
for(let vy=-10.4;vy<0;vy+=.2){f.vy=vy;const p=youngLinkPose(f);assert.equal(p.sheet,'yl_jump');assert.ok(p.frame>=last);last=p.frame;}
last=-1;for(let vy=0;vy<15;vy+=.2){f.vy=vy;const p=youngLinkPose(f);assert.equal(p.sheet,'yl_fall');assert.ok(p.frame>=last);last=p.frame;}
f.state='run';f.vx=3.5;f.age=100;youngLinkPose(f);f.age=101;const pose=youngLinkPose(f);for(let i=0;i<100;i++)assert.deepEqual(youngLinkPose(f),pose,'rendering twice must not advance animation');
f.vx=1;youngLinkPose(f);const phase=f.youngLinkStride.phase;f.vx=3;youngLinkPose(f);assert.equal(f.youngLinkStride.phase,phase,'changing speed must preserve stride phase');
for(const name of ['hitstun','victory','taunt','grab'])assert.equal(youngLinkClip(name,999),clips[name].at(-1),'one-shot clips must hold their last pose');
f.state='run';f.vx=3.5;f.youngLinkStride={age:0,phase:0};let wraps=0,previous=0;for(let i=1;i<=60;i++){f.age=i;youngLinkPose(f);if(f.youngLinkStride.phase<previous)wraps++;previous=f.youngLinkStride.phase;}assert.ok(wraps>=1&&wraps<=2,'run cycle should read clearly at full speed');
console.log('PASS: 39 timed clips, complete recoveries, stable held poses, one-shot flight, and render-independent stride');
