-- Nova: opções do documento lidas do YAML.
--   eqx-mode: mono      -> começa com as equações em preto (tecla C alterna)
--   eqx-palette: cvd    -> paleta segura para daltonismo (tecla A alterna)
--   nova-mode: dark     -> modo escuro (tecla D alterna)
--   rtx-crumb: show     -> mostra a trilha da seção no canto do slide
local function flag(meta, key, value, class)
  local v = meta[key]
  if v and pandoc.utils.stringify(v) == value then
    quarto.doc.include_text("in-header",
      '<script>document.documentElement.classList.add("' .. class .. '")</script>')
  end
end

function Meta(meta)
  flag(meta, "eqx-mode", "mono", "eqx-mono")
  flag(meta, "eqx-palette", "cvd", "eqx-cvd")
  flag(meta, "nova-mode", "dark", "nova-dark")
  flag(meta, "rtx-crumb", "show", "rtx-crumb")
  return meta
end
