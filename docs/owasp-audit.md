# Audit OWASP Top 10 (2021) — UrbanFlow

Audit réalisé le 2026-07-15 sur la branche `secu`, en support du critère
"Audit OWASP effectué" de l'US10 (Sprint 4).

## A01 — Broken Access Control

Toutes les actions serveur qui touchent des données utilisateur
(`daily-trips.ts`, `favorites.ts`, `preferences.ts`, `trips.ts`) récupèrent
l'utilisateur via `supabase.auth.getUser()` et filtrent systématiquement par
`user_id`. Row Level Security doit être activée sur ces tables côté Supabase
pour garantir la défense en profondeur si un filtre applicatif est oublié —
**à vérifier dans le dashboard Supabase**, non versionné dans ce repo.

## A02 — Cryptographic Failures

- Mots de passe : gérés entièrement par Supabase Auth (hash côté plateforme,
  jamais stockés/manipulés en clair côté app).
- Géolocalisation : `origin_lat/lon` et `destination_lat/lon` de
  `daily_trips` sont stockés **en clair** (`numeric`) dans
  `app/actions/daily-trips.ts`. Un chiffrement applicatif AES-256-GCM a été
  prototypé puis écarté (changement de type de colonne trop invasif pour ce
  sprint). **Non conforme** au critère "données de géolocalisation chiffrées
  en base" — à reprendre lors d'un sprint ultérieur.
- Connexions Supabase/API tierces (ORS, Naolib, Nantes Open Data) : HTTPS
  uniquement.

## A03 — Injection

Aucun SQL brut ni concaténation de chaînes : toutes les requêtes passent par
le query builder Supabase (`.eq()`, `.insert()`, `.update()`...). Statut : OK.

## A04 — Insecure Design

Rate limiting appliqué sur `/login` et `/signup` (par IP et par email,
`lib/rate-limit.ts`) pour limiter le brute-force et l'énumération de comptes.

## A05 — Security Misconfiguration

- Clé de service Supabase (`SUPABASE_SERVICE_ROLE_KEY`) utilisée uniquement
  côté serveur (`lib/supabase/admin.ts`, marqué `server-only`), jamais
  exposée au client.
- À vérifier manuellement : headers de sécurité (CSP, HSTS) au niveau Vercel
  — non configurés explicitement dans `next.config.ts` actuellement.

## A06 — Vulnerable and Outdated Components

`npm audit --audit-level=moderate` (voir `npm run audit`) :

- 2 vulnérabilités modérées : `postcss < 8.5.10` (XSS via sortie CSS non
  échappée), dépendance transitive de `next`. Le correctif nécessite un
  downgrade breaking de `next` (`npm audit fix --force`) — **non appliqué**
  car régressif ; à surveiller lors de la prochaine montée de version de
  Next.js.

## A07 — Identification and Authentication Failures

Authentification déléguée à Supabase Auth (JWT, refresh token, session
persistante). Messages d'erreur de connexion volontairement génériques
("Email ou mot de passe incorrect") pour ne pas révéler si un compte existe.
Rate limiting en place (voir A04).

## A08 — Software and Data Integrity Failures

Pas de mécanisme de désérialisation dangereuse ni de CI/CD auto-déployant du
code non review. Déploiement via Vercel depuis GitHub.

## A09 — Security Logging and Monitoring Failures

Les erreurs Supabase sont loguées côté serveur (`console.error` dans les
actions), mais il n'y a pas de monitoring centralisé (Sentry, logs
structurés) — **manquant**, amélioration possible hors scope de ce sprint.

## A10 — Server-Side Request Forgery (SSRF)

Les appels sortants (ORS, Naolib, Nantes Open Data) utilisent des URLs
d'API fixes définies en constante/env, jamais construites à partir d'une
entrée utilisateur non validée. Statut : OK.

## Résumé

| Critère | Statut |
| --- | --- |
| Injections SQL | OK (query builder paramétré) |
| Rate limiting auth | OK (`lib/rate-limit.ts`) |
| Géolocalisation chiffrée | Non conforme — coordonnées stockées en clair |
| Dépendances | 2 vulnérabilités modérées connues, non bloquantes, suivies |
| Logging/monitoring | Absent — amélioration future |
| Headers de sécurité (CSP/HSTS) | Non vérifiés — à faire manuellement sur Vercel |
