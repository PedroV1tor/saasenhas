# 001 — Contas e sessões

> Primeira feature do SaaSenhas. Sem conta e sem sessão, o cofre (spec 002) não existe.
> Testes de aceite: `test/spec-001-contas-e-sessoes.test.js` (um teste por critério CA-xx). Revisão cruzada: [`001-revisao.md`](001-revisao.md).

## 1. Objetivo
Permitir que o estudante crie uma conta com e-mail e senha mestra e abra o próprio cofre por uma sessão de 15 minutos, sem que o SaaSenhas guarde ou devolva a senha mestra em momento nenhum.

## 2. Escopo
**Entra:**
- Cadastro de conta com e-mail e senha mestra.
- Login (abrir o cofre) com e-mail e senha mestra, que devolve uma credencial de sessão.
- Logout, que encerra a sessão da credencial usada.
- Bloqueio das rotas do cofre (`/api/entradas` e sub-rotas) para pedidos sem sessão válida.

**Não entra:**
- Recuperação ou troca da senha mestra (ver D-04).
- Exclusão de conta e troca de e-mail.
- Confirmação de e-mail (o SaaSenhas não envia e-mails).
- Limite de tentativas de login, bloqueio de conta ou CAPTCHA.
- Login social (Google, GitHub) e autenticação em dois fatores.
- Sessões que sobrevivem a reinício do servidor.
- Interface gráfica: o uso é pela API.

## 3. Atores
| Ator | O que faz nesta feature |
|---|---|
| **Visitante** | Pessoa sem sessão. Cadastra conta e faz login. |
| **Usuário** | Pessoa com sessão válida. Acessa o cofre e faz logout. |
| **Sistema SaaSenhas** | Valida os dados, guarda a conta, emite e expira credenciais. |

## 4. Dados
**Conta** (guardada no arquivo do cofre, uma por e-mail):
| Campo | Conteúdo |
|---|---|
| e-mail | texto normalizado (RN-01); identifica a conta |
| sal | 16 bytes aleatórios gerados no cadastro |
| verificador | valor derivado da senha mestra e do sal, que permite conferir a senha sem guardá-la |

A senha mestra **não** é um campo da conta.

**Sessão** (só na memória do servidor):
| Campo | Conteúdo |
|---|---|
| credencial | texto aleatório opaco, entregue ao usuário no login |
| e-mail | dono da sessão |
| chave do cofre | derivada da senha mestra no login, usada para cifrar e decifrar as senhas do cofre |
| expira em | instante do login + `SESSION_TTL_MINUTES` |

**Entradas e saídas da API** (JSON; cada resposta de erro tem o formato `{ "erro": "<mensagem>" }`):
| Método e rota | Corpo enviado | Respostas |
|---|---|---|
| `POST /api/contas` | `{ email, senhaMestra }` | 201 `{ email }` · 400 · 409 |
| `POST /api/sessoes` | `{ email, senhaMestra }` | 201 `{ token }` · 400 · 401 |
| `DELETE /api/sessoes` | — (cabeçalho `Authorization: Bearer <token>`) | 204 · 401 |

