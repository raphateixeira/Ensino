# TopEspControle

Notas da disciplina optativa **Tópicos Especiais em Controle** (graduação em Engenharia Elétrica):
identificação de sistemas, controle digital, espaço de estados discreto, controle preditivo (MPC),
SINDy e redes neurais (inclusive recorrentes), com tópicos complementares (Kalman, DeePC, Koopman/DMD,
aprendizado por reforço, controle adaptativo, implementação em C2000).

## Estrutura

```
TopEspControle/
├── TopicosEspeciaisControle.qmd   página principal (cartão por aula)
├── _metadata.yml                  bibliografia (Referencias.bib)
├── Referencias.bib                referências citáveis com @chave
├── apa.csl
├── Codigos/                       scripts MATLAB/Python das aulas
└── Aulas/
    ├── Aula00PlanoEnsino.qmd      plano de ensino (tema rtx-revealjs)
    ├── _encerramento-rtx.qmd      slide de encerramento
    ├── anims/                     animações dos slides
    └── imgs/
```

Aula nova: criar `Aulas/AulaNN*.qmd` (já coberta por `TopEspControle/Aulas/*.qmd` no `project.render`)
e acrescentar o cartão em `TopicosEspeciaisControle.qmd`.
