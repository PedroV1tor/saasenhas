# 003 — Gerador de senhas e medidor de força

> Aprovada em 09/10/2026 por Rogger Martins e Isabella Nascimento. Testes de aceite: `test/spec-003-gerador-e-forca.test.js`.

## 1. Objetivo
Ajudar o estudante a parar de reutilizar senhas: gerar senhas fortes na hora e avaliar as que ele já usa, sem precisar de conta.

## 2. Escopo
**Entra:** página `/gerador` com dois formulários — gerar senha e medir a força de uma senha.
**Não entra:** frases-senha (palavras), consulta a bases de senhas vazadas, guardar a senha gerada automaticamente no cofre.

## 3. Atores
| Ator | O que faz |
|---|---|
| **Visitante ou usuário** | Gera senhas e mede a força. Não precisa de sessão. |
| **Sistema SaaSenhas** | Gera com aleatoriedade criptográfica e avalia por regras fixas. |

## 4. Dados
| Método e rota | Campos | Respostas |
|---|---|---|
| `GET /gerador` | — | 200: tamanho 16 e os quatro tipos marcados |
| `POST /gerador` | `tamanho`, `minusculas`, `maiusculas`, `numeros`, `simbolos` (caixas marcadas = presentes) | 200 com a senha gerada e a força dela · 400 |
| `POST /forca` | `senha` | 200 com nota (0–4), rótulo e sugestões |

Nada é guardado nem registrado em log: as duas rotas só calculam e respondem.

## 5. Regras de negócio
- **RN-01 — Tamanho.** Inteiro de 8 a 128 (padrão 16). Fora disso → 400 `O tamanho deve ser um número inteiro entre 8 e 128.`
- **RN-02 — Tipos.** Minúsculas, maiúsculas, números e símbolos (`!@#$%&*-_=+?`). Pelo menos um tipo marcado; nenhum → 400 `Escolha pelo menos um tipo de caractere.` A senha tem ao menos um caractere de cada tipo marcado.
- **RN-03 — Sem ambíguos.** A senha gerada nunca contém `0`, `O`, `1`, `l` nem `I`.
- **RN-04 — Aleatoriedade.** Escolha e embaralhamento com `crypto.randomInt` (fonte criptográfica).
- **RN-05 — Nota de força (0 a 4).** +1 com 8 ou mais caracteres; +1 com 14 ou mais; +1 com 3 ou mais tipos; +1 com os 4 tipos; −1 (mínimo 0) se repetir o mesmo caractere 3 ou mais vezes seguidas; nota 0 se contiver um padrão comum (`123456`, `password`, `senha`, `qwerty`, `abc123`, `111111`, `iloveyou`, `admin`, sem diferenciar maiúsculas). Rótulo: 0–1 `fraca`, 2 `média`, 3–4 `forte`. Sempre há pelo menos uma sugestão quando a nota é menor que 4.
- **RN-06 — A senha avaliada não volta.** A página do medidor mostra o resultado, mas não a senha digitada, nem de volta no campo.

## 6. Critérios de aceite
- **CA-01** — **Dado** um visitante sem sessão, **quando** ele gera uma senha com as opções padrão, **então** recebe 200, e a senha mostrada tem 16 caracteres, pelo menos um de cada tipo, nenhum de `0 O 1 l I`, e a força `forte`.
- **CA-02** — **Dado** um visitante, **quando** ele pede tamanho 7 ou 129, **então** recebe 400 `O tamanho deve ser um número inteiro entre 8 e 128.`; **e quando** pede 8 ou 128, **então** recebe uma senha desse tamanho.
- **CA-03** — **Dado** um visitante, **quando** ele desmarca os quatro tipos, **então** recebe 400 `Escolha pelo menos um tipo de caractere.`
- **CA-04** — **Dado** um visitante, **quando** ele marca só números e pede tamanho 10, **então** a senha tem 10 dígitos, todos de 2 a 9.
- **CA-05** — **Dado** a senha `minhasenha123456`, **quando** o visitante mede a força, **então** vê nota 0, rótulo `fraca` e a sugestão `Essa senha contém um padrão muito comum.`
- **CA-06** — **Dado** a senha `Ab3$Cd5%Ef7&Gh9!`, **quando** o visitante mede a força, **então** vê nota 4 e rótulo `forte`.
- **CA-07** — **Dado** a senha `minha-senha-secreta`, **quando** o visitante mede a força, **então** a página de resultado não contém `minha-senha-secreta`.
- **CA-08** — **Dado** as opções padrão, **quando** o visitante gera duas senhas seguidas, **então** elas são diferentes.

## 7. Restrições
- `node:crypto` (`randomInt`); sem dependência nova.
- A nota é uma heurística para orientar, não uma auditoria; o texto da página diz isso.

## 8. Decisões
| # | Ambiguidade | Decisão | Motivo |
|---|---|---|---|
| D-01 | Gerador e medidor exigem login? | Não. | Quem ainda não tem conta também reutiliza senhas; é a porta de entrada do produto. |
| D-02 | Mostrar de volta a senha que foi medida? | Não (RN-06). | Ela pode ser a senha real do usuário; não deve ir para o HTML nem para o cache. |
| D-03 | Excluir caracteres ambíguos? | Sim (RN-03). | O público digita senhas no celular e na TV; `l` e `I` confundem. |

## 9. Mudanças desde a implementação
Ainda não implementada.
