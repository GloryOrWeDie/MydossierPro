import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { generateProfessionalPDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await request.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
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

    // Get documents (try with description first, fallback to document_type if description doesn't exist)
    let documentsList: any[] = [];
    let docsError = null;
    
    console.log('Fetching documents for tenant:', tenantId);
    
    try {
      // First, try to get all documents with description
      const { data: documents, error: error1 } = await supabase
        .from('documents')
        .select('file_path, description, document_type, file_name, file_type')
        .eq('tenant_id', tenantId)
        .order('uploaded_at');
      
      console.log('First query result - documents:', documents?.length || 0, 'error:', error1?.message);
      
      if (error1) {
        console.log('First query failed, trying without description field');
        // Try without description (in case migration hasn't been run)
        const { data: documents2, error: error2 } = await supabase
          .from('documents')
          .select('file_path, document_type, file_name, file_type')
          .eq('tenant_id', tenantId)
          .order('uploaded_at');
        
        console.log('Second query result - documents:', documents2?.length || 0, 'error:', error2?.message);
        
        if (error2) {
          docsError = error2;
        } else {
          // Map document_type to description for backward compatibility
          documentsList = (documents2 || []).map(doc => ({
            ...doc,
            description: doc.document_type === 'pay_stub' ? 'Pay Stub' :
                         doc.document_type === 'lease' ? 'Previous Lease' :
                         doc.document_type === 'id' ? 'Photo ID' :
                         'Document',
            file_type: doc.file_type || 'application/pdf' // Default to PDF if not specified
          }));
        }
      } else {
        // Map to ensure description exists (fallback to document_type if needed)
        documentsList = (documents || []).map(doc => ({
          ...doc,
          description: doc.description || 
                      (doc.document_type === 'pay_stub' ? 'Pay Stub' :
                       doc.document_type === 'lease' ? 'Previous Lease' :
                       doc.document_type === 'id' ? 'Photo ID' :
                       'Document'),
          file_type: doc.file_type || 'application/pdf' // Default to PDF if not specified
        }));
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      docsError = err;
    }

    // Documents are now optional - allow empty array, but log error if there was a query error
    if (docsError) {
      console.error('Failed to fetch documents:', docsError);
      console.error('Error code:', docsError.code);
      console.error('Error message:', docsError.message);
      documentsList = [];
    }
    
    console.log('Final documents list:', documentsList.length, 'documents');
    if (documentsList.length > 0) {
      console.log('Document details:', documentsList.map(d => ({
        file_name: d.file_name,
        description: d.description,
        file_path: d.file_path,
        file_type: d.file_type || 'unknown'
      })));
    } else {
      console.warn('⚠️ WARNING: No documents found for tenant', tenantId);
      // Double-check by querying all documents for this tenant
      const { data: allDocs, error: checkError } = await supabase
        .from('documents')
        .select('id, file_name, description, tenant_id')
        .eq('tenant_id', tenantId);
      console.log('Double-check query - Found', allDocs?.length || 0, 'documents in database');
      if (allDocs && allDocs.length > 0) {
        console.log('Documents that should be included:', allDocs);
      }
    }

    // Generate PDF
    console.log('About to generate PDF for tenant:', tenant.id);
    console.log('Documents count:', documentsList.length);
    console.log('Tenant data for PDF:', {
      date_of_birth: tenant.date_of_birth,
      household_type: tenant.household_type,
      smoking: tenant.smoking,
      has_pets: tenant.has_pets,
      has_vehicle: tenant.has_vehicle,
    });
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await generateProfessionalPDF(tenant, documentsList);
      console.log('PDF generated successfully, size:', pdfBytes.length);
    } catch (pdfError: any) {
      console.error('Error in generateProfessionalPDF:', pdfError);
      console.error('Error stack:', pdfError?.stack);
      throw pdfError; // Re-throw to be caught by outer try-catch
    }

    // Convert Uint8Array to Buffer for upload
    const pdfBuffer = Buffer.from(pdfBytes);

    // Upload PDF to storage (use documents bucket directly since pdfs bucket doesn't exist)
    const fileName = `${tenant.unique_slug || tenant.id}.pdf`;
    const pdfPath = `pdfs/${fileName}`;
    let uploadError = null;
    let pdfUrl = null;

    // Upload to documents bucket (pdfs bucket doesn't exist, so we store PDFs in documents/pdfs/)
    const { error: docError } = await supabase.storage
      .from('documents')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (!docError) {
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(pdfPath);
      pdfUrl = urlData.publicUrl;
    } else {
      uploadError = docError;
      console.error('PDF upload error:', docError);
    }

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Still return PDF bytes if upload fails (client can download directly)
      return NextResponse.json(
        {
          success: true,
          pdfBytes: Array.from(pdfBytes),
          error: 'Failed to upload PDF to storage',
        },
        { status: 200 }
      );
    }

    // Update tenant with PDF URL
    await supabase
      .from('tenants')
      .update({ pdf_url: pdfUrl })
      .eq('id', tenantId);

    return NextResponse.json({
      success: true,
      pdfUrl: pdfUrl,
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
