'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Zap, Shield, Infinity, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { createSupabaseClient } from '@/lib/supabase';
import { PRO_PRICE } from '@/lib/constants';

type Profile = { is_pro: boolean; pro_expires_at: string | null } | null;

export default function UpgradePage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isPro = Boolean(
    profile?.is_pro &&
      profile?.pro_expires_at &&
      new Date(profile.pro_expires_at) > new Date()
  );

  useEffect(() => {
    const supabase = createSupabaseClient();
    const getAuth = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
      if (u?.id) {
        const { data: p } = await supabase
          .from('profiles')
          .select('is_pro, pro_expires_at')
          .eq('id', u.id)
          .maybeSingle();
        setProfile(p ?? null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    getAuth();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (params.get('success') === '1') setSuccess(true);
  }, []);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/create-pro-checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setCheckoutLoading(false);
    }
  };

  const proFeatures = [
    'Unlimited dossiers (no 3-dossier limit)',
    'Priority support',
    'Custom branding option',
    'Advanced analytics',
    'Export all dossiers',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-dark">
            Dossier<span className="text-coral-500">Pro</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-dark-light hover:text-dark transition-colors">
              Login
            </Link>
            <Link href="/create" className="px-6 py-2.5 bg-coral-500 text-white rounded-lg font-semibold hover:bg-coral-600 transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-center">
            Payment successful! Your Pro account is now active.
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-teal-500">Pro</span>
          </h1>
          <p className="text-xl text-gray-600">
            Get unlimited dossiers and more power for your rental applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Free tier */}
          <div className="rounded-2xl border-2 border-gray-200 p-8 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Free</h2>
            <p className="text-3xl font-bold text-gray-900 mb-4">$0<span className="text-lg font-normal text-gray-500">/month</span></p>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                3 dossiers per email
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                Shareable link (90 days)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                PDF download
              </li>
            </ul>
            <Link href="/create" className="block">
              <Button variant="outline" className="w-full">Current plan</Button>
            </Link>
          </div>

          {/* Pro tier */}
          <div className="rounded-2xl border-2 border-teal-500 p-8 bg-gradient-to-br from-teal-50 to-white shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-500 text-white text-sm font-semibold rounded-full">
              Recommended
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pro</h2>
            <p className="text-3xl font-bold text-teal-600 mb-4">${PRO_PRICE}<span className="text-lg font-normal text-gray-500">/year</span></p>
            <ul className="space-y-3 text-gray-700 mb-6">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-teal-500 flex-shrink-0" strokeWidth={2} />
                  {feature}
                </li>
              ))}
            </ul>

            {!user ? (
              <Link href="/login" className="block">
                <Button variant="primary" className="w-full bg-teal-500 hover:bg-teal-600">
                  Log in to upgrade
                </Button>
              </Link>
            ) : isPro ? (
              <div className="py-3 px-4 bg-teal-100 text-teal-800 rounded-lg font-medium text-center">
                You&apos;re a Pro member
              </div>
            ) : (
              <Button
                variant="primary"
                className="w-full bg-teal-500 hover:bg-teal-600"
                onClick={handleUpgrade}
                isLoading={checkoutLoading}
                disabled={checkoutLoading}
              >
                Upgrade to Pro
              </Button>
            )}
            <p className="mt-3 text-sm text-gray-500 text-center">
              Or <Link href="/create" className="text-teal-600 font-medium hover:underline">continue with Free</Link>
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Unlimited dossiers</h3>
              <p className="text-sm text-gray-600">No 3-dossier limit. Create as many applications as you need.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Priority support</h3>
              <p className="text-sm text-gray-600">Get help faster when you need it.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Infinity className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">More power</h3>
              <p className="text-sm text-gray-600">Analytics, exports, and custom options.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
