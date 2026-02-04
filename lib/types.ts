export type DocumentType = 'pay_stub' | 'lease' | 'id'; // Legacy - kept for backward compatibility

export interface Tenant {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  city?: string | null;
  unique_slug?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_session_id?: string | null;
  paid: boolean;
  created_at: string;
  expires_at: string;
  property_address?: string | null;
  landlord_name?: string | null;
  landlord_email?: string | null;
  move_in_date?: string | null;
  num_occupants?: number | null;
  personal_message?: string | null;
  employer?: string | null;
  job_title?: string | null;
  monthly_income?: number | null;
  years_at_job?: string | null;
  reason_for_moving?: string | null;
  pdf_url?: string | null;
  current_address?: string | null;
  date_of_birth?: string | null;
  household_type?: string | null;
  num_children?: string | null;
  children_ages?: string | null;
  smoking?: string | null;
  has_pets?: string | null;
  pet_types?: string[] | null;
  num_pets?: string | null;
  dog_details?: string | null;
  cat_details?: string | null;
  has_vehicle?: string | null;
  parking_needed?: string | null;
}

export interface Document {
  id: string;
  tenant_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  document_type?: DocumentType | null; // Legacy - optional now
  description: string; // User-provided description
  uploaded_at: string;
}

export interface ProfileView {
  id: string;
  tenant_id: string;
  viewed_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface CreateTenantInput {
  email: string;
  full_name: string;
  phone?: string;
  city: string;
  property_address?: string;
  landlord_name?: string;
  landlord_email?: string;
  move_in_date?: string;
  num_occupants?: number;
  personal_message?: string;
  employer?: string;
  job_title?: string;
  monthly_income?: number;
}

export interface UploadDocumentInput {
  tenantId: string;
  file: File;
  documentType: DocumentType;
}

export interface ProfileData {
  tenant: {
    full_name: string;
    city: string | null;
    created_at: string;
    expires_at: string;
  };
  documents: Array<{
    id: string;
    document_type?: DocumentType | null; // Legacy
    description: string; // User-provided description
    file_name: string;
    file_size: number | null;
    download_url: string;
  }>;
}

export interface DashboardData {
  tenant: Tenant;
  documents: Document[];
  views: {
    total: number;
    lastViewed: string | null;
  };
}
