import { AppError } from '../errors.js';

export const SESSION_COOKIE = 'sessao';

// Restrições da spec 001: invisível ao JavaScript da página, nunca enviado a partir de outro site (D-18)
// e com a mesma validade da sessão no servidor.
export function sessionCookieOptions(sessions) {
  return { httpOnly: true, sameSite: 'strict', path: '/', maxAge: sessions.ttlMinutes * 60 * 1000 };
}

function readCookie(req, name) {
  for (const part of (req.get('cookie') ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return null;
}

// Coloca a sessão válida (se houver) em req.auth e o e-mail em res.locals para o menu das páginas.
export function loadSession(sessions) {
  return (req, res, next) => {
    const token = readCookie(req, SESSION_COOKIE);
    const session = token ? sessions.get(token) : null;
    if (session) {
      req.auth = { ...session, token };
      res.locals.usuario = session.email;
    }
    next();
  };
}

// RN-10: sem sessão válida, o handler de erro leva a /entrar?motivo=login.
export function requireSession(req, _res, next) {
  if (!req.auth) throw new AppError(401, 'Faça login para acessar o cofre.');
  next();
}
