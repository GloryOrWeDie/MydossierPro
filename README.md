# MydossierPro (RentProof)

A platform that helps tenants create professional rental application dossiers.

## Features

- Upload rental documents (pay stub, lease, ID)
- One-time payment of $19.99 USD
- Generate unique shareable link
- Professional profile view for landlords
- Document downloads (individual or ZIP)
- Analytics tracking

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Storage)
- Stripe (Payments)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your credentials

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `lib/database.sql`
   - Create a storage bucket named `documents` with public access
   - Get your Supabase URL and keys

4. Set up Stripe:
   - Create a Stripe account
   - Get your API keys
   - Set up webhook endpoint: `/api/webhook`
   - Get webhook signing secret

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Setup

Run the SQL in `lib/database.sql` in your Supabase SQL editor.

## Storage Setup

1. Create a storage bucket named `documents`
2. Set it to public
3. Configure RLS policies if needed
