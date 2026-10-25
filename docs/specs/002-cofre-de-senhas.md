# 002 — Cofre de senhas

> **Status:** aprovada em 09/10/2026 por João Victor Fiuza e Pedro Vitor. Rascunho criado pela skill `implementar-com-spec` (prova 4.2 de [`evidencias.md`](../harness/evidencias.md)); a revisão confirmou D-01 a D-04 sem mudanças.
> Depende da spec 001 (sessão e chave do cofre). Testes de aceite: `test/spec-002-cofre-de-senhas.test.js`.

## 1. Objetivo
Guardar as contas do usuário (site, usuário e senha) num lugar só, com a senha sempre cifrada pela chave que vem da senha mestra, e mostrar quais contas usam a mesma senha.

## 2. Escopo
**Entra:** criar, listar, ver, editar e excluir entradas; página de senhas reutilizadas.
**Não entra:** busca, pastas ou etiquetas; importar/exportar; compartilhar entradas; cifrar `site` e `usuario` (ficam em texto puro no arquivo, D-02).

## 3. Atores
| Ator | O que faz |
|---|---|
| **Usuário** | Pessoa com sessão válida (spec 001). Gerencia as próprias entradas. |
| **Sistema SaaSenhas** | Valida, cifra, guarda e decifra as entradas. |

## 4. Dados
**Entrada** (dentro da conta, no arquivo `DATA_FILE`):
| Campo | Conteúdo |
|---|---|
| id | UUID aleatório |
| site | texto, 1 a 200 caracteres, sem espaços nas pontas |
| usuário | texto, 1 a 200 caracteres, sem espaços nas pontas |
| segredo | a senha cifrada: `iv.tag.dados`, cada parte em base64 |
| criada em / atualizada em | data e hora ISO 8601 |

**Formato do arquivo `DATA_FILE`** (fecha a lacuna apontada na seção 8 da spec 001):
```json
{ "users": { "<e-mail normalizado>": { "salt": "<base64>", "verifier": "<base64>", "entries": [ { "id": "…", "site": "…", "username": "…", "secret": "<iv>.<tag>.<dados>", "createdAt": "…", "updatedAt": "…" } ] } } }
```

**Páginas** (todas exigem sessão válida; sem ela → 303 `/entrar?motivo=login`, spec 001 RN-10):
| Método e rota | O que faz | Respostas |
|---|---|---|
| `GET /cofre` | lista as entradas (site, usuário, atualizada em), **sem senha** | 200 |
| `GET /cofre/nova` | formulário de nova entrada | 200 |
| `POST /cofre/entradas` | cria (`site`, `usuario`, `senha`) | 303 → `/cofre?aviso=criada` · 400 |
| `GET /cofre/entradas/:id` | detalhe **com** a senha | 200 · 404 |
| `GET /cofre/entradas/:id/editar` | formulário de edição | 200 · 404 |
| `POST /cofre/entradas/:id` | salva a edição | 303 → `/cofre/entradas/:id?aviso=salva` · 400 · 404 |
| `POST /cofre/entradas/:id/excluir` | exclui | 303 → `/cofre?aviso=excluida` · 404 |
| `GET /cofre/reutilizadas` | grupos de entradas com a mesma senha, **sem a senha** | 200 |

**Avisos:** `aviso=criada` → `Entrada salva.` · `aviso=salva` → `Alterações salvas.` · `aviso=excluida` → `Entrada excluída.`

## 5. Regras de negócio
- **RN-01 — Senha sempre cifrada.** O sistema cifra a senha de cada entrada com AES-256-GCM, usando a chave do cofre da sessão e um IV aleatório a cada cifragem. O arquivo nunca contém a senha em texto puro.
- **RN-02 — Site e usuário.** Obrigatórios, até 200 caracteres, com os espaços das pontas removidos. Vazio → 400 `O campo "site" é obrigatório.` (ou `"usuario"`); longo demais → 400 `O campo "site" aceita no máximo 200 caracteres.`
- **RN-03 — Senha literal.** A senha é obrigatória (não vazia), tem até 512 caracteres e é guardada **exatamente como digitada**, inclusive espaços nas pontas. Vazia na criação → 400 `O campo "senha" é obrigatório.`; mais de 512 → 400 `O campo "senha" aceita no máximo 512 caracteres.`
- **RN-04 — Editar sem trocar a senha.** Na edição, o campo senha vem vazio; deixá-lo vazio mantém a senha atual (D-03).
- **RN-05 — Listagens sem senha.** A lista do cofre e a página de reutilizadas nunca mostram senhas. Só o detalhe mostra.
- **RN-06 — Reutilizadas.** O sistema agrupa as entradas cuja senha decifrada é idêntica; só aparecem grupos com 2 ou mais entradas.
- **RN-07 — Cada um no seu cofre.** Entrada de outra conta, ou inexistente, responde 404 `Entrada não encontrada.` em ver, editar e excluir.
- **RN-08 — Formulário com erro.** Volta com a mensagem e com `site` e `usuario` como digitados; a senha não volta preenchida.

