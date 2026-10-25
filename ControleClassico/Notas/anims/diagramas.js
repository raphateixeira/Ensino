/* =====================================================================
   Diagramas de blocos montados bloco a bloco (SVG + fragmentos).
   Cada etapa é um fragmento do revealjs: setas "se desenham", blocos e
   rótulos surgem. Diagramas disponíveis (data-nova-diagram):

     "malha-aberta"     controlador → atuador → planta, perturbação d
     "malha-fechada"    + sensor, comparador, erro, ruído de medição n
     "formas-blocos"    série, paralelo e realimentação → equivalentes

   Uso (o <script> logo depois do <div>):
     ::: {.nova-svg data-nova-diagram="malha-fechada"}
     :::
     <script src="anims/diagramas.js"></script>
   ===================================================================== */
(function () {
  "use strict";

  const C = { ink: "#1D1C1A", muted: "#77736A", grey: "#5F6368", rule: "#DDD7CB", navy: "#1B365D",
    rose: "#A63D4A", paper: "#F7F5F0", r: "#1D1C1A", e: "#D0473B", u: "#2E9C6B", y: "#3A6EDB",
    d: "#D27A22", n: "#7B4FD0" };
  const SERIF = '"Source Serif 4", Georgia, serif', SANS = '"Inter", sans-serif';
  const NS = "http://www.w3.org/2000/svg";

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  // Texto; "G_1" vira G com subscrito 1
  function txt(p, s, x, y, o = {}) {
    const t = el("text", { x, y, "text-anchor": o.anchor || "middle", fill: o.color || C.ink,
      "font-family": o.family || SERIF, "font-size": o.size || 30, "font-style": o.italic ? "italic" : "normal",
      "font-weight": o.weight || 400, class: "fade" }, p);
    s.split(/(_\{[^}]*\}|_\w)/).forEach((part) => {
      if (!part) return;
      const sub = part.match(/^_\{?([^}]*)\}?$/);
      const ts = el("tspan", sub ? { "baseline-shift": "sub", "font-size": "70%" } : {}, t);
      ts.textContent = sub ? sub[1] : part;
    });
    return t;
  }
  const ink = (p, d, color, w = 3) => el("path", { d, fill: "none", stroke: color, "stroke-width": w,
    "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1, class: "ink" }, p);
  function head(p, x, y, dir, color) {
    const L = 16, Wd = 8;
    const pts = { r: [[x, y], [x - L, y - Wd], [x - L, y + Wd]], l: [[x, y], [x + L, y - Wd], [x + L, y + Wd]],
      u: [[x, y], [x - Wd, y + L], [x + Wd, y + L]], d: [[x, y], [x - Wd, y - L], [x + Wd, y - L]] }[dir];
    el("polygon", { points: pts.map((q) => q.join(",")).join(" "), fill: color, class: "fade" }, p);
  }
  // seta: lista de pontos; a ponta aponta na direção do último segmento
  function arrow(p, pts, color, w = 3) {
    ink(p, "M" + pts.map((q) => q.join(",")).join(" L"), color, w);
    const [a, b] = pts.slice(-2);
    const dir = b[0] > a[0] ? "r" : b[0] < a[0] ? "l" : b[1] < a[1] ? "u" : "d";
    head(p, b[0], b[1], dir, color);
  }
  function block(p, x, y, w, h, title, sub, caption, tone = "navy") {
    const col = tone === "rose" ? C.rose : C.navy;
    el("rect", { x, y, width: w, height: h, rx: 10, fill: tone === "rose" ? "rgba(166,61,74,0.06)" : "rgba(27,54,93,0.06)",
      stroke: col, "stroke-width": 2.5, class: "fade" }, p);
    txt(p, title, x + w / 2, y + h / 2 + (sub ? 0 : 10), { italic: !/[a-zà-ú]{3,}/.test(title), size: 30, color: col });
    if (sub) txt(p, sub, x + w / 2, y + h / 2 + 32, { family: SANS, size: 18, color: C.grey });
    if (caption) txt(p, caption, x + w / 2, y + h + 30, { family: SANS, size: 19, color: col });
  }
  function sum(p, x, y, signs = {}) {
    el("circle", { cx: x, cy: y, r: 24, fill: C.paper, stroke: C.ink, "stroke-width": 2.5, class: "fade" }, p);
    txt(p, "Σ", x, y + 10, { size: 24 });
    if (signs.left) txt(p, signs.left, x - 36, y - 16, { family: SANS, size: 24 });
    if (signs.bottom) txt(p, signs.bottom, x - 20, y + 54, { family: SANS, size: 28, color: C.rose });
    if (signs.top) txt(p, signs.top, x - 22, y - 32, { family: SANS, size: 24 });
  }
  const label = (p, s, x, y, color, anchor = "start") => txt(p, s, x, y, { italic: true, anchor, color, size: 28 });
  const note = (p, s, x, y, color = C.grey) => txt(p, s, x, y, { family: SERIF, italic: true, size: 25, color });

  // -----------------------------------------------------------------
  const DIAGRAMS = {
    "malha-aberta"(svg, g) {
      svg.setAttribute("viewBox", "0 120 1496 380");
      const Y = 300, BH = 100;
      let G = g(1);
      label(G, "r(t)", 30, Y - 16, C.r);
      arrow(G, [[20, Y], [196, Y]], C.r);
      block(G, 200, Y - BH / 2, 230, BH, "Controlador", "ação pré-calculada", "", "navy");
      G = g(2);
      label(G, "u(t)", 460, Y - 16, C.u);
      arrow(G, [[430, Y], [596, Y]], C.u);
      block(G, 600, Y - BH / 2, 200, BH, "Atuador");
      arrow(G, [[800, Y], [966, Y]], C.u);
      block(G, 970, Y - BH / 2, 220, BH, "Planta");
      label(G, "y(t)", 1330, Y - 16, C.y);
      arrow(G, [[1190, Y], [1470, Y]], C.y);
      G = g(3);
      label(G, "d(t)", 1095, 168, C.d, "middle");
      arrow(G, [[1080, 180], [1080, Y - BH / 2 - 4]], C.d);
      note(G, "perturbação: ninguém a mede, ninguém a corrige", 1080, 470, C.d);
      G = g(4);
      note(G, "a saída não volta: o controlador nunca sabe se acertou", 640, 160, C.rose);
    },

    "malha-fechada"(svg, g) {
      svg.setAttribute("viewBox", "0 110 1496 470");
      const Y = 280, BH = 96;
      let G = g(1);
      label(G, "r(t)", 30, Y - 16, C.r);
      arrow(G, [[20, Y], [148, Y]], C.r);
      sum(G, 176, Y, { left: "+", bottom: "−" });
      label(G, "e(t)", 220, Y - 16, C.e);
      arrow(G, [[200, Y], [306, Y]], C.e);
      block(G, 310, Y - BH / 2, 210, BH, "Controlador", "", "decide u a partir de e");
      label(G, "u(t)", 548, Y - 16, C.u);
      arrow(G, [[520, Y], [636, Y]], C.u);
      block(G, 640, Y - BH / 2, 170, BH, "Atuador", "", "aplica a ação");
      arrow(G, [[810, Y], [906, Y]], C.u);
      G = g(2);
      sum(G, 934, Y, { left: "+", top: "+" });
      label(G, "d(t)", 960, 150, C.d);
      arrow(G, [[934, 150], [934, Y - 28]], C.d);
      arrow(G, [[958, Y], [1046, Y]], C.u);
      block(G, 1050, Y - BH / 2, 190, BH, "Planta", "", "sistema controlado");
      label(G, "y(t)", 1390, Y - 16, C.y);
      arrow(G, [[1240, Y], [1470, Y]], C.y);
      G = g(3);
      el("circle", { cx: 1340, cy: Y, r: 6, fill: C.rose, class: "fade" }, G);
      arrow(G, [[1340, Y], [1340, 450], [1166, 450]], C.rose);
      block(G, 980, 410, 180, 82, "Sensor", "", "", "rose");
      label(G, "yₘ(t)", 820, 440, C.rose);
      arrow(G, [[980, 450], [176, 450], [176, Y + 28]], C.rose);
      G = g(4);
      label(G, "n(t)", 1180, 540, C.n);
      arrow(G, [[1150, 552], [1100, 552], [1100, 496]], C.n);
      note(G, "ruído de medição entra pelo sensor", 600, 540, C.n);
    },

    "formas-blocos"(svg, g) {
      svg.setAttribute("viewBox", "0 0 1496 640");
      const rows = [90, 300, 520];
      // série
      let G = g(1);
      txt(G, "série", 40, rows[0] + 8, { family: SANS, size: 20, color: C.muted, anchor: "start", weight: 600 });
      arrow(G, [[140, rows[0]], [226, rows[0]]], C.ink);
      block(G, 230, rows[0] - 40, 140, 80, "G_1");
      arrow(G, [[370, rows[0]], [446, rows[0]]], C.ink);
      block(G, 450, rows[0] - 40, 140, 80, "G_2");
      arrow(G, [[590, rows[0]], [680, rows[0]]], C.ink);
      G = g(2);
      txt(G, "⇒", 760, rows[0] + 12, { size: 44, color: C.rose });
      arrow(G, [[850, rows[0]], [946, rows[0]]], C.ink);
      block(G, 950, rows[0] - 40, 200, 80, "G_1 G_2");
      arrow(G, [[1150, rows[0]], [1246, rows[0]]], C.ink);
      note(G, "multiplicam", 1330, rows[0] + 8, C.rose);
      // paralelo
      const R = rows[1];
      G = g(3);
      txt(G, "paralelo", 40, R + 8, { family: SANS, size: 20, color: C.muted, anchor: "start", weight: 600 });
      el("circle", { cx: 200, cy: R, r: 6, fill: C.ink, class: "fade" }, G);
      ink(G, `M140,${R} L200,${R}`, C.ink);
      arrow(G, [[200, R], [200, R - 70], [296, R - 70]], C.ink);
      arrow(G, [[200, R], [200, R + 70], [296, R + 70]], C.ink);
      block(G, 300, R - 105, 140, 70, "G_1");
      block(G, 300, R + 35, 140, 70, "G_2");
      arrow(G, [[440, R - 70], [540, R - 70], [540, R - 26]], C.ink);
      arrow(G, [[440, R + 70], [540, R + 70], [540, R + 26]], C.ink);
      sum(G, 540, R, { left: "", top: "" });
      txt(G, "+", 520, R - 34, { family: SANS, size: 22 });
      txt(G, "±", 520, R + 50, { family: SANS, size: 22 });
      arrow(G, [[564, R], [680, R]], C.ink);
      G = g(4);
      txt(G, "⇒", 760, R + 12, { size: 44, color: C.rose });
      arrow(G, [[850, R], [946, R]], C.ink);
      block(G, 950, R - 40, 200, 80, "G_1 ± G_2");
      arrow(G, [[1150, R], [1246, R]], C.ink);
      note(G, "somam", 1330, R + 8, C.rose);
      // realimentação
      const Q = rows[2];
      G = g(5);
      txt(G, "realimentação", 40, Q - 40, { family: SANS, size: 20, color: C.muted, anchor: "start", weight: 600 });
      arrow(G, [[140, Q], [206, Q]], C.ink);
      sum(G, 230, Q, { left: "+", bottom: "∓" });
      arrow(G, [[254, Q], [336, Q]], C.ink);
      block(G, 340, Q - 40, 140, 80, "G");
      ink(G, `M480,${Q} L640,${Q}`, C.ink);
      head(G, 680, Q, "r", C.ink);
      ink(G, `M640,${Q} L680,${Q}`, C.ink);
      el("circle", { cx: 580, cy: Q, r: 6, fill: C.rose, class: "fade" }, G);
      arrow(G, [[580, Q], [580, Q + 80], [484, Q + 80]], C.rose);
      block(G, 340, Q + 50, 140, 64, "H", "", "", "rose");
      arrow(G, [[340, Q + 80], [230, Q + 80], [230, Q + 26]], C.rose);
      G = g(6);
      txt(G, "⇒", 760, Q + 12, { size: 44, color: C.rose });
      arrow(G, [[850, Q], [946, Q]], C.ink);
      block(G, 950, Q - 50, 260, 100, "G / (1 ± G H)");
      arrow(G, [[1210, Q], [1286, Q]], C.ink);
      note(G, "a fórmula da malha", 1390, Q - 4, C.rose);
      note(G, "fechada", 1390, Q + 26, C.rose);
    },
  };

  const buildAll = () => {
    let n = 0;
    document.querySelectorAll("[data-nova-diagram]:not(.built)").forEach((host) => {
      const make = DIAGRAMS[host.dataset.novaDiagram];
      if (!make) return;
      host.classList.add("built");
      const svg = el("svg", { role: "img", "aria-label": host.dataset.novaDiagram }, host);
      const g = (i) => el("g", { class: "fragment draw", "data-fragment-index": i }, svg);
      make(svg, g);
      n++;
    });
    return n;
  };
  buildAll();
  // diagramas que aparecem depois do <script> na página: monta no load e
  // avisa o revealjs dos novos fragmentos
  window.addEventListener("load", () => {
    if (buildAll() && window.Reveal && Reveal.isReady && Reveal.isReady()) Reveal.sync();
  });
})();
