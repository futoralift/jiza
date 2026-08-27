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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] border border-stone-100 w-full max-w-md overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37]" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors z-10"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px] text-stone-600">close</span>
        </button>

        <div className="p-6">
          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <span className="text-3xl">🌍</span>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-amber-600 mb-0.5">International Order</div>
              <h2 className="font-bold text-lg text-stone-900 leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Shipping to {country || 'International Destination'}
              </h2>
            </div>
          </div>

          {/* Main Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <div className="font-semibold text-amber-900 text-sm mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">info</span>
              Shipping Charge Confirmed After Packing
            </div>
            <p className="text-amber-800 text-xs leading-relaxed">
              International shipping charges are not automatically calculated at checkout. The final cost depends on the <strong>exact packed weight and dimensions</strong> of your jewellery, which we can only determine after careful packaging.
            </p>
          </div>

          {/* Process steps */}
          <div className="space-y-2 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[11px] font-bold text-stone-700 shrink-0 mt-0.5">1</div>
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong>You pay</strong> the product total at checkout via Razorpay.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[11px] font-bold text-stone-700 shrink-0 mt-0.5">2</div>
              <p className="text-xs text-stone-600 leading-relaxed">
                We <strong>carefully pack</strong> your order and weigh the final shipment.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[11px] font-bold text-stone-700 shrink-0 mt-0.5">3</div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Our team <strong>contacts you by phone or WhatsApp</strong> to confirm the shipping charge before dispatch.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[11px] font-bold text-emerald-700 shrink-0 mt-0.5">✓</div>
              <p className="text-xs text-stone-600 leading-relaxed">
                You can <strong>cancel for a full refund</strong> at this stage if you are not comfortable with the shipping charge.
              </p>
            </div>
          </div>

          {/* DDU Notice */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
            <p className="text-xs text-red-800">
              <strong>🛃 DDU — Delivery Duty Unpaid:</strong> All international orders are shipped DDU. Import duties and customs taxes at destination are the customer's responsibility.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onViewPolicy}
              className="flex-1 border border-stone-300 text-stone-700 text-sm font-semibold py-3 rounded-2xl hover:bg-stone-50 transition-colors active:scale-[0.98]"
            >
              View Shipping Policy
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-[#2D1B14] text-white text-sm font-semibold py-3 rounded-2xl hover:bg-[#3D241A] transition-colors active:scale-[0.98]"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
