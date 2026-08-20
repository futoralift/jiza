import React from 'react';

export default function ContactDevModal({
  isContactDevModalOpen,
  setIsContactDevModalOpen,
  contactDevTargetFeature
}) {
  if (!isContactDevModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-onyx/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FFF9F9] text-on-surface border border-[#F7B6B0] rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col space-y-4 p-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FCDAD7] text-black border border-black/20 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-xl text-black">support_agent</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-black">Contact Developer</h3>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {contactDevTargetFeature ? `Module: ${contactDevTargetFeature.title}` : 'Jiza Studio Developer Support'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsContactDevModalOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Reach out to our engineering support team directly via WhatsApp or direct call to unlock features or request technical setup:
        </p>

        {/* Developer Contact 1 Card */}
        <div className="bg-white border border-[#F7C5C0] rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-xs text-on-surface">Developer Support 1</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">Primary</span>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <span className="material-symbols-outlined text-black text-lg">phone_in_talk</span>
            <span className="font-mono text-base font-extrabold text-black tracking-wide">
              +91 8452854044
            </span>
          </div>
        </div>

        {/* Developer Contact 2 Card */}
        <div className="bg-white border border-[#F7C5C0] rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-xs text-on-surface">Developer Support 2</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">Direct</span>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <span className="material-symbols-outlined text-black text-lg">phone_in_talk</span>
            <span className="font-mono text-base font-extrabold text-black tracking-wide">
              +91 8446653644
            </span>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => setIsContactDevModalOpen(false)}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-on-surface font-bold text-xs rounded-xl uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
