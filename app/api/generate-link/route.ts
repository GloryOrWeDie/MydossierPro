import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Get tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, full_name, unique_slug')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // If slug already exists, return it
    if (tenant.unique_slug) {
      return NextResponse.json({
        slug: tenant.unique_slug,
        tenantId: tenant.id,
      });
    }

    // Generate unique slug
    let finalSlug = generateSlug(tenant.full_name);
    let attempts = 0;
    
    // Ensure slug is unique
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('unique_slug', finalSlug)
        .maybeSingle();

      if (!existing) {
        break;
      }
      finalSlug = generateSlug(tenant.full_name);
      attempts++;
    }

    // Update tenant with slug and mark as paid (free mode)
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        unique_slug: finalSlug,
        paid: true, // Mark as paid for free mode
      })
      .eq('id', tenantId);

    if (updateError) {
      console.error('Error updating tenant:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      slug: finalSlug,
      tenantId: tenant.id,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
