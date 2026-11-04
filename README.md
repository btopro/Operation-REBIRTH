# Operation REBIRTH

A 2D pixel-art platform fighter for the browser, built with Phaser 4 and modern JavaScript by an awesome artist.

## Run it locally

1. Install [Node.js](https://nodejs.org) (LTS).
2. In this folder run `npm install`, then `npm run dev`.
3. Open the address Vite prints (usually http://localhost:5173), click the game, press Enter.

## Test it

`npm run sim -- --smoke` plays short all-CPU matches on every stage with every fighter and costume, headless
and much faster than real time, and reports any errors. Needs Chrome or Edge installed. See `tools/sim/sim.mjs` for options.

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

**Soul Summoner specials:** K = fireball (hold to charge), A/D + K = Soul Hex (short-range curse: the target walks
toward the nearest edge for up to 2.5 s; mash any button to break free sooner), S + K = summon a soul, W + K = Soulfire Jet (flames under his feet blast him upward; hold A/D to steer).

**Ledges:** fall or recover next to the edge of the main stage to grab it (you're briefly invincible on the
first grab). Then: toward the stage or up = climb, jump = jump up, attack = climb with an attack,
shield = roll onto the stage, away or down = let go. Hold down while falling to not grab.

On the setup screen, press A on a controller to join as a new player, Y to control player 1, B to leave.

## Folders

- `src/` game code: `scenes/`, `fighters/`, `input/`, `ai/`, `items/`, `stage/`, `ui/`, `audio/`
- `public/assets/` sprite sheets and sound files the game loads
- `tools/` scripts that generate art and sound (`sprites/`, `audio/`)

## Play online

The game is published to GitHub Pages at **https://kobrabro12.github.io/Operation-REBIRTH/**.
Every push to `main` rebuilds and republishes it (see `.github/workflows/deploy-pages.yml`).

## Combat feedback, challenges and rematches

- **Combat feedback:** narrowly avoiding an overlapping attack during a roll, spot dodge or air dodge now gives a cyan `DODGED!` cue. Shields below a quarter strength give a throttled coral warning. Shield breaks add gold pixel shards and a shattering sound; Limit readiness adds a blue pixel burst. Dodge cues have a cooldown to keep busy fights readable. These reuse the existing pixel particles, font and synthesized sounds; damage and dodge timing are unchanged.
- **Character challenges:** open **OTHER > CHALLENGES** for three lessons each for Soul Summoner, Mr Wake and Lacy. Successful soul summons, Shadow Pools and projectile reflections teach their individual mechanics; unblocked hits and Limit use round out each set. Select **PRACTISE THIS FIGHTER** to enter Training immediately with that fighter and a standing dummy. Keyboard and controller navigation and mouse buttons are supported. Lessons count human actions in Training or regular matches, never CPUs or the title demo. Each pays **30 coins once**; progress is stored locally in `rebirth.challenges.v1` without changing existing saves or costume unlocks.
- **Quick rematch:** results now offer **REMATCH** or **CHANGE FIGHTERS / RULES**. Use left/right and Enter/A, or click a button; Esc/B goes back. Rematches retain the actual stage and fighters selected by Random, costumes, joined controllers, CPU levels and battle rules, while starting a fresh match. A short input guard prevents a held skip/confirm button from accidentally starting another battle.

Validation: `npm run build`, `npm run test:priorities` (headless Chromium; set `SIM_CHROME` if needed), and the existing `npm run sim` battle simulator. The browser integration test verifies saved challenge rewards, CPU/demo exclusion, Training launch, combat cue throttling, and rematches through the victory/results flow.

## Soul Summoner: March of the Fallen

Soul Summoner's ground-only Limit now calls fifteen spiritual skeletons from the platform beneath his feet. Workers in ragged overalls, fallen armored soldiers, and miners with cyan lamps brace their hands and pull themselves out of cracks before launching. They swoop toward opponents, strike through the normal projectile collision and knockback system, then fade out. Climbing lasts 0.7 seconds and cannot hurt opponents. Each spirit lasts about 2.3 seconds in total; the caster recovers after about 3.8 seconds. Bright ivory bones, dark outlines, sparse trails and staggered arrivals improve readability. Airborne attempts leave the Limit gauge intact. Blocking or dodging can avoid the spirits, and CPUs recognize the incoming swarm. The final spirit has a stronger launching hit. The previous beam is removed, and the character file and Limit challenge use the new name. Existing challenge progress remains intact.

Press **O** (or **LB + RB**) while grounded with a full Limit gauge to activate it. **Other > Challenges > Soul Summoner > Practise This Fighter** opens Training, whose controls include filling the gauge for testing.

Run `npm run test:spirit-limit` for an actual browser/engine check of the fifteen summons, hits, expiry, shielding, no-target safety and absence of the old beam.

### Phantom sprite polish

The three skeleton outfits now share luminous mint bones, cyan eyes, spectral teal/lavender clothes and dissolving phantom tails. Their animation uses a fixed 16-color palette and clean native pixel clusters on 48x56 frames, rendered at native scale instead of fractional 1.4x scaling. Alpha edges are hard and the bodies are only slightly translucent. Ground emergence, ground-only activation, damage and lifetime remain the same.

Soul Summoner's Limit activation now plays three descending pipe-organ chords: **dun, dun, DUN**, growing louder on each note with a short hall echo. It uses the existing SFX volume/mute controls and is silent in the title-screen demo. Airborne attempts do not play the cue.

### Gladiator finisher and spirit swings

The first fourteen spirits climb out, approach their target, and poof on contact without a separate swing animation. The fifteenth summon is a giant skeletal gladiator: it climbs out, lugs its oversized axe along the ground in a four-frame heavy walk, lifts it overhead, then makes one swing for **20 damage** per opponent hit. It lowers onto one knee, bows its head, becomes a pale spiritual form and fades upward. Regular spirits also settle, kneel and fade after contact. Shields and dodges still work, and the Limit remains ground-only. The three-note organ activation cue is unchanged.

### Grounded axe polish and Hylian Hero

Regular phantoms use a contact attack without the extra swing animation, then settle, kneel and fade harmlessly. The giant has eight distinct axe attack poses, stronger launch power (20 damage unchanged), and per-frame foot anchors so its visible soles stay on the stage. The dragging walk no longer adds a vertical bob.

Lacy's free **HYLIAN HERO** recolor is appended to her costume choices: green clothing, golden highlights, brown leather accents and the original sprite geometry. A small winged blue-white fairy follows her as a cosmetic effect. Choose Lacy, then cycle costumes with Q/E or controller costume controls. Previous costume indices and unlocks are preserved.

HYLIAN HERO now carries a Master Sword with a silver-blue blade, winged purple crossguard, blue grip and gold jewel. Per-frame sword patches preserve Lacy's original body and animation geometry; unarmed frames remain unarmed. Her thrown sword and enlarged Limit sword use the matching hilt. Other costumes retain their original swords.

### Weapon alignment and spiritual departures

The giant's walk and eight axe poses are normalized offline onto a common body anchor and floor baseline, so turning and changing poses no longer changes the pivot. The broken-bones effect is replaced with kneeling and spiritual fade frames for both the giant and normal phantoms. All departure frames have no hitbox. The Master Sword guard/grip is now anchored to Lacy's original gauntlet pixels in each frame, including every idle and run frame; the enlarged Limit sword uses the same tracked hand anchors. The costume, following fairy, 20-damage axe swing, stronger knockback, ground-only activation and organ cue are preserved.

### Counter stance and weapon cleanup

Lacy's Riposte uses a dedicated three-frame upright guard with a chest-height sword, drawn from her existing costume pixels. Its counter window and damage remain unchanged. HYLIAN HERO's Master Sword now has a continuous blade-to-guard connection and a grip anchored to her hand, including the new counter strip. The gladiator has cleaned single-axe walk/swing cels with a common floor pivot; planted footsteps play a low impact, boot crunch and brief armor rattle with a subtle stage shake. Kneeling spectral departures remain in place.

### 64px gladiator and Grave Moon Bridge

The giant now uses native 64×64 cels at an integer 3× display scale, gold armor, dark red cloth, a torn cape fastened at the shoulder, and animated red eye sparks. Fade uses the exact same kneeling cel, scale, origin and position for its entire duration, avoiding the previous silhouette/size jump. The 20-damage swing and heavy footsteps are preserved.

Grave Moon Bridge now uses a cohesive eight-tile 64×64 kit with one moonlit masonry palette, repeated arches/piers, carved gargoyle crests, iron railings and matching upper platforms. The moon, distant castle, lighting and stage-select miniature share the same pixel treatment. Collision platforms and lantern, fire, gaze and bat mechanics are preserved. `npm run test:gravemoon` checks native sizes and the lantern/gaze mechanics; `npm run test:spirit-limit` also checks the entire fade keeps identical geometry.

### Soul sword and fairy callouts

The giant's axe has been replaced in every walk, swing and kneeling cel by one hand-aligned flaming soul greatsword. Animated cyan soul-fire travels along the blade; the native 64×64 frames, 20-damage strike, gold/crimson appearance, red eye sparks, heavy footsteps and fixed-size kneeling fade remain. `tools/sprites/gladiator_soul_sword.py` removes the old weapon and draws the new grip, guard and blade.

HYLIAN HERO's Master Sword is now occluded by the original opaque helmet pixels, so its shoulder-held blade cannot show through her head. The fairy cycles original locally synthesized “Hey!”, “Look!” and “Listen!” clips with matching captions, beginning after the opening countdown and then every 11 seconds. Clips follow sound-effect volume, are silent in the title demo, and have a shared overlap guard. Dialogue uses simulation time so redraws and pauses do not trigger extra lines. `tools/audio/fairy_voice.py` reproduces the Flite SLT clips and bright pitch treatment. The sword test verifies helmet protection and all three fairy clips/captions.

### Five free skin theme packs and Lacy's two-handed block

Lacy's counter now extends both forearms in front of her. Separate front and rear gauntlets wrap one grip beneath an upright blade. Entry, held block and recovery have individual cels across all drawn costumes. The Hylian Master Sword uses the same shared attachment data and preserves both gloves and the opaque helmet.

Five existing free skins receive bespoke visual identities without moving saved costume indices or changing damage, hitboxes or travel:

| Skin | Combat additions | Custom victory and purpose |
| --- | --- | --- |
| Soul Summoner — Frost | Hovering ice crown, falling snow, boot crystals, crystal soul shots, icy spirit tint and summoning crystals | Blizzard tracking, a trapped soul, a choice and an opening ice gate; gives the glacial ruler an act of mercy. |
| Soul Summoner — Plague | Belt censer with vapor, orbiting moths, moth-filled alchemical shots, green spirit tint, summoning sigils and green impact splashes | Ruined garden, moth ritual, new growth; makes the alchemy theme distinct from ordinary green fire. |
| Lacy — Azure | Waterline footwork, blue afterimages, tidal sword toss, counter ward, water sparks and splash impacts | A failing beacon, an incoming wave, a braced sword block and returning boats; establishes her as the harbor guardian. |
| Lacy — Hylian Hero | Leaf wake, golden counter ward, sacred charge glyph, leaves during Limit and leaf-colored impacts; Master Sword and talking fairy retained | Forest discovery, both hands rotate and press the sword into the stone, fingers release, then she steps back; gives the ending a physical action and resolution. |
| Mr Wake — Ghost | Floating lantern, rising wisps, spectral afterimages, lantern-soul bolts, spectral pool waves and pale star impacts | Dock arrival, lantern souls rising, a ferry departing while he fades at fixed scale; gives the skin a coherent spirit-guide role. |

New motifs share snapped pixel props in `themePixels.js`; no new gameplay collision or large screen-covering particles are added. Each victory now has six or seven directed shots, shared texture origins and deterministic animation. `npm run test:five-skins` renders all five combat looks and all 34 victory shots, checks complete timelines and verifies projectile damage data stays unchanged. The Master Sword test also verifies both hand grips remain opaque.


### Directed cinematic rebuild

The five upgraded outros now have distinct 15–16 second stories and 34 total shots. A dedicated world container handles reframing, tracking, close-ups and inserts while the letterbox, captions and result UI remain fixed. Quiet edits replace the repeated flash/whoosh transitions; story-specific sound cues punctuate actual events. Characters keep their source scale, and changes of apparent size come from the camera.

- Frost: wide whiteout, boot-level tracking, a trapped spirit viewed over his shoulder, a close choice, the reverse through an opening ice gate, then stillness.
- Plague: a ruined conservatory, overhead last-seed insert, a low ritual shot, a moth pollinating a dead flower, overhead roots, a growing garden, then its keeper.
- Azure: a failing harbor beacon, a waterline surge, a two-handed stand, close impact on the blade, a reverse toward the relit lighthouse, then a calm watch.
- Hylian Hero: grove path, fairy-led discovery, a 12-cel turn of the sword, a 20-cel insertion with a resistance pause, 10 cels of fingers releasing, an empty-handed step back, then the resting sword. Both hands and the blade share one attachment rig; the tip passes below the stone top, the front stone masks the embedded blade, the hands stay in front of the grip during release, and the sword remains fixed after she leaves it.
- Ghost: an empty ferry, the lantern/bell reflected in water, three souls answering, a side-on boarding action, a shoreline crossing, then an empty deck with one light.

Lacy's counter now removes both old arm drawings before adding compact two-bone arms. Each segment stays nine source pixels long; only the elbow angles change. Separate gloves grip the sword close to the torso. The repaired block and shrine cels preserve the original body and leg proportions.

Validation includes fixed arm lengths, removal of the trailing third arm, visible glove pixels, original helmet occlusion, every movie's full timeline, at least three camera zoom levels per movie, all 34 shot renders, and the shrine's contact/insertion/release/fixed-sword continuity.


### Requested Frost / Azure / Hylian revisions

- Frost now faces the actual losing fighter in a winter biome, charges and fires an ice beam, and freezes the rival in place. The ice enclosure uses the rival's actual sprite bounds and corrected mirrored origin. Crystalline frost spreads over the screen before the exact `now freeze!` title and spoken line.
- Azure summons an ocean orb, detonates it, and the camera pulls back to the planet. A cached native 64×64 globe shows green land fracturing and vanishing beneath water, ending with zero green land and the exact `and now the endless flood begins...` title.
- Hylian Hero retains the hand-attached insertion and fixed resting sword. Isolated pixel remnants are removed, the rotating blade uses a continuous raster edge, and the insertion/release framing is less magnified. The fairy asks “Are you sure you want to do this?” in voice and captions; the final camera pushes into Lacy's face for “The kingdom is finally restored.” Both are original locally synthesized clips.
- Shop code input is normalized, including lowercase `riphood`. A scar-face slot is restricted to active RIPHOOD mode and resets outside that mode. The inline reference drawings were not exposed as editable files in this workspace, so their exact art import remains pending PNG files. `KEEPER_SCAR_ASSET` stays null rather than loading a missing or invented image; existing normal faces remain intact.

`test:five-skins` covers the real rival, freeze beam, growing frost, orb explosion, orbital pullback, loss of all green land, and all three new voice cues. `tools/tests/shop-face-policy.mjs` tests the actual shop's normal / typed-RIPHOOD / reset states using a temporary test texture, not a replacement for the user's drawing.


### Faster endings, silent characters, and Azure water cape

The current endings replace the earlier timings: Frost runs about 6.7 seconds, while Plague, Azure, Hylian Hero, and Ghost run about 11–12 seconds. Frost fires on the first visible frame from 480 world pixels away, with no intro fade or charge hold. Each story uses shorter holds and distinct action beats while retaining its final caption.

All spoken character lines, fairy dialogue, cinematic voices, reactive character speech, and fighter-name calls are disabled at loading and playback. Captions, music, and action effects remain. Original audio files are retained in source.

Azure wears an eight-cel native 64×64 water half-cape in combat and his ending. The one-shoulder panel has flowing highlights, foam, and falling droplets, follows his shoulder through rotation and mirrored poses, and disappears with the actor during planet shots. Its generator is `tools/sprites/azure_water_cape.py`.

`test:five-skins` checks complete ending timelines, immediate long-range Frost firing, silent cinematic dialogue, and Azure cape attachment/visibility. `test:master-sword` also verifies that the fairy captions remain while speech is silent.


### The Construct

An unlocked Matrix-inspired simulation rooftop fills the final open stage-select slot. Animated pixel code rain, a green city skyline, and a perspective wire grid surround three moving ledges. Every twelve seconds the ledges smoothly rebuild toward the next of three layouts; bright ledge pulses warn before movement begins. Grounded riders move with their platform. The main rooftop remains intact throughout.

Optional SYSTEM SCAN hazards mark two vertical lanes for 1.5 seconds before firing short beams. The hazard toggle suppresses the scan and damage while preserving the stage's moving geometry. The stage reuses the existing electronic INFECTED soundtrack. `npm run test:matrix-stage` covers three complete layouts, rider displacement, warnings, active beams, disabled hazards, stage-select capacity, and browser rendering.


### Azure attachment, Broken Bunny, and Orrery

Azure's water cape now uses source-frame shoulder landmarks for 361 cels, including the exact transforms used by her 180×140 move atlas. It follows embedded spins, turns, lunges, normal/unarmed movement, death frames, sprite scale/rotation and transparency. Character-select cards create the same cape behind her idle sprite. Regenerate the landmarks with `python tools/sprites/azure_cape_anchors.py`.

BROKEN BUNNY is a free, appended Rosemary costume, available through TEST FIGHTERS. Its teal rabbit shell, split ears, black sockets, hanging jaw, apron cavity, and exposed mechanisms are authored as rig parts. Both her initial and transformed forms have complete movement/attack sheets; the transformed version also has disarmed sheets and its own axe. Generate with `python tools/sprites/broken_bunny.py`.

ORRERY is a 2,000-coin shop costume for Soul Summoner. Brass clockwork, a chest dial, a toothed clock crown, an astrolabe, and a leaded stained-glass cloak are drawn into its own sheets. Animated orbiting timepieces, mint soul effects, and gold impact sparks complete the costume. Generate with `python tools/sprites/orrery_costume.py`. Existing skin indices remain stable.

`npm run test:cape-and-costumes` checks every cape cel in both directions with sprite transforms, character-select layering, both rabbit forms and disarmed loading, shop price, purchase deduction, unlock behavior, and costume texture availability.


### Mask-only Rosemary and shop cinema previews

BROKEN BUNNY's initial form now wears the rabbit mask with an elastic strap and her auburn hair visible behind it. Her original mustard coat, red boots, limbs, and missing poster are preserved. The full animatronic suit remains exclusive to her transformed form. The lower idle-strip pixels match the base Rosemary exactly.

Costume previews in the shop have INTRO and OUTRO buttons (I / O on keyboard, X / Y on a controller, or click/tap). The entrance plays the existing FighterIntros animation in a display-only Match scene; the ending plays the actual Win scene, including any costume-specific ending. Locked costumes are viewable without granting ownership. Both return to the sleeping shop's same shelf, costume, and move preview. Preview setup is passed directly to Match instead of replacing saved player settings; combat ticks and match rewards never run. Azure's cape now also follows entrance visibility, drop offsets, and squash/stretch.

`npm run test:shop-cinematics` verifies keyboard and mouse launch, automatic and skipped return, locked-costume rendering, preserved settings/currency/ownership, and the restored shop viewer.


### Orrery's last second, Obsidian's volcano duel, and two premium costumes

ORRERY now has a 12.5-second ending in an astronomical clock chamber. The second hand advances one notch per 75 game ticks, accompanied by a soft mechanical tick. The actual defeated fighter unravels into golden particles; the clock keeps running over their empty place. The final text uses their roster name: “LACY was lost to time.”, “MR WAKE was lost to time.”, etc.

OBSIDIAN has a twelve-second duel on a giant volcano rim: exchanges, a close clash, a heavy wind-up, a big overhead swing, the actual opponent launched over the crater and falling into lava, then “Burn like the rest of them.” The line is captioned; character speech remains disabled. Both endings are routed through the standard costume outro table, so the shop previews play them too.

PRISM REGENT (Lacy, 2,000 coins) has faceted crystal armour, a glass diadem, a drawn fan-cloak, a spectral blade, orbiting shards and a three-colour refracting guard. ABYSSAL CHOIR (Mr Wake, 2,000 coins) has a cathedral reliquary mask, an embroidered deep-sea robe, a lantern staff, and drifting bells with rings of light. Both use their own complete animation sheets, palettes, impacts, trails and entrances. Generate with `python tools/sprites/prism_and_choir.py`.

`npm run test:premium-endings` checks every shot and both full timelines, slow discrete clock ticks, actual rival names, disappearance, volcanic launch/submersion, costume texture availability, effects, 2,000-coin purchases and unlocks.


### Twelve-count endings, tracked diadem, shaped crater, and Construct ambience

Orrery's current ending is one uninterrupted push into a clock, with no character shots. Its hand advances through 1–12 at 45 ticks per step. At twelve, the defeated fighter's “was lost to time” line appears immediately. Prism Regent has a matching quiet push into a twelve-facet crystal, ending in “was shattered into light.” Abyssal Choir focuses on a submerged bell's twelve tolls, ending in “sank beyond the last bell.” The lines use the actual defeated roster name; all three are available in shop outro previews.

Obsidian's crater now has a persistent curved near rim and foreground volcanic slope in every shot. The falling rival passes behind that geometry; individual impact droplets arc up and fall back into the existing lava. The sudden rectangular foreground lava fill is removed.

Prism Regent's diadem is authored on the source helmet ridge rather than the top of a broad grayscale search. A weighted head-region tracker excludes raised arms from the attachment and derives its tilt from the head/neck direction; 95 source cels are checked for helmet contact. The move atlas carries those exact crowned cels through its embedded turns and spins.

THE CONSTRUCT now plays a 36-second original stereo ambience loop in AUTO: fading computer tones, modem wisps, disk/relay chatter, and a quiet cooling-fan bed. It uses normal music volume, preview, loop and cleanup behavior. `tools/audio/construct_ambience.py` exports Ogg and MP3 and verifies bounded peaks and decaying event envelopes.

`test:premium-endings` now checks all 0–12 counts, continuous zooms, object-only framing, captions withheld until twelve, curved-rim plunge, new skin attack rendering, both shop outro return routes, and decoded/looping Construct ambience.


### Prism ascent, cathedral procession, and Noli tap-face slot

Prism Regent's current ending shows eight crystals gathering and orbiting Lacy, then lifting with her into a luminous halo. The exact line “shine bright, today was a good fight” appears before the entire view, including the letterbox and captions, fades to white. Abyssal Choir now has six authored shots: descent into a drowned cathedral, a close relic awakening, a floating-bell procession, the great toll, the real rival drawn into a dark arch, and a quiet aftermath. Both play through the shop's outro preview.

Noli's screen tap now has a tested optional face slot: successive taps alternate between Noli and the extra face, with a three-second return to Noli. It is limited to Noli mode and safely falls back when its texture is absent. The user's inline reference is not exposed as an editable file in this workspace, so `NOLI_TAP_FACE_ASSET` remains null until the exact PNG/ZIP is supplied; no substitute image is shipped.

`test:premium-endings` verifies the crystal group, levitation, glow, exact blessing, completed white fade, all cathedral shots, shop return routes, and the real shop tap path using a temporary in-memory test texture.


### Two extra cosmetic animations for each premium skin

Orrery has Timepiece Inspection (idle flourish) and Wind the Heavens (taunt), matching the clockwork observatory theme. Prism Regent has Prismatic Blade Appraisal and Crystal Levitation Salute, showing her living-crystal armour, tracked diadem and floating shards. Abyssal Choir has Listen to the Deep and Three-Bell Conducting, matching his drowned-cathedral conductor role. These six new clips use the original costume parts and rigs; `tools/sprites/premium_flourishes.py` exports their atlases and metadata.

Idle flourishes begin after two seconds of uninterrupted grounded idle, then recur every six seconds. Movement and attacks immediately use their regular sheets; Lacy's flourish is suppressed while her sword is out. The new taunts retain the existing 80 / 66 / 82-tick durations, collision rules and vulnerability. Costume auras follow the performances. All six clips appear by name in the shop's costume viewer. Existing requested outros remain unchanged.

`test:premium-animations` checks every new cel in both facing directions, sprite origins, idle delay/recovery, normal attack rendering, taunt timing, unchanged physics/health/invulnerability, unarmed Lacy, and both named shop clips for all three costumes.


### Continuous premium idles, staged arrivals, and a stronger Choir ending

Orrery and Abyssal Choir now have 48-cel custom idle loops; Prism Regent has a 60-cel crystal hover. These play continuously during grounded idle, in character-select/menu displays, and as the shop viewer's CUSTOM IDLE. Their periodic flourishes and existing taunts remain available. Native-sized menu atlases keep the original feet and card scale; loop breathing returns smoothly to its starting phase.

Each premium arrival now has its own 100-tick sequence: Orrery assembles through an astrolabe/clockwork gate, Prism Regent materializes in a crystal shell that splits into orbiting shards, and Abyssal Choir rises in a bell-lit tide. Their body reveal, vertical movement, particles and final idle settle together before the countdown ends.

Abyssal Choir's ending now has eight shots with faster opening cuts: descent, a lantern-staff insert, the conductor's actual new taunt, an extreme close-up of the moving clapper, the great toll, a spiral tide catching the rival, the doorway draining and sealing, then a slow pullback into silence. The defeated-fighter caption is preserved.

Premium animation tests cover every new idle cel, the three entrance phases, settled sprite transforms, and custom-idle shop previews. Ending tests cover the eight-shot Choir timeline and shop return route.

Shop costumes now show five color-coded cosmetic rarities on cards, details, previews and capsule results: Common, Rare, Epic, Legendary and Miracle. Orrery, Prism Regent and Abyssal Choir are Miracle. Prices and capsule odds are unchanged. Abyssal Choir's cathedral outro holds a distant view as the defeated fighter charges from across the nave. Choir faces a stained-glass bell-keeper painting, strikes his staff into the floor, and drops an enormous bronze bell onto the attacker. Plague Doctor's Legendary upgrade adds an ivory respirator, jade goggles, brass coat trim, a caged soul lantern, orbiting moths, miasma, and a lantern-and-moth entrance. Its price remains 1400 coins.

The user's loading-screen artwork appears immediately in the HTML overlay before Phaser starts. Boot asset progress drives the bar and percentage; the overlay fades out after the title scene starts. The original 16:9 image fits without cropping on narrow and wide displays and uses pixelated rendering.

Seven character-focused lore loading cards join the original trio artwork: Soul Summoner at the Sanctum gates, Mr Wake under Gravemoon Bridge, Lacy at the fallen kingdom, NU on stage, Aero inside a desktop, What Once Was in Level 0, and Rosemary with a missing poster and SEEN silhouette. `tools/sprites/loading_screens.py` builds the cards from existing sprites in the supplied screen's dark purple pixel style. The pre-Phaser selector chooses a screen per visit, avoids immediately repeating the previous card, and falls back to the original if a card fails to load. Live asset progress and the title-screen handoff remain unchanged.

JUDGMENT is a Miracle Soul Summoner shop costume, priced at 2,000 coins, with its existing skin index preserved. The supplied 64x64 recolor is preserved exactly as idle frame 0, with its colors carried through all native rig animations. Its Sans-inspired cosmetic identity includes tracked cyan eye flashes, orbiting bones, bone-shaped fireballs, charge/release skull cannons, and cyan-tinted Limit spirits. Damage, hitboxes and physics stay unchanged. A bone-framed doorway entrance leads into battle; the six-shot judgment-hall outro extracts a red heart from the actual opponent's chest, sends in a swarm of 28 bones, then fades the heart, bones and defeated fighter together. The opponent's roster name is followed by "had a bad time." Existing character-voice restrictions remain in place. Rebuild assets with `python tools/sprites/judgment_costume.py`; validate with `npm run test:judgment`.

Judgment's full costume now uses one reference-colored rig for movement and combat. The complete pink slipper shapes are assigned to foot joints rather than split across shin/boot overlap layers. All 902 non-empty cels retain pink slippers; the uploaded idle remains pixel-identical. Neutral-B charge/release cannons use white, long-snouted horned skulls with stacked dark eye sockets and an opening jaw, following the supplied Sans reference.

### Young Link test fighter

Kirby has been removed. Young Link is available in Trinkets → Test Fighters for training, CPU matches, Fight It, and victory previews. Native sprites are extracted from the supplied `young_link_oot_melee_sprite_sheet_by_gregarlink10_d9fek9y.png`, **art by Gregarlink10**. Character belongs to Nintendo; these are supplied fan sprites, not original game art made for this project.

Rebuild with `python tools/sprites/young_link.py`. The source sheet and extraction manifest retain the original frame coordinates and artist credit. Only the exact blue backdrop is made transparent; sprite colors and native resolution are retained. All strips share a 160×128 cell and foot origin (80,112), leaving room for overhead arcs and extended blades. The 166 extracted frames cover movement, combat, defense, idle, and victory groups. Unique sheet sequences are mapped to the existing controls; moves without separate source animations share appropriate poses. Neutral special uses an extending hookshot that catches and pulls opponents, side special a charged forward rush, up special a rising spin that carries opponents into its finisher, and down special a thrown bomb.

Young Link animation playback uses 39 authored timelines in `youngLinkAnims.js`, sampled by `youngLinkAnimation.js`. Separate sword actions and reactions no longer loop across whole source rows. Each attack has timed anticipation, strike, and recovery, with a shared ready pose; ascent/descent is sampled from velocity and locomotion uses simulation time rather than render calls. Source rows share their original ground plane, preserving deliberate foot lifts instead of reanchoring every boot. Run `npm run test:young-link` to check extraction, playback continuity, and browser combat.

Young Link’s running cels are anchored at the torso, with a readable speed-driven cycle. Hookshot uses shared visual/collision geometry, a 126-pixel reach, and a short pull-in before throws. Bombs bounce, detonate on enemy contact or after a 60-tick fuse, and clean up after their blast. TRIFORCE SLASH uses Lacy’s capture-and-slash super behavior with a gold Triforce seal around each captured opponent. METALLIC BLUE is a free clothing-only palette: skin, hair, leather, weapons, and attack pixels remain unchanged, including during the victory animation.

Young Link can hold side special for up to 60 ticks: tap, half charge, and full charge scale the rush from 8 to 22 damage and increase forward travel. Recovery braking stops the rush from coasting indefinitely. The first two up-special hits keep struck opponents close to the rising spin; the final hit releases them, and interruption clears the carry. Airborne hookshot can attach to either free solid-stage edge within reach, visibly pull Link to the ledge, and restore normal ledge options. Holding down opts out, and occupied or out-of-range ledges do not attach. SHADOW LINK is a free appended recolor with charcoal-violet shading and red accents, preserving the default and Metallic Blue skin indices.

### Phone performance

Phones automatically use losslessly trimmed animation atlases, 60 FPS rendering at the native 640×360 canvas, HTML audio for loaded tracks (avoiding full WebAudio track decoding), a 120-particle decorative budget, and a lightweight title screen with animated fighters rather than an all-CPU demo. Input and combat remain on the existing fixed 60 Hz simulation. Options → Performance offers Auto, Low, and Full and remembers the selection. Atlas artwork is identical at every setting.

The 65 packed sheets use 753,131,520 bytes of decoded RGBA instead of 2,646,127,616 bytes (71.5% less for those sheets). Every original frame ID, pixel, logical cel size, and origin is preserved; outline/pixel-patch costumes have a compatible grid reconstruction path. Desktop retains the original sheets. Rebuild packed assets after changing sprites with `npm run build:mobile-assets`; `npm run test:mobile` validates all 50,068 frames and exercises phone loading, skin alignment, options, effects budgeting, and touch combat. Emulation verifies behavior, not a guaranteed frame rate on physical phones.

Shadow Link’s open eyes use native per-frame eye masks: iris, sclera, and pupil pixels become solid red on both desktop sheets and mobile atlases. Closed-eye poses stay closed. Rebuild masks after changing Young Link sprites with `npm run build:link-eyes`. Navi follows every Young Link skin using lightweight pixel effects, without particles, collision, or extra voice lines; she also appears in the victory scene.

TRIFORCE SLASH now launches a moving golden triangle. Only a collision starts the cinematic: twenty rapid cuts, then one large finishing slash, with the Triforce seal around the captured opponent. A miss expires without damage or a cutscene. Judgment is purchased in Costumes at Miracle rarity for 2,000 coins; its entrance, skull cannons, slippers and heart-and-bones victory scene are retained.

### Soul Board

Trinkets → Soul Board opens a shared eight-slot board for Main and Aid souls, with a five-minute rotation timer, power and difficulty ratings from one to five stars, and a details panel. Main Souls provide the foundation for strength and power; Aid Souls provide abilities. The live catalog contains Bill Cipher (Eternal, three Aid slots, +20% psychic damage), Cloud (Vengeful, two Aid slots, +10% sword damage), and Steve (Restless, three Aid slots, no damage bonus). Team Select at the top of the board saves one Main and up to three Aids in this browser. No Aid souls or encounter battles have been supplied yet.

Future catalog records use `{id,name,kind:'main'|'aid',stars:1..5,difficultyStars?:1..5,description?,ability?}`. Rotation is deterministic within each wall-clock interval; reopening the board does not reroll its souls. Difficulty tiers are Wisp (1 star), Restless (2), Vengeful (3), Dread (4), and Eternal (5). Controller, keyboard and touch navigation are supported. Run `npm run test:soul-board` for catalog/rotation validation and UI navigation checks.

Soul teams apply to P1 in regular matches and training; CPUs, title demos and shop previews keep their normal stats. Typed psychic hits (including Soul Hex / possession and curses) receive Bill’s multiplier; sword strikes, blade Limit slices, and thrown swords receive Cloud’s. Fireballs, bombs, grabs, and unrelated attacks do not receive these bonuses. Main swaps preserve valid Aids within the new capacity, clear locked slots, and prevent duplicate Aid placement. Portraits use a transparent reference-based atlas.
