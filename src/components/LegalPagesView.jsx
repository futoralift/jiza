import React from 'react';

export default function LegalPagesView({ type, setActiveView }) {
  const isPrivacy = type === 'privacy';

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
        <span className="text-primary font-bold">
          {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 bg-antique-cream border border-heritage-gold/40 rounded-full flex items-center justify-center text-heritage-gold mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-3xl">
            {isPrivacy ? 'policy' : 'gavel'}
          </span>
        </div>
        <h1 className="font-headline-sm text-2xl md:text-3xl font-bold text-on-surface mb-2">
          {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
        </h1>
        <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
          {isPrivacy 
            ? 'Learn how Jiza Jewellery Studio protects and processes your personal data.' 
            : 'Please read the terms and conditions for using the Jiza Jewellery Studio storefront.'}
        </p>
      </div>

      {/* Content Card */}
      <div className="max-w-3xl mx-auto bg-surface-container-lowest border border-heritage-gold/30 rounded-2xl p-6 md:p-10 shadow-sm space-y-6 text-stone-900">
        
        {isPrivacy ? (
          /* PRIVACY POLICY CONTENT */
          <article className="space-y-6 text-xs md:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                1. Introduction &amp; Scope
              </h2>
              <p>
                Welcome to Jiza Jewellery Studio ("we", "our", or "us"). We value your privacy and are committed to protecting your personal data in accordance with the <strong>Indian Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>General Data Protection Regulation (GDPR)</strong>. This Privacy Policy describes how we collect, use, store, and process your personal data when you visit our studio in Pune or use our online storefront.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                2. Data Collection (Consent-Based)
              </h2>
              <p>
                We only collect personal data when you provide explicit consent during account creation, checkout, or when submitting support tickets. The categories of data we collect include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Identity Information:</strong> Full name and registered customer ID.</li>
                <li><strong>Contact Information:</strong> Email address, mobile phone number, and physical shipping address.</li>
                <li><strong>Transaction History:</strong> Details of orders placed, payment methods used, and items purchased.</li>
                <li><strong>Customer Support Records:</strong> Issue descriptions, correspondence history, and user-provided screenshots.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                3. Purpose of Processing
              </h2>
              <p>
                We process your personal data for the following specific purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>To fulfill orders, handle insured shipping, and update stock counts dynamically.</li>
                <li>To synchronize your shopping bag and wishlist across logins.</li>
                <li>To moderate and display verified customer product reviews.</li>
                <li>To respond to support tickets and troubleshoot product issues.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                4. Data Storage, Security, &amp; Retention
              </h2>
              <p>
                All personal data is encrypted in transit using 256-bit TLS/SSL protocols and stored securely in a relational PostgreSQL database hosted on a protected Hostinger KVM VPS. 
              </p>
              <p>
                <strong>Data Retention:</strong> We retain user accounts, carts, and wishlists as long as the account remains active. For transactional accounting, order history data is preserved in an anonymized format even if an account is closed. Support screenshots are automatically removed or converted to secure links to prevent database storage bloat.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                5. User Rights &amp; Permanent Erasure (DPDP &amp; GDPR)
              </h2>
              <p>
                As a data principal, you have the following rights under regional regulations:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Right to Access:</strong> View the profile details, cart registries, and wishlists associated with your login.</li>
                <li><strong>Right to Correction:</strong> Edit and update your profile information in the Account settings dashboard.</li>
                <li><strong>Right to Erasure (Right to Be Forgotten):</strong> Permanently delete your user profile and data.</li>
              </ul>
              <p className="mt-3">
                <strong>How to Delete Your Account:</strong> You can request permanent erasure under the <strong>Profile Tab</strong> by choosing <em>Delete Account</em>. The server will:
              </p>
              <ul className="list-decimal pl-5 space-y-1 mt-1">
                <li>Permanently delete your profile record, wishlist registries, cart records, and verification codes.</li>
                <li>Clean up support tickets and pending review prompts.</li>
                <li>Anonymize all past order entries (setting the name to <code>Deleted Account</code> and email to <code>anonymized@deleted.user</code>) to fulfill legal accounting obligations without retaining personal identifiers.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                6. Cookie Consent &amp; Tracking
              </h2>
              <p>
                We use secure local storage keys (such as <code>jiza_current_user</code>) to authenticate customer sessions and synchronize shopping carts. We do not use tracking cookies for third-party advertising or cross-site monitoring.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                7. Shipping &amp; Refund Reference
              </h2>
              <p>
                All packages are shipped fully insured. For details on exchanges and refunds, please review our exchange guidelines in the Help Center or contact customer support directly.
              </p>
            </section>
          </article>
        ) : (
          /* TERMS AND CONDITIONS CONTENT */
          <article className="space-y-6 text-xs md:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using the Jiza Jewellery Studio online storefront ("Site"), you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Site.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                2. User Account Security
              </h2>
              <p>
                To purchase items, save wishlists, or view order histories, you must register a customer profile. You are responsible for ensuring that the email address and mobile phone number provided are accurate. Since access relies on these contact credentials, you agree to safeguard your contact details and notify us immediately of any unauthorized access to your account.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                3. Products, Pricing, &amp; Inventory Availability
              </h2>
              <p>
                All prices listed on the Site are in Indian Rupees (INR) and are inclusive of standard local taxes unless specified otherwise. We make every effort to display accurate product details, materials, colors, and stock quantities:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We specialize in high-end gold-plated, kundan, polki, and heritage replica fashion jewellery. These are not real gold or fine metals unless stated explicitly.</li>
                <li>Stock quantities are updated automatically when orders are processed. If an item is sold out, we reserve the right to cancel the order or provide a refund.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                4. Orders &amp; Simulated Payments
              </h2>
              <p>
                When you place an order, you agree to pay the listed amount. The storefront currently uses a simulated checkout workflow to test order flows:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Orders generated display a pending status until verified by our studio representatives.</li>
                <li>Actual payment gateway integrations (Razorpay or Stripe) will be enabled in future releases. Until then, transaction records are stored as unpaid draft agreements.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                5. Intellectual Property
              </h2>
              <p>
                All content on this Site, including images, text, brand identifiers, logo assets, layout styling, and door animations, is the property of Jiza Jewellery Studio and is protected by copyright and intellectual property laws. Unauthorized reproduction or use of these assets is prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                6. Limitation of Liability
              </h2>
              <p>
                Jiza Jewellery Studio shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this Site, or from purchasing products, beyond the transaction value of the specific order placed.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-headline-sm text-base md:text-lg font-bold border-b border-outline-variant/30 pb-2">
                7. No Return Policy &amp; All Sales Final
              </h2>
              <p>
                <strong>Strict No-Return &amp; No-Refund Policy:</strong> Please note that Jiza Jewellery Studio operates under a strict <strong>No Return &amp; No Refund Policy</strong>. All sales are final once an order is placed and processed.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Due to the handcrafted, delicate nature of luxury jewellery and strict hygiene standards, we do not accept returns, exchanges, or refunds once dispatched.</li>
                <li>In the rare event of damage during transit or receiving an incorrect product, customers must notify our team within 24 hours of delivery with a mandatory unboxing video to request a replacement.</li>
              </ul>
            </section>
          </article>
        )}

        {/* Action Button */}
        <div className="pt-6 border-t border-outline-variant/30 text-center">
          <button
            onClick={() => setActiveView('home')}
            className="px-6 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 border border-black/25"
          >
            ← Back to Storefront
          </button>
        </div>

      </div>
    </main>
  );
}
