# Diário do agente — feature 002 (Cofre de senhas) por TDD

**Sessão:** 25/10/2026 · Claude Code, conduzido por Pedro Vitor · **Spec:** [`002-cofre-de-senhas.md`](../specs/002-cofre-de-senhas.md) (seção 9 = o que mudou)
**Ponto de partida:** a 002 já existia, mas nasceu num commit só, com teste e código juntos ([`918bbba`](https://github.com/PedroV1tor/saasenhas/commit/918bbba)). Como teste que nasce verde não conta, retiramos código e testes ([`2e27d76`](https://github.com/PedroV1tor/saasenhas/commit/2e27d76)) e refizemos a 002 um CA por vez, na ordem CA-09, 06, 01, 02, 03, 04, 05, 08 e 07. A 004 (favoritas) depende da 002: saiu junto e voltou no fim ([`b285346`](https://github.com/PedroV1tor/saasenhas/commit/b285346)).

| CA | Vermelho | Verde | | CA | Vermelho | Verde |
|---|---|---|---|---|---|---|
| CA-01 | [`1d0a344`](https://github.com/PedroV1tor/saasenhas/commit/1d0a344) | [`6188a1e`](https://github.com/PedroV1tor/saasenhas/commit/6188a1e) | | CA-06 | [`2b45751`](https://github.com/PedroV1tor/saasenhas/commit/2b45751) | [`7050e7a`](https://github.com/PedroV1tor/saasenhas/commit/7050e7a) |
| CA-02 | [`482231a`](https://github.com/PedroV1tor/saasenhas/commit/482231a) | [`9ff8301`](https://github.com/PedroV1tor/saasenhas/commit/9ff8301) | | CA-07 | [`fd0264a`](https://github.com/PedroV1tor/saasenhas/commit/fd0264a) | [`ab2f5b4`](https://github.com/PedroV1tor/saasenhas/commit/ab2f5b4) |
| CA-03 | [`ffce3fc`](https://github.com/PedroV1tor/saasenhas/commit/ffce3fc) | [`514e7d2`](https://github.com/PedroV1tor/saasenhas/commit/514e7d2) | | CA-08 | [`8b0cf39`](https://github.com/PedroV1tor/saasenhas/commit/8b0cf39) | [`0e10598`](https://github.com/PedroV1tor/saasenhas/commit/0e10598) |
| CA-04 | [`460cf48`](https://github.com/PedroV1tor/saasenhas/commit/460cf48) | [`e6f63c2`](https://github.com/PedroV1tor/saasenhas/commit/e6f63c2) | | CA-09 | [`ccfc4d9`](https://github.com/PedroV1tor/saasenhas/commit/ccfc4d9) | [`1fcbc43`](https://github.com/PedroV1tor/saasenhas/commit/1fcbc43) |
| CA-05 | [`76a2723`](https://github.com/PedroV1tor/saasenhas/commit/76a2723) | [`db542ac`](https://github.com/PedroV1tor/saasenhas/commit/db542ac) | | D-06 | [`8ca5091`](https://github.com/PedroV1tor/saasenhas/commit/8ca5091) | [`e8bb4e9`](https://github.com/PedroV1tor/saasenhas/commit/e8bb4e9) |

Conferido rodando a suíte em cada um desses commits: cada vermelho falha só nos testes novos, e o verde seguinte passa tudo (44 → 65 testes).

## Um critério em que o vermelho revelou uma ambiguidade da spec
**CA-01:** "a lista mostra `github.com` e `ana`". Ao escrever o vermelho, o agente notou que `html.includes('ana')` já seria verdade sem a coluna de usuário, porque o título da página é "Cofre de **ana**@exemplo.com". A dúvida era se "a lista" significava a página ou a tabela. Escolhemos a tabela: isso virou a D-05 na spec ([`e4ccee9`](https://github.com/PedroV1tor/saasenhas/commit/e4ccee9)) **antes** do commit do vermelho, e o teste passou a olhar só o `<tbody>`. Depois do verde, apagamos a coluna de usuário de propósito e o teste ficou vermelho, como devia. No **CA-08**, o vermelho também achou um bug: a conta intrusa nunca tinha criado entrada, e o `entries.find` quebrava com 500 antes de chegar ao 404.

## O agente tentou "otimizar para o verde"?
Nesta sessão, nenhum teste foi apagado, pulado ou afrouxado para passar. Quando o CA-08 continuou em 500 depois do primeiro verde, a correção foi no código (`user.entries ?? []`), não no teste. O caso real está na primeira versão: a seção 9 antiga dizia que o teste do CA-07 "falhou… ajustado antes do commit". Como teste e código entraram juntos, não havia como provar que o ajuste não moldou o teste ao código. Foi isso que nos fez refazer a 002. Agora o hook barra mecanicamente um commit do vermelho em que nenhum teste falha.

## Uma refatoração que um teste verde permitiu
[`339685e`](https://github.com/PedroV1tor/saasenhas/commit/339685e): `data.users[email]` e o `?? []` das entradas se repetiam em cinco funções do serviço e foram concentrados em `findUser`. A suíte estava com 58 testes verdes antes e depois, e nenhum ficou vermelho no caminho. Ao comparar com a versão antiga, vimos que o `findUser` original também respondia **401** para uma conta que sumiu do arquivo com a sessão aberta. Pôr isso de volta na refatoração seria mudar comportamento escondido numa refatoração. Por isso o caso seguiu o ciclo completo: spec D-06 ([`f8b86e6`](https://github.com/PedroV1tor/saasenhas/commit/f8b86e6)), vermelho e verde. **Lição:** código mínimo guiado por teste não traz de volta o que nenhum teste pedia.

## O que mudou no harness por causa desta feature
- **Hook de commit** ([`086e7e6`](https://github.com/PedroV1tor/saasenhas/commit/086e7e6)): o gate antigo bloqueava qualquer commit com teste falhando, e o commit do vermelho seria impossível. Agora uma mensagem `test(...)` com só `test/` e `test-support/` no stage passa com teste falhando. O mesmo commit é **barrado** se todos os testes passarem (teste que nasceu verde). O lint continua obrigatório.
- **Skill `implementar-com-spec` e `CLAUDE.md`** (mesmo commit): um CA por vez, commit do vermelho, commit do verde sem tocar no teste e refatoração em commit separado. `git add` e `git commit` vão em passos separados, porque o hook lê o stage.
- **Achado ao usar:** o hook dispara com qualquer comando que contenha o texto `git commit`, até num `echo` usado para testar o próprio hook, que foi bloqueado. Custou uma volta e deixamos assim: um falso alarme é melhor que um commit sem checagem.
- **A fazer:** CI no GitHub rodando `npm test` (o hook só protege quem usa o Claude Code) e um script que confira o par vermelho → verde de cada CA no histórico, como fizemos à mão aqui.