## 6. Critérios de aceite
- **CA-01** — **Dado** um usuário com sessão, **quando** ele cria a entrada `github.com` / `ana` / `s3nh@-forte`, **então** recebe 303 para `/cofre?aviso=criada`, e a lista mostra `Entrada salva.`, `github.com` e `ana`, sem `s3nh@-forte`.
- **CA-02** — **Dado** uma entrada criada com a senha `  com espaços  `, **quando** o usuário abre o detalhe, **então** a senha aparece exatamente como `  com espaços  `.
- **CA-03** — **Dado** um usuário com sessão, **quando** ele cria uma entrada com site vazio, com senha vazia ou com site de 201 caracteres, **então** recebe 400 com `O campo "site" é obrigatório.`, `O campo "senha" é obrigatório.` e `O campo "site" aceita no máximo 200 caracteres.`, respectivamente.
- **CA-04** — **Dado** uma entrada com a senha `senha-antiga`, **quando** o usuário a edita trocando só o usuário e deixando a senha em branco, **então** o detalhe mostra o usuário novo e `senha-antiga`; **e quando** edita informando `senha-nova`, **então** o detalhe mostra `senha-nova`.
- **CA-05** — **Dado** uma entrada, **quando** o usuário a exclui, **então** recebe 303 para `/cofre?aviso=excluida`, e abrir o detalhe dela responde 404 `Entrada não encontrada.`
- **CA-06** — **Dado** um cofre guardado em arquivo com a entrada de senha `senha-que-nao-pode-vazar`, **quando** se lê o arquivo, **então** ele não contém esse texto.
- **CA-07** — **Dado** três entradas (`a.com` e `b.com` com a senha `repetida-123`, `c.com` com outra), **quando** o usuário abre `/cofre/reutilizadas`, **então** vê um grupo com `a.com` e `b.com`, sem `c.com` e sem `repetida-123`.
- **CA-08** — **Dado** uma entrada da conta A, **quando** a conta B tenta ver, editar ou excluir essa entrada, **então** recebe 404 `Entrada não encontrada.`, e a entrada continua intacta para A.
- **CA-09** — **Dado** um visitante sem sessão, **quando** ele abre `/cofre/nova` ou envia `POST /cofre/entradas`, **então** recebe 303 para `/entrar?motivo=login`.

## 7. Restrições
- Cifra: `node:crypto`, AES-256-GCM, IV de 12 bytes, chave de 32 bytes da sessão (spec 001).
- O detalhe mostra a senha num campo oculto, com botões "Mostrar" e "Copiar" em JavaScript servido de `/js/` (a CSP da spec 001 proíbe script inline).
- Sem banco de dados; o arquivo é reescrito por inteiro a cada mudança (escrita em temporário + renomear).

## 8. Decisões
| # | Ambiguidade | Decisão | Motivo |
|---|---|---|---|
| D-01 | Mostrar a senha na lista? | Não; só no detalhe (RN-05). | Lista aparece em telas compartilhadas; detalhe é uma ação explícita. |
| D-02 | Cifrar também site e usuário? | Não no MVP. | Permite listar sem decifrar; o dado sensível é a senha. Registrado em "Não entra". |
| D-03 | Na edição, como saber se o usuário quer trocar a senha? | Campo vazio mantém a atual (RN-04). | Não colocar a senha atual no HTML do formulário de edição. |
| D-04 | Entrada de outra conta: 403 ou 404? | 404 (RN-07). | 403 confirmaria que o id existe. |
| D-05 | No CA-01, "a lista mostra `ana`" vale para a página inteira ou para a tabela? | Para a tabela de entradas. | Achado no vermelho do CA-01: o título "Cofre de ana@exemplo.com" já contém `ana`, e o teste passaria sem a coluna de usuário. |

## 9. Mudanças desde a implementação
Reimplementação via TDD em andamento (25/10/2026): a primeira versão (`918bbba`) nasceu num commit só, com teste e código juntos. O código e os testes foram retirados e voltam um critério por vez, com o commit do vermelho antes do verde. As regras e os critérios acima **não mudaram**.
