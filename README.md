# Novabank — simulateur d'appli bancaire

Appli de néobanque **fictive** (marque « Novabank ») pour blagues entre proches et tournages :
solde, épargne, opérations, bénéficiaires et virements modifiables, navigable au doigt en mode téléphone.

## Lancer en local

```bash
python3 -m http.server 8123
```
Puis ouvrir http://localhost:8123

## Générer la version en un seul fichier

```bash
python3 build.py
```
Produit `dist/propdash.html` (autonome, fonctionne hors-ligne).

## Structure

- `index.html` / `css/site.css` / `js/site.js` — page d'accueil
- `app.html` / `js/player.js` / `css/app.css` — éditeur (panneau de réglages, raccourcis, mode téléphone)
- `js/templates/bank.js` — l'appli Novabank (vues, virement, carte, profil)
- `css/templates.css` — styles de l'appli
- `dist/novabank-logo.svg` — logo

## Raccourcis

| Touche | Action |
|---|---|
| Entrée | virement reçu |
| Tab | paiement envoyé |
| Échap | réinitialiser |
| Maj+F | plein écran |
| Maj+H | afficher / masquer le panneau |

La mention « Compte de simulation · aucune valeur réelle » reste affichée en bas de chaque écran.
