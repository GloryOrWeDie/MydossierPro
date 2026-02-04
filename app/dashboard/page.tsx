'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CopyButton from '@/components/CopyButton';
import { createSupabaseClient } from '@/lib/supabase';
import { formatDateTime, daysUntil } from '@/lib/utils';
import { Tenant, Document, ProfileView } from '@/lib/types';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [views, setViews] = useState<{ total: number; lastViewed: string | null }>({
    total: 0,
    lastViewed: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setError('Email parameter is required');
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const supabase = createSupabaseClient();

        // Get tenant
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('email', email)
          .eq('paid', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (tenantError || !tenantData) {
          throw new Error('Tenant not found or payment not completed');
        }

        setTenant(tenantData);

        // Get documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .order('uploaded_at', { ascending: false });

        if (!documentsError && documentsData) {
          setDocuments(documentsData);
        }

        // Get views
        const { data: viewsData, error: viewsError } = await supabase
          .from('profile_views')
          .select('viewed_at')
          .eq('tenant_id', tenantData.id)
          .order('viewed_at', { ascending: false });

        if (!viewsError && viewsData) {
          setViews({
            total: viewsData.length,
            lastViewed: viewsData.length > 0 ? viewsData[0].viewed_at : null,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Not Available</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load your dashboard.'}</p>
          <Link href="/create">
            <Button variant="primary">Create New Profile</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const profileUrl = tenant.unique_slug ? `${appUrl}/${tenant.unique_slug}` : '';
  const daysRemaining = daysUntil(tenant.expires_at);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              DossierPro
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your rental application dossier</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Unique Link</h2>
            {profileUrl ? (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-mono text-gray-900 break-all">{profileUrl}</p>
                </div>
                <CopyButton text={profileUrl} className="w-full mb-3" />
                <Link href={profileUrl} target="_blank">
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-gray-600">Link will be available after payment is processed.</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{views.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Viewed</p>
                <p className="text-lg font-semibold text-gray-900">
                  {views.lastViewed
                    ? formatDateTime(views.lastViewed)
                    : 'Not viewed yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Link Expires In</p>
                <p className="text-lg font-semibold text-gray-900">
                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Documents</h2>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{doc.file_name}</p>
                    <p className="text-sm text-gray-500">
                      {doc.description || doc.document_type || 'Document'} • {formatDateTime(doc.uploaded_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No documents uploaded yet.</p>
          )}
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-700 text-sm mb-4">
            Share your unique link with landlords. They can view and download your documents without creating an account.
          </p>
          <Link href="/">
            <Button variant="outline">Back to Homepage</Button>
          </Link>
        </Card>
      </main>
    </div>
  );
}
