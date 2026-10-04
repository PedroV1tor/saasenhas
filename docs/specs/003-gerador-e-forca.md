# 003 — Gerador de senhas e medidor de força

**Objetivo:** ajudar o usuário a parar de reutilizar senhas, gerando senhas fortes e avaliando as que ele já usa.

## Regras do gerador
- Tamanho entre 8 e 128 (padrão 16); tipos: minúsculas, maiúsculas, números, símbolos (todos ligados por padrão).
- Pelo menos um caractere de cada tipo escolhido; aleatoriedade via `crypto.randomInt`.
- Sem caracteres ambíguos (`0 O 1 l I`).

## Regras do medidor (score 0–4)
- +1 com 8+ caracteres, +1 com 14+, +1 com 3+ tipos, +1 com os 4 tipos.
- −1 se repetir o mesmo caractere 3+ vezes seguidas.
- Score 0 se contiver padrão comum (`123456`, `senha`, `password`…).
- Rótulo: 0–1 `fraca`, 2 `média`, 3–4 `forte`. Sempre devolve sugestões.

## API (sem login)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/api/gerador` | `{ tamanho?, minusculas?, maiusculas?, numeros?, simbolos? }` | 200 `{ senha, forca }` · 400 |
| POST | `/api/forca` | `{ senha }` | 200 `{ score, label, suggestions }` |

## Critérios de aceite
- [x] Senha gerada no padrão é `forte`.
- [x] Tamanho fora da faixa → 400.
