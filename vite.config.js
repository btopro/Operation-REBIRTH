import { defineConfig } from 'vite';

// Relative paths so the built game works from any folder, including
// GitHub Pages' https://<user>.github.io/Operation-REBIRTH/ address.
export default defineConfig({
  base: './',
});
