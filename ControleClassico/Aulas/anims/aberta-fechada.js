/* =====================================================================
   Malha aberta × malha fechada, lado a lado, na mesma planta:
     G(s) = K / ((s + 1)(0,5s + 1)(0,2s + 1))
   - malha aberta: u = r / K_nominal (ação calculada pelo modelo)
   - malha fechada: controlador proporcional, u = Kp·e
   Degrau de referência em t = 1 s e perturbação de carga em t = 10 s.
   Sliders: ganho real da planta (erro de modelo), perturbação e Kp —
   com Kp alto a malha fechada oscila e, acima de ~12,6, fica instável.

   Parâmetros: data-kreal="1" data-d="-0.3" data-kp="4"
   ===================================================================== */
NovaAnim.register("aberta-fechada", ({ ctx, W, H, data }) => {
  const { C, FONT, fmt, text, frame, axes, line, dot, seg, legend, ease } = NovaAnim;
  const Kr = parseFloat(data.kreal || "1"), dA = parseFloat(data.d || "-0.3"), Kp = parseFloat(data.kp || "4");
  const Kn = 1, T = 20, dt = 0.002, tR = 1, tD = 10;

  // --- Simulação: três atrasos de 1ª ordem em cascata ---
  function sim(closed) {
    const ts = [], y = [], u = [];
    let x1 = 0, x2 = 0, x3 = 0, blown = false;
    for (let i = 0, n = Math.round(T / dt); i <= n; i++) {
      const t = i * dt, r = t >= tR ? 1 : 0, d = t >= tD ? dA : 0;
      const uk = closed ? Kp * (r - x3) : r / Kn;
      if (i % 10 === 0) { ts.push(t); y.push(x3); u.push(uk); }
      x1 += dt * (Kr * (uk + d) - x1);
      x2 += dt * (x1 - x2) / 0.5;
      x3 += dt * (x2 - x3) / 0.2;
      if (Math.abs(x3) > 1e3) { blown = true; break; }
    }
    return { ts, y, u, blown };
  }
  const A = sim(false), F = sim(true);
  const unstable = Kp * Kr >= 12.6 || F.blown;
  const N = A.ts.length;
  const at = (S, t) => S.y[Math.min(S.y.length - 1, Math.round(t / (dt * 10)))];
  const errA = 1 - at(A, tD - 0.05), errA2 = 1 - at(A, T), errF = 1 - at(F, tD - 0.05), errF2 = 1 - at(F, T);

  // --- Geometria ---
  const right = 400, x0 = 70, w = W - x0 - right - 30;
  const Fy = frame({ x: x0, y: 50, w, h: 330 }, [0, T], [-0.4, 1.8]);
  const Fu = frame({ x: x0, y: 470, w, h: 170 }, [0, T], [-1, Math.max(4, Math.min(16, Kp + 1))]);
  const px = x0 + w + 60;

  return {
    duration: 13, hold: 4,
    draw(t) {
      const p = Math.min(t / 12, 1), n = Math.max(2, Math.round(p * (N - 1)) + 1), tc = A.ts[Math.min(n - 1, N - 1)];

      axes(ctx, Fy, { yticks: [0, 0.5, 1, 1.5], xticks: [0, 5, 10, 15, 20], ylabel: "saída y(t)" });
      line(ctx, Fy, A.ts, A.ts.map((s) => (s >= tR ? 1 : 0)), { color: C.ink, width: 2, dash: [8, 6], n });
      line(ctx, Fy, A.ts, A.y, { color: C.g, width: 3.2, n });
      line(ctx, Fy, F.ts, F.y, { color: C.d, width: 3.2, n: Math.min(n, F.ts.length) });
      legend(ctx, [{ label: "referência r", color: C.ink, dash: [8, 6] }, { label: "malha aberta", color: C.g },
        { label: "malha fechada", color: C.d }], x0 + w - 640, 32);

      axes(ctx, Fu, { yticks: [0, 2, 4].filter((v) => v <= Fu.ylim[1]), xticks: [0, 5, 10, 15, 20], xlabel: "t (s)", ylabel: "ação de controle u(t)" });
      line(ctx, Fu, A.ts, A.u, { color: C.g, width: 2.4, n });
      line(ctx, Fu, F.ts, F.u, { color: C.d, width: 2.4, n: Math.min(n, F.ts.length) });

      if (tc >= tD) {
        const a = ease((tc - tD) / 0.8);
        seg(ctx, Fy.x(tD), Fy.box.y + 4, Fy.x(tD), Fy.box.y + Fy.box.h, { color: C.rose, dash: [4, 5], alpha: a });
        text(ctx, `perturbação d = ${fmt(dA, 2)}`, Fy.x(tD) + 10, Fy.box.y + 22, { font: FONT.sansM, color: C.rose, alpha: a });
      }
      if (p < 1) [Fy, Fu].forEach((Fr) => seg(ctx, Fr.x(tc), Fr.box.y, Fr.x(tc), Fr.box.y + Fr.box.h, { color: C.rose, alpha: 0.4 }));

      // --- painel ---
      text(ctx, "Duas estratégias", px, 64, { font: FONT.title, color: C.navy });
      text(ctx, `ganho real K = ${fmt(Kr, 2)} (modelo: 1)`, px, 100, { font: FONT.ital, color: C.grey });
      text(ctx, `controlador: u = Kp·e,  Kp = ${fmt(Kp, 1)}`, px, 130, { font: FONT.ital, color: C.grey });
      const show = (y0, title, col, e1, e2, extra) => {
        text(ctx, title, px, y0, { font: FONT.sansB, color: col });
        text(ctx, "erro antes de d", px, y0 + 36, { font: FONT.sans, color: C.ink });
        text(ctx, fmt(e1, 2), px + 290, y0 + 36, { font: FONT.sansM, color: col, align: "right" });
        text(ctx, "erro depois de d", px, y0 + 68, { font: FONT.sans, color: C.ink });
        text(ctx, fmt(e2, 2), px + 290, y0 + 68, { font: FONT.sansM, color: col, align: "right" });
        if (extra) text(ctx, extra, px, y0 + 100, { font: FONT.ital, color: C.muted });
      };
      const vis = ease((tc - 12) / 1);
      ctx.save(); ctx.globalAlpha = Math.max(vis, 0.15);
      show(200, "Malha aberta", C.g, errA, errA2, "não vê a saída: não corrige");
      if (unstable) {
        text(ctx, "Malha fechada", px, 380, { font: FONT.sansB, color: C.d });
        text(ctx, "INSTÁVEL", px, 420, { font: '600 30px "Inter", sans-serif', color: C.rose });
        text(ctx, "Kp·K acima de 12,6", px, 452, { font: FONT.ital, color: C.muted });
      } else show(380, "Malha fechada", C.d, errF, errF2, "teoria (P): 1/(1 + Kp·K) = " + fmt(1 / (1 + Kp * Kr), 2));
      ctx.restore();
      seg(ctx, px, 560, px + 290, 560, { color: C.rule, width: 1 });
      text(ctx, "mais ganho → menos erro,", px, 600, { font: FONT.serif, color: C.ink });
      text(ctx, "mas mais oscilação", px, 632, { font: FONT.serif, color: C.ink });
    },
  };
}, {
  kreal: { label: "K real", min: 0.5, max: 1.5, step: 0.05, value: 1,    digits: 2 },
  d:     { label: "d",      min: -0.8, max: 0.8, step: 0.05, value: -0.3, digits: 2 },
  kp:    { label: "Kp",     min: 0.5,  max: 15,  step: 0.5,  value: 4,    digits: 1 },
});
