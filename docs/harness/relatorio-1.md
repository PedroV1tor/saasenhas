# 1º relatório do Better Harness (antes da configuração)

- **Data:** 30/09/2026 · rodado por Rogger Martins
- **Ferramenta:** plugin `better-harness@better-harness` 0.7.0-alpha2 (QoderAI), no Claude Code
- **Commit medido:** tag `aula08` — spec 001 revisada + `AGENTS.md`; sem código, sem CLAUDE.md, permissões, skill nem hook
- **Relatório original:** [`relatorio-1/report.md`](relatorio-1/report.md) · [`relatorio-1/findings.json`](relatorio-1/findings.json)

## Números
| Indicador | Valor |
|---|---|
| Loop Effectiveness | 38/100 |
| Asset Health / Repair Progress | 0/100 (0 verificados, 0 parciais, 6 pendentes) |
| Raio de autonomia demonstrado | não observado |
| Episódios de código na janela | 0 (3 sessões elegíveis: escrita da spec, revisão cruzada e a própria revisão) |

## Resumo por dimensão do Agent Work Loop
| Dimensão | Resultado | O que o relatório viu |
|---|---|---|
| Task Understanding | não observado | spec 001 completa e revisada; falta `CLAUDE.md` para o Claude Code carregar o AGENTS.md |
| Controlled Execution | não observado | regras de segurança só em texto: sem `.gitignore`, sem `.env.example`, sem permissões |
| Change Validation | não observado | sem código; os comandos documentados não existem |
| Reliable Delivery | não observado | sem CI nem hook |
| Learning Capture | não observado | sem sessões de código |

## Achados (6)
| # | Achado | Prioridade | Tratado em |
|---|---|---|---|
| 1 | **O comando "Configurar" do AGENTS.md cria um `.env` que nada impede de ser commitado** | Média | **Reparo da Aula 08** — [`reparo-1.md`](reparo-1.md) |
| 2 | Nada impede um agente de ler o `.env` ou o cofre em `data/` | Média | Aula 09 — `deny` em `.claude/settings.json` |
| 3 | Os comandos do AGENTS.md ainda não existem | Média | Atividade de 03/10 — tarefa T2 do [plano da 001](../specs/001-plano.md) |
| 4 | O Claude Code não carrega o AGENTS.md sozinho | Baixa | Aula 09 — `CLAUDE.md` com `@AGENTS.md` |
| 5 | "Teste e lint antes de pronto" depende só do relato do agente | Baixa | parcial — hook PostToolUse (Aula 09) |
| 6 | Ainda não há sessões de código | Baixa | sessões da feature 001 e das provas |
