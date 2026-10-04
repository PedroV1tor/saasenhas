import express from 'express';
import { AppError } from './errors.js';
import { generatePassword } from './password/generator.js';
import { evaluateStrength } from './password/strength.js';

export function createApp({ vaultService, sessions }) {
  const app = express();
  app.use(express.json({ limit: '10kb' }));

  function requireSession(req, _res, next) {
    const [scheme, token] = (req.get('authorization') ?? '').split(' ');
    const session = scheme === 'Bearer' ? sessions.get(token) : null;
    if (!session) throw new AppError(401, 'Faça login para acessar o cofre.');
    req.session = session;
    req.token = token;
    next();
  }

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Contas e sessões
  app.post('/api/contas', async (req, res) => {
    const account = await vaultService.register(req.body?.email, req.body?.senhaMestra);
    res.status(201).json(account);
  });

  app.post('/api/sessoes', async (req, res) => {
    const { email, key } = await vaultService.unlock(req.body?.email, req.body?.senhaMestra);
    res.status(201).json({ token: sessions.create(email, key) });
  });

  app.delete('/api/sessoes', requireSession, (req, res) => {
    sessions.destroy(req.token);
    res.status(204).end();
  });

  // Cofre
  const toApi = ({ username, password, ...rest }) => ({
    ...rest,
    usuario: username,
    ...(password !== undefined && { senha: password }),
  });

  app.get('/api/entradas', requireSession, async (req, res) => {
    const entries = await vaultService.listEntries(req.session.email);
    res.json(entries.map(toApi));
  });

  app.get('/api/entradas/reutilizadas', requireSession, async (req, res) => {
    const groups = await vaultService.findReused(req.session.email, req.session.key);
    res.json(groups.map((g) => ({ quantidade: g.count, entradas: g.entries.map(toApi) })));
  });

  app.post('/api/entradas', requireSession, async (req, res) => {
    const { site, usuario, senha } = req.body ?? {};
    const entry = await vaultService.addEntry(req.session.email, req.session.key, { site, username: usuario, password: senha });
    res.status(201).json(toApi(entry));
  });

  app.get('/api/entradas/:id', requireSession, async (req, res) => {
    const entry = await vaultService.getEntry(req.session.email, req.session.key, req.params.id);
    res.json(toApi(entry));
  });

  app.put('/api/entradas/:id', requireSession, async (req, res) => {
    const { site, usuario, senha } = req.body ?? {};
    const entry = await vaultService.updateEntry(req.session.email, req.session.key, req.params.id, {
      site,
      username: usuario,
      password: senha,
    });
    res.json(toApi(entry));
  });

  app.delete('/api/entradas/:id', requireSession, async (req, res) => {
    await vaultService.removeEntry(req.session.email, req.params.id);
    res.status(204).end();
  });

  // Ferramentas de senha (não precisam de login)
  app.post('/api/gerador', (req, res) => {
    const { tamanho, minusculas, maiusculas, numeros, simbolos } = req.body ?? {};
    const senha = generatePassword({
      length: tamanho ?? 16,
      lowercase: minusculas ?? true,
      uppercase: maiusculas ?? true,
      digits: numeros ?? true,
      symbols: simbolos ?? true,
    });
    res.json({ senha, forca: evaluateStrength(senha) });
  });

  app.post('/api/forca', (req, res) => {
    res.json(evaluateStrength(req.body?.senha));
  });

  app.use((_req, _res, next) => next(new AppError(404, 'Rota não encontrada.')));

  // O Express reconhece o handler de erro pelos 4 parâmetros, por isso o _next fica.
  app.use((err, _req, res, _next) => {
    if (err instanceof AppError) return res.status(err.status).json({ erro: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
    console.error(err.message);
    res.status(500).json({ erro: 'Erro interno.' });
  });

  return app;
}
