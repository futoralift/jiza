import React, { useState, useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';

export default function SearchView({ 
  initialQuery = "", 
  initialCategory = "",
  initialSubCategory = "",
  initialSubCategoryId = "",
  onSelectProduct, 
  onToggleWishlist, 
  wishlistIds = [], 
  onAddToCart,
  onBuyNow,
  setActiveView,
  productsList = [],
  categoriesList = []
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubCategory);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(initialSubCategoryId);
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under5k', '5kto15k', 'above15k'
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'low-high', 'high-low', 'rating'

  // Update states when initial props change
  useEffect(() => {
    if (initialQuery !== undefined) setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialCategory !== undefined) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSubCategory !== undefined) setSelectedSubCategory(initialSubCategory);
    if (initialSubCategoryId !== undefined) setSelectedSubCategoryId(initialSubCategoryId);
  }, [initialSubCategory, initialSubCategoryId]);

  const activeCategories = useMemo(() => {
    const baseCats = categoriesList && categoriesList.length > 0 ? categoriesList : CATEGORIES;
    const allProds = productsList || PRODUCTS;
    return baseCats.map(c => {
      const count = allProds.filter(p => {
        const prodCat = String(p.category || p.category_id || '').toLowerCase();
        const prodCatName = String(p.categoryLabel || '').toLowerCase();
        const catId = String(c.id).toLowerCase();
        const catName = String(c.name).toLowerCase();
        return prodCat === catId || prodCatName === catName || prodCat === catName;
      }).length;
      return { ...c, count };
    });
  }, [categoriesList, productsList]);

  // Find subcategories belonging ONLY to the currently selected parent category
  const activeSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const catSel = selectedCategory.trim().toLowerCase();
    const currentCat = activeCategories.find(c => 
      String(c.id).toLowerCase() === catSel || String(c.name).toLowerCase() === catSel
    );
    if (!currentCat) return [];

    if (currentCat.subCategoryObjects && currentCat.subCategoryObjects.length > 0) {
      return currentCat.subCategoryObjects;
    }
    if (Array.isArray(currentCat.subcategories)) {
      return currentCat.subcategories.map(s => ({
        id: typeof s === 'object' ? s.id : `${currentCat.id}-${String(s).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: typeof s === 'object' ? s.name : s
      }));
    }
    return [];
  }, [selectedCategory, activeCategories]);

  const filteredProducts = useMemo(() => {
    const list = (productsList && productsList.length > 0) ? productsList : PRODUCTS;
    let q = (searchQuery || '').trim().toLowerCase();
    // Typo-tolerant normalization for brand & jewellery misspellings
    q = q.replace(/jewellary|jewllary|jewelery/g, 'jewellery')
         .replace(/jijaa|jija|jizaa/g, 'jiza');
    const qClean = q.replace(/[\s\-_]/g, '');

    const catSel = (selectedCategory || '').trim().toLowerCase();
    const subCatSel = (selectedSubCategory || '').trim().toLowerCase();
    const subCatIdSel = (selectedSubCategoryId || '').trim().toLowerCase();

    return list.filter((product) => {
      if (!product) return false;

      const title = String(product.title || product.name || '').toLowerCase();
      const desc = String(product.description || '').toLowerCase();
      const rawCode = String(product.product_code || product.productCode || '').trim();
      const code = rawCode.toLowerCase();
      const codeClean = code.replace(/[\s\-_]/g, '');

      const prodCatId = String(product.category || product.category_id || '').toLowerCase();
      const prodCatName = String(product.categoryLabel || '').toLowerCase();
      const prodSubCatId = String(product.subcategory_id || '').toLowerCase();
      const prodSubCatName = String(product.subcategory || product.subcategoryLabel || product.subCategory || product.subcategory_label || '').toLowerCase();

      const material = String(product.material || '').toLowerCase();
      const colour = String(product.colour || '').toLowerCase();
      const tags = Array.isArray(product.tags) ? product.tags : [];
      const price = Number(product.price || product.sellingPrice || 0);

      // Text match query across product title, product code, description, tags, materials, etc.
      const prodSpecialSec = String(product.specialSection || product.special_section || '').toLowerCase();
      const isSaleSearch = q === 'sale' || q === 'clearance' || q === 'discount' || q === 'offer' || q === 'stock clearance sale';
      const hasDiscountOrSaleBadge = (product.discount && Number(product.discount) > 0) ||
        prodSpecialSec.includes('clearance') ||
        prodSpecialSec.includes('sale') ||
        (product.badge && (product.badge.toLowerCase().includes('sale') || product.badge.toLowerCase().includes('clearance') || product.badge.toLowerCase().includes('off'))) ||
        (product.mrp && Number(product.mrp) > price) ||
        (product.originalPrice && Number(product.originalPrice) > price);

      // PRODUCT CODE MATCHING (Full, substring, and delimiter-insensitive)
      const matchesProductCode = Boolean(
        code && (
          code === q ||
          code.includes(q) ||
          (qClean.length >= 2 && codeClean.includes(qClean))
        )
      );

      const matchesQuery = q === '' || 
        matchesProductCode ||
        (isSaleSearch && hasDiscountOrSaleBadge) ||
        prodSpecialSec.includes(q) ||
        title.includes(q) ||
        desc.includes(q) ||
        material.includes(q) ||
        colour.includes(q) ||
        (product.badge && product.badge.toLowerCase().includes(q)) ||
        tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q));

      // STRICT RELATIONAL CATEGORY MATCHING (Parent Category Isolation)
      let matchesCategory = true;
      if (catSel) {
        matchesCategory = (
          prodCatId === catSel ||
          prodCatName === catSel ||
          prodCatName.includes(catSel)
        );
      }

      // STRICT RELATIONAL SUBCATEGORY MATCHING (Under the parent category)
      let matchesSubCategory = true;
      if (subCatSel || subCatIdSel) {
        matchesSubCategory = (
          (subCatIdSel && prodSubCatId === subCatIdSel) ||
          (subCatSel && (prodSubCatName === subCatSel || prodSubCatId === subCatSel))
        );
      }

      // Price match
      let matchesPrice = true;
      if (priceFilter === 'under5k') {
        matchesPrice = price <= 5000;
      } else if (priceFilter === '5kto15k') {
        matchesPrice = price > 5000 && price <= 15000;
      } else if (priceFilter === 'above15k') {
        matchesPrice = price > 15000;
      }

      return matchesQuery && matchesCategory && matchesSubCategory && matchesPrice;
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
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedSubCategoryId, priceFilter, sortBy, productsList]);

  const handleCategoryDropdownChange = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('');
    setSelectedSubCategoryId('');
  };

  const handleSubCategoryDropdownChange = (subIdentifier) => {
    if (!subIdentifier) {
      setSelectedSubCategory('');
      setSelectedSubCategoryId('');
      return;
    }
    const foundSub = activeSubcategories.find(s => s.id === subIdentifier || s.name === subIdentifier);
    if (foundSub) {
      setSelectedSubCategory(foundSub.name);
      setSelectedSubCategoryId(foundSub.id || '');
    } else {
      setSelectedSubCategory(subIdentifier);
      setSelectedSubCategoryId('');
    }
  };

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
            placeholder="Search by Product Code (e.g. JZ-LS-1045), Name, Kundan, Jhumkas..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-3.5 pl-12 pr-12 font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-heritage-gold transition-colors shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-heritage-gold transition-colors p-1 cursor-pointer"
              title="Clear search"
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
            onChange={(e) => handleCategoryDropdownChange(e.target.value)}
            className="px-4 py-2 border border-outline-variant rounded-full font-label-md text-xs text-on-surface hover:border-heritage-gold bg-surface-container-lowest focus:outline-none cursor-pointer font-semibold"
          >
            <option value="">All Categories ({productsList ? productsList.length : PRODUCTS.length})</option>
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.count})</option>
            ))}
          </select>

          {/* Subcategory Dropdown Pill (Shows only when parent category is selected) */}
          {selectedCategory && activeSubcategories.length > 0 && (
            <select 
              value={selectedSubCategoryId || selectedSubCategory || ''}
              onChange={(e) => handleSubCategoryDropdownChange(e.target.value)}
              className="px-4 py-2 border border-black bg-[#FCDAD7] text-black rounded-full font-label-md text-xs focus:outline-none cursor-pointer font-bold shadow-xs"
            >
              <option value="">All Subcategories</option>
              {activeSubcategories.map((sub) => (
                <option key={sub.id || sub.name} value={sub.id || sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          )}

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

          {(selectedCategory || selectedSubCategory || priceFilter !== 'all' || searchQuery) && (
            <button 
              onClick={() => {
                setSelectedCategory('');
                setSelectedSubCategory('');
                setSelectedSubCategoryId('');
                setPriceFilter('all');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-xs text-secondary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Active Breadcrumb / Filter Badges */}
        {(selectedCategory || selectedSubCategory) && (
          <div className="mt-3 flex flex-wrap gap-2 items-center justify-center">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-black/20 rounded-full text-xs font-bold text-black shadow-xs">
                <span>Category: {activeCategories.find(c => String(c.id).toLowerCase() === selectedCategory.toLowerCase() || String(c.name).toLowerCase() === selectedCategory.toLowerCase())?.name || selectedCategory}</span>
                <button
                  onClick={() => handleCategoryDropdownChange('')}
                  className="text-stone-500 hover:text-black font-bold ml-1 cursor-pointer"
                  title="Remove category filter"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedSubCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FCDAD7] border border-black/30 rounded-full text-xs font-bold text-black shadow-xs">
                <span>Subcategory: {selectedSubCategory}</span>
                <button
                  onClick={() => {
                    setSelectedSubCategory('');
                    setSelectedSubCategoryId('');
                  }}
                  className="text-stone-500 hover:text-black font-bold ml-1 cursor-pointer"
                  title="Remove subcategory filter"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Info Bar */}
        <div className="mt-6 text-center">
          <p className="font-body-md text-sm text-on-surface-variant">
            Showing <strong className="text-on-surface font-semibold">{filteredProducts.length}</strong> results 
            {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
            {selectedCategory && !searchQuery && <> in <strong className="text-black">{activeCategories.find(c => String(c.id).toLowerCase() === selectedCategory.toLowerCase())?.name || selectedCategory}</strong></>}
            {selectedSubCategory && <> &gt; <strong className="text-black">{selectedSubCategory}</strong></>}
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
