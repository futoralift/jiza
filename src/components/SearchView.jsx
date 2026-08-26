import React, { useState, useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';

export default function SearchView({ 
  initialQuery = "Kundan", 
  initialCategory = "",
  onSelectProduct, 
  onToggleWishlist, 
  wishlistIds, 
  onAddToCart,
  onBuyNow,
  setActiveView,
  productsList = [],
  categoriesList = []
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under5k', '5kto15k', 'above15k'
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'low-high', 'high-low', 'rating'

  const activeCategories = useMemo(() => {
    const baseCats = categoriesList && categoriesList.length > 0 ? categoriesList : CATEGORIES;
    const allProds = productsList || PRODUCTS;
    return baseCats.map(c => {
      const count = allProds.filter(p => p.category === c.id || p.category_id === c.id || p.categoryLabel === c.name).length;
      return { ...c, count };
    });
  }, [categoriesList, productsList]);

  const filteredProducts = useMemo(() => {
    const list = (productsList && productsList.length > 0) ? productsList : PRODUCTS;
    let q = (searchQuery || '').trim().toLowerCase();
    // Typo-tolerant normalization for brand & jewellery misspellings
    q = q.replace(/jewellary|jewllary|jewelery/g, 'jewellery')
         .replace(/jijaa|jija|jizaa/g, 'jiza');
    const catSel = (selectedCategory || '').trim().toLowerCase();

    return list.filter((product) => {
      if (!product) return false;

      const title = (product.title || product.name || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const catLabel = (product.categoryLabel || product.category || '').toLowerCase();
      const subcatLabel = (product.subcategory || product.subcategoryLabel || product.subCategory || product.subcategory_label || product.subcategory_id || '').toLowerCase();
      const material = (product.material || '').toLowerCase();
      const colour = (product.colour || '').toLowerCase();
      const tags = Array.isArray(product.tags) ? product.tags : [];
      const price = Number(product.price || product.sellingPrice || 0);

      const prodCatId = (product.category || product.category_id || '').toLowerCase();
      const prodCatName = (product.categoryLabel || '').toLowerCase();
      const prodSubCatId = (product.subcategory_id || '').toLowerCase();
      const prodSubCatName = subcatLabel;

      // Text match query across all fields + Sale/Clearance discount & special section matching
      const prodSpecialSec = (product.specialSection || product.special_section || '').toLowerCase();
      const isSaleSearch = q === 'sale' || q === 'clearance' || q === 'discount' || q === 'offer' || q === 'stock clearance sale';
      const hasDiscountOrSaleBadge = (product.discount && Number(product.discount) > 0) ||
        prodSpecialSec.includes('clearance') ||
        prodSpecialSec.includes('sale') ||
        (product.badge && (product.badge.toLowerCase().includes('sale') || product.badge.toLowerCase().includes('clearance') || product.badge.toLowerCase().includes('off'))) ||
        (product.mrp && Number(product.mrp) > price) ||
        (product.originalPrice && Number(product.originalPrice) > price);

      const matchesQuery = q === '' || 
        (isSaleSearch && hasDiscountOrSaleBadge) ||
        prodSpecialSec.includes(q) ||
        title.includes(q) ||
        desc.includes(q) ||
        catLabel.includes(q) ||
        subcatLabel.includes(q) ||
        material.includes(q) ||
        colour.includes(q) ||
        (product.badge && product.badge.toLowerCase().includes(q)) ||
        tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q));

      // Category match
      const matchesCategory = !catSel ||
        prodCatId === catSel ||
        prodCatName === catSel ||
        prodSubCatId === catSel ||
        prodSubCatName === catSel ||
        prodCatName.includes(catSel) ||
        prodSubCatName.includes(catSel);

      // Price match
      let matchesPrice = true;
      if (priceFilter === 'under5k') {
        matchesPrice = price <= 5000;
      } else if (priceFilter === '5kto15k') {
        matchesPrice = price > 5000 && price <= 15000;
      } else if (priceFilter === 'above15k') {
        matchesPrice = price > 15000;
      }

      return matchesQuery && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      const priceA = Number(a?.price || a?.sellingPrice || 0);
      const priceB = Number(b?.price || b?.sellingPrice || 0);
      const ratingA = Number(a?.rating || 5);
      const ratingB = Number(b?.rating || 5);

      if (sortBy === 'low-high') return priceA - priceB;
      if (sortBy === 'high-low') return priceB - priceA;
      if (sortBy === 'rating') return ratingB - ratingA;
      return 0;
    });
  }, [searchQuery, selectedCategory, priceFilter, sortBy, productsList]);

  return (
    <main className="flex-grow pt-6 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
      
      {/* Search Header */}
      <section className="mb-8">
        <div className="relative w-full max-w-2xl mx-auto group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Kundan, Solitaires, Jhumkas, Necklaces, Bangles..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-3.5 pl-12 pr-12 font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-heritage-gold transition-colors shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-heritage-gold transition-colors p-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2.5 items-center justify-center">
          <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mr-1">
            Filters:
          </span>

          {/* Category Dropdown Pill */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-outline-variant rounded-full font-label-md text-xs text-on-surface hover:border-heritage-gold bg-surface-container-lowest focus:outline-none cursor-pointer font-semibold"
          >
            <option value="">All Categories ({productsList ? productsList.length : PRODUCTS.length})</option>
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.count})</option>
            ))}
          </select>

          {/* Price Filter Pill */}
          <select 
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className={`px-4 py-2 border rounded-full font-label-md text-xs transition-colors cursor-pointer focus:outline-none ${
              priceFilter !== 'all' 
                ? 'border-black bg-[#FCDAD7] text-black font-semibold' 
                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-black'
            }`}
          >
            <option value="all">All Prices</option>
            <option value="under5k">Under ₹5,000</option>
            <option value="5kto15k">₹5,000 - ₹15,000</option>
            <option value="above15k">Above ₹15,000</option>
          </select>

          {/* Sort By Pill */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-outline-variant rounded-full font-label-md text-xs text-on-surface hover:border-heritage-gold bg-surface-container-lowest focus:outline-none cursor-pointer"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {(selectedCategory || priceFilter !== 'all' || searchQuery) && (
            <button 
              onClick={() => {
                setSelectedCategory('');
                setPriceFilter('all');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-xs text-secondary hover:underline flex items-center gap-1 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Results Info Bar */}
        <div className="mt-6 text-center">
          <p className="font-body-md text-sm text-on-surface-variant">
            Showing <strong className="text-on-surface font-semibold">{filteredProducts.length}</strong> results 
            {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
          </p>
        </div>
      </section>

      {/* Product Results Grid */}
      {filteredProducts.length > 0 ? (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {filteredProducts.map((product) => {
            const isSaved = wishlistIds.includes(product.id);
            return (
              <article 
                key={product.id}
                className="group cursor-pointer flex flex-col bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/30 hover:border-heritage-gold/50 transition-colors shadow-sm"
              >
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="relative w-full aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden mb-3"
                >
                  <img 
                    src={product.img || '/logo-j.png'} 
                    alt={product.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/logo-j.png';
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className={`absolute top-2.5 right-2.5 p-2 backdrop-blur-sm rounded-full transition-colors ${
                      isSaved 
                        ? 'bg-secondary text-on-secondary' 
                        : 'bg-surface-container-lowest/80 text-outline hover:text-secondary'
                    }`}
                  >
                    <span 
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: `'FILL' ${isSaved ? 1 : 0}` }}
                    >
                      favorite
                    </span>
                  </button>

                  {product.badge && (
                    <div className="absolute bottom-2.5 left-2.5 bg-antique-cream/90 backdrop-blur px-2.5 py-0.5 rounded-full border border-heritage-gold/30">
                      <span className="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">
                        {product.badge}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow" onClick={() => onSelectProduct(product)}>
                  <h3 className="font-headline-sm text-base text-on-surface mb-1 group-hover:text-heritage-gold transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2">
                    {product.categoryLabel}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-body-lg text-base font-bold text-primary">
                      ₹{Number(product.price || product.sellingPrice || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-on-surface-variant flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px] text-heritage-gold">star</span>
                      {product.rating}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-black/10">
                  <button 
                    type="button"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onAddToCart(product, 1, 'Standard', '', {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height,
                        img: product.images?.[0] || product.img
                      });
                    }}
                    className="py-2 px-1 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 bg-white hover:bg-[#FFF0F2] text-black border border-black/15 shadow-xs active:scale-95"
                    title="Add to Shopping Bag"
                  >
                    <span className="material-symbols-outlined text-[15px]">shopping_bag</span>
                    <span>Add</span>
                  </button>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onBuyNow) {
                        onBuyNow(product, 1, 'Standard', '');
                      } else {
                        onAddToCart(product, 1, 'Standard', '');
                      }
                    }}
                    className="py-2 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/20 shadow-xs active:scale-95"
                    title="Buy Now (Direct Checkout)"
                  >
                    <span className="material-symbols-outlined text-[15px]">flash_on</span>
                    <span>Buy Now</span>
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="py-16 text-center bg-antique-cream rounded-2xl p-8 max-w-md mx-auto">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3">search_off</span>
          <h3 className="font-headline-sm text-on-surface mb-2">No matching jewellery found</h3>
          <p className="font-body-md text-sm text-on-surface-variant mb-6">
            Try adjusting your search terms or filters to browse our royal collection.
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setPriceFilter('all');
            }}
            className="px-6 py-2.5 bg-[#FCDAD7] text-black font-label-md rounded-full font-bold shadow border border-black/10 hover:opacity-90 active:scale-95 transition-all duration-200"
          >
            Clear All Search Filters
          </button>
        </div>
      )}

    </main>
  );
}
