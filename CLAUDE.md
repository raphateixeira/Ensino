# CLAUDE.md

`Ensino` (público, Pages em raphateixeira.github.io/Ensino/) junta desde 2026-10-25 os repositórios
das disciplinas (AlgebraLinear, CircuitosCA, ControleClassico, ControleEstados, MetodosNumericos,
DeepLearning), cada um inteiro numa subpasta com o histórico. `TopEspControle` (Tópicos Especiais em
Controle, optativa) foi criada em 2026-11-17 já no tema RTx.

- Um único projeto Quarto na raiz: **não criar `_quarto.yml` em subpastas**. Páginas novas precisam
  casar com um padrão de `project.render`.
- **Índice** (`index.qmd`): horários do semestre e um cartão por disciplina. Cada disciplina tem
  uma **página principal** na raiz da pasta, com o nome da disciplina
  (`CircuitosCA/CircuitosEletricosII.qmd`, `ControleClassico/SistemasControleI.qmd`,
  `MetodosNumericos/CalculoNumerico.qmd`, `AlgebraLinear/AlgebraLinear.qmd`,
  `ControleEstados/SistemasControleII.qmd`, `DeepLearning/AprendizagemMaquina.qmd`,
  `TopEspControle/TopicosEspeciaisControle.qmd`), listada em
  `project.render` e na navbar; **aula nova = cartão nessa página**. Cartões `.categoria-card` com
  links `.html` (o Quarto não converte `.qmd` dentro de HTML bruto). Essas páginas e o índice
  escondem `#title-block-header` (com `title-block-style: none` o título ainda aparecia acima do hero).
- Cada slide define o próprio formato (tema `../../TemaRTx.scss`, 1600×900, logo); **não** pôr
  `format:` em `_metadata.yml` (é somado ao do documento e gera saída dupla). `_metadata.yml` só
  para bibliografia (CircuitosCA, ControleClassico, DeepLearning).
- Tema Nova (`format: nova-revealjs`): extensão em `_extensions/nova/` na raiz (cópia idêntica à do
  NovaPresent/ConversoresPotencia/MicrorredeCAMTUC; atualizar copiando). Slides Nova não declaram tema nem
  tamanho; usam `resources: - "anims/*"` e `{{< include _encerramento.qmd >}}`. Já migrada:
  `CircuitosCA/Notas/Aula05Potencia.qmd` (animações em `CircuitosCA/Notas/anims/potencia.js`); `ControleClassico/Aulas/Aula08LGR.qmd` (LGR, animações em `ControleClassico/Aulas/anims/lgr.js`; o encerramento lá é `_encerramento-nova.qmd`).
- Tema RTx (`format: rtx-revealjs`, desde 2026-11-16): visual do TemaRTx (branco, Roboto/Lato,
  blocos e capa) + recursos da Nova. Extensão em `_extensions/rtx/`, gerada em
  `~/GitRTx/NovaPresent/_extensions/rtx/` (`build_rtx.py` monta `rtx.scss` a partir de `nova.scss` +
  `TemaRTx.scss`; atualizar copiando). Encerramento: `_encerramento-rtx.qmd`. `anims/nova-anim.js` lê
  cores/fontes do tema por variáveis CSS (`--anim-*`, `--nova-bg`), com padrões da Nova. Em uso nos
  exemplos de LGR `ControleClassico/Aulas/Aula08Ex0[1-4]*.qmd` (1ª ordem, duplo integrador, motor CC,
  servo de posição); animações novas `anims/plano-s.js` (plano s/`sgrid`) e diagrama `motor-cc` em
  `anims/diagramas.js`; `lgr` aceita `data-gain` (ganho da planta).
- `index.qmd` precisa de `title` explícito (com `title-block-style: none`): sem ele o Quarto promove o
  primeiro título após a célula Python (`## Circuitos Elétricos II`) a título da página.
- Rascunhos `ControleClassico/Aulas/*Nova.qmd` ficam fora do render (motor do MATLAB).
- **Nunca versionar** `CircuitosCA/Gabaritos/`, `ControleClassico/Resultados/` (dados de alunos) nem
  PDFs de livros (ver `.gitignore`).
