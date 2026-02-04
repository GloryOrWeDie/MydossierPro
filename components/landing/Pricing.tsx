'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PRICE, LINK_VALIDITY_DAYS } from '@/lib/constants';

export default function Pricing() {
  const features = [
    'Professional document dossier',
    'Unique shareable link',
    'Valid for 90 days',
    'Unlimited shares',
    'Secure document storage',
    'Download all as PDF',
    'No hidden fees ever',
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Always free. No credit card required. No catch.
          </p>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-md border-2 border-gray-200 shadow-xl">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                Free Forever
              </div>
              <div className="text-gray-700">No credit card required</div>
            </div>
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-1 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <Link href="/create" className="block">
                <Button size="lg" variant="primary" className="w-full">
                  Get Started Free
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Always free. No catch.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
