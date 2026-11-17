"""Funções de apoio da aula de identificação (Tópicos Especiais em Controle).

Reúne o que as notas Ident01–04 (Notas/fundamentos/identificacao-sistemas) e a nota
do filtro Sallen-Key (ProjetosCCS/Notas/IdentificacaoSallenKeyPRBS) usavam:
leitura do CSV do CCS, PRBS por LFSR, ARX por mínimos quadrados, simulação livre,
FIT e autocorrelação dos resíduos.
"""
from pathlib import Path

import numpy as np


# ---------------------------------------------------------------------------
# Dados do CCS (Code Composer Studio): 1ª linha = nomes, 2ª = Sample/Value
# ---------------------------------------------------------------------------
def le_csv_ccs(caminho):
    linhas = [l.split(",") for l in Path(caminho).read_text().splitlines()]
    nomes = {i: n.strip() for i, n in enumerate(linhas[0]) if n.strip()}
    return {n: np.array([float(l[i + 1]) for l in linhas[2:] if len(l) > i + 1 and l[i + 1]])
            for i, n in nomes.items()}


# ---------------------------------------------------------------------------
# PRBS por registrador de deslocamento (LFSR, comprimento máximo)
# ---------------------------------------------------------------------------
TAPS = {3: (3, 2), 4: (4, 3), 5: (5, 3), 6: (6, 5), 7: (7, 6), 8: (8, 6, 5, 4), 9: (9, 5), 10: (10, 7)}


def prbs(n_bits, nb=1, amp=1.0, semente=None):
    """Um período (2^n − 1 bits) de PRBS em ±amp, cada bit repetido nb amostras."""
    reg = [1] * n_bits if semente is None else list(semente)
    out = []
    for _ in range(2 ** n_bits - 1):
        out.append(reg[-1])
        fb = 0
        for t in TAPS[n_bits]:
            fb ^= reg[t - 1]
        reg = [fb] + reg[:-1]
    return amp * np.repeat(2 * np.array(out) - 1.0, nb)


# ---------------------------------------------------------------------------
# ARX (convenção de Ljung e do MATLAB `arx`):
#   A(q) y[k] = B(q) u[k] + e[k],  A(q) = 1 + a1 q^-1 + ... + a_na q^-na,
#   B(q) = b1 q^-nk + ... + b_nb q^-(nk+nb-1)
#   y[k] = -a1 y[k-1] - ... - a_na y[k-na] + b1 u[k-nk] + ... + e[k]
# ---------------------------------------------------------------------------
def regressores(u, y, na, nb, nk=1):
    n0 = max(na, nk + nb - 1)
    k = np.arange(n0, len(y))
    cols = [-y[k - i] for i in range(1, na + 1)] + [u[k - nk - j] for j in range(nb)]
    return np.column_stack(cols), y[k]


def arx(u, y, na, nb, nk=1):
    Phi, Y = regressores(u, y, na, nb, nk)
    th, *_ = np.linalg.lstsq(Phi, Y, rcond=None)   # QR/SVD: mais estável que inv(Phi'Phi)
    return th[:na], th[na:]


def simula(a, b, u, nk=1, y0=None):
    """Simulação livre: realimenta a saída do próprio modelo."""
    na, nb = len(a), len(b)
    y = np.zeros(len(u)) if y0 is None else np.array(y0, float).copy()
    for k in range(max(na, nk + nb - 1), len(u)):
        y[k] = -sum(a[i] * y[k - 1 - i] for i in range(na)) + sum(b[j] * u[k - nk - j] for j in range(nb))
    return y


def prediz(a, b, u, y, nk=1):
    """Predição um passo à frente: usa o y medido no passado."""
    Phi, _ = regressores(u, y, len(a), len(b), nk)
    yp = np.full(len(y), np.nan)
    yp[len(y) - len(Phi):] = Phi @ np.r_[a, b]
    return yp


def fit(y, yh):
    m = ~np.isnan(yh)
    y, yh = y[m], yh[m]
    return 100 * (1 - np.linalg.norm(y - yh) / np.linalg.norm(y - y.mean()))


def acf(x, max_lag=25):
    x = x[~np.isnan(x)] - np.nanmean(x)
    c0 = x @ x
    return np.array([x[: len(x) - l] @ x[l:] / c0 for l in range(max_lag + 1)])


def ganho_e_tau(a, b, Ts):
    """Ganho estático B(1)/A(1) e constantes de tempo dos polos reais (−Ts/ln z)."""
    K = np.sum(b) / (1 + np.sum(a))
    z = np.roots(np.r_[1, np.asarray(a)])
    tau = np.sort(-Ts / np.log(np.abs(z)))[::-1]
    return K, z, tau


def virgula(x, d=2):
    return f"{x:.{d}f}".replace(".", ",")


# ---------------------------------------------------------------------------
# Mínimos quadrados recursivos (MQR / RLS) com fator de esquecimento λ
# ---------------------------------------------------------------------------
def mqr(Phi, Y, lam=1.0, delta=1e3, theta0=None):
    """Percorre as linhas de Phi uma a uma. Devolve a história de θ̂[k] e do erro a priori."""
    n = Phi.shape[1]
    th = np.zeros(n) if theta0 is None else np.array(theta0, float)
    P = delta * np.eye(n)
    TH, EPS = np.zeros((len(Y), n)), np.zeros(len(Y))
    for k, (phi, yk) in enumerate(zip(Phi, Y)):
        eps = yk - phi @ th                     # erro de predição a priori
        L = P @ phi / (lam + phi @ P @ phi)     # ganho
        th = th + L * eps                       # correção
        P = (P - np.outer(L, phi @ P)) / lam    # covariância
        TH[k], EPS[k] = th, eps
    return TH, EPS
