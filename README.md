# SaaSenhas

Micro-SaaS para organizar e gerenciar senhas de forma simples e segura — feito para estudantes e jovens que usam muitos sites e apps.

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

## Como rodar
Requer Node.js 20.18+ (`.nvmrc`).
```bash
npm install
cp .env.example .env
npm start          # http://localhost:3000
npm test
npm run lint
```

## Documentação
- Comportamento: [`docs/specs/`](docs/specs/) — a fonte da verdade
