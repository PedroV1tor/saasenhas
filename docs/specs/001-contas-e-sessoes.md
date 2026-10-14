# 001 — Contas e sessões

> Primeira feature do SaaSenhas. Sem conta e sem sessão, o cofre (spec 002) não existe.
> Testes de aceite: `test/spec-001-contas-e-sessoes.test.js` (um teste por critério CA-xx). Revisão cruzada: [`001-revisao.md`](001-revisao.md).

## 1. Objetivo
Permitir que o estudante crie uma conta com e-mail e senha mestra pelo site e abra o próprio cofre por uma sessão de 15 minutos, sem que o SaaSenhas guarde ou mostre a senha mestra em momento nenhum.

## 2. Escopo
**Entra:**
- Página de cadastro de conta com e-mail e senha mestra.
- Página de entrada (abrir o cofre) com e-mail e senha mestra, que cria uma sessão guardada num cookie.
- Link "Sair", que encerra a sessão do cookie usado.
- Bloqueio da página do cofre (`/cofre` e sub-rotas) para quem não tem sessão válida.
- Uma página `/cofre` mínima, que mostra de quem é o cofre (o conteúdo vem na spec 002).

**Não entra:**
- Recuperação ou troca da senha mestra (ver D-04).
- Exclusão de conta e troca de e-mail.
- Confirmação de e-mail (o SaaSenhas não envia e-mails).
- Limite de tentativas de login, bloqueio de conta ou CAPTCHA.
- Login social (Google, GitHub) e autenticação em dois fatores.
- Sessões que sobrevivem a reinício do servidor.
- "Lembrar de mim" ou sessão mais longa que 15 minutos.

## 3. Atores
| Ator | O que faz nesta feature |
|---|---|
| **Visitante** | Pessoa sem sessão. Cadastra conta e entra. |
| **Usuário** | Pessoa com sessão válida. Abre o cofre e sai. |
| **Sistema SaaSenhas** | Valida os dados, guarda a conta, emite e expira sessões. |

## 4. Dados
**Conta** (guardada no arquivo `DATA_FILE`, uma por e-mail):
| Campo | Conteúdo |
|---|---|
| e-mail | texto normalizado (RN-01); identifica a conta |
| sal | 16 bytes aleatórios gerados no cadastro |
| verificador | valor derivado da senha mestra e do sal, que permite conferir a senha sem guardá-la |

A senha mestra **não** é um campo da conta.

**Sessão** (só na memória do servidor):
| Campo | Conteúdo |
|---|---|
| credencial | texto aleatório opaco, entregue ao navegador no cookie `sessao` |
| e-mail | dono da sessão |
| chave do cofre | derivada da senha mestra na entrada, usada para cifrar e decifrar as senhas do cofre |
| expira em | instante da entrada + `SESSION_TTL_MINUTES` |

**Páginas e formulários** (formulários enviados como `application/x-www-form-urlencoded`, campos `email` e `senhaMestra`; cada erro aparece na própria página, num aviso de erro):
| Método e rota | O que faz | Respostas |
|---|---|---|
| `GET /` | início | 303 → `/cofre` com sessão válida · 303 → `/entrar` sem |
| `GET /cadastro` | formulário de cadastro | 200 · 303 → `/cofre` com sessão válida (RN-13) |
| `POST /cadastro` | cria a conta | 303 → `/entrar?conta=criada&email=<e-mail normalizado>` · 400 · 409 · 413 |
| `GET /entrar` | formulário de entrada; mostra o aviso de `?conta=criada`, `?saiu=1` ou `?motivo=login` | 200 · 303 → `/cofre` com sessão válida (RN-13) |
| `POST /entrar` | abre a sessão | 303 → `/cofre` com o cookie `sessao` · 400 · 401 · 413 |
| `GET /sair` | encerra a sessão | 303 → `/entrar?saiu=1`, apagando o cookie · 303 → `/entrar?motivo=login` sem sessão válida |
| `GET /cofre` | página do cofre | 200 com sessão válida · 303 → `/entrar?motivo=login` |

**Avisos da página de entrada:**
| Parâmetro | Aviso |
|---|---|
| `conta=criada` | `Conta criada. Entre com sua senha mestra.` |
| `saiu=1` | `Você saiu do cofre.` |
| `motivo=login` | `Faça login para acessar o cofre.` |

