"""Figura da Aula 01 (versão Nova): estável × marginal × instável.
Mesma planta G(s) = 1/((s+1)(0,5s+1)(0,2s+1)) em malha fechada com ganho
proporcional Kp; o limite de estabilidade é Kp = 12,6 (Routh–Hurwitz).
Uso:  python scripts/fig_aula01_nova.py
"""
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
plt.style.use(ROOT / "scripts" / "nova.mplstyle")

dt, T = 0.001, 10
t = np.arange(0, T, dt)


def malha(Kp):
    x1 = x2 = x3 = 0.0
    y = np.empty_like(t)
    for i in range(len(t)):
        y[i] = x3
        u = Kp * (1 - x3)
        x1 += dt * (u - x1)
        x2 += dt * (x1 - x2) / 0.5
        x3 += dt * (x2 - x3) / 0.2
    return y


fig, ax = plt.subplots(figsize=(4.6, 3.4), dpi=220)
for Kp, cor, rot in [(3, "#3A6EDB", "Kp = 3: estável"), (14, "#D0473B", "Kp = 14: instável")]:
    ax.plot(t, malha(Kp), color=cor, label=rot)
ax.set(xlim=(0, T), ylim=(-1, 3), xlabel="t (s)", ylabel="y(t)")
ax.legend(loc="lower center", bbox_to_anchor=(0.5, 1.0), ncol=2, fontsize=10)
fig.tight_layout()
fig.savefig(ROOT / "Notas" / "imgs" / "plots" / "fig_aula01_estabilidade.png", transparent=True)
print("ok")
