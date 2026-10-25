import { once } from 'node:events';

// Sobe o app numa porta livre e devolve um cliente HTTP que não segue redirecionamentos,
// para os testes conferirem o 303 e o Location de cada critério.
export async function startServer(app) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function request(method, path, { form, cookie } = {}) {
    const body = form && new URLSearchParams(Object.entries(form).filter(([, v]) => v !== undefined));
    const res = await fetch(baseUrl + path, {
      method,
      redirect: 'manual',
      headers: {
        ...(body && { 'content-type': 'application/x-www-form-urlencoded' }),
        ...(cookie && { cookie: `sessao=${cookie}` }),
      },
      body,
    });
    return {
      status: res.status,
      location: res.headers.get('location'),
      headers: res.headers,
      setCookie: res.headers.getSetCookie(),
      html: await res.text(),
    };
  }

  return {
    get: (path, options) => request('GET', path, options),
    post: (path, form, options) => request('POST', path, { ...options, form }),
    close() {
      server.closeAllConnections();
      server.close();
    },
  };
}
