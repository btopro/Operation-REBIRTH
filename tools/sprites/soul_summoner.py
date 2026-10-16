"""King pixel-game idle: stepped, whole-pixel animation (like a classic sprite sheet).
Run: python3 king_pixel.py king_idle.svg
Outputs: king_pixel_idle_sheet.png (32 frames), king_pixel_juggle_sheet.png (32 frames),
         king_pixel_preview.gif, vf4/ frames for the MP4.  All frames are 64x64, 10 fps.

Design: poses are looked up from small tables, so the body HOLDS a pose for a few frames and then
steps 1 px -- the way a hand-drawn pixel idle works.  Head lags the chest (follow-through),
the cape flutters in 3-row bands, and the flame cycles through 8 fixed poses (no randomness).
"""
import math, os, re, sys
from PIL import Image

N = 32                              # idle loop = 3.2 s @ 10 fps (2 breaths, 1 full sway)
FLAME_COLS = {"076CC2", "78A0C6", "F0F2F3"}
BASE_Y = 27                         # row where the flame meets the palm
HEAD_Y, CHEST_Y = 15, 37            # head = rows <=15 (ends at the chin); neck, collar, shoulders + chest = 16..37; waist+legs fixed
EYES = [(33, 13), (35, 13), (33, 14), (35, 14)]
SRC = open(sys.argv[1]).read()

def hx(s): return tuple(int(s[i:i+2], 16) for i in (0, 2, 4)) + (255,)
def is_cape(x, y, col):
    r, g, b = (int(col[i:i+2], 16) for i in (0, 2, 4))
    return x <= 25 and y >= 22 and b > g + 3

body, cape, flame = {}, {}, {}
for m in re.finditer(r'<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="#([0-9A-Fa-f]{6})"', SRC):
    x0, y0, w, h = map(int, m.groups()[:4]); col = m.group(5).upper()
    for dx in range(w):
        for dy in range(h):
            x, y = x0 + dx, y0 + dy
            if col in FLAME_COLS and x >= 44: flame[(x, y)] = col
            elif is_cape(x, y, col):          cape[(x, y)] = col
            else:                             body[(x, y)] = col
blob = {p: c for p, c in flame.items() if BASE_Y - p[1] <= 8}      # round base of the flame
wisp = {p: c for p, c in flame.items() if BASE_Y - p[1] > 8}       # thin tip

def rows_of(d):
    r = {}
    for (x, y), c in d.items(): r.setdefault(y, []).append((x, c))
    return r
BODY_ROWS, CAPE_ROWS = rows_of(body), rows_of(cape)

# ---------------------------------------------------------------- pose tables
def breath(f):  return 0.5 * (1 - math.cos(2 * math.pi * f / 16))          # 0..1, one breath = 1.6 s
def sw(f, amp): return round(amp * math.sin(2 * math.pi * f / N))          # whole-pixel lean

def pose(f):
    """(head_dx, head_dy, chest_dx, chest_dy) in whole pixels. Negative dy = up."""
    chest_dy = -1 if breath(f) > 0.55 else 0
    head_dy = -1 if breath(f - 2) > 0.55 else 0                            # head lags chest by 2 frames...
    head_dy = min(head_dy, chest_dy)                                       # ...but is never LOWER than the chest (no neck gap)
    s = math.sin(2 * math.pi * f / N)                                      # sway reduced by 50%
    chest_dx = 1 if s > 0.85 else -1 if s < -0.85 else 0                   # torso: 1 px, only at the lean extremes
    head_dx = sw(f - 3, 0.85)                                              # head: max 1 px (was 2), still lagging
    return head_dx, head_dy, chest_dx, chest_dy

def seg(y, P):                                                              # used by the cape (rows >= 22 only)
    hdx, hdy, cdx, cdy = P
    if y <= CHEST_Y: return cdx, cdy
    return 0, 0

def body_row(y, P):
    """Which source row (and x shift) feeds output row y. The head slides on top of a neck that moves with
    the shoulders; if the head sits higher than the chest, its chin row is repeated so there is never a gap."""
    hdx, hdy, cdx, cdy = P
    if y <= HEAD_Y + hdy: return y - hdy, hdx                               # head
    if y <= HEAD_Y + cdy: return HEAD_Y, hdx                                # chin row repeated under a raised head
    dx, dy = (cdx, cdy) if y <= CHEST_Y else (0, 0)                         # neck/collar/shoulders/chest, then waist+legs
    return y - dy, dx

