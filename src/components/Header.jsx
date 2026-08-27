import React, { useState } from 'react';
import MobileNavDrawer from './MobileNavDrawer';
import ExchangePolicyModal from './ExchangePolicyModal';
import ContactUsModal from './ContactUsModal';

export default function Header({ 
  activeView, 
  setActiveView, 
  cartCount, 
  wishlistCount, 
  setIsCartOpen, 
  setIsWishlistOpen,
  onSearchClick,
  onShopAll,
  onClearanceSale,
  currentUser,
  onAccountClick,
  onOpenAuthModal,
  onOpenAdmin,
  cartNeedsBounce
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <header className="bg-[#FCDAD7]/95 backdrop-blur-md sticky top-0 z-50 border-b border-black/10 shadow-md w-full transition-colors duration-300">
        <div className="w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-2.5 md:py-3 flex items-center justify-between relative">
          
          {/* Top Nav Left: Hamburger Button (Mobile) + Circular Logo */}
          <div className="flex items-center space-x-1.5 md:space-x-2">
            {/* Universal Hamburger Toggle Button (Mobile, Tablet, Laptop) */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-1.5 -ml-1 text-black hover:bg-black/10 active:scale-95 rounded-xl transition-all flex items-center justify-center focus:outline-none cursor-pointer"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <button 
              onClick={() => setActiveView('home')} 
              className="focus:outline-none flex items-center gap-2.5 group shrink-0"
              title="Jiza Jewellery Studio"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-black/20 shadow-sm bg-black flex items-center justify-center transition-transform group-hover:scale-105">
                <img 
                  src="/jiza-door-logo.png" 
                  alt="Jiza Jewellery Studio Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Desktop Brand Text next to Logo */}
              <span 
                className="hidden md:inline text-sm text-black whitespace-nowrap tracking-[0.06em] font-bold group-hover:opacity-85 transition-opacity"
                style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
              >
                Jiza Jewellery Studio
              </span>
            </button>
          </div>

          {/* Mobile Center: Brand Name */}
          <button 
            onClick={() => setActiveView('home')} 
            className="md:hidden focus:outline-none py-0.5 shrink-0 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 max-w-[48%]"
          >
            <span 
              className="text-[11px] sm:text-xs text-black whitespace-nowrap tracking-[0.04em] font-bold hover:opacity-85 transition-opacity truncate block"
              style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
            >
              Jiza Jewellery Studio
            </span>
          </button>

          {/* Options: Far-Right on both Mobile & Laptop */}
          <div className="flex items-center space-x-3 md:space-x-6 text-xs md:text-sm font-label-md ml-auto">
            
            {/* Desktop Only Text Links (Home, Search, All Categories, Account) */}
            <button 
              onClick={() => setActiveView('home')} 
              className={`hidden md:inline-block transition-all duration-200 ${activeView === 'home' ? 'text-black font-bold border-b-2 border-black scale-105' : 'text-black font-semibold hover:opacity-70'}`}
            >
              Home
            </button>

            <button 
              onClick={() => setActiveView('search')} 
              className={`hidden md:inline-block transition-all duration-200 ${activeView === 'search' ? 'text-black font-bold border-b-2 border-black scale-105' : 'text-black font-semibold hover:opacity-70'}`}
            >
              Search
            </button>

            <button 
              onClick={() => setActiveView('categories')} 
              className={`hidden md:inline-block transition-all duration-200 ${activeView === 'categories' ? 'text-black font-bold border-b-2 border-black scale-105' : 'text-black font-semibold hover:opacity-70'}`}
            >
              All Categories
            </button>

            <button 
              onClick={onAccountClick} 
              className={`hidden md:inline-block transition-all duration-200 ${activeView === 'profile' ? 'text-black font-bold border-b-2 border-black scale-105' : 'text-black font-semibold hover:opacity-70'}`}
            >
              Account
            </button>

            {/* Wishlist Heart Button (Visible on both Mobile & Laptop) */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="p-1.5 text-black hover:bg-black/5 rounded-full transition-colors relative flex items-center justify-center shrink-0"
              title="Saved Wishlist"
            >
              <span className="material-symbols-outlined text-[22px] md:text-[24px]">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-label-sm text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button (Visible on both Mobile & Laptop) */}
            <button 
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className={`p-1.5 text-black hover:bg-black/5 rounded-full transition-colors relative flex items-center justify-center shrink-0 ${
                cartNeedsBounce ? 'animate-heartBeat scale-110' : ''
              }`}
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-[22px] md:text-[24px]">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FCDAD7] text-black border border-black/20 font-label-sm text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        onSearchClick={onSearchClick}
        onShopAll={onShopAll}
        onClearanceSale={onClearanceSale}
        onOpenExchangePolicy={() => setIsExchangeModalOpen(true)}
        onOpenContactUs={() => setIsContactModalOpen(true)}
        currentUser={currentUser}
        onAccountClick={onAccountClick}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Exchange Policy Detail Modal */}
      <ExchangePolicyModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
      />

      {/* Contact Us Modal */}
      <ContactUsModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
