# Proposta: Enhanceamento da Aula01Introducao.qmd
## Estrutura Detalhada com Código Quarto + Exemplos

---

## 📋 Estrutura do Arquivo .qmd Recomendada

```yaml
---
title: "Aula 01 — Introdução aos Sistemas de Controle"
subtitle: "O que é controle? Malha aberta vs. fechada"
author: "Prof. Raphael Teixeira"
date: "2026"
format:
  revealjs:
    theme: dark
    transition: slide
    slide-number: true
    footer: "Sistemas de Controle I — UFPA Tucuruí"
---
```

---

## 🎬 Slide 1: Título + Motivação

```markdown
# Aula 01: Introdução aos Sistemas de Controle

**O que é controle? Por que importa?**

> "Não há engenharia sem controle."
>
> — Norman Nise, *Control Systems Engineering*

:::{.callout-note}
## Objetivo da Aula

Ao final, você será capaz de:

✅ Reconhecer sistemas de controle no dia a dia  
✅ Diferenciar malha aberta de malha fechada  
✅ Desenhar diagrama de blocos de um sistema  
✅ Classificar controladores (P, I, D, PID)  
:::
```

---

## 🎯 Slides 2–3: Motivação com Exemplos Reais

### Slide 2: Exemplo 1 — Termostato de Casa

```markdown
## Exemplo 1: Controle de Temperatura (Termostato)

**Cenário:** Você quer manter a casa a 22°C no inverno.

### Sem Controle Automático (Malha Aberta)
- ❌ Liga aquecedor ao máximo
- ❌ Temperatura sobe para 28°C e não para
- ❌ Desperdício de energia
- ❌ Você liga/desliga manualmente

### Com Controle Automático (Malha Fechada)
- ✅ Sensor mede temperatura contínuamente
- ✅ Se T < 22°C → aquecedor liga
- ✅ Se T > 22°C → aquecedor desliga
- ✅ Resultado: T ≈ 22°C automaticamente
- ✅ Economia de energia

**Conclusão:** Feedback automático = conforto + eficiência
```

### Slide 3: Exemplo 2 — Velocidade de Carro (Cruise Control)

```markdown
## Exemplo 2: Cruise Control (Cruzeiro Automático)

**Tarefa:** Manter velocidade de 100 km/h em estrada.

### Sem Controle (Manual)
- Motorista pressiona pedal com força X
- Subida → velocidade cai → motorista ajusta (lento)
- Descida → velocidade sobe → motorista ajusta (lento)
- 😩 Cansativo, reativo

### Com Controle Automático
- Sensor de velocidade (radar/GPS) mede V_real
- Compara com setpoint (100 km/h)
- Se V < 100 → motor acelera
- Se V > 100 → freio suave aplica
- 😊 Automático, preciso, suave

**Insight:** Sistema de controle "pensa" por você
```

---

## 📚 Slide 4: O que é um "Sistema de Controle"?

```markdown
## Definição: Sistema de Controle

Um **sistema de controle** é um conjunto de componentes que trabalham juntos para:

1. **Receber** uma entrada desejada (setpoint/referência)
2. **Processar** essa informação (controlador)
3. **Atuar** na planta (atuador)
4. **Medir** a saída (sensor)
5. **Comparar** saída real com desejada
6. **Ajustar** ação se houver erro

$$\text{Objetivo: saída} \approx \text{referência}$$

### Estrutura Genérica (Diagrama de Blocos)

```{tikz}
#| label: fig-sistema-generico
#| fig-cap: "Estrutura de um sistema de controle em malha fechada"
#| fig-width: 10
#| fig-height: 4

\usetikzlibrary{shapes, arrows, positioning}

\begin{tikzpicture}[node distance=1.5cm]
  
  % Referência
  \node[draw, circle] (ref) {$r$};
  
  % Comparador
  \node[draw, circle, right of=ref] (cmp) {$\sum$};
  
  % Controlador
  \node[draw, rectangle, right of=cmp] (ctrl) {$C(s)$};
  
  % Atuador (implícito em planta)
  
  % Planta
  \node[draw, rectangle, right of=ctrl] (plant) {$G(s)$};
  
  % Sensor
  \node[draw, rectangle, below of=plant] (sensor) {$H(s)$};
  
  % Saída
  \node[right of=plant] (out) {$y$};
  
  % Setas
  \draw[->] (ref) -- (cmp);
  \draw[->] (cmp) -- node[above] {$e$} (ctrl);
  \draw[->] (ctrl) -- node[above] {$u$} (plant);
  \draw[->] (plant) -- (out);
  \draw[->] (plant) |- (sensor);
  \draw[->] (sensor) -| (cmp);
  \draw[-] (cmp.east) -- ++(.3,0) node[draw, circle, anchor=west] (minus) {$-$};
  
