'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Profile = { is_pro?: boolean; pro_expires_at?: string | null } | null;

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [mounted, setMounted] = useState(false);

  const isPro = Boolean(
    profile?.is_pro && profile?.pro_expires_at && new Date(profile.pro_expires_at) > new Date()
  );
  const isHome = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const supabase = createSupabaseClient();

    const getAuthAndProfile = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
      if (u?.id) {
        try {
          const { data: p } = await supabase
            .from('profiles')
            .select('is_pro, pro_expires_at')
            .eq('id', u.id)
            .maybeSingle();
          setProfile(p ?? null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    };

    getAuthAndProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getAuthAndProfile();
    });
    return () => subscription.unsubscribe();
  }, [mounted]);

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-dark">
            Dossier<span className="text-coral-500">Pro</span>
          </Link>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-dark">
          Dossier<span className="text-coral-500">Pro</span>
        </Link>

        <div className="flex items-center gap-6">
          {isHome && (
            <>
              <Link href="#how-it-works" className="text-dark-light hover:text-dark transition-colors">
                How It Works
              </Link>
              <Link href="#features" className="text-dark-light hover:text-dark transition-colors">
                Features
              </Link>
            </>
          )}

          {!user ? (
            <>
              <Link href="/login" className="text-dark-light hover:text-dark transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="text-dark-light hover:text-dark transition-colors">
                Sign Up
              </Link>
              <Link href="/upgrade" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
                Upgrade to Pro
              </Link>
              <Link href="/create" className="px-6 py-2.5 bg-coral-500 text-white rounded-lg font-semibold hover:bg-coral-600 transition-all hover:shadow-coral">
                Get Started Free
              </Link>
            </>
          ) : isPro ? (
            <>
              <span className="text-gray-700 font-medium">Pro Account ✨</span>
              <Link href="/dashboard" className="text-dark-light hover:text-dark transition-colors">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-dark-light hover:text-dark transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/upgrade" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
                Upgrade to Pro
              </Link>
              <Link href="/dashboard" className="text-dark-light hover:text-dark transition-colors">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-dark-light hover:text-dark transition-colors"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
