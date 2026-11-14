// Étape 2 : retour de Whop → on vérifie l'achat → on ouvre l'appli
import { verify, sign, getCookie, setCookie, redirect, callbackUrl, OAUTH, SESSION, SESSION_HOURS } from './lib/auth.js';
import { exchangeCode, userIdFrom, hasProductAccess, diag } from './lib/whop.js';

export default async (request) => {
  const url = new URL(request.url);
  const clearOauth = setCookie(OAUTH, '', { maxAge: 0, path: '/auth' });
  diag.last = '';
  const fail = (why) => redirect(`/acces.html?erreur=${why}${diag.last ? '&d=' + diag.last : ''}`, [clearOauth]);

  if (url.searchParams.get('error')) return fail('annule');
  const pending = await verify(getCookie(request, OAUTH));
  const code = url.searchParams.get('code');
  if (!pending || !code || pending.s !== url.searchParams.get('state')) return fail('session');

  const tokens = await exchangeCode({ code, redirectUri: callbackUrl(request), verifier: pending.v });
  if (!tokens?.access_token) return fail('whop');
  const userId = await userIdFrom(tokens);
  if (!userId) return fail('whop');
  if (!(await hasProductAccess(userId, tokens.access_token))) return fail('sans-acces');

  const pass = await sign({ uid: userId, exp: Date.now() + SESSION_HOURS * 3600 * 1000 });
  return redirect('/app.html', [setCookie(SESSION, pass, { maxAge: SESSION_HOURS * 3600 }), clearOauth]);
};

export const config = { path: '/auth/callback' };
