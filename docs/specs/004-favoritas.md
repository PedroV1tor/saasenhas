# 004 — Entradas favoritas

**Objetivo:** o usuário marca as contas que mais usa como favoritas e consegue listar só elas.

## Regras
- Toda entrada tem o campo `favorita` (booleano). Entradas novas e entradas antigas sem o campo valem `false`.
- `favorita` pode ser enviado ao criar (`POST`) e ao editar (`PUT`). Se vier e não for booleano → 400.
- Mudar só `favorita` não exige mandar `site`, `usuario` nem `senha`.
- `GET /api/entradas?favoritas=true` devolve só as favoritas; sem o parâmetro, devolve todas.
- `favorita` aparece na listagem, no detalhe e nas reutilizadas. A listagem continua **sem** senha.

## API (todas exigem `Authorization: Bearer <token>`)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/entradas?favoritas=true` | — | 200 `[ { id, site, usuario, favorita, createdAt, updatedAt } ]` |
| POST | `/api/entradas` | `{ site, usuario, senha, favorita? }` | 201 entrada (sem senha) · 400 |
| PUT | `/api/entradas/:id` | `{ favorita }` (e/ou outros campos) | 200 · 400 · 404 |

## Critérios de aceite
- [x] Entrada nova sai com `favorita: false`; criar com `favorita: true` funciona.
- [x] `PUT { favorita: true }` marca e `PUT { favorita: false }` desmarca, sem mexer na senha.
- [x] `favorita` não booleano → 400.
- [x] `?favoritas=true` lista só as favoritas, sem senha.
- [x] Entrada antiga sem o campo aparece como `favorita: false`.
