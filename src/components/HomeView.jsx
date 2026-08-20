import React from 'react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import VideoReelsSection from './VideoReelsSection';

const TESTIMONIALS = [
  {
    name: 'Aishwarya Nikam',
    city: 'Pune',
    rating: 5,
    text: 'I am so thankful I found Jiza for my wedding shopping! Got my entire bridal jewellery from here. Unique collection and super helpful team. Special thanks to Sheetal for styling my outfit and making my day special.',
    product: 'Bridal Jewellery & Outfit Styling'
  },
  {
    name: 'Neha Nachan',
    city: 'Pune',
    rating: 5,
    text: 'It’s one of the best places to buy jewellery from, the staff is very polite and sweet and will try to create different look options.',
    product: 'Bridal & Fine Jewellery'
  },
  {
    name: 'Swapnali',
    city: 'Pune',
    rating: 5,
    text: 'Amazing collection, awesome hosts, and best prices! The purchasing process was so easy and hassle-free. Loved buying high-end jewellery pieces at affordable prices to complement my outfit. Thank you so much ❤️',
    product: 'Jewellery Purchase & Personal Styling',
    avatar: '/reviewer-avatar.png'
  }
];

const ProductCard = React.memo(function ProductCard({ product, onSelect, onAddToCart, onBuyNow, onToggleWishlist, wishlisted, idx }) {
  const isSoldOut = product.soldOut || !product.inStock;

  return (
    <article
      className="group cursor-pointer flex flex-col bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/30 hover:border-heritage-gold/60 transition-all duration-300 gold-glow-hover animate-fadeIn"
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      <div
        onClick={() => !isSoldOut && onSelect(product)}
        className={`relative w-full aspect-[4/5] rounded-lg overflow-hidden mb-3 bg-surface-container-low ${isSoldOut ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <img
          src={product.images?.[0] || product.img}
          alt={product.title || product.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
          loading="lazy"
        />
        {/* Sold Out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-white/20">
              Sold Out
            </span>
          </div>
        )}
        {!isSoldOut && product.badge && product.badge !== 'Sold Out' && (
          <div className="absolute top-2 left-2 bg-antique-cream/90 backdrop-blur px-2.5 py-0.5 rounded-full border border-heritage-gold/30 shadow-sm">
            <span className="font-label-sm text-[11px] text-primary uppercase font-bold tracking-wider">{product.badge}</span>
          </div>
        )}
        {!isSoldOut && product.discount > 0 && (
          <div className="absolute top-2 right-10 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow">
            {product.discount}% OFF
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${wishlisted ? 'bg-secondary text-on-secondary animate-heartBeat shadow-md' : 'bg-surface-container-lowest/80 text-outline hover:text-secondary hover:scale-110'}`}
          title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `'FILL' ${wishlisted ? 1 : 0}` }}>favorite</span>
        </button>
      </div>
      <div className="flex flex-col flex-grow" onClick={() => !isSoldOut && onSelect(product)}>
        <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-1">{product.categoryLabel}</p>
        <h3 className="font-headline-sm text-base text-on-surface line-clamp-1 mb-1 group-hover:text-heritage-gold transition-colors">{product.title || product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-body-lg text-base font-bold text-primary">₹{(product.price || product.sellingPrice || 0).toLocaleString('en-IN')}</span>
          {(product.mrp || product.originalPrice) && (
            <span className="font-body-md text-xs text-outline line-through">₹{(product.mrp || product.originalPrice).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
      
      {/* Dual CTA: Add to Bag + Buy Now */}
      <div className="grid grid-cols-2 gap-1.5 mt-auto pt-2 border-t border-black/10">
        <button
          type="button"
          onClick={(e) => {
            if (isSoldOut) return;
            const rect = e.currentTarget.getBoundingClientRect();
            onAddToCart(product, 1, 'Standard', '', {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              img: product.images?.[0] || product.img
            });
          }}
          disabled={isSoldOut}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
            isSoldOut
              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              : 'bg-[#FFF0F2] hover:bg-[#FCDAD7] text-black border border-black/20 shadow-xs active:scale-95'
          }`}
          title="Add to Shopping Bag"
        >
          <span className="material-symbols-outlined text-[15px]">shopping_bag</span>
          <span>Add</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isSoldOut) return;
            if (onBuyNow) {
              onBuyNow(product, 1, 'Standard', '');
            } else {
              onAddToCart(product, 1, 'Standard', '');
            }
          }}
          disabled={isSoldOut}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
            isSoldOut
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-stone-900 text-[#FCDAD7] border border-black shadow-xs active:scale-95'
          }`}
          title="Buy Now (Direct Checkout)"
        >
          <span className="material-symbols-outlined text-[15px]">flash_on</span>
          <span>Buy Now</span>
        </button>
      </div>
    </article>
  );
});

