/* =====================================================================
   Plano s com as curvas do sgrid do MATLAB: arraste o polo (par
   conjugado s = −σ ± jω_d) e veja ζ, ω_n, σ = ζω_n e ω_d no plano e na
   resposta ao degrau de 2ª ordem (OS%, t_p, t_s).

     raios     ζ constante      (ângulo θ com o eixo real negativo, cos θ = ζ)
     círculos  ω_n constante    (distância do polo à origem)
     verticais σ = ζω_n         (t_s ≈ 4/σ)
     horizont. ω_d = ω_n√(1−ζ²)  (t_p = π/ω_d)

   Parâmetros:
     data-zeta="0.5" data-wn="3"   polo inicial (sliders: data-controls="zeta,wn")
     data-zmin="0.7"               especificação: ζ mínimo (setor permitido)
     data-smin="2"                 especificação: σ mínimo (à esquerda de −σ)
     data-lim="6"                  meia-largura da janela do plano s
     data-step="false"             só o plano s (maior), sem a resposta ao degrau
   ===================================================================== */
NovaAnim.register("plano-s", ({ canvas, ctx, W, H, data }) => {
  const { C, FONT, fmt, text, frame, axes, line, seg, dot, ease } = NovaAnim;
  const lim = parseFloat(data.lim || "6");
  const zmin = data.zmin ? parseFloat(data.zmin) : null;
  const smin = data.smin ? parseFloat(data.smin) : null;
  let zeta = Math.min(0.98, Math.max(0.05, parseFloat(data.zeta || "0.5")));
  let wn = Math.max(0.3, parseFloat(data.wn || "3"));

  // plano s (mesma escala nos dois eixos) à esquerda, resposta à direita
  const onlyPlane = data.step === "false";
  const side = Math.min(H - (onlyPlane ? 150 : 110), W * (onlyPlane ? 0.6 : 0.46));
  const xl = [-lim * 1.25, lim * 0.35], yl = [-lim * 0.8, lim * 0.8];
  const sc = Math.min(side / (xl[1] - xl[0]), side / (yl[1] - yl[0]));
  const S = frame({ x: 30, y: 50, w: (xl[1] - xl[0]) * sc, h: (yl[1] - yl[0]) * sc }, xl, yl);
  const RX = S.box.x + S.box.w + 120;
  const T = 8;
  const R = frame({ x: RX, y: H * 0.42, w: Math.max(50, W - RX - 30), h: H * 0.46 }, [0, T], [-0.1, 1.8]);

  const pole = () => [-zeta * wn, wn * Math.sqrt(1 - zeta * zeta)];
  const okZ = () => zmin == null || zeta >= zmin - 1e-9;
  const okS = () => smin == null || zeta * wn >= smin - 1e-9;

  function sync() {
    canvas.dataset.zeta = String(zeta); canvas.dataset.wn = String(wn);
    const host = canvas.parentElement;
    if (!host) return;
    host.querySelectorAll(".nova-controls label").forEach((lab) => {
      const nm = lab.querySelector(".nova-ctl-name").textContent, inp = lab.querySelector("input");
      const v = nm.startsWith("ζ") ? zeta : wn;
      inp.value = v;
      lab.querySelector(".nova-ctl-val").textContent = fmt(v, 2);
    });
  }

  // arrastar o polo (qualquer ponto do semiplano esquerdo; espelha no conjugado)
  const toS = (e) => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) * W / r.width, py = (e.clientY - r.top) * H / r.height;
    const b = S.box;
    if (px < b.x || px > b.x + b.w || py < b.y || py > b.y + b.h) return null;
    return [xl[0] + ((px - b.x) / b.w) * (xl[1] - xl[0]), yl[1] - ((py - b.y) / b.h) * (yl[1] - yl[0])];
  };
  let drag = false, born = performance.now();
  function setFrom(s) {
    const re = Math.min(-0.05, s[0]), im = Math.max(0.05, Math.abs(s[1]));
    wn = Math.min(lim * 1.2, Math.hypot(re, im));
    zeta = Math.min(0.98, Math.max(0.05, -re / wn));
    sync();
  }
  if (!canvas.dataset.psBound) {
    canvas.dataset.psBound = "1";
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", (e) => canvas._pd && canvas._pd(e));
    canvas.addEventListener("pointermove", (e) => canvas._pm && canvas._pm(e));
    window.addEventListener("pointerup", () => canvas._pu && canvas._pu());
  }
  canvas._pd = (e) => { const s = toS(e); if (!s) return; drag = true; setFrom(s); born = performance.now() - 1500; canvas.setPointerCapture?.(e.pointerId); };
  canvas._pm = (e) => { if (!drag) return; const s = toS(e); if (s) { setFrom(s); born = performance.now() - 1500; } };
  canvas._pu = () => { drag = false; };

  function region() {
    if (zmin == null && smin == null) return;
    // região permitida: setor de ζ ≥ zmin e Re(s) ≤ −smin
    ctx.save();
    ctx.beginPath(); ctx.rect(S.box.x, S.box.y, S.box.w, S.box.h); ctx.clip();
    ctx.beginPath();
    const th = Math.acos(zmin == null ? 0 : zmin), big = 4 * lim;
    const x0 = smin == null ? 0 : -smin;
    ctx.moveTo(S.x(x0), S.y(zmin == null ? big : -x0 * Math.tan(th)));
    ctx.lineTo(S.x(-big), S.y(zmin == null ? big : big * Math.tan(th)));
    ctx.lineTo(S.x(-big), S.y(zmin == null ? -big : -big * Math.tan(th)));
    ctx.lineTo(S.x(x0), S.y(zmin == null ? -big : x0 * Math.tan(th)));
    ctx.closePath();
    ctx.fillStyle = "rgba(46,156,107,0.10)"; ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(S.box.x, S.box.y, S.box.w, S.box.h); ctx.clip();
    if (zmin != null) {
      [1, -1].forEach((sg) => seg(ctx, S.x(0), S.y(0), S.x(-big * Math.cos(th)), S.y(sg * big * Math.sin(th)), { color: C.b, width: 2.4, dash: [10, 6] }));
    }
    if (smin != null) seg(ctx, S.x(-smin), S.box.y, S.x(-smin), S.box.y + S.box.h, { color: C.b, width: 2.4, dash: [10, 6] });
    ctx.restore();
    text(ctx, "região que atende às especificações", S.box.x + 8, S.box.y + S.box.h - 12, { font: FONT.sansB, color: C.b });
  }

  function grid() {
    const { box } = S;
    ctx.save();
    ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    // círculos de ω_n (semiplano esquerdo) e raios de ζ, como no sgrid
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1.2; ctx.setLineDash([3, 5]);
    const step = lim > 8 ? 2 : 1;
    for (let r = step; r <= lim * 1.6; r += step) {
      ctx.beginPath(); ctx.arc(S.x(0), S.y(0), r * sc, Math.PI / 2, 1.5 * Math.PI); ctx.stroke();
    }
    [0.2, 0.4, 0.6, 0.8, 0.95].forEach((z) => {
      const th = Math.acos(z), big = 4 * lim;
      [1, -1].forEach((sg) => { ctx.beginPath(); ctx.moveTo(S.x(0), S.y(0)); ctx.lineTo(S.x(-big * Math.cos(th)), S.y(sg * big * Math.sin(th))); ctx.stroke(); });
    });
    ctx.restore();
    // rótulos de ζ na borda superior
    [0.2, 0.4, 0.6, 0.8].forEach((z) => {
      const th = Math.acos(z), r = Math.min(yl[1] / Math.sin(th), -xl[0] / Math.cos(th)) * 0.93;
      text(ctx, fmt(z, 1), S.x(-r * Math.cos(th)) + 4, S.y(r * Math.sin(th)) + 4, { font: FONT.sans, color: C.muted });
    });
    // eixos
    seg(ctx, box.x, S.y(0), box.x + box.w, S.y(0), { color: C.muted, width: 1.4, arrow: true });
    seg(ctx, S.x(0), box.y + box.h, S.x(0), box.y, { color: C.muted, width: 1.4, arrow: true });
    text(ctx, "Re", box.x + box.w - 8, S.y(0) - 12, { font: FONT.ital, color: C.grey, align: "right" });
    text(ctx, "Im", S.x(0) + 12, box.y + 26, { font: FONT.ital, color: C.grey });
    for (let v = -Math.floor(-xl[0]); v <= xl[1]; v += step) {
      if (!v) continue;
      seg(ctx, S.x(v), S.y(0) - 5, S.x(v), S.y(0) + 5, { color: C.muted, width: 1 });
      text(ctx, String(v).replace("-", "−"), S.x(v), S.y(0) + 26, { font: FONT.sans, color: C.muted, align: "center" });
    }
  }

  function current() {
    const [re, im] = pole(), th = Math.acos(zeta);
    const big = 4 * lim;
    ctx.save();
    ctx.beginPath(); ctx.rect(S.box.x, S.box.y, S.box.w, S.box.h); ctx.clip();
    // ω_n: círculo pelo polo
    ctx.strokeStyle = C.d; ctx.lineWidth = 2.6; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(S.x(0), S.y(0), wn * sc, Math.PI / 2, 1.5 * Math.PI); ctx.stroke();
    // ζ: raio pelo polo
    [1, -1].forEach((sg) => seg(ctx, S.x(0), S.y(0), S.x(-big * Math.cos(th)), S.y(sg * big * Math.sin(th)), { color: C.a, width: 2.6 }));
    // σ: vertical; ω_d: horizontal
    seg(ctx, S.x(re), S.box.y, S.x(re), S.box.y + S.box.h, { color: C.b, width: 2, dash: [7, 6] });
    seg(ctx, S.box.x, S.y(im), S.box.x + S.box.w, S.y(im), { color: C.c, width: 2, dash: [7, 6] });
    ctx.restore();
    // ângulo θ
    ctx.save();
    ctx.strokeStyle = C.a; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(S.x(0), S.y(0), 46, Math.PI, Math.PI + th, false); ctx.stroke();
    ctx.restore();
    text(ctx, "θ", S.x(0) - 62 * Math.cos(th / 2) - 6, S.y(0) - 62 * Math.sin(th / 2) + 8, { font: FONT.ital, color: C.a });
    // segmentos σ e ω_d até os eixos
    seg(ctx, S.x(re), S.y(0), S.x(0), S.y(0), { color: C.b, width: 5, alpha: 0.85 });
    seg(ctx, S.x(re), S.y(0), S.x(re), S.y(im), { color: C.c, width: 5, alpha: 0.85 });
    text(ctx, "σ", S.x(re / 2), S.y(0) + 30, { font: FONT.title, color: C.b, align: "center" });
    text(ctx, "ω", S.x(re) - 30, S.y(im / 2) + 8, { font: FONT.title, color: C.c, align: "center" });
    text(ctx, "d", S.x(re) - 18, S.y(im / 2) + 16, { font: FONT.sans, color: C.c });
    text(ctx, "ωₙ", S.x(-wn * 0.93) - 8, S.y(-wn * 0.37) + 30, { font: FONT.title, color: C.d, align: "right" });
    // polos
    const ok = okZ() && okS();
    [im, -im].forEach((y) => {
      const s = 13, col = ok ? C.b : C.rose;
      seg(ctx, S.x(re) - s, S.y(y) - s, S.x(re) + s, S.y(y) + s, { color: col, width: 4 });
      seg(ctx, S.x(re) - s, S.y(y) + s, S.x(re) + s, S.y(y) - s, { color: col, width: 4 });
    });
    text(ctx, "arraste o polo", S.box.x, S.box.y + S.box.h + 40, { font: FONT.sans, color: C.g });
  }

  function info() {
    const [re, im] = pole(), sig = -re, wd = im;
    const Mp = 100 * Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta));
    const tp = Math.PI / wd, ts = 4 / sig;
    let x = RX - 40, y = 70;
    if (onlyPlane) {
      // coluna única de leitura, sem a resposta
      const rows = [
        [`ζ = cos θ = ${fmt(zeta, 2)}`, C.a], [`ωₙ = |s| = ${fmt(wn, 2)} rad/s`, C.d],
        [`σ = ζωₙ = ${fmt(sig, 2)}`, C.b], [`ωd = ωₙ√(1−ζ²) = ${fmt(wd, 2)}`, C.c],
      ];
      rows.forEach(([t, c]) => { text(ctx, t, x, y, { font: FONT.sansB, color: c }); y += 46; });
      y += 30;
      text(ctx, `OS% = 100·e^(−πζ/√(1−ζ²)) = ${fmt(Mp, 1)} %`, x, y, { font: FONT.sansM, color: C.ink }); y += 38;
      text(ctx, `tₚ = π/ωd = ${fmt(tp, 2)} s`, x, y, { font: FONT.sansM, color: C.ink }); y += 38;
      text(ctx, `tₛ ≈ 4/σ = ${fmt(ts, 2)} s`, x, y, { font: FONT.sansM, color: C.ink });
      return null;
    }
    const L = (s, col, f = FONT.sansM) => { text(ctx, s, x, y, { font: f, color: col }); };
    L(`ζ = cos θ = ${fmt(zeta, 2)}`, C.a, FONT.sansB);
    text(ctx, `ωₙ = |s| = ${fmt(wn, 2)} rad/s`, x + 330, y, { font: FONT.sansB, color: C.d }); y += 40;
    L(`σ = ζωₙ = ${fmt(sig, 2)}`, C.b, FONT.sansB);
    text(ctx, `ωd = ωₙ√(1−ζ²) = ${fmt(wd, 2)}`, x + 330, y, { font: FONT.sansB, color: C.c }); y += 52;
    const chk = (ok) => (ok == null ? "" : ok ? "  ✓" : "  ✗");
    text(ctx, `OS% = 100·e^(−πζ/√(1−ζ²)) = ${fmt(Mp, 1)} %${chk(zmin == null ? null : okZ())}`, x, y, { font: FONT.sansM, color: zmin != null && !okZ() ? C.rose : C.ink }); y += 34;
    text(ctx, `tₚ = π/ωd = ${fmt(tp, 2)} s`, x, y, { font: FONT.sansM, color: C.ink });
    text(ctx, `tₛ ≈ 4/σ = ${fmt(ts, 2)} s${chk(smin == null ? null : okS())}`, x + 330, y, { font: FONT.sansM, color: smin != null && !okS() ? C.rose : C.ink });
    return { sig, wd, Mp, tp, ts };
  }

  function resp(k) {
    const { sig, wd, tp, ts } = k;
    axes(ctx, R, { yticks: [0, 0.5, 1, 1.5], xticks: [0, 2, 4, 6, 8], xlabel: "t (s)", ylabel: "y(t): degrau" });
    seg(ctx, R.box.x, R.y(1), R.box.x + R.box.w, R.y(1), { color: C.faint, dash: [6, 6], width: 1.4 });
    // faixa de 2 %
    ctx.save(); ctx.fillStyle = "rgba(46,156,107,0.08)";
    ctx.fillRect(R.box.x, R.y(1.02), R.box.w, R.y(0.98) - R.y(1.02)); ctx.restore();
    const N = 500, ts_ = [], ys = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * T;
      ts_.push(t);
      ys.push(1 - Math.exp(-sig * t) * (Math.cos(wd * t) + (sig / wd) * Math.sin(wd * t)));
    }
    // envoltória e^{−σt}
    line(ctx, R, ts_, ts_.map((t) => 1 + Math.exp(-sig * t)), { color: C.b, width: 1.6, dash: [5, 6], alpha: 0.7 });
    line(ctx, R, ts_, ts_.map((t) => 1 - Math.exp(-sig * t)), { color: C.b, width: 1.6, dash: [5, 6], alpha: 0.7 });
    const p = Math.min(1, (performance.now() - born) / 1500);
    line(ctx, R, ts_, ys, { color: C.rose, width: 3.6, n: Math.max(2, Math.round(ease(p) * N) + 1) });
    if (tp <= T) {
      const yp = 1 - Math.exp(-sig * tp) * (Math.cos(wd * tp) + (sig / wd) * Math.sin(wd * tp));
      seg(ctx, R.x(tp), R.y(0), R.x(tp), R.y(yp), { color: C.c, dash: [4, 5], width: 1.6 });
      dot(ctx, R.x(tp), R.y(yp), { r: 6, color: C.c });
      text(ctx, "tₚ", R.x(tp), R.y(0) - 10, { font: FONT.sansM, color: C.c, align: "center" });
    }
    if (ts <= T) {
      seg(ctx, R.x(ts), R.y(0), R.x(ts), R.y(1.02), { color: C.b, dash: [4, 5], width: 1.6 });
      text(ctx, "tₛ", R.x(ts), R.y(0) - 10, { font: FONT.sansM, color: C.b, align: "center" });
    }
  }

  return {
    duration: 1e9, continuous: true,
    draw() {
      region(); grid(); current();
      const k = info();
      if (k) resp(k);
    },
  };
}, {
  zeta: { label: "ζ", min: 0.05, max: 0.98, step: 0.01, value: 0.5, digits: 2 },
  wn: { label: "ωₙ", min: 0.3, max: 7, step: 0.05, value: 3, digits: 2 },
});
