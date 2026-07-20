#!/usr/bin/env python3
"""Gera as figuras de dados (respostas no tempo, LGR, Bode, PID) usadas
nos slides de Notas/*.qmd. Saída em Notas/imgs/plots/*.png.

Requer: numpy, matplotlib, control (pip install numpy matplotlib control)
Uso:    python3 scripts/gerar_figuras.py
"""
import os

import control as ct
import matplotlib.pyplot as plt
import numpy as np

OUT = os.path.join(os.path.dirname(__file__), "..", "Notas", "imgs", "plots")
os.makedirs(OUT, exist_ok=True)

# --- Paleta categórica fixa (ordem fixa, validada para daltonismo) ---
BLUE, AQUA, YELLOW, GREEN, VIOLET, RED, MAGENTA, ORANGE = (
    "#2a78d6", "#1baf7a", "#eda100", "#008300",
    "#4a3aa7", "#e34948", "#e87ba4", "#eb6834",
)
SERIES = [BLUE, RED, AQUA, ORANGE, VIOLET, YELLOW]
GRID = "#e1e0d9"
MUTED = "#898781"
INK = "#0b0b0b"

plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "axes.edgecolor": MUTED,
    "axes.labelcolor": INK,
    "axes.grid": True,
    "grid.color": GRID,
    "grid.linewidth": 0.8,
    "text.color": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "font.size": 12,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "lines.linewidth": 2.0,
    "legend.frameon": False,
    "savefig.dpi": 150,
    "savefig.bbox": "tight",
})


def save(fig, name):
    path = os.path.join(OUT, f"{name}.png")
    fig.savefig(path)
    plt.close(fig)
    print("gerado:", path)


# =====================================================================
# Aula 01 — Introdução
# =====================================================================

def fig_efeito_ganho():
    """Recria a Figura 1.10 de Nise: mesma planta, dois ganhos de
    controlador -> respostas bem diferentes (ganho baixo x ganho alto)."""
    fig, ax = plt.subplots(figsize=(7.4, 4.6))
    t = np.linspace(0, 12, 1200)
    planta = ct.tf([1], [1, 1, 0])  # 1 / [s(s+1)]

    casos = [
        (0.2, GREEN, "ganho baixo — lento, sem sobressinal"),
        (5.0, RED, "ganho alto — rápido, oscila bastante"),
    ]
    for k, color, lbl in casos:
        malha = ct.feedback(k * planta, 1)
        _, y = ct.step_response(malha, T=t)
        ax.plot(t, y, color=color, lw=2.4, label=lbl)
    ax.axhline(1.0, color=MUTED, lw=1.2, ls="--", label="entrada (referência)")
    ax.set_xlabel("tempo $t$ [s]")
    ax.set_ylabel("$y(t)$")
    ax.set_title("Mesma planta, mesma estrutura — só o ganho do controlador muda")
    ax.set_xlim(0, 12)
    ax.legend(loc="upper right", fontsize=10)
    save(fig, "fig_efeito_ganho")


# =====================================================================
# Aula 02 — Modelagem e Função de Transferência
# =====================================================================

def fig_polos_zeros_generico():
    """Polos e zeros genéricos de G(s) = N(s)/D(s), para ancorar a
    definição de zero (raiz de N) e polo (raiz de D)."""
    fig, ax = plt.subplots(figsize=(6.0, 4.6))
    polos = [-1, -2, -4]
    zeros = [-3]
    ax.axhline(0, color=MUTED, lw=1)
    ax.axvline(0, color=MUTED, lw=1)
    ax.plot(polos, [0, 0, 0], "x", color=RED, ms=15, mew=3, label="polos — raízes de $D(s)$")
    ax.plot(zeros, [0], "o", color=GREEN, ms=11, mfc="none", mew=2.4, label="zero — raiz de $N(s)$")
    ax.set_xlim(-5, 1)
    ax.set_ylim(-2, 2)
    ax.set_xlabel(r"Re$(s)$")
    ax.set_ylabel(r"Im$(s)$")
    ax.set_title(r"$G(s)=\dfrac{5(s+3)}{(s+1)(s+2)(s+4)}$")
    ax.legend(loc="upper left", fontsize=10)
    ax.set_aspect("equal")
    save(fig, "fig_polos_zeros_generico")


