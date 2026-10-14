import { Router } from 'express';
import { requireSession } from '../auth/session-middleware.js';

export function cofreRoutes() {
  const router = Router();

  router.get('/cofre', requireSession, (req, res) => {
    res.render('cofre', { email: req.auth.email });
  });

  return router;
}
