"""Effetti sonori dei video «Lavori», sintetizzati da zero (nessun diritto da pagare).
Uso: python3 social/lavori/suoni.py luigi uscita.wav  — i tempi seguono quelli di luigi/video.html."""
import sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)

def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))
    return e

def passabasso(x, taglio):
    """filtro passa-basso a un polo; taglio può cambiare nel tempo (array in Hz)"""
    taglio = np.broadcast_to(taglio, x.shape)
    a = 1 - np.exp(-2 * np.pi * taglio / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y

def whoosh(dur=0.6, su=True):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    rumore = rng.standard_normal(n)
    curva = np.sin(np.pi * t) ** 1.6
    taglio = 300 + 5200 * (t if su else 1 - t) ** 1.3 * curva + 200
    b = passabasso(rumore, taglio) - passabasso(rumore, taglio * 0.25)
    return 0.9 * b * curva

def pop(f0=900, f1=260, dur=0.12, vol=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 40)
    return vol * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, dur / 3)

def tick(f=2400, vol=0.25):
    n = int(0.05 * SR); t = np.arange(n) / SR
    return vol * np.sin(2 * np.pi * f * t) * env(n, 0.001, 0.012)

def campanella(fond=1320, dur=0.9, vol=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * fond * k * t) * np.exp(-t * (3 + k * 2)) for k, a in [(1, 1), (1.5, .5), (2.01, .3), (3, .12)])
    return vol * s * np.minimum(1, t / 0.003)

def notifica():
    a = campanella(1568, 0.7, 0.32); b = campanella(2093, 0.9, 0.3)
    out = np.zeros(len(b) + int(0.11 * SR)); out[:len(a)] += a; out[int(0.11 * SR):] += b
    return out

def colpo(dur=1.6, vol=0.9):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 42 + 60 * np.exp(-t * 18)
    basso = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    botta = passabasso(rng.standard_normal(n), 900) * np.exp(-t * 30) * 2.5
    return vol * np.tanh(1.6 * (basso + botta))

def salita(dur=1.0, vol=0.45):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    rumore = passabasso(rng.standard_normal(n), 400 + 6000 * t ** 2)
    tono = np.sin(2 * np.pi * np.cumsum(220 + 660 * t ** 2) / SR) * 0.25
    return vol * (rumore * 0.8 + tono) * t ** 2

def scintilla(dur=1.4, vol=0.22):
    out = np.zeros(int(dur * SR))
    for i, f in enumerate([2637, 3136, 3951, 4699, 3520]):
        c = campanella(f, 0.6, 1); s = int(i * 0.07 * SR)
        out[s:s + len(c)] += c[:len(out) - s]
    return vol * out

def tappeto(durata):
    """un accordo morbido e scuro sotto tutto, che respira piano"""
    n = int(durata * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f, a in [(55, .5), (82.4, .35), (110, .3), (164.8, .18), (246.9, .1), (329.6, .06)]:
        s += a * np.sin(2 * np.pi * f * t + rng.random() * 6) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t + f))
    s = passabasso(s, 900)
    fade = np.minimum(1, t / 1.5) * np.minimum(1, (durata - t) / 1.2)
    return 0.11 * s * fade

def luigi():
    D = 22.0; T_PC, T_TEL, T_FATTO, T_FIRMA = 3.0, 10.1, 16.9, 19.1
    eventi = [(0.05, scintilla()), *[(0.35 + i * 0.2, pop(1100 - i * 120, 300, 0.1, 0.35)) for i in range(4)]]
    for c in (T_PC - .3, T_TEL - .35, T_FATTO - .3):
        eventi.append((c - 0.3, whoosh(0.65) * 1.6))
    eventi += [(T_PC + 1.4, pop()), (T_PC + 2.6, pop(1000, 300)), (T_TEL + 1.1, pop(950, 280)), (T_TEL + 1.3, whoosh(0.35, False) * 0.4),
               (T_TEL + 3.4, notifica()), (T_TEL + 5.0, pop(1050, 320))]
    eventi += [(T_FATTO + i * 0.32 + 0.05, tick(1800 + i * 300, 0.3)) for i in range(4)]
    eventi += [(T_FIRMA - 1.2, salita()), (T_FIRMA + 0.1, colpo()), (T_FIRMA + 0.15, scintilla(1.4, 0.18))]
    return D, eventi

def mixa(durata, eventi):
    out = tappeto(durata)
    for t, s in eventi:
        i = int(t * SR); out[i:i + len(s)] += s[:max(0, len(out) - i)]
    out = np.tanh(out * 1.1) * 0.9  # limitatore morbido: niente distorsione
    return out / max(1e-6, np.abs(out).max()) * 0.89

if __name__ == '__main__':
    nome, uscita = sys.argv[1], sys.argv[2]
    d, ev = {'luigi': luigi}[nome]()
    y = mixa(d, ev)
    stereo = np.stack([y, y], 1)
    with wave.open(uscita, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((stereo * 32767).astype('<i2').tobytes())
    print('suoni:', uscita, f'{d}s')
