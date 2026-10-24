# Inventário de animações

Animações prontas para reutilizar em qualquer deck com o tema Nova. Para
usar em outro projeto, copie `anims/` inteira (ou só os arquivos citados).
Todas começam ao entrar no slide, pausam ao sair e reiniciam com a tecla **R**.

| Nome | Arquivo | O que mostra | Uso típico | Parâmetros (`data-*`) |
|---|---|---|---|---|
| `malha-pi` | `malha.js` | Malha de controle montada bloco a bloco (fragmentos), com curvas de r, e, u, y | SC I: introdução à realimentação | — |
| `respostas` | `respostas.js` + `nova-anim.js` | Degrau de 1ª ordem (τ, 63,2 %, 4τ) e de 2ª ordem (Mp, tp, ts, envoltória, polos) | SC I: análise de resposta transitória | `tau`, `zeta`, `wn`, `speed` |
| `pi` | `pi.js` + `nova-anim.js` | PI em planta de 1ª ordem; área do erro; u = Kp·e + Ki·∫e; perturbação de carga | SC I/II: ação integral, erro em regime | `kp`, `ki`, `k`, `tau`, `speed` |
| `mpc` | `mpc.js` + `nova-anim.js` | MPC com horizonte deslizante: predição, plano de controle, restrições, QP resolvido (FISTA) | MPC, pesquisa (PowerMPC) | `np`, `lambda`, `umin`, `umax`, `step`, `speed` |
| `otimizadores` | `otimizadores.js` | GD × Momentum × Adam na Rosenbrock + perda por iteração | Deep Learning, métodos numéricos | `speed` |
| `treino-rede` | `treino-rede.js` | MLP 2–8–8–1 aprendendo "duas luas": fronteira, pesos, perda | Deep Learning | — |
| `fase` | `fase.js` + `nova-anim.js` | Retrato de fase com partículas, equilíbrios classificados; clique lança trajetórias | Não linear, Lyapunov, Koopman | `system` (vdp, pendulo, duffing), `mu`, `b`, `delta` |
| `aberta-fechada` | `aberta-fechada.js` + `nova-anim.js` | Mesma planta em malha aberta × fechada (P): erro de modelo, perturbação, instabilidade com Kp alto | SC I: Aula 1, motivação da realimentação | `kreal`, `d`, `kp` |
| `malha-aberta`, `malha-fechada`, `formas-blocos` | `diagramas.js` | Diagramas de blocos montados por fragmentos: malha aberta; malha fechada com atuador, sensor, d e n; série/paralelo/realimentação → equivalentes | SC I: Aulas 1–2 | — (use `<script src="anims/diagramas.js">` após cada diagrama) |
| `primeira-ordem` | `primeira-ordem.js` + `nova-anim.js` | 1ª ordem K/(τs+1) com eixos fixos e curva de referência: 63,2 %, tangente, faixa de 2 %, tₛ = 4τ, transitório × regime, tabela de %, polo | SC I: Aula 2 (1ª ordem) | `k`, `tau` |
| `polo-resposta` | `polo-resposta.js` + `nova-anim.js` | Arraste o polo no eixo real do plano s; a resposta ao degrau muda na hora (histórico esmaecido; semiplano direito instável) | SC I: polos, estabilidade | `p` |
| vídeo RLS | `rls.mp4` (de `scripts/anim_rls.py`) | Identificação recursiva: y × ŷ e convergência de â, b̂ | Identificação de sistemas | — |

Todas as animações com `nova-anim.js` aceitam **sliders ao vivo**:
`data-controls="zeta,wn"` cria os controles sob o canvas; mexer num parâmetro
recalcula e mostra o resultado completo (▶ reproduz de novo). Na exportação
PDF (`?print-pdf`) cada animação aparece no quadro final.

## Como inserir

Animação em canvas (o `<div>` define a altura; `nova-anim.js` uma vez por deck):

```markdown
## Resposta ao degrau

::: {style="height: 720px"}
<canvas class="nova-canvas" data-nova-anim="respostas" data-zeta="0.5" data-speed="0.8"></canvas>
:::

<script src="anims/nova-anim.js"></script>
<script src="anims/respostas.js"></script>
```

Diagrama em SVG com fragmentos (o `<script>` logo depois do `<div>`):

```markdown
::: {.nova-svg data-nova-diagram="malha-pi"}
:::

<script src="anims/malha.js"></script>
```

## Criar uma nova

Copie `respostas.js` como modelo. O esqueleto é:

```js
NovaAnim.register("nome", ({ ctx, W, H, data }) => {
  const { C, FONT, text, frame, axes, line, dot, seg, legend, ease } = NovaAnim;
  // pré-calcule a simulação aqui (determinística)
  return {
    duration: 12, hold: 3,           // segundos (antes do data-speed)
    draw(t) { /* desenha o quadro no instante t */ },
  };
}, {                                 // parâmetros p/ sliders (data-controls)
  zeta: { label: "ζ", min: 0.05, max: 0.95, step: 0.05, value: 0.3, digits: 2 },
});
```

- `frame(caixa, xlim, ylim)` mapeia dados → pixels; `axes`, `line` (com `stairs`
  para ZOH), `dot`, `seg` (com `arrow`), `legend`, `text` desenham no estilo do tema.
- Cores: `C.navy`, `C.rose`, `C.ink`, `C.muted` e a paleta das equações
  `C.a … C.h` (mesmas cores de `\eq{a}{…}`).
- Ritmo didático: 10–15 s de traçado e 3–4 s parado no fim; marcas que
  aparecem quando o cursor passa (função `ease`).
