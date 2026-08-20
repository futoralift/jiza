import React from 'react';

export default function CancellationPolicyView({ setActiveView }) {
  return (
    <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 pb-24 min-h-[75vh] animate-fadeIn">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-on-surface-variant mb-6">
        <button 
          onClick={() => setActiveView('home')} 
          className="hover:text-heritage-gold transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          <span>Home</span>
        </button>
        <span>/</span>
        <span className="text-primary font-bold">
          Order Modification &amp; Cancellation Policy
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 bg-antique-cream border border-heritage-gold/40 rounded-full flex items-center justify-center text-heritage-gold mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-3xl">
            published_with_changes
          </span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-heritage-gold mb-1 block">
          Transparent Customer Protection
        </span>
        <h1 className="font-headline-sm text-2xl md:text-3xl font-bold text-on-surface mb-2">
          Order Modification &amp; Cancellation Policy
        </h1>
        <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
          Complete flexibility to modify or cancel your jewellery order within 2 hours of placement.
        </p>
      </div>

      {/* Policy Highlights Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#FFF9F9] border border-[#F8B3AC]/50 rounded-2xl p-5 shadow-xs flex flex-col items-start space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#FCDAD7] text-black border border-black/20 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl text-black">timer</span>
          </div>
          <h3 className="font-headline-sm text-sm font-bold text-black">2-Hour Window</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Modify shipping address, change product variants, add items, or cancel the order within 120 minutes of placement.
          </p>
        </div>

        <div className="bg-[#FFF9F9] border border-[#F8B3AC]/50 rounded-2xl p-5 shadow-xs flex flex-col items-start space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">currency_rupee</span>
          </div>
          <h3 className="font-headline-sm text-sm font-bold text-black">100% Instant Refund</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Cancellations during the 2-hour window trigger immediate refund processing back to your original payment method.
          </p>
        </div>

        <div className="bg-[#FFF9F9] border border-[#F8B3AC]/50 rounded-2xl p-5 shadow-xs flex flex-col items-start space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#FCDAD7] text-black border border-black/20 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl text-black">storefront</span>
          </div>
          <h3 className="font-headline-sm text-sm font-bold text-black">Studio Pickup &amp; Ship</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Both Home Delivery and Studio Pickup orders enjoy the same flexible 2-hour modification and cancellation policy.
          </p>
        </div>
      </div>

      {/* Main Policy Content Card */}
      <div className="max-w-4xl mx-auto bg-surface-container-lowest border border-black/15 rounded-2xl p-6 md:p-10 shadow-sm space-y-8 text-stone-900">
        
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-xl">hourglass_top</span>
            <h2 className="font-headline-sm text-base md:text-lg font-bold text-black">
              1. The 2-Hour Order Modification &amp; Cancellation Policy Window
            </h2>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-on-surface-variant">
            At Jiza Jewellery Studio, we handcraft and inspect each heritage jewellery piece with highest precision. To prevent shipping delays and maintain exact inventory synchronicity, <strong>customers can modify or cancel an order strictly within 2 hours (120 minutes) of successful order placement</strong>.
          </p>
          <div className="p-4 bg-[#FCDAD7]/30 border border-black/15 rounded-xl text-xs space-y-1.5 font-medium">
            <p className="font-bold text-black flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-black">info</span>
              Backend Enforced Policy:
            </p>
            <p className="text-on-surface-variant">
              The 2-hour countdown starts automatically from the database timestamp when your order payment is verified. Live countdown timers are displayed in your <strong>Profile &gt; My Orders</strong> dashboard.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-xl">edit_note</span>
            <h2 className="font-headline-sm text-base md:text-lg font-bold text-black">
              2. What Can Be Modified During the 2-Hour Window
            </h2>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-on-surface-variant">
            During the active 2-hour window, you can perform the following modifications directly from your account:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-on-surface-variant">
            <li>
              <strong>Delivery / Shipping Address &amp; Contact Details:</strong> Update the recipient name, delivery street address, city, state, pincode, or phone number.
            </li>
            <li>
              <strong>Studio Pickup Details:</strong> For Store Pickup orders, update the designated pickup person's name, phone number, or add special collection instructions.
            </li>
            <li>
              <strong>Change Product Variants:</strong> Swap necklace length, bangle size, ring size, or stone colour (subject to availability).
            </li>
            <li>
              <strong>Add New Products to Order:</strong> Add matching earrings, bangles, or accessories from our in-stock catalog. Our system revalidates real-time inventory from PostgreSQL before confirming additions.
            </li>
            <li>
              <strong>Cancel Order:</strong> 1-click self-service cancellation with automated inventory restocking and payment refund initiation.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-xl">lock_clock</span>
            <h2 className="font-headline-sm text-base md:text-lg font-bold text-black">
              3. Policy After the 2-Hour Window
            </h2>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-on-surface-variant">
            After exactly 2 hours, the order automatically enters the <strong>Processing &amp; Secure Dispatch</strong> pipeline. At this stage:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-on-surface-variant">
            <li>All modification and cancellation controls are automatically locked and blocked by our backend servers.</li>
            <li>Items are packaged in tamper-evident velvet cases and handed over to insured BlueDart / SpeedPost couriers.</li>
            <li>If you have genuine emergency concerns after 2 hours, please contact our support team at <a href="mailto:jizajewellery@gmail.com" className="text-black font-bold underline">jizajewellery@gmail.com</a> or WhatsApp <a href="https://wa.me/918208822696" className="text-black font-bold underline">+91 82088 22696</a> for assistance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-xl">payments</span>
            <h2 className="font-headline-sm text-base md:text-lg font-bold text-black">
              4. Payment Reversals &amp; Refund Timelines
            </h2>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-on-surface-variant">
            When an order is cancelled within the 2-hour window:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-on-surface-variant">
            <li><strong>Instant Reversal:</strong> The cancellation is recorded, and a refund instruction is automatically issued to Razorpay / your banking partner.</li>
            <li><strong>UPI Payments:</strong> Refunds typically reflect within <strong>2 to 24 hours</strong>.</li>
            <li><strong>Credit / Debit Cards &amp; Net Banking:</strong> Refunds reflect in your source account within <strong>2 to 5 business days</strong> depending on your bank's settlement cycle.</li>
            <li><strong>No Cancellation Surcharge:</strong> Cancellations made within the 2-hour window are 100% free of charge with zero deduction.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-xl">store</span>
            <h2 className="font-headline-sm text-base md:text-lg font-bold text-black">
              5. Store Pickup Orders Guidelines
            </h2>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-on-surface-variant">
            For customers opting for <strong>Studio / Store Pickup</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-on-surface-variant">
            <li><strong>Location:</strong> Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar, Pune – 411051.</li>
            <li><strong>Ready Window:</strong> Pickup orders are prepared within 2-4 hours of order placement.</li>
            <li><strong>Verification:</strong> Please present your Order Confirmation ID and a valid Government Photo ID at the pickup counter.</li>
            <li><strong>Holding Period:</strong> Studio orders are held securely for up to 7 business days from order placement.</li>
          </ul>
        </section>

        <div className="pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setActiveView('profile')}
            className="w-full sm:w-auto px-6 py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold rounded-xl shadow border border-black/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            <span>View My Orders &amp; Modify</span>
          </button>

          <button
            onClick={() => setActiveView('faq')}
            className="w-full sm:w-auto px-6 py-3 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold rounded-xl border border-outline-variant transition-all cursor-pointer"
          >
            Need Help? Visit FAQ
          </button>
        </div>

      </div>

    </main>
  );
}
