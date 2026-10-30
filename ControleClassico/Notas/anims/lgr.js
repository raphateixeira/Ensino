/* =====================================================================
   Lugar geométrico das raízes: zeros de P(s) = D(s) + K·N(s), ou seja,
   1 + K·G(s) = 0 com G(s) = N(s)/D(s) (malha aberta, realimentação unitária).

   "lgr": traça o LGR enquanto K cresce de 0 (polos de L) até ∞
   (zeros de L ou assíntotas). Depois, os polos de malha fechada ficam
   no K do slider; clicar/arrastar sobre o lugar escolhe K pela condição
   de módulo. Opcional: resposta ao degrau em malha fechada
   (realimentação unitária), reta de ζ constante, zero ou polo extra móvel.

   "lgr-angulo": arraste um ponto de teste s pelo plano; vetores de cada
   polo e zero até s, ângulos, soma ∠G(s) e o K da condição de módulo
   quando s pertence ao LGR.

   "lgr-esboco": esboço guiado, um passo por vez: polos e zeros, eixo
   real, assíntotas, separação/partida, cruzamento de jω e o lugar.

   Parâmetros:
     data-poles="0,-2,-4"   polos de G(s); "re:im" = par re ± j·im
     data-zeros="-3"        zeros de G(s) (mesmo formato)
     data-xlim="-7,2"       janela do plano s (eixos com a mesma escala)
     data-ylim="-4,4"
     data-k="8.3"           ganho final (slider: data-controls="k")
     data-kmax="60"         fim da escala do slider de K
     data-zeta="0.5"        reta de ζ constante
     data-step="true"       resposta ao degrau de malha fechada
     data-tend="10"         horizonte da resposta (s)
     data-yr="-0.2,1.8"     faixa vertical da resposta ao degrau
     data-z="-3"            zero extra móvel (data-controls="k,z")
     data-p="-4"            polo extra móvel (data-controls="k,p")
     data-asym="false"      esconde as assíntotas
     data-compact="true"    só o plano (galeria), com data-title como rótulo
     data-s="-1.5:2"        (lgr-angulo) ponto de teste inicial
     data-locus="true"      (lgr-angulo) mostra o LGR esmaecido
   ===================================================================== */