# =====================================================================
# Aula 03 — Sistemas de Primeira Ordem
# =====================================================================

def fig_1ordem_step():
    fig, ax = plt.subplots(figsize=(7, 4.2))
    t = np.linspace(0, 6, 600)
    taus = [0.5, 1.0, 2.0]
    for tau, color in zip(taus, SERIES):
        y = 1 - np.exp(-t / tau)
        ax.plot(t, y, color=color, label=rf"$\tau = {tau:g}$ s")
        ax.plot([tau], [1 - np.exp(-1)], "o", color=color, ms=5)
    ax.axhline(1 - np.exp(-1), color=MUTED, lw=1, ls="--")
    ax.text(5.6, 1 - np.exp(-1) + 0.03, "63,2 %", color=MUTED, fontsize=10, ha="right")
    ax.set_xlabel("tempo $t$ [s]")
    ax.set_ylabel("$y(t)$")
    ax.set_title(r"Resposta ao degrau — $G(s)=\dfrac{1}{\tau s + 1}$")
    ax.set_xlim(0, 6)
    ax.set_ylim(0, 1.1)
    ax.legend(loc="lower right")
    save(fig, "fig_1ordem_step")


def fig_1ordem_polo():
    fig, ax = plt.subplots(figsize=(5.2, 4.2))
    tau = 1.0
    ax.axhline(0, color=MUTED, lw=1)
    ax.axvline(0, color=MUTED, lw=1)
    ax.plot([-1 / tau], [0], "x", color=BLUE, ms=14, mew=3)
    ax.annotate(r"$s=-\dfrac{1}{\tau}$", (-1 / tau, 0), textcoords="offset points",
                xytext=(0, 18), ha="center", color=BLUE, fontsize=13)
    ax.set_xlim(-2.5, 1.0)
    ax.set_ylim(-1.5, 1.5)
    ax.set_xlabel(r"Re$(s)$")
    ax.set_ylabel(r"Im$(s)$")
    ax.set_title("Polo de um sistema de 1ª ordem")
    ax.set_aspect("equal")
    save(fig, "fig_1ordem_polo")


def fig_1ordem_python_exemplo():
    """Saída do exemplo em Python (python-control) do sensor de temperatura:
    G(s) = 1/(3s+1), degrau de 20 °C. Reproduz o que `ct.step_response` +
    matplotlib produzem, com tr, ts (2%) e o ponto de 63,2% marcados."""
    K, tau, A = 1.0, 3.0, 20.0
    G = ct.tf([K], [tau, 1])
    t, y = ct.step_response(G, T=np.linspace(0, 16, 800))
    y = A * y  # degrau de amplitude 20 °C

    info = ct.step_info(G, T=np.linspace(0, 16, 4000))
    tr, ts = info["RiseTime"], info["SettlingTime"]

    fig, ax = plt.subplots(figsize=(7.4, 4.4))
    ax.plot(t, y, color=BLUE, label=r"$y(t)=20\,(1-e^{-t/3})$")
    ax.plot([tau], [A * (1 - np.exp(-1))], "o", color=RED, ms=6, zorder=5)
    ax.annotate("63,2 %", (tau, A * (1 - np.exp(-1))), textcoords="offset points",
                xytext=(10, -14), color=RED, fontsize=10)
    ax.axvline(tr, color=MUTED, lw=1, ls="--")
    ax.axvline(ts, color=MUTED, lw=1, ls="--")
    ax.text(tr, 1.5, f"$t_r$={tr:.1f}s", color=MUTED, fontsize=9, ha="center")
    ax.text(ts, 1.5, f"$t_s$={ts:.1f}s", color=MUTED, fontsize=9, ha="center")
    ax.axhline(A, color=MUTED, lw=1, ls=":")
    ax.set_xlabel("tempo $t$ [s]")
    ax.set_ylabel(r"$y(t)$ [°C]")
    ax.set_title("python-control — step_response(G), G = 1/(3s+1)")
    ax.set_xlim(0, 16)
    ax.legend(loc="lower right")
    save(fig, "fig_1ordem_python_exemplo")


# =====================================================================
# Aula 04 — Sistemas de Segunda Ordem
# =====================================================================

