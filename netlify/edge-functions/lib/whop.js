// Appels à l'API Whop (côté serveur uniquement : la clé API ne quitte jamais Netlify).
import { env } from './auth.js';

const API = 'https://api.whop.com/api/v1';
const VERSION = '2026-11-13-1';
export const PRODUCT_ID = () => env('WHOP_PRODUCT_ID') || 'prod_7mnP69v1ROknT';

export async function exchangeCode({ code, redirectUri, verifier }) {
  const body = { grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: env('WHOP_CLIENT_ID'), code_verifier: verifier };
  if (env('WHOP_CLIENT_SECRET')) body.client_secret = env('WHOP_CLIENT_SECRET');
  const res = await fetch('https://api.whop.com/oauth/token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) { console.error('Whop token', res.status, await res.text().catch(() => '')); return null; }
  return res.json();
}

// Identifiant user_… : d'abord dans l'id_token, sinon via /users/me
export async function userIdFrom(tokens) {
  try {
    const sub = tokens.id_token && JSON.parse(atob(tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub;
    if (typeof sub === 'string' && sub.startsWith('user_')) return sub;
  } catch { /* on passe à /users/me */ }
  const res = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${tokens.access_token}`, 'Api-Version-Date': VERSION } });
  if (!res.ok) { console.error('Whop users/me', res.status); return null; }
  return (await res.json()).id || null;
}

// A-t-il acheté Nanobank ? On demande avec la clé API du compte, puis avec le jeton de l'utilisateur en secours.
export async function hasProductAccess(userId, userToken) {
  for (const token of [env('WHOP_API_KEY'), userToken].filter(Boolean)) {
    const res = await fetch(`${API}/users/${encodeURIComponent(userId)}/access/${PRODUCT_ID()}`, {
      headers: { Authorization: `Bearer ${token}`, 'Api-Version-Date': VERSION },
    });
    if (res.ok) return (await res.json()).has_access === true;
    console.error('Whop access', res.status);
    if (res.status !== 401 && res.status !== 403) return false;
  }
  return false;
}
