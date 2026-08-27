import React from 'react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  onSelectProduct,
  productsList = []
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.price || item.sellingPrice || 0);
    const qty = Number(item.quantity || 1);
    return acc + (price * qty);
  }, 0);
  const cartSubtotal = subtotal;
  const shippingFee = cartSubtotal >= 5000 ? 0 : (cartItems.length > 0 ? 99 : 0);
  const finalTotal = cartSubtotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 bg-deep-onyx/75 backdrop-blur-sm flex justify-end">
      <div className="bg-surface w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-outline-variant animate-slideLeft">
        
        {/* Cart Header */}
        <div className="p-4 md:p-6 border-b border-[#F8B3AC]/50 flex items-center justify-between bg-[#FFF0F2]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-[24px]">shopping_bag</span>
            <h2 className="font-headline-sm text-xl text-black font-bold">Shopping Bag</h2>
            <span className="bg-[#FCDAD7] text-black font-label-sm text-xs px-2.5 py-0.5 rounded-full font-bold border border-black/20">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-black/60 hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Free Shipping Progress Indicator (Threshold: ₹5,000) */}
        {cartItems.length > 0 && (
          <div className="px-4 md:px-6 pt-3 pb-2 bg-[#FFF9F9] border-b border-[#F8B3AC]/30">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-black flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-black">local_shipping</span>
                {cartSubtotal >= 5000 ? (
                  <span className="text-emerald-700 font-bold">🎉 You unlocked FREE Domestic Shipping!</span>
                ) : (
                  <span>Add <strong className="text-black font-mono">₹{(5000 - cartSubtotal).toLocaleString('en-IN')}</strong> more for <strong className="text-black">FREE Shipping</strong></span>
                )}
              </span>
              <span className="text-[11px] font-bold text-black font-mono">
                {Math.min(100, Math.round((cartSubtotal / 5000) * 100))}%
              </span>
            </div>
            <div className="w-full bg-[#FCDAD7]/50 h-2 rounded-full overflow-hidden border border-black/10">
              <div 
                className="bg-black h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (cartSubtotal / 5000) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const prod = productsList.find(p => p.id === item.id) || item;
              const maxStock = prod.stockQuantity !== undefined ? Number(prod.stockQuantity) : (prod.stock_quantity !== undefined ? Number(prod.stock_quantity) : (item.stockQuantity || item.stock_quantity || 10));
              const isMaxStock = item.quantity >= maxStock;

              return (
                <div 
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor || ''}`}
                  className="flex gap-4 p-3 bg-white rounded-2xl border border-[#F8B3AC]/50 relative shadow-xs"
                >
                  <img 
                    src={(item.images && item.images[0]) || item.img} 
                    alt={item.title} 
                    className="w-20 h-20 object-cover rounded-xl bg-[#FFF0F2] cursor-pointer hover:opacity-90 transition-opacity border border-black/10" 
                    onClick={() => {
                      onClose();
                      onSelectProduct(item);
                    }}
                  />

                  <div className="flex-grow pr-6">
                    <h4 
                      className="font-headline-sm text-sm font-bold text-black line-clamp-1 cursor-pointer hover:underline transition-colors"
                      onClick={() => {
                        onClose();
                        onSelectProduct(item);
                      }}
                    >
                      {item.title}
                    </h4>
                    
                    <div className="flex flex-wrap gap-1.5 items-center my-1 text-[11px]">
                      {item.selectedSize && (
                        <span className="bg-[#FCDAD7]/50 border border-black/10 px-2 py-0.5 rounded text-black font-medium">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      {(item.selectedColor || item.colour) && (
                        <span className="bg-[#FCDAD7] text-black border border-black/20 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                          Colour: {item.selectedColor || item.colour}
                        </span>
                      )}
                    </div>

                    <span className="font-body-lg text-sm font-bold text-black block mb-2 font-mono">
                      ₹{Number(item.price || item.sellingPrice || 0).toLocaleString('en-IN')}
                    </span>

                    {/* Quantity Stepper & Stock Limit Enforcement */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-black/20 rounded-lg bg-[#FFF0F2]">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor || '', item.quantity - 1)}
                          className="px-2.5 py-0.5 text-xs text-black font-bold hover:bg-[#FCDAD7] rounded-l cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 py-0.5 text-xs font-bold font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor || '', item.quantity + 1)}
                          disabled={isMaxStock}
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-r transition-colors ${
                            isMaxStock 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'text-black hover:bg-[#FCDAD7] cursor-pointer'
                          }`}
                          title={isMaxStock ? `Max stock (${maxStock}) reached` : 'Add more'}
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs text-stone-600 font-body-md font-mono">
                        Subtotal: ₹{(Number(item.price || item.sellingPrice || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {isMaxStock && (
                      <p className="text-[10px] text-amber-800 font-semibold mt-1">
                        ⚠️ Max available stock ({maxStock} units) reached
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedColor || '')}
                    className="absolute top-2 right-2 text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-[48px] text-stone-400 mb-2">shopping_bag</span>
              <h3 className="font-headline-sm text-black font-bold mb-1">Your bag is empty</h3>
              <p className="font-body-md text-xs text-stone-600 mb-4">
                Explore our handcrafted jewellery pieces to add elegance to your collection.
              </p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#FCDAD7] text-black font-label-md rounded-full text-xs font-bold shadow border border-black/20 hover:bg-[#F9C5C0] cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 md:p-6 bg-white border-t border-[#F8B3AC]/50 space-y-3">
            
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-800 font-medium">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-800 font-medium">
                <span className="flex items-center gap-1">
                  <span>Shipping Fee</span>
                  <span className="text-[10px] text-stone-500">({cartSubtotal >= 1000 ? 'Free on ₹1,000+' : '₹100 below ₹1,000'})</span>
                </span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  <span className="font-mono font-bold text-black">₹100</span>
                )}
              </div>
              <div className="flex justify-between text-black text-base font-bold pt-2 border-t border-black/15">
                <span>Total Amount</span>
                <span className="text-black font-mono">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button 
              onClick={() => onCheckout(finalTotal)}
              className="w-full py-3.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold rounded-2xl shadow-lg border border-black/20 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Secure Checkout</span>
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
