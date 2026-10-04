---
name: implementar-com-spec
description: Use sempre que pedirem para criar, adicionar, alterar ou corrigir uma funcionalidade, rota, campo, regra ou validação do SaaSenhas (contas, sessões, cofre, entradas, gerador de senhas, força, senhas reutilizadas). Conduz o trabalho na ordem spec → teste que falha → código mínimo → prova com npm test e npm run lint. Não use para dúvidas, leitura de código ou mudanças só de documentação.
---

# Implementar com spec — SaaSenhas

Siga os passos **na ordem**. Não pule para o código.

1. **Ache a spec.** Procure em `docs/specs/` a spec que cobre o pedido. Se não existir, crie `docs/specs/NNN-nome.md` (próximo número) com: objetivo, regras, API e critérios de aceite como checklist.
2. **Pare se houver dúvida.** Se o pedido for ambíguo ou a spec for nova, mostre a spec ao usuário em até 10 linhas e espere o "ok" antes de seguir.
3. **Escreva o teste primeiro.** Adicione o caso em `test/<módulo>.test.js` (regra de negócio) e, se mudar rota, em `test/api.test.js`. Rode `npm test` e confirme que o teste novo **falha pelo motivo certo**.
4. **Implemente o mínimo.** Altere só os arquivos de `src/` necessários, no estilo existente (camelCase em inglês no código, campos em português na API, mapeados em `src/app.js`).
5. **Checklist de segurança** — confirme cada item:
   - senha de entrada só é gravada via `encrypt()`;
   - senha mestra e chave nunca aparecem em log, resposta ou arquivo;
   - listagens não devolvem senha;
   - nada lido de `.env` ou `data/`.
6. **Rode as verificações.** `npm test` e `npm run lint`. Se algo falhar, corrija e rode de novo — sem desativar teste ou regra de lint.
7. **Atualize a spec.** Marque os critérios de aceite atendidos e ajuste a tabela de API se mudou.
8. **Prova e parada.** Termine a resposta com:
   - a linha `# pass N` / `# fail 0` do `npm test` e a saída do `npm run lint`;
   - a lista de arquivos alterados;
   - qual critério de aceite cada teste novo cobre.

   Se `npm test` ou `npm run lint` não passaram, **não diga que está pronto**: diga o que falhou e pare.
