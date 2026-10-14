# 2º relatório do Better Harness (depois da configuração) e comparação

- **Data:** 08/10/2026 · rodado por Rogger Martins
- **Ferramenta:** plugin `better-harness@better-harness` 0.7.0-alpha2 (QoderAI), no Claude Code
- **Estado medido:** `main` no commit `815a968` — CLAUDE.md, permissões, skill, hook, reparo `b496739`, feature 001 completa e o rascunho da spec 002 (prova 4.2)
- **Relatório original:** [`relatorio-2/report.md`](relatorio-2/report.md) · [`relatorio-2/findings.json`](relatorio-2/findings.json)

## Números
| Indicador | 1º relatório (tag `aula08`) | 2º relatório |
|---|---|---|
| Loop Effectiveness | 38/100 | **61/100** |
| Asset Health / Repair Progress | 0/100 (6 pendentes) | **50/100** (3 verificados, 1 parcial, 2 pendentes) |
| Raio de autonomia demonstrado | não observado | não observado |
| Sessões analisadas | 3 (nenhuma de código) | 14 (9 episódios de código) |
| Achados | 6 (3 Média, 3 Baixa) | 6 (1 Alta, 3 Média, 2 Baixa) |

## Comparação por dimensão do Agent Work Loop
| Dimensão | 1º relatório | 2º relatório | Mudou? | O que mexemos |
|---|---|---|---|---|
| Task Understanding | não observado; faltava `CLAUDE.md` | **demonstrado**: plano revisado, duas mudanças escritas na spec antes do código, skill criando a spec 002 e parando | **Sim** | CLAUDE.md, skill, spec 001 com decisões |
| Controlled Execution | não observado; sem `.gitignore`, `.env.example` nem permissões | **parcial**: `Read(.env)` negado numa sessão nova; escrita em `data/` e variantes de `.env` abertas (**Alta**) | **Sim, no conteúdo** — de "não existe" para "existe, mas é estreito" | reparo `b496739`, `.claude/settings.json` |
| Change Validation | não observado; sem código | **demonstrado**: um teste por CA, vistos falhando antes do código | **Sim** | plano da 001 com teste primeiro; hook de lint |
| Reliable Delivery | sem CI nem hook | sem CI; nenhum teste antes do commit | **Não** | hook só na edição; `ask` em commit/push |
| Learning Capture | sem sessões | **parcial**: o plano registra o que entrou durante a execução; uma regra da equipe ficou só na memória local | Parcial | diário, seção "tarefas que entraram" no plano |

## O que aconteceu com os 6 achados do 1º relatório
| Achado do 1º relatório | No 2º |
|---|---|
| `.env` sem `.gitignore` (**reparo da Aula 08**) | **Sumiu** — verificado (`b496739`) |
| `.env`/`data/` sem permissão | Reaparece **reduzido**: a leitura é negada, a escrita em `data/` não |
| Comandos do AGENTS.md não existem | **Sumiu** — verificado (esqueleto do T2 e clone limpo) |
| Sem `CLAUDE.md` | **Sumiu** — verificado |
| "Teste e lint antes de pronto" só no relato | Reaparece **mais preciso**: o hook roda lint, mas nada roda testes antes do commit |
| Sem sessões de código | Não reaparece como achado; virou a base das dimensões "demonstradas" |

A leitura honesta desta comparação está em [`evidencias.md`](evidencias.md#5-leitura-honesta-da-segunda-medição).
