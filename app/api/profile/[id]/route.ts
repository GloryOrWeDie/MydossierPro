import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = params.id;

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Get tenant by unique_slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, full_name, city, created_at, expires_at, paid')
      .eq('unique_slug', profileId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if paid
    if (!tenant.paid) {
      return NextResponse.json(
        { error: 'Profile not available' },
        { status: 404 }
      );
    }

    // Check if expired
    const expiresAt = new Date(tenant.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 }
      );
    }

    // Get documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('id, file_name, file_path, file_size, description, document_type')
      .eq('tenant_id', tenant.id)
      .order('uploaded_at');

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Generate signed URLs for downloads
    const documentsWithUrls = await Promise.all(
      (documents || []).map(async (doc) => {
        const { data } = await supabase.storage
          .from('documents')
          .createSignedUrl(doc.file_path, 3600); // 1 hour expiry

        return {
          id: doc.id,
          document_type: doc.document_type || null, // Legacy
          description: doc.description,
          file_name: doc.file_name,
          file_size: doc.file_size,
          download_url: data?.signedUrl || '',
        };
      })
    );

    // Track view
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await supabase.from('profile_views').insert({
      tenant_id: tenant.id,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json({
      tenant: {
        full_name: tenant.full_name,
        city: tenant.city,
        created_at: tenant.created_at,
        expires_at: tenant.expires_at,
      },
      documents: documentsWithUrls,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
