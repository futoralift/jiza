import React from 'react';

export default function MobileNavDrawer({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  onSearchClick,
  onShopAll,
  onClearanceSale,
  onOpenExchangePolicy,
  onOpenContactUs,
  currentUser,
  onAccountClick,
  onOpenAuthModal
}) {
  if (!isOpen) return null;

  const navItems = [
    {
      id: 'search',
      label: 'Search',
      icon: 'search',
      onClick: () => {
        if (typeof onSearchClick === 'function') {
          onSearchClick('');
        } else {
          setActiveView('search');
        }
        onClose();
      }
    },
    {
      id: 'shop-all',
      label: 'Shop All',
      icon: 'grid_view',
      badge: 'Full Catalog',
      onClick: () => {
        if (typeof onShopAll === 'function') {
          onShopAll();
        } else {
          setActiveView('search');
        }
        onClose();
      }
    },
    {
      id: 'clearance-sale',
      label: 'Stock Clearance Sale',
      icon: 'local_offer',
      badge: '🔥 HOT SALE',
      badgeColor: 'bg-red-600 text-white animate-pulse',
      onClick: () => {
        if (typeof onClearanceSale === 'function') {
          onClearanceSale();
        } else {
          setActiveView('search');
        }
        onClose();
      }
    },
    {
      id: 'rental-gallery',
      label: 'Rental Gallery',
      icon: 'diamond',
      badge: 'Bridal Sets',
      onClick: () => {
        setActiveView('rental-gallery');
        onClose();
      }
    },
    {
      id: 'categories',
      label: 'All Categories',
      icon: 'category',
      badge: '14+ Styles',
      onClick: () => {
        setActiveView('categories');
        onClose();
      }
    },
    {
      id: 'my-orders',
      label: 'My Orders',
      icon: 'receipt_long',
      onClick: () => {
        if (currentUser) {
          setActiveView('profile');
        } else {
          if (typeof onOpenAuthModal === 'function') {
            onOpenAuthModal('Please sign in or create an account to view your past orders.');
          } else {
            onAccountClick();
          }
        }
        onClose();
      }
    },
    {
      id: 'shipping-policy',
      label: 'Shipping Policy',
      icon: 'local_shipping',
      badge: 'Pan-India & Global',
      badgeColor: 'bg-[#2D1B14] text-[#FCDAD7] text-[9px]',
      onClick: () => {
        setActiveView('shipping-policy');
        onClose();
      }
    },
    {
      id: 'exchange-policies',
      label: 'Exchange Policies',
      icon: 'published_with_changes',
      badge: '10-Hr Unboxing Rule',
      badgeColor: 'bg-amber-600 text-white text-[9px]',
      onClick: () => {
        onClose();
        if (typeof onOpenExchangePolicy === 'function') {
          onOpenExchangePolicy();
        }
      }
    },
    {
      id: 'contact-us',
      label: 'Contact Us',
      icon: 'support_agent',
      onClick: () => {
        onClose();
        if (typeof onOpenContactUs === 'function') {
          onOpenContactUs();
        }
      }
    },
    {
      id: 'faqs',
      label: 'FAQs',
      icon: 'quiz',
      onClick: () => {
        setActiveView('faq');
        onClose();
      }
    },
    {
      id: 'terms',
      label: 'Terms and Conditions',
      icon: 'gavel',
      onClick: () => {
        setActiveView('terms');
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Dimmed backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-out Menu Drawer from Left */}
      <div 
        className="relative w-[85%] max-w-[340px] h-full bg-[#FFF9F9] border-r border-[#F8B3AC] shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-out animate-slideInLeft overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="bg-[#FCDAD7] p-4 border-b border-[#F8B3AC]/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#F8B3AC] shadow-sm bg-[#FCDAD7] flex items-center justify-center shrink-0">
              <img 
                src="/jiza-door-logo.png" 
                alt="Jiza Jewellery Studio Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span 
                className="text-xs text-stone-900 font-bold tracking-[0.04em] block leading-tight"
                style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
              >
                Jiza Jewellery Studio
              </span>
              <span className="text-[9px] uppercase tracking-widest text-stone-600 font-semibold block">
                Luxury Indian Heritage
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900/5 hover:bg-stone-900/10 active:scale-95 flex items-center justify-center text-stone-800 transition-colors focus:outline-none"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Navigation Options */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-[#FCDAD7] text-stone-900 font-bold shadow-xs border border-[#F8B3AC]/40'
                    : 'text-stone-800 hover:bg-[#FCDAD7]/30 active:bg-[#FCDAD7]/50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={`material-symbols-outlined text-xl ${
                      isActive ? 'text-stone-900 font-bold' : 'text-stone-700'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-xs">{item.label}</span>
                </div>

                {item.badge && (
                  <span 
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.badgeColor || 'bg-[#FCDAD7] text-stone-900 border border-[#F8B3AC]/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Bottom Authentication Card: "Namaste! Guest" with Login/Sign Up Button */}
          <div className="pt-2 mt-2 border-t border-[#F8B3AC]/40">
            {currentUser ? (
              <div className="p-3 bg-[#FCDAD7]/30 border border-[#F8B3AC]/50 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-white text-stone-900 border border-[#F8B3AC] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    {(currentUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {currentUser.name || 'Valued Customer'}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">
                      {currentUser.email || currentUser.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveView('profile');
                    onClose();
                  }}
                  className="text-[10px] uppercase font-bold text-stone-900 bg-[#FCDAD7] hover:bg-[#F9C5C0] px-3 py-1.5 rounded-xl border border-[#F8B3AC] shadow-xs transition-colors shrink-0"
                >
                  My Profile
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#FCDAD7]/30 border border-[#F8B3AC]/50 rounded-2xl space-y-2.5 shadow-xs">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-stone-900">Namaste! Guest</p>
                  <p className="text-[10px] text-stone-500">Sign in to save wishlist, bag &amp; view order history</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (typeof onOpenAuthModal === 'function') {
                      onOpenAuthModal('Please sign in or create an account.');
                    } else {
                      onAccountClick();
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-stone-900 font-bold text-xs rounded-xl border border-[#F8B3AC] shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-stone-800">login</span>
                  <span>Login / Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer with Fast WhatsApp Helpline */}
        <div className="p-3 bg-[#FCDAD7]/40 border-t border-[#F8B3AC]/40 shrink-0 space-y-2">
          <a
            href="https://wa.me/918208822696?text=Hello%20Jiza%20Jewellery%20Studio"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition-all active:scale-95"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>WhatsApp Support (+91 82088 22696)</span>
          </a>
          <p className="text-[10px] text-center text-stone-500">
            Jiza Jewellery Studio © Pune
          </p>
        </div>

      </div>
    </div>
  );
}
