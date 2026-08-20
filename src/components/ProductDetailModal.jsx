import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  isWishlisted
}) {
  if (!product) return null;

  const images = product?.images?.filter(Boolean) || (product?.img ? [product.img] : []);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'details' | 'care' | 'reviews'
  const [isAdded, setIsAdded] = useState(false);

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
      img: product.images?.[0] || product.img
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-deep-onyx/75 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-surface border border-outline-variant/60 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-scaleUp my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-surface/80 hover:bg-surface text-on-surface rounded-full backdrop-blur transition-colors shadow"
          title="Close"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* ===== IMAGE GALLERY ===== */}
          <div className="relative bg-surface-container-low flex flex-col p-4 gap-3">
            {/* Main Large Image */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-inner">
              <img 
                src={images[activeImg] || 'https://via.placeholder.com/400x400?text=No+Image'} 
                alt={product.title || product.name} 
                className="w-full h-full object-contain transition-all duration-500"
              />
              {product.badge && (
                <div className="absolute top-3 left-3 bg-antique-cream/90 backdrop-blur px-3 py-0.5 rounded-full border border-heritage-gold/30 shadow-sm">
                  <span className="font-label-sm text-[11px] text-primary uppercase font-bold tracking-wider">{product.badge}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Strip (up to 4 images) */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImg === idx ? 'border-heritage-gold shadow-md scale-105' : 'border-outline-variant hover:border-heritage-gold/60'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <div className="flex items-center justify-center h-32 text-on-surface-variant text-xs">
                No images uploaded yet.
              </div>
            )}
          </div>

          {/* ===== PRODUCT INFO & ACTIONS ===== */}
          <div className="p-5 md:p-7 flex flex-col overflow-y-auto max-h-[85vh] md:max-h-none">
            
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-xs text-heritage-gold font-bold uppercase tracking-widest">{product.categoryLabel}</span>
              <div className="flex items-center text-xs text-on-surface-variant gap-1">
                <span className="material-symbols-outlined text-[16px] text-heritage-gold" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-bold text-on-surface">{avgRating}</span>
                <span>({reviewsCount})</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-headline-sm text-xl text-on-surface mb-3 font-bold">{product.title || product.name}</h2>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-headline-md text-2xl font-bold text-primary">₹{sellingPrice.toLocaleString('en-IN')}</span>
              {mrp > 0 && mrp !== sellingPrice && (
                <span className="font-body-md text-sm text-outline line-through">₹{mrp.toLocaleString('en-IN')}</span>
              )}
              {discount > 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold border border-red-200">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Colour & Material Quick Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.colour && (
                <span className="inline-flex items-center gap-1 bg-antique-cream/80 border border-heritage-gold/30 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[12px]">palette</span>
                  {product.colour}
                </span>
              )}
              {product.material && (
                <span className="inline-flex items-center gap-1 bg-antique-cream/80 border border-heritage-gold/30 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[12px]">diamond</span>
                  {product.material}
                </span>
              )}
              {product.deliveryTime && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                  Delivery: {product.deliveryTime}
                </span>
              )}
            </div>

            {/* Tabs: Description / Details / Care / Reviews */}
            <div className="flex gap-0 mb-4 border-b border-outline-variant/30 overflow-x-auto">
              {[
                { key: 'description', label: 'Description' },
                { key: 'details', label: 'Details' },
                { key: 'care', label: 'Care' },
                { key: 'reviews', label: `Reviews (${reviewsCount})` }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2 text-xs font-bold transition-colors border-b-2 shrink-0 ${
                    activeTab === tab.key
                      ? 'text-primary border-heritage-gold'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-on-surface-variant leading-relaxed mb-4 min-h-[60px] max-h-48 overflow-y-auto pr-1">
              {activeTab === 'description' && (
                <div className="space-y-3">
                  <p>{product.description || 'No description available.'}</p>
                  {(product.productCode || product.product_code) && (
                    <div className="pt-2 border-t border-outline-variant/30 text-xs text-on-surface-variant font-semibold flex items-center gap-1.5">
                      <span className="text-black font-bold">Product Code:</span>
                      <span className="font-mono bg-[#FCDAD7]/60 text-black px-2 py-0.5 rounded text-[11px] font-bold border border-black/10">
                        {product.productCode || product.product_code}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'details' && (
                <div className="space-y-1.5">
                  {product.material && <p><strong className="text-on-surface">Material:</strong> {product.material}</p>}
                  {product.colour && <p><strong className="text-on-surface">Colour:</strong> {product.colour}</p>}
                  {product.deliveryTime && <p><strong className="text-on-surface">Delivery Time:</strong> {product.deliveryTime}</p>}
                  {!product.material && !product.colour && <p>No additional details available.</p>}
                </div>
              )}
              {activeTab === 'care' && (
                <p>{product.careInstructions || 'Store in a dry velvet box. Avoid direct contact with perfumes, sprays, or water to preserve the finish and lustre.'}</p>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  {approvedReviews.length === 0 ? (
                    <div className="p-3 text-center bg-antique-cream/40 rounded-xl border border-heritage-gold/20">
                      <p className="text-xs text-on-surface-variant">No customer reviews yet. Be the first to review after purchasing!</p>
                    </div>
                  ) : (
                    approvedReviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-antique-cream/30 rounded-xl border border-heritage-gold/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-on-surface">{rev.customer_name}</span>
                          <div className="flex items-center text-heritage-gold text-xs">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: `'FILL' ${s <= rev.rating ? 1 : 0}` }}>star</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed">{rev.review_text}</p>
                        <span className="text-[10px] text-outline block text-right">{rev.created_at}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>


            {/* Colour Options Selector */}
            {availableColors.length > 0 && (
              <div className="mb-4">
                <label className="font-label-sm text-xs text-on-surface uppercase tracking-wider block mb-2 font-semibold flex items-center justify-between">
                  <span>Select Colour:</span>
                  <span className="text-heritage-gold font-bold text-[11px] normal-case">{selectedColor || availableColors[0]}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        selectedColor === col
                          ? 'bg-heritage-gold text-deep-onyx font-bold shadow scale-[1.02]'
                          : 'bg-surface-container-low text-on-surface border border-outline-variant hover:border-heritage-gold'
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
                      {selectedColor === col && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <label className="font-label-sm text-xs text-on-surface uppercase tracking-wider block mb-2 font-semibold">Select Size / Length:</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button 
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-label-md transition-all ${
                        selectedSize === s
                          ? 'bg-heritage-gold text-deep-onyx font-bold shadow'
                          : 'bg-surface-container-low text-on-surface border border-outline-variant hover:border-heritage-gold'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Stock Ceiling */}
            <div className="flex items-center gap-3 mb-5">
              <span className="font-label-sm text-xs text-on-surface font-semibold uppercase">Quantity:</span>
              <div className="flex items-center border border-black/20 rounded-lg bg-surface-container-low">
                <button 
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  className="px-3 py-1 text-on-surface hover:bg-[#FCDAD7] rounded-l font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-bold font-mono">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(q => Math.min(maxStock, q + 1))} 
                  disabled={quantity >= maxStock}
                  className={`px-3 py-1 font-bold rounded-r transition-colors ${
                    quantity >= maxStock 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'text-on-surface hover:bg-[#FCDAD7] cursor-pointer'
                  }`}
                  title={quantity >= maxStock ? `Max stock (${maxStock}) reached` : 'Add more'}
                >
                  +
                </button>
              </div>
              {quantity >= maxStock && (
                <span className="text-[11px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  ⚠️ Max {maxStock} in stock
                </span>
              )}
            </div>

            {/* Action Buttons: Add to Bag + Buy Now + Wishlist */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/40 mt-auto">
              <div className="flex gap-2 sm:gap-3">
                <button 
                  type="button"
                  onClick={(e) => handleAdd(e)}
                  className={`flex-1 py-3.5 px-3 font-label-md font-bold rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-black/20 ${
                    isAdded 
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white' 
                      : 'bg-[#FFF0F2] hover:bg-[#FCDAD7] text-black'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{isAdded ? 'done' : 'shopping_bag'}</span>
                  <span className="text-xs sm:text-sm">{isAdded ? 'Added!' : 'Add to Bag'}</span>
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
                  className="flex-1 py-3.5 px-3 font-label-md font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-black hover:bg-stone-900 text-[#FCDAD7] border border-black"
                >
                  <span className="material-symbols-outlined text-[18px]">flash_on</span>
                  <span className="text-xs sm:text-sm">Buy Now</span>
                </button>

                <button 
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                    isWishlisted 
                      ? 'bg-[#FCDAD7] text-black border-black/30' 
                      : 'border-outline-variant hover:border-black text-on-surface-variant'
                  }`}
                  title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${isWishlisted ? 1 : 0}` }}>favorite</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
