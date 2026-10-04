# SaaSenhas

Micro-SaaS para organizar e gerenciar senhas de forma simples e segura — feito para estudantes e jovens que usam muitos sites e apps.

- **Problema:** dificuldade para lembrar, organizar e gerenciar várias senhas; reutilização da mesma senha em vários sites.
- **Solução:** um cofre cifrado com a senha mestra do usuário, gerador de senhas fortes, medidor de força e alerta de senhas reutilizadas.

## Equipe
- João Victor Fiuza
- Rogger Martins
- Isabella Nascimento

Disciplina: ESW442 — Técnicas Avançadas de Construção de Software (UniRV) · Harness: **Claude Code**

## Como rodar
```bash
npm install
cp .env.example .env
npm start          # http://localhost:3000/health
npm test
npm run lint
```

## Exemplo rápido (curl)
```bash
curl -X POST localhost:3000/api/contas  -H "content-type: application/json" -d '{"email":"ana@exemplo.com","senhaMestra":"minha-senha-mestra"}'
curl -X POST localhost:3000/api/sessoes -H "content-type: application/json" -d '{"email":"ana@exemplo.com","senhaMestra":"minha-senha-mestra"}'
# use o token devolvido:
curl -X POST localhost:3000/api/entradas -H "authorization: Bearer <token>" -H "content-type: application/json" -d '{"site":"github.com","usuario":"ana","senha":"s3nh@"}'
curl localhost:3000/api/entradas/reutilizadas -H "authorization: Bearer <token>"
curl -X POST localhost:3000/api/gerador -H "content-type: application/json" -d '{"tamanho":20}'
```

## Documentação
- Comportamento: [`docs/specs/`](docs/specs/)
- Instruções para agentes de IA: [`AGENTS.md`](AGENTS.md) e [`CLAUDE.md`](CLAUDE.md)
- Harness (atividade ESW442): [`docs/harness/`](docs/harness/)
