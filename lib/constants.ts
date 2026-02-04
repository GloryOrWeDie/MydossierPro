export const PRICE = 19.99;
export const PRICE_CURRENCY = 'usd';

// Pro plan (Upgrade to Pro)
export const PRO_PRICE = 9.99;
export const PRO_PRICE_CURRENCY = 'usd';
export const PRO_VALIDITY_DAYS = 365; // 1 year
export const LINK_VALIDITY_DAYS = 90;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  pay_stub: 'Pay Stub',
  lease: 'Previous Lease',
  id: 'Photo ID',
};

export const APP_NAME = 'DossierPro';
export const APP_DESCRIPTION = 'Create your professional rental application dossier in minutes';
