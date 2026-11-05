import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function TrackOrderView({ setActiveView, initialOrderCode = '', initialPhone = '' }) {
  const [orderCode, setOrderCode] = useState(initialOrderCode || '');
  const [phone, setPhone] = useState(() => (initialPhone ? initialPhone.replace(/\D/g, '').slice(-10) : ''));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderData, setOrderData] = useState(null);

  // Address modification state (within 2-hour window)
  const [isModifyingAddress, setIsModifyingAddress] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [modifySuccessMsg, setModifySuccessMsg] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');

  // Auto-fetch if initial parameters are present in URL
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlOrder = urlParams.get('orderId') || initialOrderCode;
      const urlPhone = urlParams.get('phone') || initialPhone;
      if (urlOrder) {
        setOrderCode(urlOrder);
        if (urlPhone) {
          const cleanP = urlPhone.replace(/\D/g, '').slice(-10);
          setPhone(cleanP);
          fetchTracking(urlOrder, cleanP);
        }
      }
    } catch (_) {}
  }, []);

  const fetchTracking = async (code, phoneNum) => {
    const targetCode = (code || orderCode).trim();
    const cleanP = (phoneNum !== undefined ? String(phoneNum) : phone).replace(/\D/g, '').slice(-10);

    if (!targetCode) {
      setErrorMsg('Please enter your Order ID (e.g. JIZA-XXXXXX).');
      return;
    }

    if (!cleanP || cleanP.length !== 10) {
      setErrorMsg('Please enter your registered 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setModifySuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: targetCode,
          phone: cleanP,
          phoneOrEmail: cleanP
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to find order. Please verify your details.');
        setOrderData(null);
      } else {
        setOrderData(data.order);
        setModifyForm({
          address: data.order.shippingAddress || '',
          city: data.order.shippingCity || '',
          state: data.order.shippingState || '',
          pincode: data.order.shippingPincode || '',
          country: data.order.shippingCountry || 'India'
        });
      }
    } catch (err) {
      setErrorMsg('Connection to server failed. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    fetchTracking(orderCode, phone);
  };

  const handleModifyAddressSubmit = async (e) => {
    e.preventDefault();
    if (!modifyForm.address.trim() || !modifyForm.city.trim() || !modifyForm.pincode.trim()) {
      alert('Please fill Address, City, and Pincode.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanP = (orderData?.customerPhone || phone).replace(/\D/g, '').slice(-10);
      const res = await fetch(`${API_BASE}/api/orders/track/modify-address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: orderData.orderCode,
          phone: cleanP,
          phoneOrEmail: cleanP,
          ...modifyForm
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update address.');
      } else {
        setModifySuccessMsg('Delivery address updated successfully! ✓');
        setIsModifyingAddress(false);
        // Refresh order
        fetchTracking(orderData.orderCode, cleanP);
      }
    } catch (err) {
      alert('Failed to update address. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored and any online payment will be refunded within 5-7 business days.')) {
      return;
    }

    setIsLoading(true);
    try {
      const cleanP = (orderData?.customerPhone || phone).replace(/\D/g, '').slice(-10);
      const res = await fetch(`${API_BASE}/api/orders/track/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: orderData.orderCode,
          phone: cleanP,
          phoneOrEmail: cleanP,
          reason: cancelReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel order.');
      } else {
        alert(data.message || 'Order cancelled successfully.');
        setIsCancelling(false);
        fetchTracking(orderData.orderCode, cleanP);
      }
    } catch (err) {
      alert('Cancellation request failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Status Stepper calculation
  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped' || s === 'in transit') return 3;
    if (s === 'processing' || s === 'packing' || s === 'paid') return 2;
    if (s === 'cancelled') return -1;
    return 1; // Confirmed / Pending
  };

  const currentStep = orderData ? getStepIndex(orderData.status) : 0;

  return (
    <main className="w-full max-w-4xl mx-auto pt-6 pb-24 px-4 sm:px-6 min-h-[75vh] animate-fadeIn">
      
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FCDAD7] text-black font-bold text-xs rounded-full border border-black/15 shadow-xs mb-3">
          <span className="material-symbols-outlined text-sm">local_shipping</span>
          <span>Live Order Tracking</span>
        </div>
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-wide"
          style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
        >
          Track Your Jewellery Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-lg mx-auto">
          Enter your Order ID and 10-digit mobile number to view real-time dispatch, transit, and delivery updates.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="max-w-xl mx-auto bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(252,218,215,0.4)] mb-8">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">
              Order ID *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 material-symbols-outlined text-lg">receipt_long</span>
              <input
                type="text"
                required
                placeholder="e.g. JIZA-849201"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-black/20 rounded-xl text-xs sm:text-sm text-black font-mono font-bold uppercase focus:outline-none focus:border-black shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">
              Registered 10-Digit Mobile Number *
            </label>
            <div className="flex rounded-xl overflow-hidden border border-black/20 focus-within:border-black shadow-xs bg-surface-container-lowest">
              <span className="bg-[#FCDAD7]/80 text-black font-bold text-xs px-3 py-2.5 border-r border-black/20 flex items-center justify-center font-mono shrink-0 select-none">
                +91
              </span>
              <input
                type="tel"
                id="track-phone"
                autoComplete="tel"
                inputMode="tel"
                required
                maxLength={10}
                placeholder="10-digit Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-black font-semibold focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1">The 10-digit mobile number provided during checkout</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] border border-black/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">search</span>
            )}
            <span>{isLoading ? 'Searching Order...' : 'Track Live Status'}</span>
          </button>
        </form>
      </div>

      {/* TRACKING RESULTS DASHBOARD */}
      {orderData && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          
          {modifySuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold text-center">
              {modifySuccessMsg}
            </div>
          )}

          {/* Status Header Card */}
          <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Order Identifier</span>
                <span className="font-mono text-lg sm:text-xl font-bold text-black">{orderData.orderCode || orderData.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Order Placed On</span>
                <span className="text-xs font-bold text-black">{orderData.date}</span>
              </div>
            </div>

            {/* Visual Progress Stepper (Only if not cancelled) */}
            {currentStep !== -1 ? (
              <div className="py-4">
                <div className="flex items-center justify-between relative mb-8">
                  {/* Background line */}
                  <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-[#FCDAD7] rounded-full z-0"></div>
                  {/* Active line */}
                  <div 
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-black rounded-full transition-all duration-500 z-0"
                    style={{ width: `${Math.max(0, Math.min(100, (currentStep - 1) * 33.33))}%` }}
                  ></div>

                  {/* Step 1: Placed */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                      currentStep >= 1 ? 'bg-black text-white' : 'bg-[#FCDAD7] text-black border border-black/20'
                    }`}>
                      ✓
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-center">Confirmed</span>
                  </div>

                  {/* Step 2: Packaging */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                      currentStep >= 2 ? 'bg-black text-white' : 'bg-[#FCDAD7] text-black border border-black/20'
                    }`}>
                      {currentStep >= 2 ? '✓' : '2'}
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-center">Packaging</span>
                  </div>

                  {/* Step 3: Dispatched */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                      currentStep >= 3 ? 'bg-black text-white' : 'bg-[#FCDAD7] text-black border border-black/20'
                    }`}>
                      {currentStep >= 3 ? '✓' : '3'}
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-center">Dispatched</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                      currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-[#FCDAD7] text-black border border-black/20'
                    }`}>
                      {currentStep >= 4 ? '✓' : '4'}
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-center">Delivered</span>
                  </div>
                </div>

                {/* Status Callout Box */}
                <div className="bg-[#FFF0F2] border border-[#F8B3AC]/50 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-black block mb-0.5">Current Status</span>
                  <span className="text-base sm:text-lg font-bold text-black flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {orderData.status === 'Paid' ? 'Payment Verified & In Packaging' : orderData.status}
                  </span>
                  {orderData.deliveryEstimate && (
                    <p className="text-xs text-stone-600 mt-1">
                      Estimated Delivery: <strong className="text-black">{orderData.deliveryEstimate}</strong>
                    </p>
                  )}
                  {orderData.courierName && (
                    <div className="mt-3 pt-3 border-t border-black/10 flex flex-wrap items-center justify-center gap-3">
                      <span className="text-xs text-stone-700">
                        Courier: <strong>{orderData.courierName}</strong>
                      </span>
                      {orderData.trackingNumber && (
                        <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-black/20">
                          AWB: {orderData.trackingNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CANCELLED CALLOUT */
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                <span className="material-symbols-outlined text-3xl text-red-600 mb-1">cancel</span>
                <h3 className="font-bold text-red-900 text-base">Order Cancelled</h3>
                <p className="text-xs text-red-700 mt-0.5">This order has been cancelled and any online payment will be refunded within 5-7 business days.</p>
              </div>
            )}
          </div>

          {/* 2-HOUR SELF-SERVICE ACTIONS (Within 2 Hours & not shipped/cancelled) */}
          {orderData.isModifiable && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-700 text-lg">timer</span>
                <span className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                  2-Hour Self-Service Window Active
                </span>
              </div>
              <p className="text-xs text-amber-800 mb-3 leading-relaxed">
                Made a mistake in your address? You can modify your delivery address or cancel this order before it is packed.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsModifyingAddress(!isModifyingAddress)}
                  className="px-4 py-2 bg-white hover:bg-amber-100 text-black font-bold text-xs rounded-xl border border-black/20 shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">edit_location</span>
                  <span>{isModifyingAddress ? 'Hide Address Form' : 'Modify Delivery Address'}</span>
                </button>
                <button
                  onClick={() => setIsCancelling(!isCancelling)}
                  className="px-4 py-2 bg-white hover:bg-red-50 text-red-700 font-bold text-xs rounded-xl border border-red-300 shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  <span>{isCancelling ? 'Keep Order' : 'Cancel Order'}</span>
                </button>
              </div>

              {/* INLINE ADDRESS MODIFICATION FORM */}
              {isModifyingAddress && (
                <form onSubmit={handleModifyAddressSubmit} className="mt-4 p-4 bg-white rounded-2xl border border-black/15 space-y-3 animate-fadeIn">
                  <h4 className="font-bold text-xs text-black uppercase tracking-wider">Update Delivery Address</h4>
                  <div>
                    <input
                      type="text"
                      id="modify-address"
                      autoComplete="street-address"
                      required
                      placeholder="Street Address, Flat/House No."
                      value={modifyForm.address}
                      onChange={(e) => setModifyForm({ ...modifyForm, address: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      id="modify-city"
                      autoComplete="address-level2"
                      required
                      placeholder="City"
                      value={modifyForm.city}
                      onChange={(e) => setModifyForm({ ...modifyForm, city: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none font-semibold"
                    />
                    <input
                      type="text"
                      id="modify-pincode"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      required
                      maxLength={6}
                      placeholder="6-digit Pincode"
                      value={modifyForm.pincode}
                      onChange={(e) => setModifyForm({ ...modifyForm, pincode: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none font-semibold font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs uppercase tracking-wider rounded-xl border border-black/25 shadow-xs cursor-pointer active:scale-95"
                  >
                    Save Updated Address
                  </button>
                </form>
              )}

              {/* INLINE CANCELLATION FORM */}
              {isCancelling && (
                <div className="mt-4 p-4 bg-white rounded-2xl border border-red-200 space-y-3 animate-fadeIn">
                  <h4 className="font-bold text-xs text-red-900 uppercase tracking-wider">Confirm Cancellation</h4>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none font-semibold"
                  >
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Placed by mistake">Placed by mistake</option>
                    <option value="Want to change items">Want to change items</option>
                    <option value="Delivery time too long">Delivery time too long</option>
                  </select>
                  <button
                    onClick={handleCancelOrder}
                    disabled={isLoading}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer active:scale-95"
                  >
                    Confirm &amp; Cancel Order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delivery & Items Summary */}
          <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-black uppercase tracking-wider border-b border-black/10 pb-2">
              Delivery Details
            </h3>
            <div className="text-xs text-stone-800 space-y-1">
              <p><strong>Customer Name:</strong> {orderData.customerName}</p>
              <p><strong>Contact:</strong> {orderData.customerPhone} • {orderData.customerEmail}</p>
              <p><strong>Fulfillment:</strong> {orderData.fulfillmentType === 'pickup' ? 'Store Pickup (Pune Studio)' : 'Home Delivery'}</p>
              <p><strong>Address:</strong> {orderData.shippingAddress}</p>
            </div>

            <h3 className="font-bold text-sm text-black uppercase tracking-wider border-b border-black/10 pb-2 pt-2">
              Items Ordered ({orderData.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {(orderData.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-[#FFF9F9] rounded-xl border border-black/10">
                  <img
                    src={item.img || (item.images && item.images[0]) || '/logo-j.webp'}
                    alt={item.title || item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-black/10 shrink-0"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/logo-j.webp'; }}
                  />
                  <div className="flex-grow min-w-0 text-xs">
                    <p className="font-bold text-black truncate">{item.title || item.name}</p>
                    <p className="text-[11px] text-stone-500">
                      {item.selectedColor ? `Colour: ${item.selectedColor} • ` : ''}
                      {item.selectedSize ? `Size: ${item.selectedSize} • ` : ''}
                      Qty: {item.quantity || 1}
                    </p>
                  </div>
                  <div className="font-mono font-bold text-xs text-black shrink-0">
                    ₹{Number((item.price || item.sellingPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black/15 pt-3 flex items-center justify-between font-bold text-sm text-black">
              <span>Total Paid:</span>
              <span className="font-mono text-base">{orderData.totalAmount}</span>
            </div>
          </div>

          {/* Need Help Footer */}
          <div className="text-center py-4 text-xs text-stone-600">
            <p>Need assistance with this order? Contact our Pune Studio at <a href="tel:8208822696" className="text-black font-bold underline">+91 82088 22696</a> or <a href="mailto:jizajewellery@gmail.com" className="text-black font-bold underline">jizajewellery@gmail.com</a>.</p>
          </div>

        </div>
      )}

    </main>
  );
}
