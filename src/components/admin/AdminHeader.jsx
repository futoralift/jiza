import React from 'react';
import { getAdminRole, getAdminEmail, isReadOnlyAdmin } from '../../config';

export default function AdminHeader({ onExitAdmin }) {
  const isReadOnly = isReadOnlyAdmin();
  const adminEmail = getAdminEmail();

  return (
    <header className="w-full h-12 bg-[#FCDAD7] border-b border-[#F7B6B0] px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
      
      {/* LEFT: Logged In Account Info */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="hidden sm:inline font-mono text-[11px] text-black font-semibold bg-white/60 px-2 py-0.5 rounded border border-black/10">
          {adminEmail || 'admin'}
        </span>
      </div>

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

      {/* FAR RIGHT: Dynamic Role Badge + Exit Button */}
      <div className="ml-auto flex items-center gap-2">
        {isReadOnly ? (
          <span className="bg-amber-900 text-amber-100 text-[10px] px-2.5 py-0.5 rounded-md border border-amber-700 font-bold flex items-center gap-1 shadow-xs" title="Secondary Admin: Read & Export Only">
            <span className="material-symbols-outlined text-[12px] text-amber-200">visibility</span>
            <span className="hidden md:inline">Read + Export Only (Agency)</span>
            <span className="md:hidden">Agency</span>
          </span>
        ) : (
          <span className="bg-black text-[#FCDAD7] text-[10px] px-2.5 py-0.5 rounded-md border border-black/20 font-bold flex items-center gap-1 shadow-xs" title="Primary Admin: Full Management Access">
            <span className="material-symbols-outlined text-[12px] text-[#FCDAD7]">verified_user</span>
            <span className="hidden md:inline">Full Admin (Owner)</span>
            <span className="md:hidden">Owner</span>
          </span>
        )}

        {onExitAdmin && (
          <button
            type="button"
            onClick={onExitAdmin}
            className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 text-[11px] font-bold rounded-lg border border-red-200 shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Sign out and return to Storefront"
          >
            <span className="material-symbols-outlined text-[14px]">logout</span>
            <span>Exit Admin</span>
          </button>
        )}
      </div>

    </header>
  );
}
