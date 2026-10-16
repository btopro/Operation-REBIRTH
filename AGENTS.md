# AGENTS.md

Guidance for AI agents working in this repository. Read this before making changes.

## What this is

Operation REBIRTH is a 2D pixel-art platform fighter (Smash-style) for the browser, built on **Phaser 4** with plain ES modules (no TypeScript, no framework beyond Phaser). There is a single package at the repo root — no monorepo, no workspaces.

## Dev loop

- `npm install`, then `npm run dev` starts Vite's dev server (prints a localhost URL).
- `npm run build` produces the static `dist/` bundle; `npm run preview` serves it locally.
- There is **no linter, formatter, or test suite configured yet**. The only automated check available is that `npm run build` completes without errors. After any non-trivial change, run the build to catch syntax/import errors, and manually reason through the affected game logic since there's no test harness to lean on.
- Deployment is automatic: every push to `main` rebuilds and publishes to GitHub Pages via `.github/workflows/deploy-pages.yml`. Don't try to deploy manually.

## Architecture

The game runs as a fixed-timestep simulation inside Phaser scenes.

**Scene flow** (`src/main.js` registers them in order): `BootScene` (loads assets) → `TitleScene` → `SetupScene` (players/CPUs/match options, writes into `src/settings.js`) → `MatchScene` (the fight) → `ResultsScene` → back to `TitleScene`.

**`src/scenes/MatchScene.js`** is the core of the game. It:
- Runs a fixed 60 Hz loop (`STEP_MS` from `src/config.js`) decoupled from render framerate (`update()` accumulates delta time and calls `tick()` 0-5 times, then `draw()`).
- Owns three Phaser cameras (background / world / UI) so HUD, stage art, and fighters can each ignore the layers that don't apply to them.
- Creates one `Fighter` per player slot (human or CPU), the stage (`SkyStage`), item spawner, and HUD.
- Each `tick()`: polls controllers, steps fighters/projectiles/souls/items/stage hazards, resolves hitbox-vs-hurtbox overlaps (`resolveHits`), and enforces match rules (stock/time/stamina).

**`src/fighters/Fighter.js`** is the fighter state machine and physics body. State is driven by a simple convention: `this.state = 'idle'` means a per-frame handler method named `st_idle` (if present) runs each tick (see `step()`). States include `idle`, `run`, `air`, `jumpsquat`, `attack`, `shield`, `grabbed`, `limit`, `respawn`, etc. Buttons are buffered a few frames (`BUFFER`) so early presses aren't dropped. Position `(x, y)` is the point between the fighter's feet; `y` grows downward. Only one fighter kit exists today: `src/fighters/soulSummoner.js` (move data, hitboxes, sprite sheet refs) paired with `SOUL_SUMMONER` consumed by `Fighter`.

**`src/fighters/entities.js`** holds things fighters spawn mid-match: `Fireball` (special move projectile) and `Soul` (summoned minion that seeks the nearest enemy). Both expose `step()`, `hitbox()`/`hurtbox()`, and `render()`, matching the shape `MatchScene.resolveHits` expects from any combatant.

**`src/input/controllers.js`** defines a common `Controller` interface (`held`, `pressed`, `released`, stick `x`/`y`) implemented by `KeyboardController`, `GamepadController`, `MergedController` (combines keyboard + pad for P1), and consumed identically by `CpuController`. Fighter code never needs to know whether a human or CPU is behind the controller — this is the key abstraction to preserve when touching input or AI.

**`src/ai/cpu.js`** (`CpuController`) "plays" by setting the same button/stick state a human controller would, gated by `DIFFICULTY` settings from `src/config.js` (reaction time, aggression, shield chance, accuracy).

**`src/config.js`** is the single source of truth for tunable constants: viewport size, physics (`PHYS`), blast zone boundaries, player colors/tints, Limit meter threshold, and the `DIFFICULTY` table. Prefer adding new tunables here over hardcoding magic numbers in gameplay files.

**`src/settings.js`** holds the mutable match configuration (`mode`, `stocks`, `cpuCount`, `difficulty`, volumes, connected pads, etc.) set by `SetupScene` and read by `MatchScene`. It's a plain mutable object, not a store/reducer — treat it as global state scoped to one match setup.

**`src/stage/skyStage.js`**, **`src/items/items.js`**, **`src/ui/hud.js`**, **`src/audio/sfx.js`** are self-contained supporting systems (stage geometry/hazards, item pickups, on-screen HUD, sound effect playback) each consumed by `MatchScene`.

## Assets and generation tools

- `public/assets/` contains the sprite sheets and sound files the game loads at runtime via Phaser's loader (wired up in `BootScene`).
- `tools/sprites/` and `tools/audio/` contain standalone Python/SVG scripts used to *generate* those assets (e.g. `tools/sprites/soul_summoner.py`, `tools/audio/fireball_sfx.py`). These are offline authoring tools, not part of the build — they are run manually to produce files that get committed under `public/assets/`. If asked to change a sprite or sound, prefer editing the generator script and regenerating over hand-editing binary output, unless the change is trivial and the generator is unavailable.

## Conventions to follow

- Physics values are expressed in pixels per frame at 60 FPS (see the comment at the top of `src/config.js`); keep new movement/physics code in the same units.
- Player-indexed data (colors, tints) are parallel arrays indexed by `slot` (0-3), not objects keyed by id — follow this pattern for any new per-player data in `config.js`.
- Code style is terse and dense (multiple statements per line, minimal whitespace) throughout `src/`. Match the existing style in a file rather than reformatting it wholesale.
- No semicolon-free style, no TypeScript, no JSX — plain ES2022 modules throughout.
- Don't introduce a UI framework, state management library, or build tool beyond Vite without discussing it first — the project is intentionally dependency-light (only `vite` in `devDependencies`).
