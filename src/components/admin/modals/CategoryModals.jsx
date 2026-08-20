import React from 'react';

export function AddCategoryModal({
  isAddCatModalOpen,
  setIsAddCatModalOpen,
  handleCreateCategory,
  catForm,
  setCatForm,
  processFileToDataUrl
}) {
  if (!isAddCatModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-onyx/75 backdrop-blur-sm">
      <div className="bg-white text-on-surface border border-[#F7C5C0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsAddCatModalOpen(false)}
          className="absolute top-4 right-4 text-outline hover:text-on-surface cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
          <span className="material-symbols-outlined text-black text-2xl">category</span>
          <h3 className="font-headline-sm text-lg text-black font-bold">
            Add New eCommerce Category
          </h3>
        </div>

        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maharashtrian Jewellery, Kundan Sets"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Category Cover Image (Device Upload)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-dashed border-[#F7C5C0] bg-[#FFF0F2] flex items-center justify-center overflow-hidden shrink-0 relative">
                {catForm.img ? (
                  <img src={catForm.img} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-gray-400">image</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && typeof processFileToDataUrl === 'function') {
                      const dataUrl = await processFileToDataUrl(file);
                      if (dataUrl) setCatForm({ ...catForm, img: dataUrl });
                    }
                  }}
                  className="block w-full text-[11px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#FCDAD7] file:text-black file:border file:border-black/20 hover:file:bg-[#F9C5C0] cursor-pointer"
                />
                <p className="text-[10px] text-gray-400 mt-1">Supports JPG, JPEG, PNG, WebP (Auto-compressed)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                Display Order (Position #)
              </label>
              <input
                type="number"
                min="1"
                value={catForm.display_order ?? ''}
                onChange={(e) => setCatForm({ ...catForm, display_order: e.target.value })}
                placeholder="e.g. 1, 2, 3..."
                className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                Status
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1.5">
                <input
                  type="checkbox"
                  checked={catForm.active}
                  onChange={(e) => setCatForm({ ...catForm, active: e.target.checked })}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="font-bold text-xs">{catForm.active ? 'Active (Live)' : 'Inactive (Hidden)'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsAddCatModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-on-surface font-bold text-[11px] uppercase rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FCDAD7] text-black font-bold text-[11px] uppercase rounded-lg shadow border border-black/20 hover:bg-[#F9C5C0] cursor-pointer"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditCategoryModal({
  editingCategory,
  setEditingCategory,
  handleUpdateCategorySubmit,
  processFileToDataUrl
}) {
  if (!editingCategory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-onyx/75 backdrop-blur-sm">
      <div className="bg-white text-on-surface border border-[#F7C5C0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setEditingCategory(null)}
          className="absolute top-4 right-4 text-outline hover:text-on-surface cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
          <span className="material-symbols-outlined text-black text-2xl">edit</span>
          <h3 className="font-headline-sm text-lg text-black font-bold">
            Edit Category Details
          </h3>
        </div>

        <form onSubmit={handleUpdateCategorySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Category Cover Image
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-dashed border-[#F7C5C0] bg-[#FFF0F2] flex items-center justify-center overflow-hidden shrink-0 relative">
                {editingCategory.img ? (
                  <img src={editingCategory.img} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-gray-400">image</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && typeof processFileToDataUrl === 'function') {
                      const dataUrl = await processFileToDataUrl(file);
                      if (dataUrl) setEditingCategory({ ...editingCategory, img: dataUrl });
                    }
                  }}
                  className="block w-full text-[11px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#FCDAD7] file:text-black file:border file:border-black/20 hover:file:bg-[#F9C5C0] cursor-pointer"
                />
                {editingCategory.img && (
                  <button
                    type="button"
                    onClick={() => setEditingCategory({ ...editingCategory, img: '' })}
                    className="text-[10px] text-red-600 hover:underline mt-1 font-bold cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                Display Order (Position #)
              </label>
              <input
                type="number"
                min="1"
                value={editingCategory.display_order ?? ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, display_order: e.target.value })}
                placeholder="e.g. 1, 2, 3..."
                className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                Status
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1.5">
                <input
                  type="checkbox"
                  checked={editingCategory.active}
                  onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked })}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="font-bold text-xs">{editingCategory.active ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="px-4 py-2 bg-gray-200 text-on-surface font-bold text-[11px] uppercase rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FCDAD7] text-black font-bold text-[11px] uppercase rounded-lg shadow border border-black/20 hover:bg-[#F9C5C0] cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddSubCategoryModal({
  isAddSubModalOpen,
  setIsAddSubModalOpen,
  handleCreateSubCategory,
  subCatForm,
  setSubCatForm,
  activeCategories = [],
  processFileToDataUrl
}) {
  if (!isAddSubModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-onyx/75 backdrop-blur-sm">
      <div className="bg-white text-on-surface border border-[#F7C5C0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsAddSubModalOpen(false)}
          className="absolute top-4 right-4 text-outline hover:text-on-surface cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
          <span className="material-symbols-outlined text-black text-2xl">account_tree</span>
          <h3 className="font-headline-sm text-lg text-black font-bold">
            Add Sub-Category
          </h3>
        </div>

        <form onSubmit={handleCreateSubCategory} className="space-y-4 text-xs">
          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Parent Category *
            </label>
            <select
              required
              value={subCatForm.categoryId}
              onChange={(e) => setSubCatForm({ ...subCatForm, categoryId: e.target.value })}
              className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-semibold focus:outline-none"
            >
              <option value="">Select Parent Category...</option>
              {activeCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Sub-Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Short Necklaces, Long Sets, Stud Earrings"
              value={subCatForm.name}
              onChange={(e) => setSubCatForm({ ...subCatForm, name: e.target.value })}
              className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Sub-Category Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-dashed border-[#F7C5C0] bg-[#FFF0F2] flex items-center justify-center overflow-hidden shrink-0 relative">
                {subCatForm.img ? (
                  <img src={subCatForm.img} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-gray-400 text-sm">image</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && typeof processFileToDataUrl === 'function') {
                      const dataUrl = await processFileToDataUrl(file);
                      if (dataUrl) setSubCatForm({ ...subCatForm, img: dataUrl });
                    }
                  }}
                  className="block w-full text-[11px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#FCDAD7] file:text-black file:border file:border-black/20 hover:file:bg-[#F9C5C0] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                Display Order (Position #)
              </label>
              <input
                type="number"
                min="1"
                value={subCatForm.display_order ?? ''}
                onChange={(e) => setSubCatForm({ ...subCatForm, display_order: e.target.value })}
                placeholder="e.g. 1, 2, 3..."
                className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                Status
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1.5">
                <input
                  type="checkbox"
                  checked={subCatForm.active}
                  onChange={(e) => setSubCatForm({ ...subCatForm, active: e.target.checked })}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="font-bold text-xs">{subCatForm.active ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsAddSubModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-on-surface font-bold text-[11px] uppercase rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FCDAD7] text-black font-bold text-[11px] uppercase rounded-lg shadow border border-black/20 hover:bg-[#F9C5C0] cursor-pointer"
            >
              Save Sub-Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditSubCategoryModal({
  editingSubcategory,
  setEditingSubcategory,
  handleUpdateSubCategorySubmit,
  processFileToDataUrl
}) {
  if (!editingSubcategory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-onyx/75 backdrop-blur-sm">
      <div className="bg-white text-on-surface border border-[#F7C5C0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setEditingSubcategory(null)}
          className="absolute top-4 right-4 text-outline hover:text-on-surface cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
          <span className="material-symbols-outlined text-black text-2xl">edit</span>
          <h3 className="font-headline-sm text-lg text-black font-bold">
            Edit Sub-Category Details
          </h3>
        </div>

        <form onSubmit={handleUpdateSubCategorySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Sub-Category Name *
            </label>
            <input
              type="text"
              required
              value={editingSubcategory.name}
              onChange={(e) => setEditingSubcategory({ ...editingSubcategory, name: e.target.value })}
              className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
              Sub-Category Image
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-dashed border-[#F7C5C0] bg-[#FFF0F2] flex items-center justify-center overflow-hidden shrink-0 relative">
                {editingSubcategory.img ? (
                  <img src={editingSubcategory.img} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-gray-400 text-sm">image</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && typeof processFileToDataUrl === 'function') {
                      const dataUrl = await processFileToDataUrl(file);
                      if (dataUrl) setEditingSubcategory({ ...editingSubcategory, img: dataUrl });
                    }
                  }}
                  className="block w-full text-[11px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#FCDAD7] file:text-black file:border file:border-black/20 hover:file:bg-[#F9C5C0] cursor-pointer"
                />
                {editingSubcategory.img && (
                  <button
                    type="button"
                    onClick={() => setEditingSubcategory({ ...editingSubcategory, img: '' })}
                    className="text-[10px] text-red-600 hover:underline mt-1 font-bold cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                Display Order (Position #)
              </label>
              <input
                type="number"
                min="1"
                value={editingSubcategory.display_order ?? ''}
                onChange={(e) => setEditingSubcategory({ ...editingSubcategory, display_order: e.target.value })}
                placeholder="e.g. 1, 2, 3..."
                className="w-full bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:border-black rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-black font-bold text-[11px] uppercase tracking-wider mb-1">
                Status
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1.5">
                <input
                  type="checkbox"
                  checked={editingSubcategory.active}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, active: e.target.checked })}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="font-bold text-xs">{editingSubcategory.active ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setEditingSubcategory(null)}
              className="px-4 py-2 bg-gray-200 text-on-surface font-bold text-[11px] uppercase rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FCDAD7] text-black font-bold text-[11px] uppercase rounded-lg shadow border border-black/20 hover:bg-[#F9C5C0] cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
