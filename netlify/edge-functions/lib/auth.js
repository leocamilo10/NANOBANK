// Outils partagés : variables d'environnement, cookies signés, PKCE.
const enc = new TextEncoder();
const dec = new TextDecoder();

// Les espaces ou retours à la ligne collés par erreur autour des clés sont retirés
export const env = (k) => {
  const v = globalThis.Netlify?.env?.get(k) ?? globalThis.Deno?.env?.get(k) ?? globalThis.process?.env?.[k];
  return typeof v === 'string' ? v.trim() || undefined : v;
};

export const SESSION = 'nb_session';   // pass d'accès à l'appli
export const OAUTH = 'nb_oauth';       // état temporaire pendant la connexion Whop
export const SESSION_HOURS = 24;       // on revérifie l'achat auprès de Whop chaque jour

export const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));

export const randomStr = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));
export const sha256b64url = async (s) => b64url(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function hmacKey() {
  const secret = env('SESSION_SECRET') || env('WHOP_API_KEY');
  if (!secret) throw new Error('SESSION_SECRET ou WHOP_API_KEY manquant');
  return crypto.subtle.importKey('raw', enc.encode('nanobank-session:' + secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

// Jeton signé : impossible à fabriquer ou modifier sans la clé secrète du serveur
export async function sign(obj) {
  const body = b64url(enc.encode(JSON.stringify(obj)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}
export async function verify(token) {
  try {
    if (!token) return null;
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    if (!(await crypto.subtle.verify('HMAC', await hmacKey(), fromB64url(sig), enc.encode(body)))) return null;
    const obj = JSON.parse(dec.decode(fromB64url(body)));
    if (!obj.exp || Date.now() > obj.exp) return null;
    return obj;
  } catch {
    return null;
  }
}

export function getCookie(request, name) {
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
export const setCookie = (name, value, { maxAge, path = '/' } = {}) =>
  `${name}=${encodeURIComponent(value)}; Path=${path}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

export function redirect(location, cookies = []) {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
}

export const callbackUrl = (request) => new URL('/auth/callback', request.url).toString();
