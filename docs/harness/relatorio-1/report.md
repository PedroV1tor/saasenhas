# Better Harness Task-Loop Report

## At a Glance

- Loop Effectiveness: 38/100 (changes only after comparable later task outcomes)
- Asset Health / Repair Progress: 0/100 (0 verified, 0 partial, 6 pending)
- Demonstrated autonomy radius: not observed (not observed; not observed confidence)
- Strongest loop: Task Understanding — spec numerada com critérios Dado/Quando/Então e decisões registradas.
- Largest observed leak: Controlled Execution — regras de segurança existem só como texto.
- Top expected gain: proteger o `.env` antes que ele exista.

## What You Can Rely On Today

- A spec 001 define rotas, mensagens exatas e casos de borda que um agente consegue transformar em testes.

## What You Gain Next

- Um `.gitignore` e um `.env.example` antes do primeiro `cp .env.example .env`.
- Permissões que garantam a regra "nunca leia `.env` nem `data/`".

### Why these moves matter

### O comando "Configurar" do AGENTS.md cria um .env que nada impede de ser commitado
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fato: o AGENTS.md manda rodar `cp .env.example .env`, mas `.env.example` não existe no repositório e não há `.gitignore`. Fato: a regra de segurança do AGENTS.md diz "nunca commite `.env` ou `data/`". Inferência: quem seguir o AGENTS.md primeiro recebe erro do `cp`; se criar o `.env` à mão, um `git add -A` o leva junto, e o mesmo vale para o cofre em `data/` quando ele existir. Incerteza: nenhum segredo foi observado; o projeto ainda não tem código.
- Expected Output:
  1. Um `.gitignore` que cobre `.env`, `data/` e `node_modules/`, e um `.env.example` sem segredos com as variáveis citadas na spec 001 (`PORT`, `SESSION_TTL_MINUTES`, `DATA_FILE`).

### Nada impede um agente de ler o .env ou o cofre em data/
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fato: o AGENTS.md chama de inegociável a regra de não ler `.env` nem `data/`. Fato: não existe `.claude/settings.json`; nenhuma regra `deny` está configurada. Inferência: a proibição depende só de o modelo obedecer ao texto. Incerteza: configurações no nível do usuário ficaram fora do escopo.
- Expected Output:
  1. `.claude/settings.json` commitado com `deny` de leitura para `.env` e `data/`, confirmado por uma tentativa negada numa sessão nova.

### Os comandos do AGENTS.md ainda não existem
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fato: o AGENTS.md documenta `npm install`, `npm start`, `npm test` e `npm run lint`, mas não há `package.json`. Inferência: um agente que siga o princípio 4 ("só diga pronto depois de `npm test` e `npm run lint`") não consegue cumprir a regra. Incerteza: o projeto está na fase de spec; o esqueleto pode ser trabalho planejado.
- Expected Output:
  1. Esqueleto com `package.json`, dependências fixadas e os quatro comandos funcionando num clone limpo.

### O Claude Code não carrega o AGENTS.md sozinho
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fato: não há `CLAUDE.md`. O Claude Code lê `CLAUDE.md`, não `AGENTS.md`. Nesta sessão o AGENTS.md só entrou porque foi aberto pela revisão. Inferência: numa sessão nova, as regras de segurança e os princípios podem não estar no contexto.
- Expected Output:
  1. Um `CLAUDE.md` que importa o `AGENTS.md` (`@AGENTS.md`).

### "Teste e lint antes de pronto" depende só do relato do agente
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fato: não há hook, CI nem script de verificação. Inferência: a única prova de validação será a mensagem do agente.
- Expected Output:
  1. Um hook do Claude Code ou um workflow que rode lint e testes automaticamente.

### Ainda não há sessões de código para aprender com elas
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fato: a janela tem só sessões de escrita de spec e esta revisão, com 0 edições de código e 0 verificações.
- Expected Output:
  1. Uma janela posterior com episódios de código comparáveis.

## Five Lifecycle Dimensions

| Dimension | What the evidence proves | Evidence boundary | Summary | Boundary / blocker |
| --- | --- | --- | --- | --- |
| Task Understanding | Not observed yet | not observed in this boundary | Spec 001 com sete seções, 17 critérios Dado/Quando/Então, 19 decisões e revisão cruzada registrada. O AGENTS.md aponta para `docs/specs/`. Falta um `CLAUDE.md` para o Claude Code carregar as regras. | not observed |
| Controlled Execution | Not observed yet | not observed in this boundary | Regras de segurança só em texto; sem `.gitignore`, sem `.env.example`, sem permissões. | not observed |
| Change Validation | Not observed yet | not observed in this boundary | Não há código nem testes; os comandos documentados não existem. | not observed |
| Reliable Delivery | Not observed yet | not observed in this boundary | Sem remote configurado, sem CI, sem hook. | not observed |
| Learning Capture | Not observed yet | not observed in this boundary | Sem sessões de código; `docs/harness/` ainda não existe. | not observed |

## Evidence and Boundaries

- Episode coverage: 0 episodes, 0 edited, 0 closed, 0 repaired-and-passed
- Model: agent-work-loop-v4
- Session selection: all-eligible; 3 sessions analyzed of 3 eligible sessions; High confidence
- Delivery grades observed: not observed
- Source gaps: not observed
- Learning comparison: Needs a comparison; 0 declared intervention(s)
