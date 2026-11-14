// Étape 1 : envoi vers « Se connecter avec Whop » (OAuth 2.1 + PKCE)
import { env, sign, setCookie, redirect, randomStr, sha256b64url, callbackUrl, OAUTH } from './lib/auth.js';

export default async (request) => {
  const clientId = env('WHOP_CLIENT_ID');
  if (!clientId) return new Response('Connexion Whop pas encore configurée.', { status: 503 });
  const verifier = randomStr(32), state = randomStr(16);
  const params = new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: callbackUrl(request), scope: 'openid profile',
    state, nonce: randomStr(16), code_challenge: await sha256b64url(verifier), code_challenge_method: 'S256',
  });
  const pending = await sign({ v: verifier, s: state, exp: Date.now() + 10 * 60 * 1000 });
  return redirect(`https://api.whop.com/oauth/authorize?${params}`, [setCookie(OAUTH, pending, { maxAge: 600, path: '/auth' })]);
};

export const config = { path: '/auth/login' };
