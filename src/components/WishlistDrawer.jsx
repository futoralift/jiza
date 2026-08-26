import React from 'react';
import { PRODUCTS } from '../data/products';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlistIds, 
  onToggleWishlist, 
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  productsList = []
}) {
  if (!isOpen) return null;

  const savedProducts = (productsList && productsList.length > 0 ? productsList : PRODUCTS).filter(p => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 bg-deep-onyx/75 backdrop-blur-sm flex justify-end">
      <div className="bg-surface w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-outline-variant animate-slideLeft">
        
        {/* Wishlist Header */}
        <div className="p-4 md:p-6 border-b border-outline-variant flex items-center justify-between bg-antique-cream">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">favorite</span>
            <h2 className="font-headline-sm text-xl text-on-surface font-bold">Saved Wishlist</h2>
            <span className="bg-secondary text-on-secondary font-label-sm text-xs px-2 py-0.5 rounded-full font-bold">
              {wishlistIds.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Wishlist Items Grid/List */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
          {savedProducts.length > 0 ? (
            savedProducts.map((product) => (
              <div 
                key={product.id}
                className="flex gap-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 relative shadow-sm"
              >
                <img 
                  src={product.img} 
                  alt={product.title} 
                  className="w-20 h-24 object-cover rounded-lg bg-surface-container-low cursor-pointer"
                  onClick={() => {
                    onClose();
                    onSelectProduct(product);
                  }}
                />

                <div className="flex-grow pr-6 flex flex-col justify-between">
                  <div>
                    <h4 
                      onClick={() => {
                        onClose();
                        onSelectProduct(product);
                      }}
                      className="font-headline-sm text-sm font-bold text-on-surface line-clamp-1 cursor-pointer hover:text-heritage-gold transition-colors"
                    >
                      {product.title}
                    </h4>
                    <span className="text-[11px] font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                      {product.categoryLabel}
                    </span>
                    <span className="font-body-lg text-sm font-bold text-primary block">
                      ₹{Number(product.price || product.sellingPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    <button 
                      type="button"
                      onClick={() => onAddToCart(product)}
                      className="py-1.5 px-2 bg-white hover:bg-[#FFF0F2] text-black border border-black/15 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                      Bag
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onBuyNow) {
                          onBuyNow(product, 1, 'Standard', '');
                        } else {
                          onAddToCart(product);
                        }
                      }}
                      className="py-1.5 px-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/20 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">flash_on</span>
                      Buy Now
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => onToggleWishlist(product.id)}
                  className="absolute top-2 right-2 text-outline hover:text-error p-1 transition-colors"
                  title="Remove from wishlist"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">favorite_border</span>
              <h3 className="font-headline-sm text-on-surface mb-1">Your wishlist is empty</h3>
              <p className="font-body-md text-xs text-on-surface-variant mb-4">
                Click the heart icon on any piece to save it for later.
              </p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-heritage-gold text-deep-onyx font-label-md rounded-full text-xs font-bold shadow"
              >
                Browse Jewelry
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
