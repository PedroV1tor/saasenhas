import { Router } from 'express';
import { requireSession } from '../auth/session-middleware.js';

export function cofreRoutes({ vaultService }) {
  const router = Router();
  router.use('/cofre', requireSession);

  router.get('/cofre', (req, res) => {
    res.render('cofre', { email: req.auth.email });
  });

  router.post('/cofre/entradas', async (req, res) => {
    const { site, usuario, senha } = req.body ?? {};
    await vaultService.addEntry(req.auth.email, req.auth.key, { site, username: usuario, password: senha });
    res.redirect(303, '/cofre');
  });

  return router;
}
