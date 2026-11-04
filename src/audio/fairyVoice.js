import {CHARACTER_SPEECH} from './speechPolicy.js';
import { settings } from '../settings.js';
export const FAIRY_LINES = [ { key:'hey',text:'Hey!' }, { key:'look',text:'Look!' }, { key:'listen',text:'Listen!' } ];
export function loadFairyVoice(load) {
  if(!CHARACTER_SPEECH)return;
  for(const {key}of FAIRY_LINES)load.audio('fairy_'+key,['assets/audio/fairy/'+key+'.ogg','assets/audio/fairy/'+key+'.mp3']);
}
export function playFairyVoice(scene,key) {
  if(!CHARACTER_SPEECH)return false;
  if(scene.demo||settings.sfxVolume<=0||!scene.cache.audio.exists('fairy_'+key))return false;
  const now=scene.frame||0;
  if(now<(scene.fairyVoiceUntil||0))return false;
  scene.fairyVoiceUntil=now+120;
  scene.sound.play('fairy_'+key,{volume:Math.min(1,settings.sfxVolume*.65)});
  return true;
}
