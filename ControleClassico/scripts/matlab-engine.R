# Motor knitr para blocos ```{matlab}: executa o código com `matlab -batch`,
# captura a saída de texto e exporta as figuras abertas (PNG no estilo do tema
# Nova; o fundo branco some no papel via multiply). Cada bloco roda numa sessão
# nova do MATLAB (~15 s):
# use `#| cache: true` para não reexecutar a cada render.
#
# Uso no .qmd (engine: knitr):
#   ```{r}
#   #| include: false
#   source("scripts/matlab-engine.R")
#   ```

nova_matlab_bin <- local({
  cand <- c(Sys.getenv("MATLAB_BIN"), Sys.which("matlab"),
            Sys.glob("/Applications/MATLAB_R20*.app/bin/matlab"))
  cand <- cand[nzchar(cand) & file.exists(cand)]
  if (length(cand)) tail(sort(cand), 1) else "matlab"
})

nova_matlab_style <- c(
  "set(groot, 'defaultFigureVisible', 'off');",
  "set(groot, 'defaultFigureColor', 'w', 'defaultAxesColor', 'w');",  # branco some no papel (multiply)
  "set(groot, 'defaultFigurePosition', [100 100 820 470]);",
  "set(groot, 'defaultAxesFontName', 'Helvetica', 'defaultAxesFontSize', 15);",
  "set(groot, 'defaultAxesXColor', [0.47 0.45 0.42], 'defaultAxesYColor', [0.47 0.45 0.42]);",
  "set(groot, 'defaultAxesXGrid', 'on', 'defaultAxesYGrid', 'on', 'defaultAxesBox', 'off');",
  "set(groot, 'defaultAxesGridColor', [0.80 0.77 0.71], 'defaultAxesGridAlpha', 0.6);",
  "set(groot, 'defaultLineLineWidth', 2.4, 'defaultConstantLineLineWidth', 1.4);",
  paste0("set(groot, 'defaultAxesColorOrder', [0.227 0.431 0.859; 0.816 0.278 0.231; ",
         "0.180 0.612 0.420; 0.482 0.310 0.816; 0.824 0.478 0.133]);")
)

knitr::knit_engines$set(matlab = function(options) {
  if (!isTRUE(options$eval)) return(knitr::engine_output(options, options$code, ""))

  work <- tempfile("nova_matlab_"); dir.create(work)
  fig_prefix <- paste0(options$fig.path, options$label)
  dir.create(dirname(fig_prefix), recursive = TRUE, showWarnings = FALSE)
  fig_abs <- file.path(normalizePath(dirname(fig_prefix)), basename(fig_prefix))

  export <- sprintf(paste0(
    "nova_f = flip(findall(groot, 'Type', 'figure'));\n",
    "for nova_i = 1:numel(nova_f)\n",
    "  exportgraphics(nova_f(nova_i), sprintf('%s-%%d.png', nova_i), ",
    "'Resolution', 200, 'BackgroundColor', 'white');\n",
    "end"), fig_abs)
  writeLines(c(nova_matlab_style, options$code, export), file.path(work, "nova_chunk.m"))

  old <- Sys.glob(paste0(fig_abs, "-*.png")); unlink(old)
  out <- suppressWarnings(system2(nova_matlab_bin,
    c("-batch", shQuote(sprintf("cd('%s'); nova_chunk", work))), stdout = TRUE, stderr = TRUE))
  unlink(work, recursive = TRUE)

  figs <- sort(Sys.glob(paste0(fig_abs, "-*.png")))
  rel <- file.path(dirname(fig_prefix), basename(figs))
  plots <- vapply(rel, function(f) knitr::knit_hooks$get("plot")(f, options), character(1))
  options$engine <- "matlab"
  txt <- if (length(out)) paste(out, collapse = "\n") else NULL
  paste(c(knitr::engine_output(options, options$code, txt), plots), collapse = "\n")
})
