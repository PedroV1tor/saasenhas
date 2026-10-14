import { Router } from 'express';
import { SESSION_COOKIE, SESSION_COOKIE_BASE, sessionCookieOptions, requireSession } from '../auth/session-middleware.js';
import { AppError } from '../errors.js';

// Avisos da página de entrada, escolhidos pelo parâmetro da URL (tabela da seção 4 da spec 001).
function noticeFor(query) {
  if (query.conta === 'criada') return { tipo: 'ok', texto: 'Conta criada. Entre com sua senha mestra.' };
  if (query.saiu === '1') return { tipo: 'ok', texto: 'Você saiu do cofre.' };
  if (query.motivo === 'login') return { tipo: 'info', texto: 'Faça login para acessar o cofre.' };
  return null;
}

const text = (value) => (typeof value === 'string' ? value : '');

// RN-13: quem já tem sessão válida não vê os formulários de entrada e cadastro.
function guestOnly(req, res, next) {
  if (req.auth) return res.redirect(303, '/cofre');
  next();
}

export function contasRoutes({ vaultService, sessions }) {
  const router = Router();

  // Erro de regra volta para o próprio formulário, com o e-mail como foi digitado e a senha vazia (RN-12).
  function renderFormError(res, view, err, email) {
    if (!(err instanceof AppError)) throw err;
    res.status(err.status).render(view, { email: text(email), erro: err.message });
  }

  router.get('/', (req, res) => res.redirect(303, req.auth ? '/cofre' : '/entrar'));

  router.get('/cadastro', guestOnly, (_req, res) => res.render('cadastro', { email: '' }));

  router.post('/cadastro', async (req, res) => {
    const { email, senhaMestra } = req.body ?? {};
    try {
      const account = await vaultService.register(email, senhaMestra);
      res.redirect(303, `/entrar?conta=criada&email=${encodeURIComponent(account.email)}`);
    } catch (err) {
      renderFormError(res, 'cadastro', err, email);
    }
  });

  router.get('/entrar', guestOnly, (req, res) => {
    res.render('entrar', { email: text(req.query.email), aviso: noticeFor(req.query) });
  });

  router.post('/entrar', async (req, res) => {
    const { email, senhaMestra } = req.body ?? {};
    try {
      const { email: owner, key } = await vaultService.unlock(email, senhaMestra);
      res.cookie(SESSION_COOKIE, sessions.create(owner, key), sessionCookieOptions(sessions));
      res.redirect(303, '/cofre');
    } catch (err) {
      renderFormError(res, 'entrar', err, email);
    }
  });

  // RN-09: encerra só a sessão deste cookie (RN-11) e apaga o cookie. Só POST: um GET pode vir de
  // pré-carregamento de links e tirar o usuário do cofre sem ele clicar (D-20).
  router.post('/sair', requireSession, (req, res) => {
    sessions.destroy(req.auth.token);
    res.clearCookie(SESSION_COOKIE, SESSION_COOKIE_BASE);
    res.redirect(303, '/entrar?saiu=1');
  });

  return router;
}