def cape_flutter(y, f):
    band = 22 + 3 * ((y - 22) // 3)                                        # blocky 3-row bands
    amp = min(max((band - 30) / 16, 0), 1) * 2.6
    f2 = (f // 2) * 2                                                      # cape updates at 5 fps
    return round(amp * math.sin(2 * math.pi * f2 / 16 - (band - 22) * 0.24))

ARM_X1, ARM_Y0, ARM_Y1 = 27, 24, 39        # the hanging arm on the left of the sprite (viewer's left)
def arm_dx(y, f):
    """Pendulum swing: shoulder end stays put, the fist drifts out 2 px and back over the 3.2 s loop."""
    s = 0.5 * (1 - math.cos(2 * math.pi * (f - 6) / N))                    # 0 -> 1 -> 0, lags the body lean
    return -round(s * 2.2 * (y - 23) / 15)                                 # negative = away from the body

# ---------------------------------------------------------------- flame
def flame_pixels(f):
    """Deterministic 8-pose flame cycle (0.8 s)."""
    ff = f % 8
    px = {}
    for (x, y), col in flame.items():
        h = BASE_Y - y
        if h >= 13 and col != "F0F2F3" and ff in (3, 7): continue          # tip shortens twice per cycle
        sway = round(1.5 * (h / 14) * math.sin(2 * math.pi * ff / 8 + h * 0.45))
        if col == "076CC2" and h < 8 and (x + y + ff) % 4 == 0: col = "78A0C6"
        px[(x + sway, y)] = col
    return px, ff

def sparks(ff):
    out = {}
    for k, (sx, col) in enumerate([(47, "78A0C6"), (50, "F0F2F3"), (46, "076CC2")]):
        t = (ff + k * 3) % 8
        if t < 5: out[(sx + (1 if (t + k) % 4 in (1, 2) else 0), 11 - t * 2 + k)] = col
    return out

# ---------------------------------------------------------------- juggle choreography
H_LIFT = 13
def lift_at(t):  u = (t + 1) / 9; return round(H_LIFT * 4 * u * (1 - u))
def dx_at(t, loop): return round(3 * math.sin(2 * math.pi * (t + 1) / 9)) if loop else 0

def juggle_state(j):
    """Returns (hand_dy, mode, info). j = juggle frame 0..31 (frame 0 is the neutral idle pose)."""
    if j in (1, 2, 16, 17):  return 1, "held", dict(dy=1)                  # wind-up: hand dips
    if j in (3, 18):         return -1, "ball", dict(lift=3, rising=True, dx=0, t=-1, loop=j == 18)
    if 4 <= j <= 11:         t = j - 4;  return 0, "ball", dict(lift=lift_at(t), rising=t < 4, dx=dx_at(t, False), t=t, loop=False)
    if 19 <= j <= 26:        t = j - 19; return 0, "ball", dict(lift=lift_at(t), rising=t < 4, dx=dx_at(t, True), t=t, loop=True)
    if j in (12, 27):        return 1, "held", dict(dy=1, bright=True)       # catch
    return 0, "held", dict(dy=0)

# ---------------------------------------------------------------- frame builder
def make_frame(f, j=None):
    P = pose(f)
    px = {}

    # cape (behind body): follows the chest, then flutters in bands
    for y in range(22, 64):
        dx, dy = seg(y, P)
        for x, c in CAPE_ROWS.get(y - dy, []):
            px[(x + dx + (cape_flutter(y, f) if y > 28 else 0), y)] = c

    # body: row remap = pixel-art squash/stretch at the seams, no holes
    pulse = f % 8
    eye = "FF7AC8" if pulse in (0, 1) else "B00A6C" if pulse in (4, 5) else "F50F96"
    hdx, hdy, cdx, cdy = P
    bpx = {}
    for y in range(0, 64):
        sy, dx = body_row(y, P)
        for x, c in BODY_ROWS.get(sy, []):
            bpx[(x + dx, y)] = eye if (x, sy) in EYES else c
    # left arm swings out a little: only the arm's pixels shear sideways, the torso stays put
    arm = {p: c for p, c in bpx.items() if p[0] <= ARM_X1 and ARM_Y0 <= p[1] <= ARM_Y1}
    for p in arm: del bpx[p]                                               # lift the whole arm first, then put it back
    for (x, y), c in arm.items(): bpx[(x + arm_dx(y, f), y)] = c
    px.update(bpx)

    hand_dy, mode, info = (0, "held", dict(dy=0)) if j is None else juggle_state(j)
    if hand_dy:                                                            # hand dip / flick
        hand = {p: c for p, c in px.items() if p[0] >= 45 and 24 <= p[1] <= 31}
        for p in hand: del px[p]
        for (x, y), c in hand.items(): px[(x, y + hand_dy)] = c

    # flame overlay rides on the chest/hand
    fpx, ff = flame_pixels(f)
    ox, oy = cdx, cdy
    if mode == "held":
        dy = oy + info.get("dy", 0)
        bright = info.get("bright", False)
        for (x, y), col in fpx.items():
            if bright and col == "076CC2" and BASE_Y - y < 9: col = "78A0C6"
            px[(x + ox, y + dy)] = col
        if not (j is not None and j in (1, 2, 16, 17)):
            for (x, y), col in sparks(ff).items(): px[(x + ox, y + dy)] = col
    else:
        lift, rising, dx, t, loop = info["lift"], info["rising"], info["dx"], info["t"], info["loop"]
        mirror = (t % 2 == 1)                                              # alternate flips -> spinning shimmer
        for (x, y), col in blob.items():
            xx = (96 - x) if mirror else x
            if col == "076CC2" and (x + y + t) % 3 == 0: col = "78A0C6"
            px[(xx + dx + ox, y - lift + oy)] = col
        keep = lambda x, y: (x * 3 + y * 5 + t) % 5 != 0                   # deterministic ragged tail
        if rising and lift >= 5:
            for (x, y), col in wisp.items():
                r = BASE_Y - y - 8
                if keep(x, y): px[(x + dx + ox + round(math.sin(ff + r)), BASE_Y - 1 - lift + r + oy)] = col
        elif not rising or lift >= 11:
            for (x, y), col in wisp.items():
                if keep(x, y): px[(x + dx + ox + round(math.sin(ff + y)), y - lift + oy)] = col
        for xe in (47, 49):                                                # embers left on the palm
            if lift < 10: px[(xe + ox, 26 + hand_dy + oy)] = "076CC2"
        if t >= 0:                                                         # spark trail
            for k, col in ((2, "78A0C6"), (3, "076CC2")):
                tt = t - k
                if tt >= 0: px[(48 + dx_at(tt, loop) + ox + ((tt + k) % 3 - 1), 25 - lift_at(tt) + oy)] = col

    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    for (x, y), col in px.items():
        if 0 <= x < 64 and 0 <= y < 64: img.putpixel((x, y), hx(col))
    return img

idle = [make_frame(f) for f in range(N)]
juggle = [make_frame(j, j) for j in range(N)]

def sheet(frames, name):
    s = Image.new("RGBA", (64 * len(frames), 64), (0, 0, 0, 0))
    for i, fr in enumerate(frames): s.alpha_composite(fr, (i * 64, 0))
    s.save(name)
sheet(idle, "king_pixel_idle_sheet.png"); sheet(juggle, "king_pixel_juggle_sheet.png")

BG = (24, 20, 32, 255)
def on_bg(fr):
    b = Image.new("RGBA", (64, 64), BG); b.alpha_composite(fr); return b
cycle = idle * 2 + juggle                                                  # 64 + 32 = 96 frames = 9.6 s
gif = [on_bg(f).resize((384, 384), Image.NEAREST).convert("P", palette=Image.ADAPTIVE) for f in cycle]
gif[0].save("king_pixel_preview.gif", save_all=True, append_images=gif[1:], duration=100, loop=0, disposal=2)

os.makedirs("vf4", exist_ok=True)
for f in os.listdir("vf4"): os.remove(f"vf4/{f}")
for k, fr in enumerate(cycle * 2):                                         # 2 cycles = 19.2 s
    on_bg(fr).resize((1024, 1024), Image.NEAREST).convert("RGB").save(f"vf4/f{k:04d}.png")

# contact sheets for checking
def contact(frames, idxs, name, crop=(0, 0, 64, 64), s=6):
    w, h = crop[2] - crop[0], crop[3] - crop[1]
    cols = 8
    out = Image.new("RGBA", (cols * w * s, ((len(idxs) + cols - 1) // cols) * h * s), BG)
    for n, i in enumerate(idxs):
        out.alpha_composite(on_bg(frames[i]).crop(crop).resize((w * s, h * s), Image.NEAREST), ((n % cols) * w * s, (n // cols) * h * s))
    out.save(name)
SP = "/tmp/claude-0/-home-claude/1dfc3a39-58c7-5706-bacb-518a6f147f0e/scratchpad/"
contact(idle, list(range(0, 32, 2)), SP + "pix_idle_check.png", crop=(4, 2, 56, 62), s=3)
contact(juggle, list(range(0, 32, 2)), SP + "pix_juggle_check.png", crop=(4, 0, 60, 50), s=3)
print("idle", len(idle), "juggle", len(juggle), "video frames", len(cycle) * 2)
