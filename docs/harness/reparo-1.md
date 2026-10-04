# Achado escolhido e reparo (Aula 08 — LAB 3)

## Achado escolhido
> **Senhas salvas perdem espaços do início e do fim sem aviso** — prioridade Média.
> Fato: `requireText` devolve `value.trim()` (`src/vault/vault-service.js`) e é usado para a senha ao criar e ao editar uma entrada. […] A spec 002 só diz "senha é obrigatória (até 512)" e não fala de aparar espaços, e todos os critérios de aceite dela estão marcados.
> Saída esperada: a spec 002 diz se a senha mantém os espaços das pontas, e um teste do vault-service prova que uma senha com espaços volta de acordo com essa regra.

## Por que este
Num gerenciador de senhas, devolver uma senha diferente da salva é o pior defeito possível: o usuário perde o acesso à conta sem saber por quê. Além disso, o achado mostra uma falha de **Task Understanding**: a spec não definia a regra, então nenhum agente trabalhando a partir dela saberia que aquilo era bug. Os outros achados de prioridade Média (`.env` sem `deny`) já seriam resolvidos pela configuração da Aula 09.

## Reparo aplicado
- **Teste primeiro:** `test/vault-service.test.js` ganhou "guarda a senha exatamente como digitada, com espaços nas pontas". Antes da correção ele falhou: `expected: '  com espaços  '`, `actual: 'com espaços'`.
- **Código:** `src/vault/vault-service.js` — a senha passa por `requirePassword` (não vazia, até 512, **sem** `trim`) ao criar e ao editar. `site` e `usuario` continuam aparados.
- **Spec:** `docs/specs/002-cofre-de-senhas.md` passou a dizer que a senha é guardada exatamente como digitada, com novo critério de aceite.
- **Verificação:** `npm test` → `# pass 29`, `# fail 0`; `npm run lint` → sem erros.

- **Commit do reparo:** `4666270` — https://github.com/PedroV1tor/saasenhas/commit/4666270

> Observação de ordem: o reparo foi commitado depois do commit da configuração da Aula 09 porque o relatório só pôde ser gerado depois (o plugin precisou de dependências instaladas). A medição "antes" continua sendo a tag `aula08`, que não tem nem o reparo nem a configuração.

## Como verificar
No 2º relatório, o achado de senha aparada não deve reaparecer, e a dimensão **Task Understanding** deve citar a regra da senha na spec 002.
