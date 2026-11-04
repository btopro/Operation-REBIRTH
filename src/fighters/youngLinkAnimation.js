// Native frames have authored exposure times. Sample simulation time, never render-call count.
import {YOUNG_LINK_TIMELINES as CLIPS,YOUNG_LINK_ANIMS as ANIMS} from './youngLinkAnims.js';
export function youngLinkClip(name,t=0){
 const frames=CLIPS[name];
 if(!frames)return null;
 const tick=Math.max(0,Math.floor(t));
 return frames[ANIMS[name][3]?tick%frames.length:Math.min(tick,frames.length-1)];
}
export function youngLinkPose(f){
 const s=f.state,S=f.sheets,t=f.t;
 let name=s==='attack'?(f.moveName==='throw'?'throw_'+f.throwDir:f.moveName):s==='dizzy'?'hitstun':s==='seized'?'grabbed':s;
 let tick=t;
 if(s==='ylrushcharge')return {sheet:S.moves,frame:youngLinkClip('sideB',3)};
 if(s==='yltether')return {sheet:S.moves,frame:youngLinkClip('grab',32)};
 if(s==='attack'&&f.moveName==='sideB'&&f.move?.rush){const r=f.move.rush;tick=t<r.from?t:t<=r.to?9+(t-r.from)%8:24+(t-r.to);}
 if(s==='holding'&&f.hookPullFrom&&t<10)return {sheet:S.moves,frame:youngLinkClip('grab',Math.min(37,30+t*.8))};
 if(s==='holding'&&f.pummelCd>0){name='pummel';tick=12-f.pummelCd;}
 if(s==='limit'&&f.ult){
  const U=f.ult;let at=3;
  if(f.def.limit.triangle&&U.phase==='flight')return {sheet:S.moves,frame:youngLinkClip('ftilt',14)};
  if(U.phase==='slash')at=16+Math.max(0,t-f.def.limit.slashFrom);
  else if(U.phase==='cutscene'&&!U.charge) return {sheet:S.moves,frame:youngLinkClip('ftilt',5+((U.ct||0)%f.def.limit.cutEvery)*5)};
  else if(U.phase==='whiff')at=36;
  return {sheet:S.moves,frame:youngLinkClip('fsmash',at)};
 }
 const frame=youngLinkClip(name,tick);
 if(frame!==null)return {sheet:S.moves,frame};
 if(s==='run'){
  const clock=f.youngLinkStride||(f.youngLinkStride={age:f.age,phase:0});
  const elapsed=Math.max(0,Math.min(4,f.age-clock.age));clock.age=f.age;
  clock.phase=(clock.phase+elapsed*Math.abs(f.vx)/120)%1;
  const walk=Math.abs(f.vx)<1.8;
  return {sheet:walk?S.walk:S.run,frame:Math.floor(clock.phase*(walk?6:8))};
 }
 if(f.youngLinkStride)f.youngLinkStride.age=f.age;
 if(['air','helpless'].includes(s)){
  // One ascent and descent, with the apex held; no repeating takeoff or midair somersaults.
  const rising=f.vy<0,progress=rising?1-Math.min(1,Math.abs(f.vy)/Math.abs(f.def.jumpV)):Math.min(1,f.vy/7);
  return {sheet:rising?S.jump:S.fall,frame:Math.min(3,Math.floor(progress*4))};
 }
 return {sheet:S.idle,frame:Math.floor(t/6)%32};
}
