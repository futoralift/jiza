import React, { useRef } from 'react';

const REEL_IDS = [
  '1YooHU6S5Ho',
  'I27iLqWJjzs',
  '6gHfA-ik9FY',
  'h1mNr9ot7ek',
  'hVl4O_sYFZY',
  'wAIciMCt8D0',
  '15sle_Tsms0',
  'G3jPVkmVXQs',
  '3Skq7n3fJWI'
];

export default function VideoReelsSection() {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 md:py-6 px-margin-mobile md:px-margin-desktop my-1">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-headline-sm text-base md:text-lg text-black font-bold tracking-tight">
            Video Reels
          </h2>
        </div>

        {/* Minimal Scroll Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-full bg-[#FCDAD7]/50 hover:bg-[#FCDAD7] text-black border border-black/15 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Previous Reels"
            aria-label="Previous Reels"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-full bg-[#FCDAD7]/50 hover:bg-[#FCDAD7] text-black border border-black/15 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Next Reels"
            aria-label="Next Reels"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Horizontal Reels Row - Pure Minimal Compact Video Cards */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2.5 md:gap-3.5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {REEL_IDS.map((id) => (
          <div
            key={id}
            className="shrink-0 w-[135px] sm:w-[150px] md:w-[170px] lg:w-[180px] aspect-[9/16] snap-start rounded-xl md:rounded-2xl overflow-hidden bg-black border border-black/10 shadow-sm relative group"
          >
            {/* Cropped Container to eliminate YouTube title bar & controls */}
            <div className="absolute -inset-2 md:-inset-2.5 overflow-hidden flex items-center justify-center pointer-events-none">
              <iframe
                src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&playsinline=1&enablejsapi=1`}
                title="Jiza Video Reel"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full object-cover border-0 scale-[1.32] md:scale-[1.30] origin-center pointer-events-none"
              />
            </div>

            {/* Click-through preventer to ensure zero YouTube UI triggers */}
            <div className="absolute inset-0 bg-transparent pointer-events-auto select-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