def fig_2ordem_zeta():
    fig, ax = plt.subplots(figsize=(7.2, 4.4))
    t = np.linspace(0, 14, 1400)
    wn = 1.0
    zetas = [0.2, 0.4, 0.7, 1.0, 1.8]
    for zeta, color in zip(zetas, SERIES):
        sys = ct.tf([wn**2], [1, 2 * zeta * wn, wn**2])
        _, y = ct.step_response(sys, T=t)
        label = rf"$\zeta = {zeta:g}$"
        ax.plot(t, y, color=color, label=label)
    ax.axhline(1.0, color=MUTED, lw=1, ls="--")
    ax.set_xlabel(r"tempo normalizado $\omega_n t$")
    ax.set_ylabel("$y(t)$")
    ax.set_title(r"Resposta ao degrau — 2ª ordem, $\omega_n=1$ rad/s")
    ax.legend(loc="upper right", ncol=1, fontsize=10)
    save(fig, "fig_2ordem_zeta")


def fig_2ordem_polos():
    fig, ax = plt.subplots(figsize=(5.6, 4.8))
    wn = 1.0
    ax.axhline(0, color=MUTED, lw=1)
    ax.axvline(0, color=MUTED, lw=1)
    theta = np.linspace(np.pi / 2, np.pi, 100)
    ax.plot(wn * np.cos(theta), wn * np.sin(theta), color=GRID, lw=6, solid_capstyle="round", zorder=0)
    zeta = 0.5
    sigma = -zeta * wn
    wd = wn * np.sqrt(1 - zeta**2)
    ax.plot([sigma], [wd], "x", color=BLUE, ms=14, mew=3)
    ax.plot([sigma], [-wd], "x", color=BLUE, ms=14, mew=3)
    ax.plot([0, sigma], [0, wd], color=MUTED, lw=1)
    ax.annotate(r"$\theta=\cos^{-1}\zeta$", (sigma * 0.45, wd * 0.6), fontsize=11, color=MUTED)
    ax.annotate(r"$-\zeta\omega_n$", (sigma, 0.10), ha="center", fontsize=11, color=INK)
    ax.annotate(r"$j\omega_d$", (sigma - 0.55, wd), fontsize=11, color=INK)
    ax.annotate(r"$\omega_n$", (wn * np.cos(2.4) / 2, wn * np.sin(2.4) / 2 + 0.12), fontsize=11, color=MUTED)
    ax.set_xlim(-1.4, 0.6)
    ax.set_ylim(-1.4, 1.4)
    ax.set_xlabel(r"Re$(s)$")
    ax.set_ylabel(r"Im$(s)$")
    ax.set_title(r"Polos complexos conjugados — $\zeta=0{,}5$")
    ax.set_aspect("equal")
    save(fig, "fig_2ordem_polos")


def fig_2ordem_especificacoes():
    fig, ax = plt.subplots(figsize=(7.4, 4.4))
    wn, zeta = 1.0, 0.45
    t = np.linspace(0, 16, 1600)
    sys = ct.tf([wn**2], [1, 2 * zeta * wn, wn**2])
    _, y = ct.step_response(sys, T=t)
    ax.plot(t, y, color=BLUE)
    Mp = np.exp(-zeta * np.pi / np.sqrt(1 - zeta**2))
    tp = np.pi / (wn * np.sqrt(1 - zeta**2))
    ts = 4 / (zeta * wn)
    ax.axhline(1.0, color=MUTED, lw=1, ls="--")
    ax.axhline(1 + Mp, color=RED, lw=1, ls=":")
    ax.axhline(0.98, color=GREEN, lw=0.8, ls=":")
    ax.axhline(1.02, color=GREEN, lw=0.8, ls=":")
    ax.plot([tp], [1 + Mp], "o", color=RED, ms=6)
    ax.annotate(r"$M_p$", (tp, 1 + Mp), textcoords="offset points", xytext=(8, 4), color=RED)
    ax.annotate(r"$t_p$", (tp, 0.02), textcoords="offset points", xytext=(0, 4), color=INK, ha="center")
    ax.axvline(tp, color=RED, lw=0.8, ls=":")
    ax.axvline(ts, color=GREEN, lw=0.8, ls=":")
    ax.annotate(r"$t_s$ (2%)", (ts, 0.02), textcoords="offset points", xytext=(4, 4), color=GREEN)
    ax.set_xlabel("tempo $t$ [s]")
    ax.set_ylabel("$y(t)$")
    ax.set_title(r"Especificações da resposta transitória ($\zeta=0{,}45$)")
    ax.set_xlim(0, 16)
    save(fig, "fig_2ordem_especificacoes")


