/* =====================================================================
   Sistema de 1ª ordem G(s) = K/(τs + 1): resposta ao degrau unitário
   com eixos FIXOS (para comparar ao mudar K e τ) e uma curva de
   referência (K = 1, τ = 1). Mostra: tangente inicial, ponto t = τ
   (63,2 %), faixa de ±2 %, tempo de acomodação 4τ, regiões de
   transitório e regime, tabela de percentuais e o polo s = −1/τ.

   Parâmetros: data-k="1" data-tau="1"   (sliders: data-controls="k,tau")
               data-plano="false" esconde o plano s do painel
   ===================================================================== */
NovaAnim.register("primeira-ordem", ({ ctx, W, H, data }) => {
  const { C, FONT, fmt, text, frame, axes, line, dot, seg, ease } = NovaAnim;
  const K = parseFloat(data.k || "1"), tau = parseFloat(data.tau || "1");
  const T = 20, N = 800;
  const ts = Array.from({ length: N + 1 }, (_, i) => (i / N) * T);
  const y = ts.map((t) => K * (1 - Math.exp(-t / tau)));
  const yref = ts.map((t) => 1 - Math.exp(-t));
  const t4 = 4 * tau;

  const right = 430, x0 = 70, w = W - x0 - right - 40;
  const F = frame({ x: x0, y: 60, w, h: H - 140 }, [0, T], [0, 3.4]);
  const px = x0 + w + 70;

  return {
    duration: 9, hold: 4,
    draw(t) {
      const p = Math.min(t / 8, 1), n = Math.max(2, Math.round(p * N) + 1), tc = ts[n - 1];

      // regiões de transitório e regime
      const xt = Math.min(F.x(t4), F.box.x + F.box.w);
      ctx.save();
      ctx.fillStyle = "rgba(166,61,74,0.05)"; ctx.fillRect(F.box.x, F.box.y, xt - F.box.x, F.box.h);
      ctx.fillStyle = "rgba(46,156,107,0.06)"; ctx.fillRect(xt, F.box.y, F.box.x + F.box.w - xt, F.box.h);
      ctx.restore();
      text(ctx, "transitório", F.box.x + 12, F.box.y + 26, { font: FONT.ital, color: C.rose });
      if (t4 < T - 2) text(ctx, "regime permanente", xt + 12, F.box.y + 26, { font: FONT.ital, color: C.b });

      axes(ctx, F, { yticks: [0, 1, 2, 3], xticks: [0, 5, 10, 15, 20], xlabel: "t (s)", ylabel: "y(t)" });
      // faixa de ±2 % em torno de K
      ctx.save(); ctx.fillStyle = "rgba(46,156,107,0.16)";
      ctx.fillRect(F.box.x, F.y(1.02 * K), F.box.w, F.y(0.98 * K) - F.y(1.02 * K)); ctx.restore();
      seg(ctx, F.box.x, F.y(K), F.box.x + F.box.w, F.y(K), { color: C.b, dash: [6, 6], width: 1.4 });
      text(ctx, `y(∞) = K = ${fmt(K, 2)}`, F.box.x + F.box.w - 8, F.y(K) - 12, { font: FONT.sansM, color: C.b, align: "right" });

      // referência fantasma
      line(ctx, F, ts, yref, { color: C.faint, width: 2, dash: [5, 6] });
      if (Math.abs(K - 1) > 0.01 || Math.abs(tau - 1) > 0.01)
        text(ctx, "referência: K = 1, τ = 1 s", F.x(5.2), F.y(0.86), { font: FONT.sans, color: C.muted });

      // tangente na origem até (τ, K)
      seg(ctx, F.x(0), F.y(0), F.x(tau), F.y(K), { color: C.a, dash: [6, 6], alpha: 0.85 });
      line(ctx, F, ts, y, { n, color: C.d, width: 3.4 });

      if (tc >= tau) {
        const a = ease((tc - tau) / (0.15 * T));
        seg(ctx, F.x(tau), F.y(0), F.x(tau), F.y(0.632 * K), { dash: [4, 5], alpha: a });
        seg(ctx, F.x(0), F.y(0.632 * K), F.x(tau), F.y(0.632 * K), { dash: [4, 5], alpha: a });
        dot(ctx, F.x(tau), F.y(0.632 * K), { color: C.a, alpha: a });
        text(ctx, "t = τ → 63,2 %", F.x(tau) + 14, F.y(0.632 * K) + 28, { font: FONT.sansM, color: C.a, alpha: a });
      }
      if (tc >= t4 && t4 <= T) {
        const a = ease((tc - t4) / (0.15 * T));
        seg(ctx, F.x(t4), F.y(0), F.x(t4), F.y(0.982 * K), { color: C.b, dash: [4, 5], width: 2, alpha: a });
        dot(ctx, F.x(t4), F.y(0.982 * K), { color: C.b, alpha: a });
        text(ctx, `tₛ = 4τ = ${fmt(t4, 1)} s`, F.x(t4) + 12, F.y(0.2 * K), { font: FONT.sansM, color: C.b, alpha: a });
      }
      if (p < 1) seg(ctx, F.x(tc), F.box.y, F.x(tc), F.box.y + F.box.h, { color: C.rose, alpha: 0.4 });

      // ---- painel ----
      text(ctx, "G(s) = K / (τs + 1)", px, 70, { font: 'italic 30px "Source Serif 4", Georgia, serif', color: C.navy });
      text(ctx, `K = ${fmt(K, 2)}     τ = ${fmt(tau, 2)} s`, px, 108, { font: FONT.sansM, color: C.grey });
      const rows = [[1, "63,2 %"], [2, "86,5 %"], [3, "95,0 %"], [4, "98,2 %"], [5, "99,3 %"]];
      text(ctx, "tempo", px, 160, { font: FONT.sans, color: C.muted });
      text(ctx, "do valor final", px + 300, 160, { font: FONT.sans, color: C.muted, align: "right" });
      rows.forEach(([m, pct], i) => {
        const yy = 196 + i * 36, on = tc >= m * tau;
        const col = on ? (m === 4 ? C.b : C.ink) : C.faint;
        text(ctx, `${m === 1 ? "" : m}τ = ${fmt(m * tau, 1)} s`, px, yy, { font: FONT.sansM, color: col });
        text(ctx, pct, px + 300, yy, { font: FONT.sansB, color: col, align: "right" });
      });
      seg(ctx, px, 390, px + 300, 390, { color: C.rule, width: 1 });
      text(ctx, `tᵣ (10–90 %) = 2,2τ = ${fmt(2.2 * tau, 2)} s`, px, 428, { font: FONT.sans, color: C.ink });
      text(ctx, `tₛ (2 %) = 4τ = ${fmt(t4, 2)} s`, px, 460, { font: FONT.sans, color: C.b });

      if (data.plano === "false") {          // plano s em slide próprio
        text(ctx, "valor final: y(∞) = K·A", px, 520, { font: FONT.sans, color: C.ink });
        text(ctx, "(degrau unitário: A = 1)", px, 552, { font: FONT.ital, color: C.muted });
        return;
      }
      // polo no plano s (eixo real)
      const sy = 540, sx0 = px, sw = 300, re0 = -5.5, re1 = 0.8;
      const sxp = (re) => sx0 + ((re - re0) / (re1 - re0)) * sw;
      text(ctx, "polo no plano s", px, sy - 40, { font: FONT.ital, color: C.grey });
      seg(ctx, sx0, sy, sx0 + sw, sy, { color: C.muted, width: 1.2, arrow: true });
      seg(ctx, sxp(0), sy - 28, sxp(0), sy + 28, { color: C.muted, width: 1.2 });
      [-5, -4, -3, -2, -1].forEach((v) => {
        seg(ctx, sxp(v), sy - 5, sxp(v), sy + 5, { color: C.muted, width: 1 });
        text(ctx, String(v).replace("-", "−"), sxp(v), sy + 26, { font: FONT.sans, color: C.muted, align: "center" });
      });
      const pp = sxp(Math.max(-1 / tau, re0 + 0.1));
      seg(ctx, pp - 9, sy - 9, pp + 9, sy + 9, { color: C.e, width: 3 });
      seg(ctx, pp - 9, sy + 9, pp + 9, sy - 9, { color: C.e, width: 3 });
      text(ctx, `s = −1/τ = ${fmt(-1 / tau, 2)}`, px, sy + 66, { font: FONT.sansM, color: C.e });
      text(ctx, "polo mais à esquerda → mais rápido", px, sy + 98, { font: FONT.ital, color: C.muted });
    },
  };
}, {
  k:   { label: "K", min: 0.2, max: 3, step: 0.1, value: 1, digits: 1 },
  tau: { label: "τ", min: 0.2, max: 4, step: 0.1, value: 1, unit: "s", digits: 1 },
});
