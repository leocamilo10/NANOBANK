// Appels à l'API Whop (côté serveur uniquement : la clé API ne quitte jamais Netlify).
import { env } from './auth.js';

const API = 'https://api.whop.com/api/v1';
const VERSION = '2026-11-13-1';
export const PRODUCT_ID = () => env('WHOP_PRODUCT_ID') || 'prod_7mnP69v1ROknT';

export const diag = { last: '' };
const note = async (step, res) => {
  let code = '';
  try { const j = await res.clone().json(); code = j.error || j.code || j.error_code || ''; } catch { /* corps non JSON */ }
  diag.last = `${step}-${res.status}${code ? '-' + code : ''}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
  console.error('Whop', diag.last, await res.text().catch(() => ''));
};

export async function exchangeCode({ code, redirectUri, verifier }) {
  const body = { grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: env('WHOP_CLIENT_ID'), code_verifier: verifier };
  if (env('WHOP_CLIENT_SECRET')) body.client_secret = env('WHOP_CLIENT_SECRET');
  const res = await fetch('https://api.whop.com/oauth/token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) { await note('token', res); return null; }
  return res.json();
}

// Identifiant user_… : d'abord dans l'id_token, sinon via /users/me
export async function userIdFrom(tokens) {
  try {
    const sub = tokens.id_token && JSON.parse(atob(tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub;
    if (typeof sub === 'string' && sub.startsWith('user_')) return sub;
  } catch { /* on passe à /users/me */ }
  const res = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${tokens.access_token}`, 'Api-Version-Date': VERSION } });
  if (!res.ok) { await note('me', res); return null; }
  const id = (await res.json()).id || null;
  if (!id) diag.last = 'me-sans-id';
  return id;
}

// A-t-il acheté Nanobank ? On demande avec la clé API du compte, puis avec le jeton de l'utilisateur en secours.
export async function hasProductAccess(userId, userToken) {
  for (const token of [env('WHOP_API_KEY'), userToken].filter(Boolean)) {
    const res = await fetch(`${API}/users/${encodeURIComponent(userId)}/access/${PRODUCT_ID()}`, {
      headers: { Authorization: `Bearer ${token}`, 'Api-Version-Date': VERSION },
    });
    if (res.ok) {
      const j = await res.json();
      // Acheteur (customer) ou propriétaire / équipe du produit (admin)
      return j.has_access === true || j.access_level === 'admin';
    }
    await note('acces', res);
    if (res.status !== 401 && res.status !== 403) return false;
  }
  return false;
}
