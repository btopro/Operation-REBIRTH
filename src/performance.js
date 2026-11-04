import {settings} from './settings.js';
export function detectPhone(env=globalThis){
 const nav=env.navigator||{};
 return /Android|iPhone|iPad|iPod/i.test(nav.userAgent||'')||((nav.maxTouchPoints||0)>0&&!!env.matchMedia?.('(pointer: coarse)').matches);
}
export const PHONE_DEVICE=detectPhone();
export const lowEffects=()=>settings.performance==='low'||(settings.performance!=='full'&&PHONE_DEVICE);
export const particleBudget=()=>lowEffects()?120:600;
