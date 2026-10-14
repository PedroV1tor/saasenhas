import { Router } from 'express';
import { requireSession } from '../auth/session-middleware.js';
import { AppError } from '../errors.js';

// Avisos da lista e do detalhe (spec 002, seção 4).
const NOTICES = {
  criada: 'Entrada salva.',
  salva: 'Alterações salvas.',
  excluida: 'Entrada excluída.',
};

const text = (value) => (typeof value === 'string' ? value : '');
// Caixa "Favorita": marcada chega como "on"; desmarcada não chega (spec 004, RN-02).
const checked = (value) => value !== undefined;

export function cofreRoutes({ vaultService }) {
  const router = Router();
  router.use('/cofre', requireSession);

  // Spec 002, RN-08: o formulário com erro volta com site e usuário; a senha não volta.
  function renderFormError(res, err, form) {
    if (!(err instanceof AppError) || err.status !== 400) throw err;
    res.status(400).render('entrada-form', { ...form, erro: err.message });
  }

  router.get('/cofre', async (req, res) => {
    const soFavoritas = req.query.favoritas === '1';
    const entradas = await vaultService.listEntries(req.auth.email, { favoritesOnly: soFavoritas });
    res.render('cofre', { email: req.auth.email, entradas, soFavoritas, aviso: NOTICES[req.query.aviso] });
  });

  router.get('/cofre/nova', (_req, res) => {
    res.render('entrada-form', { id: null, site: '', usuario: '', favorita: false });
  });

  router.post('/cofre/entradas', async (req, res) => {
    const { site, usuario, senha, favorita } = req.body ?? {};
    try {
      await vaultService.addEntry(req.auth.email, req.auth.key, {
        site,
        username: usuario,
        password: senha,
        favorite: checked(favorita),
      });
      res.redirect(303, '/cofre?aviso=criada');
    } catch (err) {
      renderFormError(res, err, { id: null, site: text(site), usuario: text(usuario), favorita: checked(favorita) });
    }
  });

  router.get('/cofre/reutilizadas', async (req, res) => {
    const grupos = await vaultService.findReused(req.auth.email, req.auth.key);
    res.render('reutilizadas', { grupos });
  });

  router.get('/cofre/entradas/:id', async (req, res) => {
    const entrada = await vaultService.getEntry(req.auth.email, req.auth.key, req.params.id);
    res.render('entrada', { entrada, aviso: NOTICES[req.query.aviso] });
  });

  router.get('/cofre/entradas/:id/editar', async (req, res) => {
    const { id, site, username, favorite } = await vaultService.getEntry(req.auth.email, req.auth.key, req.params.id);
    res.render('entrada-form', { id, site, usuario: username, favorita: favorite });
  });

  router.post('/cofre/entradas/:id', async (req, res) => {
    const { site, usuario, senha, favorita } = req.body ?? {};
    const { id } = req.params;
    try {
      await vaultService.updateEntry(req.auth.email, req.auth.key, id, {
        site,
        username: usuario,
        password: senha,
        favorite: checked(favorita),
      });
      res.redirect(303, `/cofre/entradas/${id}?aviso=salva`);
    } catch (err) {
      renderFormError(res, err, { id, site: text(site), usuario: text(usuario), favorita: checked(favorita) });
    }
  });

  // Spec 004, RN-03 e D-02: recebe o valor, não inverte, para dois cliques não se anularem.
  router.post('/cofre/entradas/:id/favorita', async (req, res) => {
    const value = req.body?.favorita;
    if (value !== 'true' && value !== 'false') {
      throw new AppError(400, 'O campo "favorita" precisa ser true ou false.');
    }
    await vaultService.setFavorite(req.auth.email, req.params.id, value === 'true');
    res.redirect(303, '/cofre');
  });

  router.post('/cofre/entradas/:id/excluir', async (req, res) => {
    await vaultService.removeEntry(req.auth.email, req.params.id);
    res.redirect(303, '/cofre?aviso=excluida');
  });

  return router;
}
