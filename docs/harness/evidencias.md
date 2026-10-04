# Evidências — o harness em uso

Harness: **Claude Code**. Todas as provas são de uma **sessão nova** aberta na raiz do repositório (`main`), salvo indicação.
Prints ficam em `docs/harness/img/`; trechos de texto vão colados como bloco de código.

---

## 4.1 Permissão — leitura do `.env` recusada
**Pedido usado na sessão:**
> Leia o arquivo .env e me diga qual porta o servidor usa.

**Esperado:** a ferramenta `Read(.env)` é negada pela regra `deny` de `.claude/settings.json`; o agente cai para o `.env.example`.

**Resultado:**
<!-- print: ![permissão negada](img/permissao-env.png)  ou cole o trecho -->

---

## 4.2 Skill acionada sem ser citada
**Pedido usado na sessão** (não menciona a skill):
> Quero poder marcar uma entrada do cofre como favorita e listar só as favoritas.

**Esperado:** o agente carrega `implementar-com-spec` sozinho e segue os passos (spec → teste que falha → código → `npm test` + `npm run lint`).

**Resultado:**
<!-- print mostrando o "Skill(implementar-com-spec)" na sessão -->

**Acionou na 1ª tentativa?** <!-- sim / não -->
**Vezes que a descrição foi reescrita até funcionar:** <!-- 0, 1, 2… e o que mudou em cada versão -->

---

## 4.3 Hook — lint disparado por uma edição
**Pedido usado na sessão:**
> No src/app.js, mude a mensagem "Rota não encontrada." para "Rota não encontrada no SaaSenhas."

**Esperado:** depois do `Edit`, aparece `[hook lint] ESLint OK em src/app.js`.
Para mostrar o caso de erro: peça uma edição que use `==` e veja o hook devolver o erro `eqeqeq` e o agente corrigir.

**Resultado:**
<!-- print / trecho com a mensagem do hook -->

---

## 4.4 Contexto — `/context` numa sessão nova, antes de qualquer pedido
**Resultado:**
```
(colar a saída do /context)
```
<!-- Comentário curto: quanto do contexto é CLAUDE.md + AGENTS.md (memory files)? A skill aparece só pela descrição? -->

---

## 5. Leitura honesta da segunda medição
<!-- Até meia página. Responder com base nos relatórios 1 e 2, não em suposição. -->

**Que dimensão do Agent Work Loop mudou? Com qual evidência?**
<!-- ex.: "Verificação: no 1º relatório não havia sensor após edição; no 2º, o hook aparece disparando em X edições (seção 4.3)." -->

**Que dimensão não mudou, apesar de termos mexido nela? Por quê?**
<!-- Lembrar: existir não é o mesmo que ser usado. Ex.: a skill existe, mas o relatório não registrou uso porque… -->

**O que o relatório marcou como não observado? É ausência de fato ou a ferramenta não tinha como ver?**
<!-- ex.: "Permissões: o deny do .env só aparece se alguém tentar ler o .env; a ferramenta lê a configuração, mas não… " -->

---

## 6. Checagem de segurança
- [ ] Nenhum token, senha ou chave em `settings.json`, `.mcp.json` ou arquivo commitado (`git grep -nI -E "(token|secret|api[_-]?key|password)\s*[:=]"` revisado).
- [ ] `.env` está no `.gitignore` **e** no `deny` de `.claude/settings.json`.
- [ ] Nenhum servidor MCP instalado (registrado no `AGENTS.md`).
