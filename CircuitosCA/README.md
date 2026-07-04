# Modelo de Projeto de Apresentações em Quarto

Estrutura reutilizável para uma disciplina com notas de aula em slides
(Reveal.js) e um portal de navegação (HTML). Copie esta pasta, renomeie
e adapte para qualquer tema.

## Estrutura

```
Template/
├── _quarto.yml              configuração do site, navbar e bibliografia
├── Tema.scss                tema visual (cores/fontes no topo do arquivo)
├── index.qmd                portal com os links das aulas e avaliações
├── Referencias.bib          bibliografia citável com @chave nos .qmd
├── .github/workflows/
│   └── publish.yml            CI: renderiza e publica em GitHub Pages
├── Notas/
│   ├── Aula00PlanoEnsino.qmd   molde do plano de ensino
│   ├── Aula01Exemplo.qmd       aula-exemplo comentada (todos os recursos)
│   └── imgs/
│       ├── UFPA.png            logotipo da capa
│       └── tikz/
│           └── ExemploDiagrama.tikz   esquema em TikZ
└── Avaliacoes/
    └── Avaliacao01Exemplo.qmd  molde de prova/lista de exercícios
```

## Como adaptar

1. **Identidade visual:** edite as variáveis no topo de `Tema.scss`
   (`$cor-primaria`, `$cor-secundaria`, ...). Atualize a cor da navbar em
   `_quarto.yml` para o mesmo valor da cor primária.
2. **Logo:** substitua `Notas/imgs/UFPA.png`.
3. **Metadados:** troque os campos `<<< EDITAR` em `_quarto.yml` e os
   cabeçalhos YAML (`title`, `subtitle`, `institute`, `author`) de cada `.qmd`.
4. **Aulas:** copie `Aula01Exemplo.qmd`, renomeie, escreva o conteúdo e
   adicione a entrada correspondente em `index.qmd` e no menu do `_quarto.yml`.
5. **Avaliações:** copie `Avaliacoes/Avaliacao01Exemplo.qmd`, renomeie e
   adicione a entrada em `index.qmd` e no menu do `_quarto.yml`.
6. **Bibliografia:** edite `Referencias.bib` com suas fontes e cite com
   `@chave` em qualquer `.qmd` do projeto (o campo `bibliography:` em
   `_quarto.yml` já vale para todas as páginas).
7. **Publicação automática:** o workflow `.github/workflows/publish.yml`
   renderiza e publica o site em GitHub Pages a cada push em `main`.
   Após o primeiro run, ative em *Settings > Pages > Source > Deploy
   from branch > gh-pages*.

## Recursos demonstrados em `Aula01Exemplo.qmd`

- Slides 16:9, duas colunas, callouts (`note`, `important`, `tip`);
- Matemática em LaTeX (linha e destaque), matrizes;
- Exemplo passo a passo;
- Citações bibliográficas (`@chave`) com lista de referências automática;
- Código em abas (`panel-tabset`) para múltiplas linguagens;
- Figura em **TikZ** (`\input` de `imgs/tikz/`) e figura de imagem;
- Tabela e lista de exercícios.

## Renderização

Dentro da pasta do projeto:

```bash
quarto preview      # servidor local com navegação
quarto render       # gera o site em _site/
```

### Pré-requisitos

- **Quarto** instalado.
- **LaTeX** para os diagramas TikZ: `quarto install tinytex`.
- Pacote **R `magick`** (o engine TikZ converte PDF→PNG por meio dele):
  ```r
  install.packages("magick")
  ```
  No Linux, instale também a biblioteca de sistema (ex.: Ubuntu:
  `sudo apt install libmagick++-dev`).

### Observações sobre os chunks TikZ

- As opções de um chunk ```` ```{tikz} ```` começam com `%|`
  (comentário LaTeX), **não** com `#|`. Cada linguagem usa o seu próprio
  caractere de comentário para as opções de chunk.
- Carregue as bibliotecas TikZ necessárias no próprio chunk, com
  `\usetikzlibrary{...}`, antes do `\input`.
