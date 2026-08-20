import React from 'react';

export default function AdminHeader() {
  return (
    <header className="w-full h-12 bg-[#FCDAD7] border-b border-[#F7B6B0] px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
      
      {/* CENTER: Small Diamond Logo + Brand Name */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-1.5 pointer-events-auto">
        <div className="w-5 h-5 rounded-full bg-black/10 border border-black/20 flex items-center justify-center text-black shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            diamond
          </span>
        </div>

        <span className="font-headline-sm text-xs md:text-sm text-black font-bold tracking-tight whitespace-nowrap drop-shadow-sm" style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}>
          Jiza Jewellery Studio
        </span>
      </div>

      {/* FAR RIGHT: Admin Panel Badge */}
      <div className="ml-auto flex items-center">
        <span className="bg-black text-[#FCDAD7] text-[10px] px-2.5 py-0.5 rounded-md border border-black/20 font-bold flex items-center gap-1 shadow-xs">
          <span className="material-symbols-outlined text-[12px] text-[#FCDAD7]">admin_panel_settings</span>
          <span>Admin Panel</span>
        </span>
      </div>

    </header>
  );
}