\end{tikzpicture}
```

**Legenda:**
- $r$ = referência (setpoint desejado)
- $e$ = erro = $r - y$
- $C(s)$ = controlador (P, PI, PD, PID)
- $G(s)$ = planta (sistema a ser controlado)
- $u$ = ação de controle
- $y$ = saída medida
- $H(s)$ = sensor
```

---

## 🔀 Slides 5–6: Malha Aberta vs. Malha Fechada

### Slide 5: Malha Aberta (Open-Loop)

```markdown
## Sistema em Malha Aberta

**Definição:** Não há realimentação. Entrada é pré-programada.

### Diagrama

```{tikz}
#| label: fig-malha-aberta
#| fig-cap: "Sistema em malha aberta"
#| fig-width: 10
#| fig-height: 3

\usetikzlibrary{shapes, arrows, positioning}

\begin{tikzpicture}[node distance=2cm]
  \node[anchor=west] at (0,0) {INPUT};
  \node[draw, rectangle, right=1cm of (0,0)] (ctrl) {Controlador\\(pré-programado)};
  \node[draw, rectangle, right=1.5cm of ctrl] (plant) {Planta};
  \node[right=1.5cm of plant] (out) {OUTPUT};
  
  \draw[->] (0,0) -- (ctrl);
  \draw[->] (ctrl) -- (plant);
  \draw[->] (plant) -- (out);
\end{tikzpicture}
```

### Vantagens ✅
- Simples, barato
- Fácil de projetar (não requer sensor)
- Estável se planta é estável

### Desvantagens ❌
- Sem capacidade de correção
- Sensível a distúrbios
- Requer modelo exato da planta
- Sem adaptação a mudanças

### Exemplos
- ⏲️ Forno com timer (não ajusta tempo)
- 🚗 Acelerador manual (pressiona com força X)
- 🚀 Trajetória pré-programada de foguete (sem guidance)
```

### Slide 6: Malha Fechada (Closed-Loop)

```markdown
## Sistema em Malha Fechada

**Definição:** Saída é medida e comparada com referência. Erro alimenta controlador.

### Diagrama

```{tikz}
#| label: fig-malha-fechada
#| fig-cap: "Sistema em malha fechada (realimentação)"
#| fig-width: 10
#| fig-height: 4

\usetikzlibrary{shapes, arrows, positioning}

\begin{tikzpicture}[node distance=1.5cm]
  
  \node (ref) at (0, 2) {$r$};
  \node[draw, circle, right=1cm of ref] (cmp) {$-$};
  \node[draw, rectangle, right=1.5cm of cmp] (ctrl) {$C(s)$};
  \node[draw, rectangle, right=1.5cm of ctrl] (plant) {$G(s)$};
  \node[right=1.5cm of plant] (out) {$y$};
  
  \node[draw, rectangle, below=2cm of plant] (sensor) {$H(s)$};
  
  % Setas
  \draw[->] (ref) -- (cmp);
  \draw[->] (cmp) -- node[above] {$e$} (ctrl);
  \draw[->] (ctrl) -- node[above] {$u$} (plant);
  \draw[->] (plant) -- (out);
  
  % Realimentação
  \draw[->] (plant.south) -- ++(.5,0) -- ++(0,-2) -- (sensor.east);
  \draw[->] (sensor.west) -- ++(-.5,0) -- ++(0,2) -- (cmp.south);
  
\end{tikzpicture}
```

### Vantagens ✅
- Corrige erros automaticamente
- Robusto a distúrbios
- Funciona com incerteza no modelo
- Adapta-se a mudanças

### Desvantagens ❌
- Mais caro (sensores, hardware)
- Possibilidade de instabilidade
- Atraso de realimentação → oscilações
- Mais complexo de sintonizar

### Exemplos
- 🌡️ Termostato (sensor de temperatura)
- 🚗 Cruise control (sensor de velocidade)
- 🎮 Joystick de videogame com força (realimentação háptica)
- ✈️ Autopilot de avião (múltiplos sensores)
```