## 5. Regras de negócio
- **RN-01 — E-mail.** O sistema remove os espaços das pontas do e-mail e converte as letras para minúsculas antes de qualquer uso. O e-mail é válido quando, depois disso, não tem espaços, tem exatamente um `@` com pelo menos um caractere antes dele e, depois do `@`, um ponto com pelo menos um caractere de cada lado (forma `texto@texto.texto`). E-mail inválido ou ausente → 400 `Informe um e-mail válido.`, no cadastro e na entrada.
- **RN-02 — Uma conta por e-mail.** Cada e-mail normalizado tem no máximo uma conta. Cadastro com e-mail já usado → 409 `Já existe uma conta com esse e-mail.`
- **RN-03 — Tamanho da senha mestra.** A senha mestra tem 10 caracteres ou mais, contados exatamente como digitados, inclusive espaços, antes de qualquer normalização. Um emoji conta como 2 caracteres e um acento digitado separado da letra conta como 1 (D-14). Menos de 10 ou ausente → 400 `A senha mestra precisa ter pelo menos 10 caracteres.`
- **RN-04 — Senha mestra nunca sai nem fica.** O sistema não grava a senha mestra em arquivo nem em log, não a coloca em cookie nem em endereço (URL) e não a mostra em nenhuma página, nem de volta no formulário.
- **RN-05 — Senha mestra literal.** O sistema não remove espaços da senha mestra. Duas senhas que diferem só na forma de compor acentos (`é` pronto ou `e` + acento) são a mesma senha. O mesmo vale para variantes de compatibilidade do mesmo caractere, como a ligadura `ﬁ` e `fi`, ou letras de largura cheia (`Ａ`) e comuns (`A`) (D-15).
- **RN-06 — Entrada correta.** E-mail cadastrado + senha mestra que confere → 303 para `/cofre`, com uma credencial nova no cookie `sessao`.
- **RN-07 — Recusa sem pista.** E-mail sem conta, senha mestra errada ou senha mestra ausente → 401 com a mesma mensagem `E-mail ou senha mestra inválidos.` e sem cookie de sessão, para o visitante não descobrir quais e-mails têm conta. Pelo mesmo motivo, o sistema faz a derivação de chave da senha enviada mesmo quando o e-mail não tem conta, e a recusa por e-mail sem conta leva o mesmo tempo que a recusa por senha errada (D-13).
- **RN-08 — Validade da sessão.** A sessão vale `SESSION_TTL_MINUTES` minutos (padrão 15) contados da entrada. O uso não renova a sessão. No instante exato do fim do prazo ela já está expirada.
- **RN-09 — Sair.** "Sair" com sessão válida encerra a sessão na hora, apaga o cookie e leva a `/entrar?saiu=1`.
- **RN-10 — Acesso ao cofre.** Pedido ao cofre sem cookie, com credencial inventada, expirada ou encerrada → 303 para `/entrar?motivo=login`, que mostra `Faça login para acessar o cofre.` O mesmo vale para "Sair" sem sessão válida.
- **RN-11 — Sessões simultâneas.** Cada entrada gera uma credencial diferente. Uma conta pode ter mais de uma sessão aberta, e encerrar uma não afeta as outras.
- **RN-12 — Formulário com erro.** Quando o cadastro ou a entrada falha, a página volta com a mensagem de erro, o campo e-mail preenchido com o texto **como foi digitado** e o campo senha mestra **vazio** (D-16).
- **RN-13 — Já com sessão.** Quem tem sessão válida e abre `/entrar` ou `/cadastro` vai direto para `/cofre` (D-17).

### Exemplos da regra mais importante — RN-07 (recusa sem pista)
Conta existente: `elisa@exemplo.com` com senha mestra `senha-mestra-elisa`.

| Caso | E-mail enviado | Senha mestra enviada | Resultado esperado |
|---|---|---|---|
| Feliz | `elisa@exemplo.com` | `senha-mestra-elisa` | 303 → `/cofre` com cookie (RN-06) |
| Borda | ` ELISA@exemplo.com` | `senha-mestra-elisa` | 303 → `/cofre`: o e-mail é normalizado (RN-01) |
| Borda | `elisa@exemplo.com` | ` senha-mestra-elisa` | 401 `E-mail ou senha mestra inválidos.`: o espaço faz parte da senha (RN-05) |
| Erro | `elisa@exemplo.com` | `senha-mestra-errada` | 401 `E-mail ou senha mestra inválidos.` |
| Erro | `ninguem@exemplo.com` | `senha-mestra-elisa` | 401 `E-mail ou senha mestra inválidos.`, idêntico ao anterior |
| Erro | `elisa@exemplo.com` | *(ausente)* | 401 `E-mail ou senha mestra inválidos.` |
| Erro | `elisa@exemplo` | `senha-mestra-elisa` | 400 `Informe um e-mail válido.`: formato vem antes da conferência (D-11) |

