# AGENTS.md — SaaSenhas

API de um micro-SaaS que organiza as senhas do usuário num cofre cifrado. Público: estudantes e jovens com muitas contas.

## Comandos (rode a partir da raiz)
| Ação | Comando |
|---|---|
| Instalar | `npm install` |
| Configurar | `cp .env.example .env` |
| Rodar | `npm start` (ou `npm run dev` com reload) → http://localhost:3000/health |
| Testar | `npm test` (node:test, ~5 s) |
| Lint | `npm run lint` (ESLint 9) |

## Stack
Node.js 20.18 (ESM, `"type": "module"`) · Express 5 · `node:test` + `node:assert` · ESLint 9 (flat config) · `node:crypto` (scrypt + AES-256-GCM). Sem banco: o cofre é um JSON em `DATA_FILE`.

## Estrutura
```
src/app.js            rotas e tratamento de erro (createApp)
src/server.js         ponto de entrada (lê config e sobe o servidor)
src/crypto/           derivação de chave, cifra e decifra
src/vault/            regras do cofre (vault-service) e persistência (store)
src/password/         gerador e medidor de força
src/auth/sessions.js  sessões em memória com TTL
test/                 um *.test.js por módulo + api.test.js (ponta a ponta)
docs/specs/           specs numeradas — a fonte da verdade do comportamento
docs/harness/         relatórios e evidências do harness
```

## Specs
Ficam em `docs/specs/NNN-nome.md` (objetivo, regras, API, critérios de aceite). Mudança de comportamento começa pela spec.

## Como você deve trabalhar
1. **Pense antes de codar.** Leia a spec e o código envolvido. Diga suas suposições; se houver duas leituras possíveis do pedido, pergunte em vez de escolher em silêncio.
2. **Simplicidade primeiro.** Escreva o mínimo que resolve o pedido. Nada de dependência, abstração ou opção "para o futuro" que ninguém pediu.
3. **Mudanças cirúrgicas.** Toque só no que o pedido exige. Não reformate, renomeie nem "melhore" código vizinho; siga o estilo que já existe.
4. **Trabalhe guiado por objetivo verificável.** Transforme o pedido num teste que falha, faça passar e só diga "pronto" depois de `npm test` e `npm run lint` passarem — mostrando a saída.

## Regras de segurança (inegociáveis)
- Nunca leia, imprima nem commite `.env` ou `data/`. Use `.env.example` para saber as variáveis.
- Senha de entrada só é gravada cifrada (`encrypt`). Senha mestra nunca é gravada nem logada.
- Respostas de listagem e de reutilização nunca contêm senhas.

## Servidores MCP
Nenhum instalado.
