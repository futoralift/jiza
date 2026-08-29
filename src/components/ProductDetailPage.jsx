import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE, getMediaUrl } from '../config';
import ProductImageLightbox from './ProductImageLightbox';

export default function ProductDetailPage({ 
  product, 
  onBack, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  isWishlisted,
  productsList = [],
  onSelectProduct,
  setActiveView,
  currentUser = null,
  onOpenAuthModal = null
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
    const items = [];
    if (videoUrl) {
      items.push({ type: 'video', url: getMediaUrl(videoUrl) });
    }
    rawImages.forEach((img) => {
      items.push({ type: 'image', url: getMediaUrl(img) });
    });
    if (items.length === 0) {
      items.push({ type: 'image', url: '/logo-j.webp' });
    }
    return items;
  }, [videoUrl, rawImages]);

  const [activeMedia, setActiveMedia] = useState(0);

  // Extract all pure image items for this product only
  const productImages = useMemo(() => {
    const imagesOnly = mediaItems.filter(item => item.type === 'image');
    if (imagesOnly.length > 0) return imagesOnly;
    return [{ type: 'image', url: product?.img ? getMediaUrl(product.img) : '/logo-j.webp' }];
  }, [mediaItems, product?.img]);

  // Fullscreen Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  const handleOpenLightbox = (mediaIdx = activeMedia) => {
    const targetItem = mediaItems[mediaIdx] || mediaItems[0];
    if (targetItem && targetItem.type === 'video') {
      setLightboxInitialIndex(0);
      setIsLightboxOpen(true);
      return;
    }
    const imgIndex = productImages.findIndex(img => img.url === targetItem?.url);
    setLightboxInitialIndex(imgIndex >= 0 ? imgIndex : 0);
    setIsLightboxOpen(true);
  };

  const handleLightboxIndexChange = (newImgIdx) => {
    const targetImg = productImages[newImgIdx];
    if (targetImg) {
      const mediaIdx = mediaItems.findIndex(m => m.url === targetImg.url);
      if (mediaIdx >= 0) {
        setActiveMedia(mediaIdx);
      }
    }
  };

  // Reset active media when product changes
  useEffect(() => {
    setActiveMedia(0);
  }, [product?.id]);

  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[0] : 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'details' | 'care' | 'reviews' | 'exchange'
  const [isAdded, setIsAdded] = useState(false);

  // Available Stock from Backend DB
  const maxStock = product?.stockQuantity !== undefined 
    ? Number(product.stockQuantity) 
    : (product?.stock_quantity !== undefined ? Number(product.stock_quantity) : 10);
  
  const isSoldOut = Boolean(product?.soldOut || product?.sold_out || !product?.inStock || maxStock <= 0);

  // Reset quantity if it exceeds maxStock
  useEffect(() => {
    if (quantity > maxStock && maxStock > 0) {
      setQuantity(maxStock);
    } else if (quantity < 1 && maxStock > 0) {
      setQuantity(1);
    }
  }, [maxStock]);

  const handleNextMedia = () => {
    setActiveMedia((prev) => (prev + 1) % mediaItems.length);
  };

  const handlePrevMedia = () => {
    setActiveMedia((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
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

  // ========================================================
  // STRICT PRODUCT REVIEWS SYSTEM (100% GENUINE & VERIFIED)
  // ========================================================
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState({
    loading: false,
    checked: false,
    eligible: false,
    hasPurchased: false,
    hasReviewed: false,
    orderId: '',
    orderCode: '',
    reason: ''
  });

  const [reviewFormData, setReviewFormData] = useState({
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    rating: 5,
    headline: '',
    reviewText: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Fetch only genuine reviews belonging to this specific product from PostgreSQL
  const fetchReviews = async () => {
    if (!product?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/approved?productId=${encodeURIComponent(product.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reviews)) {
          setApprovedReviews(data.reviews);
          setReviewsCount(data.count || 0);
          setAvgRating(data.averageRating || 0);
        }
      }
    } catch (err) {
      console.log('Error loading reviews:', err);
    }
  };

  // Check if current user is eligible (has purchased this specific product)
  const checkEligibility = async (customEmail = null) => {
    if (!product?.id) return;
    const email = customEmail !== null ? customEmail : (currentUser?.email || reviewFormData.customerEmail);
    const userId = currentUser?.id || '';

    if (!email && !userId) {
      setReviewEligibility({
        loading: false,
        checked: true,
        eligible: false,
        hasPurchased: false,
        hasReviewed: false,
        orderId: '',
        orderCode: '',
        reason: 'Please sign in or enter your order email to verify your purchase.'
      });
      return;
    }

    setReviewEligibility(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(
        `${API_BASE}/api/reviews/eligibility?productId=${encodeURIComponent(product.id)}&userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email || '')}`
      );
      if (res.ok) {
        const data = await res.json();
        setReviewEligibility({
          loading: false,
          checked: true,
          eligible: !!data.eligible,
          hasPurchased: !!data.hasPurchased,
          hasReviewed: !!data.hasReviewed,
          orderId: data.orderId || '',
          orderCode: data.orderCode || '',
          reason: data.reason || ''
        });
        if (data.customerName && !reviewFormData.customerName) {
          setReviewFormData(prev => ({ ...prev, customerName: data.customerName }));
        }
      } else {
        setReviewEligibility({
          loading: false,
          checked: true,
          eligible: false,
          hasPurchased: false,
          hasReviewed: false,
          orderId: '',
          orderCode: '',
          reason: 'Unable to verify purchase eligibility.'
        });
      }
    } catch (err) {
      setReviewEligibility({
        loading: false,
        checked: true,
        eligible: false,
        hasPurchased: false,
        hasReviewed: false,
        orderId: '',
        orderCode: '',
        reason: 'Network error checking eligibility.'
      });
    }
  };

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [product?.id, currentUser?.id, currentUser?.email]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const name = (reviewFormData.customerName || currentUser?.name || '').trim();
    const email = (reviewFormData.customerEmail || currentUser?.email || '').trim();
    const text = (reviewFormData.reviewText || '').trim();

    if (!name || !text) {
      alert('Please provide your Name and Review comments.');
      return;
    }
    if (!email && !currentUser?.id) {
      alert('Please provide your registered order Email to verify your purchase.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || '',
          orderId: reviewEligibility.orderId || '',
          productId: product.id,
          productName: product.title,
          productImage: (product.images && product.images[0]) || product.img || '',
          customerName: name,
          customerEmail: email,
          rating: Number(reviewFormData.rating) || 5,
          headline: reviewFormData.headline.trim(),
          reviewText: text
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReviewSuccessMsg('✨ Thank you! Your verified purchase review has been published.');
        setReviewFormData({ customerName: currentUser?.name || '', customerEmail: currentUser?.email || '', rating: 5, headline: '', reviewText: '' });
        fetchReviews();
        checkEligibility(email);
        setTimeout(() => {
          setIsWriteReviewOpen(false);
          setReviewSuccessMsg('');
        }, 3500);
      } else {
        alert(data.error || 'Failed to submit review. Only verified buyers who ordered this product can submit a review.');
      }
    } catch (err) {
      alert('Network error while submitting review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  // STOCK VALIDATED ADD TO CART
  const handleAdd = (e) => {
    if (isSoldOut || maxStock <= 0) {
      alert('⚠️ This product is currently Sold Out.');
      return;
    }
    const validatedQty = Math.min(Math.max(1, quantity), maxStock);
    const rect = e.currentTarget.getBoundingClientRect();
    onAddToCart(product, validatedQty, selectedSize, selectedColor, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      img: mediaItems[0]?.url || product.img || '/logo-j.webp'
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // STOCK VALIDATED BUY NOW
  const handleBuy = () => {
    if (isSoldOut || maxStock <= 0) {
      alert('⚠️ This product is currently Sold Out.');
      return;
    }
    const validatedQty = Math.min(Math.max(1, quantity), maxStock);
    onBuyNow(product, validatedQty, selectedSize, selectedColor);
  };

  const currentMedia = mediaItems[activeMedia] || mediaItems[0] || { type: 'image', url: '/logo-j.webp' };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* ===== LEFT COLUMN: COMPACT INTERACTIVE MEDIA SHOWCASE ===== */}
          <div className="lg:col-span-5 flex flex-col gap-2.5 max-w-md mx-auto lg:max-w-none w-full">
            
            {/* Main Compact Media Frame with Touch Swipe & Fullscreen Lightbox trigger */}
            <div 
              className={`relative w-full aspect-square max-h-[340px] sm:max-h-[390px] md:max-h-[410px] rounded-3xl overflow-hidden bg-white border border-[#F8B3AC]/40 flex items-center justify-center shadow-md select-none group mx-auto ${
                currentMedia.type !== 'video' ? 'cursor-zoom-in' : ''
              }`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => {
                if (currentMedia.type !== 'video') {
                  handleOpenLightbox(activeMedia);
                }
              }}
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
                  src={currentMedia.url || '/logo-j.webp'} 
                  alt={product.title} 
                  width="600"
                  height="600"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo-j.webp';
                  }}
                  className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-500 hover:scale-105"
                  loading="eager"
                  decoding="async"
                />
              )}

              {/* Floating Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.badge && product.badge !== 'Sold Out' && (
                  <span className="bg-[#FCDAD7] text-black border border-black/20 text-xs uppercase font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {product.badge}
                  </span>
                )}
                {isSoldOut && (
                  <span className="bg-red-600 text-white text-xs uppercase font-bold px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
                    Sold Out
                  </span>
                )}
                {currentMedia.type === 'video' && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">play_circle</span>
                    <span>Video Playing</span>
                  </span>
                )}
              </div>

              {discount > 0 && !isSoldOut && (
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                  {discount}% OFF
                </div>
              )}

              {/* Zoom In Pill Indicator (Hover & Click) */}
              {currentMedia.type !== 'video' && (
                <div 
                  className="absolute bottom-3 left-3 bg-black/70 hover:bg-black text-white px-2.5 py-1 rounded-full backdrop-blur-md transition-all shadow-md active:scale-95 z-20 flex items-center gap-1 cursor-pointer border border-white/20 text-[11px] font-medium opacity-90 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLightbox(activeMedia);
                  }}
                  title="Click to open fullscreen gallery"
                >
                  <span className="material-symbols-outlined text-sm">fullscreen</span>
                  <span className="hidden sm:inline">Fullscreen</span>
                </div>
              )}

              {/* Counter Pill */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full z-10">
                  {activeMedia + 1} / {mediaItems.length}
                </div>
              )}

              {/* Next/Prev Navigation Arrows */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevMedia();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md active:scale-90 cursor-pointer z-20"
                    title="Previous Photo/Video"
                    aria-label="Previous"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextMedia();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md active:scale-90 cursor-pointer z-20"
                    title="Next Photo/Video"
                    aria-label="Next"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 pt-1 overflow-x-auto pb-1 scroll-smooth items-center justify-start">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMedia(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeMedia === idx 
                        ? 'border-black shadow-md scale-105 ring-2 ring-black/20' 
                        : 'border-[#F8B3AC]/50 opacity-70 hover:opacity-100 hover:border-black/50'
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

          {/* ===== RIGHT COLUMN: PRODUCT SPECIFICATIONS & ACTIONS ===== */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
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
                  <span>{reviewsCount > 0 ? avgRating : '5.0'}</span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  {reviewsCount > 0 
                    ? `(${reviewsCount} verified ${reviewsCount === 1 ? 'review' : 'reviews'})`
                    : '(Handcrafted Masterpiece • 5.0)'}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-white/80 border border-[#F8B3AC]/40 rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl sm:text-2xl font-bold text-black tracking-tight font-mono">
                  ₹{Number(sellingPrice).toLocaleString('en-IN')}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-sm text-outline line-through font-mono">
                    ₹{Number(mrp).toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md">
                    Save ₹{(mrp - sellingPrice).toLocaleString('en-IN')} ({discount}%)
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-on-surface-variant mt-1">
                Inclusive of all taxes • Insured Delivery across India
              </p>
            </div>

            {/* ======================================================== */}
            {/* DELIVERY & EXCHANGE POLICY BADGES (SIDE-BY-SIDE IN A ROW) */}
            {/* ======================================================== */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('shipping')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#FCDAD7]/60 hover:bg-[#FCDAD7] text-stone-900 border border-black/15 rounded-xl font-bold text-[11px] sm:text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-stone-800">local_shipping</span>
                <span className="truncate">4–10 Days Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('exchange')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-red-50 hover:bg-red-100/70 text-red-700 border border-red-300 rounded-xl font-bold text-[11px] sm:text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-red-600">published_with_changes</span>
                <span className="truncate">Only Exchange • No Return</span>
              </button>
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

            {/* ======================================================== */}
            {/* AVAILABLE STOCK & QUANTITY SELECTOR (STRICT STOCK LIMITS) */}
            {/* ======================================================== */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-black">
                  Quantity
                </label>

                {/* Stock Messaging Badge */}
                {isSoldOut || maxStock <= 0 ? (
                  <span className="text-xs font-bold bg-red-100 text-red-700 border border-red-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>Sold Out (0 Available)</span>
                  </span>
                ) : maxStock <= 5 ? (
                  <span className="text-xs font-bold bg-red-100 text-red-700 border border-red-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>⚡ Only {maxStock} left in stock — Order soon!</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>✓ In Stock ({maxStock} units available)</span>
                  </span>
                )}
              </div>

              {!isSoldOut && maxStock > 0 && (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-black/25 rounded-xl bg-white p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-black hover:bg-[#FCDAD7] disabled:opacity-30 cursor-pointer transition-colors"
                      title="Decrease Quantity"
                    >
                      <span className="material-symbols-outlined text-base">remove</span>
                    </button>
                    <span className="w-12 text-center font-bold text-base text-black font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                      disabled={quantity >= maxStock}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-black hover:bg-[#FCDAD7] disabled:opacity-30 cursor-pointer transition-colors"
                      title="Increase Quantity"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                    </button>
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">
                    (Max {maxStock} units per order)
                  </span>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* ACTION BUTTONS (2-IN-A-ROW MOBILE, 4-IN-A-ROW LAPTOP) */}
            {/* ======================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAdd}
                disabled={isSoldOut || maxStock <= 0}
                className={`w-full py-3 sm:py-3.5 px-2 rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
                  isSoldOut || maxStock <= 0
                    ? 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border-black/25 active:scale-98'
                }`}
              >
                <span className="material-symbols-outlined text-base sm:text-lg">
                  {isAdded ? 'done' : 'shopping_bag'}
                </span>
                <span className="truncate">{isSoldOut || maxStock <= 0 ? 'Sold Out' : isAdded ? 'Added!' : 'Add to Bag'}</span>
              </button>

              <button
                type="button"
                onClick={handleBuy}
                disabled={isSoldOut || maxStock <= 0}
                className={`w-full py-3 sm:py-3.5 px-2 rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  isSoldOut || maxStock <= 0
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-black hover:bg-stone-900 text-[#FCDAD7] active:scale-98'
                }`}
              >
                <span className="material-symbols-outlined text-base sm:text-lg">bolt</span>
                <span className="truncate">Buy Now</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`w-full py-3 sm:py-3.5 px-2 rounded-xl sm:rounded-2xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-white text-stone-800 border-black/15 hover:bg-[#FCDAD7]/30'
                }`}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: `'FILL' ${isWishlisted ? 1 : 0}` }}>
                  favorite
                </span>
                <span className="truncate">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>

              <a
                href={`https://wa.me/918208822696?text=${encodeURIComponent(`Hello Jiza Jewellery Studio! I want to consult about "${product.title}" (Code: ${product.productCode || product.product_code || ''}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 sm:py-3.5 px-2 rounded-xl sm:rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-base text-emerald-600">chat</span>
                <span className="truncate">WhatsApp</span>
              </a>
            </div>

            {/* Tabbed Accordion (Description, Material, Care & Detailed Exchange Policy) */}
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
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'shipping'
                      ? 'border-black text-black font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-black'
                  }`}
                >
                  Shipping &amp; Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('exchange')}
                  className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'exchange'
                      ? 'border-black text-black font-bold'
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

                {activeTab === 'shipping' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs pb-1 border-b border-black/10">
                      <span className="material-symbols-outlined text-base text-stone-800">local_shipping</span>
                      <span>Delivery &amp; Store Pickup Options</span>
                    </div>

                    <div className="space-y-2.5 text-[11px] text-stone-800 leading-relaxed">
                      <div className="bg-[#FFF0F2] border border-[#F8B3AC]/60 rounded-xl p-2.5 flex items-start gap-2">
                        <span className="text-base shrink-0">🇮🇳</span>
                        <div>
                          <span className="font-bold text-stone-900">Domestic Delivery (India): </span>
                          <span>Standard delivery in <strong>4–10 business days</strong>. Flat ₹99 shipping (<strong>FREE on orders ₹5,000 and above</strong>). Insured courier partners.</span>
                        </div>
                      </div>

                      <div className="bg-[#FFF0F2] border border-[#F8B3AC]/60 rounded-xl p-2.5 flex items-start gap-2">
                        <span className="text-base shrink-0">🏬</span>
                        <div>
                          <span className="font-bold text-stone-900">Pune Studio Pickup (FREE): </span>
                          <span>Ready for collection in approximately <strong>12 hours</strong> at Shivpushpa Landmark, Sinhagad Road, Pune (10:30 AM – 8:00 PM).</span>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2">
                        <span className="text-base shrink-0">🌎</span>
                        <div>
                          <span className="font-bold text-amber-900">International Shipping Available: </span>
                          <span>We ship worldwide. Final international shipping charge is confirmed by our team via WhatsApp / Phone after packing. Delivered DDU.</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof setActiveView === 'function') setActiveView('shipping-policy');
                          }}
                          className="text-black font-bold underline hover:text-stone-700 flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Full Shipping &amp; Delivery Policy</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'exchange' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-xs pb-1 border-b border-red-200">
                      <span className="material-symbols-outlined text-base text-red-600">published_with_changes</span>
                      <span>Strict Exchange Policy (Only Exchange • No Return / No Refund)</span>
                    </div>

                    <div className="space-y-2 text-[11px] text-stone-800 leading-relaxed">
                      <div className="bg-red-50/80 border border-red-200 rounded-xl p-2.5 flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-red-600 shrink-0 mt-0.5">videocam</span>
                        <div>
                          <span className="font-bold text-red-900">Mandatory Unboxing Video: </span>
                          <span>You must record a 360-degree, continuous, uncut video showing the sealed outer parcel being opened and inspecting the broken item inside. Without video proof, claims cannot be processed.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-stone-700 shrink-0 mt-0.5">schedule</span>
                        <div>
                          <span className="font-bold text-black">10-Hour Reporting Window: </span>
                          <span>Exchange requests must be submitted within <strong>10 hours of package delivery</strong> via WhatsApp or Email.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-stone-700 shrink-0 mt-0.5">broken_image</span>
                        <div>
                          <span className="font-bold text-black">Transit Damage Only: </span>
                          <span>Applicable strictly for items broken or damaged during transit. Personal preferences or size mismatches are not eligible due to strict hygiene and luxury craftsmanship standards.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* SECTION: 100% GENUINE VERIFIED CUSTOMER REVIEWS */}
        {/* ======================================================== */}
        <div className="mt-16 pt-10 border-t border-[#F8B3AC]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black flex items-center gap-2">
                <span>Customer Ratings & Reviews</span>
                {reviewsCount > 0 && (
                  <span className="text-sm font-sans font-bold bg-[#FCDAD7] text-black px-2.5 py-0.5 rounded-full border border-black/15">
                    ★ {avgRating}
                  </span>
                )}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                {reviewsCount > 0 
                  ? `Genuine verified customer feedback for ${product.title}`
                  : 'Exclusive feedback from verified buyers who purchased this jewellery piece.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(!isWriteReviewOpen)}
              className="px-5 py-2.5 bg-black text-[#FCDAD7] hover:bg-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-base">rate_review</span>
              <span>{isWriteReviewOpen ? 'Close Form' : 'Write a Review'}</span>
            </button>
          </div>

          {/* Write a Review Collapsible Form (Strict Purchase Verification) */}
          {isWriteReviewOpen && (
            <div className="mb-10 bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-5">
                <div>
                  <h3 className="font-serif font-bold text-lg text-black">Write a Verified Review</h3>
                  <p className="text-xs text-on-surface-variant">Reviews are exclusively accepted from confirmed buyers of this item.</p>
                </div>
                {reviewEligibility.eligible && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    <span>Verified Buyer ({reviewEligibility.orderCode || 'Confirmed Order'})</span>
                  </span>
                )}
              </div>

              {reviewSuccessMsg ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-2xl text-sm font-bold text-center">
                  {reviewSuccessMsg}
                </div>
              ) : reviewEligibility.hasReviewed ? (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
                  <span className="material-symbols-outlined text-3xl text-amber-600">check_circle</span>
                  <h4 className="font-bold text-sm text-black">Review Already Submitted</h4>
                  <p className="text-xs text-stone-700 max-w-md mx-auto">
                    You have already submitted a verified review for this product. Thank you for supporting Jiza Jewellery Studio!
                  </p>
                </div>
              ) : !reviewEligibility.eligible && reviewEligibility.checked && (currentUser || reviewFormData.customerEmail) ? (
                <div className="p-5 bg-stone-50 border border-black/15 rounded-2xl text-center space-y-3">
                  <span className="material-symbols-outlined text-3xl text-stone-500">lock</span>
                  <h4 className="font-bold text-sm text-black">Verified Purchase Required</h4>
                  <p className="text-xs text-stone-600 max-w-md mx-auto">
                    Our reviews system strictly accepts feedback only from customers who have purchased <strong>{product.title}</strong>. 
                    If you placed your order using another email, please enter it below to verify your purchase.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                    <input 
                      type="email" 
                      placeholder="Enter order email to verify..." 
                      value={reviewFormData.customerEmail}
                      onChange={(e) => setReviewFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="flex-1 px-3.5 py-2 bg-white border border-black/20 rounded-xl text-xs text-black"
                    />
                    <button
                      type="button"
                      onClick={() => checkEligibility(reviewFormData.customerEmail)}
                      disabled={reviewEligibility.loading}
                      className="px-4 py-2 bg-black text-[#FCDAD7] font-bold text-xs rounded-xl cursor-pointer hover:bg-stone-900"
                    >
                      {reviewEligibility.loading ? 'Checking...' : 'Verify Email'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                          className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                        >
                          <span 
                            className={`material-symbols-outlined text-2xl ${
                              star <= reviewFormData.rating ? 'text-amber-500' : 'text-stone-300'
                            }`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        </button>
                      ))}
                      <span className="text-xs font-bold text-stone-700 ml-2">
                        {reviewFormData.rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewFormData.customerName}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="e.g. Pooja Sharma"
                        className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-black/15 rounded-xl text-xs text-black focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                        Order Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={reviewFormData.customerEmail}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        onBlur={() => checkEligibility(reviewFormData.customerEmail)}
                        placeholder="Your registered order email"
                        className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-black/15 rounded-xl text-xs text-black focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      Review Headline (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewFormData.headline}
                      onChange={(e) => setReviewFormData(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="e.g. Absolutely stunning polish and premium feel!"
                      className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-black/15 rounded-xl text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      Detailed Review *
                    </label>
                    <textarea
                      required
                      rows="3"
                      value={reviewFormData.reviewText}
                      onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                      placeholder="Write your honest thoughts on the craftsmanship, polish, weight, and delivery..."
                      className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-black/15 rounded-xl text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-black text-[#FCDAD7] font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:bg-stone-900 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSubmittingReview ? 'Verifying & Submitting...' : 'Submit Verified Review'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Reviews List & Ratings Summary */}
          {approvedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Rating Summary Card */}
              <div className="md:col-span-4 bg-white border border-[#F8B3AC]/40 rounded-3xl p-6 shadow-xs flex flex-col justify-center items-center text-center">
                <span className="text-5xl font-bold text-black font-serif">{avgRating}</span>
                <div className="flex items-center gap-1 my-2 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-stone-700">
                  Based on {reviewsCount} verified {reviewsCount === 1 ? 'customer review' : 'customer reviews'}
                </p>
                <div className="mt-4 pt-4 border-t border-black/10 w-full text-[11px] text-stone-600 space-y-1 text-left">
                  <div className="flex justify-between font-medium">
                    <span>Authentic Royal Craftsmanship</span>
                    <span className="font-bold text-emerald-700">100% Verified</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Safe & Insured Shipping</span>
                    <span className="font-bold text-emerald-700">100% Insured</span>
                  </div>
                </div>
              </div>

              {/* Individual Review Cards */}
              <div className="md:col-span-8 space-y-4">
                {approvedReviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-[#F8B3AC]/40 rounded-2xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FCDAD7] text-black font-bold text-xs flex items-center justify-center border border-black/15">
                          {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-black">{rev.customer_name}</h4>
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            <span>Verified Buyer</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                      {rev.review_text || rev.comment}
                    </p>

                    <div className="text-[10px] text-on-surface-variant pt-1">
                      Reviewed on {new Date(rev.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#F8B3AC]/30 rounded-3xl p-8 sm:p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FCDAD7] text-black flex items-center justify-center mx-auto border border-black/15 shadow-xs">
                <span className="material-symbols-outlined text-2xl">reviews</span>
              </div>
              <h3 className="font-serif font-bold text-base text-black">No Customer Reviews Yet for this Product</h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Be the first verified purchaser to share your unboxing and styling experience for <strong>{product.title}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(true)}
                className="px-5 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl border border-black/15 cursor-pointer transition-all inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">rate_review</span>
                <span>Submit Verified Review</span>
              </button>
            </div>
          )}
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
                      src={relProd.images?.[0] || relProd.img || '/logo-j.webp'}
                      alt={relProd.title}
                      width="200"
                      height="200"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/logo-j.webp'; }}
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

      {/* Fullscreen Vertical Image Viewer Lightbox */}
      <ProductImageLightbox
        isOpen={isLightboxOpen}
        images={productImages}
        initialIndex={lightboxInitialIndex}
        productTitle={product.title}
        productCode={product.productCode || product.product_code || ''}
        onClose={() => setIsLightboxOpen(false)}
        onActiveIndexChange={handleLightboxIndexChange}
      />

    </div>
  );
}