# =====================================================================
# Aula 05 — Resposta Transitória de Ordem Superior / Polos Dominantes
# =====================================================================

def fig_polos_dominantes():
    fig, ax = plt.subplots(figsize=(7.2, 4.4))
    t = np.linspace(0, 10, 1000)
    dom = ct.tf([1], [1, 1, 1])            # wn=1, zeta=0.5 aprox.
    completo = ct.tf([10], [1, 11, 21, 11, 10])
    _, y1 = ct.step_response(dom, T=t)
    _, y2 = ct.step_response(completo, T=t)
    ax.plot(t, y2, color=BLUE, label="sistema completo (4ª ordem)")
    ax.plot(t, y1, color=RED, ls="--", label="aproximação por polos dominantes (2ª ordem)")
    ax.set_xlabel("tempo $t$ [s]")
    ax.set_ylabel("$y(t)$")
    ax.set_title("Aproximação por polos dominantes")
    ax.legend(loc="lower right", fontsize=10)
    save(fig, "fig_polos_dominantes")


def fig_efeito_zero():
    fig, ax = plt.subplots(figsize=(7.2, 4.4))
    t = np.linspace(0, 12, 1200)
    wn, zeta = 1.0, 0.5
    base = ct.tf([wn**2], [1, 2 * zeta * wn, wn**2])
    for a, color, lbl in [(None, BLUE, "sem zero adicional"),
                          (2.0, RED, "zero em $s=-2$"),
                          (0.6, ORANGE, "zero em $s=-0{,}6$ (mais próx. do eixo $j\\omega$)")]:
        if a is None:
            sys = base
        else:
            sys = ct.tf([wn**2 / a, wn**2], [1, 2 * zeta * wn, wn**2])
        _, y = ct.step_response(sys, T=t)
        ax.plot(t, y, color=color, label=lbl)
    ax.axhline(1.0, color=MUTED, lw=1, ls="--")
    ax.set_xlabel("tempo $t$ [s]")
    ax.set_ylabel("$y(t)$")
    ax.set_title("Efeito de um zero adicional na resposta ao degrau")
    ax.legend(loc="lower right", fontsize=9)
    save(fig, "fig_efeito_zero")


def fig_efeito_polo_extra():
    fig, ax = plt.subplots(figsize=(7.2, 4.4))
    t = np.linspace(0, 14, 1400)
    wn, zeta = 1.0, 0.5
    num = [wn**2]
    den2 = [1, 2 * zeta * wn, wn**2]
    for p, color, lbl in [(None, BLUE, "somente polos dominantes"),
                          (10.0, RED, "polo extra em $s=-10$ (rápido)"),
                          (1.5, ORANGE, "polo extra em $s=-1{,}5$ (próximo)")]:
        if p is None:
            sys = ct.tf(num, den2)
        else:
            den3 = np.convolve(den2, [1, p]) / p
            sys = ct.tf([wn**2], den3)
        _, y = ct.step_response(sys, T=t)
        ax.plot(t, y, color=color, label=lbl)
    ax.axhline(1.0, color=MUTED, lw=1, ls="--")
    ax.set_xlabel("tempo $t$ [s]")
    ax.set_ylabel("$y(t)$")
    ax.set_title("Efeito de um polo real adicional na resposta ao degrau")
    ax.legend(loc="lower right", fontsize=9)
    save(fig, "fig_efeito_polo_extra")


# =====================================================================
# Aula 06 — Erro de Regime Permanente
# =====================================================================

