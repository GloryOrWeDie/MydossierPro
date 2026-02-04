import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const updateTenantSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  property_address: z.string().trim().min(1, 'Property address is required').optional(),
  landlord_name: z.string().trim().optional(),
  landlord_email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  move_in_date: z.string().optional(),
  num_occupants: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().min(1).max(10).optional()
  ),
  personal_message: z.string().trim().max(500).optional(),
  employer: z.string().trim().min(1, 'Employer is required').optional(),
  job_title: z.string().trim().min(1, 'Job title is required').optional(),
  monthly_income: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  years_at_job: z.string().trim().optional(),
  reason_for_moving: z.string().trim().max(200).optional(),
  current_address: z.string().trim().optional(),
  date_of_birth: z.string().optional(),
  household_type: z.string().trim().optional(),
  num_children: z.string().trim().optional(),
  children_ages: z.string().trim().optional(),
  smoking: z.string().trim().optional(),
  has_pets: z.string().trim().optional(),
  pet_types: z.array(z.string()).optional(),
  num_pets: z.string().trim().optional(),
  dog_details: z.string().trim().optional(),
  cat_details: z.string().trim().optional(),
  has_vehicle: z.string().trim().optional(),
  parking_needed: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = updateTenantSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { tenantId, ...updateData } = validationResult.data;

    const supabase = createSupabaseAdmin();

    // Check if tenant exists
    const { data: tenant, error: checkError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .single();

    if (checkError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Clean up empty strings to null
    const cleanData: any = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        cleanData[key] = null;
      } else {
        cleanData[key] = value;
      }
    });

    // Update tenant
    const { data: updatedTenant, error: updateError } = await supabase
      .from('tenants')
      .update(cleanData)
      .eq('id', tenantId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating tenant:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Failed to update tenant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
