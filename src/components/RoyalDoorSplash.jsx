import React, { useState, useEffect } from 'react';

export default function RoyalDoorSplash({ onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    // Start opening doors after 1.4 seconds
    const timer1 = setTimeout(() => {
      setIsOpen(true);
    }, 1400);

    // Remove splash overlay completely after doors finish swinging (3.2s)
    const timer2 = setTimeout(() => {
      setIsRemoved(true);
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (isRemoved) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none select-none flex items-center justify-center bg-transparent perspective-[1400px]">
      
      {/* Left Traditional Pink Door */}
      <div 
        className={`absolute top-0 left-0 w-1/2 h-full bg-[#FCDAD7] border-r border-black/25 flex items-center justify-end p-4 sm:p-8 shadow-2xl transition-all duration-[1600ms] ease-in-out origin-left pointer-events-auto ${
          isOpen ? '-translate-x-full rotate-y-[-90deg] opacity-0' : 'translate-x-0 rotate-y-0 opacity-100'
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 90% 50%, rgba(255, 240, 238, 0.8), transparent 70%), linear-gradient(135deg, #FCDAD7 0%, #F9C5C0 100%)`
        }}
      >
        {/* Outer & Inner Clean Black Outline Frame */}
        <div className="w-full h-[88%] border border-black/20 rounded-r-3xl p-4 flex flex-col justify-between items-end relative overflow-hidden">
          <div className="w-12 h-12 border-t border-r border-black/40 rounded-tr-lg"></div>
          <div className="w-12 h-12 border-b border-r border-black/40 rounded-br-lg"></div>
        </div>
      </div>

      {/* Right Traditional Pink Door */}
      <div 
        className={`absolute top-0 right-0 w-1/2 h-full bg-[#FCDAD7] border-l border-black/25 flex items-center justify-start p-4 sm:p-8 shadow-2xl transition-all duration-[1600ms] ease-in-out origin-right pointer-events-auto ${
          isOpen ? 'translate-x-full rotate-y-[90deg] opacity-0' : 'translate-x-0 rotate-y-0 opacity-100'
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 10% 50%, rgba(255, 240, 238, 0.8), transparent 70%), linear-gradient(225deg, #FCDAD7 0%, #F9C5C0 100%)`
        }}
      >
        {/* Outer & Inner Clean Black Outline Frame */}
        <div className="w-full h-[88%] border border-black/20 rounded-l-3xl p-4 flex flex-col justify-between items-start relative overflow-hidden">
          <div className="w-12 h-12 border-t border-l border-black/40 rounded-tl-lg"></div>
          <div className="w-12 h-12 border-b border-l border-black/40 rounded-bl-lg"></div>
        </div>
      </div>

      {/* Center Big Logo Emblem with Cinematic Reveal Animation */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center text-center p-4 transition-all duration-[1400ms] cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none ${
          isOpen ? 'opacity-0 scale-[2.2] blur-md' : 'opacity-100 scale-100 blur-none'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {/* Radiant Golden Halo / Aura */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-r from-amber-400/40 via-yellow-300/50 to-amber-600/40 blur-2xl opacity-90 animate-pulse pointer-events-none"></div>
          
          {/* Ornate Gold Ring Border */}
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#AA771C] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_50px_rgba(212,175,55,0.6)]">
            <img 
              src="/jiza-door-logo.png" 
              alt="Jiza Jewellery Studio - Unique As U" 
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] rounded-full object-contain bg-black shadow-inner"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