def fig_erro_tipo():
    fig, axs = plt.subplots(1, 2, figsize=(10, 4.2))

    # Tipo 0 sob degrau: G0(s) = 10/[(s+1)(s+4)], Kp = G0(0) = 2,5
    t = np.linspace(0, 6, 900)
    G0 = ct.tf([10], [1, 5, 4])
    T0 = ct.feedback(G0, 1)
    _, y0 = ct.step_response(T0, T=t)
    ess0 = 1 - y0[-1]
    axs[0].plot(t, y0, color=BLUE, label="$y(t)$")
    axs[0].axhline(1.0, color=MUTED, lw=1, ls="--", label="$r(t)=1$")
    axs[0].annotate(rf"$e_{{ss}}\approx{ess0:.2f}$", (t[-1], y0[-1]), textcoords="offset points",
                     xytext=(-6, 10), color=RED, ha="right")
    axs[0].set_title(r"Tipo 0, degrau — $G(s)=\dfrac{10}{(s+1)(s+4)}$")
    axs[0].set_xlabel("tempo $t$ [s]")
    axs[0].set_ylabel("$y(t)$")
    axs[0].legend(fontsize=9, loc="lower right")

    # Tipo 1 sob rampa: G1(s) = 8/[s(s+1)(s+4)], Kv = 8/4 = 2 -> ess = 1/Kv = 0,5
    t2 = np.linspace(0, 25, 2500)
    G1 = ct.tf([8], [1, 5, 4, 0])
    T1 = ct.feedback(G1, 1)
    ramp = t2
    _, y1 = ct.forced_response(T1, T=t2, U=ramp)
    axs[1].plot(t2, ramp, color=MUTED, ls="--", label="$r(t)=t$")
    axs[1].plot(t2, y1, color=BLUE, label="$y(t)$")
    axs[1].annotate(r"$e_{ss}\to 0{,}5$", (16, 16), color=RED, ha="left")
    axs[1].set_title(r"Tipo 1, rampa — $G(s)=\dfrac{8}{s(s+1)(s+4)}$")
    axs[1].set_xlabel("tempo $t$ [s]")
    axs[1].set_ylabel("saída")
    axs[1].legend(fontsize=9, loc="upper left")

    fig.tight_layout()
    save(fig, "fig_erro_tipo")


# =====================================================================
# Aula 07 — Lugar Geométrico das Raízes (LGR)
# =====================================================================

def fig_objetivo_lgr():
    """LGR de K/[s(s+2)(s+4)], recortado perto do eixo real para destacar
    os polos em -2 e -4 e o ponto de quebra, no mesmo padrão estético
    (título, eixos rotulados, grade) das demais figuras — usada no box
    de dica do slide Objetivo Geral."""
    fig, ax = plt.subplots(figsize=(6.6, 4.4))
    ax.axhline(0, color=MUTED, lw=0.8, zorder=0)
    ax.axvline(0, color=MUTED, lw=0.8, zorder=0)
    sys = ct.tf([1], [1, 6, 8, 0])   # G(s) = 1 / [s(s+2)(s+4)]
    rlist = ct.root_locus_map(sys).loci
    for i in range(rlist.shape[1]):
        ax.plot(rlist[:, i].real, rlist[:, i].imag, color=BLUE, lw=2.0, zorder=1)
    poles = ct.poles(sys)
    ax.plot(poles.real, poles.imag, "x", color=RED, ms=12, mew=2.5, zorder=2,
            label="polos de malha aberta")
    ax.set_xlim(-5.5, 1.5)
    ax.set_ylim(-3.3, 3.3)
    ax.set_xlabel(r"Re$(s)$")
    ax.set_ylabel(r"Im$(s)$")
    ax.set_title(r"LGR — $G(s)H(s)=\dfrac{K}{s(s+2)(s+4)}$")
    ax.legend(fontsize=9, loc="upper right")
    save(fig, "fig_objetivo_lgr")


def fig_lgr_exemplo1():
    fig, ax = plt.subplots(figsize=(6.4, 5.2))
    sys = ct.tf([1], [1, 6, 8, 0])   # G(s) = 1 / [s(s+2)(s+4)]
    rlist = ct.root_locus_map(sys).loci
    for i in range(rlist.shape[1]):
        ax.plot(rlist[:, i].real, rlist[:, i].imag, color=BLUE, lw=1.6)
    poles = ct.poles(sys)
    ax.plot(poles.real, poles.imag, "x", color=RED, ms=12, mew=2.5, label="polos de malha aberta")
    ax.axhline(0, color=MUTED, lw=0.8)
    ax.axvline(0, color=MUTED, lw=0.8)
    ax.set_xlabel(r"Re$(s)$")
    ax.set_ylabel(r"Im$(s)$")
    ax.set_title(r"LGR — $G(s)H(s)=\dfrac{K}{s(s+2)(s+4)}$")
    ax.legend(fontsize=9, loc="upper right")
    ax.set_aspect("equal")
    save(fig, "fig_lgr_exemplo1")