---

## 📖 Slides 7–10: Terminologia Essencial

### Slide 7: Glossário — Parte 1

```markdown
## Terminologia de Controle — Parte 1

| Termo | Símbolo | Significado |
|-------|---------|-------------|
| **Setpoint** | $r$ | Valor desejado (referência) |
| **Saída** | $y$ | Valor medido (real) |
| **Erro** | $e = r - y$ | Diferença entre desejado e real |
| **Ação de Controle** | $u$ | Sinal enviado ao atuador |
| **Planta** | $G(s)$ | Sistema a ser controlado |
| **Controlador** | $C(s)$ | Algoritmo de decisão |
| **Sensor** | $H(s)$ | Mede a saída |
| **Atuador** | — | Converte sinal em ação (motor, válvula) |

### Exemplo: Termostato
- $r = 22°C$ (temperatura desejada)
- $y = 20.5°C$ (temperatura medida)
- $e = 22 - 20.5 = +1.5°C$ (muito frio)
- $u = $ "liga aquecedor com 70% potência"
```

### Slide 8: Glossário — Parte 2

```markdown
## Terminologia de Controle — Parte 2

| Termo | Significado | Métrica |
|-------|-------------|---------|
| **Resposta Transitória** | Comportamento imediato após mudança | Tempo (segundos) |
| **Regime Permanente** (Steady-State) | Comportamento após "tempo infinito" | Erro residual |
| **Erro de Estado Estacionário** | $e_{ss}$ = erro residual em regime | % da referência |
| **Estabilidade** | Sistema converge, não diverge | Sim/Não (binário) |
| **Overshoot** | Quanto ultrapassa setpoint | % |
| **Tempo de Acomodação** | Quanto tempo para estabilizar | Segundos (ex: 95% critério) |
| **Margem de Segurança** | Quanto de incerteza tolera | dB ou % |
| **Distúrbio** | Perturbação externa não controlada | Amplitude |

### Exemplo Prático: Resposta ao Degrau
```
y(t)
  |     r = 22°C (setpoint)
  |     ___________
  |    /|← overshoot
  |___/ |← transitório
  |    └─ regime permanente
  |_____________________________ t
  0    1    2    5    10    15
  
Interpretação:
- Transitório: 0 a 2 segundos
- Regime permanente: t > 5 segundos
- Tempo de acomodação: ~3s
- Overshoot: ~2%
- e_ss: ≈ 0.1°C
```
```

### Slide 9: Estabilidade

```markdown
## Estabilidade: Conceito Crítico

**Definição:** Um sistema é **estável** se, após perturbação, converge para equilíbrio.

### Três Casos

#### Estável ✅
```
y(t)
  |    ___
  |   /
  |__/___________
  |______________t
  
Saída converge para setpoint.
```

#### Marginalmente Estável ⚠️
```
y(t)
  |    /\/\/\/
  |   /         \
  |__/\_________\
  |______________t
  
Oscila indefinidamente (não converge).
Inaceitável na prática.
```

#### Instável ❌
```
y(t)
  |      
  |                /
  |              /
  |            /
  |__________/____t
  
Diverge sem parar.
Sistema perde controle!
NUNCA aceitável.
```

### Controle Realimentado vs. Instabilidade

⚠️ **Cuidado:** Um controlador mal sintonizado pode **desestabilizar** um sistema estável!

Exemplo: Ganho muito alto em chuveiro automático → oscila quente/frio/quente/frio...
```

### Slide 10: Objetivos de um Sistema de Controle

