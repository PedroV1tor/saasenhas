# Revisão cruzada da spec 001 — Contas e sessões

- **Spec revisada:** [`001-contas-e-sessoes.md`](001-contas-e-sessoes.md), primeira versão (commit `66c0774`)
- **Equipe revisora:** RotaCerta — micro-SaaS de caronas entre estudantes
- **Integrantes da equipe revisora:** Larissa Mendes, Caio Henrique Souza, Bruna Teles
- **Data:** 26/09/2026, na oficina da Aula 07

> Preenchido **pela outra equipe**, com as palavras dela. A equipe SaaSenhas só registra, em "O que fizemos com isso", o que fez com cada resposta.

## Respostas às três perguntas da oficina (Aula 07)

### Pergunta 1 — "Se vocês entregassem esta spec para outra equipe implementar, qual regra ela implementaria diferente de vocês?"
**Resposta da equipe revisora:**
A RN-08. Ela diz "a sessão vale 15 minutos", mas não diz se o tempo conta do login ou do último clique. Na nossa equipe metade leu como "15 minutos parado" (como no banco) e metade como "15 minutos fixos". Também não está dito o que acontece no minuto 15 exato. A RN-01 tem o mesmo problema: "formato válido" pode ser qualquer regex — a gente aceitaria `ana@exemplo` e vocês talvez não.

**O que fizemos com isso:** RN-08 reescrita — 15 minutos contados do login, sem renovação pelo uso, e no instante 15:00 a sessão já está expirada (D-05, D-06, CA-07 com 10 min, 15 min − 1 ms e 15 min). RN-01 passou a definir o formato `texto@texto.texto` sem espaços e o que "normalizar" significa (D-01, D-02, CA-04 com os casos `ana`, `ana@exemplo`, `ana @exemplo.com`).

### Pergunta 2 — "Qual critério de aceite vocês não conseguiriam transformar num teste automático do jeito que está escrito?"
**Resposta da equipe revisora:**
O CA-03 ("senha mestra **curta**": curta quanto?), o CA-06 ("as três respostas são **iguais**": a página inteira? Se o e-mail volta preenchido no formulário, a página nunca vai ser igual) e o CA-07 (não dá para esperar 15 minutos num teste). O CA-05 diz "vai para o cofre", mas não diz como o teste sabe que foi: um redirecionamento? A página do cofre direto?

**O que fizemos com isso:** CA-03 com o caso de borda 9/10 caracteres. CA-06 agora compara status e mensagem, não a página inteira (D-12). CA-07 usa o relógio controlado pelo teste (o código de sessão recebe a função `now`, ver Restrições). CA-05 diz o redirecionamento 303 para `/cofre`, o cookie e o 200 da página do cofre mostrando o e-mail.

### Pergunta 3 — "O que o usuário pode fazer na tela que a spec não diz o que acontece?"
**Resposta da equipe revisora:**
1. Errar a senha: a RN-12 diz que o formulário "volta preenchido" — com a senha mestra também? Isso parece contradizer a RN-04.
2. Abrir `/entrar` já estando logado.
3. Colar espaço no começo da senha mestra pelo celular, ou digitar `é` em teclados diferentes. A RN-05 fala só de espaço.
4. Abrir o SaaSenhas por um link mandado no WhatsApp: o cookie vai junto?

**O que fizemos com isso:**
1. RN-12 reescrita: o e-mail volta como foi digitado, a senha mestra **nunca** volta (D-16, CA-16).
2. Nova RN-13: com sessão válida, `/entrar` e `/cadastro` levam direto ao cofre (D-17, CA-17).
3. RN-05 ampliada: espaços contam, e formas diferentes do mesmo caractere são a mesma senha (normalização NFKC, D-09, D-10, D-15, CA-11, CA-12).
4. Cookie `SameSite=Strict`: vindo de outro site, o cookie não vai junto e o usuário vê a página de entrada. Aceito de propósito (D-18).

## Ambiguidades levantadas pela revisão
| Trecho da spec (versão 1) | Dúvida da equipe revisora | Decisão (D-xx na spec) |
|---|---|---|
| RN-08 "a sessão vale 15 minutos" | Conta do login ou do último uso? E no minuto 15 exato? | D-05, D-06 |
| RN-01 "formato válido" | Qual formato? `ana@exemplo` passa? | D-01, D-02 |
| CA-03 "senha mestra curta" | Curta quanto? | CA-03 com 9/10 |
| CA-06 "respostas iguais" | Iguais em quê, se o e-mail volta no formulário? | D-12 |
| RN-12 "volta preenchido" | Com a senha mestra também? | D-16 |
| — (não previsto) | E quem já está logado e abre `/entrar`? | D-17 |
| RN-05 "não remove espaços" | E `é` digitado em teclados diferentes? | D-10, D-15 |
| Restrições "cookie" | O cookie vai junto vindo de outro site? | D-18 |
| RN-07 "mesma mensagem" | O **tempo** de resposta também denuncia quem tem conta? | D-13 (nova parte da RN-07, CA-13) |
