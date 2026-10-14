# Evidências — o harness em uso

- **Equipe:** João Victor Fiuza, Rogger Martins, Isabella Nascimento, Pedro Vitor
- **Harness:** Claude Code (extensão do VS Code, modelo `claude-opus-5-5`)
- **Data das sessões:** 08/10/2026. Cada prova foi feita numa **sessão nova**, aberta na raiz do repositório, na `main` depois da feature 001 (commit `fcd8c84`).
- **No vídeo:** as três provas são refeitas ao vivo na parte 4 do roteiro.

---

## 4.1 Permissão — o agente pede para ler o `.env` e é recusado
**Conduzida por:** Isabella Nascimento
**Pedido:**
> Quero testar a regra de permissão do projeto. Use a ferramenta Read no arquivo .env para eu ver se ela bloqueia. Não leia outro arquivo no lugar.

**Resultado:** o agente chamou `Read` em `.env` e a ferramenta respondeu `Permission to read .env has been denied` — nenhum conteúdo foi lido. A regra que bloqueou foi `Read(./.env)` em [`.claude/settings.json`](../../.claude/settings.json). O agente respondeu que não tentaria outro caminho (como manda o `CLAUDE.md`) e ofereceu ler o `.env.example`.

**Contraprova:** na mesma sessão, `Read` em `.env.example` funcionou — a regra bloqueia o segredo, não o modelo de configuração.

---

## 4.2 Skill acionada sem ser citada
**Conduzida por:** João Victor Fiuza
**Pedido** (sem mencionar a skill):
> Agora quero guardar as senhas dos meus sites dentro do cofre e ver quais estou repetindo.

**O que aconteceu:**
1. A sessão mostrou `Skill(implementar-com-spec)` sendo carregada antes de qualquer leitura de código.
2. O agente procurou em `docs/specs/`, viu que não havia spec para entradas do cofre e **criou** `docs/specs/002-cofre-de-senhas.md` no formato da 001 (sete seções, CA em Dado/Quando/Então).
3. **Parou** (passo 2 da skill): *"A spec 002 é nova, então antes de escrever testes ou código preciso do seu ok. Resumo em 10 linhas: …"* e listou as 4 decisões que tomou sozinho (D-01 a D-04) para a equipe confirmar.

- **Acionou na 1ª tentativa?** Sim.
- **Vezes que a descrição da skill foi reescrita:** 0. A descrição já cita as palavras que o usuário usa ("cofre", "senhas reutilizadas", "página", "formulário"), e foi isso que fez a skill casar com um pedido que não fala em "spec".
- **Resultado no repositório:** rascunho commitado em `815a968`; aprovado e implementado depois (ver histórico da spec 002).

---

## 4.3 Hook — lint disparado por uma edição
**Conduzida por:** Rogger Martins
**Pedido:**
> Em src/config.js, coloque um comentário curto explicando cada variável de ambiente.

**Resultado:** logo depois do `Write`, a sessão mostrou
`PostToolUse:Write says: [hook lint] ESLint OK em src/config.js`
— a saída de [`scripts/hooks/lint-on-edit.mjs`](../../scripts/hooks/lint-on-edit.mjs). Commit `29eeceb`.

**Caminho de erro** (testado fora da sessão, mesmo script):
```
$ echo '{"tool_input":{"file_path":"src/_hook_demo.js"}}' | node scripts/hooks/lint-on-edit.mjs
[hook lint] ESLint encontrou problemas em src/_hook_demo.js. Corrija antes de continuar:
  1:20  error  Expected '===' and instead saw '=='  eqeqeq
exit=2
```
Com exit 2, o Claude Code devolve a mensagem ao agente, que corrige antes do próximo passo.

---

## 4.4 Contexto — `/context` numa sessão nova, antes de qualquer pedido
| Categoria | Tokens |
|---|---|
| System prompt | 3,4k |
| System tools | 17,6k |
| **Memory files** | **1,7k**: `AGENTS.md` 1,4k + `CLAUDE.md` 300 |
| Skills (só as descrições) | 5,3k |
| Total usado | 38,9k de 1M (4%) |

O AGENTS.md e o CLAUDE.md entram em toda sessão e custam 1,7k tokens, menos de 0,2% da janela. A skill entra só pela descrição; o corpo é carregado quando ela é acionada (prova 4.2).

---

## 5. Leitura honesta da segunda medição
Comparação completa em [`relatorio-2.md`](relatorio-2.md).

**Que dimensão mudou? Com qual evidência?** **Change Validation** e **Task Understanding** passaram de "não observado" para "demonstrado". O 2º relatório cita episódios reais da feature 001 em que o teste do CA falhou antes do código (CA-13: *"70.4 ms vs 4.9 ms"*; CA-15: cookie sem `HttpOnly`) e passou depois, e o commit de cada tarefa citando o critério. Isso só existiu porque a spec veio antes do plano, e o plano antes do código.

**Que dimensão não mudou, apesar de termos mexido nela? Por quê?** **Reliable Delivery.** Criamos o hook de lint e o `ask` no `git commit`, mas o relatório diz que *"nothing runs the test suite before a commit; the gate is a human reading the diff"*. Ele tem razão: o hook só roda ESLint no arquivo editado, e quem decide o commit é a pessoa que aprova o `ask`. Lint passando não é teste passando.

**O que foi marcado como não observado? É ausência de fato ou a ferramenta não tinha como ver?**
- **Raio de autonomia:** "não observado" de novo. Em parte a ferramenta não tinha como ver: as aprovações de `git commit` aparecem como pedidos de permissão, não como decisões, e o relatório diz *"approval prompts are not visible as outcomes"*.
- **A skill:** desta vez **foi** observada (o relatório cita `Skill(implementar-com-spec)` na sessão da prova 4.2). No relatório anterior do projeto antigo, não tinha sido.
- **Ausência de fato:** não há CI nem portão de testes no commit, e as regras de `deny` não cobrem escrita em `data/` — são faltas reais e viraram os reparos abaixo.

---

## 6. Checagem de segurança
- [x] Nenhum token, senha ou chave em `settings.json` ou em arquivo commitado. O `.env` foi criado a partir do `.env.example` (`PORT`, `DATA_FILE`, `SESSION_TTL_MINUTES`, sem segredos) e nunca foi commitado (`git log --all -- .env` vazio).
- [x] `.env` está no `.gitignore` (reparo `b496739`) **e** no `deny` de `.claude/settings.json` (prova 4.1).
- [x] Nenhum servidor MCP instalado, registrado no `AGENTS.md`. O Better Harness é um **plugin** do Claude Code, de fonte conhecida (github.com/QoderAI/better-harness), instalado no nível do usuário.

## Reparos apontados pelo 2º relatório
| # | Reparo | Prioridade | Status |
|---|---|---|---|
| 1 | `deny` de `Edit`/`Write` em `data/**` e nas variantes de `.env`; `.gitignore` com `.env.*` (exceto `.env.example`) | Alta | feito — ver [`diario-001.md`](diario-001.md) |
| 2 | `no-console` como `error`, para o hook e o lint pegarem um `console.log` de senha | Média | feito |
| 3 | Hook `PreToolUse` em `git commit` que roda `npm test` e `npm run lint` | Média | feito |
| 4 | Regra "commits sem coautoria do Claude" no `CLAUDE.md`, não só na memória local | Média | feito |
| 5 | AGENTS.md: `cp` não existe no `cmd` do Windows | Baixa | feito |
| 6 | Hook de lint bloqueia entre duas edições de uma mesma mudança | Baixa | aceito como está (ver diário) |
