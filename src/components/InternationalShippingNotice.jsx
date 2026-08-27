import { useEffect } from 'react';

/**
 * International Shipping Notice Modal
 * 
 * Shown when customer changes delivery country to a non-India destination.
 * Informs them that the shipping charge will be confirmed after packing,
 * not at checkout. Customer can view the shipping policy or continue.
 */
export default function InternationalShippingNotice({ isOpen, onClose, onViewPolicy, country }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/65 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.35)] border border-stone-200 w-full max-w-md my-auto max-h-[88vh] flex flex-col overflow-hidden z-10 animate-scaleUp">

        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] shrink-0" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors z-20 cursor-pointer shadow-xs"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px] text-stone-600">close</span>
        </button>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-3.5">
          {/* Icon & Title */}
          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="text-2xl sm:text-3xl">🌍</span>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-amber-700 mb-0.5">International Order</div>
              <h2 className="font-bold text-base sm:text-lg text-stone-900 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Shipping to {country || 'International Destination'}
              </h2>
            </div>
          </div>

          {/* Main Notice */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 sm:p-4">
            <div className="font-bold text-amber-950 text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-700 text-base">info</span>
              <span>Shipping Charge Confirmed After Packing</span>
            </div>
            <p className="text-amber-900 text-[11px] sm:text-xs leading-relaxed">
              International shipping charges are not collected at checkout. The final cost depends on the <strong>exact packed weight and box dimensions</strong> of your jewellery, confirmed after safe packaging.
            </p>
          </div>

          {/* Process steps */}
          <div className="space-y-2 py-0.5">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-stone-900 shrink-0 mt-0.5">1</div>
              <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed">
                <strong>You pay</strong> only the product total now at checkout via Razorpay.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-stone-900 shrink-0 mt-0.5">2</div>
              <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed">
                We <strong>securely pack</strong> your jewellery and record the parcel weight.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-stone-900 shrink-0 mt-0.5">3</div>
              <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed">
                Our team <strong>contacts you on WhatsApp / Phone</strong> to confirm the exact courier rate before dispatch.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-emerald-800 shrink-0 mt-0.5">✓</div>
              <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed">
                You can <strong>cancel for a 100% instant refund</strong> if you don't approve the shipping cost.
              </p>
            </div>
          </div>

          {/* DDU Notice */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 sm:p-3">
            <p className="text-[10px] sm:text-xs text-red-900 leading-relaxed">
              <strong>🛃 DDU — Delivery Duty Unpaid:</strong> Any destination customs duties/taxes are the recipient's responsibility as per local country regulations.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onViewPolicy}
              className="flex-1 border border-stone-300 text-stone-700 text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-xl hover:bg-stone-50 transition-colors active:scale-95 cursor-pointer text-center"
            >
              Shipping Policy
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-black hover:bg-stone-800 text-white text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-xl transition-colors active:scale-95 cursor-pointer shadow-md text-center"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
