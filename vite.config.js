import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { optimizePngPlugin } from './tools/build/optimize-png.mjs';

// Voice Studio (voice-studio.html, dev server only): saves each recorded announcer line the page POSTs to
// /__voice/<id> as recordings/voice/<id>.<ext> in this folder, ready to be turned into game audio by
// tools/audio/my_voice.py.
const LINE_IDS = ['soul-summoner', 'mr-wake', 'hero-knight', 'random', 'unlock',
  'sky-sanctum', 'verdant-spires', 'gravemoon-bridge', 'neon-arcade', 'elderwood-hollow'];
function voiceStudio() {
  return {
    name: 'voice-studio',
    configureServer(server) {
      server.middlewares.use('/__voice/', (req, res) => {
        const m = /^\/?([a-z-]+)\.(webm|ogg|wav|m4a|mp4)$/.exec(req.url || '');
        if (req.method !== 'POST' || !m || !LINE_IDS.includes(m[1])) { res.statusCode = 400; res.end('bad request'); return; }
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          const dir = path.resolve('recordings/voice');
          fs.mkdirSync(dir, { recursive: true });
          for (const f of fs.readdirSync(dir)) if (f.startsWith(m[1] + '.')) fs.unlinkSync(path.join(dir, f));   // one take per line
          fs.writeFileSync(path.join(dir, m[1] + '.' + m[2]), Buffer.concat(chunks));
          res.end('saved');
        });
      });
    },
  };
}

// Relative paths so the built game works from any folder, including
// GitHub Pages' https://<user>.github.io/Operation-REBIRTH/ address.
export default defineConfig({
  base: './',
  // optimizePngPlugin: after a build, rewrites dist/'s PNGs as exact palette PNGs (same pixels, smaller
  // files; tools/build/optimize-png.mjs). Set SKIP_PNG_OPTIMIZE=1 for a quick unoptimized build.
  plugins: [voiceStudio(), optimizePngPlugin()],
  // Phaser in its own file: it changes far less often than the game, so after an update players'
  // browsers can keep the copy they have and only fetch the game's code again.
  // terser squeezes the code ~4% smaller than Vite's default minifier (about 15 KB gzipped off Phaser).
  build: { minify: 'terser', rollupOptions: { output: { manualChunks: (id) => (id.includes('node_modules/phaser/') ? 'phaser' : undefined) } } },
});
