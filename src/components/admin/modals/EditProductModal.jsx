import React from 'react';
import { getMediaUrl } from '../../../config';

export default function EditProductModal({
  editingProduct,
  setEditingProduct,
  handleUpdateProductSubmit,
  editProdForm,
  setEditProdForm,
  activeCategories = [],
  handleEditMultipleFilesUpload,
  editUploadedImages = [],
  handleEditMakePrimary,
  handleEditRemoveSlot,
  handleEditSingleSlotUpload,
  editUploadedVideo = '',
  setEditUploadedVideo,
  handleEditVideoUpload,
  handleEditRemoveVideo,
  videoUploadLoading = false
}) {
  if (!editingProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-deep-onyx/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FFF9F9] text-on-surface border border-[#F7B6B0] rounded-3xl max-w-4xl w-full shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header Bar */}
        <div className="bg-[#FCDAD7] text-black px-5 py-3 flex items-center justify-between border-b border-black/15 shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="material-symbols-outlined text-lg text-black">edit</span>
            <h3 className="text-sm font-bold tracking-tight text-black">
              Edit Product Details: {editingProduct.title || editingProduct.name}
            </h3>
          </div>

          <button
            onClick={() => setEditingProduct(null)}
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 text-black flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow">

        <form onSubmit={handleUpdateProductSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Product Specifications (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Section 1: Basic Information */}
              <div className="bg-white p-4 rounded-2xl border border-[#F7C5C0] shadow-sm space-y-3">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-black flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                  <span className="material-symbols-outlined text-sm text-black">edit_note</span>
                  <span>Basic Details</span>
                </h4>

                {/* Product Name */}
                <div>
                  <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Kundan Bridal Choker Set"
                    value={editProdForm.title}
                    onChange={(e) => setEditProdForm({ ...editProdForm, title: e.target.value })}
                    className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Product Code */}
                <div>
                  <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                    Product Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Product Code (e.g. 101, JIZA-PRL-001)"
                    value={editProdForm.productCode}
                    onChange={(e) => setEditProdForm({ ...editProdForm, productCode: e.target.value })}
                    className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono font-bold focus:outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Category + Sub-Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={editProdForm.category}
                      onChange={(e) => {
                        const catId = e.target.value;
                        const catObj = activeCategories.find(c => c.id === catId);
                        const catName = catObj?.name || catId;
                        const subs = catObj ? (catObj.subcategories || []) : [];
                        const defaultSub = subs[0] || 'General';

                        setEditProdForm({
                          ...editProdForm,
                          category: catId,
                          categoryLabel: catName,
                          subcategory: defaultSub,
                          subcategoryLabel: defaultSub
                        });
                      }}
                      className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-semibold focus:outline-none transition-all shadow-sm"
                    >
                      {activeCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                      Sub-Category *
                    </label>
                    <select
                      required
                      value={editProdForm.subcategory}
                      onChange={(e) => {
                        const subName = e.target.value;
                        setEditProdForm({
                          ...editProdForm,
                          subcategory: subName,
                          subcategoryLabel: subName
                        });
                      }}
                      className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-semibold focus:outline-none transition-all shadow-sm"
                    >
                      {(() => {
                        const catObj = activeCategories.find(c => c.id === editProdForm.category);
                        const subs = catObj ? (catObj.subcategories || []) : [];
                        if (subs.length > 0) {
                          return subs.map((s, idx) => (
                            <option key={idx} value={s}>{s}</option>
                          ));
                        }
                        return <option value="General">General / All</option>;
                      })()}
                    </select>
                  </div>
                </div>

                {/* Special Section Selector */}
                <div>
                  <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                    Special Section (Home Page)
                  </label>
                  <select
                    value={editProdForm.specialSection}
                    onChange={(e) => setEditProdForm({ ...editProdForm, specialSection: e.target.value })}
                    className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-semibold focus:outline-none transition-all shadow-sm"
                  >
                    <option value="None">None (Default)</option>
                    <option value="New Arrival">New Arrival (Max 12)</option>
                    <option value="Best Seller">Best Seller (Max 12)</option>
                    <option value="Stock Clearance Sale">Stock Clearance Sale 🔥 (Max 12)</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Pricing & Stock */}
              <div className="bg-white p-4 rounded-2xl border border-[#F7C5C0] shadow-sm space-y-3">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-black flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                  <span className="material-symbols-outlined text-sm text-black">sell</span>
                  <span>Pricing &amp; Inventory</span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                      Selling Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-black">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="2499"
                        value={editProdForm.sellingPrice}
                        onChange={(e) => setEditProdForm({ ...editProdForm, sellingPrice: e.target.value })}
                        className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl pl-7 pr-3 py-2.5 text-xs text-on-surface font-bold focus:outline-none transition-all shadow-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                      MRP (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-gray-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="3999"
                        value={editProdForm.mrp}
                        onChange={(e) => setEditProdForm({ ...editProdForm, mrp: e.target.value })}
                        className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl pl-7 pr-3 py-2.5 text-xs text-on-surface font-semibold focus:outline-none transition-all shadow-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Auto"
                      value={editProdForm.discount}
                      onChange={(e) => setEditProdForm({ ...editProdForm, discount: e.target.value })}
                      className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-semibold focus:outline-none transition-all shadow-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Default: 10"
                      value={editProdForm.stockQuantity}
                      onChange={(e) => setEditProdForm({ ...editProdForm, stockQuantity: e.target.value })}
                      className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-bold focus:outline-none transition-all shadow-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                      Delivery Time
                    </label>
                    <input
                      type="text"
                      placeholder="2-4 Business Days"
                      value={editProdForm.deliveryTime}
                      onChange={(e) => setEditProdForm({ ...editProdForm, deliveryTime: e.target.value })}
                      className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Material & Instructions */}
              <div className="bg-white p-4 rounded-2xl border border-[#F7C5C0] shadow-sm space-y-3">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-black flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                  <span className="material-symbols-outlined text-sm text-black">auto_awesome</span>
                  <span>Craft Specifications &amp; Care</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      placeholder="22K Gold Plated Brass & Kundan"
                      value={editProdForm.material}
                      onChange={(e) => setEditProdForm({ ...editProdForm, material: e.target.value })}
                      className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Colour(s)</span>
                      <span className="text-[10px] text-gray-500 font-normal normal-case">Separate by comma for multiple</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gold, Silver, Rose Gold"
                      value={editProdForm.colour}
                      onChange={(e) => setEditProdForm({ ...editProdForm, colour: e.target.value })}
                      className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none transition-all shadow-sm"
                    />

                    {/* Visual chips for parsed colours */}
                    {editProdForm.colour && editProdForm.colour.split(',').map(c => c.trim()).filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {editProdForm.colour.split(',').map(c => c.trim()).filter(Boolean).map((col, idx) => (
                          <span key={idx} className="bg-[#FFF0F2] text-black border border-[#F7C5C0] px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span>
                            {col}
                            <button
                              type="button"
                              onClick={() => {
                                const parsed = editProdForm.colour.split(',').map(item => item.trim()).filter(Boolean);
                                parsed.splice(idx, 1);
                                setEditProdForm({ ...editProdForm, colour: parsed.join(', ') });
                              }}
                              className="text-red-700 hover:text-red-900 font-extrabold text-[12px] ml-1 bg-red-100 hover:bg-red-200 px-1 rounded"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Presets Buttons */}
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] text-gray-400 font-medium block">Quick Presets:</span>
                      <div className="flex flex-wrap gap-1">
                        {['Gold', 'Silver', 'Rose Gold', 'Ruby Red', 'Emerald Green', 'Sapphire Blue', 'Black', 'Pearl White'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              const current = (editProdForm.colour || '').trim();
                              const parsed = current ? current.split(',').map(c => c.trim()).filter(Boolean) : [];
                              if (!parsed.includes(preset)) {
                                parsed.push(preset);
                                setEditProdForm({ ...editProdForm, colour: parsed.join(', ') });
                              }
                            }}
                            className="bg-[#FFF0F2]/40 hover:bg-[#FCDAD7]/60 border border-[#F7C5C0] text-[9px] text-on-surface font-semibold px-2 py-0.5 rounded transition-all cursor-pointer"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Handcrafted bridal necklace..."
                    value={editProdForm.description}
                    onChange={(e) => setEditProdForm({ ...editProdForm, description: e.target.value })}
                    className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none transition-all shadow-sm resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                    Care Instructions
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Store in velvet box..."
                    value={editProdForm.careInstructions}
                    onChange={(e) => setEditProdForm({ ...editProdForm, careInstructions: e.target.value })}
                    className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Light Theme Device Image & Video Upload Card (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-[#F7C5C0] shadow-sm space-y-4 sticky top-0">
              
              {/* Photo Gallery Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <div>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-black">photo_camera</span>
                    <span>Photo Gallery</span>
                  </h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Upload up to 4 photos (Max 2MB/photo, auto WebP compressed)</p>
                </div>
                <span className="text-[9px] bg-[#FFF0F2] text-black border border-[#F7C5C0] px-2 py-0.5 rounded-full font-bold uppercase">
                  ⚡ Auto WebP
                </span>
              </div>

              {/* Bulk Upload Zone */}
              <div className="border-2 border-dashed border-[#F7C5C0] rounded-xl p-3 text-center bg-[#FFF0F2]/40 hover:bg-[#FCDAD7]/30 hover:border-black/60 transition-all cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleEditMultipleFilesUpload}
                  className="hidden"
                  id="edit-bulk-image-upload"
                />
                <label htmlFor="edit-bulk-image-upload" className="cursor-pointer block space-y-1">
                  <div className="w-8 h-8 bg-white border border-[#F7C5C0] rounded-full flex items-center justify-center text-black mx-auto shadow-sm">
                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                  </div>
                  <p className="text-[11px] font-bold text-on-surface">Click or Drag &amp; Drop Photos</p>
                  <p className="text-[9px] text-on-surface-variant">Update or add images from device (Max 2 MB each)</p>
                </label>
              </div>

              {/* 4 Interactive Image Slots (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((idx) => {
                  const imgUrl = editUploadedImages[idx];
                  return (
                    <div 
                      key={idx}
                      className="relative aspect-square rounded-xl border border-[#F7C5C0] bg-[#FFF0F2]/20 overflow-hidden flex flex-col items-center justify-center group shadow-sm"
                    >
                      {/* Slot Badge */}
                      <div className="absolute top-1 left-1 z-10 pointer-events-none">
                        {idx === 0 ? (
                          <span className="bg-black text-[#FCDAD7] text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow border border-black/20 flex items-center gap-0.5">
                            <span>🌟 Main</span>
                          </span>
                        ) : (
                          <span className="bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            #{idx + 1}
                          </span>
                        )}
                      </div>

                      {imgUrl ? (
                        <>
                          <img src={getMediaUrl(imgUrl)} alt={`Slot ${idx}`} className="w-full h-full object-cover" />
                          
                          {/* Hover Action Controls */}
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-1.5">
                            <div className="flex items-center justify-end">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleEditMakePrimary(idx)}
                                  className="px-1.5 py-0.5 bg-[#FCDAD7] text-black font-bold text-[8px] rounded uppercase shadow hover:bg-[#F9C5C0]"
                                  title="Set as Main Image"
                                >
                                  Make Main
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleEditRemoveSlot(idx)}
                              className="w-full py-0.5 bg-red-600 text-white font-bold text-[8px] rounded uppercase shadow hover:bg-red-700 flex items-center justify-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[10px]">delete</span>
                              <span>Remove</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <label htmlFor={`edit-slot-upload-${idx}`} className="cursor-pointer text-center p-2 w-full h-full flex flex-col items-center justify-center hover:bg-[#FCDAD7]/30 transition-colors">
                          <input
                            type="file"
                            id={`edit-slot-upload-${idx}`}
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={(e) => handleEditSingleSlotUpload(e, idx)}
                            className="hidden"
                          />
                          <span className="material-symbols-outlined text-outline text-lg mb-0.5">add_a_photo</span>
                          <span className="text-[9px] text-on-surface-variant font-semibold">
                            + Photo #{idx + 1}
                          </span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* DEDICATED PRODUCT VIDEO UPLOAD SECTION */}
              <div className="pt-3 border-t border-outline-variant/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-black flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-black">videocam</span>
                      <span>Product Video (Optional)</span>
                    </h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">MP4, WebM, MOV (Max 10 MB)</p>
                  </div>
                  <span className="text-[9px] bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    🎥 10MB Max
                  </span>
                </div>

                {editUploadedVideo ? (
                  <div className="relative rounded-xl border border-[#F7C5C0] bg-black/5 p-2 overflow-hidden space-y-2">
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-36 flex items-center justify-center">
                      <video 
                        src={getMediaUrl(editUploadedVideo)} 
                        controls 
                        className="w-full h-full object-contain"
                        preload="metadata"
                      />
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Video Ready
                      </span>
                      <div className="flex items-center gap-1.5">
                        <label 
                          htmlFor="edit-replace-video-upload" 
                          className="px-2 py-1 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-[9px] rounded-lg border border-black/20 cursor-pointer transition-colors"
                        >
                          Replace
                          <input 
                            id="edit-replace-video-upload" 
                            type="file" 
                            accept="video/mp4,video/webm,video/quicktime,video/*" 
                            onChange={handleEditVideoUpload} 
                            className="hidden" 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleEditRemoveVideo}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[9px] rounded-lg border border-red-300 cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#F7C5C0] rounded-xl p-3 text-center bg-[#FFF0F2]/40 hover:bg-[#FCDAD7]/30 hover:border-black/60 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleEditVideoUpload}
                      className="hidden"
                      id="edit-video-upload-input"
                    />
                    <label htmlFor="edit-video-upload-input" className="cursor-pointer block space-y-1">
                      <div className="w-8 h-8 bg-white border border-[#F7C5C0] rounded-full flex items-center justify-center text-black mx-auto shadow-sm">
                        <span className="material-symbols-outlined text-lg">
                          {videoUploadLoading ? 'hourglass_top' : 'video_call'}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-on-surface">
                        {videoUploadLoading ? 'Loading Video...' : '+ Upload Showcase Video'}
                      </p>
                      <p className="text-[9px] text-on-surface-variant">
                        Included in the storefront product slider
                      </p>
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-2 text-[9px] text-on-surface-variant text-center border-t border-outline-variant/20">
                💡 Photo marked <strong className="text-black font-bold">🌟 Main</strong> is shown as the primary storefront image.
              </div>

            </div>

          </div>

          {/* Footer Action Bar */}
          <div className="pt-3 border-t border-[#F7C5C0] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2 bg-[#FCDAD7]/40 hover:bg-[#FCDAD7]/80 text-black font-bold text-[11px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-md border border-black/20 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Save Changes</span>
            </button>
          </div>

        </form>
        </div>
      </div>
    </div>
  );
}
