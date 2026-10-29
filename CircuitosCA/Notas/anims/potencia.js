/* =====================================================================
   Animações em canvas para potência em CA (base: nova-anim.js).

     "potencia-instantanea"  v(t), i(t) e p(t) = v·i ao longo de dois
                             períodos; trechos com p < 0 sombreados e a
                             média P tracejada. Parâmetro: theta (θv − θi, graus)
     "pt-ativa-reativa"      p(t) separada em parcela ativa P[1 + cos(2ωt + 2θi)]
                             e reativa −Q sen(2ωt + 2θi). Parâmetro: theta (graus)
     "fasores-rlc"           fasores V e I girando para R, L e C, com p(t) de
                             cada elemento e o cursor no instante atual
     "correcao-fp"           triângulo de potências antes e depois do banco
                             de capacitores: Q1 → Q2, Qc, S1 → S2, C e a
                             corrente. Parâmetros: fp1, fp2 (atrasados),
                             p (W), v (V eficaz), f (Hz)

   Uso:
     ::: {style="height: 640px"}
     <canvas class="nova-canvas" data-nova-anim="potencia-instantanea" data-controls="theta"></canvas>
     :::
     <script src="anims/nova-anim.js"></script>
     <script src="anims/potencia.js"></script>
   ===================================================================== */
