---
name: implementar-com-spec
description: Use sempre que pedirem para criar, adicionar, alterar ou corrigir uma funcionalidade, página, formulário, rota, campo, regra ou validação do SaaSenhas (contas, entrada e saída, sessões, cofre, entradas, favoritas, gerador de senhas, força, senhas reutilizadas). Conduz o trabalho na ordem spec → teste que falha → código mínimo → prova com npm test e npm run lint. Não use para dúvidas, leitura de código ou mudanças só de documentação.
---

# Implementar com spec — SaaSenhas

Siga os passos **na ordem**. Não pule para o código.

1. **Ache a spec.** Procure em `docs/specs/` a spec que cobre o pedido. Se não existir, crie `docs/specs/NNN-nome.md` (próximo número) com objetivo, regras, páginas/rotas e critérios de aceite numerados (CA-xx) no formato **Dado / Quando / Então**, como em `001-contas-e-sessoes.md`.
2. **Pare se houver dúvida.** Se o pedido for ambíguo ou a spec for nova, mostre a spec ao usuário em até 10 linhas e espere o "ok" antes de seguir.
3. **Escreva o teste primeiro.** Cada CA-xx vira um teste com o nome começando por `CA-xx`, no arquivo de aceite da spec (`test/spec-NNN-*.test.js`). Regras internas vão em `test/<módulo>.test.js`. Rode `npm test` e confirme que o teste novo **falha pelo motivo certo**.
4. **Implemente o mínimo.** Altere só os arquivos de `src/`, `views/` e `public/` necessários, no estilo existente (camelCase em inglês no código; campos de formulário, rotas e mensagens em português).
5. **Checklist de segurança** — confirme cada item:
   - senha de entrada só é gravada via `encrypt()`;
   - senha mestra e chave nunca aparecem em log, página, cookie, URL ou arquivo;
   - listagens não mostram senha;
   - toda saída nas views usa `<%= %>` (escapada), nunca `<%-` com dado do usuário;
   - nada lido de `.env` ou `data/`.
6. **Rode as verificações.** `npm test` e `npm run lint`. Se algo falhar, corrija e rode de novo — sem desativar teste ou regra de lint.
7. **Atualize a spec.** Ajuste a tabela de páginas se mudou, registre cada ambiguidade fechada como decisão D-xx e diga na seção "Mudanças desde a implementação" o que mudou e o que não mudou.
8. **Prova e parada.** Termine a resposta com:
   - a linha `# pass N` / `# fail 0` do `npm test` e a saída do `npm run lint`;
   - a lista de arquivos alterados;
   - qual critério de aceite cada teste novo cobre.

   Se `npm test` ou `npm run lint` não passaram, **não diga que está pronto**: diga o que falhou e pare.
