# AGENTS.md — SaaSenhas

Sistema web de um micro-SaaS que organiza as senhas do usuário num cofre cifrado: páginas geradas no servidor (front) e regras do cofre (back) no mesmo projeto. Público: estudantes e jovens com muitas contas.

## Comandos (rode a partir da raiz)
| Ação | Comando |
|---|---|
| Instalar | `npm install` |
| Configurar | `cp .env.example .env` (PowerShell/Git Bash) · `copy .env.example .env` (cmd) |
| Rodar | `npm start` (ou `npm run dev` com reload) → http://localhost:3000 (saúde: `/health`) |
| Testar | `npm test` (node:test, poucos segundos) |
| Lint | `npm run lint` (ESLint 9) |

Requer Node 20.18+ (versão em `.nvmrc`; `--env-file` não existe antes da 20.6).

## Stack
Node.js 20.18 (ESM) · Express 5 · EJS (páginas no servidor) · CSS e JS puros em `public/` · `node:test` + `node:assert` · ESLint 9 · `node:crypto` (scrypt + AES-256-GCM). Sem banco: o cofre é um JSON em `DATA_FILE`.

## Estrutura
```
src/app.js            createApp: middlewares, cabeçalhos de segurança e página de erro
src/server.js         ponto de entrada (lê config e sobe o servidor)
src/routes/           páginas e formulários, um arquivo por área
src/                  regras (crypto/, vault/, auth/, password/) sem saber de HTTP
views/                páginas EJS (partials/ = topo e rodapé)
public/               CSS e JS do navegador
test/                 spec-NNN-*.test.js (um teste por CA) + um *.test.js por módulo
test-support/         ajudante HTTP dos testes
scripts/hooks/        hooks do Claude Code (lint na edição, testes antes do commit)
docs/specs/           specs numeradas — a fonte da verdade do comportamento
docs/harness/         relatórios, evidências e diário do harness
```

## Specs
Ficam em `docs/specs/NNN-nome.md` (objetivo, escopo, atores, dados, regras, critérios de aceite, restrições e decisões). Mudança de comportamento começa pela spec.

## Como você deve trabalhar
1. **Pense antes de codar.** Leia a spec e o código envolvido. Diga suas suposições; se houver duas leituras possíveis do pedido, pergunte em vez de escolher em silêncio.
2. **Simplicidade primeiro.** Escreva o mínimo que resolve o pedido. Nada de dependência, abstração ou opção "para o futuro" que ninguém pediu.
3. **Mudanças cirúrgicas.** Toque só no que o pedido exige. Não reformate, renomeie nem "melhore" código vizinho; siga o estilo que já existe.
4. **Trabalhe guiado por objetivo verificável.** Transforme o pedido num teste que falha, faça passar e só diga "pronto" depois de `npm test` e `npm run lint` passarem — mostrando a saída.

## Regras de segurança (inegociáveis)
- Nunca leia, imprima nem commite `.env` ou `data/`. Use `.env.example` para saber as variáveis.
- Senha de entrada só é gravada cifrada. Senha mestra nunca é gravada, logada, posta em cookie, em URL ou de volta num formulário.
- Listagens e a página de reutilização nunca mostram senhas.

## Servidores MCP
Nenhum instalado.
