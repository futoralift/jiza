import React from 'react';

export default function NotFoundView({ onGoHome }) {
  return (
    <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 pb-32 min-h-[70vh] flex items-center justify-center animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-12 text-center max-w-md w-full shadow-xl space-y-6">
        
        <div className="w-20 h-20 bg-antique-cream border border-heritage-gold/40 rounded-full flex items-center justify-center text-heritage-gold mx-auto shadow-inner">
          <span className="material-symbols-outlined text-4xl">search_off</span>
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-heritage-gold tracking-tight block">404</span>
          <h1 className="font-headline-sm text-xl md:text-2xl text-on-surface font-bold">
            Page Not Found
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
            The page or URL you are looking for does not exist or may have been moved. Please check the Web address and try again.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onGoHome}
            className="w-full py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-2 border border-black/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">home</span>
            <span>Back to Home</span>
          </button>
        </div>

      </div>
    </main>
  );
}
