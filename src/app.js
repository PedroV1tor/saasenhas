import express from 'express';
import { fileURLToPath } from 'node:url';
import { AppError } from './errors.js';
import { loadSession } from './auth/session-middleware.js';
import { contasRoutes } from './routes/contas.js';
import { cofreRoutes } from './routes/cofre.js';

const root = fileURLToPath(new URL('..', import.meta.url));

// Restrições da spec 001: nada de script inline nem de outro site, e nenhuma página dentro de iframe.
// no-store: depois de sair, "Voltar" não pode mostrar o cofre guardado no cache (RN-14).
function securityHeaders(_req, res, next) {
  res.set({
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  next();
}

export function createApp({ vaultService, sessions }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', `${root}views`);

  app.use(securityHeaders);
  app.use(express.static(`${root}public`));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));
  app.use(loadSession(sessions));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use(contasRoutes({ vaultService, sessions }));
  app.use(cofreRoutes({ vaultService }));

  app.use((_req, _res, next) => next(new AppError(404, 'Página não encontrada.')));

  // O Express reconhece o handler de erro pelos 4 parâmetros, por isso o _next fica.
  app.use((err, _req, res, _next) => {
    if (err instanceof AppError && err.status === 401) return res.redirect(303, '/entrar?motivo=login');
    if (err instanceof AppError) return res.status(err.status).render('erro', { mensagem: err.message });
    if (err.type === 'entity.too.large') return res.status(413).render('erro', { mensagem: 'O corpo da requisição passa de 10 KB.' });
    console.error(err.message);
    res.status(500).render('erro', { mensagem: 'Erro interno.' });
  });

  return app;
}
