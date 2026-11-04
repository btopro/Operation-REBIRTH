// Small, permanent lessons for the main roster. CPU actions and title demos never count.
import { addCoins } from './progress.js';
export const CHALLENGES = [
  { id: 'ss-souls', fighter: 'soul-summoner', name: 'CALL THE FALLEN', event: 'summon', goal: 3, tip: 'Summon 3 souls with DOWN + SPECIAL.\nSouls fight beside you; only successful summons count.' },
  { id: 'ss-hits', fighter: 'soul-summoner', name: 'BLUE FLAME', event: 'hit', goal: 10, tip: 'Land 10 unblocked hits. Mix attacks\nwith fireballs and your summoned allies.' },
  { id: 'ss-limit', fighter: 'soul-summoner', name: 'CALL THE LEGION', event: 'limit', goal: 1, tip: 'Use MARCH OF THE FALLEN from the ground.\nFill LIMIT, then press O / LB + RB.' },
  { id: 'mw-pools', fighter: 'mr-wake', name: 'DARK FOOTING', event: 'pool', goal: 3, tip: 'Create 3 Shadow Pools with DOWN + SPECIAL.\nPlace them where rivals want to land.' },
  { id: 'mw-hits', fighter: 'mr-wake', name: 'SHALL WE DANCE?', event: 'hit', goal: 10, tip: 'Land 10 unblocked hits. Use the staff\nto cover space and magic to pressure rivals.' },
  { id: 'mw-limit', fighter: 'mr-wake', name: 'INTO THE DEEP', event: 'limit', goal: 1, tip: 'Use THE UNDERTOW once. Take damage\nto fill LIMIT, then press O / LB + RB.' },
  { id: 'hk-reflect', fighter: 'hero-knight', name: 'RETURN TO SENDER', event: 'reflect', goal: 1, tip: 'Bat back one enemy projectile with\nGrand Slam: hold neutral SPECIAL, then release.' },
  { id: 'hk-hits', fighter: 'hero-knight', name: 'BLADE PRACTICE', event: 'hit', goal: 10, tip: 'Land 10 unblocked hits. Try directional\nsword attacks and aerials as well as your jab.' },
  { id: 'hk-limit', fighter: 'hero-knight', name: 'FOR THE ORDER', event: 'limit', goal: 1, tip: 'Use THOUSAND CUTS once. Take damage\nto fill LIMIT, then press O / LB + RB.' },
];
export const CHALLENGE_REWARD = 30;
const KEY = 'rebirth.challenges.v1';
let progress = {};
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) progress = saved;
} catch { /* storage is optional */ }
export function challengeProgress(c) {
  const n = Number(progress[c.id]);
  return Number.isFinite(n) ? Math.max(0, Math.min(c.goal, Math.floor(n))) : 0;
}
export function recordChallenge(fighter, event, { cpu = false, demo = false } = {}) {
  if (cpu || demo) return [];
  const completed = [];
  let changed = false;
  for (const c of CHALLENGES) {
    if (c.fighter !== fighter || c.event !== event) continue;
    const n = challengeProgress(c);
    if (n >= c.goal) continue;
    progress[c.id] = n + 1; changed = true;
    if (n + 1 === c.goal) { completed.push(c); addCoins(CHALLENGE_REWARD); }
  }
  if (changed) try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* storage unavailable */ }
  return completed;
}
