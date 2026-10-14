# Plano de tarefas — spec 001 (Contas e sessões)

> Derivado de [`001-contas-e-sessoes.md`](001-contas-e-sessoes.md) (commit `345a7ed`). Cada tarefa vira **um commit** cuja mensagem cita a spec e o critério atendido.

## Revisão do plano
- **Proposto por:** Claude Code (sessão conduzida por Pedro Vitor), a partir só da spec — ainda não existia código.
- **Revisado por:** João Victor Fiuza e Isabella Nascimento, em 03/10/2026, **antes do T2**.
- **O que a revisão mudou:**
  1. A primeira proposta tinha uma tarefa só para "entrada e sessão" com 9 critérios. Isabella pediu para separar as proteções da senha mestra (CA-13, CA-15, CA-16) num commit próprio, para o teste de cada uma **falhar antes** do código que a resolve — virou o T5.
  2. João pediu que o T2 já tivesse um teste rodando (`/health` e cabeçalhos), para o `npm test` do AGENTS.md ser verificável no clone limpo desde o primeiro commit de código.

## Decisões de arquitetura (do plano, não da spec)
| Decisão | Motivo |
|---|---|
| Páginas geradas no servidor com EJS; JS do navegador só para mostrar/copiar senha | A spec pede um sistema web sem framework de front; cada critério vira um teste HTTP que roda sem navegador |
| `src/routes/` com um arquivo por área (`contas.js`, `cofre.js`) e `createApp({ vaultService, sessions })` | Os testes montam o app com o cofre em memória e um relógio controlado (CA-07) |
| Teste de aceite em `test/spec-001-contas-e-sessoes.test.js`, ajudante HTTP em `test/helpers/http.js` | Um teste por CA, com nome começando por `CA-xx` |
| Dependências com versão exata e `package-lock.json` commitado | Clone limpo instala exatamente o que foi testado |

## Tarefas
| T | Tarefa | Verificação | Critério |
|---|---|---|---|
| T1 | Este plano | revisão da equipe (acima) | — |
| T2 | **Esqueleto:** `package.json` com versões exatas, `.nvmrc` 20.18.0, ESLint, Express + EJS, `/health`, cabeçalhos de segurança, página de erro e 404, CSS base; AGENTS.md com a estrutura de pastas; testar o AGENTS.md num clone limpo | clone em pasta temporária: `npm install`, `cp .env.example .env`, `npm start` → `/health` 200, `npm test`, `npm run lint` | item 2 da atividade; Restrições (cabeçalhos) |
| T3 | **Cadastro:** derivação de chave (scrypt + NFKC), arquivo do cofre, `GET/POST /cadastro`, `GET /entrar` com os avisos | `npm test` | CA-01, CA-02, CA-03, CA-04 |
| T4 | **Entrada, sessão e cofre protegido:** sessões em memória com relógio injetável, `POST /entrar`, cookie `sessao`, `GET /cofre` | `npm test` | CA-05, CA-06, CA-07, CA-10, CA-11, CA-12 |
| T5 | **Proteções da senha mestra:** tempo igual para e-mail sem conta, atributos do cookie, formulário que nunca devolve a senha | `npm test` (os três testes falham antes) | CA-13, CA-15, CA-16 |
| T6 | **Sair, sessões simultâneas e quem já tem sessão** | `npm test` | CA-08, CA-09, CA-17 |
| T7 | **Corpo acima de 10 KB** → 413 com página de erro | `npm test` | CA-14 |
| T8 | Spec: seção 9 "Mudanças desde a implementação" | leitura da spec | todos |
| T9 | Diário do agente `docs/harness/diario-001.md` | até uma página | — |

Cada tarefa termina com `npm test` e `npm run lint` passando.

## Tarefas que entraram durante a execução
> Preenchido durante a implementação. Toda tarefa nova muda a spec **antes** do código.

| T | Tarefa | Por que entrou | Critério |
|---|---|---|---|
| — | — | — | — |
