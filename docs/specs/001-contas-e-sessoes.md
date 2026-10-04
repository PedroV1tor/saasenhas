# 001 — Contas e sessões

**Objetivo:** o usuário cria uma conta com e-mail + senha mestra e destrava o cofre por uma sessão curta.

## Regras
- E-mail é normalizado (trim + minúsculas) e precisa ter formato válido.
- Senha mestra com no mínimo 10 caracteres. Ela **nunca** é salva: guardamos só `salt` e um `verifier` derivados com scrypt.
- Login com senha errada e login com e-mail inexistente devolvem a **mesma** mensagem (não revelar quem tem conta).
- A sessão é um token aleatório (32 bytes) válido por `SESSION_TTL_MINUTES` (padrão 15). A chave do cofre fica só em memória.
- Logout (`DELETE /api/sessoes`) invalida o token na hora.

## API
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/api/contas` | `{ email, senhaMestra }` | 201 `{ email }` · 400 · 409 |
| POST | `/api/sessoes` | `{ email, senhaMestra }` | 201 `{ token }` · 401 |
| DELETE | `/api/sessoes` | — (Bearer) | 204 |

## Critérios de aceite
- [x] Conta duplicada → 409.
- [x] Senha mestra curta → 400.
- [x] Mesma mensagem para senha errada e conta inexistente.
- [x] Sessão expira após o TTL.
