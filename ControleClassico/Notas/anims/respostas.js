/* =====================================================================
   Resposta ao degrau: 1ª ordem × 2ª ordem subamortecida.
   As curvas são traçadas no tempo; as marcas didáticas (τ, 63,2 %, 4τ,
   Mp, tp, ts, envoltória, polos) aparecem quando o cursor passa por elas.

   Parâmetros (atributos do canvas): data-tau="1" data-zeta="0.3"
   data-wn="2"
   ===================================================================== */
NovaAnim.register("respostas", ({ ctx, W, H, data }) => {
  const { C, FONT, fmt, text, frame, axes, line, dot, seg, ease } = NovaAnim;
  const tau = parseFloat(data.tau || "1");
  const z = parseFloat(data.zeta || "0.3"), wn = parseFloat(data.wn || "2");
  const wd = wn * Math.sqrt(1 - z * z), sg = z * wn;

  // --- Sinais ---
  const T1 = 6 * tau, T2 = Math.max(8, 5 / sg);
  const N = 600;
  const t1 = Array.from({ length: N + 1 }, (_, i) => (i / N) * T1);
  const y1 = t1.map((t) => 1 - Math.exp(-t / tau));
  const t2 = Array.from({ length: N + 1 }, (_, i) => (i / N) * T2);
  const phi = Math.acos(z);
  const y2 = t2.map((t) => 1 - Math.exp(-sg * t) * Math.sin(wd * t + phi) / Math.sqrt(1 - z * z));
  const tp = Math.PI / wd, Mp = Math.exp(-Math.PI * z / Math.sqrt(1 - z * z));
  let ts = 0;                                   // tempo de acomodação (2 %), exato
  for (let i = N; i >= 0; i--) if (Math.abs(y2[i] - 1) > 0.02) { ts = t2[i]; break; }

  // --- Geometria: dois painéis ---
  const gap = 110, pw = (W - gap - 70) / 2, top = 96, ph = H - top - 90;
  const F1 = frame({ x: 60, y: top, w: pw, h: ph }, [0, T1], [0, 1.25]);
  const F2 = frame({ x: 60 + pw + gap, y: top, w: pw, h: ph }, [0, T2], [0, 1.5]);

  const fade = (u, t0, d = 0.6) => ease((u - t0) / d);   // opacidade que surge em t0

  return {
    duration: 14, hold: 4,
    draw(t) {
      const p = Math.min(t / 12, 1);             // progresso do traçado (12 s)
      const c1 = p * T1, c2 = p * T2;            // tempo simulado em cada painel
      const n1 = Math.round(p * N) + 1, n2 = n1;

      // ---------------- 1ª ordem ----------------
      text(ctx, "1ª ordem", F1.box.x - 50, 30, { font: FONT.title, color: C.navy });
      text(ctx, `G(s) = 1 / (τs + 1),   τ = ${fmt(tau, 1)} s`, F1.box.x - 50, 62, { font: FONT.ital, color: C.grey });
      axes(ctx, F1, { yticks: [0, 0.5, 1], xticks: [0, tau, 2 * tau, 3 * tau, 4 * tau, 5 * tau, 6 * tau],
        xfmt: (v) => { const n = Math.round(v / tau); return n === 0 ? "0" : n === 1 ? "τ" : `${n}τ`; }, xlabel: "t", ylabel: "y(t)" });
      // tangente na origem: y = t/τ
      seg(ctx, F1.x(0), F1.y(0), F1.x(tau), F1.y(1), { color: C.a, dash: [6, 6], alpha: 0.85 * fade(t, 0.3) });
      text(ctx, "inclinação inicial 1/τ", F1.x(tau * 0.35) + 14, F1.y(0.95), { font: FONT.ital, color: C.a, alpha: fade(t, 0.3) });
      line(ctx, F1, t1, y1, { n: n1, color: C.d, width: 3.2 });
      if (c1 >= tau) {
        const a = fade(c1, tau, 0.6);
        seg(ctx, F1.x(tau), F1.y(0), F1.x(tau), F1.y(0.632), { dash: [4, 5], alpha: a });
        seg(ctx, F1.x(0), F1.y(0.632), F1.x(tau), F1.y(0.632), { dash: [4, 5], alpha: a });
        dot(ctx, F1.x(tau), F1.y(0.632), { color: C.a, alpha: a });
        text(ctx, "t = τ  →  63,2 %", F1.x(tau) + 16, F1.y(0.632) + 30, { font: FONT.sansM, color: C.a, alpha: a });
      }
      if (c1 >= 4 * tau) {
        const a = fade(c1, 4 * tau, 0.6);
        seg(ctx, F1.x(4 * tau), F1.y(0), F1.x(4 * tau), F1.y(0.982), { dash: [4, 5], alpha: a });
        dot(ctx, F1.x(4 * tau), F1.y(0.982), { color: C.b, alpha: a });
        text(ctx, "4τ  →  98 %  (acomodação)", F1.x(4 * tau) - 10, F1.y(0.982) - 22, { font: FONT.sansM, color: C.b, align: "center", alpha: a });
      }
      seg(ctx, F1.x(c1), F1.box.y, F1.x(c1), F1.box.y + F1.box.h, { color: C.rose, alpha: p < 1 ? 0.5 : 0 });

      // ---------------- 2ª ordem ----------------
      text(ctx, "2ª ordem subamortecida", F2.box.x - 50, 30, { font: FONT.title, color: C.navy });
      text(ctx, `ζ = ${fmt(z, 2)},   ωn = ${fmt(wn, 1)} rad/s`, F2.box.x - 50, 62, { font: FONT.ital, color: C.grey });
      axes(ctx, F2, { yticks: [0, 0.5, 1, 1.5], xticks: Array.from({ length: Math.floor(T2 / 2) + 1 }, (_, i) => 2 * i), xlabel: "t (s)", ylabel: "y(t)" });
      // faixa de ±2 %
      ctx.save(); ctx.fillStyle = "rgba(46,156,107,0.10)";
      ctx.fillRect(F2.box.x, F2.y(1.02), F2.box.w, F2.y(0.98) - F2.y(1.02)); ctx.restore();
      // envoltória 1 ± e^{-ζωn t}/√(1-ζ²)
      const env = t2.map((u) => Math.exp(-sg * u) / Math.sqrt(1 - z * z));
      const ea = 0.6 * fade(t, 0.5);
      line(ctx, F2, t2, env.map((e) => 1 + e), { n: n2, color: C.faint, width: 1.6, dash: [5, 6], alpha: ea / 0.6 });
      line(ctx, F2, t2, env.map((e) => 1 - e), { n: n2, color: C.faint, width: 1.6, dash: [5, 6], alpha: ea / 0.6 });
      line(ctx, F2, t2, y2, { n: n2, color: C.d, width: 3.2 });

      if (c2 >= tp) {
        const a = fade(c2, tp, 0.6);
        seg(ctx, F2.x(tp), F2.y(1), F2.x(tp), F2.y(1 + Mp), { color: C.e, width: 2.2, arrow: true, alpha: a });
        dot(ctx, F2.x(tp), F2.y(1 + Mp), { color: C.e, alpha: a });
        text(ctx, `Mp = ${fmt(100 * Mp, 1)} %`, F2.x(tp) + 18, F2.y(1 + Mp) - 4, { font: FONT.sansM, color: C.e, alpha: a });
        seg(ctx, F2.x(tp), F2.y(0), F2.x(tp), F2.y(1), { dash: [4, 5], alpha: a });
        text(ctx, `tp = π/ωd = ${fmt(tp, 2)} s`, F2.x(tp) + 10, F2.y(0.12), { font: FONT.sansM, color: C.grey, alpha: a });
      }
      if (c2 >= ts) {
        const a = fade(c2, ts, 0.6);
        seg(ctx, F2.x(ts), F2.y(0), F2.x(ts), F2.y(1), { dash: [4, 5], color: C.b, alpha: a });
        text(ctx, `ts (2 %) = ${fmt(ts, 1)} s`, F2.x(ts) - 10, F2.y(0.3), { font: FONT.sansM, color: C.b, align: "right", alpha: a });
        text(ctx, `≈ 4/(ζωn) = ${fmt(4 / sg, 1)} s`, F2.x(ts) - 10, F2.y(0.3) + 28, { font: FONT.sans, color: C.muted, align: "right", alpha: a });
      }
      seg(ctx, F2.x(c2), F2.box.y, F2.x(c2), F2.box.y + F2.box.h, { color: C.rose, alpha: p < 1 ? 0.5 : 0 });

      // plano s (encarte)
      const ib = { x: F2.box.x + F2.box.w - 200, y: F2.box.y - 10, w: 190, h: 150 };
      const Fs = frame(ib, [-1.6 * sg - 0.5, 0.8], [-1.3 * wd, 1.3 * wd]);
      const ia = fade(t, 0.8);
      ctx.save(); ctx.globalAlpha = ia;
      ctx.fillStyle = "rgba(247,245,240,0.92)"; ctx.fillRect(ib.x - 10, ib.y - 30, ib.w + 20, ib.h + 66);
      seg(ctx, ib.x, Fs.y(0), ib.x + ib.w, Fs.y(0), { color: C.muted, width: 1 });
      seg(ctx, Fs.x(0), ib.y, Fs.x(0), ib.y + ib.h, { color: C.muted, width: 1 });
      seg(ctx, Fs.x(0), Fs.y(0), Fs.x(-sg), Fs.y(wd), { color: C.faint, dash: [4, 4] });
      [1, -1].forEach((s) => {
        const px = Fs.x(-sg), py = Fs.y(s * wd);
        seg(ctx, px - 8, py - 8, px + 8, py + 8, { color: C.e, width: 2.6 });
        seg(ctx, px - 8, py + 8, px + 8, py - 8, { color: C.e, width: 2.6 });
      });
      text(ctx, "plano s", ib.x, ib.y - 8, { font: FONT.ital, color: C.grey });
      text(ctx, "polos: −ζωn ± jωd", ib.x, ib.y + ib.h + 26, { font: FONT.sans, color: C.e });
      ctx.restore();
    },
  };
}, {
  tau:  { label: "τ",  min: 0.3,  max: 2,    step: 0.1,  value: 1,   unit: "s",     digits: 1 },
  zeta: { label: "ζ",  min: 0.05, max: 0.95, step: 0.05, value: 0.3,                digits: 2 },
  wn:   { label: "ωn", min: 0.5,  max: 4,    step: 0.1,  value: 2,   unit: "rad/s", digits: 1 },
});
