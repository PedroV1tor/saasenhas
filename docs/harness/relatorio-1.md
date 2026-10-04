# 1º relatório do Better Harness (antes da configuração)

- **Data:** 04/10/2026
- **Ferramenta:** plugin `better-harness@better-harness` 0.7.0-alpha2 (QoderAI), no Claude Code
- **Commit medido:** tag `aula08` (`57e313f`) — projeto + `AGENTS.md`, sem CLAUDE.md, permissões, skill nem hook
- **Relatório original, sem edição:** [`relatorio-1/report.html`](relatorio-1/report.html) · [`relatorio-1/report.md`](relatorio-1/report.md) · [`relatorio-1/findings.json`](relatorio-1/findings.json)

## Números
| Indicador | Valor |
|---|---|
| Loop Effectiveness | 51/100 |
| Asset Health / Repair Progress | 0/100 (0 verificados, 0 parciais, 6 pendentes) |
| Raio de autonomia demonstrado | não observado |
| Episódios de código na janela | 0 (1 sessão elegível: a própria revisão) |

## Resumo por dimensão do Agent Work Loop
| Dimensão | Resultado | O que o relatório viu |
|---|---|---|
| Task Understanding | não observado | AGENTS.md carregado e specs com critérios de aceite; spec 002 não definia se a senha é aparada; links para arquivos de agente inexistentes |
| Controlled Execution | não observado | comandos documentados e passando; regra "não leia .env/data/" sem nenhuma permissão que a garanta |
| Change Validation | não observado | 28 testes + ESLint em ~1,5 s; rota de reutilização sem teste de API que pegue vazamento de senha |
| Reliable Delivery | não observado | remote no GitHub sem CI nem hook; "teste + lint antes de pronto" depende do relato do agente |
| Learning Capture | não observado | sem sessões de código para comparar; relatório e reparo ainda eram modelos vazios |

## Achados (6)
| # | Achado | Prioridade | Tratado em |
|---|---|---|---|
| 1 | Nada impede um agente de ler o `.env` ou o cofre em `data/` | Média | Aula 09 — `deny` em `.claude/settings.json` |
| 2 | **Senhas salvas perdem espaços do início e do fim sem aviso** | Média | **Reparo da Aula 08** — [`reparo-1.md`](reparo-1.md) |
| 3 | Vazamento de senha pela rota de reutilização passaria nos testes | Baixa | pendente |
| 4 | Mudanças podem chegar ao GitHub sem testes nem lint | Baixa | parcial — hook PostToolUse (Aula 09); CI pendente |
| 5 | A documentação aponta para arquivos de agente que não existem | Baixa | Aula 09 — os arquivos passaram a existir |
| 6 | Ainda não há sessões de código para aprender com elas | Baixa | sessões das provas em `evidencias.md` |
