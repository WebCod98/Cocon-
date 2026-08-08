# Mettre Cocon en ligne — guide complet

**Aucune ligne de code à écrire.** Tout se fait dans le navigateur : des clics, deux copier-coller.
Comptez **20 minutes** en tout, et **0 € par mois**.

Le guide se lit dans l'ordre. Ne sautez pas d'étape — surtout pas l'étape 8, qui est celle où tout le
monde se plante.

| Étape | Où | Durée |
| --- | --- | --- |
| Partie 1 — La base de données | Supabase | 10 min |
| Partie 2 — Le site | Netlify | 5 min |
| Partie 3 — Vérifier que ça marche | Vos téléphones | 5 min |

---

## Avant de commencer

Il vous faut **un compte GitHub** (celui qui contient déjà ce dépôt). Supabase et Netlify se
connectent tous les deux avec, donc pas de nouveau mot de passe à retenir.

**Pourquoi deux services ?**

- **Netlify** héberge l'application elle-même — les pages que vous voyez.
- **Supabase** stocke ce que vous vous écrivez, et le fait voyager entre vos deux téléphones.

Sans Supabase, l'app marche quand même, mais chacun aurait **son propre Cocon** sans voir celui de
l'autre. C'est pour ça qu'on commence par là.

---

# Partie 1 — Supabase

## 1. Créer le compte

