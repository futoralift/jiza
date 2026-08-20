import React, { useState } from 'react';

export default function FaqView({ setActiveView }) {
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      q: "1. Is your jewellery made of real gold?",
      a: "No. We specialize in premium imitation and fashion jewellery designed to give a luxurious look at an affordable price."
    },
    {
      q: "2. Do you have bridal jewellery?",
      a: "Yes! We offer a wide range of bridal, semi-bridal, and wedding jewellery suitable for brides, bridesmaids, and special occasions."
    },
    {
      q: "3. Can I visit your studio?",
      a: "Yes. You can visit our jewellery studio during business hours. We recommend booking an appointment for a personalized shopping experience."
    },
    {
      q: "4. Do you offer jewellery on rent?",
      a: "Yes, selected bridal and premium jewellery sets are available on rent. Please contact us for availability and rental terms."
    },
    {
      q: "5. How do I track my live order status?",
      a: "You can track your order directly in your Account Dashboard under the 'My Orders' tab, or via the tracking link sent to your registered email & phone."
    },
    {
      q: "6. Are Jiza Jewellery products certified for craftsmanship?",
      a: "All our Kundan, Polki, and Heritage Gold-Plated jewellery pieces are handcrafted with premium quality finish and artisanal care."
    },
    {
      q: "7. What is your delivery time and shipping policy?",
      a: "We offer Free & Fully Insured Express Transit across India. Orders are dispatched within 24 hours and delivered in 2 to 4 business days."
    },
    {
      q: "8. How can I contact Jiza Jewellery Studio?",
      a: "You can reach us at +91 82088 22696 (Phone/WhatsApp) or email us at jizajewellery@gmail.com. You can also visit us at Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar, Pune – 411051."
    },
    {
      q: "9. What is your return or exchange policy?",
      a: "Please note that we operate under a strict No Return & No Refund Policy due to hygiene and the handcrafted nature of luxury jewellery. All sales are final. In case of transit damage, please contact us within 24 hours with an unboxing video."
    },
    {
      q: "10. How do I care for and clean my jewellery?",
      a: "Store your jewellery in a dry velvet pouch or box. Avoid direct contact with perfumes, sprays, or moisture to preserve the finish and stone lustre."
    }
  ];

  return (
    <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 pb-24 min-h-[75vh] animate-fadeIn">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-on-surface-variant mb-6">
        <button 
          onClick={() => setActiveView('home')} 
          className="hover:text-heritage-gold transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          <span>Home</span>
        </button>
        <span>/</span>
        <span className="text-primary font-bold">Help Center &amp; FAQs</span>
      </div>

      {/* Page Title & Intro */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 bg-antique-cream border border-heritage-gold/40 rounded-full flex items-center justify-center text-heritage-gold mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-3xl">quiz</span>
        </div>
        <h1 className="font-headline-sm text-2xl md:text-3xl font-bold text-on-surface mb-2">
          Help Center &amp; FAQs
        </h1>
        <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
          Have questions about our jewellery, studio visits, or rentals? Find instant answers below or reach out directly to Jiza Jewellery Studio.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Official Contact Information Card */}
        <div className="bg-surface-container-lowest border border-heritage-gold/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-antique-cream border border-heritage-gold/40 flex items-center justify-center text-heritage-gold">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">Contact Information</h3>
              <p className="text-xs text-on-surface-variant">Get in touch with Jiza Studio Pune</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Business Address */}
            <div className="p-4 bg-[#F9F6F0] rounded-xl border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-base">location_on</span>
                <span>Business Address</span>
              </div>
              <p className="text-on-surface leading-relaxed">
                Shop No.17, 1st Floor, Shivpushp Landmark,<br />
                Suncity Road, Anand Nagar,<br />
                <strong>Pune – 411051</strong>
              </p>
            </div>

            {/* Phone & WhatsApp */}
            <div className="p-4 bg-[#F9F6F0] rounded-xl border border-outline-variant/30 space-y-2">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-base">call</span>
                <span>Phone &amp; WhatsApp Support</span>
              </div>
              <div className="space-y-1 text-on-surface">
                <p>
                  <strong>Phone: </strong>
                  <a href="tel:8208822696" className="text-primary hover:underline font-bold">8208822696</a>
                </p>
                <p>
                  <strong>WhatsApp: </strong>
                  <a 
                    href="https://wa.me/918208822696?text=Hello%20Jiza%20Jewellery%20Studio" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>8208822696 (Chat Now 💬)</span>
                  </a>
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="p-4 bg-[#F9F6F0] rounded-xl border border-outline-variant/30 space-y-1.5 md:col-span-2">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-base">mail</span>
                <span>Email Support</span>
              </div>
              <p className="text-on-surface">
                <a href="mailto:jizajewellery@gmail.com" className="text-primary hover:underline font-bold text-sm">
                  jizajewellery@gmail.com
                </a>
              </p>
            </div>

          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-antique-cream border border-heritage-gold/40 flex items-center justify-center text-heritage-gold">
              <span className="material-symbols-outlined text-2xl">help_outline</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">Frequently Asked Questions</h3>
              <p className="text-xs text-on-surface-variant">Click any question to view the answer</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className="border border-outline-variant/40 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex justify-between items-center bg-[#F9F6F0] hover:bg-antique-cream/40 transition-colors focus:outline-none"
                  >
                    <span className="font-bold text-xs md:text-sm text-on-surface pr-2">{faq.q}</span>
                    <span className="material-symbols-outlined text-heritage-gold text-sm shrink-0">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white text-xs md:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/30 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </main>
  );
}
