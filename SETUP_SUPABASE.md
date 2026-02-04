# Guide de Configuration Supabase pour RentProof

## Étape 1 : Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - Nom du projet : `rentproof` (ou votre choix)
   - Mot de passe de la base de données : (choisissez un mot de passe fort)
   - Région : choisissez la plus proche de vous
5. Cliquez sur "Create new project"
6. Attendez que le projet soit créé (2-3 minutes)

## Étape 2 : Obtenir vos clés Supabase

Une fois le projet créé :

1. Dans le tableau de bord Supabase, allez dans **Settings** (⚙️) → **API**
2. Vous verrez :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key** : une longue chaîne qui commence par `eyJ...`
   - **service_role key** : une autre longue chaîne (⚠️ gardez-la secrète !)

## Étape 3 : Configurer la base de données

1. Dans le tableau de bord Supabase, allez dans **SQL Editor**
2. Cliquez sur "New query"
3. Ouvrez le fichier `lib/database.sql` de ce projet
4. Copiez tout le contenu du fichier
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur "Run" (ou F5)
7. Vous devriez voir "Success. No rows returned"

## Étape 4 : Configurer le Storage (stockage de fichiers)

1. Dans le tableau de bord Supabase, allez dans **Storage**
2. Cliquez sur "Create a new bucket"
3. Nom du bucket : `documents`
4. Cochez **Public bucket** (important !)
5. Cliquez sur "Create bucket"

## Étape 5 : Créer le fichier .env.local

Créez un fichier nommé `.env.local` à la racine du projet (même niveau que `package.json`) avec ce contenu :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (à configurer plus tard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Remplacez les valeurs** :
- `NEXT_PUBLIC_SUPABASE_URL` : votre Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : votre anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` : votre service_role key

## Étape 6 : Vérifier la configuration

1. Redémarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. L'application devrait démarrer sans erreur

## Vérification finale

Pour vérifier que tout fonctionne :

1. Allez sur `http://localhost:3000`
2. La page d'accueil devrait s'afficher
3. Essayez de créer un profil (même sans Stripe configuré, vous pourrez tester l'upload)

## Prochaines étapes

Une fois Supabase configuré, vous devrez également configurer Stripe pour les paiements. Voir le README.md pour plus d'informations.

## Support

Si vous rencontrez des problèmes :
- Vérifiez que toutes les clés sont correctement copiées (sans espaces)
- Vérifiez que le bucket `documents` est créé et public
- Vérifiez que le schéma SQL a été exécuté avec succès
- Consultez les logs de la console pour les erreurs
