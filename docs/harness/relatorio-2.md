# 2º relatório do Better Harness (depois da configuração) e comparação

- **Data:** 04/10/2026
- **Ferramenta:** plugin `better-harness@better-harness` 0.7.0-alpha2 (QoderAI), no Claude Code
- **Estado medido:** `main` com CLAUDE.md, permissões, skill, hook, reparo `4666270` e a feature de favoritas. Três commits (`9cddcca`, `d1c5bf2`, `42f597d`) entraram **durante** a análise, e o relatório reflete o estado depois deles.
- **Relatório original, sem edição:** [`relatorio-2/report.html`](relatorio-2/report.html) · [`relatorio-2/report.md`](relatorio-2/report.md) · [`relatorio-2/findings.json`](relatorio-2/findings.json)

## Números
| Indicador | 1º relatório | 2º relatório |
|---|---|---|
| Loop Effectiveness | 51/100 | 51/100 |
| Asset Health / Repair Progress | 0/100 (6 pendentes) | 0/100 (6 pendentes) |
| Raio de autonomia demonstrado | não observado | não observado |
| Sessões analisadas | 1 (a própria revisão) | 5, sendo 3 da própria revisão |
| Achados | 6 (2 Média, 4 Baixa) | 6 (1 Alta, 3 Média, 2 Baixa) |

## Comparação por dimensão do Agent Work Loop
| Dimensão | 1º relatório | 2º relatório | Mudou? | O que mexemos |
|---|---|---|---|---|
| Task Understanding | spec 002 não definia se a senha é aparada; links para arquivos de agente inexistentes | "Rules, the spec-first Skill and numbered specs give a clear acceptance route"; a spec 002 ficou desatualizada em relação à 004 | **Sim, no conteúdo.** Os dois achados antigos sumiram e apareceu um novo | AGENTS.md, CLAUDE.md, skill, reparo da spec 002 |
| Controlled Execution | "a regra de não ler .env nem data/ não tem nenhuma permissão" | o deny existe, mas não cobre Edit/Write em `data/` nem `.env.production`/`.env.test` (prioridade **Alta**) | **Sim, no conteúdo.** Passou de "não existe" para "existe, mas é estreito demais" | `.claude/settings.json` (allow/ask/deny) |
| Change Validation | rota de reutilização sem teste de vazamento | `no-console` é só `warn`, então um log da senha mestra passa no hook, no lint e nos testes; o 404 alterado não tem teste | Parcial. O achado mudou, a nota não | hook PostToolUse → ESLint |
| Reliable Delivery | sem CI nem hook | sem CI; o hook só cobre Edit/Write; commit e push pedem confirmação, mas nada roda os testes antes | **Não** na essência | hook (só na edição), `ask` em commit e push |
| Learning Capture | sem sessões de código | 5 sessões, mas "No Episode shows the Skill being invoked or the Hook firing" | **Não** | skill + hook + `evidencias.md` |

Status nas 5 dimensões: **"Not observed yet" nos dois relatórios.**

## O que aconteceu com os 6 achados do 1º relatório
| Achado do 1º relatório | No 2º |
|---|---|
| `.env`/`data/` sem permissão | Reaparece reduzido: o deny existe, mas há lacunas (Edit em `data/`, variantes de `.env`) |
| Senha perde espaços (**reparo da Aula 08**) | **Sumiu**: corrigido no `4666270` |
| Vazamento pela rota de reutilização sem teste | Não reaparece, **mas não foi corrigido**: nenhum teste novo cobre essa rota. O 2º relatório só não o listou de novo |
| Sem CI nem hook | Reaparece: o hook existe, mas não há portão no commit nem CI |
| Links para arquivos inexistentes | **Sumiu**: os arquivos foram criados |
| Sem sessões para aprender | Reaparece: há sessões, mas a ferramenta não viu a skill nem o hook nelas |

A leitura honesta desta comparação está em [`evidencias.md`](evidencias.md#5-leitura-honesta-da-segunda-medição).
