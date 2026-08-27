import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ProductImageLightbox
 * Luxury Fullscreen Vertical Image Viewer for Product Detail Pages.
 * 
 * Features:
 * - Opens directly to the clicked product image
 * - Smooth vertical scrolling/swiping through all images of this product
 * - Prominent close button and Escape key support
 * - Dynamic image counter (e.g. "Image 2 of 5")
 * - Quick thumbnail dock for instant jumping
 * - Complete scroll position restoration on the underlying product page
 * - Mobile safe-area (100dvh) and touch-optimized
 */
export default function ProductImageLightbox({
  isOpen,
  images = [],
  initialIndex = 0,
  productTitle = 'Product Image',
  productCode = '',
  onClose,
  onActiveIndexChange
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [isZoomedMap, setIsZoomedMap] = useState({});

  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const savedScrollY = useRef(0);
  const isProgrammaticScroll = useRef(false);

  // Normalize image data to string URLs
  const normalizedImages = (images || []).map((img, idx) => {
    if (typeof img === 'string') return { url: img, id: idx };
    if (img && typeof img === 'object' && img.url) return { ...img, id: img.id || idx };
    return { url: '/logo-j.png', id: idx };
  });

  // Sync activeIndex when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.max(0, Math.min(initialIndex, normalizedImages.length - 1));
      setActiveIndex(validIndex);
      setShowScrollHint(normalizedImages.length > 1);
      setIsZoomedMap({});
    }
  }, [isOpen, initialIndex, normalizedImages.length]);

  // Lock body scroll and record page position on open; restore cleanly on close
  useEffect(() => {
    if (isOpen) {
      savedScrollY.current = window.scrollY || document.documentElement.scrollTop || 0;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        
        // Instant restore scroll position
        window.scrollTo({
          top: savedScrollY.current,
          left: 0,
          behavior: 'instant'
        });
      };
    }
  }, [isOpen]);

  // Scroll to initial index on open
  useEffect(() => {
    if (isOpen && containerRef.current && itemRefs.current[activeIndex]) {
      isProgrammaticScroll.current = true;
      const timer = setTimeout(() => {
        const targetEl = itemRefs.current[activeIndex];
        if (targetEl && containerRef.current) {
          targetEl.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 150);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, activeIndex]);

  // Track active image via scroll listener / Intersection calculation
  const handleContainerScroll = useCallback(() => {
    if (showScrollHint) {
      setShowScrollHint(false);
    }
    if (isProgrammaticScroll.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerCenter = container.scrollTop + container.clientHeight / 2;

    let closestIdx = 0;
    let minDistance = Infinity;

    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const elCenter = el.offsetTop + el.clientHeight / 2;
      const distance = Math.abs(containerCenter - elCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    if (closestIdx !== activeIndex) {
      setActiveIndex(closestIdx);
      if (onActiveIndexChange) {
        onActiveIndexChange(closestIdx);
      }
    }
  }, [activeIndex, onActiveIndexChange, showScrollHint]);

  // Jump to specific thumbnail image
  const handleJumpToIndex = (idx) => {
    if (idx < 0 || idx >= normalizedImages.length) return;
    setActiveIndex(idx);
    if (onActiveIndexChange) {
      onActiveIndexChange(idx);
    }
    const targetEl = itemRefs.current[idx];
    if (targetEl && containerRef.current) {
      isProgrammaticScroll.current = true;
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleJumpToIndex(Math.min(activeIndex + 1, normalizedImages.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handleJumpToIndex(Math.max(activeIndex - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, normalizedImages.length, onClose]);

  // Toggle zoom on click/double click
  const toggleZoom = (idx) => {
    setIsZoomedMap((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!isOpen || normalizedImages.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-[#0c0c0c]/98 backdrop-blur-2xl flex flex-col text-white select-none animate-fadeIn overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-label={`${productTitle} Fullscreen Image Gallery`}
    >
      {/* ===== TOP BAR (STICKY) ===== */}
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/10 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-xl">
        {/* Left: Product Info & Live Image Counter */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FCDAD7]/20 border border-[#FCDAD7]/40 flex items-center justify-center text-[#FCDAD7] shrink-0">
            <span className="material-symbols-outlined text-sm sm:text-base">diamond</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold font-serif text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {productTitle}
            </h2>
            {productCode && (
              <span className="text-[10px] sm:text-[11px] font-mono text-white/60">
                Item: {productCode}
              </span>
            )}
          </div>

          {/* Active Image Indicator Pill */}
          <div className="hidden xs:flex items-center gap-1 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-full border border-white/20 text-[11px] sm:text-xs font-mono font-bold text-[#FCDAD7] shrink-0 ml-1">
            <span className="material-symbols-outlined text-xs text-[#FCDAD7]">photo_library</span>
            <span>{activeIndex + 1} / {normalizedImages.length}</span>
          </div>
        </div>

        {/* Right: Actions (Mobile counter + Prominent Close Button) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile-only counter badge */}
          <div className="xs:hidden flex items-center bg-white/10 px-2 py-0.5 rounded-full border border-white/15 text-[10px] font-mono text-[#FCDAD7]">
            {activeIndex + 1}/{normalizedImages.length}
          </div>

          {/* Clear, Prominent Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#FCDAD7] hover:bg-[#F9C5C0] active:scale-95 text-black font-bold text-xs sm:text-sm shadow-xl transition-all cursor-pointer border border-black/20 group"
            title="Close viewer (ESC)"
            aria-label="Close fullscreen gallery"
          >
            <span className="material-symbols-outlined text-base sm:text-lg group-hover:rotate-90 transition-transform duration-300">close</span>
            <span className="tracking-wide">Close</span>
          </button>
        </div>
      </header>

      {/* ===== VERTICAL SCROLL IMAGE FEED ===== */}
      <main 
        ref={containerRef}
        onScroll={handleContainerScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain no-scrollbar relative w-full h-full"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="w-full flex flex-col items-center">
          {normalizedImages.map((img, idx) => {
            const isZoomed = isZoomedMap[idx];
            return (
              <section
                key={img.id || idx}
                ref={(el) => (itemRefs.current[idx] = el)}
                className="min-h-[85vh] sm:min-h-[92vh] w-full flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 relative border-b border-white/5 last:border-b-0 group"
                id={`lightbox-item-${idx}`}
              >
                {/* Image Container with Luxury Glow & Zoom */}
                <div 
                  className={`relative max-w-full flex items-center justify-center transition-all duration-300 cursor-zoom-in ${
                    isZoomed ? 'scale-125 sm:scale-150 cursor-zoom-out z-20' : 'scale-100'
                  }`}
                  onClick={() => toggleZoom(idx)}
                  title={isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                >
                  <img
                    src={img.url}
                    alt={`${productTitle} - View ${idx + 1}`}
                    loading={idx === 0 || idx === initialIndex ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/logo-j.png';
                    }}
                    className="max-h-[75dvh] sm:max-h-[82vh] max-w-[92vw] sm:max-w-3xl md:max-w-4xl object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 bg-stone-950/40 p-2 select-none"
                  />

                  {/* Corner Zoom Pill Indicator */}
                  <div className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <span className="material-symbols-outlined text-xs sm:text-sm">
                      {isZoomed ? 'zoom_out' : 'zoom_in'}
                    </span>
                    <span>{isZoomed ? 'Zoom Out' : 'Zoom In'}</span>
                  </div>
                </div>

                {/* Subtitle & Image Index Footnote */}
                <div className="mt-3 flex items-center gap-2 text-stone-400 text-xs font-mono">
                  <span>Photo {idx + 1} of {normalizedImages.length}</span>
                  {isZoomed && (
                    <span className="text-[#FCDAD7] font-sans text-[11px] font-bold">
                      (Zoomed 1.5x)
                    </span>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Floating "Scroll down for more" indicator hint (shown only on first view if multiple images) */}
        {showScrollHint && normalizedImages.length > 1 && (
          <aside 
            onClick={() => handleJumpToIndex(1)}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-black/80 hover:bg-black text-[#FCDAD7] border border-[#FCDAD7]/40 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold animate-bounce cursor-pointer"
            aria-label="Scroll down for more views"
          >
            <span>Scroll for more views</span>
            <span className="material-symbols-outlined text-sm">arrow_downward</span>
          </aside>
        )}
      </main>

      {/* ===== BOTTOM FLOATING QUICK-THUMBNAIL DOCK ===== */}
      {normalizedImages.length > 1 && (
        <footer className="sticky bottom-0 z-50 w-full bg-black/85 backdrop-blur-xl border-t border-white/10 px-3 py-2 flex items-center justify-center shadow-2xl">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full no-scrollbar py-0.5 px-2">
            {normalizedImages.map((img, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleJumpToIndex(idx)}
                  className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'border-[#FCDAD7] scale-110 shadow-lg ring-2 ring-[#FCDAD7]/50' 
                      : 'border-white/20 opacity-50 hover:opacity-90 hover:border-white/50'
                  }`}
                  title={`Jump to Photo ${idx + 1}`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#FCDAD7]/10" />
                  )}
                </button>
              );
            })}
          </div>
        </footer>
      )}
    </div>
  );
}
