import numpy as np, wave, sys
SR = 22050
rng = np.random.default_rng(7)

def crush(x, hold=2, bits=8):
    x = np.repeat(x[::hold], hold)[:len(x)]            # sample-and-hold = lo-fi
    q = 2 ** (bits - 1)
    return np.round(np.clip(x, -1, 1) * q) / q

def square(freq):                                       # freq: array per sample
    ph = np.cumsum(freq) / SR
    return np.where((ph % 1) < 0.5, 1.0, -1.0)

def noise(n, step):                                     # NES-style stepped noise
    v = rng.uniform(-1, 1, n // step + 1)
    return np.repeat(v, step)[:n]

def env(n, attack, decay_pow=1.5):
    t = np.linspace(0, 1, n)
    a = np.minimum(1, t / max(attack, 1e-6))
    return a * (1 - t) ** decay_pow

def save(name, x):
    x = crush(x / max(1e-9, np.abs(x).max()) * 0.9)
    data = ((x + 1) * 127.5).astype(np.uint8)            # 8-bit unsigned PCM
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(1); w.setframerate(SR); w.writeframes(data.tobytes())

# Throw: big, low pitch dive with a rumbling fire tail (the "charged throw" the user picked)
n = int(0.7 * SR); t = np.arange(n) / SR
f = 600 * np.exp(-t * 6) + 55
x = 0.5 * square(f) + 0.35 * square(f * 0.5) + 0.8 * noise(n, 5) * np.exp(-t * 3)
save("fireball_throw.wav", x * env(n, 0.01, 1.2))

# Charge: plays while K is held. A pulse-wave whine that climbs with fast vibrato, over fire
# crackles that get denser as it charges, ending in a bright two-note "ready" chime at full power.
n = int(1.5 * SR); t = np.arange(n) / SR
p = t / t[-1]                                            # 0 -> 1 charge progress
whine = 110 * 2 ** (p * 2.5) * (1 + 0.04 * np.sign(np.sin(2 * np.pi * (8 + 16 * p) * t)))
ph = np.cumsum(whine) / SR
pulse = np.where((ph % 1) < (0.5 - 0.375 * p), 1.0, -1.0)   # duty cycle narrows = thinner, hotter tone
crackle_gate = rng.random(n // 200 + 1).repeat(200)[:n] < (0.15 + 0.6 * p)
crackle = noise(n, 2) * crackle_gate * (0.2 + 0.4 * p)
x = 0.45 * pulse * (0.4 + 0.6 * p) + crackle
ding_at = int(1.25 * SR)                                   # full-charge chime
for k, fr in enumerate((1318.5, 1760.0)):
    s = ding_at + k * int(0.06 * SR); m = n - s; tt = np.arange(m) / SR
    x[s:] += 0.5 * square(np.full(m, fr)) * np.exp(-tt * 14)
x = x * np.minimum(1, t / 0.04)

# Whirl at the end: a swirling "fully charged" sound -- the pitch spins fast around a centre
# while a whooshing noise speeds up and slows down, as if the flame is spinning in his hand.
m = int(0.7 * SR); tw = np.arange(m) / SR; q = tw / tw[-1]
spin = 14 + 10 * np.sin(np.pi * q)                        # spin speeds up, then settles
centre = 520 + 180 * q
wf = centre + 260 * np.sin(2 * np.pi * np.cumsum(spin) / SR)
tone = 0.5 * square(wf) + 0.25 * square(wf * 1.5)
step = np.clip((6 - 4 * np.abs(np.sin(2 * np.pi * np.cumsum(spin) / SR))).astype(int), 2, 6)
wh = np.empty(m); i = 0; v = 0.0
while i < m:                                              # noise whose grain follows the spin = whoosh
    v = rng.uniform(-1, 1); k = step[i]; wh[i:i + k] = v; i += k
whirl = (tone + 0.45 * wh) * np.sin(np.pi * q) ** 0.6 * (0.75 + 0.25 * np.sin(2 * np.pi * np.cumsum(spin) / SR))
overlap = int(0.1 * SR)                                   # blend into the tail of the chime
out = np.concatenate([x, np.zeros(m - overlap)])
out[len(x) - overlap:] += whirl
save("fireball_charge.wav", out)
print("ok")