(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Complexos como [re, im] e polinômios (coeficientes do maior grau)
  // ------------------------------------------------------------------
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const div = (a, b) => {
    const d = b[0] * b[0] + b[1] * b[1] || 1e-300;
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
  };
  const abs = (a) => Math.hypot(a[0], a[1]);
  const deg = (a) => (Math.atan2(a[1], a[0]) * 180) / Math.PI;
  const wrap = (x) => { x = ((x + 180) % 360 + 360) % 360 - 180; return x <= -180 ? x + 360 : x; };

  function parseRoots(s) {
    if (!s) return [];
    return String(s).replace(/−/g, "-").split(",").map((t) => t.trim()).filter(Boolean)
      .flatMap((t) => {
        const [re, im] = t.split(":").map(parseFloat);
        return im ? [[re, im], [re, -im]] : [[re, 0]];
      });
  }

  function polyFromRoots(rs) {
    let c = [[1, 0]];
    rs.forEach((r) => {
      const n = c.map((v) => v.slice());
      n.push([0, 0]);
      for (let i = 1; i < n.length; i++) {
        const t = mul(c[i - 1], r);
        n[i] = [n[i][0] - t[0], n[i][1] - t[1]];
      }
      c = n;
    });
    return c.map((v) => v[0]);
  }

  const horner = (c, z) => c.reduce((acc, ci) => { const t = mul(acc, z); return [t[0] + ci, t[1]]; }, [0, 0]);

  // Δ(s) = a(s) + K·b(s), normalizado para mônico
  function charPoly(a, b, K) {
    const n = a.length - 1, c = a.slice();
    const off = n - (b.length - 1);
    b.forEach((bi, i) => (c[off + i] += K * bi));
    return c.map((ci) => ci / c[0]);
  }

  // Durand–Kerner com partida quente: as raízes seguem continuamente as anteriores
  function roots(c, z0, it = 80) {
    const n = c.length - 1, z = z0.map((v) => v.slice());
    // pequeno empurrão imaginário alternado: com coeficientes reais e partida
    // real, a iteração nunca sairia do eixo real depois de uma separação
    z.forEach((v, i) => (v[1] += (i % 2 ? 1 : -1) * 1e-6 * (i + 1)));
    for (let k = 0; k < it; k++) {
      let worst = 0;
      for (let i = 0; i < n; i++) {
        let den = [1, 0];
        for (let j = 0; j < n; j++) if (j !== i) den = mul(den, sub(z[i], z[j]));
        if (abs(den) < 1e-14) den = [1e-14, 0];
        const d = div(horner(c, z[i]), den);
        z[i] = sub(z[i], d);
        worst = Math.max(worst, abs(d));
      }
      if (worst < 1e-12) break;
    }
    return z;
  }

  // LGR completo: K geométrico de 1e-4 a 1e5 (cache por polos/zeros)
  const CACHE = new Map();
  function locus(P, Z) {
    const key = JSON.stringify([P, Z]);
    if (CACHE.has(key)) return CACHE.get(key);
    const a = polyFromRoots(P), b = polyFromRoots(Z), N = 1600;
    const Ks = [0], R = [P.map((p) => p.slice())];
    // perto de uma raiz dupla a raiz anda como √K: subdivide o passo de K
    // enquanto alguma raiz (na região de interesse) saltar demais
    const jump = (r0, r1) => r1.reduce((mx, r, j) => (abs(r) < 50 ? Math.max(mx, abs(sub(r, r0[j]))) : mx), 0);
    function advance(K0, K1, depth) {
      const r = roots(charPoly(a, b, K1), R[R.length - 1]);
      if (depth < 10 && jump(R[R.length - 1], r) > 0.03) {
        advance(K0, (K0 + K1) / 2, depth + 1);
        advance((K0 + K1) / 2, K1, depth + 1);
        return;
      }
      Ks.push(K1); R.push(r);
    }
    for (let i = 0; i < N; i++) advance(Ks[Ks.length - 1], 1e-4 * Math.pow(1e9, i / (N - 1)), 0);
    const L = { a, b, Ks, R };
    CACHE.set(key, L);
    return L;
  }

  // Raízes de Δ para um K qualquer, partindo do ponto mais próximo da grade
  function rootsAt(L, K) {
    let i = 0;
    while (i < L.Ks.length - 1 && L.Ks[i + 1] <= K) i++;
    return roots(charPoly(L.a, L.b, K), L.R[i]);
  }

  // Resposta ao degrau de T = K b / (a + K b), forma canônica controlável + RK4
  function stepResp(L, K, T, N = 1500) {
    const d = charPoly(L.a, L.b, K), n = d.length - 1;
    const s0 = L.a[0] + (L.a.length === L.b.length ? K * L.b[0] : 0);
    const num = new Array(n + 1).fill(0);
    const off = n - (L.b.length - 1);
    L.b.forEach((bi, i) => (num[off + i] = (K * bi) / s0));
    const D = num[0], r = num.map((v, i) => v - D * d[i]);
    const f = (x) => {
      const dx = x.slice(1);
      let last = 1;
      for (let i = 0; i < n; i++) last -= d[n - i] * x[i];
      dx.push(last);
      return dx;
    };
    const out = (x) => { let y = D; for (let i = 0; i < n; i++) y += r[n - i] * x[i]; return y; };
    const h = T / N, ts = [0], ys = [out(new Array(n).fill(0))];
    let x = new Array(n).fill(0);
    for (let k = 1; k <= N; k++) {
      const k1 = f(x), k2 = f(x.map((v, i) => v + 0.5 * h * k1[i]));
      const k3 = f(x.map((v, i) => v + 0.5 * h * k2[i])), k4 = f(x.map((v, i) => v + h * k3[i]));
      x = x.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      const y = out(x);
      ts.push(k * h); ys.push(Math.max(-50, Math.min(50, y)));
    }
    return { ts, ys };
  }

  // ------------------------------------------------------------------
  // Desenho do plano s (mesma escala nos dois eixos)
  // ------------------------------------------------------------------
  // mesma escala nos dois eixos: a caixa encolhe para caber a janela pedida
  function plane(box, xlim, ylim, center) {
    const sc = Math.min(box.w / (xlim[1] - xlim[0]), box.h / (ylim[1] - ylim[0]));
    const b = { x: box.x, y: box.y, w: (xlim[1] - xlim[0]) * sc, h: (ylim[1] - ylim[0]) * sc };
    b.y += (box.h - b.h) / 2;
    if (center) b.x += (box.w - b.w) / 2;
    return NovaAnim.frame(b, xlim, ylim);
  }

  function drawPlane(ctx, S) {
    const { C, FONT, text, seg } = NovaAnim, { box } = S;
    ctx.save();
    ctx.fillStyle = "rgba(166,61,74,0.07)";
    const x0 = Math.max(box.x, Math.min(box.x + box.w, S.x(0)));
    ctx.fillRect(x0, box.y, box.x + box.w - x0, box.h);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.restore();
    const span = S.xlim[1] - S.xlim[0], st = span > 16 ? 4 : span > 9 ? 2 : 1;
    for (let v = Math.ceil(S.xlim[0] / st) * st; v <= S.xlim[1]; v += st) {
      if (!v) continue;
      seg(ctx, S.x(v), S.y(0) - 5, S.x(v), S.y(0) + 5, { color: C.muted, width: 1 });
      text(ctx, String(v).replace("-", "−"), S.x(v), S.y(0) + 26, { font: FONT.sans, color: C.muted, align: "center" });
    }
    for (let v = Math.ceil(S.ylim[0] / st) * st; v <= S.ylim[1]; v += st) {
      if (!v) continue;
      seg(ctx, S.x(0) - 5, S.y(v), S.x(0) + 5, S.y(v), { color: C.muted, width: 1 });
      text(ctx, (v < 0 ? "−" : "") + "j" + Math.abs(v), S.x(0) - 10, S.y(v) + 7, { font: FONT.sans, color: C.muted, align: "right" });
    }
    seg(ctx, box.x, S.y(0), box.x + box.w, S.y(0), { color: C.muted, width: 1.4, arrow: true });
    seg(ctx, S.x(0), box.y + box.h, S.x(0), box.y, { color: C.muted, width: 1.4, arrow: true });
    text(ctx, "Re", box.x + box.w - 8, S.y(0) - 12, { font: FONT.ital, color: C.grey, align: "right" });
    text(ctx, "Im", S.x(0) + 12, box.y + 26, { font: FONT.ital, color: C.grey });
  }

  function marks(ctx, S, P, Z) {
    const { C, seg } = NovaAnim, s = 11;
    P.forEach((p) => {
      seg(ctx, S.x(p[0]) - s, S.y(p[1]) - s, S.x(p[0]) + s, S.y(p[1]) + s, { color: C.navy, width: 3.4 });
      seg(ctx, S.x(p[0]) - s, S.y(p[1]) + s, S.x(p[0]) + s, S.y(p[1]) - s, { color: C.navy, width: 3.4 });
    });
    Z.forEach((z) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(S.x(z[0]), S.y(z[1]), 11, 0, 2 * Math.PI);
      ctx.fillStyle = C.paper; ctx.fill();
      ctx.lineWidth = 3.2; ctx.strokeStyle = C.navy; ctx.stroke();
      ctx.restore();
    });
  }

  // texto "−0,67 ± j1,15" para as raízes (um representante por par conjugado)
  function rootList(R) {
    const { fmt } = NovaAnim;
    const num = (x) => fmt(x, 2).replace("-", "−");
    return R.filter((r) => r[1] >= -1e-6).sort((p, q) => q[0] - p[0])
      .map((r) => (Math.abs(r[1]) > 1e-3 ? `${num(r[0])} ± j${fmt(Math.abs(r[1]), 2)}` : num(r[0])));
  }

  const opts = (data) => ({
    P: parseRoots(data.poles).concat(data.p != null && /\bp\b/.test(data.controls || "") ? [[parseFloat(data.p), 0]] : []),
    Z: parseRoots(data.zeros).concat(data.z != null && /\bz\b/.test(data.controls || "") ? [[parseFloat(data.z), 0]] : []),
    xlim: (data.xlim || "-6,2").split(",").map(parseFloat),
    ylim: (data.ylim || "-4,4").split(",").map(parseFloat),
  });

  // liga eventos de ponteiro uma vez por canvas (a fábrica roda de novo a cada slider)
  function bindPointer(canvas, W, H) {
    if (canvas.dataset.lgrBound) return;
    canvas.dataset.lgrBound = "1";
    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
    };
    let drag = false;
    canvas.addEventListener("pointerdown", (e) => { if (canvas._pick && canvas._pick(pos(e))) { drag = true; canvas.setPointerCapture?.(e.pointerId); } });
    canvas.addEventListener("pointermove", (e) => { if (drag && canvas._pick) canvas._pick(pos(e)); });
    window.addEventListener("pointerup", () => (drag = false));
  }

  function syncSlider(canvas, key, v, digits = 2) {
    canvas.dataset[key] = String(v);
    const host = canvas.parentElement;
    if (!host) return;
    host.querySelectorAll(".nova-controls label").forEach((lab) => {
      const inp = lab.querySelector("input");
      if (!inp || lab.dataset.key !== key) return;
      inp.value = v;
      lab.querySelector(".nova-ctl-val").textContent = NovaAnim.fmt(v, digits);
    });
  }

  // ------------------------------------------------------------------
  // "lgr"
  // ------------------------------------------------------------------
  function lgr({ canvas, ctx, W, H, data }) {
    const { C, FONT, fmt, text, axes, line, dot, seg } = NovaAnim;
    const { P, Z, xlim, ylim } = opts(data);
    const Lc = locus(P, Z);
    const n = P.length, m = Z.length;
    const compact = data.compact === "true";
    const showStep = !compact && data.step === "true";
    const kmax = parseFloat(data.kmax || "50");
    let K = parseFloat(data.k || String(kmax / 4));

    // os sliders são genéricos: ajusta a escala de K e marca cada rótulo com sua chave
    const host = canvas.parentElement;
    if (host) host.querySelectorAll(".nova-controls label").forEach((lab) => {
      const nm = lab.querySelector(".nova-ctl-name").textContent;
      lab.dataset.key = nm === "K" ? "k" : nm.startsWith("zero") ? "z" : "p";
      if (lab.dataset.key === "k") {
        const inp = lab.querySelector("input");
        inp.max = kmax; inp.step = kmax / 500;
      }
    });

    const S = compact ? plane({ x: 10, y: 48, w: W - 20, h: H - 58 }, xlim, ylim, true) : plane(showStep ? { x: 30, y: 40, w: W * 0.5, h: H - 90 } : { x: 30, y: 40, w: W * 0.64, h: H - 90 }, xlim, ylim);
    const RX = S.box.x + S.box.w + 110;
    const yr = (data.yr || "-0.2,1.8").split(",").map(parseFloat);
    const R = NovaAnim.frame({ x: RX, y: H * 0.4, w: W - RX - 30, h: H * 0.5 }, [0, parseFloat(data.tend || "10")], yr);
    const yt = [];
    const dy = yr[1] - yr[0] > 3 ? 1 : 0.5;
    for (let v = Math.ceil(yr[0] / dy) * dy; v <= yr[1] + 1e-9; v += dy) yt.push(v);

    // trecho da grade percorrido no traçado: de K = kmax/1000 até 30·kmax
    const i0 = Lc.Ks.findIndex((k) => k >= kmax / 1000);
    let i1 = Lc.Ks.findIndex((k) => k >= kmax * 30);
    if (i1 < 0) i1 = Lc.Ks.length - 1;
    const xsB = [], ysB = [];
    for (let j = 0; j < n; j++) {
      xsB.push(Lc.R.map((r) => r[j][0]));
      ysB.push(Lc.R.map((r) => r[j][1]));
    }

    // centroide e ângulos das assíntotas
    const q = n - m;
    const sigA = q > 0 ? (P.reduce((s, p) => s + p[0], 0) - Z.reduce((s, z) => s + z[0], 0)) / q : 0;

    // escolha de K clicando no lugar (condição de módulo)
    bindPointer(canvas, W, H);
    canvas._pick = ([px, py]) => {
      const b = S.box;
      if (px < b.x || px > b.x + b.w || py < b.y || py > b.y + b.h) return false;
      let best = 1e9, kb = null;
      for (let i = 1; i < Lc.Ks.length; i++)
        for (let j = 0; j < n; j++) {
          const d = Math.hypot(S.x(xsB[j][i]) - px, S.y(ysB[j][i]) - py);
          if (d < best) { best = d; kb = Lc.Ks[i]; }
        }
      if (best > 40) return false;
      K = kb; done = true;
      syncSlider(canvas, "k", K);
      return true;
    };
    canvas.style.cursor = "crosshair";

    let done = false, memoK = null, memoR = null, memoY = null;
    const at = (k) => {
      if (k !== memoK) {
        memoK = k; memoR = rootsAt(Lc, k);
        memoY = showStep ? stepResp(Lc, k, R.xlim[1]) : null;
      }
      return memoR;
    };

    const clipped = (fn) => {
      ctx.save();
      ctx.beginPath(); ctx.rect(S.box.x, S.box.y, S.box.w, S.box.h); ctx.clip();
      fn();
      ctx.restore();
    };

    function drawAsym() {
      if (q <= 0 || data.asym === "false") return;
      const big = 4 * Math.max(S.xlim[1] - S.xlim[0], S.ylim[1] - S.ylim[0]);
      for (let k = 0; k < q; k++) {
        const th = ((2 * k + 1) * Math.PI) / q;
        seg(ctx, S.x(sigA), S.y(0), S.x(sigA + big * Math.cos(th)), S.y(big * Math.sin(th)), { color: C.g, width: 1.6, dash: [8, 7], alpha: 0.8 });
      }
      ctx.save();
      ctx.translate(S.x(sigA), S.y(0)); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = C.g; ctx.fillRect(-6, -6, 12, 12);
      ctx.restore();
    }

    function drawZeta() {
      if (!data.zeta) return;
      const z = parseFloat(data.zeta), th = Math.acos(z), big = 50;
      [1, -1].forEach((sg) => seg(ctx, S.x(0), S.y(0), S.x(-big * Math.cos(th)), S.y(sg * big * Math.sin(th)), { color: C.b, width: 2.2, dash: [3, 6] }));
      const r = 0.82 * Math.min(-S.xlim[0], S.ylim[1]);
      text(ctx, `ζ = ${fmt(z, 2)}`, S.x(-r * Math.cos(th)) + 14, S.y(r * Math.sin(th)), { font: FONT.sansB, color: C.b });
    }

    function drawInfo(Kc, Rc) {
      const x = RX - 40, unstable = Rc.some((r) => r[0] > 1e-6);
      let y = S.box.y + 30;
      text(ctx, `K = ${fmt(Kc, Kc < 10 ? 3 : 2)}`, x, y, { font: FONT.title, color: C.rose });
      text(ctx, unstable ? "instável" : "estável", x + 200, y, { font: FONT.sansB, color: unstable ? C.rose : C.b }); y += 44;
      text(ctx, "polos de malha fechada:", x, y, { font: FONT.sansM, color: C.ink }); y += 34;
      if (showStep) text(ctx, rootList(Rc).join("   ·   "), x + 16, y, { font: FONT.sans, color: C.ink });
      else rootList(Rc).forEach((s) => { text(ctx, `s = ${s}`, x + 16, y, { font: FONT.sans, color: C.ink }); y += 30; });
      if (!showStep && q > 0 && data.asym !== "false") {
        y += 40;
        text(ctx, `n − m = ${q}   σₐ = ${fmt(sigA, 2).replace("-", "−")}`, x, y, { font: FONT.sansM, color: C.g }); y += 32;
        const angs = Array.from({ length: q }, (_, k) => fmt(((2 * k + 1) * 180) / q, 0) + "°").join(", ");
        text(ctx, `θₐ = ${angs}`, x, y, { font: FONT.sansM, color: C.g });
      }
      if (!showStep) text(ctx, "clique no lugar para escolher K", x, S.box.y + S.box.h - 4, { font: FONT.sans, color: C.muted });
    }

    function drawStep(Kc) {
      at(Kc);
      axes(ctx, R, { yticks: yt, xticks: (R.xlim[1] > 12 ? [0, 5, 10, 15, 20, 25, 30] : [0, 2, 4, 6, 8, 10, 12]).filter((v) => v <= R.xlim[1]), xlabel: "t (s)", ylabel: "y(t): degrau em malha fechada" });
      seg(ctx, R.box.x, R.y(1), R.box.x + R.box.w, R.y(1), { color: C.faint, dash: [6, 6], width: 1.4 });
      line(ctx, R, memoY.ts, memoY.ys, { color: C.rose, width: 3.4 });
    }

    return {
      duration: 9, hold: 4,
      reset() { done = false; K = parseFloat(canvas.dataset.k || String(kmax / 4)); },
      draw(t) {
        drawPlane(ctx, S);
        clipped(() => { drawAsym(); drawZeta(); });
        const tracing = !done && t < 9 && !NovaAnim.PRINT;
        const idx = tracing ? Math.round(i0 + (i1 - i0) * (t / 9)) : Lc.Ks.length;
        for (let j = 0; j < n; j++) line(ctx, S, xsB[j], ysB[j], { color: C.navy, width: 3.2, n: idx + 1 });
        marks(ctx, S, P, Z);
        const Kc = tracing ? Lc.Ks[Math.max(1, idx)] : K;
        const Rc = at(Kc);
        clipped(() => Rc.forEach((r) => dot(ctx, S.x(r[0]), S.y(r[1]), { r: 9, color: C.rose })));
        if (compact) {
          text(ctx, data.title || "", 10, 28, { font: FONT.sansB, color: C.navy });
          text(ctx, `K = ${fmt(Kc, Kc < 10 ? 2 : 1)}`, W - 10, 28, { font: FONT.sansM, color: C.rose, align: "right" });
        } else drawInfo(Kc, Rc);
        if (showStep) drawStep(Kc);
        if (t >= 9) done = true;
      },
    };
  }

  // ------------------------------------------------------------------
  // "lgr-angulo"
  // ------------------------------------------------------------------
  function lgrAngulo({ canvas, ctx, W, H, data }) {
    const { C, FONT, fmt, text, line, dot, seg } = NovaAnim;
    const { P, Z, xlim, ylim } = opts(data);
    const S = plane({ x: 30, y: 30, w: W * 0.58, h: H - 60 }, xlim, ylim);
    const Lc = data.locus === "true" ? locus(P, Z) : null;
    let s = parseRoots(data.s || "-1:1")[0];
    const COL = [C.a, C.d, C.g, C.f, C.c, C.h];

    bindPointer(canvas, W, H);
    canvas._pick = ([px, py]) => {
      const b = S.box;
      if (px < b.x || px > b.x + b.w || py < b.y || py > b.y + b.h) return false;
      s = [S.xlim[0] + ((px - b.x) / b.w) * (S.xlim[1] - S.xlim[0]), S.ylim[1] - ((py - b.y) / b.h) * (S.ylim[1] - S.ylim[0])];
      return true;
    };
    canvas.style.cursor = "crosshair";

    function arc(x, y, a, col) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, (-a * Math.PI) / 180, a > 0);
      ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.stroke();
      ctx.restore();
      seg(ctx, x, y, x + 44, y, { color: col, width: 1, dash: [3, 4] });
    }

    return {
      duration: 1e9, continuous: true,
      draw() {
        drawPlane(ctx, S);
        if (Lc) for (let j = 0; j < P.length; j++)
          line(ctx, S, Lc.R.map((r) => r[j][0]), Lc.R.map((r) => r[j][1]), { color: C.navy, width: 2.6, alpha: 0.25 });

        const items = [
          ...Z.map((z, i) => ({ r: z, zero: true, name: `φ${"₁₂₃₄₅"[i]}` })),
          ...P.map((p, i) => ({ r: p, zero: false, name: `θ${"₁₂₃₄₅"[i]}` })),
        ];
        let sum = 0, Lmag = 1;
        ctx.save();
        ctx.beginPath(); ctx.rect(S.box.x, S.box.y, S.box.w, S.box.h); ctx.clip();
        items.forEach((it, i) => {
          it.col = COL[i % COL.length];
          const v = sub(s, it.r);
          it.ang = deg(v);
          sum += it.zero ? it.ang : -it.ang;
          Lmag *= it.zero ? abs(v) : 1 / abs(v);
          seg(ctx, S.x(it.r[0]), S.y(it.r[1]), S.x(s[0]), S.y(s[1]), { color: it.col, width: 2.6, arrow: true });
          arc(S.x(it.r[0]), S.y(it.r[1]), it.ang, it.col);
        });
        ctx.restore();
        marks(ctx, S, P, Z);
        const err = 180 - Math.abs(wrap(sum)), on = err < 2;
        dot(ctx, S.x(s[0]), S.y(s[1]), { r: 10, color: on ? C.b : C.rose });
        text(ctx, "s", S.x(s[0]) + 14, S.y(s[1]) - 14, { font: FONT.ital, color: C.ink });

        const x = S.box.x + S.box.w + 60, num = (v, d = 2) => fmt(v, d).replace("-", "−");
        let y = S.box.y + 30;
        text(ctx, `s = ${num(s[0])} ${s[1] < 0 ? "−" : "+"} j${fmt(Math.abs(s[1]), 2)}`, x, y, { font: FONT.title, color: C.ink }); y += 48;
        items.forEach((it) => {
          text(ctx, `${it.name} = ${num(it.ang, 1)}°`, x, y, { font: FONT.sansM, color: it.col });
          text(ctx, it.zero ? `zero em ${num(it.r[0], 1)}${it.r[1] ? (it.r[1] > 0 ? " + j" : " − j") + fmt(Math.abs(it.r[1]), 1) : ""}`
                            : `polo em ${num(it.r[0], 1)}${it.r[1] ? (it.r[1] > 0 ? " + j" : " − j") + fmt(Math.abs(it.r[1]), 1) : ""}`,
            x + 220, y, { font: FONT.sans, color: C.muted });
          y += 34;
        });
        y += 16;
        text(ctx, `∠G(s) = Σφ − Σθ = ${num(wrap(sum), 1)}°`, x, y, { font: FONT.sansB, color: C.ink }); y += 48;
        if (on) {
          text(ctx, "s pertence ao LGR", x, y, { font: FONT.sansB, color: C.b }); y += 40;
          text(ctx, `K = 1/|G(s)| = ${num(1 / Lmag, 2)}`, x, y, { font: FONT.sansB, color: C.rose });
        } else {
          text(ctx, `fora do LGR: faltam ${num(err, 1)}°`, x, y, { font: FONT.sansB, color: C.rose });
        }
        text(ctx, "arraste o ponto de teste s", x, S.box.y + S.box.h - 4, { font: FONT.sans, color: C.muted });
      },
    };
  }


  // ------------------------------------------------------------------
  // "lgr-esboco"
  // ------------------------------------------------------------------
  const derivP = (c) => c.slice(0, -1).map((ci, i) => ci * (c.length - 1 - i));
  const mulP = (a, b) => {
    const r = new Array(a.length + b.length - 1).fill(0);
    a.forEach((ai, i) => b.forEach((bj, j) => (r[i + j] += ai * bj)));
    return r;
  };
  const subP = (a, b) => {
    const n = Math.max(a.length, b.length), r = new Array(n).fill(0);
    a.forEach((v, i) => (r[n - a.length + i] += v));
    b.forEach((v, i) => (r[n - b.length + i] -= v));
    while (r.length > 1 && Math.abs(r[0]) < 1e-12) r.shift();
    return r;
  };
  function allRoots(c) {
    if (c.length < 2) return [];
    const m = c.map((v) => v / c[0]), R0 = 1 + Math.max(...m.slice(1).map(Math.abs));
    let z = [1, 0];
    const w = [0.4, 0.9];
    const z0 = Array.from({ length: m.length - 1 }, (_, k) => { z = mul(z, w); return [z[0] * R0, z[1] * R0]; });
    return roots(m, z0, 600);
  }

  function lgrEsboco({ ctx, W, H, data }) {
    const { C, FONT, fmt, text, line, seg, ease } = NovaAnim;
    const { P, Z, xlim, ylim } = opts(data);
    const Lc = locus(P, Z), n = P.length, m = Z.length, q = n - m;
    const S = plane({ x: 30, y: 30, w: W * 0.58, h: H - 60 }, xlim, ylim);
    const num = (v, d = 2) => fmt(v, d).replace("-", "−");
    const Kof = (s) => { const v = div(horner(Lc.a, s), horner(Lc.b, s)); return -v[0]; };

    // 2. trechos do eixo real: nº ímpar de polos + zeros reais à direita
    const crit = [...P, ...Z].filter((r) => Math.abs(r[1]) < 1e-9).map((r) => r[0]).sort((u, v) => v - u);
    const segs = [];
    crit.forEach((x, i) => {
      if ((i + 1) % 2) segs.push([i + 1 < crit.length ? crit[i + 1] : S.xlim[0] - 1, x]);
    });
    // 3. assíntotas
    const sigA = q > 0 ? (P.reduce((s, p) => s + p[0], 0) - Z.reduce((s, z) => s + z[0], 0)) / q : 0;
    // 4. separação/chegada (dK/ds = 0 sobre o eixo real, K > 0) e partida de polos complexos
    const brk = allRoots(subP(mulP(derivP(Lc.a), Lc.b), mulP(Lc.a, derivP(Lc.b))))
      .filter((r) => Math.abs(r[1]) < 1e-6 && Kof([r[0], 0]) > 1e-9).map((r) => r[0]);
    const dep = P.filter((p) => p[1] > 1e-9).map((p) => {
      let a = 180;
      P.forEach((o) => { if (o !== p) a -= deg(sub(p, o)); });
      Z.forEach((z) => (a += deg(sub(p, z))));
      return { p, a: wrap(a) };
    });
    // 5. cruzamento de jω (mudança de sinal da parte real num ramo complexo)
    let cross = null;
    for (let i = 1; i < Lc.Ks.length && !cross; i++)
      for (let j = 0; j < n; j++) {
        const r0 = Lc.R[i - 1][j], r1 = Lc.R[i][j];
        if (r0[0] < 0 && r1[0] >= 0 && r1[1] > 1e-3) {
          const f = -r0[0] / (r1[0] - r0[0]);
          cross = { w: r0[1] + f * (r1[1] - r0[1]), K: Lc.Ks[i - 1] + f * (Lc.Ks[i] - Lc.Ks[i - 1]) };
          break;
        }
      }

    const steps = [
      { t: 0, title: "1. Polos ✕ (K = 0) e zeros ○ (K → ∞)", sub: `${n} ramos; ${q} vão ao infinito` },
      { t: 3, title: "2. Eixo real", sub: "nº ímpar de polos + zeros à direita" },
      { t: 6, title: "3. Assíntotas", sub: q > 0 ? `σₐ = ${num(sigA)},  θₐ = ${Array.from({ length: q }, (_, k) => fmt(((2 * k + 1) * 180) / q, 0) + "°").join(", ")}` : "nenhuma (n = m)" },
      { t: 9, title: "4. Separação / partida", sub: brk.length ? `ramos colidem em s ≈ ${brk.map((b) => num(b)).join(" e ")}` : dep.length ? `partida a ${num(dep[0].a, 0)}° do polo complexo` : "não há" },
      { t: 12, title: "5. Cruzamento do eixo jω", sub: cross ? `s ≈ ±j${fmt(cross.w, 2)}  com  K ≈ ${fmt(cross.K, cross.K < 10 ? 1 : 0)}` : "não cruza: estável para todo K" },
      { t: 15, title: "6. Ligar os pedaços", sub: "curvas contínuas, simétricas ao eixo real" },
    ];
    const kmax = parseFloat(data.kmax || "100");
    const i1 = Math.max(1, Lc.Ks.findIndex((k) => k >= kmax));

    return {
      duration: 20, hold: 5,
      draw(t) {
        drawPlane(ctx, S);
        const a = (t0) => ease((t - t0) / 1.2);
        ctx.save();
        ctx.beginPath(); ctx.rect(S.box.x, S.box.y, S.box.w, S.box.h); ctx.clip();
        if (t >= 3) segs.forEach(([x0, x1]) => seg(ctx, S.x(x1), S.y(0), S.x(x1 + (x0 - x1) * a(3)), S.y(0), { color: C.a, width: 9, alpha: 0.45 }));
        if (t >= 6 && q > 0) {
          const big = 4 * (S.xlim[1] - S.xlim[0]);
          for (let k = 0; k < q; k++) {
            const th = ((2 * k + 1) * Math.PI) / q;
            seg(ctx, S.x(sigA), S.y(0), S.x(sigA + big * a(6) * Math.cos(th)), S.y(big * a(6) * Math.sin(th)), { color: C.g, width: 2, dash: [8, 7] });
          }
          ctx.save(); ctx.translate(S.x(sigA), S.y(0)); ctx.rotate(Math.PI / 4);
          ctx.fillStyle = C.g; ctx.fillRect(-7, -7, 14, 14); ctx.restore();
        }
        if (t >= 9) {
          brk.forEach((b) => {
            [1, -1].forEach((sg) => seg(ctx, S.x(b), S.y(0), S.x(b), S.y(0) - sg * 70 * a(9), { color: C.e, width: 3, arrow: true }));
            NovaAnim.dot(ctx, S.x(b), S.y(0), { r: 8, color: C.e });
          });
          dep.forEach(({ p, a: ang }) => [1, -1].forEach((sg) => {
            const L = 80 * a(9), th = (sg * ang * Math.PI) / 180;
            seg(ctx, S.x(p[0]), S.y(sg * p[1]), S.x(p[0]) + L * Math.cos(th), S.y(sg * p[1]) - L * Math.sin(th), { color: C.e, width: 3, arrow: true });
          }));
        }
        if (t >= 12 && cross) [1, -1].forEach((sg) => NovaAnim.dot(ctx, S.x(0), S.y(sg * cross.w), { r: 9 * a(12), color: C.f }));
        if (t >= 15) {
          const idx = Math.round(1 + (i1 - 1) * ease((t - 15) / 4));
          for (let j = 0; j < n; j++)
            line(ctx, S, Lc.R.map((r) => r[j][0]), Lc.R.map((r) => r[j][1]), { color: C.navy, width: 3.2, n: idx + 1 });
        }
        ctx.restore();
        marks(ctx, S, P, Z);

        const x = S.box.x + S.box.w + 60;
        let y = S.box.y + 30;
        steps.forEach((st) => {
          if (t < st.t) return;
          const cur = t < st.t + 3 || st.t === 15;
          text(ctx, st.title, x, y, { font: FONT.sansB, color: cur ? C.ink : C.muted, alpha: ease((t - st.t) / 0.6) });
          text(ctx, st.sub, x + 28, y + 32, { font: FONT.sans, color: cur ? C.navy : C.muted, alpha: ease((t - st.t) / 0.6) });
          y += 84;
        });
      },
    };
  }

  const go = () => {
    NovaAnim.register("lgr", lgr, {
      k: { label: "K", min: 0, max: 100, step: 0.1, value: 10, digits: 2 },
      z: { label: "zero em s =", min: -9, max: -0.2, step: 0.1, value: -3, digits: 1 },
      p: { label: "polo extra em s =", min: -9, max: -0.2, step: 0.1, value: -4, digits: 1 },
    });
    NovaAnim.register("lgr-angulo", lgrAngulo);
    NovaAnim.register("lgr-esboco", lgrEsboco);
  };
  if (window.NovaAnim) go();
  else window.addEventListener("DOMContentLoaded", go);
})();
