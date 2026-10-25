# 004 — Entradas favoritas

> Aprovada em 09/10/2026 por Pedro Vitor e Isabella Nascimento. Depende da spec 002. Testes de aceite: `test/spec-004-favoritas.test.js`.

## 1. Objetivo
O usuário marca as contas que mais usa como favoritas e consegue ver só elas, sem rolar o cofre inteiro.

## 2. Escopo
**Entra:** marcar e desmarcar favorita (no formulário e por um botão de estrela), filtro "Só favoritas" na lista.
**Não entra:** ordenar por favoritas, mais de um nível de destaque, favoritas compartilhadas entre aparelhos além do próprio cofre.

## 3. Atores
| Ator | O que faz |
|---|---|
| **Usuário** | Pessoa com sessão válida. Marca, desmarca e filtra. |

## 4. Dados
A entrada (spec 002) ganha o campo **favorita** (verdadeiro ou falso; no arquivo, `favorite`).

| Método e rota | Campos | Respostas |
|---|---|---|
| `GET /cofre?favoritas=1` | — | 200, só as favoritas |
| `POST /cofre/entradas` e `POST /cofre/entradas/:id` | os da spec 002 + caixa `favorita` | como na spec 002 |
| `POST /cofre/entradas/:id/favorita` | `favorita` = `true` ou `false` | 303 → `/cofre` · 400 · 404 |

## 5. Regras de negócio
- **RN-01 — Padrão.** Entrada nova sem a caixa marcada, e entrada gravada antes desta spec (sem o campo), é **não favorita**.
- **RN-02 — Formulário.** A caixa "Favorita" aparece em nova entrada e em edição; marcada = favorita, desmarcada = não favorita.
- **RN-03 — Estrela.** Na lista, cada entrada tem um botão ★ (favorita) ou ☆ (não favorita) que envia `POST /cofre/entradas/:id/favorita` com o valor oposto. Mudar a favorita não mexe em site, usuário nem senha. Valor diferente de `true`/`false` → 400 `O campo "favorita" precisa ser true ou false.`
- **RN-04 — Filtro.** `/cofre?favoritas=1` lista só as favoritas; sem o parâmetro, todas. A lista continua **sem** senha (spec 002, RN-05).

## 6. Critérios de aceite
- **CA-01** — **Dado** um usuário com sessão, **quando** ele cria `a.com` sem marcar "Favorita" e `b.com` marcando, **então** a lista mostra `a.com` como não favorita e `b.com` como favorita.
- **CA-02** — **Dado** a entrada `c.com` não favorita com a senha `senha-c`, **quando** o usuário clica na estrela e depois clica de novo, **então** ela fica favorita e depois não favorita, recebendo 303 para `/cofre` nas duas vezes, e o detalhe continua com `c.com` e `senha-c`.
- **CA-03** — **Dado** `d.com` favorita e `e.com` não, **quando** o usuário abre `/cofre?favoritas=1`, **então** vê `d.com`, não vê `e.com` e não vê nenhuma senha.
- **CA-04** — **Dado** uma entrada gravada sem o campo de favorita, **quando** o usuário abre a lista, **então** ela aparece como não favorita; **e quando** clica na estrela, **então** ela passa a favorita.
- **CA-05** — **Dado** uma entrada, **quando** chega `favorita=talvez` na rota da estrela, **então** a resposta é 400 `O campo "favorita" precisa ser true ou false.`
- **CA-06** — **Dado** a entrada favorita `f.com`, **quando** o usuário a edita desmarcando "Favorita" e deixando a senha em branco, **então** ela fica não favorita e mantém a senha.

## 7. Restrições
- Sem JavaScript obrigatório: a estrela é um botão de formulário (`POST`), como o "Sair" (spec 001, D-20).

## 8. Decisões
| # | Ambiguidade | Decisão | Motivo |
|---|---|---|---|
| D-01 | Entradas antigas, sem o campo? | Valem não favorita (RN-01, CA-04). | Não exige migrar o arquivo. |
| D-02 | A estrela troca o valor ou recebe o valor? | Recebe o valor (`true`/`false`). | Dois cliques rápidos ou duas abas não invertem o resultado esperado. |
| D-03 | Depois de clicar na estrela, para onde volta? | Para `/cofre`. | Simples; o filtro de favoritas é um clique. |

## 9. Mudanças desde a implementação
**Sem mudança de comportamento:** RN-01 a RN-04 e CA-01 a CA-06 implementados como escritos.
- Efeito na spec 002: a lista passou a ter o campo `favorita`. O teste unitário que confere os campos exatos da lista (`test/vault-service.test.js`) foi **atualizado para incluir `favorite`**, mantendo a exigência de que senha e segredo não apareçam.
- 25/10/2026: retirada junto com a 002 (`2e27d76`) e reaplicada sem mudança de comportamento depois que a 002 foi refeita por TDD. Os testes da 004 voltaram como estavam; não passaram de novo pelo vermelho.
