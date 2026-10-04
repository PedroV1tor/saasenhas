# Better Harness Task-Loop Report

## At a Glance

- Loop Effectiveness: 51/100 (changes only after comparable later task outcomes)
- Asset Health / Repair Progress: 0/100 (0 verified, 0 partial, 6 pending)
- Demonstrated autonomy radius: not observed (not observed; not observed confidence)
- Strongest loop: Not enough evidence difference to name one.
- Largest observed leak: Use the priority moves; no single loop is uniquely weakest.
- Top expected gain: No priority benefit is available in this evidence boundary.

## What You Can Rely On Today

- No reliable user outcome has been demonstrated in this evidence boundary yet.

## What You Gain Next

- No priority Harness move is available in this evidence boundary.



### Why these moves matter

### Nada impede um agente de ler o .env ou o cofre em data/
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fato: o AGENTS.md diz que 'nunca leia, imprima nem commite .env ou data/' é inegociável. Existe um .env real na pasta do projeto, e data/ guarda o cofre cifrado dos usuários, com site e usuário em texto puro. Fato: não existe pasta .claude/. O .gitignore diz que a configuração do Claude Code do time fica em .claude/settings.json, e o docs/harness/README.md lista ali as permissões (allow / ask / deny) como artefato planejado. Nenhum hook está configurado. O .gitignore só protege contra commit. Inferência: no Claude Code, a proibição de leitura depende só de o modelo obedecer ao texto. Incerteza: configurações do Claude no nível do usuário ou gerenciadas ficaram fora do escopo autorizado e podem ter regras de bloqueio. Nenhuma leitura real de .env ou data/ foi observada.
- Expected Output:
  1. Um .claude/settings.json commitado cujas regras deny bloqueiam a leitura de .env e data/, com o .env.example ainda legível, confirmado por uma tentativa de leitura negada numa sessão nova.

### Senhas salvas perdem espaços do início e do fim sem aviso
- Priority: Medium · Evidence: not observed in this boundary
- Reason: Fato: requireText devolve value.trim() (src/vault/vault-service.js) e é usado para a senha ao criar e ao editar uma entrada. Um teste em execução salvou uma senha com espaços nas pontas e recebeu ela de volta sem os espaços. Fato: a spec 002 só diz 'senha é obrigatória (até 512)' e não fala de aparar espaços, e todos os critérios de aceite dela estão marcados. Inferência: a spec não define essa regra, então um agente que trabalha a partir da spec não consegue saber se é bug ou intenção, e o usuário pode receber de volta uma senha diferente sem perceber. Incerteza: não se sabe se aparar é intencional. O AGENTS.md manda perguntar ao usuário quando o pedido tem duas leituras.
- Expected Output:
  1. A spec 002 diz se a senha mantém os espaços das pontas, e um teste do vault-service prova que uma senha com espaços volta de acordo com essa regra.

### Um vazamento de senha pela rota de reutilização passaria em todos os testes
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fato: o AGENTS.md diz que as respostas de reutilização nunca contêm senhas. A spec 002 diz o mesmo para GET /api/entradas/reutilizadas, e esse critério de aceite está marcado. Fato: a rota passa as entradas por toApi (src/app.js), que inclui senha sempre que existe um campo de senha. O test/api.test.js só confere quantidade nessa rota, e a checagem de 'sem senha' só existe na camada de serviço. Inferência: uma mudança na rota ou em findReused que vaze a senha não faria o npm test falhar. Incerteza: é uma leitura estática da cobertura, e nenhum teste de mutação foi rodado. Hoje não há vazamento.
- Expected Output:
  1. Testes de API que falham se qualquer resposta de listagem, criação, edição ou reutilização expuser a senha.

### Mudanças podem chegar ao GitHub sem testes nem lint rodarem
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fato: a regra 4 do AGENTS.md exige que npm test e npm run lint passem, com a saída mostrada, antes de dizer 'pronto'. Fato: o repositório tem um remote origin no GitHub, mas não tem .github/workflows, hook de git nem hook do Claude Code. O hook PostToolUse de lint ao editar, citado no docs/harness/README.md, não existe. Inferência: a única prova de que uma mudança foi validada é a mensagem do próprio agente. Incerteza: a proteção de branch e qualquer CI externo no GitHub não foram verificados, e nenhuma validação pulada foi observada.
- Expected Output:
  1. Um workflow que roda os scripts de teste e lint existentes a cada revisão enviada, para que o aceite não dependa só do relato do agente.