```markdown
## 4 Objetivos Principais

### 1️⃣ Rastreamento (Tracking)
- **O quê:** Saída segue referência
- **Métrica:** Erro pequeno
- **Exemplo:** Velocidade de carro = setpoint (100 km/h)

### 2️⃣ Rejeição de Distúrbios
- **O quê:** Saída não muda com perturbações externas
- **Métrica:** Atenuação de distúrbio
- **Exemplo:** Temperatura de casa = 22°C mesmo com vento frio

### 3️⃣ Estabilidade
- **O quê:** Sistema não diverge
- **Métrica:** Todos os polos no semiplano esquerdo
- **Exemplo:** Não oscila infinitamente

### 4️⃣ Robustez
- **O quê:** Controlador funciona com incerteza de modelo
- **Métrica:** Margem de ganho/fase
- **Exemplo:** PID funciona tanto em sala grande quanto pequena

### Trade-offs ⚖️

Não é possível otimizar os 4 simultaneamente!

- ⚡ Muito rápido → pode desestabilizar
- 🔇 Muito robusto → pode ser lento
- 📊 Baixo erro → requer mais energia

**Engenheiro = juiz dos trade-offs**
```

---

## 🏗️ Slides 11–12: Classificação de Sistemas

```markdown
## Classificação de Sistemas

### Por Número de Entradas/Saídas

| Classe | Entradas | Saídas | Exemplo |
|--------|----------|--------|---------|
| **SISO** | 1 | 1 | Termostato simples |
| **MIMO** | Múltiplas | Múltiplas | Avião (leme, profundor, ailerons) |

### Por Linearidade

| Classe | Relação | Exemplo |
|--------|---------|---------|
| **Linear** | $y = au + b$ | Motor CC (baixa velocidade) |
| **Não-linear** | Complexa | Pêndulo invertido, atuador saturado |

**👉 Foco desta disciplina:** Sistemas **lineares, contínuos, SISO** (ou aproximação linear).

### Por Tempo

| Classe | Característica | Exemplo |
|--------|---|---------|
| **Invariante (LTI)** | Parâmetros constantes | Motor com bateria constante |
| **Variante (LTV)** | Parâmetros mudam | Foguete (massa varia) |

**Nota:** Maioria dos problemas = **LTI**. Simplificação poderosa!
```

---

## 🎮 Slides 13–15: Tipos de Controladores

### Slide 13: Controlador Proporcional (P)

```markdown
## Controlador Proporcional (P)

### Lei de Controle
$$u(t) = K_p \cdot e(t)$$

**Interpretação:** Maior erro → maior ação (proporcional)

### Efeito Visual

```
y(t)
  |     r = setpoint
  |     ___________
  |    /
  |___/_______ (com P)
  |_____|______ t
  0    1    2
  
- Rápido ✅
- Simples ✅
- Deixa erro residual (e_ss ≠ 0) ❌
```

### Sintonização
- **K_p muito pequeno:** Lento, pouco efeito
- **K_p grande:** Rápido, mas oscila (risco de instabilidade)

### Exemplos
- Válvula de água (posição proporcional ao erro de temperatura)
- Motor com controle de ganho
```

### Slide 14: Controlador Integral (I) e Derivativo (D)

```markdown
## Controlador Integral (I)

### Lei de Controle
$$u(t) = K_i \int_0^t e(\tau) d\tau$$

**Interpretação:** Acumula erro ao longo do tempo. Se erro persiste → ação cresce.

### Efeito
- ✅ Elimina erro de estado estacionário ($e_{ss} = 0$)
- ❌ Lento, pode oscilcar

---

## Controlador Derivativo (D)

### Lei de Controle
$$u(t) = K_d \cdot \frac{de(t)}{dt}$$

**Interpretação:** Reage à **velocidade** de mudança do erro. Previne overshoot.

### Efeito
- ✅ Amortece oscilações
- ✅ Antecipa (reage à taxa, não ao valor)
- ❌ Amplifica ruído, sensível

---

## Comparação

| Controlador | Velocidade | Erro Residual | Overshoot | Robustez |
|-------------|-----------|---|---|---|
| **P** | Médio | ❌ Alto | Médio | Boa |
| **I** | Lento | ✅ Zero | Alto | Ruim |
| **D** | Rápido | ❌ Alto | ✅ Baixo | Ruim (ruído) |
| **PI** | Bom | ✅ Zero | Médio | Boa |
| **PD** | Rápido | ❌ Alto | ✅ Baixo | Boa |
| **PID** | Bom | ✅ Zero | ✅ Baixo | Boa ✅ |
```

### Slide 15: PID — O "Ouro Padrão"

