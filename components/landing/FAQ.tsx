'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What documents do I need?',
    answer: 'You need three documents: a recent pay stub (proof of income), your previous lease agreement, and a photo ID (driver\'s license or passport). All files must be in PDF, JPG, or PNG format and under 5MB each.',
  },
  {
    question: 'How long is my link valid?',
    answer: 'Your DossierPro link is valid for 90 days from the date of purchase. You can share it with unlimited landlords during this time.',
  },
  {
    question: 'Is my information secure?',
    answer: 'Absolutely! Your documents are encrypted and stored securely using Supabase. Only people with your unique link can view them. We use industry-standard security practices to protect your data.',
  },
  {
    question: 'Can I update my documents after purchase?',
    answer: 'Currently, documents cannot be updated after purchase. Make sure all your documents are current and accurate before completing your purchase. We\'re working on an update feature for future releases.',
  },
  {
    question: 'What if a landlord can\'t access my link?',
    answer: 'If a landlord is having trouble accessing your link, make sure the link is correct and hasn\'t expired. You can always generate a new link by creating a new profile. If the problem persists, contact our support team.',
  },
  {
    question: 'Do landlords need to sign up to view my profile?',
    answer: 'No! Landlords can view your profile without creating an account or signing up. They simply click the link you share with them to view your complete rental application.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Due to the digital nature of our service, we do not offer refunds. However, if you experience any technical issues, please contact our support team and we\'ll do our best to help.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards through our secure Stripe payment processor. Your payment information is never stored on our servers.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about DossierPro
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
