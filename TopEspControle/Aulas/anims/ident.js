/* =====================================================================
   Animações da aula de identificação de sistemas (Tópicos Especiais em
   Controle). Precisam de anims/nova-anim.js carregado antes.

   mmq-reta  Ajuste de reta: resíduos, quadrados e a superfície J(θ).
             data-th1, data-th0 (sliders: data-controls="th1,th0")
             data-otimo="true" mostra a reta de mínimos quadrados.
   prbs      PRBS por LFSR: sinal, resposta de uma planta de 1ª ordem,
             autocorrelação e espectro. data-n (bits), data-nb (amostras
             por bit), data-tau (constante de tempo da planta, em amostras).
   arx-ls    Estimação de um ARX(1,1) enquanto os dados chegam; a entrada
             decide se as estimativas convergem. data-entrada (0 degrau,
             1 PRBS, 2 senoide), data-sigma (desvio do ruído).
   mqr       Mínimos quadrados recursivos com fator de esquecimento λ;
             os parâmetros da planta mudam no meio do ensaio. data-lam.
   ===================================================================== */
(function () {
  "use strict";
  const { C, FONT, fmt, clamp, ease, text, frame, axes, line, dot, seg, legend, register } = NovaAnim;

  // ----- números pseudoaleatórios reprodutíveis -----------------------
  function rng(seed) {
    let s = seed >>> 0;
    const uni = () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const gauss = () => {
      const u1 = Math.max(uni(), 1e-12), u2 = uni();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };
    return { uni, gauss };
  }

  // ----- PRBS de comprimento máximo -----------------------------------
  const TAPS = { 3: [3, 2], 4: [4, 3], 5: [5, 3], 6: [6, 5], 7: [7, 6], 8: [8, 6, 5, 4], 9: [9, 5], 10: [10, 7] };
  function prbs(n, nb) {
    let reg = new Array(n).fill(1);
    const out = [];
    for (let i = 0; i < (1 << n) - 1; i++) {
      out.push(reg[n - 1]);
      let fb = 0;
      TAPS[n].forEach((t) => (fb ^= reg[t - 1]));
      reg = [fb].concat(reg.slice(0, n - 1));
    }
    const u = [];
    out.forEach((b) => { for (let j = 0; j < nb; j++) u.push(2 * b - 1); });
    return u;
  }

  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const ticks = (a, b, d) => { const t = []; for (let v = a; v <= b + 1e-9; v += d) t.push(+v.toFixed(6)); return t; };

  // Mínimos quadrados recursivos com P0 = δI
  function mqr(phis, ys, lam, delta = 1e4) {
    const n = phis[0].length;
    let th = new Array(n).fill(0);
    let P = range(n).map((i) => range(n).map((j) => (i === j ? delta : 0)));
    const TH = [], EPS = [];
    for (let k = 0; k < ys.length; k++) {
      const phi = phis[k];
      const Pphi = P.map((r) => r.reduce((s, v, j) => s + v * phi[j], 0));
      const den = lam + phi.reduce((s, v, i) => s + v * Pphi[i], 0);
      const L = Pphi.map((v) => v / den);
      const eps = ys[k] - phi.reduce((s, v, i) => s + v * th[i], 0);
      th = th.map((v, i) => v + L[i] * eps);
      P = P.map((r, i) => r.map((v, j) => (v - L[i] * Pphi[j]) / lam));
      TH.push(th.slice()); EPS.push(eps);
    }
    return { TH, EPS };
  }

  // =====================================================================
  // 1. mmq-reta
  // =====================================================================
  register("mmq-reta", ({ ctx, W, H, data }) => {
    const R = rng(12);
    const xs = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
    const ys = xs.map((x) => 0.05 * x + 0.5 + 0.15 * R.gauss());
    const n = xs.length;
    // solução de mínimos quadrados (equações normais 2×2)
    const Sx = xs.reduce((s, v) => s + v, 0), Sy = ys.reduce((s, v) => s + v, 0);
    const Sxx = xs.reduce((s, v) => s + v * v, 0), Sxy = xs.reduce((s, v, i) => s + v * ys[i], 0);
    const det = n * Sxx - Sx * Sx;
    const t1s = (n * Sxy - Sx * Sy) / det, t0s = (Sxx * Sy - Sx * Sxy) / det;
    const J = (t1, t0) => xs.reduce((s, x, i) => s + (ys[i] - t1 * x - t0) ** 2, 0);
    const Js = J(t1s, t0s);

    const th1 = parseFloat(data.th1 ?? "0.03"), th0 = parseFloat(data.th0 ?? "1.2");
    const showOpt = data.otimo === "true";
    const Jc = J(th1, th0);

    const L = frame({ x: 90, y: 90, w: W * 0.5 - 140, h: H - 200 }, [10, 75], [0, 5]);
    const T1 = [0, 0.1], T0 = [-1, 2.5];
    const Rf = frame({ x: W * 0.5 + 70, y: 90, w: W * 0.5 - 130, h: H - 200 }, T1, T0);

    // superfície J(θ) em grade (log), calculada uma vez
    const NX = 90, NY = 70, cells = [];
    let jmin = Infinity, jmax = -Infinity;
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
      const a = T1[0] + (i + 0.5) / NX * (T1[1] - T1[0]), b = T0[0] + (j + 0.5) / NY * (T0[1] - T0[0]);
      const v = Math.log(J(a, b));
      cells.push([i, j, v]); jmin = Math.min(jmin, v); jmax = Math.max(jmax, v);
    }

    function drawSurface(alpha) {
      const cw = Rf.box.w / NX, ch = Rf.box.h / NY;
      ctx.save();
      cells.forEach(([i, j, v]) => {
        const q = (v - jmin) / (jmax - jmin);
        ctx.fillStyle = `rgba(27,54,93,${(0.55 * (1 - q) * alpha).toFixed(3)})`;
        ctx.fillRect(Rf.box.x + i * cw, Rf.box.y + Rf.box.h - (j + 1) * ch, cw + 0.5, ch + 0.5);
      });
      ctx.restore();
    }

    return {
      duration: 7, hold: 4,
      draw(t) {
        // --- esquerda: dados e reta ---
        axes(ctx, L, { xticks: ticks(10, 70, 10), yticks: ticks(0, 5, 1), xlabel: "temperatura T (°C)", ylabel: "tensão V (V)" });
        const p = ease(t / 4);
        line(ctx, L, [10, 75], [th1 * 10 + th0, th1 * 75 + th0], { color: C.a, width: 3 });
        if (showOpt) line(ctx, L, [10, 75], [t1s * 10 + t1s * 0 + t0s, t1s * 75 + t0s], { color: C.b, width: 2.4, dash: [8, 6] });
        const shown = Math.round(p * n);
        xs.forEach((x, i) => {
          const yh = th1 * x + th0, px = L.x(x), py = L.y(ys[i]), ph = L.y(yh);
          if (i < shown) {
            const side = Math.abs(py - ph);
            ctx.save();
            ctx.fillStyle = "rgba(178,58,72,0.13)"; ctx.strokeStyle = "rgba(178,58,72,0.5)";
            ctx.fillRect(px, Math.min(py, ph), side, side);
            ctx.strokeRect(px, Math.min(py, ph), side, side);
            ctx.restore();
            seg(ctx, px, py, px, ph, { color: C.rose, width: 2.4 });
          }
          dot(ctx, px, py, { r: 7, color: C.navy });
        });
        text(ctx, "cada quadrado tem área ∝ eᵢ²", L.box.x + L.box.w, 30, { font: FONT.ital, color: C.rose, alpha: p, align: "right" });

        // --- direita: superfície de custo ---
        const q = ease((t - 3) / 3);
        drawSurface(q);
        axes(ctx, Rf, { xticks: ticks(0, 0.1, 0.02), xd: 2, yticks: ticks(-1, 2.5, 0.5), yd: 1, xlabel: "θ₁ (inclinação)", ylabel: "θ₀ (intercepto)" });
        if (q > 0) {
          const sx = Rf.x(t1s), sy = Rf.y(t0s);
          text(ctx, "★", sx, sy + 9, { font: "28px sans-serif", color: C.b, align: "center", alpha: q });
          text(ctx, "mínimo", sx + 18, sy - 8, { font: FONT.sansM, color: C.b, alpha: q });
          dot(ctx, Rf.x(th1), Rf.y(th0), { r: 9, color: C.a, alpha: q });
        }
        text(ctx, "J(θ) = Σ eᵢ²  (mais escuro = menor)", Rf.box.x + Rf.box.w, 30, { font: FONT.sansM, color: C.navy, align: "right" });

        // --- números ---
        const a = ease((t - 5) / 1.5);
        text(ctx, `θ = (${fmt(th1, 3)}; ${fmt(th0, 2)})   J(θ) = ${fmt(Jc, 2)}`, L.box.x, H - 30, { font: FONT.sansB, color: C.a, alpha: a });
        text(ctx, `mínimo: θ̂ = (${fmt(t1s, 3)}; ${fmt(t0s, 2)})   J(θ̂) = ${fmt(Js, 3)}`, Rf.box.x, H - 30, { font: FONT.sansB, color: C.b, alpha: a });
      },
    };
  }, {
    th1: { label: "θ₁", min: 0, max: 0.1, step: 0.002, value: 0.03, digits: 3 },
    th0: { label: "θ₀", min: -1, max: 2.5, step: 0.05, value: 1.2, digits: 2 },
  });

  // =====================================================================
  // 2. prbs
  // =====================================================================
  register("prbs", ({ ctx, W, H, data }) => {
    const n = clamp(Math.round(parseFloat(data.n ?? "7")), 3, 10);
    const nb = clamp(Math.round(parseFloat(data.nb ?? "2")), 1, 10);
    const tau = parseFloat(data.tau ?? "6");
    const u = prbs(n, nb), N = u.length, M = (1 << n) - 1;
    // planta de 1ª ordem discreta (ganho 1, constante de tempo tau amostras), dois períodos
    const p = Math.exp(-1 / tau);
    const uu = u.concat(u), yy = [0];
    for (let k = 1; k < uu.length; k++) yy.push(p * yy[k - 1] + (1 - p) * uu[k - 1]);
    const y = yy.slice(N);            // segundo período: regime periódico
    const SHOW = Math.min(N, 220);
    const ks = range(SHOW);

    // autocorrelação circular normalizada
    const LMAX = Math.min(Math.floor(N / 2), Math.max(40, 6 * nb));
    const Ru = range(LMAX + 1).map((l) => { let s = 0; for (let k = 0; k < N; k++) s += u[k] * u[(k + l) % N]; return s / N; });

    // espectro de potência de um período (linhas em m/N), em dB
    const step = Math.max(1, Math.ceil(N / 2 / 600));
    const fs = [], Pu = [];
    for (let m = 1; m <= N / 2; m += step) {
      let re = 0, im = 0;
      const w = 2 * Math.PI * m / N;
      for (let k = 0; k < N; k++) { re += u[k] * Math.cos(w * k); im -= u[k] * Math.sin(w * k); }
      fs.push(m / N); Pu.push(re * re + im * im);
    }
    const P0 = Math.max(...Pu);
    const PudB = Pu.map((v) => 10 * Math.log10(Math.max(v / P0, 1e-6)));
    const Gdb = fs.map((f) => { const w = 2 * Math.PI * f; const re = 1 - p * Math.cos(w), im = p * Math.sin(w); return 20 * Math.log10((1 - p) / Math.hypot(re, im)); });
    const fb = 0.44 / nb, fc = 1 / (2 * Math.PI * tau);

    const TOP = frame({ x: 90, y: 80, w: W - 130, h: H * 0.32 }, [0, SHOW], [-1.5, 1.5]);
    const BL = frame({ x: 90, y: H * 0.32 + 190, w: W * 0.36, h: H * 0.68 - 280 }, [0, LMAX], [-0.3, 1.1]);
    const BR = frame({ x: W * 0.36 + 220, y: H * 0.32 + 190, w: W * 0.64 - 260, h: H * 0.68 - 280 }, [0, 0.5], [-40, 3]);

    return {
      duration: 8, hold: 4,
      draw(t) {
        const a = ease(t / 5);
        axes(ctx, TOP, { xticks: ticks(0, SHOW, SHOW > 150 ? 40 : 20), yticks: [-1, 0, 1], yd: 0, xlabel: "k (amostras)" });
        line(ctx, TOP, ks, u.slice(0, SHOW), { color: C.navy, width: 2.2, stairs: true, n: Math.max(2, Math.round(a * SHOW)) });
        line(ctx, TOP, ks, y.slice(0, SHOW), { color: C.rose, width: 2.6, n: Math.max(2, Math.round(a * SHOW)) });
        legend(ctx, [{ label: "u[k]: PRBS", color: C.navy }, { label: `y[k]: planta de 1ª ordem, τ = ${fmt(tau, 0)} amostras`, color: C.rose }], TOP.box.x + 10, TOP.box.y - 52);
        text(ctx, `${n} bits → ${M} bits por período · Nb = ${nb} amostras por bit · período = ${N} amostras`,
          TOP.box.x + TOP.box.w, TOP.box.y - 10, { font: FONT.sansM, color: C.muted, align: "right" });

        const b = ease((t - 4) / 3);
        if (b <= 0) return;
        ctx.save(); ctx.globalAlpha = b;
        axes(ctx, BL, { xticks: ticks(0, LMAX, LMAX > 50 ? 20 : 10), yticks: [0, 0.5, 1], yd: 1, xlabel: "atraso ℓ", ylabel: "autocorrelação Rᵤ(ℓ)" });
        Ru.forEach((r, l) => seg(ctx, BL.x(l), BL.y(0), BL.x(l), BL.y(r), { color: C.navy, width: 2 }));
        if (nb > 1) text(ctx, `triângulo de largura ${nb}`, BL.x(nb) + 10, BL.y(0.75), { font: FONT.ital, color: C.navy });
        else text(ctx, "≈ impulso: parece ruído branco", BL.x(2), BL.y(0.75), { font: FONT.ital, color: C.navy });

        axes(ctx, BR, { xticks: ticks(0, 0.5, 0.1), xd: 1, yticks: [-40, -30, -20, -10, 0], yd: 0, xlabel: "f (ciclos/amostra)" });
        ctx.save();
        ctx.fillStyle = "rgba(46,156,107,0.10)";
        ctx.fillRect(BR.box.x, BR.box.y, Math.min(BR.x(fb), BR.box.x + BR.box.w) - BR.box.x, BR.box.h);
        ctx.restore();
        line(ctx, BR, fs, PudB, { color: C.navy, width: 1.6 });
        line(ctx, BR, fs, Gdb, { color: C.rose, width: 3 });
        if (fb <= 0.5) {
          seg(ctx, BR.x(fb), BR.box.y, BR.x(fb), BR.box.y + BR.box.h, { color: C.b, dash: [6, 5], width: 2 });
          text(ctx, "0,44/Tb", BR.x(fb) + 8, BR.box.y + 22, { font: FONT.sansM, color: C.b });
        }
        seg(ctx, BR.x(fc), BR.box.y, BR.x(fc), BR.box.y + BR.box.h, { color: C.rose, dash: [3, 4], width: 1.6 });
        text(ctx, "banda da planta", BR.x(fc) + 8, BR.box.y + 50, { font: FONT.sansM, color: C.rose });
        legend(ctx, [{ label: "|U(f)|² da PRBS (dB)", color: C.navy }, { label: "|G(f)|² da planta (dB)", color: C.rose }], BR.box.x + 10, BR.box.y - 22);
        ctx.restore();
      },
    };
  }, {
    n: { label: "bits n", min: 3, max: 10, step: 1, value: 7, digits: 0 },
    nb: { label: "Nb", min: 1, max: 10, step: 1, value: 2, digits: 0 },
    tau: { label: "τ planta", min: 1, max: 30, step: 1, value: 6, digits: 0 },
  });

  // =====================================================================
  // 3. arx-ls
  // =====================================================================
  register("arx-ls", ({ ctx, W, H, data }) => {
    const ent = clamp(Math.round(parseFloat(data.entrada ?? "1")), 0, 2);
    const sigma = parseFloat(data.sigma ?? "0.3");
    const a1 = -0.7, b1 = 1.5, N = 254;
    const R = rng(42);
    const u = ent === 1 ? prbs(7, 2).map((v) => 1.5 * v)
      : ent === 0 ? range(N).map((k) => (k >= 10 ? 1.5 : 0))
      : range(N).map((k) => 1.5 * Math.sin(2 * Math.PI * k / 25));
    const y = [0];
    for (let k = 1; k < N; k++) y.push(-a1 * y[k - 1] + b1 * u[k - 1] + sigma * R.gauss());
    const phis = [], Ys = [];
    for (let k = 1; k < N; k++) { phis.push([-y[k - 1], u[k - 1]]); Ys.push(y[k]); }
    const { TH } = mqr(phis, Ys, 1, 1e4);
    const kk = range(N - 1).map((k) => k + 1);
    // número de condição de Φ'Φ (2×2) no fim
    let s11 = 0, s12 = 0, s22 = 0;
    phis.forEach(([p, q]) => { s11 += p * p; s12 += p * q; s22 += q * q; });
    const tr = s11 + s22, dt = s11 * s22 - s12 * s12, disc = Math.sqrt(Math.max(tr * tr / 4 - dt, 0));
    const cond = (tr / 2 + disc) / Math.max(tr / 2 - disc, 1e-12);
    const NOMES = ["degrau", "PRBS", "senoide"];
    const yl = Math.max(4, Math.max(...y.map(Math.abs)) * 1.1);

    const U = frame({ x: 90, y: 60, w: W * 0.47, h: (H - 210) * 0.32 }, [0, N], [-2, 2]);
    const Y = frame({ x: 90, y: 60 + (H - 210) * 0.32 + 70, w: W * 0.47, h: (H - 210) * 0.68 - 20 }, [0, N], [-yl, yl]);
    const E = frame({ x: W * 0.47 + 220, y: 70, w: W * 0.53 - 260, h: H - 230 }, [0, N], [-1.5, 2.5]);

    return {
      duration: 10, hold: 4,
      draw(t) {
        const m = Math.max(2, Math.round(ease(t / 9) * (N - 1)));
        axes(ctx, U, { xticks: [], yticks: [-1.5, 0, 1.5], yd: 1, ylabel: `u[k]: ${NOMES[ent]}` });
        line(ctx, U, range(N), u, { color: C.navy, stairs: ent !== 2, n: m + 1, width: 2.2 });
        axes(ctx, Y, { xticks: ticks(0, 250, 50), yticks: [-Math.round(yl), 0, Math.round(yl)], yd: 0, xlabel: "k", ylabel: "y[k] medido" });
        line(ctx, Y, range(N), y, { color: C.rose, n: m + 1, width: 2.2 });

        axes(ctx, E, { xticks: ticks(0, 250, 50), yticks: [-1, 0, 1, 2], yd: 0, xlabel: "amostras usadas" });
        seg(ctx, E.box.x, E.y(a1), E.box.x + E.box.w, E.y(a1), { color: C.a, dash: [7, 6], width: 1.6 });
        seg(ctx, E.box.x, E.y(b1), E.box.x + E.box.w, E.y(b1), { color: C.b, dash: [7, 6], width: 1.6 });
        const clip = (v) => clamp(v, -1.5, 2.5);
        line(ctx, E, kk, TH.map((v) => clip(v[0])), { color: C.a, n: m, width: 3 });
        line(ctx, E, kk, TH.map((v) => clip(v[1])), { color: C.b, n: m, width: 3 });
        const th = TH[m - 1];
        legend(ctx, [{ label: `â₁ = ${fmt(th[0], 3)}  (−0,7)`, color: C.a }, { label: `b̂₁ = ${fmt(th[1], 3)}  (1,5)`, color: C.b }], E.box.x, E.box.y - 24);
        text(ctx, `cond(ΦᵀΦ) = ${cond > 1e5 ? cond.toExponential(1).replace(".", ",") : fmt(cond, 0)}`, E.box.x, H - 40,
          { font: FONT.sansB, color: cond > 200 ? C.rose : C.ink, alpha: ease((t - 8) / 1.5) });
        text(ctx, `σ do ruído = ${fmt(sigma, 2)}`, E.box.x + E.box.w, H - 40, { font: FONT.sansM, color: C.muted, align: "right" });
      },
    };
  }, {
    entrada: { label: "entrada (0 degrau · 1 PRBS · 2 senoide)", min: 0, max: 2, step: 1, value: 1, digits: 0 },
    sigma: { label: "σ ruído", min: 0, max: 0.8, step: 0.05, value: 0.3, digits: 2 },
  });

  // =====================================================================
  // 4. mqr
  // =====================================================================
  register("mqr", ({ ctx, W, H, data }) => {
    const lam = parseFloat(data.lam ?? "0.98");
    const N = 600, kc = 300;
    const R = rng(3);
    const u = prbs(6, 4).concat(prbs(6, 4)).concat(prbs(6, 4)).slice(0, N);
    const A = (k) => (k < kc ? 0.9 : 0.75), B = (k) => (k < kc ? 0.5 : 1.0);
    const y = [0];
    for (let k = 1; k < N; k++) y.push(A(k) * y[k - 1] + B(k) * u[k - 1] + 0.05 * R.gauss());
    const phis = [], Ys = [];
    for (let k = 1; k < N; k++) { phis.push([y[k - 1], u[k - 1]]); Ys.push(y[k]); }
    const { TH, EPS } = mqr(phis, Ys, lam, 1e3);
    const kk = range(N - 1).map((k) => k + 1);
    const yp = phis.map((p, k) => (k ? p[0] * TH[k - 1][0] + p[1] * TH[k - 1][1] : 0));
    const mem = lam < 1 ? 1 / (1 - lam) : Infinity;

    const Lf = frame({ x: 90, y: 60, w: W * 0.45, h: H - 220 }, [0, N], [-12, 12]);
    const Rf = frame({ x: W * 0.45 + 220, y: 60, w: W * 0.55 - 260, h: H - 220 }, [0, N], [0, 1.2]);

    return {
      duration: 11, hold: 4,
      draw(t) {
        const m = Math.max(2, Math.round(ease(t / 10) * (N - 1)));
        axes(ctx, Lf, { xticks: ticks(0, N, 100), yticks: [-10, 0, 10], yd: 0, xlabel: "k" });
        line(ctx, Lf, kk, Ys, { color: C.rose, n: m, width: 2 });
        line(ctx, Lf, kk, yp, { color: C.navy, n: m, width: 1.6, dash: [5, 4] });
        legend(ctx, [{ label: "y[k]", color: C.rose }, { label: "ŷ[k|k−1]", color: C.navy, dash: [5, 4] }], Lf.box.x, Lf.box.y - 24);

        axes(ctx, Rf, { xticks: ticks(0, N, 100), yticks: [0, 0.5, 1], yd: 1, xlabel: "k" });
        ctx.save(); ctx.fillStyle = "rgba(210,122,34,0.08)"; ctx.fillRect(Rf.x(kc), Rf.box.y, Rf.box.x + Rf.box.w - Rf.x(kc), Rf.box.h); ctx.restore();
        text(ctx, "a planta muda", Rf.x(kc) + 10, Rf.box.y + 24, { font: FONT.ital, color: C.g });
        line(ctx, Rf, kk, kk.map(A), { color: C.a, dash: [7, 6], width: 1.6 });
        line(ctx, Rf, kk, kk.map(B), { color: C.b, dash: [7, 6], width: 1.6 });
        line(ctx, Rf, kk, TH.map((v) => clamp(v[0], 0, 1.2)), { color: C.a, n: m, width: 3 });
        line(ctx, Rf, kk, TH.map((v) => clamp(v[1], 0, 1.2)), { color: C.b, n: m, width: 3 });
        const th = TH[m - 1];
        legend(ctx, [{ label: `â = ${fmt(th[0], 3)}`, color: C.a }, { label: `b̂ = ${fmt(th[1], 3)}`, color: C.b }], Rf.box.x, Rf.box.y - 24);
        text(ctx, `λ = ${fmt(lam, 3)} · memória ≈ 1/(1 − λ) = ${isFinite(mem) ? fmt(mem, 0) + " amostras" : "∞ (lembra tudo)"}`,
          Rf.box.x, H - 40, { font: FONT.sansB, color: C.ink });
      },
    };
  }, {
    lam: { label: "λ", min: 0.9, max: 1, step: 0.005, value: 0.98, digits: 3 },
  });
})();