```markdown
## Controlador PID (Proporcional-Integral-Derivativo)

### Lei de Controle
$$u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de(t)}{dt}$$

### Na Prática
$$u(t) = K_p e + K_i \sum e + K_d \Delta e$$

(Versão digital: soma em vez de integral)

### Por Quê PID Domina Indústria?

| Aspecto | PID |
|--------|-----|
| Velocidade | ✅ Bom (P) |
| Erro Residual | ✅ Zero (I) |
| Suavidade | ✅ Amortecido (D) |
| Complexidade | ✅ Simples (3 parâmetros) |
| Custo | ✅ Barato |
| Robustez | ✅ Boa |

### Desafio
Sintonizar $K_p$, $K_i$, $K_d$ corretamente.

**Solução:** Métodos como Ziegler-Nichols (Aula 09)

### Exemplos Industriais
- 🌡️ Controle de temperatura em fornos
- 🚗 Motor de carro (corpo de borboleta)
- 🛩️ Autopilot de avião
- 🤖 Braço robótico
- 💧 Válvulas de processo
```

---

## 📊 Slide 16: Exemplo Completo — Chuveiro Automático

```markdown
## Estudo de Caso: Chuveiro Automático

### Malha Aberta (Manual)

```tikz
\usetikzlibrary{shapes, arrows, positioning}

\begin{tikzpicture}[node distance=1.5cm]
  \node (person) {👤};
  \node[draw, rectangle, right of=person] (adjust) {Ajusta\\alavanca};
  \node[draw, rectangle, right of=adjust] (mixer) {Misturador\\H+F};
  \node[right of=mixer] (shower) {🚿};
  \node[draw, rectangle, below of=shower, yshift=1cm] (feeling) {Sente com\\o corpo};
  
  \draw[->] (person) -- (adjust);
  \draw[->] (adjust) -- (mixer);
  \draw[->] (mixer) -- (shower);
  \draw[->] (shower) |- (feeling);
  \draw[->] (feeling.west) -| (adjust.north);
  
  \node[below, red] at (current bounding box.south) {❌ Lento, reativo, requer presença};
\end{tikzpicture}
```

### Malha Fechada (Automática)

```tikz
\usetikzlibrary{shapes, arrows, positioning}

\begin{tikzpicture}[node distance=1.5cm]
  \node (setpoint) {38°C};
  \node[draw, circle, right of=setpoint] (cmp) {$-$};
  \node[draw, rectangle, right of=cmp] (ctrl) {PID};
  \node[draw, rectangle, right of=ctrl] (valve) {Válvula};
  \node[draw, rectangle, right of=valve] (mixer) {Misturador};
  \node[right of=mixer] (shower) {🚿};
  
  \node[draw, rectangle, below of=mixer, yshift=.5cm] (sensor) {Sensor Temp};
  
  \draw[->] (setpoint) -- (cmp);
  \draw[->] (cmp) -- node[above] {$e$} (ctrl);
  \draw[->] (ctrl) -- (valve);
  \draw[->] (valve) -- (mixer);
  \draw[->] (mixer) -- (shower);
  \draw[->] (shower.south) |- (sensor.east);
  \draw[->] (sensor.west) -| (cmp.south);
  
  \node[below, green] at (current bounding box.south) {✅ Automático, preciso, sem presença};
\end{tikzpicture}
```

### Resposta Temporal Comparada

```python
# Gerar plot Python (salvar em Notas/imgs/plots/)
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 20, 1000)

# Malha aberta: sem feedback, fica quente de + depois esfria
y_open = 38 + 5 * np.exp(-0.3*t) * np.sin(0.5*t)

# Malha fechada: converge suave a 38
y_closed = 38 * (1 - np.exp(-0.5*t)) * np.cos(0.1*t) + 38

plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(t, y_open, 'r-', linewidth=2, label='Malha Aberta')
plt.axhline(y=38, color='k', linestyle='--', alpha=0.5, label='Setpoint')
plt.xlabel('Tempo (s)')
plt.ylabel('Temperatura (°C)')
plt.title('Sem Controle Automático')
plt.grid(alpha=0.3)
plt.legend()
plt.ylim([32, 45])