## 5. Regras de negócio
- **RN-01 — E-mail.** O sistema remove os espaços das pontas do e-mail e converte as letras para minúsculas antes de qualquer uso. O e-mail é válido quando, depois disso, não tem espaços, tem exatamente um `@` com pelo menos um caractere antes dele e, depois do `@`, um ponto com pelo menos um caractere de cada lado (forma `texto@texto.texto`). E-mail inválido ou que não seja texto → 400 `Informe um e-mail válido.`, no cadastro e no login.
- **RN-02 — Uma conta por e-mail.** Cada e-mail normalizado tem no máximo uma conta. Cadastro com e-mail já usado → 409 `Já existe uma conta com esse e-mail.`
- **RN-03 — Tamanho da senha mestra.** A senha mestra tem 10 caracteres ou mais, contados exatamente como digitados, inclusive espaços. Menos de 10, ausente ou que não seja texto → 400 `A senha mestra precisa ter pelo menos 10 caracteres.`
- **RN-04 — Senha mestra nunca sai nem fica.** O sistema não grava a senha mestra em arquivo nem em log e não a devolve em nenhuma resposta. A resposta do cadastro contém só o e-mail normalizado.
- **RN-05 — Senha mestra literal.** O sistema não remove espaços da senha mestra. Duas senhas que diferem só na forma de compor acentos (`é` pronto ou `e` + acento) são a mesma senha.
- **RN-06 — Login correto.** E-mail cadastrado + senha mestra que confere → 201 com uma credencial nova.
- **RN-07 — Login recusado sem pista.** E-mail sem conta, senha mestra errada ou senha mestra ausente → 401 com a mesma mensagem `E-mail ou senha mestra inválidos.`, para o visitante não descobrir quais e-mails têm conta.
- **RN-08 — Validade da sessão.** A sessão vale `SESSION_TTL_MINUTES` minutos (padrão 15) contados do login. O uso não renova a sessão. No instante exato do fim do prazo ela já está expirada.
- **RN-09 — Logout.** `DELETE /api/sessoes` com credencial válida → 204, e a credencial deixa de funcionar na hora.
- **RN-10 — Acesso ao cofre.** Pedido às rotas do cofre sem credencial, com credencial inventada, expirada ou encerrada → 401 `Faça login para acessar o cofre.` O mesmo vale para o logout.
- **RN-11 — Sessões simultâneas.** Cada login gera uma credencial diferente. Uma conta pode ter mais de uma sessão aberta, e encerrar uma não afeta as outras.

### Exemplos da regra mais importante — RN-07 (login recusado sem pista)
Conta existente: `elisa@exemplo.com` com senha mestra `senha-mestra-elisa`.

| Caso | E-mail enviado | Senha mestra enviada | Resultado esperado |
|---|---|---|---|
| Feliz | `elisa@exemplo.com` | `senha-mestra-elisa` | 201 com credencial (RN-06) |
| Borda | ` ELISA@exemplo.com` | `senha-mestra-elisa` | 201 com credencial: o e-mail é normalizado (RN-01) |
| Borda | `elisa@exemplo.com` | ` senha-mestra-elisa` | 401 `E-mail ou senha mestra inválidos.`: o espaço faz parte da senha (RN-05) |
| Erro | `elisa@exemplo.com` | `senha-mestra-errada` | 401 `E-mail ou senha mestra inválidos.` |
| Erro | `ninguem@exemplo.com` | `senha-mestra-elisa` | 401 `E-mail ou senha mestra inválidos.`, idêntico ao anterior |
| Erro | `elisa@exemplo.com` | *(ausente)* | 401 `E-mail ou senha mestra inválidos.` |
| Erro | `elisa@exemplo` | `senha-mestra-elisa` | 400 `Informe um e-mail válido.`: formato vem antes da conferência (RN-01) |

