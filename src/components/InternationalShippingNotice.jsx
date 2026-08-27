import { useState, useEffect } from 'react';

/**
 * International Shipping Notice Modal
 * 
 * Shown when customer changes delivery country to a non-India destination.
 * Informs them that the shipping charge will be confirmed after packing,
 * not at checkout. Customer can view quick policy details inline or continue.
 */
export default function InternationalShippingNotice({ isOpen, onClose, onViewPolicy, country }) {
  const [showInlinePolicy, setShowInlinePolicy] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowInlinePolicy(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[999999]" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100dvh',
        pointerEvents: 'auto'
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
      />

      {/* Modal Dialog Card - Positioned strictly at exact 50% X / 50% Y center */}
      <div 
        className="bg-white rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.5)] border border-stone-200 flex flex-col overflow-hidden z-10"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100vw - 32px)',
          maxWidth: '410px',
          maxHeight: 'min(72dvh, 72vh, 520px)',
          boxSizing: 'border-box',
          margin: 0
        }}
      >
        {/* Top gold accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] shrink-0" />

        {/* Modal Header */}
        <div className="relative px-4 pt-3.5 pb-2.5 shrink-0 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 pr-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="text-xl">🌍</span>
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-[0.15em] text-amber-700">International Order</div>
              <h2 className="font-bold text-sm text-stone-900 leading-tight truncate max-w-[220px]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Shipping to {country || 'International'}
              </h2>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[16px] text-stone-600">close</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 overflow-y-auto overscroll-contain space-y-2.5 text-left flex-grow">
          {/* Notice banner */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-2.5">
            <div className="font-bold text-amber-950 text-xs mb-0.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-700 text-sm">info</span>
              <span>Shipping Charge Confirmed After Packing</span>
            </div>
            <p className="text-amber-900 text-[11px] leading-relaxed">
              International courier freight is not collected at checkout. The exact rate depends on <strong>parcel weight & dimensions</strong> after secure packaging.
            </p>
          </div>

          {/* 4 Process steps */}
          <div className="space-y-1.5 py-0.5">
            <div className="flex items-start gap-2">
              <div className="w-4.5 h-4.5 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[10px] font-bold text-stone-900 shrink-0 mt-0.5">1</div>
              <p className="text-[11px] text-stone-700 leading-snug">
                <strong>You pay</strong> product total at checkout via Razorpay.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4.5 h-4.5 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[10px] font-bold text-stone-900 shrink-0 mt-0.5">2</div>
              <p className="text-[11px] text-stone-700 leading-snug">
                We <strong>carefully pack</strong> your jewellery and weigh the parcel.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4.5 h-4.5 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] flex items-center justify-center text-[10px] font-bold text-stone-900 shrink-0 mt-0.5">3</div>
              <p className="text-[11px] text-stone-700 leading-snug">
                Our team <strong>contacts you on WhatsApp / Call</strong> with courier rate.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[10px] font-bold text-emerald-800 shrink-0 mt-0.5">✓</div>
              <p className="text-[11px] text-stone-700 leading-snug">
                You can <strong>cancel for a 100% instant refund</strong> if not approved.
              </p>
            </div>
          </div>

          {/* DDU Notice */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-2">
            <p className="text-[10px] text-red-900 leading-snug">
              <strong>🛃 DDU (Delivery Duty Unpaid):</strong> Destination customs duties/import taxes are customer responsibility.
            </p>
          </div>

          {/* Expandable Policy Details */}
          {showInlinePolicy ? (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[11px] text-stone-700 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-stone-900 pb-1 border-b border-stone-200">
                <span>International Delivery Timelines</span>
                <button 
                  type="button" 
                  onClick={() => setShowInlinePolicy(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                >
                  Hide ▲
                </button>
              </div>
              <p>• <strong>Partners:</strong> DHL Express / FedEx / Aramex.</p>
              <p>• <strong>Timeline:</strong> 7–12 business days delivery post-dispatch.</p>
              <p>• <strong>Payment:</strong> Jewellery paid now; courier freight paid post-packing.</p>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={onViewPolicy}
                  className="text-xs text-amber-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Policy Document</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowInlinePolicy(true)}
              className="w-full text-center text-[11px] text-amber-800 font-semibold hover:underline py-0.5 cursor-pointer block"
            >
              📋 View Delivery Timelines & Policy Details ▼
            </button>
          )}
        </div>

        {/* Pinned Bottom Action Buttons */}
        <div className="p-3 bg-stone-50 border-t border-stone-100 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onViewPolicy}
            className="flex-1 border border-stone-300 text-stone-700 text-xs font-bold py-2.5 rounded-xl hover:bg-stone-100 transition-colors active:scale-95 cursor-pointer text-center"
          >
            Shipping Policy
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-black hover:bg-stone-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors active:scale-95 cursor-pointer shadow-md text-center"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
