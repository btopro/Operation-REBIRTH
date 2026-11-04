// Background music: one looping track at a time, shared by every scene. Asking for the track that is
// already playing does nothing, so the menu theme carries on unbroken from screen to screen.
// Volume follows settings.musicVolume (0..1) and changes live from the setup screen.
//
// Music STREAMS: each track plays from an <audio> element that downloads as it plays, instead of being
// loaded at boot and decoded whole into memory (a 3-minute stereo track is ~80 MB once decoded, and the
// game has ~45 minutes of music). Only the track that's playing is ever fetched.
// The element is wired into Phaser's Web Audio output, so the volume works on iPhones (which ignore
// <audio>.volume) and the game's mute applies. Sound effects and NU's amp songs (which need exact
// timing for ON BEAT) still load and play through Phaser as before.
import { settings } from '../settings.js';

// Every music track: key 'bgm_<name>' plays public/assets/audio/music/<name>.ogg (or .mp3 where the
// browser can't play Vorbis). Add a new track's name here (tools/audio/*.py write the files).
export const TRACKS = [
  'title', 'select', 'arcade', 'sky', 'spires', 'forest', 'gravemoon', 'backrooms', 'aero', 'desert', 'slasher',
  'fractured', 'infected', 'endless_castle', 'construct', 'baseplate_4', 'baseplate_5', 'baseplate_6', 'baseplate_10',
  // battle music sold in the shop (tools/audio/shop_music.py; 'mason' = Mason's own pixelated_audio 12)
  ...['neon', 'lofi', 'chip', 'organ', 'surf', 'jazz', 'taiko', 'dream', 'boss', 'rain', 'sugar', 'disco', 'mason',
    'noli', 'riphood', 'riphood2', 'soviet', 'korobeiniki', 'balalaika', 'troika'].map((n) => 'shop_' + n),
  // costume outro music (tools/audio/outro_music.py)
  ...['shrine', 'rosebud', 'abyss', 'dialup', 'western', 'monster', 'ragtime', 'victory', 'weather'].map((n) => 'outro_' + n),
];
const KNOWN = new Set(TRACKS.map((n) => 'bgm_' + n));
// tracks whose file name isn't simply the key without 'bgm_'
const FILES = { endless_castle: 'endless-castle' };
export function musicExists(key) { return KNOWN.has(key); }

let ext = null;
function trackUrl(key) {
  if (!ext) ext = document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
  const name = key.slice(4);
  return 'assets/audio/music/' + (FILES[name] || name) + '.' + ext;
}

let current = null, currentKey = null, base = 1;
const rotation = {};                                 // playlists: which track each one starts on next time

function setVol(t, v) {
  if (t.gain) t.gain.gain.value = v;
  else t.el.volume = Math.max(0, Math.min(1, v));
}

function makeTrack(scene, key, loop) {
  const el = new Audio(trackUrl(key));
  el.loop = loop; el.preload = 'auto';
  const t = { el, key, gain: null, src: null, hidden: false };
  const sm = scene.sound, ctx = sm.context;
  if (ctx && ctx.createMediaElementSource) {
    try {
      t.src = ctx.createMediaElementSource(el);
      t.gain = ctx.createGain();
      t.src.connect(t.gain); t.gain.connect(sm.destination || ctx.destination);
    } catch (e) { t.src = t.gain = null; }           // no Web Audio: plain <audio> volume instead
  }
  setVol(t, base * settings.musicVolume);
  return t;
}

// Browsers block audio until the first click / key press / tap: wait for Phaser's unlock, and if the
// browser still refuses, try again on the next press.
const GESTURES = ['pointerdown', 'keydown', 'touchend'];
function start(scene, t) {
  const go = () => {
    if (current !== t) return;
    const p = t.el.play();
    if (p && p.catch) p.catch(() => {
      const retry = () => { GESTURES.forEach((g) => window.removeEventListener(g, retry)); if (current === t && !t.hidden) t.el.play().catch(() => {}); };
      GESTURES.forEach((g) => window.addEventListener(g, retry));
    });
  };
  if (scene.sound.locked) scene.sound.once('unlocked', go);
  else go();
}

function drop(t) {
  try { t.el.pause(); t.el.removeAttribute('src'); t.el.load(); } catch (e) { /* already gone */ }
  try { if (t.src) t.src.disconnect(); if (t.gain) t.gain.disconnect(); } catch (e) { /* already gone */ }
}

// The game pauses its sounds when the tab is hidden; music does the same.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!current) return;
    if (document.hidden) { current.hidden = !current.el.paused; if (current.hidden) current.el.pause(); }
    else if (current.hidden) { current.hidden = false; current.el.play().catch(() => {}); }
  });
}

export function playMusic(scene, key, volume = 0.6) {
  if (key && key === currentKey && current) return;
  stopMusic();
  if (!key || !KNOWN.has(key)) return;
  currentKey = key; base = volume;
  current = makeTrack(scene, key, true);
  start(scene, current);
}

// A rotating soundtrack: plays each track through once, then the next, round and round. Each time the
// same playlist is started again (the next match on that stage) it begins one track further on.
export function playPlaylist(scene, keys, volume = 0.6) {
  keys = keys.filter((k) => KNOWN.has(k));
  if (!keys.length) { stopMusic(); return; }
  const id = 'list:' + keys.join(',');
  if (id === currentKey && current) return;
  stopMusic();
  let i = rotation[id] || 0; rotation[id] = (i + 1) % keys.length;
  currentKey = id; base = volume;
  const next = () => {
    if (currentKey !== id) return;
    if (current) drop(current);
    const t = makeTrack(scene, keys[i % keys.length], false);
    i++;
    current = t;
    t.el.addEventListener('ended', () => { if (current === t) next(); });
    start(scene, t);
  };
  next();
}

export function stopMusic() {
  if (current) drop(current);
  current = null; currentKey = null;
}

export function updateMusicVolume() { if (current) setVol(current, base * settings.musicVolume); }
