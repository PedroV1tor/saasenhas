# SaaSenhas

Micro-SaaS web para organizar e gerenciar senhas de forma simples e segura — feito para estudantes e jovens que usam muitos sites e apps.

- **Problema:** dificuldade para lembrar, organizar e gerenciar várias senhas; reutilização da mesma senha em vários sites.
- **Para quem:** estudantes universitários e jovens que alternam entre celular e computador e acumulam contas (AVA, e-mail, redes sociais, bancos digitais, streaming).
- **Proposta de valor:** um cofre web cifrado com a senha mestra do usuário — o servidor nunca conhece essa senha —, com gerador de senhas fortes, medidor de força e alerta de senhas reutilizadas.
- **Evidência da dor:** pesquisa com 37 estudantes da UniRV — ver [`docs/problema.md`](docs/problema.md).

## Equipe
- João Victor Fiuza
- Rogger Martins
- Isabella Nascimento
- Pedro Vitor

Disciplina: ESW442 — Técnicas Avançadas de Construção de Software (UniRV) · Harness: **Claude Code**

## O que o sistema faz
| Página | O que faz | Spec |
|---|---|---|
| `/cadastro`, `/entrar`, botão "Sair" | conta com e-mail e senha mestra; sessão de 15 min em cookie protegido | [001](docs/specs/001-contas-e-sessoes.md) |
| `/cofre` | entradas (site, usuário, senha cifrada com AES-256-GCM): criar, ver, editar, excluir | [002](docs/specs/002-cofre-de-senhas.md) |
| `/cofre/reutilizadas` | contas que usam a mesma senha, sem mostrar a senha | [002](docs/specs/002-cofre-de-senhas.md) |
| `/gerador` | gerador de senhas fortes e medidor de força (sem login) | [003](docs/specs/003-gerador-e-forca.md) |
| ★ na lista, `/cofre?favoritas=1` | entradas favoritas | [004](docs/specs/004-favoritas.md) |

Arquitetura: Node.js + Express 5 no back-end, páginas geradas no servidor com EJS, CSS e um pequeno JS do navegador em `public/`. Sem banco: o cofre é um arquivo JSON (`DATA_FILE`).

## Como rodar
Requer Node.js 20.18+ (`.nvmrc`).
```bash
npm install
cp .env.example .env      # no cmd do Windows: copy .env.example .env
npm start                 # abra http://localhost:3000
npm test                  # um teste por critério de aceite (test/spec-*.test.js)
npm run lint
```

## Documentação
- Comportamento: [`docs/specs/`](docs/specs/) — a fonte da verdade; plano da feature 001 em [`001-plano.md`](docs/specs/001-plano.md)
- Instruções para agentes de IA: [`AGENTS.md`](AGENTS.md) e [`CLAUDE.md`](CLAUDE.md)
- Harness (permissões, skill, hooks, relatórios, provas e diário): [`docs/harness/`](docs/harness/)
- Commit final da feature 001: tag [`feature-001`](../../tree/feature-001)
