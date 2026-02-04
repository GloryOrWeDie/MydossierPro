import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdmin } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const supabase = createSupabaseAdmin();

      // Find tenant by session_id
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, full_name, stripe_session_id')
        .eq('stripe_session_id', session.id)
        .single();

      if (tenantError || !tenant) {
        console.error('Tenant not found for session:', session.id);
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      // Generate unique slug
      const slug = generateSlug(tenant.full_name);

      // Check if slug already exists
      let finalSlug = slug;
      let attempts = 0;
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from('tenants')
          .select('id')
          .eq('unique_slug', finalSlug)
          .single();

        if (!existing) {
          break;
        }
        finalSlug = generateSlug(tenant.full_name);
        attempts++;
      }

      // Update tenant
      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          paid: true,
          unique_slug: finalSlug,
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('id', tenant.id);

      if (updateError) {
        console.error('Error updating tenant:', updateError);
        return NextResponse.json(
          { error: 'Failed to update tenant' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
