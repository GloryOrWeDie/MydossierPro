'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Upload, Link as LinkIcon, Share2, Clock, Shield, Zap, Star } from 'lucide-react'
import ExampleModal from '@/components/ExampleModal'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-dark">
            Dossier<span className="text-coral-500">Pro</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#how-it-works" className="text-dark-light hover:text-dark transition-colors">
              How It Works
            </Link>
            <Link href="#features" className="text-dark-light hover:text-dark transition-colors">
              Features
            </Link>
            <Link href="/create" className="px-6 py-2.5 bg-coral-500 text-white rounded-lg font-semibold hover:bg-coral-600 transition-all hover:shadow-coral">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-coral-50 via-white to-teal-50 min-h-screen pt-32 pb-20">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-coral-200 rounded-full blur-3xl opacity-40 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-40 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className={`${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-gray-200 mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-gray-700">100% Free • No Credit Card</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Land Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-teal-500 mt-2">
                  Dream Apartment
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create a professional rental application in 5 minutes. 
                Stand out from other applicants and get approved faster.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/create"
                  className="group px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg hover:bg-coral-600 shadow-lg shadow-coral-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Create Free Dossier
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={() => setShowExample(true)}
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 border-2 border-gray-200 transition-all"
                >
                  See Example
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={3} />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={3} />
                  <span>Ready in 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={3} />
                  <span>2,500+ created</span>
                </div>
              </div>
            </div>

            {/* Right: Visual Mockup */}
            <div className={`relative ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              {/* Main PDF Mockup */}
              <div className="relative z-10 transform hover:rotate-1 transition-transform duration-500">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  {/* PDF Header Preview */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="text-sm opacity-80 mb-2">RENTAL APPLICATION</div>
                    <div className="text-2xl font-bold">JOHN SMITH</div>
                    <div className="text-sm opacity-80 mt-1">25 years old • Software Developer</div>
                  </div>
                  
                  {/* PDF Body Preview */}
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="border-2 border-gray-200 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">EMPLOYMENT</div>
                        <div className="font-semibold text-sm">Desjardins</div>
                      </div>
                      <div className="border-2 border-gray-200 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">INCOME</div>
                        <div className="font-semibold text-sm">$5,500/mo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200 animate-float">
                <div className="text-3xl font-bold text-coral-500">2,500+</div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-3xl font-bold text-teal-500">4.9/5</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Dead Simple Process</h2>
            <p className="text-xl text-gray-600">Three steps. Five minutes. Done.</p>
          </div>

          {/* Connection Line */}
          <div className="relative">
            <div className="hidden lg:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-coral-200 via-teal-200 to-coral-200 mx-32" />

            <div className="grid lg:grid-cols-3 gap-12 relative">
              {[
                {
                  number: 1,
                  icon: <Upload className="w-8 h-8 text-coral-500 flex-shrink-0" strokeWidth={2} />,
                  title: 'Upload Documents',
                  description: 'Add your pay stub, ID, and any other documents. All files are encrypted and secure.',
                },
                {
                  number: 2,
                  icon: <LinkIcon className="w-8 h-8 text-teal-500" />,
                  title: 'Get Your Link',
                  description: 'Instantly receive your unique shareable link. Valid for 90 days, unlimited uses.',
                },
                {
                  number: 3,
                  icon: <Share2 className="w-8 h-8 text-coral-500 flex-shrink-0" strokeWidth={2} />,
                  title: 'Share with Landlords',
                  description: 'Send your link to any landlord. They can view and download everything instantly.',
                },
              ].map((step, i) => (
                <div key={i} className="relative group">
                  {/* Number Badge */}
                  <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-coral-500 to-teal-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <span className="text-3xl font-bold text-white">{step.number}</span>
                  </div>

                  {/* Content Card */}
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <div className="flex-shrink-0">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-center">{step.title}</h3>
                    <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link 
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-4 bg-coral-500 text-white rounded-xl font-semibold text-lg hover:bg-coral-600 shadow-lg shadow-coral-500/30 transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features / Why Choose */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why Choose DossierPro?</h2>
            <p className="text-xl text-gray-600">Stand out and get approved faster</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Clock className="w-8 h-8 text-coral-500" />,
                title: 'Save 5+ Hours',
                description: 'No more filling out multiple applications. Create once, share everywhere.',
                color: 'coral',
              },
              {
                icon: <Check className="w-8 h-8 text-teal-500 flex-shrink-0" strokeWidth={2} />,
                title: 'Look Professional',
                description: 'Present yourself as a serious, prepared tenant with a polished application.',
                color: 'teal',
              },
              {
                icon: <Zap className="w-8 h-8 text-coral-500" />,
                title: 'Apply to 10+ Apartments',
                description: 'Use your link as many times as you want. One payment, unlimited applications.',
                color: 'coral',
              },
              {
                icon: <Shield className="w-8 h-8 text-teal-500 flex-shrink-0" strokeWidth={2} />,
                title: 'Secure & Verified',
                description: 'Your documents are encrypted and stored securely. Verified by DossierPro.',
                color: 'teal',
              },
            ].map((feature, i) => (
              <div key={i} className="group hover:-translate-y-2 transition-transform">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-shadow h-full">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center ${
                    feature.color === 'coral' ? 'bg-coral-100' : 'bg-teal-100'
                  }`}>
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Loved by Renters</h2>
            <p className="text-xl text-gray-600">See what people are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Got 3 replies in 24 hours! Landlords were impressed with how professional my application looked.",
                name: "Sarah M.",
                location: "Montreal, QC",
                rating: 5,
              },
              {
                quote: "Saved me so much time. I applied to 8 apartments in one day. Found my perfect place in a week!",
                name: "Mike T.",
                location: "Toronto, ON",
                rating: 5,
              },
              {
                quote: "The landlord told me I was the most organized applicant. Worth every penny... wait, it's free!",
                name: "Jessica L.",
                location: "Vancouver, BC",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-shadow">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" strokeWidth={0} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral-400 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-dark">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-br from-coral-500 to-teal-500 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-6xl font-bold mb-6">
            Ready to Get Approved?
          </h2>
          <p className="text-2xl mb-12 opacity-90 leading-relaxed">
            Join 2,500+ renters who found their perfect apartment with DossierPro
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link 
              href="/create"
              className="px-12 py-5 bg-white text-coral-500 rounded-xl font-bold text-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
            >
              Create Free Dossier
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-lg opacity-90">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
              <span>Ready in 5 min</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
              <span>100% free</span>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-12 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <span>Instant activation</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 flex-shrink-0" strokeWidth={2} fill="currentColor" />
              <span>Higher approval rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-2xl font-bold mb-4">
                Dossier<span className="text-coral-500">Pro</span>
              </div>
              <p className="text-dark-lighter">
                Create professional rental applications in minutes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-dark-lighter">
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/create" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-dark-lighter">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-dark-lighter">
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dark-light pt-8 text-center text-dark-lighter">
            <p>&copy; 2026 DossierPro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Example Modal */}
      <ExampleModal 
        isOpen={showExample} 
        onClose={() => setShowExample(false)} 
      />
    </div>
  )
}
