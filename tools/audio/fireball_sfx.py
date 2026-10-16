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

# 1) quick throw: pitch dive + noise whoosh
n = int(0.32 * SR); t = np.arange(n) / SR
f = 900 * np.exp(-t * 9) + 110
x = 0.55 * square(f) + 0.6 * noise(n, 3) * np.exp(-t * 6)
save("fireball_throw.wav", x * env(n, 0.02))

# 2) charge loop: rising stepped arpeggio + crackle
n = int(1.2 * SR); t = np.arange(n) / SR
base = 180 * 2 ** (t / 1.2 * 2)                          # rises two octaves
arp = np.array([1, 1.25, 1.5, 2])[(np.floor(t * 30) % 4).astype(int)]
x = 0.5 * square(base * arp) * (0.6 + 0.4 * (np.floor(t * 20) % 2))
x += 0.35 * noise(n, 6) * (rng.random(n // 300 + 1).repeat(300)[:n] > 0.6)
save("fireball_charge.wav", x * np.minimum(1, t / 0.05))

# 3) fully charged throw: bigger, lower, longer tail
n = int(0.7 * SR); t = np.arange(n) / SR
f = 600 * np.exp(-t * 6) + 55
x = 0.5 * square(f) + 0.35 * square(f * 0.5) + 0.8 * noise(n, 5) * np.exp(-t * 3)
save("fireball_charged_throw.wav", x * env(n, 0.01, 1.2))
print("ok")