export default function HomeView({
  onSelectCategory,
  onSelectProduct,
  onToggleWishlist,
  wishlistIds,
  onAddToCart,
  onBuyNow,
  setActiveView,
  productsList
}) {
  const allProducts = productsList || PRODUCTS;

  // Scroll Tracking for 3D Hero Animation
  const [scrollY, setScrollY] = React.useState(0);
  const [heroHeight, setHeroHeight] = React.useState(600);
  const heroRef = React.useRef(null);

  // Auto-sliding banner (.webp optimized, right-to-left swipe)
  const BANNER_IMAGES = React.useMemo(() => ['/banner2.webp', '/banner1.webp'], []);
  const [activeBanner, setActiveBanner] = React.useState(0);
  const [prevBanner, setPrevBanner] = React.useState(null);
  const [sliding, setSliding] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => {
        const next = (prev + 1) % BANNER_IMAGES.length;
        setPrevBanner(prev);
        setSliding(true);
        setTimeout(() => {
          setPrevBanner(null);
          setSliding(false);
        }, 1200);
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [BANNER_IMAGES]);

  React.useEffect(() => {
    let requestRef = null;
    const handleScroll = () => {
      if (requestRef) return;
      requestRef = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        requestRef = null;
      });
    };

    const updateHeight = () => {
      if (heroRef.current) {
        setHeroHeight(heroRef.current.offsetHeight);
      } else {
        setHeroHeight(window.innerHeight * (window.innerWidth >= 768 ? 0.8 : 0.65));
      }
    };

    updateHeight();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeight);
      if (requestRef) {
        cancelAnimationFrame(requestRef);
      }
    };
  }, []);

  const scrollRatio = heroHeight ? Math.min(scrollY / heroHeight, 1) : 0;

  // New Arrivals: Explicitly assigned by admin via Special Section = 'New Arrival' (Max 4 products)
  const newArrivals = allProducts
    .filter(p => p.specialSection === 'New Arrival' || p.badge === 'New Arrival')
    .sort((a, b) => (a.soldOut ? 1 : 0) - (b.soldOut ? 1 : 0))
    .slice(0, 4);

  // Best Sellers: Explicitly assigned by admin via Special Section = 'Best Seller' (Max 4 products)
  const bestSellers = allProducts
    .filter(p => p.specialSection === 'Best Seller' || p.badge === 'Bestseller' || p.badge === 'Best Seller')
    .sort((a, b) => (a.soldOut ? 1 : 0) - (b.soldOut ? 1 : 0))
    .slice(0, 4);

  return (
    <main className="w-full max-w-container-max mx-auto pb-16 relative" style={{ perspective: '1000px' }}>

      {/* ===== DELIVERY ANNOUNCEMENT BAR (Above Hero Section - 1-Line Marquee Loop) ===== */}
      <div className="w-full bg-[#111111] text-white py-2.5 overflow-hidden border-b border-white/10 relative z-20 shadow-md">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          <div className="flex items-center gap-8 shrink-0 px-4 font-serif text-xs md:text-sm tracking-wider text-gray-100 font-light">
            <span>Kindly expect your parcel to reach you within 6-10 working days.</span>
            <span className="text-amber-400 font-sans font-bold">✦</span>
            <span>Kindly expect your parcel to reach you within 6-10 working days.</span>
            <span className="text-amber-400 font-sans font-bold">✦</span>
            <span>Kindly expect your parcel to reach you within 6-10 working days.</span>
            <span className="text-amber-400 font-sans font-bold">✦</span>
          </div>
          <div className="flex items-center gap-8 shrink-0 px-4 font-serif text-xs md:text-sm tracking-wider text-gray-100 font-light">
            <span>Kindly expect your parcel to reach you within 6-10 working days.</span>
            <span className="text-amber-400 font-sans font-bold">✦</span>
            <span>Kindly expect your parcel to reach you within 6-10 working days.</span>
            <span className="text-amber-400 font-sans font-bold">✦</span>
            <span>Kindly expect your parcel to reach you within 6-10 working days.</span>
            <span className="text-amber-400 font-sans font-bold">✦</span>
          </div>
        </div>
      </div>

      {/* ===== HERO BANNER SECTION ===== */}
      <div className="relative w-full">
        <div
          ref={heroRef}
          className="w-full sticky top-0 z-0 h-[65vh] md:h-[80vh] bg-surface-container-low flex items-start justify-center pt-10 md:pt-16 overflow-hidden"
          style={{
            transform: `scale(${1 - scrollRatio * 0.08})`,
            opacity: 1 - scrollRatio * 0.5,
            transformOrigin: 'center center',
            willChange: 'transform, opacity',
            transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* Outer scale/parallax wrapper separated from inner slide animation */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              transform: `scale(${1 + scrollRatio * 0.06})`,
              transformOrigin: 'center top',
              willChange: 'transform',
            }}
          >
            {BANNER_IMAGES.map((src, i) => {
              const isActive = activeBanner === i;
              const isPrev = prevBanner === i;
              let translateX = '100%'; // hidden off-screen right by default
              if (isActive) translateX = sliding ? '0%' : '0%';
              if (isPrev) translateX = '-100%';
              if (!isActive && !isPrev) translateX = '100%';
              return (
                <img
                  key={src}
                  src={src}
                  alt={`Jiza Jewellery banner ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  style={{
                    transform: `translateX(${translateX})`,
                    transition: (isActive || isPrev) ? 'transform 1.2s cubic-bezier(0.77, 0, 0.18, 1)' : 'none',
                    willChange: 'transform',
                    zIndex: isActive ? 2 : isPrev ? 1 : 0,
                  }}
                />
              );
            })}
          </div>
          <div 
            className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center animate-slideUp"
            style={{
              transform: `translateY(${scrollRatio * -40}px)`,
              opacity: Math.max(1 - scrollRatio * 1.8, 0),
              transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            <h1 className="font-display-lg-mobile md:font-display-lg text-surface drop-shadow-lg mb-2 leading-tight gold-shimmer-text">
              This wedding season,<br />shine with us
            </h1>
          </div>
        </div>

        {/* ===== FEATURE HIGHLIGHT BAR (Below Hero Section) ===== */}
        <section className="w-full bg-white border-y border-black/10 py-3.5 px-4 md:px-8 shadow-sm relative z-10 text-black">
          <div className="max-w-6xl mx-auto flex flex-col gap-3">
            
            {/* Top Row: Store Pickup (Full-length pink button) */}
            <div className="w-full">
              <div className="w-full flex items-center justify-center gap-2.5 px-4 py-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/20 rounded-2xl md:rounded-full shadow-sm transition-all cursor-pointer">
                <span className="material-symbols-outlined text-2xl text-black">storefront</span>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="font-bold uppercase tracking-wider text-black">Store Pickup</span>
                  <span className="text-black/85 font-medium">Available</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: 4 Equal-Sized Pink Button Pills in a Single Row */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 items-stretch">
              
              {/* Pay With Cards & UPI */}
              <div className="h-full min-h-[46px] sm:min-h-[52px] md:min-h-[56px] flex items-center gap-1.5 sm:gap-2 px-2 py-2 sm:px-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/15 rounded-xl md:rounded-full shadow-sm transition-all justify-center text-center sm:text-left">
                <span className="material-symbols-outlined text-[18px] sm:text-2xl shrink-0 text-black">payments</span>
                <div>
                  <p className="font-bold text-[9px] sm:text-[11px] md:text-xs leading-tight text-black">Pay With Cards,</p>
                  <p className="text-[8px] sm:text-[10px] md:text-[11px] text-black/80 font-medium">UPI &amp; More.</p>
                </div>
              </div>

              {/* Free Shipping */}
              <div className="h-full min-h-[46px] sm:min-h-[52px] md:min-h-[56px] flex items-center gap-1.5 sm:gap-2 px-2 py-2 sm:px-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/15 rounded-xl md:rounded-full shadow-sm transition-all justify-center text-center sm:text-left">
                <span className="material-symbols-outlined text-[18px] sm:text-2xl shrink-0 text-black">local_shipping</span>
                <div>
                  <p className="font-bold text-[9px] sm:text-[11px] md:text-xs leading-tight text-black">Free Shipping</p>
                  <p className="text-[8px] sm:text-[10px] md:text-[11px] text-black/80 font-medium">Over INR 1000</p>
                </div>
              </div>

              {/* High Quality Craftsmanship */}
              <div className="h-full min-h-[46px] sm:min-h-[52px] md:min-h-[56px] flex items-center gap-1.5 sm:gap-2 px-2 py-2 sm:px-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/15 rounded-xl md:rounded-full shadow-sm transition-all justify-center text-center sm:text-left">
                <span className="material-symbols-outlined text-[18px] sm:text-2xl shrink-0 text-black">workspace_premium</span>
                <div>
                  <p className="font-bold text-[9px] sm:text-[11px] md:text-xs leading-tight text-black">High Quality</p>
                  <p className="text-[8px] sm:text-[10px] md:text-[11px] text-black/80 font-medium">Craftsmanship</p>
                </div>
              </div>

              {/* Light-Weight Material */}
              <div className="h-full min-h-[46px] sm:min-h-[52px] md:min-h-[56px] flex items-center gap-1.5 sm:gap-2 px-2 py-2 sm:px-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/15 rounded-xl md:rounded-full shadow-sm transition-all justify-center text-center sm:text-left">
                <span className="material-symbols-outlined text-[18px] sm:text-2xl shrink-0 text-black">eco</span>
                <div>
                  <p className="font-bold text-[9px] sm:text-[11px] md:text-xs leading-tight text-black">Light - Weight</p>
                  <p className="text-[8px] sm:text-[10px] md:text-[11px] text-black/80 font-medium">Material</p>
                </div>
              </div>

            </div>

          </div>
        </section>
      </div>

      {/* ===== OVERLAYING CONTENT CONTAINER (Category Scroll) ===== */}
      <div className="relative z-10 bg-background shadow-[0_-25px_60px_rgba(0,0,0,0.3)] border-t border-heritage-gold/20 rounded-t-[32px] md:rounded-t-[48px] pt-4 -mt-1 overflow-hidden">

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="py-14 md:py-16 px-6 md:px-12 w-full animate-fadeIn">
        <div className="text-center mb-10">
          <h2 className="font-headline-sm text-on-surface mb-2">Shop by Category</h2>
          <div className="w-16 h-px bg-heritage-gold mx-auto"></div>
        </div>

        {/* Category Grid: 2 columns on mobile, 6 columns on desktop (12 items = 2 rows of 6), 4:5 aspect ratio cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-5 md:gap-8 mb-10">
          {CATEGORIES.slice(0, 12).map((cat, idx) => (
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
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={cat.img}
                  loading="lazy"
                />
              </div>
              
              {/* Text Container at the bottom (Pink pastel bg with bold black text in normal sans font) */}
              <div className="w-full flex-grow flex items-center justify-center p-2.5 sm:p-3 text-center bg-[#FCDAD7] group-hover:bg-[#F9C5C0] border-t border-black/15 transition-all duration-300">
                <span className="font-sans text-sm sm:text-base md:text-sm lg:text-base text-black font-bold tracking-tight line-clamp-2">
                  {cat.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Premium Royal View All Categories Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => setActiveView('categories')}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-[#FCDAD7] text-black font-bold text-xs uppercase tracking-widest rounded-full border border-black/25 shadow-lg hover:shadow-2xl hover:border-black hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            {/* Inner Shimmer Effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>

            {/* Grid Icon Ring */}
            <div className="w-7 h-7 rounded-full bg-black/10 border border-black/20 flex items-center justify-center text-black group-hover:bg-black group-hover:text-[#FCDAD7] transition-all duration-300 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </div>

            {/* Label */}
            <span className="relative z-10 font-semibold text-xs tracking-widest uppercase">Explore All 15 Categories</span>

            {/* Arrow */}
            <span className="material-symbols-outlined text-sm text-black group-hover:translate-x-1 transition-transform duration-300">
              arrow_forward
            </span>
          </button>
        </div>
      </section>

      {/* ===== RENTAL COLLECTION FEATURE TAB (Above Just Arrived / New Arrivals) ===== */}
      <section className="py-6 px-margin-mobile md:px-margin-desktop">
        <div 
          onClick={() => setActiveView('rental-gallery')}
          className="group relative bg-[#FCDAD7] border border-black/20 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden text-black flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-full mb-3 shadow-xs">
              <span className="material-symbols-outlined text-xs text-white">diamond</span>
              <span>Exclusive Studio Rental Edit</span>
            </div>

            <h2 
              className="text-xl md:text-3xl font-bold mb-2 tracking-wide leading-tight text-black"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Rental Collection Gallery
            </h2>

            <p className="text-xs md:text-sm text-black/85 font-medium leading-relaxed mb-4">
              Explore high-definition photographs of our handcrafted Kundan, Maharashtrian, Victorian &amp; Temple jewellery sets available for rental.
            </p>

            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-black/85 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform group-hover:scale-105 active:scale-95">
              <span>Open Rental Image Gallery</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          {/* Right Preview Card Stack */}
          <div className="relative z-10 flex items-center gap-2 overflow-hidden shrink-0 self-center md:self-auto">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <img src="/rental1.webp" alt="Rental 1" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="w-22 h-22 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-white shadow-lg z-10 transform scale-105">
              <img src="/rental2.webp" alt="Rental 2" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <img src="/kundan-square.webp" alt="Rental 3" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>

          {/* Background Watermark */}
          <span className="material-symbols-outlined text-9xl text-black/5 absolute -right-6 -bottom-6 pointer-events-none select-none">
            photo_library
          </span>
        </div>
      </section>

      {/* ===== 1. CUSTOMER FAVOURITES ===== */}
      <section className="py-10 px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-7">
          <div>
            <p className="font-label-sm text-xs text-black/60 uppercase tracking-widest mb-1 font-bold">Handpicked Selection</p>
            <h2 className="font-headline-sm text-black font-bold text-2xl">Customer Favourites</h2>
          </div>
          {/* View All → shows all products sorted newest first */}
          <button
            onClick={() => setActiveView('search')}
            className="text-black hover:underline font-label-md flex items-center gap-1 text-sm font-bold cursor-pointer"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        {newArrivals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-black/15 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-black/40 mb-2 block">inventory_2</span>
            <p className="text-stone-800 font-body-md text-sm font-bold">No products assigned to Customer Favourites yet.</p>
            <p className="text-stone-500 text-xs mt-1">Assign up to 4 products in the Admin Panel using the "Special Section" field.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {newArrivals.map((p, idx) => (
              <ProductCard key={p.id} product={p} idx={idx} onSelect={onSelectProduct} onAddToCart={onAddToCart} onBuyNow={onBuyNow} onToggleWishlist={onToggleWishlist} wishlisted={wishlistIds.includes(p.id)} />
            ))}
          </div>
        )}
      </section>

      {/* ===== 2. VIDEO REELS SECTION (Horizontal Scrollable 9 Shorts) ===== */}
      <VideoReelsSection />

      {/* ===== 3. BEST SELLERS (Top selling pieces) ===== */}
      <section className="py-10 px-margin-mobile md:px-margin-desktop bg-[#FFF0F2] rounded-3xl my-4 border border-[#F8B3AC]/40">
        <div className="flex justify-between items-end mb-7">
          <div>
            <p className="font-label-sm text-xs text-black/60 uppercase tracking-widest mb-1 font-bold">Most Loved &amp; Trending</p>
            <h2 className="font-headline-sm text-black font-bold text-2xl">Best Sellers</h2>
          </div>
          {/* View All → shows all products sorted by sales desc */}
          <button
            onClick={() => setActiveView('search')}
            className="text-black hover:underline font-label-md flex items-center gap-1 text-sm font-bold cursor-pointer"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        {bestSellers.length === 0 ? (
          <div className="text-center py-12 bg-white/80 rounded-2xl border border-black/15 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-black/40 mb-2 block">star</span>
            <p className="text-stone-800 font-body-md text-sm font-bold">No products assigned to Best Sellers yet.</p>
            <p className="text-stone-500 text-xs mt-1">Assign up to 4 products in the Admin Panel using the "Special Section" field.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {bestSellers.map((p, idx) => (
              <ProductCard key={p.id} product={p} idx={idx} onSelect={onSelectProduct} onAddToCart={onAddToCart} onBuyNow={onBuyNow} onToggleWishlist={onToggleWishlist} wishlisted={wishlistIds.includes(p.id)} />
            ))}
          </div>
        )}
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-12 px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-10">
          <p className="font-label-sm text-xs text-heritage-gold uppercase tracking-widest mb-1">Happy Customers</p>
          <h2 className="font-headline-sm text-on-surface mb-2">What Our Customers Say</h2>
          <div className="w-16 h-px bg-heritage-gold mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 hover:border-heritage-gold/40 hover:shadow-md transition-all">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-heritage-gold text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="border-t border-outline-variant/30 pt-3 flex items-center gap-3">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-heritage-gold/50 shadow-sm shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-antique-cream border border-heritage-gold/30 flex items-center justify-center text-heritage-gold shrink-0">
                    <span className="material-symbols-outlined text-base">person</span>
                  </div>
                )}
                <div>
                  <p className="font-label-md text-xs font-bold text-on-surface">{t.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{t.city} · {t.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT BRAND (Our Story) ===== */}
      <section className="py-12 px-margin-mobile md:px-margin-desktop bg-antique-cream/30 rounded-2xl my-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-label-sm text-xs text-heritage-gold uppercase tracking-widest mb-2">Our Story</p>
            <h2 className="font-headline-sm text-on-surface mb-4 text-2xl md:text-3xl leading-snug">
              From a Small Beginning to a Jewellery Destination
            </h2>
            
            <div className="space-y-3 font-body-md text-sm text-on-surface-variant leading-relaxed mb-6">
              <p>
                Jiza began nine years ago with a simple dream and a very small beginning from home. What started as a small venture slowly grew with the love, trust, and support of our customers.
              </p>
              <p>
                Over the years, Jiza has grown into a jewellery studio on Sinhagad Road, Pune, offering both jewellery rental and selling services.
              </p>
              <p className="font-semibold text-primary italic border-l-2 border-heritage-gold pl-3 py-1 bg-antique-cream/40 rounded-r-lg">
                At the heart of Jiza is one simple belief — everyone deserves to experience the beauty of premium jewellery.
              </p>
              <p>
                We understand that many women dream of wearing exquisite, premium-looking jewellery for weddings, festivals, celebrations, and special occasions, but purchasing an entire premium collection may not always fit their budget. That is where our concept began.
              </p>
              <p>
                We bring together premium-quality, elegant and beautifully crafted jewellery at affordable prices, along with our rental service, so that you can enjoy the look and feel of a premium collection without making it an expensive investment.
              </p>
              <p>
                From our humble beginnings at home to the Jiza Jewellery Studio we have today, our journey has always been about quality, affordability, trust, and making every woman feel beautifully special.
              </p>
              <p className="font-medium text-on-surface">
                Jiza is not just jewellery. It is our way of making premium beauty accessible to everyone.
              </p>
              <p className="font-semibold text-heritage-gold pt-1">
                Thank you for being a part of our journey.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { num: '10,000+', label: 'Happy Customers' },
                { num: '100%', label: 'Authentic Craft' },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 bg-white/70 rounded-xl border border-heritage-gold/20 shadow-xs">
                  <p className="font-headline-sm text-primary font-bold text-lg">{s.num}</p>
                  <p className="text-[11px] text-on-surface-variant font-body-md">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-on-surface-variant font-body-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-heritage-gold text-base">location_on</span>
                <span>Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar, Pune – 411051</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-heritage-gold text-base">call</span>
                <a href="tel:8208822696" className="hover:text-primary transition-colors">+91 82088 22696</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-heritage-gold text-base">mail</span>
                <a href="mailto:jizajewellery@gmail.com" className="hover:text-primary transition-colors">jizajewellery@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Our Story image — Jiza Jewellery Studio storefront */}
          <div className="flex items-center justify-center w-full h-full">
            <img
              src="/jiza-store.jpg"
              alt="Jiza Jewellery Studio — our store in Pune"
              className="w-full h-auto max-h-[520px] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES — only 2 kept ===== */}
      <section className="py-10 border-y border-outline-variant/40 bg-surface-container-lowest my-8 px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 gap-6 text-center max-w-lg mx-auto">
          {[
            { icon: 'verified', title: '100% Authentic', sub: 'Certified purity & genuine craftsmanship' },
            { icon: 'support_agent', title: 'Dedicated Support', sub: 'Call / WhatsApp us anytime' },
          ].map((b) => (
            <div key={b.title} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-antique-cream flex items-center justify-center text-heritage-gold mb-3">
                <span className="material-symbols-outlined text-[26px]">{b.icon}</span>
              </div>
              <h4 className="font-label-md text-on-surface font-semibold mb-1">{b.title}</h4>
              <p className="font-body-md text-xs text-on-surface-variant">{b.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="pt-8 pb-6 px-margin-mobile md:px-margin-desktop bg-[#FCDAD7] text-black rounded-2xl mt-12 border border-black/15 border-b-4 border-b-black/25 shadow-md">
        
        {/* Footer Top: Brand Logo & Heading */}
        <div className="flex items-center gap-4 pb-6 mb-8 border-b border-black/15">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-black/20 shadow-md bg-black shrink-0">
            <img 
              src="/jiza-door-logo.png" 
              alt="Jiza Jewellery Studio Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 
              className="text-xl sm:text-2xl text-black font-bold tracking-[0.06em]"
              style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
            >
              Jiza Jewellery Studio
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

          {/* Brand Info */}
          <div>
            <span className="font-headline-sm text-black font-bold block mb-3">About Jiza</span>
            <p className="font-body-md text-sm text-black/85 mb-4">
              Celebrating royal Indian heritage and fine jewellery craftsmanship from the heart of Pune.
            </p>
            <div className="space-y-1.5 text-xs text-black/75">
              <p>📍 Shop No.17, 1st Floor, Shivpushp Landmark,<br />Suncity Road, Anand Nagar, Pune – 411051</p>
              <p>📞 <a href="tel:8208822696" className="hover:underline hover:text-black font-semibold transition-all">+91 82088 22696</a></p>
              <p>✉️ <a href="mailto:jizajewellery@gmail.com" className="hover:underline hover:text-black font-semibold transition-all">jizajewellery@gmail.com</a></p>
            </div>
          </div>

          {/* Customer Care — clickable items */}
          <div>
            <h5 className="font-label-md text-black font-bold mb-3 uppercase tracking-wider">Customer Care</h5>
            <ul className="space-y-2 text-xs font-body-md text-black/75">
              <li
                className="hover:underline hover:text-black cursor-pointer transition-colors font-bold text-black flex items-center gap-1"
                onClick={() => setActiveView('cancellation-policy')}
              >
                <span>Order Modification &amp; Cancellation</span>
                <span className="text-[10px] bg-[#F8B3AC] text-black px-1.5 py-0.2 rounded-full font-bold border border-black/15">2h</span>
              </li>
              <li
                className="hover:underline hover:text-black cursor-pointer transition-colors"
                onClick={() => setActiveView('faq')}
              >
                Contact Now
              </li>
              <li
                className="hover:underline hover:text-black cursor-pointer transition-colors"
                onClick={() => setActiveView('privacy')}
              >
                Privacy Policy
              </li>
              <li
                className="hover:underline hover:text-black cursor-pointer transition-colors font-bold text-black"
                onClick={() => setActiveView('faq')}
              >
                FAQ ↗
              </li>
              <li
                className="hover:underline hover:text-black cursor-pointer transition-colors"
                onClick={() => setActiveView('terms')}
              >
                Terms &amp; Conditions
              </li>
              <li
                className="hover:underline hover:text-black cursor-pointer transition-colors"
                onClick={() => setActiveView('faq')}
              >
                Contact Us
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-black/10 pt-6 text-center text-xs text-black/60 font-body-md">
          © 2026 Jiza Jewellery Studio, Pune
        </div>
      </footer>
      </div>

    </main>
  );
}
