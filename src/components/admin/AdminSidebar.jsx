import React from 'react';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  productsCount = 0,
  categoriesCount = 0,
  rentalGalleryCount = 0,
  pendingOrdersCount = 0,
  customersCount = 0,
  reviewsCount = 0,
  newProblemsCount = 0,
  fetchRentalGallery,
  fetchAdminReviews,
  fetchAdminProblems,
  setSelectedPremiumFeature,
  onExitAdmin
}) {
  return (
    <aside className="w-52 h-[calc(100vh-48px)] border-r border-[#F7C5C0] bg-[#FFF0F2] fixed left-0 top-12 z-40 flex flex-col shadow-sm">
      
      <div className="px-3 py-2.5 border-b border-[#F7C5C0] bg-[#FCDAD7]">
        <p className="text-[10px] font-label-sm text-black font-bold uppercase tracking-wider">
          Management Portal
        </p>
      </div>

      {/* Sidebar Nav Items (Compact & Sleek) */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'overview'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'overview' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'products'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'products' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>Inventory</span>
          <span className={`ml-auto text-[9px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'products' ? 'bg-black text-[#FCDAD7] font-bold' : 'bg-white border border-[#F7C5C0] text-black font-semibold'
          }`}>
            {productsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'categories'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'categories' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">category</span>
          <span>Categories &amp; Sub</span>
          <span className={`ml-auto text-[9px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'categories' ? 'bg-black text-[#FCDAD7] font-bold' : 'bg-white border border-[#F7C5C0] text-black font-semibold'
          }`}>
            {categoriesCount}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('rental-gallery');
            if (typeof fetchRentalGallery === 'function') fetchRentalGallery();
          }}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'rental-gallery'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'rental-gallery' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">collections</span>
          <span>Rental Gallery</span>
          <span className={`ml-auto text-[9px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'rental-gallery' ? 'bg-black text-[#FCDAD7] font-bold' : 'bg-white border border-[#F7C5C0] text-black font-semibold'
          }`}>
            {rentalGalleryCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'orders'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'orders' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
          <span>Orders</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-auto bg-amber-500 text-black font-bold text-[9px] px-1.5 py-0.2 rounded-full">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'customers'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'customers' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">groups</span>
          <span>Customers</span>
          <span className={`ml-auto text-[9px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'customers' ? 'bg-black text-[#FCDAD7] font-bold' : 'bg-white border border-[#F7C5C0] text-black font-semibold'
          }`}>
            {customersCount}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reviews');
            if (typeof fetchAdminReviews === 'function') fetchAdminReviews();
          }}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'reviews'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'reviews' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">rate_review</span>
          <span>Reviews</span>
          <span className={`ml-auto text-[9px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'reviews' ? 'bg-black text-[#FCDAD7] font-bold' : 'bg-white border border-[#F7C5C0] text-black font-semibold'
          }`}>
            {reviewsCount}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('problems');
            if (typeof fetchAdminProblems === 'function') fetchAdminProblems();
          }}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'problems'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'problems' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">support_agent</span>
          <span>Customer Problems</span>
          {newProblemsCount > 0 && (
            <span className="ml-auto bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
              {newProblemsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'analytics'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'analytics' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('store-settings')}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
            activeTab === 'store-settings'
              ? 'bg-[#FCDAD7] text-black font-bold shadow-sm border border-black/20'
              : 'text-stone-800 hover:bg-[#FCDAD7]/60 hover:text-black font-semibold'
          }`}
        >
          {activeTab === 'store-settings' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
          )}
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          <span>Pickup &amp; Store</span>
        </button>

        <div className="pt-2 border-t border-[#F7C5C0] my-1">
          <button
            onClick={() => {
              setActiveTab('premium');
              if (typeof setSelectedPremiumFeature === 'function') setSelectedPremiumFeature(null);
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all relative ${
              activeTab === 'premium'
                ? 'bg-[#F8B3AC] text-black font-bold shadow-sm border border-black/25'
                : 'bg-[#FCDAD7]/40 text-black hover:bg-[#FCDAD7] border border-[#F7B6B0] font-semibold'
            }`}
          >
            {activeTab === 'premium' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full"></span>
            )}
            <span className="material-symbols-outlined text-[17px] text-black font-bold">stars</span>
            <span>Premium Features</span>
            <span className="ml-auto text-[9px] bg-black text-[#FCDAD7] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
              <span>🔒</span>
              <span>PRO</span>
            </span>
          </button>
        </div>

        {onExitAdmin && (
          <div className="pt-2 border-t border-[#F7C5C0] my-1">
            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-[11px] font-label-md transition-all text-red-700 hover:bg-red-50 hover:text-red-900 font-bold border border-red-200 cursor-pointer bg-white/70 shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">logout</span>
              <span>Exit Admin</span>
            </button>
          </div>
        )}

      </nav>

    </aside>
  );
}
