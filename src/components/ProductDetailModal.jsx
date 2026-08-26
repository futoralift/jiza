import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE, getMediaUrl } from '../config';

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  isWishlisted
}) {
  if (!product) return null;

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
  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'details' | 'care' | 'reviews'
  const [isAdded, setIsAdded] = useState(false);

  // Keep activeMedia within valid range when media items change
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

  // Keyboard navigation & body scroll locking
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setActiveMedia((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveMedia((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, mediaItems.length]);

  // Mobile Touch Swipe support for media slider
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

  // APPROVED REVIEWS STATE
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
        console.log('Error loading product reviews:', err);
      }
    };
    fetchReviews();
  }, [product?.id]);

  // Available Colours Parsing
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

  const handleAdd = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onAddToCart(product, quantity, selectedSize, selectedColor, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      img: rawImages[0] || product.img
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const currentMedia = mediaItems[activeMedia] || mediaItems[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fadeIn">
      {/* Modal Container: Sized to fit screen heights without overflow */}
      <div className="bg-[#FFF9F9] border border-[#F8B3AC] rounded-3xl max-w-3xl lg:max-w-4xl w-full max-h-[92vh] md:max-h-[85vh] overflow-hidden shadow-2xl relative animate-scaleUp flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur flex items-center justify-center transition-all shadow-md active:scale-95 focus:outline-none cursor-pointer"
          title="Close"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* ===== LEFT COLUMN: RESPONSIVE MEDIA SLIDER ===== */}
        <div className="md:w-1/2 bg-white/70 p-3 sm:p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#F8B3AC]/40 shrink-0">
          
          {/* Main Media Viewport with Touch Swipe */}
          <div 
            className="relative w-full aspect-square max-h-[280px] sm:max-h-[340px] md:max-h-[380px] rounded-2xl overflow-hidden bg-stone-50 border border-[#F8B3AC]/30 flex items-center justify-center shadow-inner select-none group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Active Media Item (Image or Video) */}
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
                alt={product.title || product.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo-j.png';
                }}
                className="w-full h-full object-contain transition-all duration-300"
                loading="eager"
              />
            )}

            {/* Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
              {product.badge && (
                <span className="bg-[#FCDAD7] text-stone-900 border border-[#F8B3AC] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {product.badge}
                </span>
              )}
              {currentMedia.type === 'video' && (
                <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[11px]">play_circle</span>
                  <span>Video</span>
                </span>
              )}
            </div>

            {discount > 0 && (
              <div className="absolute top-2.5 right-11 sm:right-2.5 bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {discount}% OFF
              </div>
            )}

            {/* Counter Pill */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full z-10">
                {activeMedia + 1} / {mediaItems.length}
              </div>
            )}

            {/* Previous Arrow */}
            {mediaItems.length > 1 && (
              <button
                type="button"
                onClick={handlePrevMedia}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow active:scale-90 opacity-90 md:opacity-0 md:group-hover:opacity-100 focus:outline-none cursor-pointer z-20"
                title="Previous Media"
                aria-label="Previous Media"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
            )}

            {/* Next Arrow */}
            {mediaItems.length > 1 && (
              <button
                type="button"
                onClick={handleNextMedia}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow active:scale-90 opacity-90 md:opacity-0 md:group-hover:opacity-100 focus:outline-none cursor-pointer z-20"
                title="Next Media"
                aria-label="Next Media"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            )}
          </div>

          {/* Media Thumbnail Carousel */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 pt-2.5 overflow-x-auto justify-center items-center pb-1">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMedia(idx)}
                  className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    activeMedia === idx 
                      ? 'border-black shadow-md scale-105 ring-1 ring-black/20' 
                      : 'border-[#F8B3AC]/50 opacity-70 hover:opacity-100 hover:border-black/40'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center text-amber-200">
                      <span className="material-symbols-outlined text-base">play_circle</span>
                      <span className="text-[7px] font-bold uppercase tracking-wider">Video</span>
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

        {/* ===== RIGHT COLUMN: PRODUCT INFO & COMPACT DETAILS ===== */}
        <div className="md:w-1/2 p-4 sm:p-5 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-none justify-between space-y-3">
          
          <div className="space-y-2.5">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-700 font-bold uppercase tracking-widest">
                {product.categoryLabel || product.category}
              </span>
              <div className="flex items-center text-xs text-stone-600 gap-1 bg-[#FCDAD7]/30 px-2 py-0.5 rounded-full border border-[#F8B3AC]/40">
                <span className="material-symbols-outlined text-[14px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-bold text-stone-900">{avgRating}</span>
                <span className="text-[10px]">({reviewsCount})</span>
              </div>
            </div>

            {/* Product Title */}
            <h2 className="text-base sm:text-lg text-stone-900 font-bold leading-snug">
              {product.title || product.name}
            </h2>

            {/* Price Row */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-xl sm:text-2xl font-bold text-stone-900">
                ₹{Number(sellingPrice).toLocaleString('en-IN')}
              </span>
              {mrp > 0 && mrp !== sellingPrice && (
                <span className="text-xs text-stone-400 line-through font-medium">
                  ₹{Number(mrp).toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-200">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Quick Specs Chips */}
            <div className="flex flex-wrap gap-1.5">
              {(product.productCode || product.product_code) && (
                <span className="inline-flex items-center gap-1 bg-[#FCDAD7]/50 border border-[#F8B3AC] text-stone-900 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                  <span>Code:</span>
                  <span>{product.productCode || product.product_code}</span>
                </span>
              )}
              {product.colour && (
                <span className="inline-flex items-center gap-1 bg-white border border-[#F8B3AC] text-stone-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  <span className="material-symbols-outlined text-[11px] text-stone-700">palette</span>
                  {product.colour}
                </span>
              )}
              {product.material && (
                <span className="inline-flex items-center gap-1 bg-white border border-[#F8B3AC] text-stone-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  <span className="material-symbols-outlined text-[11px] text-stone-700">diamond</span>
                  {product.material}
                </span>
              )}
              {product.deliveryTime && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  <span className="material-symbols-outlined text-[11px]">local_shipping</span>
                  {product.deliveryTime}
                </span>
              )}
            </div>

            {/* Tabs: Description / Details / Care / Reviews */}
            <div className="pt-1">
              <div className="flex gap-1 border-b border-[#F8B3AC]/40 overflow-x-auto pb-1">
                {[
                  { key: 'description', label: 'Description' },
                  { key: 'details', label: 'Details' },
                  { key: 'care', label: 'Care' },
                  { key: 'reviews', label: `Reviews (${reviewsCount})` }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-[#FCDAD7] text-stone-900 border border-[#F8B3AC] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-[#FCDAD7]/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-stone-700 leading-relaxed pt-2 min-h-[45px] max-h-32 overflow-y-auto pr-1">
                {activeTab === 'description' && (
                  <p>{product.description || 'Exquisite handcrafted Indian jewellery from Jiza Jewellery Studio.'}</p>
                )}
                {activeTab === 'details' && (
                  <div className="space-y-1 text-[11px]">
                    {product.material && <p><strong className="text-stone-900">Material:</strong> {product.material}</p>}
                    {product.colour && <p><strong className="text-stone-900">Colour:</strong> {product.colour}</p>}
                    {product.deliveryTime && <p><strong className="text-stone-900">Delivery:</strong> {product.deliveryTime}</p>}
                    {!product.material && !product.colour && <p>Handcrafted with premium gemstones and luxury alloy finish.</p>}
                  </div>
                )}
                {activeTab === 'care' && (
                  <p className="text-[11px]">
                    {product.careInstructions || 'Store in a dry velvet box. Keep away from direct water, sprays, and perfumes to preserve the lustre.'}
                  </p>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-2">
                    {approvedReviews.length === 0 ? (
                      <p className="text-[11px] text-stone-500 italic">No customer reviews yet. Be the first to review after purchase!</p>
                    ) : (
                      approvedReviews.map((rev) => (
                        <div key={rev.id} className="p-2 bg-[#FCDAD7]/20 rounded-xl border border-[#F8B3AC]/40 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-stone-900">{rev.customer_name}</span>
                            <div className="flex items-center text-amber-600 text-[10px]">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: `'FILL' ${s <= rev.rating ? 1 : 0}` }}>star</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-700">{rev.review_text}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Colour Options Selector */}
            {availableColors.length > 0 && (
              <div>
                <label className="text-[10px] uppercase font-bold text-stone-700 block mb-1.5 flex items-center justify-between">
                  <span>Colour:</span>
                  <span className="text-stone-900 font-bold normal-case text-xs">{selectedColor || availableColors[0]}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableColors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedColor === col
                          ? 'bg-[#FCDAD7] text-stone-900 font-bold border border-black/40 shadow-xs scale-102'
                          : 'bg-white text-stone-700 border border-[#F8B3AC]/60 hover:border-black/30'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                        style={{
                          backgroundColor:
                            col.toLowerCase().includes('gold') ? '#D4AF37' :
                            col.toLowerCase().includes('silver') ? '#C0C0C0' :
                            col.toLowerCase().includes('rose') ? '#B76E79' :
                            col.toLowerCase().includes('ruby') || col.toLowerCase().includes('red') ? '#990000' :
                            col.toLowerCase().includes('emerald') || col.toLowerCase().includes('green') ? '#046307' :
                            col.toLowerCase().includes('black') ? '#1A1A1A' :
                            col.toLowerCase().includes('blue') || col.toLowerCase().includes('sapphire') ? '#0F4C81' :
                            col.toLowerCase().includes('white') || col.toLowerCase().includes('pearl') ? '#F5F5F0' : '#8D6E63'
                        }}
                      />
                      <span>{col}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="text-[10px] uppercase font-bold text-stone-700 block mb-1">Size / Length:</label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <button 
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'bg-[#FCDAD7] text-stone-900 font-bold border border-black/40 shadow-xs'
                          : 'bg-white text-stone-700 border border-[#F8B3AC]/60 hover:border-black/30'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-2.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-stone-700">Qty:</span>
              <div className="flex items-center border border-[#F8B3AC] rounded-xl bg-white shadow-xs overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))} 
                  className="px-2.5 py-0.5 text-stone-800 hover:bg-[#FCDAD7] font-bold cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-0.5 text-xs font-bold font-mono">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))} 
                  disabled={quantity >= maxStock}
                  className={`px-2.5 py-0.5 font-bold transition-colors ${
                    quantity >= maxStock 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'text-stone-800 hover:bg-[#FCDAD7] cursor-pointer'
                  }`}
                >
                  +
                </button>
              </div>
              {quantity >= maxStock && (
                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  ⚠️ Max {maxStock} in stock
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Add to Bag + Buy Now + Wishlist */}
          <div className="pt-3 border-t border-[#F8B3AC]/50 mt-auto">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={(e) => handleAdd(e)}
                className={`flex-1 py-2.5 px-3 font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-black/15 cursor-pointer ${
                  isAdded 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-white hover:bg-[#FFF0F2] text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">{isAdded ? 'done' : 'shopping_bag'}</span>
                <span>{isAdded ? 'Added!' : 'Add to Bag'}</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  if (onBuyNow) {
                    onBuyNow(product, quantity, selectedSize, selectedColor);
                  } else {
                    onAddToCart(product, quantity, selectedSize, selectedColor);
                  }
                }}
                className="flex-1 py-2.5 px-3 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-stone-900 border border-black/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">flash_on</span>
                <span>Buy Now</span>
              </button>

              <button 
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
                  isWishlisted 
                    ? 'bg-[#FCDAD7] text-red-600 border-black/20' 
                    : 'bg-white border-[#F8B3AC] hover:border-black/30 text-stone-700'
                }`}
                title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${isWishlisted ? 1 : 0}` }}>favorite</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
