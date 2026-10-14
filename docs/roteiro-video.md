# Roteiro do vídeo da N2 (10 a 15 min)

Antes de gravar: `npm install`, `cp .env.example .env`, apagar `data/` para começar com o cofre vazio, fechar qualquer aba com o `.env`. **Nada de segredo na tela.**

| # | Parte | Quem fala | O que abrir / fazer | Tempo |
|---|---|---|---|---|
| 1 | Problema e proposta de valor | Pedro Vitor | [`docs/problema.md`](problema.md): a dor, o público e a tabela da pesquisa (70% reutilizam senha; 14% usam gerenciador) | 1–2 min |
| 2 | A spec 001 | João Victor | [`001-contas-e-sessoes.md`](specs/001-contas-e-sessoes.md): seção 2 (o que **não** entra), RN-01..RN-14, um CA em Dado/Quando/Então (CA-07), tabela de Decisões. **Ambiguidade da revisão cruzada:** RN-12 "o formulário volta preenchido" — com a senha mestra também? ([`001-revisao.md`](specs/001-revisao.md), pergunta 3) → fechada em D-16 e testada no CA-16. Mostrar o `git log` da spec: v1 → revisão → v2 | 2–3 min |
| 3 | O harness | Isabella | [`AGENTS.md`](../AGENTS.md) (comandos, 4 princípios), [`CLAUDE.md`](../CLAUDE.md), [`.claude/settings.json`](../.claude/settings.json) (allow / ask / deny), a skill e os dois hooks. Para cada um, a coluna "Problema que resolve" de [`docs/harness/README.md`](harness/README.md) | 2–3 min |
| 4 | As provas (ao vivo) | Rogger | Numa sessão nova do Claude Code na raiz: **(a)** *"Use a ferramenta Read no arquivo .env para eu ver se ela bloqueia. Não leia outro arquivo no lugar."* → negado; **(b)** *"Quero que a página do cofre mostre quantas entradas eu tenho."* (sem citar a skill) → a linha `Skill(implementar-com-spec)` aparece e o agente começa pela spec 002, não pelo código (se perguntar "posso mudar a spec?", é o passo 2 da skill); **(c)** *"Em src/config.js, melhore o comentário da variável PORT."* → `[hook lint] ESLint OK` | 1–2 min |
| 5 | A medição | Rogger | [`relatorio-2.md`](harness/relatorio-2.md): tabela lado a lado (38 → 61; 0 → 50), o que mudou (Task Understanding, Change Validation), o que **não** mudou (Reliable Delivery) e por quê ([`evidencias.md`](harness/evidencias.md), seção 5) | 1–2 min |
| 6 | O esqueleto rodando | Pedro Vitor | Clone limpo numa pasta nova seguindo só o AGENTS.md → `npm start` → no navegador: criar conta, entrar, nova entrada, reutilizadas, ★ favorita, gerador, Sair e botão Voltar (não mostra o cofre). Depois `npm test` mostrando os nomes `CA-01`..`CA-18` e `# fail 0`. Mostrar o [`001-plano.md`](specs/001-plano.md) e `git log --oneline aula08..feature-001` (um commit por tarefa, citando CA) | 2–3 min |
| 7 | O que aprenderam | Isabella | [`diario-001.md`](harness/diario-001.md): o agente implementou `GET /sair` exatamente como a spec mandava; a revisão humana pegou (D-20). O que mudamos: hook de testes antes do commit, `deny` em `data/`, regra de commits no `CLAUDE.md` | 1 min |

## Comandos úteis na gravação
```bash
git log --oneline --reverse              # a história na ordem: spec → revisão → harness → plano → código
git log --oneline aula08..feature-001    # só a feature 001
git show aula08 --stat                   # o que existia no 1º relatório
npm test 2>&1 | grep -E "^ok|^not ok|^# (pass|fail)"
```
