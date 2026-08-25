import React from 'react';

export default function ContactUsModal({ isOpen, onClose }) {
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
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div>
              <h2 
                className="text-base sm:text-lg font-bold text-black tracking-wide"
                style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
              >
                Contact Us
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-widest text-black/70 block">
                Jiza Jewellery Studio Support
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

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-900 leading-relaxed">
          
          {/* Welcome Banner */}
          <div className="text-center pb-2">
            <p className="font-semibold text-stone-800 text-xs sm:text-sm">
              We're here to help! Reach out for jewellery queries, custom bridal appointments, order status, or studio visits.
            </p>
          </div>

          {/* Quick Action Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* WhatsApp Direct */}
            <a
              href="https://wa.me/918208822696?text=Hello%20Jiza%20Jewellery%20Studio%2C%20I%20have%20an%20inquiry%20regarding%20jewellery."
              target="_blank"
              rel="noreferrer"
              className="p-3.5 bg-white hover:bg-emerald-50/60 border border-black/10 hover:border-emerald-500/40 rounded-2xl flex items-center gap-3 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-black">WhatsApp Chat</div>
                <div className="text-[11px] text-emerald-700 font-semibold">+91 82088 22696</div>
              </div>
            </a>

            {/* Direct Phone Call */}
            <a
              href="tel:8208822696"
              className="p-3.5 bg-white hover:bg-rose-50/60 border border-black/10 hover:border-black/30 rounded-2xl flex items-center gap-3 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FCDAD7] text-black border border-black/15 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">call</span>
              </div>
              <div>
                <div className="text-xs font-bold text-black">Phone Helpline</div>
                <div className="text-[11px] text-stone-700 font-semibold">8208822696</div>
              </div>
            </a>

            {/* Email Contact */}
            <a
              href="mailto:jizajewellery@gmail.com"
              className="p-3.5 bg-white hover:bg-stone-50 border border-black/10 hover:border-black/30 rounded-2xl flex items-center gap-3 transition-all shadow-xs group cursor-pointer sm:col-span-2"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-black border border-black/15 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-black">Email Support</div>
                <div className="text-[11px] text-stone-700 font-semibold truncate">jizajewellery@gmail.com</div>
              </div>
            </a>

          </div>

          {/* Pune Studio Address Card */}
          <div className="p-4 bg-white border border-black/10 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-black font-bold text-xs">
              <span className="material-symbols-outlined text-base">location_on</span>
              <span>Pune Studio Location</span>
            </div>
            <p className="text-stone-700 text-[11px] sm:text-xs leading-relaxed pl-6">
              Shop No.17, 1st Floor, Shivpushp Landmark,<br />
              Suncity Road, Anand Nagar,<br />
              <strong>Pune – 411051, Maharashtra</strong>
            </p>
            <div className="pl-6 pt-1 text-[11px] text-stone-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">schedule</span>
              <span>Open 7 Days a Week: 11:00 AM – 9:00 PM</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-black/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold rounded-xl text-xs transition-colors border border-black/20"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