plt.subplot(1, 2, 2)
plt.plot(t, y_closed, 'b-', linewidth=2, label='Malha Fechada (PID)')
plt.axhline(y=38, color='k', linestyle='--', alpha=0.5, label='Setpoint')
plt.xlabel('Tempo (s)')
plt.ylabel('Temperatura (°C)')
plt.title('Com Controle Automático')
plt.grid(alpha=0.3)
plt.legend()
plt.ylim([32, 45])

plt.tight_layout()
plt.savefig('Notas/imgs/plots/exemplo_chuveiro.png', dpi=150, bbox_inches='tight')
plt.show()
```

![Comparação: Malha Aberta vs. Fechada no Chuveiro](Notas/imgs/plots/exemplo_chuveiro.png)

### Lições
1. **Sem feedback:** Ação boba (não se adapta)
2. **Com feedback:** Automático, eficiente
3. **Sensor essencial:** Sem medir T, não há controle
4. **Sintonia essencial:** PID ruim → oscila ou lento demais
```

---

## 📝 Slide 17: Exercícios em Aula (Interativos)

```markdown
## Exercícios Rápidos

### Exercício 1: Identificar Componentes

**Dado:** Sistema de levitação magnética (bola flutua via eletromagnetismo)

**Perguntas:**
1. Qual é a **planta**?
2. Qual seria um bom **sensor**?
3. Que tipo de **perturbação** poderia ocorrer?
4. Este sistema precisa de **malha fechada**? Por quê?

**Resposta esperada:**
1. Planta = eletromagnetismo + dinâmica da bola
2. Sensor = distância (laser ou ultrassom)
3. Perturbação = corrente de ar, mudança de peso da bola
4. SIM! Sem feedback, bola cai (sistema instável)

---

### Exercício 2: Malha Aberta vs. Fechada

**Cenário:** Controlar altura de um avião.

Classifique cada ação como malha aberta ou fechada:

| Ação | Tipo |
|------|------|
| Piloto puxa manche para levantar | Aberta |
| Autopilot compara altitude real com setpoint | Fechada |
| Programar profundor em ângulo fixo | Aberta |
| Sistema detecta perda de altitude e recompensa | Fechada |

---

### Exercício 3: Predição Qualitativa

**Dado:** Sistema com ganho P muito grande ($K_p = 100$)

**Predições:**
1. O sistema fica rápido ou lento? **Rápido** ✅
2. Pode oscilar? **Sim, risco** ✅
3. Erro residual aumenta ou diminui? **Diminui** ✅
```

---

## 🎓 Slide 18: Roteiro das Próximas Aulas

```markdown
## Mapa do Semestre

```
Aula 01: Introdução ← VOCÊ ESTÁ AQUI
         ↓
Aula 02: Função de Transferência (Laplace)
Aula 03: Diagrama de Blocos & Álgebra
         ↓
Aula 04–05: Análise 1ª e 2ª Ordem
         ↓
Aula 06: Erro de Regime Permanente
         ↓
Aula 07: LUGAR GEOMÉTRICO DAS RAÍZES (Projeto!)
         ↓
Aula 08: Resposta em Frequência (Bode)
         ↓
Aula 09: Sintonia de PID (Ziegler-Nichols)
         ↓
PROVA + PROJETO FINAL
```

### Conexão com Hoje

| Aula | Conecta com Aula01 |
|------|---|
| Aula 02 | Função de transferência = "linguagem" para descrever planta $G(s)$ |
| Aula 07 | LGR = método gráfico para escolher $K_p$ (malha fechada) |
| Aula 09 | PID = sintonizar $K_p, K_i, K_d$ (Ziegler-Nichols) |

**Mensagem:** Hoje aprendem **"o quê"**. Próximas aulas = **"como fazer"** e **"por quê funciona"**.
```

---

## 📚 Slide 19: Referências Bibliográficas

