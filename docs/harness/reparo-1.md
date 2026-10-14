# Achado escolhido e reparo (Aula 08 — LAB 3)

## Achado escolhido
> **O comando "Configurar" do AGENTS.md cria um `.env` que nada impede de ser commitado** — prioridade Média.
> Fato: o AGENTS.md manda rodar `cp .env.example .env`, mas `.env.example` não existe no repositório e não há `.gitignore`. […] Inferência: quem seguir o AGENTS.md primeiro recebe erro do `cp`; se criar o `.env` à mão, um `git add -A` o leva junto.
> Saída esperada: um `.gitignore` que cobre `.env`, `data/` e `node_modules/`, e um `.env.example` sem segredos com as variáveis citadas na spec 001.

## Por que este
É o único achado em que o dano é **irreversível**: um segredo que vai para o GitHub fica no histórico mesmo depois de apagado. E ele ainda não aconteceu porque o projeto não tem código — consertar agora custa duas linhas; consertar depois custa reescrever histórico e trocar segredos. O achado 2 (permissões) já seria resolvido pela configuração da Aula 09, e o 3 (comandos) é exatamente o esqueleto da atividade de 03/10.

## Reparo aplicado
- **`.gitignore`:** `node_modules/`, `.env`, `.env.local`, `.env.*.local`, `data/`, `.claude/settings.local.json` e `*.log`.
- **`.env.example`:** `PORT`, `DATA_FILE` e `SESSION_TTL_MINUTES` (as variáveis da seção Restrições da spec 001), sem nenhum segredo.
- **`.gitattributes`:** fim de linha LF no repositório, para os testes de bytes (CA-12) não dependerem do sistema de quem clona.
- **Verificação:** `git check-ignore -v .env data/x.json` → `.gitignore:4:.env` e `.gitignore:9:data/`; `cp .env.example .env` passa a funcionar.

- **Commit do reparo:** `b496739` — https://github.com/PedroV1tor/saassenha_novo/commit/b496739

## Como verificar
No 2º relatório, o achado de `.env` sem `.gitignore` não deve reaparecer, e a dimensão **Controlled Execution** deve passar a falar de permissões, não de arquivo ignorado.
