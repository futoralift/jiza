import React from 'react';

export default function BottomNav({ activeView, setActiveView, onAccountClick, currentUser }) {
  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-sm flex justify-around items-center px-3 py-1.5 md:hidden rounded-full border border-black/15 bg-[#FCDAD7]/95 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.15)] z-40">
      
      {/* Home */}
      <button 
        onClick={() => setActiveView('home')}
        className={`flex flex-col items-center justify-center transition-all duration-150 px-4 py-1 rounded-full ${
          activeView === 'home'
            ? 'text-black font-bold scale-105 bg-black/15'
            : 'text-black font-semibold hover:bg-black/5'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[22px]" 
          style={{ fontVariationSettings: `'FILL' ${activeView === 'home' ? 1 : 0}` }}
        >
          home
        </span>
        <span className="font-label-sm text-[10px] mt-0.5 font-bold">Home</span>
      </button>

      {/* Search */}
      <button 
        onClick={(e) => {
          const iconEl = e.currentTarget.querySelector('.material-symbols-outlined');
          const rect = iconEl ? iconEl.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
          setActiveView('search', {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          });
        }}
        className={`flex flex-col items-center justify-center transition-all duration-150 px-4 py-1 rounded-full ${
          activeView === 'search'
            ? 'text-black font-bold scale-105 bg-black/15'
            : 'text-black font-semibold hover:bg-black/5'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: `'FILL' ${activeView === 'search' ? 1 : 0}` }}
        >
          search
        </span>
        <span className="font-label-sm text-[10px] mt-0.5 font-bold">Search</span>
      </button>

      {/* Categories */}
      <button 
        onClick={() => setActiveView('categories')}
        className={`flex flex-col items-center justify-center transition-all duration-150 px-4 py-1 rounded-full ${
          activeView === 'categories'
            ? 'text-black font-bold scale-105 bg-black/15'
            : 'text-black font-semibold hover:bg-black/5'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: `'FILL' ${activeView === 'categories' ? 1 : 0}` }}
        >
          grid_view
        </span>
        <span className="font-label-sm text-[10px] mt-0.5 font-bold">Categories</span>
      </button>

      {/* Account Button */}
      <button 
        onClick={(e) => {
          const iconEl = e.currentTarget.querySelector('.material-symbols-outlined');
          const rect = iconEl ? iconEl.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
          onAccountClick({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          });
        }}
        className={`flex flex-col items-center justify-center transition-all duration-150 px-4 py-1 rounded-full ${
          activeView === 'profile'
            ? 'text-black font-bold scale-105 bg-black/15'
            : 'text-black font-semibold hover:bg-black/5'
        }`}
      >
        <span 
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: `'FILL' ${activeView === 'profile' ? 1 : 0}` }}
        >
          person
        </span>
        <span className="font-label-sm text-[10px] mt-0.5">Account</span>
      </button>

    </nav>
  );
}
