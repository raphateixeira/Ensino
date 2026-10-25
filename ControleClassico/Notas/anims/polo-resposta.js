/* =====================================================================
   Polo × resposta: arraste o polo de um sistema de 1ª ordem pelo eixo
   real do plano s e veja a resposta ao degrau mudar na hora.
     polo p < 0:  G(s) = a/(s + a), a = −p   →  y = 1 − e^{pt}  (estável)
     polo p > 0:  y = e^{pt} − 1 cresce sem limite         (instável)
   As últimas curvas ficam esmaecidas para comparação.

   Parâmetros: data-p="-1"   (slider: data-controls="p")
   ===================================================================== */
NovaAnim.register("polo-resposta", ({ canvas, ctx, W, H, data }) => {
  const { C, FONT, fmt, text, frame, axes, line, seg, ease } = NovaAnim;
  const T = 6, N = 600;
  const ts = Array.from({ length: N + 1 }, (_, i) => (i / N) * T);
  const resp = (p) => ts.map((t) => (p < 0 ? 1 - Math.exp(p * t) : Math.exp(p * t) - 1));

  // plano s à esquerda, resposta à direita
  const S = frame({ x: 40, y: 70, w: 560, h: H - 160 }, [-5.5, 1.5], [-2.5, 2.5]);
  const R = frame({ x: 720, y: 70, w: W - 760, h: H - 160 }, [0, T], [-0.1, 1.6]);

  let pole = Math.min(1.2, Math.max(-5, parseFloat(data.p || "-1")));
  if (Math.abs(pole) < 0.1) pole = -0.1;
  const hist = [];
  let born = performance.now(), dragging = false;
  const COLS = [C.d, C.a, C.g, C.c, C.f];
  let col = 0;

  function setPole(p, commit) {
    p = Math.min(1.2, Math.max(-5, p));
    if (Math.abs(p) < 0.1) p = p < 0 ? -0.1 : 0.1;
    if (commit && Math.abs(p - pole) > 0.05) {
      hist.push({ p: pole, c: COLS[col % COLS.length] });
      if (hist.length > 4) hist.shift();
      col++;
      born = performance.now();
    }
    pole = p;
    // mantém o slider (data-controls="p") em sincronia com o arraste
    canvas.dataset.p = String(p);
    const inp = canvas.parentElement && canvas.parentElement.querySelector(".nova-controls input");
    if (inp) {
      inp.value = p;
      const out = inp.parentElement.querySelector(".nova-ctl-val");
      if (out) out.textContent = fmt(p, 2);
    }
  }
  const toRe = (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * W / r.width, yy = (e.clientY - r.top) * H / r.height;
    const inside = x >= S.box.x && x <= S.box.x + S.box.w && yy >= S.box.y && yy <= S.box.y + S.box.h;
    return inside ? S.xlim[0] + ((x - S.box.x) / S.box.w) * (S.xlim[1] - S.xlim[0]) : null;
  };
  if (!canvas.dataset.poleBound) {
    canvas.dataset.poleBound = "1";
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", (e) => canvas._pd && canvas._pd(e));
    canvas.addEventListener("pointermove", (e) => canvas._pm && canvas._pm(e));
    window.addEventListener("pointerup", () => canvas._pu && canvas._pu());
  }
  canvas._pd = (e) => { const re = toRe(e); if (re == null) return; dragging = true; setPole(re, true); canvas.setPointerCapture?.(e.pointerId); };
  canvas._pm = (e) => { if (!dragging) return; const re = toRe(e); if (re != null) { setPole(re, false); born = performance.now() - 2000; } };
  canvas._pu = () => { dragging = false; };

  function drawPlane() {
    const { box } = S;
    ctx.save();
    ctx.fillStyle = "rgba(46,156,107,0.07)"; ctx.fillRect(box.x, box.y, S.x(0) - box.x, box.h);
    ctx.fillStyle = "rgba(166,61,74,0.08)"; ctx.fillRect(S.x(0), box.y, box.x + box.w - S.x(0), box.h);
    ctx.restore();
    text(ctx, "estável", box.x + 14, box.y + 28, { font: FONT.ital, color: C.b });
    text(ctx, "instável", S.x(0) + 12, box.y + 28, { font: FONT.ital, color: C.rose });
    seg(ctx, box.x, S.y(0), box.x + box.w, S.y(0), { color: C.muted, width: 1.4, arrow: true });
    seg(ctx, S.x(0), box.y + box.h, S.x(0), box.y, { color: C.muted, width: 1.4, arrow: true });
    text(ctx, "Re", box.x + box.w - 6, S.y(0) + 30, { font: FONT.ital, color: C.grey, align: "right" });
    text(ctx, "Im", S.x(0) + 10, box.y + 56, { font: FONT.ital, color: C.grey });
    for (let v = -5; v <= 1; v++) {
      if (!v) continue;
      seg(ctx, S.x(v), S.y(0) - 6, S.x(v), S.y(0) + 6, { color: C.muted, width: 1 });
      text(ctx, String(v).replace("-", "−"), S.x(v), S.y(0) + 28, { font: FONT.sans, color: C.muted, align: "center" });
    }
    const X = (p, c, a, s = 12) => {
      seg(ctx, S.x(p) - s, S.y(0) - s, S.x(p) + s, S.y(0) + s, { color: c, width: 3.4, alpha: a });
      seg(ctx, S.x(p) - s, S.y(0) + s, S.x(p) + s, S.y(0) - s, { color: c, width: 3.4, alpha: a });
    };
    hist.forEach((h) => X(h.p, h.c, 0.35, 9));
    X(pole, COLS[col % COLS.length], 1, 14);
    text(ctx, `s = ${fmt(pole, 2)}`, S.x(pole), S.y(0) - 30, { font: FONT.sansB, color: COLS[col % COLS.length], align: "center" });
    text(ctx, "arraste o polo ao longo do eixo real", box.x, box.y + box.h + 50, { font: FONT.sans, color: C.g });
  }

  function drawResp() {
    axes(ctx, R, { yticks: [0, 0.5, 1, 1.5], xticks: [0, 1, 2, 3, 4, 5, 6], xlabel: "t (s)", ylabel: "resposta ao degrau" });
    seg(ctx, R.box.x, R.y(1), R.box.x + R.box.w, R.y(1), { color: C.faint, dash: [6, 6], width: 1.4 });
    hist.forEach((h) => line(ctx, R, ts, resp(h.p), { color: h.c, width: 2, alpha: 0.35 }));
    const p = Math.min(1, (performance.now() - born) / 1800);
    const c = COLS[col % COLS.length];
    line(ctx, R, ts, resp(pole), { color: c, width: 3.6, n: Math.max(2, Math.round(ease(p) * N) + 1) });

    const px = R.box.x + R.box.w - 10;
    if (pole < 0) {
      const tau = -1 / pole, t4 = 4 * tau;
      if (t4 <= T) {
        seg(ctx, R.x(t4), R.y(0), R.x(t4), R.y(0.98), { color: c, dash: [4, 5], width: 1.6 });
        text(ctx, "4τ", R.x(t4), R.y(0) - 10, { font: FONT.sansM, color: c, align: "center" });
      }
      text(ctx, `τ = 1/|polo| = ${fmt(tau, 2)} s`, px, R.box.y + 30, { font: FONT.sansB, color: c, align: "right" });
      text(ctx, `tₛ (2 %) = 4τ = ${fmt(t4, 2)} s`, px, R.box.y + 64, { font: FONT.sansM, color: C.ink, align: "right" });
    } else {
      text(ctx, "polo no semiplano direito:", px, R.box.y + 30, { font: FONT.sansB, color: C.rose, align: "right" });
      text(ctx, "eᵖᵗ cresce sem limite → instável", px, R.box.y + 64, { font: FONT.sansM, color: C.rose, align: "right" });
    }
  }

  return {
    duration: 1e9, continuous: true,
    draw() { drawPlane(); drawResp(); },
  };
}, {
  p: { label: "polo s", min: -5, max: 1.2, step: 0.05, value: -1, digits: 2 },
});
