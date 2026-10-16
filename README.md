# Operation REBIRTH

A 2D pixel-art platform fighter for the browser, built with Phaser 4 and modern JavaScript.

## Run it locally

1. Install [Node.js](https://nodejs.org) (LTS).
2. In this folder run `npm install`, then `npm run dev`.
3. Open the address Vite prints (usually http://localhost:5173), click the game, press Enter.

## Controls

| Action | Keyboard | Controller |
| --- | --- | --- |
| Move | W A S D (W also jumps) | Left stick / D-pad |
| Jump | Space | X or Y |
| Attack | J | A |
| Special | K (hold to charge the fireball) | B |
| Shield / dodge | L (+ direction) | LT / RT |
| Grab | I | LB or RB |
| Limit | O | LB + RB together |
| Pause | Esc | Start |

On the setup screen, press A on a controller to join as a new player, Y to control player 1, B to leave.

## Folders

- `src/` game code: `scenes/`, `fighters/`, `input/`, `ai/`, `items/`, `stage/`, `ui/`, `audio/`
- `public/assets/` sprite sheets and sound files the game loads
- `tools/` scripts that generate art and sound (`sprites/`, `audio/`)