## 6. Critérios de aceite
- **CA-01** — **Dado** que não existe conta para `ana@exemplo.com`, **quando** o visitante se cadastra com o e-mail `  Ana@Exemplo.COM ` e a senha mestra `0123456789`, **então** recebe 303 para `/entrar?conta=criada&email=ana%40exemplo.com`, e essa página mostra `Conta criada. Entre com sua senha mestra.` com o e-mail `ana@exemplo.com` já preenchido.
- **CA-02** — **Dado** que existe conta para `bruno@exemplo.com`, **quando** o visitante se cadastra com `BRUNO@exemplo.com`, **então** recebe 409 e a página mostra `Já existe uma conta com esse e-mail.`
- **CA-03** — **Dado** um e-mail sem conta, **quando** o visitante se cadastra com uma senha mestra de 9 caracteres, **então** recebe 400 e a página mostra `A senha mestra precisa ter pelo menos 10 caracteres.`; **e quando** repete com 10 caracteres, **então** recebe 303.
- **CA-04** — **Dado** um dos e-mails `ana`, `ana@exemplo`, `ana @exemplo.com`, vazio ou o campo ausente, **quando** o visitante tenta se cadastrar ou entrar, **então** recebe 400 e a página mostra `Informe um e-mail válido.`
- **CA-05** — **Dado** que existe conta para `davi@exemplo.com`, **quando** o visitante entra com ` DAVI@exemplo.com` e a senha mestra certa, **então** recebe 303 para `/cofre` com o cookie `sessao`, e com esse cookie `/cofre` responde 200 mostrando `davi@exemplo.com`.
- **CA-06** — **Dado** que existe conta para `elisa@exemplo.com`, **quando** o visitante entra com senha errada, com um e-mail sem conta ou sem senha, **então** as três respostas têm o mesmo status 401, a mesma mensagem `E-mail ou senha mestra inválidos.` e nenhuma cria cookie de sessão.
- **CA-07** — **Dado** um usuário que entrou no instante 0, com validade de 15 minutos, **quando** ele abre o cofre aos 10 minutos e de novo 1 ms antes dos 15 minutos, **então** recebe 200 nas duas vezes; **e quando** abre aos 15 minutos exatos, **então** recebe 303 para `/entrar?motivo=login`.
- **CA-08** — **Dado** um usuário com sessão válida, **quando** ele sai, **então** recebe 303 para `/entrar?saiu=1` com o cookie apagado e a página mostra `Você saiu do cofre.`; o próximo acesso ao cofre e um segundo "Sair" com a mesma credencial recebem 303 para `/entrar?motivo=login`.
- **CA-09** — **Dado** um usuário com duas sessões abertas, **quando** ele sai em uma, **então** a credencial encerrada é levada a `/entrar?motivo=login` e a outra continua recebendo 200 no cofre.
- **CA-10** — **Dado** um pedido ao cofre, **quando** ele vem sem cookie ou com uma credencial que o sistema nunca emitiu, **então** a resposta é 303 para `/entrar?motivo=login`, e essa página mostra `Faça login para acessar o cofre.`
- **CA-11** — **Dado** uma conta cadastrada com a senha mestra `  senha mestra  `, **quando** o visitante entra com `senha mestra`, **então** recebe 401; **e quando** entra com `  senha mestra  `, **então** recebe 303 para `/cofre`.
- **CA-12** — **Dado** uma conta cadastrada com a senha mestra `café-com-leite` escrita com `é` pronto, **quando** o visitante entra com a mesma senha escrita com `e` + acento separado, **então** recebe 303 para `/cofre`.
- **CA-13** — **Dado** que existe conta para `lia@exemplo.com`, **quando** o visitante tenta entrar com senha errada e com o e-mail sem conta `ninguem2@exemplo.com`, **então** a recusa mais rápida leva pelo menos metade do tempo da mais lenta (mediana de 3 tentativas de cada).
- **CA-14** — **Dado** um visitante, **quando** ele se cadastra com uma senha mestra de 11 KB, **então** recebe 413 e a página mostra `O corpo da requisição passa de 10 KB.`
- **CA-15** — **Dado** que existe conta para `nina@exemplo.com`, **quando** a visitante entra com a senha mestra certa, **então** o cookie `sessao` vem com `HttpOnly`, `SameSite=Strict`, `Path=/` e `Max-Age=900`, e nem o cookie, nem o endereço do redirecionamento, nem as páginas de cadastro, entrada e cofre contêm a senha mestra.
- **CA-16** — **Dado** que existe conta para `olga@exemplo.com`, **quando** a visitante entra com ` Olga@exemplo.com` e a senha errada, **então** a página volta com o campo e-mail preenchido com ` Olga@exemplo.com` e o campo senha mestra sem valor.
- **CA-17** — **Dado** um usuário com sessão válida, **quando** ele abre `/entrar` ou `/cadastro`, **então** recebe 303 para `/cofre`.

