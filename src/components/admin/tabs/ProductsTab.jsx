import React from 'react';

export default function ProductsTab({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  subcategoryFilter = 'all',
  setSubcategoryFilter,
  categoriesList = [],
  setIsAddProductOpen,
  filteredProducts = [],
  productsList = [],
  onUpdateSpecialSection,
  onUpdateProductStock,
  handleOpenEditProduct,
  handleDeleteProductClick,
  isReadOnly = false
}) {
  // Find selected category object to extract its sub-categories
  const selectedCatObj = (categoriesList || []).find(c =>
    String(c.id || '').toLowerCase() === String(categoryFilter || '').toLowerCase() ||
    String(c.name || '').toLowerCase() === String(categoryFilter || '').toLowerCase()
  );

  const availableSubcategories = selectedCatObj
    ? (selectedCatObj.subCategoryObjects && selectedCatObj.subCategoryObjects.length > 0
        ? selectedCatObj.subCategoryObjects.map(s => s.name || s.id)
        : (selectedCatObj.subcategories || []))
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 px-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-48">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[14px]">search</span>
            <input
              type="text"
              placeholder="Search jewelry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 bg-[#F9F6F0] border border-outline-variant rounded-lg pl-8 pr-2.5 text-xs text-on-surface placeholder-gray-400 focus:outline-none focus:border-black shadow-xs font-medium"
            />
          </div>

          {/* 1. Category Filter Dropdown (All 15 Categories) */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                if (setSubcategoryFilter) setSubcategoryFilter('all');
              }}
              className="h-8 bg-[#F9F6F0] border border-outline-variant rounded-lg px-2.5 text-xs text-on-surface font-semibold focus:outline-none focus:border-black cursor-pointer shadow-xs transition-colors hover:border-black/60"
            >
              <option value="all">All Categories ({categoriesList.length})</option>
              {categoriesList.map(cat => (
                <option key={cat.id || cat.name} value={cat.id || cat.name}>
                  {cat.name || cat.label || cat.id}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Sub-Category Filter Dropdown (Cascading: enabled only for selected category) */}
          <div className="relative">
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter && setSubcategoryFilter(e.target.value)}
              disabled={categoryFilter === 'all' || availableSubcategories.length === 0}
              className={`h-8 border rounded-lg px-2.5 text-xs font-semibold focus:outline-none focus:border-black shadow-xs transition-all ${
                categoryFilter === 'all' || availableSubcategories.length === 0
                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                  : 'bg-[#F9F6F0] text-on-surface border-outline-variant cursor-pointer hover:border-black'
              }`}
            >
              {categoryFilter === 'all' ? (
                <option value="all">Select Category First</option>
              ) : availableSubcategories.length === 0 ? (
                <option value="all">No Sub-Categories</option>
              ) : (
                <>
                  <option value="all">All Sub-Categories ({availableSubcategories.length})</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Reset Filters Pill */}
          {(categoryFilter !== 'all' || subcategoryFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                if (setSubcategoryFilter) setSubcategoryFilter('all');
                if (setSearchQuery) setSearchQuery('');
              }}
              className="h-8 px-2.5 bg-[#FFF0F2] hover:bg-[#FCDAD7] text-black text-[11px] font-bold rounded-lg border border-[#F7C5C0] flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Reset all filters"
            >
              <span className="material-symbols-outlined text-[13px]">close</span>
              <span>Reset</span>
            </button>
          )}
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="w-full sm:w-auto bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black px-4 py-2 rounded-xl text-xs font-label-md font-bold shadow flex items-center justify-center gap-2 border border-black/20 transition-all active:scale-95 cursor-pointer flex-shrink-0"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Product
          </button>
        )}
        {isReadOnly && (
          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 flex-shrink-0">
            <span className="material-symbols-outlined text-sm">visibility</span>
            View Only Mode
          </span>
        )}
      </div>

      {/* Product Inventory Table */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-[#FCDAD7]/60 text-black font-label-sm uppercase text-[10px] border-b border-[#F7C5C0]">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Product Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price (₹)</th>
                <th className="p-3">Special Section (Home)</th>
                <th className="p-3">Stock Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-stone-500">
                    <span className="material-symbols-outlined text-3xl text-stone-400 block mb-1">inventory_2</span>
                    <p className="font-bold text-sm text-stone-700">No products found matching the selected filters.</p>
                    <p className="text-xs text-stone-400 mt-0.5">Try selecting a different category, sub-category, or clear your search term.</p>
                  </td>
                </tr>
              ) : filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-[#FFF0F2] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={p.img || '/logo-j.webp'} 
                        alt={p.title} 
                        width="48"
                        height="48"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/logo-j.webp';
                        }}
                        className="w-12 h-12 object-cover rounded-lg bg-[#FFF0F2] border border-[#F7C5C0]" 
                      />
                      <div>
                        <h4 className="font-bold text-on-surface text-xs">{p.title}</h4>
                        <span className="text-[10px] text-on-surface-variant">
                          {p.specialSection && p.specialSection !== 'None' ? p.specialSection : (p.badge && p.badge !== 'None' && p.badge !== 'Standard' && p.badge !== 'New Arrival' && p.badge !== 'Best Seller' && p.badge !== 'Stock Clearance Sale' ? p.badge : 'Standard')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-black">
                    <span className="bg-[#FFF0F2] border border-[#F7C5C0] px-2 py-0.5 rounded text-[11px]">
                      {p.productCode || p.product_code || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 capitalize font-semibold text-black">{p.category}</td>
                  <td className="p-3">
                    <span className="font-bold text-on-surface">₹{Number(p.price || p.sellingPrice || 0).toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-3">
                    <select
                      value={p.specialSection || 'None'}
                      onChange={(e) => {
                        const targetSec = e.target.value;
                        if (targetSec === 'New Arrival' || targetSec === 'Best Seller' || targetSec === 'Stock Clearance Sale') {
                          const count = productsList.filter(prod => prod.id !== p.id && prod.specialSection === targetSec).length;
                          if (count >= 12) {
                            alert(`⚠️ Validation Warning: Section Limit Reached!\n\nMaximum 12 products can be assigned to '${targetSec}' on the Home Page. Please remove an existing product from '${targetSec}' first (set Special Section to 'None').`);
                            return;
                          }
                        }
                        if (onUpdateSpecialSection) onUpdateSpecialSection(p.id, targetSec);
                      }}
                      className="bg-[#FFF0F2] border border-[#F7C5C0] rounded-lg px-2 py-1 text-xs text-on-surface font-semibold focus:outline-none focus:border-black"
                    >
                      <option value="None">None (Default)</option>
                      <option value="New Arrival">New Arrival</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Stock Clearance Sale">Stock Clearance Sale 🔥</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {isReadOnly ? (
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                        p.inStock
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    ) : (
                      <button
                        onClick={() => onUpdateProductStock(p.id, !p.inStock)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                          p.inStock
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {isReadOnly ? (
                      <span className="text-[10px] text-on-surface-variant italic">Read Only</span>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 bg-[#FCDAD7]/60 text-black hover:bg-[#FCDAD7] rounded-lg border border-black/15 flex items-center gap-1 font-bold text-[11px] shadow-xs"
                          title="Edit Product Details"
                        >
                          <span className="material-symbols-outlined text-[13px] text-black">edit</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProductClick(p.id, p.title)}
                          className="p-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center gap-1 font-bold text-[11px] shadow-xs"
                          title="Delete Product"
                        >
                          <span className="material-symbols-outlined text-[13px] text-rose-700">delete</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
