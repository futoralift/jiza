import React from 'react';
import { CATEGORIES } from '../data/products';

export default function CategoriesView({ onSelectCategory, setActiveView, categoriesList = [] }) {
  const activeCategories = categoriesList && categoriesList.length > 0 ? categoriesList : CATEGORIES;

  return (
    <main className="w-full max-w-container-max mx-auto pt-4 pb-24 px-margin-mobile md:px-margin-desktop">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setActiveView('home')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FCDAD7]/80 hover:bg-[#FCDAD7] text-black font-bold text-xs border border-black/15 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </button>
        <span className="text-xs text-stone-500 font-semibold">{activeCategories.length} Collections</span>
      </div>

      {/* Category View Header */}
      <div className="text-center mb-8">
        <span className="font-label-sm text-heritage-gold uppercase tracking-[0.2em] mb-1.5 block font-semibold text-xs">
          Curated Craftsmanship
        </span>
        <h1 className="font-headline-md md:font-display-lg text-on-surface mb-2">
          Explore All Categories
        </h1>
        <div className="w-16 h-0.5 bg-[#FCDAD7] mx-auto mt-3 rounded-full"></div>
      </div>

      {/* Categories Grid: 2 columns on mobile, 6 columns on desktop, 4:5 aspect ratio cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6">
        {activeCategories.map((cat, idx) => (
          <button
            key={cat.id}
            onClick={(e) => {
              const imgEl = e.currentTarget.querySelector('img');
              const rect = imgEl ? imgEl.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
              onSelectCategory(cat.id, {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                imgSrc: cat.img,
                name: cat.name
              });
            }}
            className="group flex flex-col w-full aspect-[4/5] rounded-2xl overflow-hidden border border-black/15 border-b-4 border-b-black/25 hover:border-black/35 hover:border-b-black/45 transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 bg-surface-container-lowest focus:outline-none active:scale-95 animate-fadeIn"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* 1:1 Image Container */}
            <div className="w-full aspect-square overflow-hidden bg-surface-container-low relative">
              <img 
                src={cat.img} 
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-deep-onyx/75 backdrop-blur text-surface font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold">
                {cat.count || 0} Items
              </div>
            </div>

            {/* Text Container at the bottom (Pink pastel bg with bold black text in normal sans font) */}
            <div className="w-full flex-grow flex items-center justify-center p-2.5 sm:p-3 text-center bg-[#FCDAD7] group-hover:bg-[#F9C5C0] border-t border-black/15 transition-all duration-300">
              <span className="font-sans text-sm sm:text-base md:text-sm lg:text-base text-black font-bold tracking-tight flex items-center justify-center gap-1 line-clamp-2">
                {cat.name}
                <span className="material-symbols-outlined text-[15px] md:text-[14px] text-black transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
              </span>
            </div>
          </button>
        ))}
      </div>

    </main>
  );
}