### A documentação aponta para arquivos de agente que não existem
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fato: o README.md aponta para CLAUDE.md como instruções para agentes. O docs/harness/README.md aponta para CLAUDE.md, .claude/settings.json, .claude/skills/implementar-com-spec/SKILL.md, scripts/hooks/lint-on-edit.mjs, relatorio-2.md e evidencias.md. Nenhum deles aparece no git ls-files. Inferência: um agente que segue essa documentação pode perder tempo procurando os arquivos ou achar que as permissões e o hook de lint estão ativos. Incerteza: o README do harness descreve um roteiro planejado do curso (Aula 09), então esses arquivos podem ser trabalho futuro de propósito. Só não estão marcados como planejados.
- Expected Output:
  1. Documentação de entrada cujos links relativos funcionam, ou que marca claramente como planejados os arquivos de agente ainda não criados.

### Ainda não há sessões de código no Claude Code para aprender com elas
- Priority: Low · Evidence: not observed in this boundary
- Reason: Fato: a janela de 30 dias do Claude tem uma única sessão elegível, que é esta revisão, com 0 edições, 0 verificações e 0 resultados. Inferência: não dá para saber se os agentes seguem as regras de spec primeiro e de teste + lint, se repetem trabalho ou se esbarram em atritos, então nenhum procedimento repetido pode ser levado a um dono durável. Incerteza: sessões de outros provedores, da pasta do usuário e de janelas anteriores não foram autorizadas nem observadas. docs/harness/relatorio-1.md e reparo-1.md são modelos vazios.
- Expected Output:
  1. Primeiro relatório e registro de reparo preenchidos, mais uma janela de revisão posterior com pelo menos dois episódios de código comparáveis.

## Five Lifecycle Dimensions

| Dimension | What the evidence proves | Evidence boundary | Summary | Boundary / blocker |
| --- | --- | --- | --- | --- |
| Task Understanding | Not observed yet | not observed in this boundary | O AGENTS.md foi carregado nesta sessão do Claude Code e aponta para specs numeradas com critérios de aceite. A spec 002 não diz se senhas devem ser aparadas, e hoje elas são aparadas sem aviso. O README e a documentação do harness apontam para arquivos de agente que não existem. | not observed |
| Controlled Execution | Not observed yet | not observed in this boundary | Os comandos de instalar, configurar, testar e lint estão documentados, e testes e lint rodaram sem erro. A regra de não ler .env nem data/ não tem nenhuma permissão no projeto, embora o .gitignore cite .claude/settings.json como a configuração do time. | not observed |
| Change Validation | Not observed yet | not observed in this boundary | 28 testes node:test e o ESLint passam em cerca de 1,5 s e cobrem as regras centrais de cripto, sessão e cofre. A regra de que a resposta de reutilização nunca traz senha não tem teste de rota que pegaria um vazamento. | not observed |
| Reliable Delivery | Not observed yet | not observed in this boundary | O repositório tem um remote no GitHub, mas não tem workflow de CI nem hook. A regra 'teste + lint antes de pronto' depende do relato do próprio agente. A revisão e a proteção de branch no GitHub não foram verificadas. | not observed |
| Learning Capture | Not observed yet | not observed in this boundary | A janela só tem esta sessão de revisão, então ainda não dá para avaliar trabalho repetido, correções nem resultados. docs/harness/ tem modelos vazios de relatório e reparo prontos para registrar isso. | not observed |

## The 15 Small Checks

| Dimension | Small check | What the evidence proves | Evidence boundary |
| --- | --- | --- | --- |


## Evidence and Boundaries

- Episode coverage: 0 episodes, 0 edited, 0 closed, 0 repaired-and-passed
- Model: agent-work-loop-v4
- Session selection: all-eligible; 1 sessions analyzed of 1 eligible sessions; High confidence
- Delivery grades observed: not observed
- Source gaps: not observed
- Learning comparison: Needs a comparison; 0 declared intervention(s)
