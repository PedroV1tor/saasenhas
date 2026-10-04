# 002 — Cofre de senhas

**Objetivo:** guardar as contas do usuário (site, usuário, senha) num lugar só, com a senha sempre cifrada.

## Regras
- A senha de cada entrada é cifrada com AES-256-GCM, com chave derivada da senha mestra (scrypt) e IV aleatório por cifragem.
- `site` e `usuario` são obrigatórios (até 200 caracteres); `senha` é obrigatória (até 512).
- A listagem **não** devolve senhas; só o detalhe (`GET /api/entradas/:id`) devolve.
- O arquivo do cofre (`DATA_FILE`) nunca contém senha em texto puro.
- **Senhas reutilizadas:** `GET /api/entradas/reutilizadas` agrupa entradas com a mesma senha, sem mostrar a senha.

## API (todas exigem `Authorization: Bearer <token>`)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/entradas` | — | 200 `[ { id, site, usuario, createdAt, updatedAt } ]` |
| POST | `/api/entradas` | `{ site, usuario, senha }` | 201 entrada (sem senha) |
| GET | `/api/entradas/:id` | — | 200 entrada **com** `senha` · 404 |
| PUT | `/api/entradas/:id` | campos a mudar | 200 · 404 |
| DELETE | `/api/entradas/:id` | — | 204 · 404 |
| GET | `/api/entradas/reutilizadas` | — | 200 `[ { quantidade, entradas } ]` |

## Critérios de aceite
- [x] Listagem sem senha; detalhe com senha.
- [x] Arquivo do cofre sem texto puro.
- [x] Reutilização detectada sem expor a senha.

## Fora do escopo do MVP
- `site` e `usuario` ficam em texto puro no arquivo (só a senha é cifrada).
- Sem front-end; o uso é pela API.
