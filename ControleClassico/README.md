# ControleClassico

Notas da disciplina de **Sistemas de Controle I** — Controle Clássico, contínuo,
no domínio da frequência (função de transferência). Site Quarto com notas de
aula em slides (Reveal.js) e um portal de navegação (HTML).

## Estrutura

```
ControleClassico/
├── _quarto.yml               configuração do site, navbar e bibliografia
├── Tema.scss                 tema visual (paleta institucional UFPA)
├── index.qmd                 portal com os links das aulas e avaliações
├── Referencias.bib           bibliografia citável com @chave nos .qmd
├── scripts/
│   └── gerar_figuras.py        gera as figuras de dados (respostas, LGR, Bode, PID)
├── .github/workflows/
│   └── publish.yml             CI: renderiza e publica em GitHub Pages
├── Notas/
│   ├── Aula00PlanoEnsino.qmd    plano de ensino
│   ├── Aula01Introducao.qmd     definições, malha aberta/fechada, terminologia
│   ├── Aula02ModelagemFT.qmd    Laplace, função de transferência, diagrama de blocos
│   ├── Aula03PrimeiraOrdem.qmd  sistemas de primeira ordem
│   ├── Aula04SegundaOrdem.qmd   sistemas de segunda ordem
│   ├── Aula05RespostaTransitoria.qmd  polos dominantes, efeito de polos/zeros extras
│   ├── Aula06ErroRegimePermanente.qmd erro em regime permanente, tipo de sistema
│   ├── Aula07LGR.qmd            lugar geométrico das raízes
│   ├── Aula08RespostaFrequencia.qmd   Bode, margens de estabilidade
│   ├── Aula09PID.qmd            controlador PID e sintonia
│   └── imgs/
│       ├── UFPA.png              logotipo da capa
│       ├── plots/                 figuras geradas por scripts/gerar_figuras.py
│       └── tikz/                  diagramas de blocos em TikZ
└── Avaliacoes/
    └── Avaliacao01Exemplo.qmd    molde de prova/lista de exercícios
```

## Renderização

Dentro da pasta do projeto:

```bash
quarto preview      # servidor local com navegação
quarto render       # gera o site em _site/
```

### Pré-requisitos

- **Quarto** instalado.
- **LaTeX** para os diagramas TikZ: `quarto install tinytex` (ou TeX Live com
  `pgf`/`tikz`).
- Pacote **R `magick`** (o engine TikZ converte PDF→PNG por meio dele):
  ```r
  install.packages("magick")
  ```
- **Python 3** com `numpy`, `matplotlib` e `control` para regenerar as figuras
  de dados (respostas no tempo, LGR, Bode, comparação de controladores PID):
  ```bash
  pip install numpy matplotlib control
  python3 scripts/gerar_figuras.py
  ```
  As figuras já ficam versionadas em `Notas/imgs/plots/`; rode o script
  apenas se alterar os parâmetros dos exemplos.

### Observações sobre os chunks TikZ

- As opções de um chunk ```` ```{tikz} ```` começam com `%|` (comentário
  LaTeX), **não** com `#|`.
- Carregue as bibliotecas TikZ necessárias no próprio chunk, com
  `\usetikzlibrary{...}`, antes do `\input`.

## Conteúdo do curso

Introdução aos sistemas de controle (malha aberta/fechada, terminologia);
modelagem por função de transferência (Laplace, diagrama de blocos, álgebra de
blocos); sistemas de primeira e segunda ordem; resposta
transitória de sistemas de ordem superior e polos dominantes; erro de regime
permanente e tipo de sistema; lugar geométrico das raízes (LGR); resposta em
frequência (Bode, margens de ganho e fase); controladores PID (ação
proporcional, integral, derivativa e sintonia de Ziegler-Nichols).
