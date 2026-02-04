import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateProfessionalPDF } from '@/lib/pdf-generator';
import { generateEmailBody } from '@/lib/ai-generator';
import { createSupabaseAdmin } from '@/lib/supabase';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { tenantId, landlordEmail } = await request.json();

    if (!tenantId || !landlordEmail) {
      return NextResponse.json(
        { error: 'Tenant ID and landlord email are required' },
        { status: 400 }
      );
    }

    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY.' },
        { status: 500 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Get tenant data
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('id, file_name, file_path, file_type, description, document_type')
      .eq('tenant_id', tenantId);

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Generate PDF (pass documents with file_path, not signed URLs)
    const pdfBytes = await generateProfessionalPDF(
      tenant,
      (documents || []).map((doc) => ({
        file_path: doc.file_path,
        description: doc.description,
        file_name: doc.file_name,
      }))
    );

    // Generate email body
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const applicationUrl = `${appUrl}/${tenant.unique_slug}`;
    const emailBody = await generateEmailBody(tenant, applicationUrl);

    // Send email
    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'DossierPro <onboarding@resend.dev>',
      to: landlordEmail,
      subject: `Rental Application - ${tenant.property_address || 'Property'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6;">
          ${emailBody.replace(/\n/g, '<br>')}
          
          <p style="margin-top: 20px;">
            <strong>View online:</strong><br>
            <a href="${applicationUrl}" style="color: #2563EB; text-decoration: underline;">${applicationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            This application was professionally prepared using DossierPro<br>
            Verified on ${new Date().toLocaleDateString()}<br>
            Reference: RP-${tenant.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `DossierPro_${tenant.full_name.replace(/\s/g, '_')}.pdf`,
          content: Buffer.from(pdfBytes),
        },
      ],
    });

    if (emailResult.error) {
      console.error('Error sending email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log sent email
    await supabase.from('email_logs').insert({
      tenant_id: tenantId,
      recipient_email: landlordEmail,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, emailId: emailResult.data?.id });
  } catch (error) {
    console.error('Send application error:', error);
    return NextResponse.json(
      { error: 'Failed to send application' },
      { status: 500 }
    );
  }
}
