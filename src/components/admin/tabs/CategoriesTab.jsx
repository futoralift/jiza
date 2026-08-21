import React from 'react';

export default function CategoriesTab({
  activeCategories = [],
  setCatForm,
  setIsAddCatModalOpen,
  productsList = [],
  handleToggleCategoryActive,
  setEditingCategory,
  handleDeleteCategory,
  setSubCatForm,
  setIsAddSubModalOpen,
  handleToggleSubCategoryActive,
  setEditingSubcategory,
  handleDeleteSubCategory,
  isReadOnly = false
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Category Control Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div>
          <h3 className="font-bold text-base text-black flex items-center gap-2">
            <span className="material-symbols-outlined text-black">account_tree</span>
            <span>Production Category &amp; Sub-Category CMS</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage categories, sub-categories, sort priority, active status, and direct image uploads. All changes sync live across the store.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => {
              setCatForm({ name: '', img: '', display_order: activeCategories.length + 1, active: true });
              setIsAddCatModalOpen(true);
            }}
            className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow border border-black/20 flex items-center gap-1.5 transition-all self-start md:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>+ Add New Category</span>
          </button>
        )}
        {isReadOnly && (
          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">visibility</span>
            View Only Mode
          </span>
        )}
      </div>

      {/* Categories Grid (Clean Minimal CMS Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCategories.map((cat, catIdx) => {
          const assignedProdCount = cat.productsCount !== undefined 
            ? cat.productsCount 
            : productsList.filter(p => p.category === cat.id).length;
          const totalSubsCount = cat.subCategoryObjects ? cat.subCategoryObjects.length : (cat.subcategories ? cat.subcategories.length : 0);
          const isCatActive = cat.active !== undefined ? Boolean(cat.active) : true;
          const displayPos = cat.display_order ?? catIdx + 1;

          return (
            <div 
              key={cat.id} 
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 relative flex flex-col justify-between transition-all ${
                isCatActive ? 'border-[#F7C5C0] hover:border-black/50 hover:shadow-md' : 'border-gray-200 opacity-75 bg-gray-50/50'
              }`}
            >
              <div>
                {/* Category Header Bar */}
                <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FFF0F2] border border-[#F7C5C0] shrink-0 relative">
                      <img src={cat.img || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80'} alt={cat.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 bg-black text-[#FCDAD7] text-[8px] font-mono font-bold px-1 rounded">
                        #{displayPos}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-on-surface flex items-center gap-1">
                        <span>{cat.name}</span>
                      </h4>

                      {/* Active Status Badge & Counts */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {isReadOnly ? (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isCatActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-gray-100 text-gray-500 border-gray-300'
                          }`}>
                            {isCatActive ? '● Active' : '○ Inactive'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryActive(cat)}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                              isCatActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                            }`}
                            title="Click to toggle Active / Inactive"
                          >
                            {isCatActive ? '● Active' : '○ Inactive'}
                          </button>
                        )}

                        <span className="text-[9px] bg-[#FCDAD7]/60 text-black font-bold px-2 py-0.5 rounded-full border border-black/10 font-mono">
                          {assignedProdCount} Prod{assignedProdCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    {isReadOnly ? (
                      <span className="text-[10px] text-on-surface-variant italic">Read Only</span>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingCategory({
                            id: cat.id,
                            name: cat.name,
                            img: cat.img || '',
                            display_order: displayPos,
                            active: isCatActive
                          })}
                          className="p-1.5 hover:bg-[#FFF0F2] text-on-surface-variant hover:text-black rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sub-Categories CMS List */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                      <span>Sub-Categories ({totalSubsCount})</span>
                    </span>
                    {!isReadOnly && (
                      <button
                        onClick={() => {
                          setSubCatForm({
                            categoryId: cat.id,
                            name: '',
                            img: '',
                            display_order: totalSubsCount + 1,
                            active: true
                          });
                          setIsAddSubModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-black hover:underline flex items-center gap-0.5"
                      >
                        <span>+ Add Sub-Category</span>
                      </button>
                    )}
                  </div>

                  {/* Sub-Category Items */}
                  <div className="space-y-1.5 pt-1">
                    {cat.subCategoryObjects && cat.subCategoryObjects.length > 0 ? (
                      cat.subCategoryObjects.map((subObj, subIdx) => {
                        const isSubActive = subObj.active !== undefined ? Boolean(subObj.active) : true;
                        const subProdCount = subObj.productsCount !== undefined
                          ? subObj.productsCount
                          : productsList.filter(p => p.category === cat.id && (p.subcategory === subObj.name || p.subcategory_label === subObj.name)).length;
                        const subDisplayPos = subObj.display_order ?? subIdx + 1;

                        return (
                          <div
                            key={subObj.id}
                            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                              isSubActive ? 'bg-[#FFF0F2]/40 border-[#F7C5C0] hover:border-black/40' : 'bg-gray-100 border-gray-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {subObj.img ? (
                                <img src={subObj.img} alt={subObj.name} className="w-7 h-7 rounded-lg object-cover border shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold shrink-0 font-mono">
                                  #{subDisplayPos}
                                </div>
                              )}
                              <div>
                                <span className="text-xs font-semibold text-on-surface block leading-tight">
                                  {subObj.name}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9px] font-mono font-bold text-gray-400">
                                    #{subDisplayPos} • {subProdCount} prod{subProdCount === 1 ? '' : 's'}
                                  </span>
                                  {isReadOnly ? (
                                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                      isSubActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {isSubActive ? 'Active' : 'Inactive'}
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSubCategoryActive(subObj)}
                                      className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                        isSubActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                                      }`}
                                    >
                                      {isSubActive ? 'Active' : 'Inactive'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Sub Action Buttons */}
                            <div className="flex items-center space-x-1">
                              {isReadOnly ? (
                                <span className="text-[9px] text-gray-400 italic">View</span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSubcategory({
                                      id: subObj.id,
                                      name: subObj.name,
                                      img: subObj.img || '',
                                      display_order: subDisplayPos,
                                      active: isSubActive
                                    })}
                                    className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-black"
                                    title="Edit Sub-Category"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubCategory(subObj.id, subObj.name)}
                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                    title="Delete Sub-Category"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-[11px] text-gray-400 italic py-1 px-2">No sub-categories created yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
