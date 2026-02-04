import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { validateFileType, validateFileSize } from '@/lib/utils';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/constants';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD API CALLED ===');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tenantId = formData.get('tenantId') as string;
    const description = formData.get('description') as string;

    console.log('Received data:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      tenantId,
      description
    });

    if (!file || !tenantId || !description) {
      console.error('Missing required fields:', { file: !!file, tenantId: !!tenantId, description: !!description });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file)) {
      return NextResponse.json(
        { error: 'Only PDF, JPG, and PNG files are accepted' },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file)) {
      return NextResponse.json(
        { error: `File must be under ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate description
    if (!description.trim() || description.trim().length < 2) {
      return NextResponse.json(
        { error: 'Description must be at least 2 characters' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Check if tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const filePath = `documents/${tenantId}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage with retry logic
    console.log('Uploading file to storage:', filePath);
    let uploadError = null;
    let uploadData = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await supabase.storage
          .from('documents')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          });
        
        uploadError = result.error;
        uploadData = result.data;
        
        if (!uploadError) {
          console.log(`File uploaded to storage successfully on attempt ${attempt}:`, uploadData);
          break;
        }
        
        console.warn(`Storage upload attempt ${attempt} failed:`, uploadError);
        
        // If it's a network error and not the last attempt, wait and retry
        if (attempt < maxRetries && (uploadError.message?.includes('fetch failed') || uploadError.message?.includes('ECONNRESET'))) {
          const waitTime = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
          console.log(`Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      } catch (err: any) {
        console.error(`Storage upload attempt ${attempt} threw error:`, err);
        uploadError = err;
        if (attempt < maxRetries) {
          const waitTime = attempt * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
    }

    if (uploadError) {
      console.error('Storage upload failed after all retries:', uploadError);
      console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to upload file to storage',
          details: uploadError.message || 'Unknown storage error',
          code: uploadError.error || 'STORAGE_ERROR',
          hint: 'This might be a temporary network issue. Please try again.'
        },
        { status: 500 }
      );
    }

    // Create document record (no need to check for duplicates - allow multiple documents)
    const insertData = {
      tenant_id: tenantId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      description: description.trim(),
    };
    console.log('Inserting document record:', insertData);
    
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      console.error('Error details:', JSON.stringify(dbError, null, 2));
      // Clean up uploaded file
      try {
        await supabase.storage.from('documents').remove([filePath]);
        console.log('Cleaned up uploaded file');
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
      return NextResponse.json(
        { 
          error: 'Failed to create document record',
          details: dbError.message || 'Unknown database error',
          code: dbError.code,
          hint: dbError.hint || 'No hint available'
        },
        { status: 500 }
      );
    }
    
    console.log('Document record created successfully:', document.id);

    return NextResponse.json({
      documentId: document.id,
      filePath: document.file_path,
      fileName: document.file_name,
    });
  } catch (error: any) {
    console.error('Unexpected error in upload API:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error?.message || 'Unknown error',
        type: error?.constructor?.name || 'Error'
      },
      { status: 500 }
    );
  }
}