def fig_lgr_exemplo2():
    fig, ax = plt.subplots(figsize=(6.4, 5.2))
    sys = ct.tf([1, 3], [1, 6, 5, 0])   # G(s) = (s+3) / [s(s+1)(s+5)]
    rlist = ct.root_locus_map(sys).loci
    for i in range(rlist.shape[1]):
        ax.plot(rlist[:, i].real, rlist[:, i].imag, color=BLUE, lw=1.6)
    poles = ct.poles(sys)
    zeros = ct.zeros(sys)
    ax.plot(poles.real, poles.imag, "x", color=RED, ms=12, mew=2.5, label="polos de malha aberta")
    ax.plot(zeros.real, zeros.imag, "o", color=GREEN, ms=9, mfc="none", mew=2.2, label="zero de malha aberta")
    ax.axhline(0, color=MUTED, lw=0.8)
    ax.axvline(0, color=MUTED, lw=0.8)
    ax.set_xlabel(r"Re$(s)$")
    ax.set_ylabel(r"Im$(s)$")
    ax.set_title(r"LGR — $G(s)H(s)=\dfrac{K(s+3)}{s(s+1)(s+5)}$")
    ax.legend(fontsize=9, loc="upper right")
    ax.set_aspect("equal")
    save(fig, "fig_lgr_exemplo2")


# =====================================================================
# Aula 08 — Resposta em Frequência
# =====================================================================

def fig_bode_exemplo():
    sys = ct.tf([10], [1, 6, 5, 0])   # K=10 / [s(s+1)(s+5)]
    mag, phase, omega = ct.frequency_response(sys, np.logspace(-2, 2, 500))
    mag_db = 20 * np.log10(mag)
    phase_deg = np.degrees(phase)
    phase_deg = np.unwrap(np.radians(phase_deg))
    phase_deg = np.degrees(phase_deg)

    fig, axs = plt.subplots(2, 1, figsize=(7.4, 6.0), sharex=True)
    axs[0].semilogx(omega, mag_db, color=BLUE)
    axs[0].axhline(0, color=MUTED, lw=0.8)
    axs[0].set_ylabel("Magnitude [dB]")
    axs[0].set_title(r"Diagrama de Bode — $G(s)=\dfrac{10}{s(s+1)(s+5)}$")

    axs[1].semilogx(omega, phase_deg, color=BLUE)
    axs[1].axhline(-180, color=MUTED, lw=0.8)
    axs[1].set_ylabel("Fase [graus]")
    axs[1].set_xlabel(r"$\omega$ [rad/s]")

    gm, pm, wg, wp = ct.margin(sys)
    if wp is not None and np.isfinite(wp):
        # wp: frequência de cruzamento de ganho (0 dB) — associada à margem de fase
        axs[0].axvline(wp, color=RED, lw=0.9, ls=":")
        axs[1].axvline(wp, color=RED, lw=0.9, ls=":")
        phase_wp = pm - 180
        axs[1].plot([wp], [phase_wp], "o", color=RED, ms=6)
        axs[1].annotate(rf"MF $\approx {pm:.0f}$°", (wp, phase_wp),
                         textcoords="offset points", xytext=(8, -4), color=RED, fontsize=10)
    if wg is not None and np.isfinite(wg):
        # wg: frequência de cruzamento de fase (-180°) — associada à margem de ganho
        axs[0].axvline(wg, color=GREEN, lw=0.9, ls=":")
        axs[1].axvline(wg, color=GREEN, lw=0.9, ls=":")
        gm_db = 20 * np.log10(gm) if gm else 0
        axs[0].plot([wg], [-gm_db], "o", color=GREEN, ms=6)
        axs[0].annotate(rf"MG $\approx {gm_db:.1f}$ dB", (wg, -gm_db),
                         textcoords="offset points", xytext=(8, 6), color=GREEN, fontsize=10)

    fig.tight_layout()
    save(fig, "fig_bode_exemplo")


