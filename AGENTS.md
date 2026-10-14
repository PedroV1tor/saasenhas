# AGENTS.md — SaaSenhas

Sistema web de um micro-SaaS que organiza as senhas do usuário num cofre cifrado: páginas geradas no servidor (front) e regras do cofre (back) no mesmo projeto. Público: estudantes e jovens com muitas contas.

## Comandos (rode a partir da raiz)
| Ação | Comando |
|---|---|
| Instalar | `npm install` |
| Configurar | `cp .env.example .env` |
| Rodar | `npm start` (ou `npm run dev` com reload) → http://localhost:3000 |
| Testar | `npm test` (node:test) |
| Lint | `npm run lint` (ESLint 9) |

## Stack
Node.js 20.18 (ESM) · Express 5 · EJS (páginas no servidor) · CSS e JS puros em `public/` · `node:test` + `node:assert` · ESLint 9 · `node:crypto` (scrypt + AES-256-GCM). Sem banco: o cofre é um JSON em `DATA_FILE`.

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
