# Diário do agente — feature 001 (Contas e sessões)

**Sessões:** 03 a 08/10/2026 · Claude Code (Opus 5.5) · conduzidas por Pedro Vitor; revisão de plano e commits por João Victor Fiuza e Isabella Nascimento; clone limpo por Rogger Martins
**Plano:** [`001-plano.md`](../specs/001-plano.md) · **Spec:** [`001-contas-e-sessoes.md`](../specs/001-contas-e-sessoes.md) (seção 9 = o que mudou)

## Nível do slider de autonomia
**Intermediário: o agente executa, a equipe aprova os portões.** O agente propôs o plano só a partir da spec, sem código; a equipe revisou e mudou duas tarefas antes do T2. Daí em diante ele escreveu testes, código e rodou `npm test`/`npm run lint` sozinho, mas cada `git commit` passou por confirmação (`ask`), e mudança de comportamento só entrou depois de a spec mudar.
**Por quê:** a feature decide o que a página revela sobre as contas e onde a senha mestra pode aparecer. Um erro ali não aparece num teste de status HTTP; quisemos ler cada commit.

## Uma vez em que o agente errou, e o que pegou o erro
- **Revisão humana (o principal):** no T6 o agente implementou "Sair" como link `GET /sair`, **exatamente como a spec dizia**. Isabella barrou na revisão do commit: um GET que muda estado pode ser disparado por pré-carregamento de links. O erro era da spec, e o agente não o questionou. Virou D-20, a spec mudou primeiro (`e038c99`) e depois o código (`e214bf4`).
- **Lint:** no T6 o agente desestruturou `maxAge: _maxAge` para descartar o campo; o ESLint acusou `no-unused-vars` (o padrão `^_` só vale para argumentos). Corrigido antes do commit `71fe19e`.
- **Teste (travamento):** o hook novo se chamava `test-before-commit.mjs`; o `node --test` o tratou como arquivo de teste e a suíte travou esperando stdin. Pego ao testar o hook à mão (timeout). Renomeado para `gate-before-commit.mjs` e a regra foi para o `CLAUDE.md`.
- **Nenhum mecanismo (o próprio agente percebeu):** no clone limpo do T2, subiu o servidor com `PORT=3999` e consultou a porta 3000. Viu no log e refez com `npm start`, como manda o AGENTS.md.

## Uma vez em que o agente perguntou antes de assumir
No T3, o agente parou: *"O CA-04 cobre cadastro **e** entrada, mas o `POST /entrar` só nasce no T4. (A) adianto o `POST /entrar` para o T3 ou (B) divido o CA-04 entre T3 e T4, ampliando o teste sem trocá-lo?"* Escolhemos B, registrado no plano.
**Onde deveria ter perguntado e não perguntou:** no T6c, aplicou `Cache-Control: no-store` a **todas** as respostas, inclusive o CSS. A spec pedia "toda página"; incluir arquivos estáticos foi escolha dele, sem dizer.

## Critérios de aceite
CA-01 a CA-18: todos com um teste em `test/spec-001-contas-e-sessoes.test.js`, passando (29 testes no total, lint limpo). Nenhum teste foi apagado, desativado ou afrouxado. CA-13, CA-15, CA-08 (POST) e CA-18 foram vistos **falhando** antes do código. O CA-16 já passou ao ser escrito: o formulário seguia a RN-12 desde o T3.

## O que mudamos no harness depois desta feature
- **Já mudado** (achados do [2º relatório](relatorio-2.md)):
  - `deny` de leitura e escrita em `data/` e variantes de `.env`; `.gitignore` com `.env.*` → [`a5eae0b`](https://github.com/PedroV1tor/saasenhas/commit/a5eae0b)
  - `no-console` como `error`: o hook barra um `console.log(senhaMestra)` → [`65d0d2e`](https://github.com/PedroV1tor/saasenhas/commit/65d0d2e)
  - hook `PreToolUse` que roda testes e lint antes de `git commit` → [`f2a75e7`](https://github.com/PedroV1tor/saasenhas/commit/f2a75e7)
  - `CLAUDE.md`: commits sem coautoria do Claude e nomes de script proibidos; `AGENTS.md`: `copy` no cmd → [`d915fcd`](https://github.com/PedroV1tor/saasenhas/commit/d915fcd)
- **A fazer:** a skill deveria pedir ao agente que **questione** a spec quando ela manda algo arriscado (o caso do `GET /sair`), não só que a siga. E um workflow de CI no GitHub, porque o hook só protege quem usa o Claude Code.
- **Decidido não mudar:** o hook de lint continua bloqueando entre duas edições da mesma mudança. O alarme falso custa uma volta; avisar sem bloquear deixaria passar o caso real do `_maxAge`.