## 6. Critérios de aceite
- **CA-01** — **Dado** que não existe conta para `ana@exemplo.com`, **quando** o visitante se cadastra com o e-mail `  Ana@Exemplo.COM ` e a senha mestra `0123456789`, **então** recebe 201 com o corpo `{ "email": "ana@exemplo.com" }` e nenhum outro campo.
- **CA-02** — **Dado** que existe conta para `bruno@exemplo.com`, **quando** o visitante se cadastra com `BRUNO@exemplo.com`, **então** recebe 409 `Já existe uma conta com esse e-mail.`
- **CA-03** — **Dado** um e-mail sem conta, **quando** o visitante se cadastra com uma senha mestra de 9 caracteres, **então** recebe 400 `A senha mestra precisa ter pelo menos 10 caracteres.`; **e quando** repete com 10 caracteres, **então** recebe 201.
- **CA-04** — **Dado** um dos e-mails `ana`, `ana@exemplo`, `ana @exemplo.com`, vazio ou um número, **quando** o visitante tenta se cadastrar ou fazer login, **então** recebe 400 `Informe um e-mail válido.`
- **CA-05** — **Dado** que existe conta para `davi@exemplo.com`, **quando** o visitante faz login com ` DAVI@exemplo.com` e a senha mestra certa, **então** recebe 201 com uma credencial, e essa credencial abre a listagem do cofre com 200.
- **CA-06** — **Dado** que existe conta para `elisa@exemplo.com`, **quando** o visitante faz login com senha errada, com um e-mail sem conta ou sem senha, **então** as três respostas são idênticas: 401 `E-mail ou senha mestra inválidos.`
- **CA-07** — **Dado** um usuário que fez login no instante 0, com validade de 15 minutos, **quando** ele acessa o cofre aos 10 minutos e de novo 1 ms antes dos 15 minutos, **então** recebe 200 nas duas vezes; **e quando** acessa aos 15 minutos exatos, **então** recebe 401 `Faça login para acessar o cofre.`
- **CA-08** — **Dado** um usuário com sessão válida, **quando** ele faz logout, **então** recebe 204, e o próximo acesso ao cofre e um segundo logout com a mesma credencial recebem 401.
- **CA-09** — **Dado** um usuário com duas sessões abertas, **quando** ele faz logout em uma, **então** a credencial encerrada recebe 401 e a outra continua recebendo 200.
- **CA-10** — **Dado** um pedido ao cofre, **quando** ele vem sem credencial ou com uma credencial que o sistema nunca emitiu, **então** a resposta é 401 `Faça login para acessar o cofre.`
- **CA-11** — **Dado** uma conta cadastrada com a senha mestra `  senha mestra  `, **quando** o visitante faz login com `senha mestra`, **então** recebe 401; **e quando** faz login com `  senha mestra  `, **então** recebe 201.
- **CA-12** — **Dado** uma conta cadastrada com a senha mestra `café-com-leite` escrita com `é` pronto, **quando** o visitante faz login com a mesma senha escrita com `e` + acento separado, **então** recebe 201.

## 7. Restrições
- **Proteção da senha mestra:** antes de ser comparada ou usada, a senha mestra passa por uma derivação de chave com sal e custo fixo (scrypt, N = 2^15, r = 8, p = 1; 64 ms por derivação, medido em 04/10/2026 na máquina de desenvolvimento). A comparação do verificador leva o mesmo tempo para senhas certas e erradas. A chave do cofre existe só na memória da sessão.
- **Credencial:** 32 bytes aleatórios de fonte criptográfica, em base64url.
- **Plataforma:** Node.js 20+, sem banco de dados. As contas ficam no arquivo `DATA_FILE`, e as sessões se perdem quando o servidor reinicia.
- **Tamanho:** o corpo de cada requisição tem no máximo 10 KB.
- **Configuração:** `SESSION_TTL_MINUTES` e `DATA_FILE` vêm de variáveis de ambiente (`.env.example`).

## 8. Decisões
Cada ambiguidade encontrada na versão anterior desta spec, na revisão e nas varreduras, e como a equipe a fechou.

