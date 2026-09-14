"""
Animação: sistema massa-mola-amortecedor em malha aberta (2ª ordem)

    m*x'' + c*x' + k*x = F(t),   F(t) = degrau de amplitude F0 em t=0

Mesma equação padrão vista em "Sistemas de Segunda Ordem" (Aula 4):
    x'' + 2*zeta*wn*x' + wn^2*x = (F0/m),  wn = sqrt(k/m),  zeta = c/(2*sqrt(k*m))

Três painéis sincronizados: a cena mecânica, a entrada F(t) (degrau) e a
saída x(t) (resposta ao degrau) — sem nenhum controlador, só a planta em
malha aberta.

Uso:
    python3 massa_mola_amortecedor.py
    python3 massa_mola_amortecedor.py --m 1.0 --k 20 --c 1.0 --forca 10
    python3 massa_mola_amortecedor.py --save saida.gif
"""
import argparse

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FuncAnimation, PillowWriter
from matplotlib.patches import Rectangle
from scipy.integrate import solve_ivp

plt.style.use("ggplot")


class MassaMolaAmortecedor:
    """Modelo (física) do sistema massa-mola-amortecedor de 2ª ordem, em malha aberta."""

    def __init__(self, m: float, k: float, c: float, forca: float) -> None:
        self.m = m
        self.k = k
        self.c = c
        self.forca = forca

    @property
    def wn(self) -> float:
        """Frequência natural não amortecida [rad/s]."""
        return np.sqrt(self.k / self.m)

    @property
    def zeta(self) -> float:
        """Coeficiente de amortecimento (adimensional)."""
        return self.c / (2 * np.sqrt(self.k * self.m))

    def classificacao(self) -> str:
        z = self.zeta
        if z == 0:
            return "não amortecido"
        if z < 1:
            return "subamortecido"
        if z == 1:
            return "criticamente amortecido"
        return "sobreamortecido"

    def _derivadas(self, t: float, z: np.ndarray) -> list:
        x, v = z
        a = (self.forca - self.c * v - self.k * x) / self.m
        return [v, a]

    def simular(self, x0: float, v0: float, t_final: float, n: int) -> tuple:
        """
        Simula a resposta ao degrau de força a partir de t=0 (com condições
        iniciais x0, v0), precedida de um trecho em t<0 no repouso, só para
        deixar visível o instante em que o degrau é aplicado.

        Retorna (t, entrada, saida), todos com o mesmo shape.
        """
        n_pre = max(n // 15, 5)
        t_pre = np.linspace(-0.15 * t_final, 0, n_pre, endpoint=False)
        t_pos = np.linspace(0, t_final, n)

        sol = solve_ivp(
            self._derivadas, (0, t_final), y0=[x0, v0], t_eval=t_pos,
            method="RK45", rtol=1e-8, atol=1e-10,
        )

        t = np.concatenate([t_pre, t_pos])
        entrada = np.concatenate([np.zeros_like(t_pre), np.full_like(t_pos, self.forca)])
        saida = np.concatenate([np.full_like(t_pre, x0), sol.y[0]])
        return t, entrada, saida


def zigzag_mola(x_inicio: float, x_fim: float, y: float, n_espiras: int = 8,
                 amplitude: float = 0.12) -> tuple:
    """Coordenadas de uma mola horizontal desenhada em ziguezague, com pontas retas."""
    trecho_reto = 0.15 * (x_fim - x_inicio)
    x_espiras_ini = x_inicio + trecho_reto
    x_espiras_fim = x_fim - trecho_reto

    n = 2 * n_espiras + 1
    xs_meio = np.linspace(x_espiras_ini, x_espiras_fim, n)
    ys_meio = np.full(n, y)
    ys_meio[1:-1] = y + amplitude * np.tile([1, -1], n_espiras)[: n - 2]

    xs = np.concatenate([[x_inicio], xs_meio, [x_fim]])
    ys = np.concatenate([[y], ys_meio, [y]])
    return xs, ys


class AnimacaoMassaMola:
    """Camada de visualização — consome (t, entrada, saída) já simulados."""

    LADO_MASSA = 0.9
    Y_MOLA = 0.22
    Y_AMORT = -0.22
    X_PAREDE = 0.0
    CILINDRO_X0 = 0.35
    CILINDRO_X1 = 1.1
    CILINDRO_MEIA_ALTURA = 0.16

    def __init__(self, t: np.ndarray, entrada: np.ndarray, saida: np.ndarray,
                 sistema: MassaMolaAmortecedor, x_equilibrio: float = 4.0) -> None:
        self.t = t
        self.entrada = entrada
        self.saida = saida
        self.sistema = sistema
        self.x_eq = x_equilibrio

        self.fig, (self.ax_mec, self.ax_in, self.ax_out) = plt.subplots(
            3, 1, figsize=(9, 9), height_ratios=[1.3, 0.7, 1]
        )
        self._montar_cena_mecanica()
        self._montar_grafico_entrada()
        self._montar_grafico_saida()

    # -- construção da cena mecânica (parede, mola, amortecedor, massa) --
    def _montar_cena_mecanica(self) -> None:
        ax = self.ax_mec
        xmax = self.x_eq + np.max(np.abs(self.saida)) + self.LADO_MASSA + 1.0
        ax.set_xlim(-0.5, xmax)
        ax.set_ylim(-1.1, 1.1)
        ax.set_aspect("equal")
        ax.set_yticks([])
        ax.set_xticks([])
        ax.set_title("Massa-Mola-Amortecedor — Malha Aberta")

        # parede (hachurada)
        ax.add_patch(Rectangle((-0.5, -1.0), 0.5, 2.0, facecolor="0.85",
                                edgecolor="black", hatch="//"))
        # solo
        ax.plot([-0.5, xmax], [-self.LADO_MASSA / 2, -self.LADO_MASSA / 2],
                color="black", lw=1.5)

        # amortecedor: cilindro fixo (bracket aberto à direita) + êmbolo, estáticos
        h = self.CILINDRO_MEIA_ALTURA
        x0c, x1c = self.CILINDRO_X0, self.CILINDRO_X1
        y = self.Y_AMORT
        ax.plot([x0c, x1c], [y + h, y + h], color="0.35", lw=2)   # tampa superior
        ax.plot([x0c, x1c], [y - h, y - h], color="0.35", lw=2)   # tampa inferior
        ax.plot([x0c, x0c], [y - h, y + h], color="0.35", lw=2)   # fundo (junto à parede)
        self.x_embolo = x1c - 0.2
        ax.plot([self.x_embolo, self.x_embolo], [y - 0.8 * h, y + 0.8 * h],
                color="0.35", lw=3)  # êmbolo (dentro do cilindro)

        # mola e haste do amortecedor (linhas atualizadas a cada frame)
        (self.linha_mola,) = ax.plot([], [], color="tab:blue", lw=1.8)
        (self.linha_amort_haste,) = ax.plot([], [], color="0.35", lw=2)

        # massa
        self.massa = Rectangle((0, -self.LADO_MASSA / 2), self.LADO_MASSA,
                                self.LADO_MASSA, facecolor="tab:orange",
                                edgecolor="black", zorder=5)
        ax.add_patch(self.massa)
        self.rotulo_massa = ax.text(0, 0, "m", ha="center", va="center",
                                     fontsize=13, fontweight="bold", zorder=6)

    def _montar_grafico_entrada(self) -> None:
        ax = self.ax_in
        ax.set_xlim(self.t[0], self.t[-1])
        margem = 1.25 * max(np.max(np.abs(self.entrada)), 1e-9)
        ax.set_ylim(-0.1 * margem, margem)
        ax.set_ylabel("F(t) [N]")
        ax.set_title("Entrada — degrau de força")
        (self.linha_entrada,) = ax.plot([], [], color="tab:blue", lw=2)
        (self.ponto_entrada,) = ax.plot([], [], "o", color="tab:red")

    def _montar_grafico_saida(self) -> None:
        ax = self.ax_out
        ax.set_xlim(self.t[0], self.t[-1])
        margem = 1.15 * max(np.max(np.abs(self.saida)), 1e-9)
        ax.set_ylim(-margem, margem)
        ax.set_xlabel("tempo [s]")
        ax.set_ylabel("x(t) [m]")
        s = self.sistema
        ax.set_title(
            f"Saída — {s.classificacao()} "
            f"($\\omega_n$={s.wn:.2f} rad/s, $\\zeta$={s.zeta:.2f})"
        )
        (self.linha_saida,) = ax.plot([], [], color="tab:orange", lw=2)
        (self.ponto_saida,) = ax.plot([], [], "o", color="tab:red")

    # -- atualização por frame --
    def _atualizar(self, i: int):
        pos_mola_direita = self.x_eq + self.saida[i] - self.LADO_MASSA / 2

        xs, ys = zigzag_mola(self.X_PAREDE, pos_mola_direita, self.Y_MOLA)
        self.linha_mola.set_data(xs, ys)
        self.linha_amort_haste.set_data([self.x_embolo, pos_mola_direita],
                                         [self.Y_AMORT, self.Y_AMORT])

        self.massa.set_x(pos_mola_direita)
        self.rotulo_massa.set_position(
            (pos_mola_direita + self.LADO_MASSA / 2, 0)
        )

        self.linha_entrada.set_data(self.t[: i + 1], self.entrada[: i + 1])
        self.ponto_entrada.set_data([self.t[i]], [self.entrada[i]])

        self.linha_saida.set_data(self.t[: i + 1], self.saida[: i + 1])
        self.ponto_saida.set_data([self.t[i]], [self.saida[i]])

        return (self.linha_mola, self.linha_amort_haste, self.massa,
                self.rotulo_massa, self.linha_entrada, self.ponto_entrada,
                self.linha_saida, self.ponto_saida)

    def rodar(self, intervalo_ms: float = 20, salvar: str | None = None) -> FuncAnimation:
        anim = FuncAnimation(
            self.fig, self._atualizar, frames=len(self.t),
            interval=intervalo_ms, blit=False,
        )
        self.fig.tight_layout()
        if salvar:
            anim.save(salvar, writer=PillowWriter(fps=int(1000 / intervalo_ms)))
            print(f"Animação salva em: {salvar}")
        else:
            plt.show()
        return anim


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--m", type=float, default=1.0, help="massa [kg]")
    parser.add_argument("--k", type=float, default=20.0, help="rigidez da mola [N/m]")
    parser.add_argument("--c", type=float, default=1.0, help="amortecimento [N.s/m]")
    parser.add_argument("--forca", type=float, default=10.0,
                         help="amplitude do degrau de força aplicado em t=0 [N]")
    parser.add_argument("--x0", type=float, default=0.0, help="deslocamento inicial [m]")
    parser.add_argument("--v0", type=float, default=0.0, help="velocidade inicial [m/s]")
    parser.add_argument("--t-final", type=float, default=10.0, help="duração da simulação [s]")
    parser.add_argument("--fps", type=int, default=50, help="quadros por segundo da animação")
    parser.add_argument("--save", type=str, default=None,
                         help="caminho para salvar a animação (.gif) em vez de exibi-la")
    args = parser.parse_args()

    sistema = MassaMolaAmortecedor(m=args.m, k=args.k, c=args.c, forca=args.forca)
    n = int(args.t_final * args.fps)
    t, entrada, saida = sistema.simular(x0=args.x0, v0=args.v0, t_final=args.t_final, n=n)

    print(f"wn = {sistema.wn:.3f} rad/s | zeta = {sistema.zeta:.3f} "
          f"({sistema.classificacao()}) | x_regime = {args.forca / args.k:.3f} m")

    anim = AnimacaoMassaMola(t, entrada, saida, sistema)
    anim.rodar(intervalo_ms=1000 / args.fps, salvar=args.save)


if __name__ == "__main__":
    main()
