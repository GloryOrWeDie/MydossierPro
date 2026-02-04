import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { PRO_PRICE, PRO_PRICE_CURRENCY } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServer(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to upgrade to Pro' },
        { status: 401 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: PRO_PRICE_CURRENCY,
            product_data: {
              name: 'DossierPro Pro',
              description: 'Unlimited dossiers, priority support, and more. Valid 1 year.',
            },
            unit_amount: Math.round(PRO_PRICE * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/upgrade?success=1`,
      cancel_url: `${appUrl}/upgrade`,
      customer_email: user.email ?? undefined,
      metadata: {
        type: 'pro_upgrade',
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create Pro checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
