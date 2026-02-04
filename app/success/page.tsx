'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createSupabaseClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const slug = searchParams.get('slug');
  const [tenant, setTenant] = useState<{ slug: string; name: string; id: string } | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);

  useEffect(() => {
    // FREE MODE: If slug is provided directly, use it
    if (slug) {
      const fetchTenantBySlug = async () => {
        const supabase = createSupabaseClient();
        const { data, error: queryError } = await supabase
          .from('tenants')
          .select('id, unique_slug, full_name')
          .eq('unique_slug', slug)
          .single();

        if (!queryError && data) {
          setTenant({
            id: data.id,
            slug: data.unique_slug,
            name: data.full_name,
          });
          setLoading(false);
        } else {
          setError('Profile not found');
          setLoading(false);
        }
      };
      fetchTenantBySlug();
      return;
    }

    // PAYMENT MODE: If session_id is provided, check payment status
    if (!sessionId) {
      setError('No session ID or slug provided');
      setLoading(false);
      return;
    }

    // Poll for payment completion (since webhook might take a moment)
    const checkPayment = async () => {
      const supabase = createSupabaseClient();
      
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const { data, error: queryError } = await supabase
          .from('tenants')
          .select('id, unique_slug, full_name, paid')
          .eq('stripe_session_id', sessionId)
          .single();

        if (!queryError && data && data.paid && data.unique_slug) {
          setTenant({
            id: data.id,
            slug: data.unique_slug,
            name: data.full_name,
          });
          setLoading(false);
          return;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setError('Payment processing. Please wait a moment and refresh the page.');
      setLoading(false);
    };

    checkPayment();
  }, [sessionId, slug]);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const profileUrl = tenant ? `${appUrl}/${tenant.slug}` : '';
  const fullUrl = profileUrl;

  const emailTemplate = `Subject: My Rental Application

Hi [Landlord Name],

I'm interested in your property at [address].

Here's my complete rental application:
${fullUrl}

This includes my pay stubs, previous lease, and ID.

Thank you,
${tenant?.name || '[Your Name]'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadAll = () => {
    if (tenant) {
      router.push(`/${tenant.slug}`);
    }
  };

  const handleDownloadPDF = async () => {
    if (!tenant) return;

    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId: tenant.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate PDF');
      }

      const data = await response.json();

      if (data.pdfUrl) {
        // Download from URL
        const link = document.createElement('a');
        link.href = data.pdfUrl;
        link.download = `DossierPro_${tenant.name.replace(/\s/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (data.pdfBytes) {
        // Download from bytes
        const bytes = new Uint8Array(data.pdfBytes);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DossierPro_${tenant.name.replace(/\s/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load your profile. Please try again later.'}</p>
          <Link href="/create">
            <Button variant="primary">Back to Create</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
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

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-green-100 rounded-full p-6">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
          Your RentProof is Ready!
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Share your unique link with landlords to view your rental application
        </p>

        {/* HERO: Unique Link Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-8 mb-8 shadow-xl">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">
            Your unique link:
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <p className="text-lg md:text-xl font-mono text-gray-900 break-all text-center">
              {fullUrl}
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>
          
          {/* Expiration warning */}
          <p className="text-sm text-gray-600 text-center mt-4">
            ⏰ This link expires in 90 days
          </p>
        </div>

        {/* PDF Download Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-8 mb-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-block bg-blue-100 rounded-full p-4 mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Your Professional PDF is Ready!
            </h3>
            <p className="text-gray-600">
              All your documents merged into one beautiful file
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingPDF ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating PDF...
              </span>
            ) : (
              '📄 Download Complete Application (PDF)'
            )}
          </button>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Professional cover page</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Complete profile</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All documents included</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Verified by DossierPro</span>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col gap-4 mb-8">
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-center"
          >
            👀 View Your Profile
          </Link>
          
          <button
            onClick={handleDownloadAll}
            className="w-full bg-white text-blue-600 border-2 border-blue-600 px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all"
          >
            📥 Download All Documents (ZIP)
          </button>
        </div>

        {/* Email Template (Collapsible) */}
        <div className="border border-gray-200 rounded-lg mb-8">
          <button
            onClick={() => setShowEmailTemplate(!showEmailTemplate)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold text-gray-900">
              📧 Email Template
            </span>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                showEmailTemplate ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showEmailTemplate && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                Copy this template to send to landlords:
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                  {emailTemplate}
                </pre>
              </div>
              
              <button
                onClick={handleCopyEmail}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                {emailCopied ? '✓ Copied!' : 'Copy Email Template'}
              </button>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🎯 What's Next?
          </h3>
          
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Copy your unique link and share it with landlords</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Use the email template to send professional applications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Track views and engagement on your dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Your link expires in 90 days - use it while it's active!</span>
            </li>
          </ul>
        </div>

        {/* Toast Notification */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-up">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Link copied to clipboard!</span>
          </div>
        )}
      </main>
    </div>
  );
}
