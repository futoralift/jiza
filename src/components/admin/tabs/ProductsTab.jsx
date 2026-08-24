import React from 'react';

export default function ProductsTab({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  setIsAddProductOpen,
  filteredProducts = [],
  productsList = [],
  onUpdateSpecialSection,
  onUpdateProductStock,
  handleOpenEditProduct,
  handleDeleteProductClick,
  isReadOnly = false
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 px-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-44">
            <span className="material-symbols-outlined absolute left-2 top-1.5 text-outline text-[14px]">search</span>
            <input
              type="text"
              placeholder="Search jewelry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 bg-[#F9F6F0] border border-outline-variant rounded-lg pl-7 pr-2 text-[10px] text-on-surface placeholder-gray-400 focus:outline-none focus:border-heritage-gold shadow-xs"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-7 bg-[#F9F6F0] border border-outline-variant rounded-lg px-2 text-[10px] text-on-surface font-semibold focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="necklaces">Necklaces</option>
            <option value="earrings">Earrings</option>
            <option value="rings">Rings</option>
            <option value="bracelets">Bracelets</option>
            <option value="pendants">Pendants</option>
            <option value="solitaires">Solitaires</option>
          </select>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="w-full sm:w-auto bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black px-4 py-2 rounded-xl text-xs font-label-md font-bold shadow flex items-center justify-center gap-2 border border-black/20 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Product
          </button>
        )}
        {isReadOnly && (
          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
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
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-[#FFF0F2] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={p.img || '/logo-j.png'} 
                        alt={p.title} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/logo-j.png';
                        }}
                        className="w-12 h-12 object-cover rounded-lg bg-[#FFF0F2] border border-[#F7C5C0]" 
                      />
                      <div>
                        <h4 className="font-bold text-on-surface text-xs">{p.title}</h4>
                        <span className="text-[10px] text-on-surface-variant">{p.badge || 'Standard'}</span>
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
                      value={p.specialSection || (p.badge === 'New Arrival' ? 'New Arrival' : p.badge === 'Bestseller' || p.badge === 'Best Seller' ? 'Best Seller' : 'None')}
                      onChange={(e) => {
                        const targetSec = e.target.value;
                        if (targetSec !== 'None') {
                          const count = productsList.filter(prod => prod.id !== p.id && (prod.specialSection === targetSec || (targetSec === 'New Arrival' && prod.badge === 'New Arrival') || (targetSec === 'Best Seller' && (prod.badge === 'Bestseller' || prod.badge === 'Best Seller')))).length;
                          if (count >= 4) {
                            alert(`⚠️ Validation Warning: Section Limit Reached!\n\nMaximum 4 products can be assigned to '${targetSec}' on the Home Page. Please remove an existing product from '${targetSec}' first (set Special Section to 'None').`);
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
