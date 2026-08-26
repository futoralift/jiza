import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE, getMediaUrl } from '../config';

export default function ProductDetailPage({ 
  product, 
  onBack, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  isWishlisted,
  productsList = [],
  onSelectProduct,
  setActiveView
}) {
  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-5xl text-outline mb-3">diamond</span>
        <h2 className="text-xl font-bold text-black mb-2">Product Not Found</h2>
        <p className="text-sm text-on-surface-variant mb-6">The requested jewellery piece may no longer be available.</p>
        <button
          onClick={onBack || (() => setActiveView('home'))}
          className="px-6 py-2.5 bg-black text-[#FCDAD7] font-bold rounded-xl shadow hover:bg-stone-900 transition-all cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Store</span>
        </button>
      </div>
    );
  }

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [product?.id]);

  // Build unified media items list (images + optional video)
  const rawImages = product?.images?.filter(Boolean) || (product?.img ? [product.img] : []);
  const videoUrl = product?.videoUrl || product?.video_url || product?.video || '';

  const mediaItems = useMemo(() => {
    const list = rawImages.map((url) => ({ type: 'image', url: getMediaUrl(url) }));
    if (videoUrl && typeof videoUrl === 'string' && videoUrl.trim()) {
      list.push({ type: 'video', url: getMediaUrl(videoUrl.trim()) });
    }
    return list.length > 0 ? list : [{ type: 'image', url: '/logo-j.png' }];
  }, [rawImages, videoUrl]);

  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[0] : 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'details' | 'care' | 'reviews' | 'exchange'
  const [isAdded, setIsAdded] = useState(false);

  // Keep activeMedia within valid range
  useEffect(() => {
    if (activeMedia >= mediaItems.length) {
      setActiveMedia(0);
    }
  }, [mediaItems.length, activeMedia]);

  const handlePrevMedia = (e) => {
    if (e) e.stopPropagation();
    setActiveMedia((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const handleNextMedia = (e) => {
    if (e) e.stopPropagation();
    setActiveMedia((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  // Touch Swipe support for media slider
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      handleNextMedia();
    } else if (distance < -minSwipeDistance) {
      handlePrevMedia();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Approved Reviews
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(product?.rating || 4.8);
  const [reviewsCount, setReviewsCount] = useState(product?.reviewsCount || 0);

  useEffect(() => {
    if (!product?.id) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reviews/approved?productId=${product.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reviews)) {
            setApprovedReviews(data.reviews);
            if (data.count > 0) {
              setReviewsCount(data.count);
              setAvgRating(data.averageRating);
            }
          }
        }
      } catch (err) {
        console.log('Error loading reviews:', err);
      }
    };
    fetchReviews();
  }, [product?.id]);

  // Colours Parsing
  const availableColors = product?.colour
    ? product.colour.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const [selectedColor, setSelectedColor] = useState(availableColors[0] || '');

  useEffect(() => {
    const colors = product?.colour
      ? product.colour.split(',').map((c) => c.trim()).filter(Boolean)
      : [];
    setSelectedColor(colors[0] || '');
  }, [product?.id, product?.colour]);

  const sellingPrice = product.price || product.sellingPrice || 0;
  const mrp = product.mrp || product.originalPrice || 0;
  const discount = product.discount || (mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
  const maxStock = product?.stockQuantity !== undefined ? Number(product.stockQuantity) : (product?.stock_quantity !== undefined ? Number(product.stock_quantity) : 10);
  const isSoldOut = Boolean(product?.soldOut || product?.sold_out || !product?.inStock);

  const handleAdd = (e) => {
    if (isSoldOut) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onAddToCart(product, quantity, selectedSize, selectedColor, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      img: mediaItems[0]?.url || product.img || '/logo-j.png'
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuy = () => {
    if (isSoldOut) return;
    onBuyNow(product, quantity, selectedSize, selectedColor);
  };

  const currentMedia = mediaItems[activeMedia] || mediaItems[0] || { type: 'image', url: '/logo-j.png' };

  // Related products from the same category
  const relatedProducts = useMemo(() => {
    if (!productsList || productsList.length === 0) return [];
    return productsList
      .filter((p) => p.id !== product.id && (p.category === product.category || p.category_id === product.category_id || p.categoryLabel === product.categoryLabel))
      .slice(0, 4);
  }, [productsList, product]);

  return (
    <div className="w-full bg-[#FFF9F9] min-h-screen pb-24 text-on-surface">
      
      {/* ===== BREADCRUMB & TOP NAV BAR ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between border-b border-[#F8B3AC]/30 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
          <button
            type="button"
            onClick={onBack || (() => setActiveView('home'))}
            className="font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Home</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-black uppercase tracking-wider">
            {product.categoryLabel || product.category || 'Jewellery'}
          </span>
          {product.subcategoryLabel && (
            <>
              <span>/</span>
              <span>{product.subcategoryLabel}</span>
            </>
          )}
          <span>/</span>
          <span className="text-black font-bold truncate max-w-[160px] sm:max-w-xs">{product.title}</span>
        </div>

        <button
          type="button"
          onClick={onBack || (() => setActiveView('home'))}
          className="px-3 py-1.5 rounded-lg bg-[#FCDAD7] text-black font-bold text-xs hover:bg-[#F9C5C0] border border-black/15 transition-all flex items-center gap-1 cursor-pointer shrink-0 ml-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back</span>
        </button>
      </div>

      {/* ===== MAIN PRODUCT VIEWPORT (TWO-COLUMN RESPONSIVE LAYOUT) ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ===== LEFT COLUMN: INTERACTIVE MEDIA SHOWCASE ===== */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            
            {/* Main Active Media Frame with Touch Swipe */}
            <div 
              className="relative w-full aspect-[4/3] sm:aspect-square max-h-[480px] sm:max-h-[540px] rounded-3xl overflow-hidden bg-white border border-[#F8B3AC]/40 flex items-center justify-center shadow-md select-none group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Media Tag (Video Player or Image) */}
              {currentMedia.type === 'video' ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <video 
                    src={currentMedia.url} 
                    controls 
                    autoPlay 
                    playsInline 
                    muted 
                    loop
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                </div>
              ) : (
                <img 
                  src={currentMedia.url || '/logo-j.png'} 
                  alt={product.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo-j.png';
                  }}
                  className="w-full h-full object-contain p-2 sm:p-4 transition-transform duration-500 hover:scale-105"
                  loading="eager"
                />
              )}

              {/* Floating Badges */}
              <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.badge && product.badge !== 'Sold Out' && (
                  <span className="bg-[#FCDAD7] text-black border border-black/20 text-xs uppercase font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
                {isSoldOut && (
                  <span className="bg-stone-900 text-white text-xs uppercase font-bold px-3 py-1 rounded-full shadow">
                    Sold Out
                  </span>
                )}
                {currentMedia.type === 'video' && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">play_circle</span>
                    <span>Video Playing</span>
                  </span>
                )}
              </div>

              {discount > 0 && !isSoldOut && (
                <div className="absolute top-3.5 right-3.5 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {discount}% OFF
                </div>
              )}

              {/* Counter Pill */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-3.5 right-3.5 bg-black/70 backdrop-blur-sm text-white text-xs font-mono font-bold px-3 py-1 rounded-full z-10">
                  {activeMedia + 1} / {mediaItems.length}
                </div>
              )}

              {/* Next/Prev Navigation Arrows */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevMedia}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md active:scale-90 cursor-pointer z-20"
                    title="Previous Photo/Video"
                    aria-label="Previous"
                  >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md active:scale-90 cursor-pointer z-20"
                    title="Next Photo/Video"
                    aria-label="Next"
                  >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2.5 pt-2 overflow-x-auto pb-2 scroll-smooth items-center">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMedia(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeMedia === idx 
                        ? 'border-black shadow-md scale-105 ring-2 ring-black/20' 
                        : 'border-[#F8B3AC]/50 opacity-70 hover:opacity-100 hover:border-black/50'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center text-amber-200">
                        <span className="material-symbols-outlined text-lg">play_circle</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider">Video</span>
                      </div>
                    ) : (
                      <img 
                        src={item.url} 
                        alt={`Thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== RIGHT COLUMN: PRODUCT SPECIFICATIONS & ACTIONS ===== */}
          <div className="lg:col-span-5 flex flex-col space-y-5">
            
            {/* Header: Title, Category & Code */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-[#B87A75]">
                  {product.categoryLabel || product.category || 'Luxury Heritage'}
                </span>
                <span className="text-[11px] font-mono font-semibold bg-[#FCDAD7]/60 text-stone-800 border border-[#F8B3AC]/50 px-2 py-0.5 rounded-md">
                  Item Code: {product.productCode || product.product_code || 'JIZA-01'}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-black leading-tight">
                {product.title}
              </h1>

              {/* Rating & Reviews Bar */}
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="flex items-center gap-1 bg-[#FCDAD7] text-black px-2 py-0.5 rounded-full font-bold text-xs border border-black/15 shadow-xs">
                  <span className="material-symbols-outlined text-sm text-black" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span>{avgRating}</span>
                </div>
                <span className="text-xs text-on-surface-variant">
                  ({reviewsCount > 0 ? `${reviewsCount} customer reviews` : 'Handcrafted Masterpiece'})
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-white/80 border border-[#F8B3AC]/40 rounded-2xl p-4 shadow-xs">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-black tracking-tight">
                  ₹{Number(sellingPrice).toLocaleString('en-IN')}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-base text-outline line-through">
                    ₹{Number(mrp).toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md">
                    Save ₹{(mrp - sellingPrice).toLocaleString('en-IN')} ({discount}%)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5">
                Inclusive of all taxes • Free Insured Delivery across India
              </p>
            </div>

            {/* Colors Selection (if applicable) */}
            {availableColors.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                  Colour Options: <span className="font-normal text-on-surface-variant">({selectedColor})</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'bg-black text-[#FCDAD7] border-black shadow-sm font-bold'
                          : 'bg-white text-stone-700 border-black/15 hover:border-black/40'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-black">
                  Quantity
                </label>
                <span className={`text-xs font-bold flex items-center gap-1 ${isSoldOut ? 'text-red-600' : 'text-emerald-700'}`}>
                  <span className="material-symbols-outlined text-sm">
                    {isSoldOut ? 'cancel' : 'check_circle'}
                  </span>
                  <span>{isSoldOut ? 'Out of Stock' : (maxStock <= 3 ? `Only ${maxStock} left in stock!` : 'In Stock Ready to Ship')}</span>
                </span>
              </div>

              {!isSoldOut && (
                <div className="inline-flex items-center border border-black/20 rounded-xl bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-black hover:bg-[#FCDAD7] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-black">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    disabled={quantity >= maxStock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-black hover:bg-[#FCDAD7] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons: Add to Bag, Buy Now & Wishlist */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isSoldOut}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-sm ${
                    isSoldOut
                      ? 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border-black/25 active:scale-98'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isAdded ? 'done' : 'shopping_bag'}
                  </span>
                  <span>{isAdded ? 'Added to Bag!' : 'Add to Bag'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={isSoldOut}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isSoldOut
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-black hover:bg-stone-900 text-[#FCDAD7] active:scale-98'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">bolt</span>
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  className={`flex-1 py-2.5 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-white text-stone-800 border-black/15 hover:bg-[#FCDAD7]/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: `'FILL' ${isWishlisted ? 1 : 0}` }}>
                    favorite
                  </span>
                  <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <a
                  href={`https://wa.me/918208822696?text=${encodeURIComponent(`Hello Jiza Jewellery Studio! I want to consult about "${product.title}" (Code: ${product.productCode || product.product_code || ''}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-base text-emerald-600">chat</span>
                  <span>WhatsApp Styling</span>
                </a>
              </div>
            </div>

            {/* Trust Assurances Pill Row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F8B3AC]/40 text-[11px] text-stone-800 font-semibold">
              <div className="flex items-center gap-2 p-2.5 bg-white/70 rounded-xl border border-[#F8B3AC]/30">
                <span className="material-symbols-outlined text-base text-amber-700">local_shipping</span>
                <span>{product.deliveryTime || '2-4 Days Fast Delivery'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white/70 rounded-xl border border-[#F8B3AC]/30">
                <span className="material-symbols-outlined text-base text-emerald-700">verified</span>
                <span>100% Handcrafted Quality</span>
              </div>
            </div>

            {/* Tabbed Accordion (Description, Material, Care & Exchange Policy) */}
            <div className="pt-2 border-t border-[#F8B3AC]/40 space-y-3">
              <div className="flex border-b border-black/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'description'
                      ? 'border-black text-black'
                      : 'border-transparent text-on-surface-variant hover:text-black'
                  }`}
                >
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-black text-black'
                      : 'border-transparent text-on-surface-variant hover:text-black'
                  }`}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('exchange')}
                  className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'exchange'
                      ? 'border-black text-black'
                      : 'border-transparent text-on-surface-variant hover:text-black'
                  }`}
                >
                  Exchange Policy
                </button>
              </div>

              <div className="bg-white/80 rounded-2xl p-4 border border-[#F8B3AC]/30 text-xs leading-relaxed text-stone-800">
                {activeTab === 'description' && (
                  <p className="whitespace-pre-line">
                    {product.description || 'Handcrafted luxury heritage jewellery piece inspired by authentic Indian royal craftsmanship.'}
                  </p>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-black/5">
                      <span className="text-on-surface-variant font-semibold">Material:</span>
                      <span className="font-bold text-black">{product.material || 'Brass Alloy / Premium Gold Polish'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/5">
                      <span className="text-on-surface-variant font-semibold">Colour / Finish:</span>
                      <span className="font-bold text-black">{product.colour || selectedColor || 'Antique Gold'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/5">
                      <span className="text-on-surface-variant font-semibold">Care:</span>
                      <span className="font-bold text-black">{product.careInstructions || 'Keep away from moisture & perfume'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-on-surface-variant font-semibold">Origin:</span>
                      <span className="font-bold text-black">Handcrafted in Pune, India</span>
                    </div>
                  </div>
                )}

                {activeTab === 'exchange' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                      <span className="material-symbols-outlined text-sm">videocam</span>
                      <span>Strict Exchange Policy (Only Exchange • No Return)</span>
                    </div>
                    <p className="text-[11px] text-stone-700">
                      Exchange is available <strong>only for broken jewellery received in transit</strong>.
                      A continuous, unedited <strong>unboxing video proof</strong> is mandatory within <strong>10 hours of delivery</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ===== RELATED PRODUCTS SECTION ===== */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#F8B3AC]/40">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-black">
                  Complete Your Look
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  More handcrafted treasures from the {product.categoryLabel || 'same'} collection
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProd) => (
                <div
                  key={relProd.id}
                  onClick={() => onSelectProduct && onSelectProduct(relProd)}
                  className="bg-white rounded-2xl p-3 border border-[#F8B3AC]/30 hover:border-black/40 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-stone-50">
                    <img
                      src={relProd.images?.[0] || relProd.img || '/logo-j.png'}
                      alt={relProd.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-xs text-black line-clamp-1 group-hover:text-amber-800 transition-colors">
                    {relProd.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm text-black">
                      ₹{Number(relProd.price || relProd.sellingPrice || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-[#B87A75] uppercase">
                      View →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
