// Garde-fou : l'appli et son code ne sont servis qu'aux clients vérifiés.
import { verify, getCookie, SESSION } from './lib/auth.js';

export default async (request, context) => {
  if (await verify(getCookie(request, SESSION))) {
    const res = await context.next();
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }
  if (new URL(request.url).pathname.startsWith('/js/')) {
    return new Response('Accès réservé aux clients Nanobank.', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  return new URL('/acces.html', request.url); // affiche l'écran d'achat / connexion
};

export const config = { path: ['/app.html', '/app', '/js/player.js', '/js/common.js', '/js/templates/*'] };
