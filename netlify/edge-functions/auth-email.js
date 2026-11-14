// Connexion par email d'achat : on demande à Whop si cet email a un accès actif à Nanobank.
import { env, sign, setCookie, redirect, SESSION, SESSION_HOURS } from './lib/auth.js';
import { PRODUCT_ID } from './lib/whop.js';

const API = 'https://api.whop.com/api/v1';
const VERSION = '2026-11-13-1';
const clean = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);

export default async (request) => {
  if (request.method !== 'POST') return redirect('/acces.html');
  const form = await request.formData().catch(() => null);
  const email = String(form?.get('email') || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return redirect('/acces.html?erreur=email-invalide');

  const grant = async (who) => redirect('/app.html', [setCookie(SESSION, await sign({ uid: who, exp: Date.now() + SESSION_HOURS * 3600 * 1000 }), { maxAge: SESSION_HOURS * 3600 })]);

  // Le propriétaire du site (variable OWNER_EMAIL dans Netlify) entre toujours
  const owners = (env('OWNER_EMAIL') || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
  if (owners.includes(email)) return grant('owner:' + email);

  const key = env('WHOP_API_KEY');
  if (!key) return redirect('/acces.html?erreur=whop&d=cle-manquante');
  const params = new URLSearchParams({ query: email, membership_status: 'active' });
  params.append('product_ids', PRODUCT_ID());
  if (env('WHOP_ACCOUNT_ID')) params.set('account_id', env('WHOP_ACCOUNT_ID'));

  const res = await fetch(`${API}/members?${params}`, { headers: { Authorization: `Bearer ${key}`, 'Api-Version-Date': VERSION } });
  if (!res.ok) {
    let code = ''; try { code = (await res.clone().json()).error?.type || ''; } catch { /* corps non JSON */ }
    console.error('Whop members', res.status, await res.text().catch(() => ''));
    return redirect(`/acces.html?erreur=whop&d=${clean(`membres-${res.status}${code ? '-' + code : ''}`)}`);
  }
  const list = (await res.json()).data || [];
  const found = list.find((m) => String(m.email || '').toLowerCase() === email);
  if (found) return grant(found.id || 'mem:' + email);
  // Membre trouvé mais email masqué : la clé n'a pas le droit de lire les emails
  if (list.length && list.every((m) => m.email == null)) return redirect('/acces.html?erreur=whop&d=emails-masques');
  return redirect('/acces.html?erreur=email-inconnu');
};

export const config = { path: '/auth/email' };
