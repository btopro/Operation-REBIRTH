// Asset rules: checks every image, sound and video this change adds or edits (old files are left alone),
// so new art arrives in a shape the build can optimize and players can load. Most optimizing happens on
// its own in `npm run build` (palette PNGs, lossless WebP - tools/build/); these rules catch what it can't
// fix by itself. The images/audio rules in CLAUDE.md say the same in words.
//
//   npm run check:assets            (CHECK_BASE=<ref> to compare with something other than origin/main)
//   npm run check:assets -- --all   (check every file, old ones too - a report, never fails)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { changedLines } from './changed.mjs';

const MAX_SIDE = 4096;            // many phones can't use a texture wider or taller than this
const BIG_IMAGE = 2e6;            // bytes: a PNG this big needs a reason (split it, or make it smaller)
const MAX_AUDIO_KBPS = 160;       // OGG/MP3 above this are wasting download (tools/audio/*.py target 64-128)
const MAX_SAMPLE_RATE = 48000;
const BIG_VIDEO = 5e6;

const all = process.argv.includes('--all');
const files = all ? execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean) : [...changedLines().keys()];
const errors = [], warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`), warn = (f, m) => warnings.push(`${f}: ${m}`);
const hasFfprobe = (() => { try { execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; } catch (e) { return false; } })();

/** Width and height of a PNG, read from its header. */
function pngSize(file) {
  const b = Buffer.alloc(24), fd = fs.openSync(file, 'r');
  fs.readSync(fd, b, 0, 24, 0); fs.closeSync(fd);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

/** Bitrate (kbps), sample rate and length (s) of an audio file, or null without ffprobe. */
function audioInfo(file) {
  if (!hasFfprobe) return null;
  const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=bit_rate,duration:stream=sample_rate', '-of', 'json', file], { encoding: 'utf8' }));
  return { kbps: Math.round((+j.format.bit_rate || 0) / 1000), rate: +(j.streams[0] && j.streams[0].sample_rate) || 0, secs: +j.format.duration || 0 };
}

// music tracks the game knows (src/audio/music.js TRACKS + FILES), to catch a track nobody can play
const musicSrc = fs.existsSync('src/audio/music.js') ? fs.readFileSync('src/audio/music.js', 'utf8') : '';
const knownMusic = (() => {
  const block = musicSrc.slice(musicSrc.indexOf('export const TRACKS'), musicSrc.indexOf('const KNOWN'));
  const names = new Set();
  for (const m of block.matchAll(/\.\.\.\[([^\]]*)\]\.map\(\(n\) => '([a-z]+_)' \+ n\)/g)) for (const n of m[1].matchAll(/'([a-z0-9]+)'/g)) names.add(m[2] + n[1]);
  const plain = block.replace(/\.\.\.\[[^\]]*\]\.map\([^)]*\)[^)]*\)/g, '').replace(/\/\/.*/g, '');
  for (const n of plain.matchAll(/'([a-z0-9_]+)'/g)) names.add(n[1]);
  const files = /const FILES = \{([^}]*)\}/.exec(musicSrc);
  if (files) for (const m of files[1].matchAll(/(\w+):\s*'([^']+)'/g)) { names.delete(m[1]); names.add(m[2]); }
  return names;
})();

for (const f of files) {
  if (!fs.existsSync(f) || !/^(public|src)\//.test(f)) continue;
  const ext = path.extname(f).toLowerCase(), size = fs.statSync(f).size;
  if (['.jpg', '.jpeg', '.gif', '.bmp', '.tif', '.tiff', '.webp', '.avif'].includes(ext)) {
    err(f, `images go in as .png - the build makes the optimized copy itself (palette PNG or lossless WebP). Convert it to PNG and point the code at the .png.`);
  } else if (ext === '.png') {
    const { w, h } = pngSize(f);
    if (Math.max(w, h) > MAX_SIDE) err(f, `${w}x${h} is over ${MAX_SIDE} px - many phones can't load it. Split the sheet (e.g. moves into two sheets) or put fewer frames per row.`);
    if (size > BIG_IMAGE) (all ? warn : err)(f, `${(size / 1e6).toFixed(1)} MB PNG. Ship art near the size it's shown at (e.g. 96 px portraits shouldn't come from 1254 px pictures), or split it.`);
  } else if (ext === '.wav') {
    err(f, 'WAV is uncompressed - export OGG (and an MP3 copy), like the rest of public/assets/audio.');
  } else if (ext === '.ogg' || ext === '.mp3') {
    const partner = f.slice(0, -4) + (ext === '.ogg' ? '.mp3' : '.ogg');
    if (!fs.existsSync(partner)) err(f, `has no ${path.extname(partner)} copy - every clip ships as both .ogg and .mp3 (Safari plays the MP3).`);
    const a = audioInfo(f);
    if (a && a.secs >= 2 && a.kbps > MAX_AUDIO_KBPS) (all ? warn : err)(f, `${a.kbps} kbps - re-encode at 64-128 kbps (128 for stereo music, 64 or less for mono voice/sfx).`);
    if (a && a.rate > MAX_SAMPLE_RATE) (all ? warn : err)(f, `${a.rate} Hz - 44100 or 48000 is plenty.`);
    if (f.startsWith('public/assets/audio/music/') && ext === '.ogg' && musicSrc && !knownMusic.has(path.basename(f, '.ogg'))) {
      err(f, `is a music file the game doesn't know - add its name to TRACKS in src/audio/music.js (music streams; it's never loaded in BootScene).`);
    }
  } else if (ext === '.mp4' || ext === '.webm') {
    if (size > BIG_VIDEO) warn(f, `${(size / 1e6).toFixed(1)} MB video - keep clips short and small; load it only where it plays.`);
  }
}
if (!hasFfprobe) warnings.push('(ffprobe not installed: audio bitrate and sample rate not checked)');

for (const w of warnings) console.log('  warning  ' + w);
for (const e of errors) console.log('  error    ' + e);
if (errors.length && !all) { console.log(`check:assets - ${errors.length} problem(s) in new or changed assets (CLAUDE.md: Assets rules)`); process.exit(1); }
console.log(`check:assets - ok (${files.filter((f) => /^(public|src)\//.test(f) && /\.(png|jpe?g|gif|webp|wav|ogg|mp3|mp4|webm)$/i.test(f)).length} asset file(s) checked${all ? ', report only' : ''})`);
