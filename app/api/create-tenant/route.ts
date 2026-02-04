import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { CreateTenantInput } from '@/lib/types';
import { z } from 'zod';

const createTenantSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  phone: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.string().optional()),
  city: z.string().trim().min(2, 'City must be at least 2 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body: CreateTenantInput = await request.json();

    // Validate input
    const validationResult = createTenantSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, full_name, phone, city } = validationResult.data;

    const supabase = createSupabaseAdmin();

    // Check if email already exists
    const { data: existingTenant, error: checkError } = await supabase
      .from('tenants')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing tenant:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing tenant' },
        { status: 500 }
      );
    }

    if (existingTenant) {
      // Return existing tenant ID
      return NextResponse.json({
        tenantId: existingTenant.id,
        email,
      });
    }

    // Create new tenant
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({
        email,
        full_name,
        phone: phone || null,
        city,
        paid: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tenant:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create tenant record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tenantId: tenant.id,
      email: tenant.email,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
