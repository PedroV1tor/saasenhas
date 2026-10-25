import { Router } from 'express';
import { requireSession } from '../auth/session-middleware.js';

// Avisos da lista e do detalhe (spec 002, seção 4).
const NOTICES = {
  criada: 'Entrada salva.',
};

export function cofreRoutes({ vaultService }) {
  const router = Router();
  router.use('/cofre', requireSession);

  router.get('/cofre', async (req, res) => {
    const entradas = await vaultService.listEntries(req.auth.email);
    res.render('cofre', { email: req.auth.email, entradas, aviso: NOTICES[req.query.aviso] });
  });

  router.post('/cofre/entradas', async (req, res) => {
    const { site, usuario, senha } = req.body ?? {};
    await vaultService.addEntry(req.auth.email, req.auth.key, { site, username: usuario, password: senha });
    res.redirect(303, '/cofre?aviso=criada');
  });

  router.get('/cofre/entradas/:id', async (req, res) => {
    const entrada = await vaultService.getEntry(req.auth.email, req.auth.key, req.params.id);
    res.render('entrada', { entrada, aviso: NOTICES[req.query.aviso] });
  });

  return router;
}
