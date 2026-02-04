-- Migration: Make documents flexible with descriptions
-- This migration updates the documents table to support flexible document uploads

-- Add description column
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Make description required (but allow existing rows to be null initially)
-- We'll update existing rows to have a default description
UPDATE public.documents 
SET description = CASE 
  WHEN document_type = 'pay_stub' THEN 'Pay Stub'
  WHEN document_type = 'lease' THEN 'Previous Lease'
  WHEN document_type = 'id' THEN 'Photo ID'
  ELSE 'Document'
END
WHERE description IS NULL;

-- Now make description NOT NULL
ALTER TABLE public.documents 
  ALTER COLUMN description SET NOT NULL;

-- Remove the constraint on document_type (make it optional/nullable)
ALTER TABLE public.documents 
  DROP CONSTRAINT IF EXISTS document_type_check;

-- Make document_type nullable since we're using description instead
ALTER TABLE public.documents 
  ALTER COLUMN document_type DROP NOT NULL;

-- Update the index to remove document_type (or keep it for backward compatibility)
-- We'll keep the index but it's no longer required

-- Add index on description for faster searches
CREATE INDEX IF NOT EXISTS idx_documents_description ON public.documents(description);

-- Comments for documentation
COMMENT ON COLUMN public.documents.description IS 'User-provided description of the document (e.g., "Pay Stub", "Photo ID", "Reference Letter")';
COMMENT ON COLUMN public.documents.document_type IS 'Legacy field - kept for backward compatibility. Use description instead.';