| # | Ambiguidade | Decisão | Motivo |
|---|---|---|---|
| D-01 | "E-mail válido" não dizia o que é válido. | Formato `texto@texto.texto` sem espaços (RN-01). | O SaaSenhas não envia e-mail, então não há como confirmar que o endereço existe; o formato basta para evitar erro de digitação grosseiro. |
| D-02 | `Ana@x.com` e `ana@x.com` seriam contas diferentes? | Mesma conta: o e-mail é normalizado para minúsculas (RN-01, RN-02). | Evita o usuário criar duas contas sem querer e não conseguir achar o cofre. |
| D-03 | O cadastro responde 409 para e-mail existente, mas o login esconde se o e-mail existe (RN-07). Contradição? | Mantido assim, de propósito. | Sem 409 o visitante não entende por que o cadastro falhou. O risco de alguém descobrir e-mails pelo cadastro foi aceito no MVP; o limite de tentativas está fora do escopo. |
| D-04 | "E se o usuário esquecer a senha mestra?" | Não há recuperação, e o cofre fica inacessível. | A senha mestra é a origem da chave que cifra o cofre e o servidor nunca a conhece (RN-04). Recuperar exigiria guardá-la, o que quebra a proposta do produto. |
| D-05 | "Sessão curta": quanto tempo, e o uso renova? | 15 minutos, configuráveis, contados do login, sem renovação (RN-08). | Limita o tempo em que a chave do cofre fica na memória; prazo fixo é verificável. |
| D-06 | A sessão expira em 15:00 ou depois de 15:00? | Em 15:00 exatos ela já está expirada (RN-08, CA-07). | Fecha o caso de borda com um instante só. |
| D-07 | Pode haver login em dois aparelhos ao mesmo tempo? | Sim, e as sessões são independentes (RN-11). | O público (estudantes) alterna entre celular e computador. |
| D-08 | A senha mestra tem tamanho máximo? | Não há máximo próprio; o limite é o do corpo da requisição, 10 KB (Restrições). | Senha longa é mais forte; o limite do corpo já impede abuso. |
| D-09 | Espaços nas pontas da senha mestra contam? | Contam (RN-05). | Mesma decisão da senha das entradas (spec 002): aparar mudaria a credencial do usuário sem aviso. |
| D-10 | Mesma senha com acento composto de formas diferentes. | É a mesma senha (RN-05, CA-12). | Teclados de celular e de computador podem gerar formas diferentes do mesmo `é`; sem isso, o usuário não entraria pelo outro aparelho. |
| D-11 | A ordem de checagem no login: formato do e-mail ou conferência da senha primeiro? | Formato primeiro (400), conferência depois (401). | Um e-mail malformado nunca pode ter conta, então o 400 não revela nada sobre contas. |
| D-12 | Logout com credencial já inválida. | 401, igual às rotas do cofre (RN-10). | Uma regra só para credencial inválida. |

### Varreduras da Aula 08
| Varredura | Ocorrências encontradas | Decisão |
|---|---|---|
| **Vagueza** (rápido, fácil, intuitivo, adequado, seguro, curto…) | Versão anterior: "sessão **curta**" (objetivo); "formato **válido**" (e-mail); critério "senha mestra **curta** → 400". Rascunho desta versão: "derivação de chave **lenta**". | "sessão curta" → 15 minutos, sem renovação (D-05, RN-08); "válido" → formato definido (D-01, RN-01); "curta" → menos de 10 caracteres, com caso de borda 9/10 (CA-03); "lenta" → custo fixo com parâmetros e tempo medido. |
| **Fuga** (etc., se necessário, se possível, quando aplicável…) | Nenhuma, nem na versão anterior nem na final. | — |
| **Ator e quantidade** (voz passiva, todos, alguns, vários) | Versão anterior: "E-mail **é normalizado**" e "Ela **nunca é salva**" (por quem?); "**guardamos**" (nós quem?). Rascunho desta versão: "**todo** erro tem o formato…". | Sujeito explícito: "**o sistema** remove…" (RN-01) e "**o sistema** não grava…" (RN-04); "todo erro" → "cada resposta de erro". |
| **Implementação nos critérios** (classe, tabela, framework, biblioteca) | Versão anterior: regra citando "derivados com **scrypt**" e critérios em forma de checklist, sem Dado/Quando/Então. | Os CA agora descrevem só pedido e resposta da API; scrypt e Node ficaram só em Restrições. |

### Se o código fosse apagado agora, esta spec bastaria para reconstruí-lo?
**Para o comportamento, sim.** Rotas, campos, códigos de resposta, mensagens exatas, validade da sessão e casos de borda estão definidos e cada um tem um teste de aceite. Uma reimplementação que passe em `test/spec-001-contas-e-sessoes.test.js` se comporta igual à atual para quem usa a API.

**Para os dados já gravados, não totalmente.** A spec fixa o algoritmo e os parâmetros da derivação (Restrições), mas **não** fixa o formato do arquivo `DATA_FILE` nem como os 64 bytes derivados se dividem entre chave e verificador. Uma reconstrução funcionaria para contas novas, mas não abriria as contas que já existem. Para fechar isso falta uma seção de formato de armazenamento, que a equipe deixou para a spec 002 (cofre), dona do arquivo.
