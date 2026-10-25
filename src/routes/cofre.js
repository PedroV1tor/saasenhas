import { Router } from 'express';
import { requireSession } from '../auth/session-middleware.js';

export function cofreRoutes() {
  const router = Router();
  router.use('/cofre', requireSession);

  router.get('/cofre', (req, res) => {
    res.render('cofre', { email: req.auth.email });
  });

  return router;
}
