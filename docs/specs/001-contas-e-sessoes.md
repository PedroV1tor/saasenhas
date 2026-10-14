# 001 — Contas e sessões

> Primeira feature do SaaSenhas. Sem conta e sem sessão, o cofre (spec 002) não existe.

## 1. Objetivo
Permitir que o estudante crie uma conta com e-mail e senha mestra pelo site e abra o próprio cofre por uma sessão de 15 minutos, sem que o SaaSenhas guarde ou mostre a senha mestra em momento nenhum.

## 2. Escopo
**Entra:**
- Página de cadastro de conta com e-mail e senha mestra.
- Página de entrada (abrir o cofre) com e-mail e senha mestra.
- Link "Sair", que encerra a sessão.
- Bloqueio da página do cofre (`/cofre` e sub-rotas) para quem não tem sessão válida.

**Não entra:**
- Recuperação ou troca da senha mestra.
- Exclusão de conta e troca de e-mail.
- Confirmação de e-mail.
- Limite de tentativas de login, bloqueio de conta ou CAPTCHA.
- Login social e autenticação em dois fatores.
- O conteúdo do cofre (spec 002).

## 3. Atores
| Ator | O que faz nesta feature |
|---|---|
| **Visitante** | Pessoa sem sessão. Cadastra conta e entra. |
| **Usuário** | Pessoa com sessão válida. Abre o cofre e sai. |
| **Sistema SaaSenhas** | Valida os dados, guarda a conta, emite e expira sessões. |

## 4. Dados
**Conta:** e-mail, sal e verificador derivado da senha mestra. A senha mestra não é guardada.

**Sessão** (só na memória do servidor): credencial, e-mail, chave do cofre e instante em que expira.

**Páginas:**
| Método e rota | O que faz | Respostas |
|---|---|---|
| `GET /cadastro` | formulário de cadastro | 200 |
| `POST /cadastro` | cria a conta | redireciona para `/entrar` · formulário com erro |
| `GET /entrar` | formulário de entrada | 200 |
| `POST /entrar` | abre a sessão | redireciona para `/cofre` · formulário com erro |
| `GET /sair` | encerra a sessão | redireciona para `/entrar` |
| `GET /cofre` | página do cofre | 200 · redireciona para `/entrar` |

## 5. Regras de negócio
- **RN-01 — E-mail.** O e-mail é normalizado e precisa ter formato válido. Senão: `Informe um e-mail válido.`
- **RN-02 — Uma conta por e-mail.** Cadastro com e-mail já usado → 409 `Já existe uma conta com esse e-mail.`
- **RN-03 — Tamanho da senha mestra.** No mínimo 10 caracteres. Senão: `A senha mestra precisa ter pelo menos 10 caracteres.`
- **RN-04 — Senha mestra nunca sai nem fica.** O sistema não grava a senha mestra em arquivo nem em log e não a mostra em nenhuma página.
- **RN-05 — Senha mestra literal.** O sistema não remove espaços da senha mestra.
- **RN-06 — Entrada correta.** E-mail cadastrado + senha mestra que confere → o usuário vai para o cofre.
- **RN-07 — Recusa sem pista.** E-mail sem conta, senha mestra errada ou ausente → 401 com a mesma mensagem `E-mail ou senha mestra inválidos.`
- **RN-08 — Validade da sessão.** A sessão vale 15 minutos.
- **RN-09 — Sair.** O link "Sair" encerra a sessão na hora.
- **RN-10 — Acesso ao cofre.** Sem sessão válida, o visitante é levado à página de entrada com o aviso `Faça login para acessar o cofre.`
- **RN-11 — Sessões simultâneas.** Uma conta pode ter mais de uma sessão aberta.
- **RN-12 — Formulário com erro.** Quando o cadastro ou a entrada falha, o formulário volta preenchido e mostra a mensagem.

## 6. Critérios de aceite
- **CA-01** — **Dado** que não existe conta para `ana@exemplo.com`, **quando** o visitante se cadastra com `  Ana@Exemplo.COM ` e a senha mestra `0123456789`, **então** é levado à página de entrada com o aviso `Conta criada. Entre com sua senha mestra.`
- **CA-02** — **Dado** que existe conta para `bruno@exemplo.com`, **quando** o visitante se cadastra com `BRUNO@exemplo.com`, **então** recebe 409 `Já existe uma conta com esse e-mail.`
- **CA-03** — **Dado** um e-mail sem conta, **quando** o visitante se cadastra com uma senha mestra curta, **então** recebe 400.
- **CA-04** — **Dado** um e-mail inválido, **quando** o visitante tenta se cadastrar ou entrar, **então** recebe 400 `Informe um e-mail válido.`
- **CA-05** — **Dado** que existe conta para `davi@exemplo.com`, **quando** o visitante entra com a senha certa, **então** vai para o cofre.
- **CA-06** — **Dado** que existe conta para `elisa@exemplo.com`, **quando** o visitante entra com senha errada, com e-mail sem conta ou sem senha, **então** as três respostas são iguais.
- **CA-07** — **Dado** um usuário que entrou, **quando** passam 15 minutos, **então** ele precisa entrar de novo.
- **CA-08** — **Dado** um usuário com sessão, **quando** ele clica em "Sair", **então** não consegue mais abrir o cofre com aquela sessão.
- **CA-09** — **Dado** um usuário com duas sessões, **quando** sai de uma, **então** a outra continua valendo.
- **CA-10** — **Dado** um visitante sem sessão, **quando** abre `/cofre`, **então** vai para a página de entrada com o aviso `Faça login para acessar o cofre.`

## 7. Restrições
- A senha mestra passa por derivação de chave lenta (scrypt) antes de ser comparada.
- A credencial da sessão fica num cookie.
- Node.js 20, Express, páginas geradas no servidor. Sem banco de dados: as contas ficam num arquivo JSON.
- O corpo de cada requisição tem no máximo 10 KB.

## 8. Decisões
| # | Ambiguidade | Decisão | Motivo |
|---|---|---|---|
| D-01 | "E se o usuário esquecer a senha mestra?" | Não há recuperação. | A senha mestra é a origem da chave do cofre e o servidor nunca a conhece. |