## 7. Restrições
- **Proteção da senha mestra:** antes de ser comparada ou usada, a senha mestra passa pela normalização Unicode NFKC (RN-05) e por uma derivação de chave com sal e custo fixo (scrypt, N = 2^15, r = 8, p = 1, 64 bytes: 32 para a chave do cofre e 32 para o verificador). A comparação do verificador leva o mesmo tempo para senhas certas e erradas. A chave do cofre existe só na memória da sessão.
- **Credencial:** 32 bytes aleatórios de fonte criptográfica, em base64url, no cookie `sessao` com `HttpOnly`, `SameSite=Strict`, `Path=/` e `Max-Age` igual à validade da sessão. O relógio do gerenciador de sessões é injetável, para os testes controlarem o tempo.
- **Plataforma:** Node.js 20.18+, Express 5, páginas geradas no servidor com EJS; sem framework de front-end. Sem banco de dados: as contas ficam no arquivo `DATA_FILE`, e as sessões se perdem quando o servidor reinicia.
- **Tamanho:** o corpo de cada requisição tem no máximo 10 KB. Corpo maior → 413 `O corpo da requisição passa de 10 KB.` (D-19).
- **Cabeçalhos:** as páginas saem com `Content-Security-Policy` restrita ao próprio site (sem script inline), `X-Content-Type-Options: nosniff` e `Referrer-Policy: no-referrer`.
- **Configuração:** `PORT`, `SESSION_TTL_MINUTES` e `DATA_FILE` vêm de variáveis de ambiente (`.env.example`).

## 8. Decisões
Cada ambiguidade encontrada na primeira versão desta spec, na revisão cruzada ([`001-revisao.md`](001-revisao.md)) e nas varreduras, e como a equipe a fechou.