1. Aller sur **[supabase.com](https://supabase.com)**
2. Cliquer **Start your project** (en haut à droite)
3. Choisir **Continue with GitHub**
4. Autoriser Supabase

## 2. Créer le projet

1. Cliquer **New project**
2. Remplir :
   - **Name** : `cocon`
   - **Database Password** : cliquer **Generate a password**, puis **copiez-le quelque part**
     (vous n'en aurez pas besoin pour ce guide, mais ne le perdez pas)
   - **Region** : choisissez la plus proche de vous — *Frankfurt* ou *Paris* si vous êtes en Europe
   - **Plan** : **Free**
3. Cliquer **Create new project**

Le projet met **1 à 2 minutes** à démarrer. Laissez l'onglet ouvert.

## 3. Installer la base de données

C'est le seul copier-coller technique du guide, et il est sans risque : le script ne fait que créer
une table et quatre fonctions.

1. Dans le menu de gauche, cliquer **SQL Editor** (icône `>_`)
2. Cliquer **New query**
3. Ouvrir dans un autre onglet le fichier **[`supabase/schema.sql`](supabase/schema.sql)** de ce dépôt
4. Cliquer le bouton **Copy raw file** (ou tout sélectionner avec `Ctrl+A` / `Cmd+A`, puis copier)
5. Revenir sur Supabase, **coller** dans la grande zone de texte
6. Cliquer **Run** (ou `Ctrl+Entrée`)

✅ Vous devez voir **« Success. No rows returned »** en bas.

> Si vous voyez une erreur en rouge, c'est que le copier-coller est incomplet. Recommencez en
> vérifiant que la première ligne collée commence par `-- ====` et la dernière par `$$;`.

## 4. Vérifier

Menu de gauche → **Table Editor**. Vous devez voir une table **`couples`**, vide, avec un petit
cadenas 🔒 à côté de son nom. Le cadenas est normal — c'est la sécurité qui est active.

## 5. Récupérer les deux clés

1. Menu de gauche, tout en bas → **Project Settings** (l'engrenage ⚙️)
2. Cliquer **API** dans le sous-menu (parfois appelé **API Keys**)
3. Vous avez besoin de **deux valeurs**. Copiez-les dans un bloc-notes :

| Ce que vous cherchez | À quoi ça ressemble |
| --- | --- |
| **Project URL** | `https://abcdefghijklm.supabase.co` |
| **La clé publique** — libellée `anon` `public`, ou `publishable` | une longue chaîne commençant par `eyJhbGci…` ou `sb_publishable_…` |

> ⚠️ **Ne prenez pas** la clé marquée `service_role` ou `secret`. Celle-là donne tous les droits et ne
> doit jamais quitter un serveur.
>
> La clé publique, elle, est *faite* pour être dans l'application. C'est normal qu'elle soit visible :
> elle ne donne accès à rien toute seule (voir [Sécurité](#sécurité--vos-données) plus bas).

**Partie 1 terminée.** Gardez l'onglet Supabase ouvert.

---

# Partie 2 — Netlify

## 6. Créer le compte

1. Aller sur **[netlify.com](https://netlify.com)**
2. Cliquer **Sign up** → **GitHub** → autoriser

## 7. Importer le projet

1. Cliquer **Add new site** → **Import an existing project**
2. Choisir **Deploy with GitHub**
3. Autoriser Netlify à voir vos dépôts *(vous pouvez limiter l'accès au seul dépôt `Cocon-`)*
4. Dans la liste, cliquer **`Cocon-`**

Netlify affiche alors un écran de configuration.

5. **Branch to deploy** : choisir **`claude/app-creation-design-zip-otxlo9`**
6. **Build command** et **Publish directory** : **ne touchez à rien**. Ils sont déjà remplis
   automatiquement — la configuration est dans le dépôt.

## 8. ⚠️ Les variables d'environnement — l'étape à ne pas rater

**C'est ici que tout se joue.** Cocon fabrique sa version finale *au moment du déploiement* : si les
clés ne sont pas là **avant** de cliquer sur Deploy, elles ne seront pas dans l'application, et la
synchronisation ne marchera pas.

### 🛑 D'abord, levons LE malentendu

Le mot « clé » désigne **deux choses différentes**, et c'est la source de confusion numéro un :

| Le mot | Ce que ça veut dire ici |
| --- | --- |
| Le champ **« Key »** de Netlify | le **nom** de la variable. Vous le **tapez vous-même**. |
| Votre **clé publique** Supabase | une **valeur**. Elle va dans le champ **« Value »**. |

Votre clé Supabase ne va **jamais** dans le champ « Key ». Jamais.

### Les deux variables à créer

**Variable 1 — l'adresse de votre base**

| Champ Netlify | Ce que vous y mettez |
| --- | --- |
| **Key** | `VITE_SUPABASE_URL` — à recopier à la main |
| **Value** | le *Project URL* de l'étape 5, du type `https://abcdefghijklm.supabase.co` |

**Variable 2 — votre clé publique**

| Champ Netlify | Ce que vous y mettez |
| --- | --- |
| **Key** | `VITE_SUPABASE_ANON_KEY` — à recopier à la main |
| **Value** | **votre clé publique**, celle qui commence par `eyJhbGci…` ou `sb_publishable_…` |

Comment faire, concrètement :

1. Cliquer **Add environment variables** (ou **Show advanced** → **New variable**)
2. Remplir la variable 1, puis cliquer **Add environment variable** et remplir la variable 2

Vérifiez l'orthographe des noms : ils sont sensibles à la casse, et le préfixe `VITE_` est
obligatoire.

### Si le champ « Value » n'apparaît pas

Netlify fait évoluer cet écran. Sur les versions récentes, la zone de saisie de la valeur ne
s'affiche qu'**après** avoir choisi **« Same value for all deploy contexts »**. Cochez cette option
et le champ apparaît.

### 🆘 La sortie de secours

Si cet écran vous résiste, **sautez simplement cette étape** — vous la referez au calme après :

1. Cliquer **Deploy** tout de suite, sans variables. Le site se déploiera très bien, en mode local.
2. Une fois le site en ligne : **Site configuration** → **Environment variables** → **Add a
   variable** → **Add a single variable**. Cet écran-là est nettement plus clair, avec « Key » et
   « Value » bien séparés.
3. Ajouter les deux variables du tableau ci-dessus.
4. **Indispensable :** aller dans **Deploys** → **Trigger deploy** → **Clear cache and deploy site**.

Sans cette dernière étape, les variables ne servent à rien : elles ne sont lues qu'au moment de la
construction du site.

## 9. Déployer

Cliquer **Deploy `Cocon-`**.

Le déploiement prend **1 à 3 minutes**. Vous verrez le journal défiler. Quand c'est fini, un badge
vert **Published** apparaît.

## 10. Choisir une jolie adresse

1. **Site configuration** → **Site details** → **Change site name**
2. Taper par exemple `notre-cocon` → l'adresse devient `https://notre-cocon.netlify.app`

Le HTTPS est activé automatiquement. C'est indispensable : sans lui, l'app ne peut pas s'installer
sur l'écran d'accueil.

---

# Partie 3 — Vérifier que ça marche

## 11. L'appairage

1. **Sur le téléphone A** : ouvrir l'adresse Netlify
2. Toucher **Créer notre Cocon**, remplir les prénoms, les villes, la date de début
3. Noter le **Code d'Amour à 6 chiffres** qui s'affiche
4. **Sur le téléphone B** : ouvrir la même adresse
5. Toucher **J'ai déjà un code**, saisir les 6 chiffres, remplir son prénom et sa ville
6. Toucher **Nous lier**

🎉 Des confettis confirment la liaison.

## 12. Le test qui prouve que tout fonctionne

Sur le téléphone A, aller dans **Réglages** (l'engrenage en haut à droite).

Vous devez voir, dans la section **Synchronisation** :

> ☁️ **Synchronisation activée** — Vos mots, photos et parties voyagent entre vos deux téléphones en temps
> réel. Les deux appareils sont reliés.

Si c'est le cas, tout est bon. Pour en avoir le cœur net :

- Sur le téléphone A, toucher **Nourrir** — la jauge de faim monte
- Sur le téléphone B, rafraîchir : **la jauge a monté aussi**

## 13. Installer sur l'écran d'accueil

**iPhone (Safari uniquement)**
Toucher le bouton **Partager** (le carré avec une flèche) → descendre → **Sur l'écran d'accueil** →
**Ajouter**.

**Android (Chrome)**
Une bannière propose l'installation. Sinon : menu **⋮** → **Installer l'application** (ou *Ajouter à
l'écran d'accueil*).

L'app s'ouvre désormais en plein écran, sans barre de navigateur.

---

# En cas de problème

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Réglages affiche **« Mode local »** au lieu de « Synchronisation activée » | Les variables n'étaient pas là au moment du build | Netlify → **Site configuration** → **Environment variables** → vérifier les deux noms → puis **Deploys** → **Trigger deploy** → **Clear cache and deploy site** |
| « Aucun Cocon ne correspond à ce code » | Même cause, ou le code a déjà été utilisé | Un code ne fonctionne **qu'une seule fois**. Le partenaire A doit refaire une inscription pour obtenir un code neuf |
| « Impossible de joindre le serveur » | Projet Supabase en pause, ou pas de réseau | Ouvrir le tableau de bord Supabase : s'il est en pause, cliquer **Restore** |
| Page blanche | Le build a échoué | Netlify → **Deploys** → cliquer le dernier → lire le journal en rouge |
| Erreur 404 en rafraîchissant `/agenda` | Le fichier `netlify.toml` n'a pas été pris en compte | Vérifier que vous déployez bien la bonne branche |
| Le SQL renvoie une erreur | Copier-coller incomplet | Recopier **tout** le fichier `schema.sql`, du début à la fin |

**Le piège n°1, à connaître :** les variables d'environnement sont figées dans l'application **au
moment du build**. Les ajouter ou les modifier après coup ne change rien tant que vous n'avez pas
relancé un déploiement avec **Clear cache and deploy site**.

---

# Sécurité — vos données

C'est votre intimité qui circule : mots doux, photos, notes vocales. Voici exactement comment elle
est protégée.

**La table est fermée à double tour.** La sécurité au niveau des lignes (RLS) est activée sans
aucune règle d'autorisation, et les droits directs sont retirés au rôle public. Résultat : même avec
la clé publique en main, personne ne peut lire ou écrire la table `couples` directement. *Vérifié :
la tentative renvoie `permission denied for table couples`.*

**Le code à 6 chiffres ne sert qu'une fois.** Il ne donne pas accès à vos données : il permet
uniquement de les échanger, **une seule fois**, contre un secret long et aléatoire (48 caractères).
Une fois le couple appairé, le code ne vaut plus rien. C'est ce qui empêche quelqu'un d'essayer les
000000, 000001, 000002… pour tomber sur votre Cocon.

**Le secret ne quitte jamais vos deux téléphones.** C'est lui, et lui seul, qui autorise la lecture
et l'écriture. Il sert aussi de nom au canal temps réel, ce qui rend celui-ci indevinable.

Ces quatre garanties ont été testées contre une vraie base PostgreSQL avant publication :

| Test | Résultat |
| --- | --- |
| Lecture directe de la table avec la clé publique | ❌ refusée |
| Lecture avec un mauvais secret | ❌ refusée |
| Écriture avec un mauvais secret | ❌ refusée |
| Réutilisation d'un code déjà appairé | ❌ refusée |

**Ce qui reste à savoir, honnêtement :**

- Les données ne sont **pas chiffrées de bout en bout**. Elles sont protégées en transit (HTTPS) et
  par les règles ci-dessus, mais l'administrateur du projet Supabase — c'est-à-dire vous — peut les
  lire depuis le tableau de bord.
- Pendant le court moment où le couple est créé mais pas encore appairé, un code deviné donnerait
  accès. En pratique la fenêtre dure quelques minutes. Faites l'appairage dans la foulée.
- Les couples créés mais jamais appairés sont supprimables au bout de 7 jours : dans l'éditeur SQL,
  lancer `select public.cocon_cleanup();`.

---

# Ce que ça coûte

**Rien**, et ce n'est pas un piège commercial — l'usage d'une app de couple est minuscule au regard
des limites gratuites.

| | Offert | Ce que vous consommerez |
| --- | --- | --- |
| **Netlify** | 100 Go de trafic / mois | quelques mégaoctets |
| **Supabase** | 500 Mo de base, 5 Go de trafic / mois | quelques mégaoctets |

**Le seul vrai piège du plan gratuit Supabase :** un projet **sans aucune activité pendant 7 jours
est mis en pause**. La synchronisation s'arrête alors jusqu'à ce que vous cliquiez **Restore** dans
le tableau de bord. Si vous utilisez l'app régulièrement — ce qui est un peu l'idée — le cas ne se
présentera jamais.

---

# Et après ?

Chaque `git push` sur la branche déclenche automatiquement un nouveau déploiement. Vous n'avez plus
jamais à refaire ce guide.

Deux choses restent hors de portée d'un hébergement gratuit sans développement supplémentaire, et il
vaut mieux le savoir :

- **Les vraies notifications push** — celles qui font sonner le téléphone alors que l'app est fermée.
  Elles demandent un serveur détenant des clés VAPID. Aujourd'hui, Cocon affiche ses rappels quand
  l'app est ouverte.
- **La météo réelle** — elle est aujourd'hui déduite de la ville et du jour. Cohérente entre vous
  deux, mais inventée.
