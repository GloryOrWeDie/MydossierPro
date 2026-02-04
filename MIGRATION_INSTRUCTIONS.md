# Instructions pour la Migration de Base de Données

## Problème
Si vous obtenez une erreur 500 lors de la génération du PDF, c'est probablement parce que la colonne `description` n'existe pas encore dans votre table `documents`.

## Solution

### Option 1 : Exécuter la migration SQL (Recommandé)

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez et exécutez le contenu du fichier `lib/migration_flexible_documents.sql`

### Option 2 : Migration manuelle

Si vous préférez, vous pouvez exécuter ces commandes SQL une par une :

```sql
-- Ajouter la colonne description
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Mettre à jour les documents existants avec des descriptions par défaut
UPDATE public.documents 
SET description = CASE 
  WHEN document_type = 'pay_stub' THEN 'Pay Stub'
  WHEN document_type = 'lease' THEN 'Previous Lease'
  WHEN document_type = 'id' THEN 'Photo ID'
  ELSE 'Document'
END
WHERE description IS NULL;

-- Rendre description obligatoire
ALTER TABLE public.documents 
  ALTER COLUMN description SET NOT NULL;

-- Rendre document_type optionnel (pour rétrocompatibilité)
ALTER TABLE public.documents 
  DROP CONSTRAINT IF EXISTS document_type_check;
ALTER TABLE public.documents 
  ALTER COLUMN document_type DROP NOT NULL;

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_documents_description ON public.documents(description);
```

## Vérification

Après avoir exécuté la migration, testez à nouveau la génération du PDF. Le code a été modifié pour gérer les deux cas (avec ou sans la colonne `description`), mais il est recommandé d'exécuter la migration pour une meilleure performance.