# =====================================================================
# Aula 09 — Controlador PID
# =====================================================================

def fig_pid_comparacao():
    fig, ax = plt.subplots(figsize=(7.6, 4.6))
    t = np.linspace(0, 12, 1200)
    planta = ct.tf([1], [1, 3, 2, 0])  # 1 / [s(s+1)(s+2)]

    controladores = [
        ("P  ($K_p=1$)", ct.tf([1], [1]), MUTED),
        ("P  ($K_p=3{,}5$)", ct.tf([3.5], [1]), BLUE),
        ("PI ($K_p=3{,}5,\\ K_i=1{,}0$)", ct.tf([3.5, 1.0], [1, 0]), RED),
        ("PID ($K_p=6,\\ K_i=2,\\ K_d=2$)", ct.tf([2, 6, 2], [1, 0]), GREEN),
    ]
    for lbl, c, color in controladores:
        malha = ct.feedback(c * planta, 1)
        _, y = ct.step_response(malha, T=t)
        ax.plot(t, y, color=color, label=lbl)
    ax.axhline(1.0, color=MUTED, lw=1, ls="--")
    ax.set_xlabel("tempo $t$ [s]")
    ax.set_ylabel("$y(t)$")
    ax.set_title(r"Efeito das ações P, PI e PID — planta $\dfrac{1}{s(s+1)(s+2)}$")
    ax.legend(fontsize=9, loc="upper right")
    ax.set_ylim(0, 1.6)
    save(fig, "fig_pid_comparacao")


def fig_pid_ganhos():
    fig, axs = plt.subplots(1, 3, figsize=(12.6, 4.0), sharey=True)
    t = np.linspace(0, 10, 1000)
    planta = ct.tf([1], [1, 3, 2, 0])

    # Variação de Kp (P puro)
    for kp, color in zip([1, 3, 8], SERIES):
        malha = ct.feedback(kp * planta, 1)
        _, y = ct.step_response(malha, T=t)
        axs[0].plot(t, y, color=color, label=rf"$K_p={kp}$")
    axs[0].set_title(r"Variação de $K_p$ (P)")
    axs[0].legend(fontsize=9)

    # Variação de Ki (PI com Kp fixo)
    for ki, color in zip([0.5, 1.5, 4.0], SERIES):
        c = ct.tf([3, ki], [1, 0])
        malha = ct.feedback(c * planta, 1)
        _, y = ct.step_response(malha, T=t)
        axs[1].plot(t, y, color=color, label=rf"$K_i={ki:g}$")
    axs[1].set_title(r"Variação de $K_i$ (PI, $K_p=3$)")
    axs[1].legend(fontsize=9)

    # Variação de Kd (PD com Kp fixo)
    for kd, color in zip([0.0, 1.0, 3.0], SERIES):
        c = ct.tf([kd, 3], [1])
        malha = ct.feedback(c * planta, 1)
        _, y = ct.step_response(malha, T=t)
        axs[2].plot(t, y, color=color, label=rf"$K_d={kd:g}$")
    axs[2].set_title(r"Variação de $K_d$ (PD, $K_p=3$)")
    axs[2].legend(fontsize=9)

    for a in axs:
        a.axhline(1.0, color=MUTED, lw=1, ls="--")
        a.set_xlabel("tempo $t$ [s]")
    axs[0].set_ylabel("$y(t)$")
    fig.tight_layout()
    save(fig, "fig_pid_ganhos")


if __name__ == "__main__":
    fig_efeito_ganho()
    fig_polos_zeros_generico()
    fig_1ordem_step()
    fig_1ordem_polo()
    fig_1ordem_python_exemplo()
    fig_2ordem_zeta()
    fig_2ordem_polos()
    fig_2ordem_especificacoes()
    fig_polos_dominantes()
    fig_efeito_zero()
    fig_efeito_polo_extra()
    fig_erro_tipo()
    fig_objetivo_lgr()
    fig_lgr_exemplo1()
    fig_lgr_exemplo2()
    fig_bode_exemplo()
    fig_pid_comparacao()
    fig_pid_ganhos()