(function () {
  "use strict";
  const { C, FONT, fmt, ease, clamp, text, frame, axes, line, dot, seg, legend, register } = NovaAnim;
  const MATH = (px) => `italic ${px}px "Source Serif 4", Georgia, serif`;
  const NUM = (px, w = 600) => `${w} ${px}px "Inter", sans-serif`;
  const deg = Math.PI / 180;

  // -------------------------------------------------------------------
  register("potencia-instantanea", ({ ctx, W, H, data }) => {
    const th = parseFloat(data.theta || "60") * deg;
    // Vm = Im = 1, θv = 0, θi = −θ; eixo em graus elétricos (ωt)
    const N = 720, T = 720, xs = [], v = [], i = [], p = [];
    for (let k = 0; k <= N; k++) {
      const wt = (k / N) * T * deg;
      xs.push((k / N) * T);
      v.push(Math.cos(wt)); i.push(Math.cos(wt - th)); p.push(Math.cos(wt) * Math.cos(wt - th));
    }
    const P = 0.5 * Math.cos(th);
    const box = { x: 90, y: 60, w: W * 0.66 - 90, h: H - 150 };
    const F = frame(box, [0, T], [-1.15, 1.15]);

    return {
      duration: 6, hold: 5,
      draw(t) {
        const n = Math.round(clamp(t / 5, 0, 1) * N) + 1;
        axes(ctx, F, {
          yticks: [-1, -0.5, 0, 0.5, 1], yd: 1,
          xticks: [0, 180, 360, 540, 720], xfmt: (u) => u + "°", xlabel: "ωt",
        });
        // trechos com p < 0: energia devolvida à fonte
        ctx.save();
        ctx.fillStyle = C.e; ctx.globalAlpha = 0.16;
        for (let k = 1; k < n; k++) {
          if (p[k] < 0) {
            const x0 = F.x(xs[k - 1]), x1 = F.x(xs[k]);
            ctx.fillRect(x0, F.y(0), x1 - x0 + 0.5, F.y(p[k]) - F.y(0));
          }
        }
        ctx.restore();
        line(ctx, F, xs, v, { n, color: C.d, width: 2.4 });
        line(ctx, F, xs, i, { n, color: C.g, width: 2.4, dash: [10, 7] });
        line(ctx, F, xs, p, { n, color: C.navy, width: 3.6 });
        // valor médio (parcela constante) aparece ao fim do traçado
        const a = ease((t - 5) / 0.8);
        if (a > 0) {
          seg(ctx, box.x, F.y(P), box.x + box.w, F.y(P), { color: C.a, width: 3, dash: [12, 8], alpha: a });
          text(ctx, "média", box.x + box.w + 10, F.y(P), { font: FONT.ital, color: C.a, baseline: "middle", alpha: a });
        }
        legend(ctx, [
          { label: "v(t)", color: C.d },
          { label: "i(t)", color: C.g, dash: [10, 7] },
          { label: "p(t) = v·i", color: C.navy },
        ], box.x + 10, 26);

        // painel: valores normalizados (Vm = Im = 1)
        const x0 = W * 0.71, w = W - x0 - 20;
        text(ctx, `θ = θv − θi = ${fmt(th / deg, 0)}°`, x0, 90, { font: FONT.sansB, color: C.navy });
        text(ctx, "Vm = Im = 1", x0, 126, { font: FONT.sans, color: C.muted });
        text(ctx, "média = ½ cos θ", x0, 200, { font: MATH(30), color: C.a });
        text(ctx, fmt(P, 3), x0 + w, 200, { font: NUM(30), color: C.a, align: "right" });
        text(ctx, "oscilação em 2ω", x0, 256, { font: MATH(30), color: C.b });
        text(ctx, "± 0,500", x0 + w, 256, { font: NUM(30), color: C.b, align: "right" });
        const nat = Math.abs(th) < 0.5 * deg ? "i em fase com v"
          : th > 0 ? "i atrasada de v" : "i adiantada de v";
        text(ctx, nat, x0, 320, { font: FONT.ital, color: C.grey });
        // fração do período com p < 0
        const neg = p.filter((u) => u < -1e-9).length / p.length;
        ctx.save(); ctx.fillStyle = C.e; ctx.globalAlpha = 0.16; ctx.fillRect(x0, 420, 28, 28); ctx.restore();
        text(ctx, `p < 0 em ${fmt(100 * neg, 0)} % do tempo`, x0 + 40, 442, { font: FONT.sansM });
        text(ctx, "energia devolvida à fonte", x0 + 40, 474, { font: FONT.sans, color: C.muted });
      },
    };
  }, {
    theta: { label: "θ", min: -90, max: 90, step: 1, value: 60, digits: 0, unit: "°" },
  });

  // -------------------------------------------------------------------
  register("correcao-fp", ({ ctx, W, H, data }) => {
    const P = parseFloat(data.p || "1200"), V = parseFloat(data.v || "220"), f = parseFloat(data.f || "60");
    const fp1 = parseFloat(data.fp1 || "0.75");
    const fp2 = Math.max(fp1, parseFloat(data.fp2 || "0.95"));   // só corrige para cima
    const th1 = Math.acos(fp1), th2 = Math.acos(fp2);
    const Q1 = P * Math.tan(th1), Q2 = P * Math.tan(th2), Qc = Q1 - Q2;
    const S1 = P / fp1, S2 = P / fp2;
    const Cuf = (Qc / (2 * Math.PI * f * V * V)) * 1e6;
    // escala pelo triângulo inicial (Q1), para ocupar toda a altura
    const O = { x: 90, y: H - 80 };
    const s = Math.min((W * 0.5 - 200) / P, (H - 130) / Q1);
    const X = O.x + P * s, Y = (q) => O.y - q * s;

    function angle(th, r, color, label, a) {
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(O.x, O.y, r, -th, 0); ctx.stroke(); ctx.restore();
      text(ctx, label, O.x + (r + 14) * Math.cos(th / 2), O.y - (r + 14) * Math.sin(th / 2),
        { font: MATH(26), color, baseline: "middle", alpha: a });
    }

    return {
      duration: 6, hold: 6,
      draw(t) {
        const a1 = ease(t / 1.2), a2 = ease((t - 1.2) / 1.2), a3 = ease((t - 3) / 2);
        // P
        seg(ctx, O.x, O.y, O.x + P * s * a1, O.y, { color: C.a, width: 5 });
        text(ctx, `P = ${fmt(P, 0)} W`, O.x + (P * s) / 2, O.y + 40, { font: MATH(28), color: C.a, align: "center", alpha: a1 });
        // triângulo antes da correção
        if (a2 > 0) {
          seg(ctx, X, O.y, X, Y(Q1 * a2), { color: C.b, width: 5, alpha: 1 - 0.6 * a3 });
          seg(ctx, O.x, O.y, O.x + (X - O.x) * a2, O.y - (O.y - Y(Q1)) * a2, { color: C.ink, width: 3.5, alpha: 1 - 0.6 * a3 });
          text(ctx, "S₁", (O.x + X) / 2 - 24, (O.y + Y(Q1)) / 2 - 16, { font: MATH(30), color: C.ink, align: "right", alpha: a2 * (1 - 0.5 * a3) });
          text(ctx, "Q₁", X + 16, Y(Q1) + 10, { font: MATH(30), color: C.b, alpha: a2 * (1 - 0.5 * a3) });
          angle(th1, 90, C.muted, "θ₁", a2 * (1 - 0.5 * a3));
        }
        // capacitor: Qc desce o vértice de Q1 a Q2
        if (a3 > 0 && Qc > 0.5) {
          const q = Q1 - Qc * a3;
          ctx.save(); ctx.strokeStyle = C.e; ctx.lineWidth = 9; ctx.globalAlpha = 0.75; ctx.lineCap = "butt";
          ctx.beginPath(); ctx.moveTo(X + 90, Y(Q1)); ctx.lineTo(X + 90, Y(q)); ctx.stroke(); ctx.restore();
          text(ctx, "Qc", X + 108, (Y(Q1) + Y(q)) / 2, { font: MATH(30), color: C.e, baseline: "middle" });
          seg(ctx, X, O.y, X, Y(q), { color: C.b, width: 5 });
          seg(ctx, O.x, O.y, X, Y(q), { color: C.navy, width: 4.5 });
          if (a3 > 0.95) {
            text(ctx, "S₂", (O.x + X) / 2 + 10, (O.y + Y(Q2)) / 2 + 40, { font: MATH(30), color: C.navy });
            text(ctx, "Q₂", X - 16, Y(Q2) + 34, { font: MATH(30), color: C.b, align: "right" });
            angle(th2, 150, C.navy, "θ₂", 1);
          }
        }

        // painel de valores
        const x0 = W * 0.6, w = W - x0 - 20, c1 = x0 + w * 0.6, c2 = x0 + w;
        text(ctx, `V = ${fmt(V, 0)} V   f = ${fmt(f, 0)} Hz`, x0, 50, { font: FONT.sansM, color: C.grey });
        text(ctx, "antes", c1, 110, { font: FONT.sansB, color: C.muted, align: "right" });
        text(ctx, "depois", c2, 110, { font: FONT.sansB, color: C.navy, align: "right" });
        const row = (lab, b, d, y, color = C.ink) => {
          text(ctx, lab, x0, y, { font: MATH(28), color });
          text(ctx, b, c1, y, { font: NUM(28, 400), color: C.muted, align: "right" });
          text(ctx, d, c2, y, { font: NUM(28), color, align: "right", alpha: a3 > 0.95 ? 1 : 0.25 });
        };
        row("fp", fmt(fp1, 2), fmt(fp2, 2), 160);
        row("θ", fmt(th1 / deg, 1) + "°", fmt(th2 / deg, 1) + "°", 208);
        row("Q (var)", fmt(Q1, 0), fmt(Q2, 0), 256, C.b);
        row("S (VA)", fmt(S1, 0), fmt(S2, 0), 304, C.navy);
        row("I (A)", fmt(S1 / V, 2), fmt(S2 / V, 2), 352);
        seg(ctx, x0, 392, c2, 392, { color: C.rule, width: 1.5 });
        text(ctx, "Qc = P (tg θ₁ − tg θ₂)", x0, 440, { font: MATH(28), color: C.e });
        text(ctx, fmt(Qc, 0) + " var", c2, 440, { font: NUM(28), color: C.e, align: "right" });
        text(ctx, "C = Qc / (ω V²)", x0, 492, { font: MATH(28), color: C.e });
        text(ctx, fmt(Cuf, 1) + " μF", c2, 492, { font: NUM(32), color: C.e, align: "right" });
        if (Qc < 0.5) text(ctx, "fp₂ ≤ fp₁: nada a corrigir", x0, 548, { font: FONT.ital, color: C.muted });
        else text(ctx, `corrente cai ${fmt(100 * (1 - S2 / S1), 0)} % com o mesmo P`, x0, 548, { font: FONT.ital, color: C.grey });
      },
    };
  }, {
    fp1: { label: "fp₁", min: 0.5, max: 0.95, step: 0.01, value: 0.75, digits: 2 },
    fp2: { label: "fp₂", min: 0.8, max: 1, step: 0.01, value: 0.95, digits: 2 },
  });
  // seta (linha + ponta preenchida)
  function vec(ctx, x0, y0, x1, y1, color, o = {}) {
    const a = Math.atan2(y1 - y0, x1 - x0), L = o.head || 16;
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = o.width || 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * L * 0.6, y1 - Math.sin(a) * L * 0.6); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - L * Math.cos(a - 0.38), y1 - L * Math.sin(a - 0.38));
    ctx.lineTo(x1 - L * Math.cos(a + 0.38), y1 - L * Math.sin(a + 0.38));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // -------------------------------------------------------------------
  register("pt-ativa-reativa", ({ ctx, W, H, data }) => {
    const th = parseFloat(data.theta || "60") * deg;
    // Vm = Im = 1 ⇒ Vrms·Irms = ½; θv = 0, θi = −θ
    const P = 0.5 * Math.cos(th), Q = 0.5 * Math.sin(th);
    const N = 720, T = 720, xs = [], pa = [], pr = [], p = [];
    for (let k = 0; k <= N; k++) {
      const wt = (k / N) * T * deg, arg = 2 * wt - 2 * th;
      xs.push((k / N) * T);
      pa.push(P * (1 + Math.cos(arg))); pr.push(-Q * Math.sin(arg)); p.push(pa[k] + pr[k]);
    }
    const box = { x: 90, y: 60, w: W * 0.66 - 90, h: H - 150 };
    const F = frame(box, [0, T], [-0.6, 1.1]);
    const upto = (t, t0, t1) => Math.round(clamp((t - t0) / (t1 - t0), 0, 1) * N) + 1;

    return {
      duration: 8, hold: 5,
      draw(t) {
        axes(ctx, F, {
          yticks: [-0.5, 0, 0.5, 1], yd: 1,
          xticks: [0, 180, 360, 540, 720], xfmt: (u) => u + "°", xlabel: "ωt",
        });
        const na = upto(t, 0, 2.5), nr = upto(t, 2, 4.5), np = upto(t, 5, 7.5);
        // área da parcela ativa (sempre ≥ 0)
        ctx.save(); ctx.fillStyle = C.a; ctx.globalAlpha = 0.10;
        ctx.beginPath(); ctx.moveTo(F.x(0), F.y(0));
        for (let k = 0; k < na; k++) ctx.lineTo(F.x(xs[k]), F.y(pa[k]));
        ctx.lineTo(F.x(xs[na - 1]), F.y(0)); ctx.closePath(); ctx.fill(); ctx.restore();
        line(ctx, F, xs, pa, { n: na, color: C.a, width: 3 });
        line(ctx, F, xs, pr, { n: nr, color: C.b, width: 3 });
        line(ctx, F, xs, p, { n: np, color: C.navy, width: 2.4, dash: [10, 7], alpha: 0.85 });
        if (na > 1) {
          seg(ctx, box.x, F.y(P), box.x + box.w, F.y(P), { color: C.a, width: 2, dash: [4, 6], alpha: ease(t / 2.5) });
          text(ctx, "P", box.x + box.w + 10, F.y(P), { font: MATH(30), color: C.a, baseline: "middle", alpha: ease(t / 2.5) });
        }
        legend(ctx, [
          { label: "parcela ativa", color: C.a },
          { label: "parcela reativa", color: C.b },
          { label: "p(t) = soma", color: C.navy, dash: [10, 7] },
        ], box.x + 10, 26);

        const x0 = W * 0.71, w = W - x0 - 20;
        text(ctx, `θ = ${fmt(th / deg, 0)}°`, x0, 90, { font: FONT.sansB, color: C.navy });
        text(ctx, "Vm = Im = 1", x0, 126, { font: FONT.sans, color: C.muted });
        text(ctx, "ativa", x0, 200, { font: FONT.sansB, color: C.a });
        text(ctx, "P = ½ cos θ", x0, 240, { font: MATH(30), color: C.a });
        text(ctx, fmt(P, 3), x0 + w, 240, { font: NUM(30), color: C.a, align: "right" });
        text(ctx, "entre 0 e 2P · média P", x0, 274, { font: FONT.sans, color: C.muted });
        text(ctx, "reativa", x0, 344, { font: FONT.sansB, color: C.b });
        text(ctx, "Q = ½ sen θ", x0, 384, { font: MATH(30), color: C.b });
        text(ctx, fmt(Q, 3), x0 + w, 384, { font: NUM(30), color: C.b, align: "right" });
        text(ctx, "entre −Q e +Q · média 0", x0, 418, { font: FONT.sans, color: C.muted });
      },
    };
  }, {
    theta: { label: "θ", min: -90, max: 90, step: 1, value: 60, digits: 0, unit: "°" },
  });

  // -------------------------------------------------------------------
  register("fasores-rlc", ({ ctx, W, H }) => {
    const Tg = 6;                                   // segundos por volta dos fasores
    const casos = [
      { nome: "Resistor", th: 0, nota: "V e I em fase", pq: "P > 0       Q = 0" },
      { nome: "Indutor", th: 90, nota: "I atrasa 90° de V", pq: "P = 0       Q > 0" },
      { nome: "Capacitor", th: -90, nota: "I adianta 90° de V", pq: "P = 0       Q < 0" },
    ];
    const pw = W / 3, r = Math.min(105, pw * 0.3), cy = 60 + r;
    const N = 360, xs = [...Array(N + 1).keys()];

    return {
      duration: 2 * Tg, hold: 0,
      draw(t) {
        const phi = (2 * Math.PI * t) / Tg;
        casos.forEach((c, k) => {
          const cx = pw * k + pw / 2, th = c.th * deg;
          text(ctx, c.nome, cx, 30, { font: FONT.sansB, color: C.navy, align: "center" });
          // fasores girando
          ctx.save(); ctx.strokeStyle = C.rule; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
          seg(ctx, cx - r - 12, cy, cx + r + 12, cy, { color: C.rule, width: 1.5 });
          const pv = [cx + r * Math.cos(phi), cy - r * Math.sin(phi)];
          const ai = phi - th, ri = 0.72 * r;
          const pi = [cx + ri * Math.cos(ai), cy - ri * Math.sin(ai)];
          if (c.th !== 0) {
            // marca de ângulo reto entre V e I
            const m = 16, u = [Math.cos(phi), -Math.sin(phi)], w = [Math.cos(ai), -Math.sin(ai)];
            ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath();
            ctx.moveTo(cx + m * u[0], cy + m * u[1]);
            ctx.lineTo(cx + m * (u[0] + w[0]), cy + m * (u[1] + w[1]));
            ctx.lineTo(cx + m * w[0], cy + m * w[1]); ctx.stroke(); ctx.restore();
          }
          vec(ctx, cx, cy, pv[0], pv[1], C.d);
          vec(ctx, cx, cy, pi[0], pi[1], C.g, { width: 3.5 });
          text(ctx, "V", pv[0] + 10 * Math.cos(phi), pv[1] - 10 * Math.sin(phi), { font: MATH(28), color: C.d, align: "center", baseline: "middle" });
          text(ctx, "I", pi[0] + 18 * Math.cos(ai), pi[1] - 18 * Math.sin(ai), { font: MATH(28), color: C.g, align: "center", baseline: "middle" });
          text(ctx, c.nota, cx, cy + r + 44, { font: FONT.ital, color: C.grey, align: "center" });

          // p(t) = v·i num período de v
          const box = { x: pw * k + 50, y: cy + r + 80, w: pw - 90, h: H - (cy + r + 80) - 80 };
          const F = frame(box, [0, 360], [-1.1, 1.1]);
          const v = xs.map((x) => Math.cos(x * deg)), i = xs.map((x) => Math.cos(x * deg - th));
          const p = v.map((u, j) => u * i[j]);
          seg(ctx, box.x, F.y(0), box.x + box.w, F.y(0), { color: C.muted, width: 1.5 });
          ctx.save();
          for (let j = 1; j <= N; j++) {
            ctx.fillStyle = p[j] >= 0 ? C.a : C.e; ctx.globalAlpha = p[j] >= 0 ? 0.14 : 0.18;
            const x0 = F.x(xs[j - 1]), x1 = F.x(xs[j]);
            ctx.fillRect(x0, F.y(0), x1 - x0 + 0.5, F.y(p[j]) - F.y(0));
          }
          ctx.restore();
          line(ctx, F, xs, v, { color: C.d, width: 1.8, alpha: 0.45 });
          line(ctx, F, xs, i, { color: C.g, width: 1.8, alpha: 0.45, dash: [8, 6] });
          line(ctx, F, xs, p, { color: C.navy, width: 3 });
          const wt = ((phi / deg) % 360 + 360) % 360, jj = Math.round(wt);
          seg(ctx, F.x(wt), box.y, F.x(wt), box.y + box.h, { color: C.muted, width: 1.2, dash: [4, 5] });
          dot(ctx, F.x(wt), F.y(p[jj]), { color: C.navy, r: 6 });
          text(ctx, "p(t)", box.x, box.y - 8, { font: MATH(24), color: C.navy });
          text(ctx, c.pq, cx, H - 26, { font: NUM(26, 500), color: C.ink, align: "center" });
        });
      },
    };
  });
})();
