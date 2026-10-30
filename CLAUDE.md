# CLAUDE.md

`Ensino` (público, Pages em raphateixeira.github.io/Ensino/) junta desde 2026-10-25 os repositórios
das disciplinas (AlgebraLinear, CircuitosCA, ControleClassico, ControleEstados, MetodosNumericos,
DeepLearning), cada um inteiro numa subpasta com o histórico.

- Um único projeto Quarto na raiz: **não criar `_quarto.yml` em subpastas**. Páginas novas precisam
  casar com um padrão de `project.render`.
- **Uma só página índice** (`index.qmd`): seção por disciplina (âncoras `#circuitos`,
  `#controle-classico`, `#calculo-numerico`, `#algebra-linear`, `#controle-estados`,
  `#aprendizagem-maquina`, usadas na navbar), cartões `.categoria-card` com links `.html`
  (o Quarto não converte `.qmd` dentro de HTML bruto).
- Cada slide define o próprio formato (tema `../../TemaRTx.scss`, 1600×900, logo); **não** pôr
  `format:` em `_metadata.yml` (é somado ao do documento e gera saída dupla). `_metadata.yml` só
  para bibliografia (CircuitosCA, ControleClassico, DeepLearning).
- Tema Nova (`format: nova-revealjs`): extensão em `_extensions/nova/` na raiz (cópia idêntica à do
  NovaPresent/ConversoresPotencia/MicrorredeCAMTUC; atualizar copiando). Slides Nova não declaram tema nem
  tamanho; usam `resources: - "anims/*"` e `{{< include _encerramento.qmd >}}`. Já migrada:
  `CircuitosCA/Notas/Aula05Potencia.qmd` (animações em `CircuitosCA/Notas/anims/potencia.js`); `ControleClassico/Notas/Aula08LGR.qmd` (LGR, animações em `ControleClassico/Notas/anims/lgr.js`; o encerramento lá é `_encerramento-nova.qmd`).
- `index.qmd` precisa de `title` explícito (com `title-block-style: none`): sem ele o Quarto promove o
  primeiro título após a célula Python (`## Circuitos Elétricos II`) a título da página.
- Rascunhos `ControleClassico/Notas/*Nova.qmd` ficam fora do render (motor do MATLAB).
- **Nunca versionar** `CircuitosCA/Gabaritos/`, `ControleClassico/Resultados/` (dados de alunos) nem
  PDFs de livros (ver `.gitignore`).