```markdown
## Leitura Recomendada

### Livros Principais

- **[N] Nise, N. S.** (2019). *Control Systems Engineering* (8ª ed.). Wiley.
  - 📖 Cap. 1: Introduction, Definitions, and Terminology
  - ✅ **MELHOR PARA AULA01** — Intuitivo, diagramas claros

- **[O] Ogata, K.** (2009). *Modern Control Engineering* (5ª ed.). Prentice Hall.
  - 📖 Cap. 1: Introduction to Control Systems
  - ✅ Rigor matemático, definições precisas

- **[D] Dorf, R. C. & Bishop, R. H.** (2017). *Modern Control Systems* (13ª ed.). Pearson.
  - 📖 Cap. 1: Introduction to Control Systems
  - ✅ Exemplos industriais sofisticados

### Vídeos Complementares (YouTube)
- [Brian Douglas — Control Systems Playlist](https://www.youtube.com/playlist?list=PLUMWjy5jgHK1NC52DQwD2Yq7gU8-r-5UE)
- [MATLAB Official — Control Systems Tutorials](https://www.youtube.com/user/MathWorks)

### Repositório do Curso
- 📌 [github.com/raphateixeira/ControleClassico](https://github.com/raphateixeira/ControleClassico)
- 📌 Todos os arquivos `.qmd`, TikZ, scripts Python disponíveis
```

---

## 📋 Slide 20: Resumo e Checklist

```markdown
## Resumo da Aula 01

### O que aprendemos hoje? ✅

| Tópico | Aprendizado |
|--------|-------------|
| **O que é controle** | Sistema que ajusta ações para atingir objetivo |
| **Malha aberta vs. fechada** | Feedback = capacidade de corrigir erros |
| **Componentes** | Referência, Controlador, Planta, Sensor, Comparador |
| **Terminologia** | Error, Setpoint, Steady-state, Stability |
| **Objetivos** | Tracking, Rejeição de distúrbios, Estabilidade, Robustez |
| **Tipos de Controladores** | P, I, D, PID |
| **Classificações** | SISO vs. MIMO; Linear vs. Não-linear; LTI vs. LTV |

### Para Casa — Leitura

- ✅ Leia **Nise Cap. 1** (p. 1–50)
- ✅ Revise **definições** no glossário
- ✅ **Desenhe** 3 sistemas que você conhece (malha aberta ou fechada)

### Para Casa — Exercícios

1. Desenhe diagrama de blocos: Sistema de estacionamento automático (sensor de distância, motor de direção)
2. Classifique: Motor de ventilador (malha aberta ou fechada? Por quê?)
3. Predição: Se adicionar distúrbio (rajada de vento) em termostato, o que acontece? (explique com e sem feedback)

### Próxima Aula (Aula 02)
**Transformada de Laplace & Função de Transferência**

Breve revisão de Laplace. Como representar dinamicamente uma planta. Exemplo: motor CC.

---

## Mensagem Final

> "Controle não é mágica. É aplicar feedback inteligente."
>
> — This class

**Vocês conseguem!** 💪
```

---

## 🗂️ Estrutura de Arquivos Recomendada

```
Notas/
├── Aula01Introducao.qmd          (arquivo principal, conforme acima)
│
└── imgs/
    ├── tikz/
    │   ├── malha_aberta.tikz              (novo)
    │   ├── malha_fechada.tikz             (novo)
    │   ├── diagrama_blocos_generico.tikz  (novo)
    │   ├── chuveiro_aberta.tikz           (novo)
    │   ├── chuveiro_fechada.tikz          (novo)
    │   ├── pid_componentes.tikz           (novo)
    │   └── [arquivos existentes]
    │
    └── plots/
        ├── exemplo_chuveiro.png           (novo, gerado por Python)
        ├── resposta_p_pi_pd_pid.png       (novo)
        └── [imagens existentes]

scripts/
├── gerar_figura_aula01.py        (novo: gera exemplo_chuveiro.png)
└── [scripts existentes]
```

---

## 🚀 Próximos Passos

1. **Revisar Aula01 atual** → o que já existe?
2. **Criar TikZ diagrams** (malha aberta, fechada, exemplo chuveiro)
3. **Gerar plots Python** (resposta temporal, comparação P vs. PID)
4. **Estruturar slides Reveal.js** com callout boxes (Definição Formal / Interpretação Prática)
5. **Adicionar exercícios** ao final (com soluções em PDF separado)
6. **Testar renderização** `quarto preview`
7. **Publicar em GitHub Pages** (CI/CD automático)

---

**Conclusão:** Esta Aula01 proposta integra o melhor de **Nise** (intuição), **Ogata** (rigor), e **Dorf** (aplicação), criando uma introdução completa e memorável para alunos de primeira vez.