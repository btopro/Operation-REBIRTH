// Runs every test in tools/tests/ (*.mjs and *.js; Python asset checks in *.py too when python3 exists),
// one at a time, and reports which passed. Browser tests use Chrome/Chromium: set SIM_CHROME to the
// browser if it isn't found. A test passes when it exits with code 0.
//
//   npm test                     every test
//   npm test -- soul gravemoon   only tests whose file name contains one of the words
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';

const DIR = 'tools/tests', TIMEOUT = 5 * 60 * 1000;
const words = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const chrome = process.env.SIM_CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find((p) => fs.existsSync(p));
const hasPython = (() => { try { execFileSync('python3', ['--version'], { stdio: 'ignore' }); return true; } catch (e) { return false; } })();

const tests = fs.readdirSync(DIR).filter((f) => /\.(mjs|js|py)$/.test(f)).filter((f) => !words.length || words.some((w) => f.includes(w))).sort();
const results = [];
for (const f of tests) {
  const file = path.join(DIR, f), py = f.endsWith('.py');
  if (py && !hasPython) { results.push({ f, status: 'skip', why: 'no python3' }); continue; }
  const t0 = Date.now();
  const r = spawnSync(py ? 'python3' : process.execPath, [file], { encoding: 'utf8', timeout: TIMEOUT, env: { ...process.env, ...(chrome ? { SIM_CHROME: chrome } : {}) } });
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  const out = ((r.stdout || '') + (r.stderr || '')).trim().split('\n');
  const status = r.error && r.error.code === 'ETIMEDOUT' ? 'timeout' : r.status === 0 ? 'pass' : 'FAIL';
  results.push({ f, status, secs, tail: status === 'pass' ? '' : out.slice(-4).join('\n      ') });
  console.log(`${status.padEnd(7)} ${secs.padStart(4)}s  ${f}${status === 'pass' ? '' : '\n      ' + results.at(-1).tail}`);
}
const failed = results.filter((r) => r.status === 'FAIL' || r.status === 'timeout');
console.log(`\ntests: ${results.filter((r) => r.status === 'pass').length} passed, ${failed.length} failed, ${results.filter((r) => r.status === 'skip').length} skipped${chrome ? '' : ' (no Chrome found: set SIM_CHROME)'}`);
process.exit(failed.length ? 1 : 0);
