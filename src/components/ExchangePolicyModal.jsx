import React from 'react';

export default function ExchangePolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#FFF9F9] border border-[#F8B3AC] rounded-3xl shadow-2xl overflow-hidden z-10 animate-scaleUp max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#FCDAD7] p-5 pb-4 border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black/5 border border-black/15 flex items-center justify-center text-black shadow-sm">
              <span className="material-symbols-outlined text-2xl">published_with_changes</span>
            </div>
            <div>
              <h2 
                className="text-base sm:text-lg font-bold text-black tracking-wide"
                style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
              >
                Exchange Policy
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-widest text-black/70 block">
                Strict Customer Guidelines
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-900 leading-relaxed">
          
          {/* Important Alert Banner */}
          <div className="bg-red-50 border-2 border-red-400/60 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <span className="material-symbols-outlined text-red-600 text-2xl shrink-0 mt-0.5">
              videocam
            </span>
            <div className="space-y-1">
              <h3 className="text-red-900 font-bold text-xs sm:text-sm uppercase tracking-wide">
                Mandatory Unboxing Video Proof Required
              </h3>
              <p className="text-red-800 text-[11px] sm:text-xs leading-relaxed">
                Exchange is strictly <strong>ONLY</strong> available if you have continuous, clear unboxing video proof showing the outer sealed parcel being opened and the broken jewellery item inside.
              </p>
            </div>
          </div>

          {/* Key Policy Rules Card Grid */}
          <div className="grid grid-cols-1 gap-3">
            
            {/* Rule 1: 10-Hour Strict Time Limit */}
            <div className="bg-white border border-black/10 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#FCDAD7] text-black font-bold flex items-center justify-center shrink-0 border border-black/10">
                <span className="material-symbols-outlined text-lg">schedule</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-black text-xs">Strict 10-Hour Window from Delivery</h4>
                <p className="text-stone-600 text-[11px]">
                  Exchange requests must be submitted within <strong>10 hours of package delivery</strong>. Claims submitted after 10 hours cannot be entertained under any circumstances.
                </p>
              </div>
            </div>

            {/* Rule 2: Broken Jewellery Only */}
            <div className="bg-white border border-black/10 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 border border-amber-300">
                <span className="material-symbols-outlined text-lg">broken_image</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-black text-xs">Applicable Strictly for Broken Jewellery</h4>
                <p className="text-stone-600 text-[11px]">
                  Exchanges are strictly and exclusively applicable <strong>ONLY for broken / damaged jewellery</strong> received in transit. Personal preference or change-of-mind exchanges are not eligible due to strict hygiene and luxury craftsmanship standards.
                </p>
              </div>
            </div>

            {/* Rule 3: Missing Video = Void Claim */}
            <div className="bg-white border border-black/10 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-900 font-bold flex items-center justify-center shrink-0 border border-rose-300">
                <span className="material-symbols-outlined text-lg">cancel</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-black text-xs">Non-Claimable Conditions</h4>
                <p className="text-stone-600 text-[11px]">
                  Claims cannot be claimed if:
                  <span className="block mt-1 font-semibold text-rose-800">• Time has exceeded 10 hours of delivery timestamp.</span>
                  <span className="block font-semibold text-rose-800">• Unboxing video proof is missing or parcel was pre-opened.</span>
                </p>
              </div>
            </div>

          </div>

          {/* Step-by-step How to Claim */}
          <div className="bg-[#FCDAD7]/30 border border-black/10 rounded-xl p-3.5 space-y-2 text-[11px] sm:text-xs">
            <p className="font-bold text-black flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-black">check_circle</span>
              How to Record Your Unboxing Video:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-stone-700">
              <li>Keep the parcel fully sealed as received from courier.</li>
              <li>Show the printed shipping label clearly in the frame.</li>
              <li>Start recording continuous video without pause or edits.</li>
              <li>Open the tamper-evident packaging and display the broken jewellery piece closely.</li>
              <li>Send the video to our team on WhatsApp within 10 hours.</li>
            </ol>
          </div>

        </div>

        {/* Modal Footer with Direct WhatsApp Submission */}
        <div className="p-4 bg-white border-t border-black/10 flex flex-col sm:flex-row gap-2 shrink-0">
          <a
            href="https://wa.me/918208822696?text=Hello%20Jiza%20Jewellery%20Studio%2C%20I%20want%20to%20apply%20for%20an%20Exchange%20for%20broken%20jewellery%20with%20my%20unboxing%20video%20proof."
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#1EBE57] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-95"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Submit Claim via WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-stone-100 hover:bg-stone-200 text-black font-bold rounded-xl text-xs transition-colors"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
