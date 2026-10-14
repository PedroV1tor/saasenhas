import { Router } from 'express';
import { AppError } from '../errors.js';
import { generatePassword } from '../password/generator.js';
import { evaluateStrength } from '../password/strength.js';

// Estado inicial do formulário do gerador (spec 003, GET /gerador).
const DEFAULT_OPTIONS = { tamanho: 16, minusculas: true, maiusculas: true, numeros: true, simbolos: true };

// Caixa de seleção marcada chega como "on"; desmarcada não chega.
function optionsFrom(body = {}) {
  return {
    tamanho: body.tamanho ?? '',
    minusculas: body.minusculas !== undefined,
    maiusculas: body.maiusculas !== undefined,
    numeros: body.numeros !== undefined,
    simbolos: body.simbolos !== undefined,
  };
}

// Ferramentas de senha: não exigem sessão (spec 003, D-01).
export function ferramentasRoutes() {
  const router = Router();

  router.get('/gerador', (_req, res) => res.render('gerador', { opcoes: DEFAULT_OPTIONS }));

  router.post('/gerador', (req, res) => {
    const opcoes = optionsFrom(req.body);
    try {
      const senha = generatePassword({
        length: Number(opcoes.tamanho),
        lowercase: opcoes.minusculas,
        uppercase: opcoes.maiusculas,
        digits: opcoes.numeros,
        symbols: opcoes.simbolos,
      });
      res.render('gerador', { opcoes, gerada: { senha, forca: evaluateStrength(senha) } });
    } catch (err) {
      if (!(err instanceof AppError)) throw err;
      res.status(err.status).render('gerador', { opcoes, erro: err.message });
    }
  });

  // RN-06: o resultado vai para a página; a senha avaliada não.
  router.post('/forca', (req, res) => {
    res.render('gerador', { opcoes: DEFAULT_OPTIONS, medida: evaluateStrength(req.body?.senha) });
  });

  return router;
}
