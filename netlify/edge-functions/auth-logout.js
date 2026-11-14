// Déconnexion
import { setCookie, redirect, SESSION } from './lib/auth.js';

export default async () => redirect('/', [setCookie(SESSION, '', { maxAge: 0 })]);

export const config = { path: '/auth/logout' };