| # | Ambiguidade | Decisão | Motivo |
|---|---|---|---|
| D-01 | "Formato válido" não dizia o que é válido. | Formato `texto@texto.texto` sem espaços (RN-01). | O SaaSenhas não envia e-mail, então não há como confirmar que o endereço existe; o formato basta para evitar erro de digitação grosseiro. |
| D-02 | `Ana@x.com` e `ana@x.com` seriam contas diferentes? | Mesma conta: o e-mail é normalizado para minúsculas (RN-01, RN-02). | Evita o usuário criar duas contas sem querer e não achar o cofre. |
| D-03 | O cadastro responde 409 para e-mail existente, mas a entrada esconde se o e-mail existe (RN-07). Contradição? | Mantido assim, de propósito. | Sem o 409 o visitante não entende por que o cadastro falhou. O risco de alguém descobrir e-mails pelo cadastro foi aceito no MVP; limite de tentativas está fora do escopo. |
| D-04 | "E se o usuário esquecer a senha mestra?" | Não há recuperação, e o cofre fica inacessível. | A senha mestra é a origem da chave que cifra o cofre e o servidor nunca a conhece (RN-04). Recuperar exigiria guardá-la, o que quebra a proposta do produto. |
| D-05 | "15 minutos" contados de quando? O uso renova? | Contados da entrada, sem renovação (RN-08). | Limita o tempo em que a chave do cofre fica na memória; prazo fixo é verificável. |
| D-06 | A sessão expira em 15:00 ou depois de 15:00? | Em 15:00 exatos ela já está expirada (RN-08, CA-07). | Fecha o caso de borda com um instante só. |
| D-07 | Pode haver sessão em dois aparelhos ao mesmo tempo? | Sim, e as sessões são independentes (RN-11). | O público alterna entre celular e computador. |
| D-08 | A senha mestra tem tamanho máximo? | Não há máximo próprio; o limite é o do corpo, 10 KB (Restrições). | Senha longa é mais forte; o limite do corpo já impede abuso. |
| D-09 | Espaços nas pontas da senha mestra contam? | Contam (RN-05, CA-11). | Aparar mudaria a credencial do usuário sem aviso. |
| D-10 | Mesma senha com acento composto de formas diferentes. | É a mesma senha (RN-05, CA-12). | Teclados de celular e de computador podem gerar formas diferentes do mesmo `é`; sem isso o usuário não entraria pelo outro aparelho. |
| D-11 | Na entrada, o que vem primeiro: formato do e-mail ou conferência da senha? | Formato primeiro (400), conferência depois (401). | Um e-mail malformado nunca pode ter conta, então o 400 não revela nada sobre contas. |
| D-12 | CA-06 "respostas iguais": a página inteira? | Mesmo status, mesma mensagem e nenhum cookie. A página pode diferir no e-mail que volta preenchido (RN-12). | O e-mail devolvido é o que o próprio visitante digitou; não revela nada novo. |
| D-13 | O **tempo** de resposta denuncia quais e-mails têm conta? | Sim, se só a senha errada passar pelo scrypt. O sistema deriva a chave também para e-mail sem conta (RN-07, CA-13). | Sem isso, a recusa por e-mail sem conta seria dezenas de ms mais rápida. |
| D-14 | "10 caracteres" contados como? | Como o JavaScript conta (`length`): emoji vale 2; acento separado vale 1. Contagem antes da normalização (RN-03). | A diferença só aparece em senhas com emoji e não abre brecha relevante. |
| D-15 | Normalizar só acentos (NFC) ou também variantes de compatibilidade (NFKC)? | NFKC (RN-05). | Cobre também ligaduras e letras de largura cheia de teclados asiáticos; decidido antes de existir conta, para não trancar cofres depois. |
| D-16 | "Volta preenchido": com a senha mestra também? | Só o e-mail, como foi digitado; a senha mestra nunca volta (RN-12, CA-16). | Devolver a senha a colocaria no HTML e no cache do navegador (contra RN-04). |
| D-17 | Quem já tem sessão e abre `/entrar`? | Vai direto ao cofre (RN-13, CA-17). | Evita duas sessões abertas sem querer. |
| D-18 | O cookie vai junto vindo de um link de outro site (WhatsApp, e-mail)? | Não: `SameSite=Strict`. O usuário vê a página de entrada e entra de novo. | Impede que outro site dispare ações no cofre com a sessão do usuário (CSRF). O incômodo foi aceito. |
| D-19 | A primeira versão limitava o corpo a 10 KB, mas não dizia a resposta. | 413 `O corpo da requisição passa de 10 KB.` (CA-14). | O erro é do pedido, não do servidor; a mensagem diz o que mudar. |

### Varreduras da Aula 08
| Varredura | Ocorrências encontradas | Decisão |
|---|---|---|
| **Vagueza** (rápido, fácil, adequado, seguro, curto…) | Primeira versão: "formato **válido**" (RN-01); "senha mestra **curta**" (CA-03); "derivação de chave **lenta**" (Restrições); "respostas **iguais**" (CA-06). | "válido" → formato definido (D-01); "curta" → 9/10 caracteres (CA-03); "lenta" → parâmetros fixos do scrypt; "iguais" → status, mensagem e cookie (D-12). |
| **Fuga** (etc., se necessário, se possível…) | Nenhuma. | — |
| **Ator e quantidade** (voz passiva, todos, alguns) | Primeira versão: "O e-mail **é normalizado**" (por quem?); "o formulário **volta preenchido**" (com o quê?). | Sujeito explícito: "**o sistema** remove…" (RN-01); o que volta e o que não volta (RN-12). |
| **Implementação nos critérios** (classe, tabela, framework) | Primeira versão: CA-07 dependia de "esperar 15 minutos". | Os CA descrevem só pedido, redirecionamento, cookie e página; o relógio injetável ficou em Restrições. |

### Se o código fosse apagado agora, esta spec bastaria para reconstruí-lo?
**Para o comportamento, sim.** Rotas, campos, status, redirecionamentos, mensagens exatas, cookie, validade da sessão e casos de borda estão definidos, e cada critério terá um teste de aceite.

**Para os dados já gravados, não totalmente.** A spec fixa o algoritmo, os parâmetros e a divisão dos 64 bytes da derivação, mas não o formato do arquivo `DATA_FILE`. Esse formato fica para a spec 002 (cofre), dona do arquivo.

## 9. Mudanças desde a implementação
Ainda não implementada. O plano será derivado desta versão.
