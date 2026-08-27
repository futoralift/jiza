import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';
import InternationalShippingNotice from './InternationalShippingNotice';
import { COUNTRIES, isIndia as checkIsIndia } from '../data/countries';

export default function CheckoutView({ cartItems, totalAmount, onOrderSuccess, onBackToCart, currentUser, setActiveView }) {
  const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Success Confirmation
  
  // Delivery Fulfillment Type: 'ship' (Home Delivery) vs 'pickup' (Studio Pickup)
  const [fulfillmentType, setFulfillmentType] = useState('ship');

  // International shipping notice popup state
  const [showIntlNotice, setShowIntlNotice] = useState(false);

  // Studio Pickup Configuration (Fetched dynamically from backend store_settings)
  const [storePickupSettings, setStorePickupSettings] = useState({
    storeName: "Jiza Jewellery Studio — Pune",
    address: "Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411051",
    phone: "+91 82088 22696",
    email: "jizajewellery@gmail.com",
    timings: "Mon - Sat: 10:30 AM – 8:30 PM (Ready for pickup in 2-4 hours)",
    instructions: "Please present your Order ID and valid Government Photo ID at the studio counter upon pickup.",
    enabled: true
  });

  // Shipping details state (for Ship to Address)
  const [shippingData, setShippingData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || '',
    country: currentUser?.country || 'India'
  });

  // Handle country change and show international notice ONLY when non-India is selected
  const handleCountryChange = useCallback((newCountry) => {
    const isNowIntl = newCountry && newCountry !== 'India';
    setShippingData(prev => ({ ...prev, country: newCountry }));
    if (isNowIntl) {
      setShowIntlNotice(true);
    } else {
      setShowIntlNotice(false);
    }
  }, []);

  // Pickup Contact details (when customer chooses Pickup)
  const [pickupDetails, setPickupDetails] = useState({
    pickupPersonName: currentUser?.name || '',
    pickupPersonPhone: currentUser?.phone || '',
    email: currentUser?.email || '',
    notes: ''
  });

  // Shipping calculations — depend on shippingData state
  const calculatedSubtotal = (cartItems || []).reduce((acc, item) => {
    const price = Number(item.price || item.sellingPrice || 0);
    const qty = Number(item.quantity || 1);
    return acc + (price * qty);
  }, 0);

  const isInternational = fulfillmentType === 'ship' && shippingData.country && shippingData.country !== 'India';

  // Domestic: ₹99 below ₹5,000, FREE at/above ₹5,000. Pickup: FREE. International: 0 at checkout (pending confirmation).
  const shippingCharge = fulfillmentType === 'pickup' ? 0 : isInternational ? 0 : (calculatedSubtotal >= 5000 ? 0 : 99);
  const isFreeShipping = fulfillmentType === 'pickup' || (!isInternational && calculatedSubtotal >= 5000);
  const effectiveTotalPayable = calculatedSubtotal + shippingCharge;


  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState('');

  // Fetch live store pickup settings from backend
  useEffect(() => {
    fetchPickupSettings();
  }, []);

  const fetchPickupSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/config/pickup-location`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.storeName) {
          setStorePickupSettings(data);
        }
      }
    } catch (err) {
      console.log('Error fetching pickup location config:', err);
    }
  };

  // Sync user profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setShippingData(prev => ({
        ...prev,
        fullName: prev.fullName || currentUser.name || '',
        phone: prev.phone || currentUser.phone || '',
        email: prev.email || currentUser.email || '',
        address: prev.address || currentUser.address || '',
        city: prev.city || currentUser.city || '',
        state: prev.state || currentUser.state || '',
        pincode: prev.pincode || currentUser.pincode || '',
        country: prev.country || currentUser.country || 'India'
      }));

      setPickupDetails(prev => ({
        ...prev,
        pickupPersonName: prev.pickupPersonName || currentUser.name || '',
        pickupPersonPhone: prev.pickupPersonPhone || currentUser.phone || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser]);

  // Handle Step 1 Validation & Next
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (fulfillmentType === 'ship') {
      const cleanPhone = (shippingData.phone || '').replace(/\D/g, '');
      const deliveryCountry = shippingData.country || 'India';
      const isIntlDelivery = deliveryCountry !== 'India';

      if (!shippingData.fullName.trim() || !cleanPhone || !shippingData.address.trim() || !shippingData.city.trim()) {
        setErrorMsg('Please complete all required shipping address fields (Name, Phone, Address, City).');
        return;
      }
      if (cleanPhone.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
      // For domestic orders only — require 6-digit pincode
      if (!isIntlDelivery) {
        if (!shippingData.pincode || shippingData.pincode.replace(/\D/g, '').length !== 6) {
          setErrorMsg('Please enter a valid 6-digit postal pincode for India delivery.');
          return;
        }
      }
    } else {
      // Pickup validation
      const personName = (pickupDetails.pickupPersonName || shippingData.fullName || '').trim();
      const personPhone = (pickupDetails.pickupPersonPhone || shippingData.phone || '').replace(/\D/g, '');
      const personEmail = (pickupDetails.email || shippingData.email || '').trim();

      if (!personName || !personPhone) {
        setErrorMsg('Please provide the Pickup Person Name and Contact Phone Number.');
        return;
      }
      if (personPhone.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number for pickup coordination.');
        return;
      }

      setPickupDetails(prev => ({
        ...prev,
        pickupPersonName: personName,
        pickupPersonPhone: personPhone,
        email: personEmail
      }));
    }

    setStep(2);
  };

  // Helper to dynamically load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Step 2: Initialize & Execute Payment
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please verify your internet connection.');
      }

      const effectiveCustomerInfo = {
        fullName: fulfillmentType === 'pickup' ? (pickupDetails.pickupPersonName || shippingData.fullName) : shippingData.fullName,
        phone: fulfillmentType === 'pickup' ? (pickupDetails.pickupPersonPhone || shippingData.phone) : shippingData.phone,
        email: fulfillmentType === 'pickup' ? (pickupDetails.email || shippingData.email) : shippingData.email,
        address: fulfillmentType === 'pickup' ? `[Store Pickup: ${storePickupSettings.storeName}]` : shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        pincode: shippingData.pincode,
        country: fulfillmentType === 'pickup' ? 'India' : (shippingData.country || 'India'),
        userId: currentUser?.id
      };

      // 1. Create Razorpay order on server
      const prepareRes = await fetch(`${API_BASE}/api/payment/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cartItems.map(ci => ({
            id: ci.id,
            title: ci.title || ci.name,
            quantity: ci.quantity || 1,
            selectedSize: ci.selectedSize,
            selectedColor: ci.selectedColor || ci.colour || ''
          })),
          customerInfo: effectiveCustomerInfo,
          fulfillmentType,
          country: effectiveCustomerInfo.country
        })
      });

      const prepareData = await prepareRes.json();
      if (!prepareRes.ok) {
        throw new Error(prepareData.error || 'Failed to initialize payment order on server.');
      }

      const { razorpayOrderId, amount, currency, keyId } = prepareData;

      // 2. Open Razorpay Checkout Modal (Styled with Jiza Luxury Pink/Burgundy)
      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'Jiza Jewellery Studio',
        description: fulfillmentType === 'pickup' ? 'Store Pickup Order Payment' : 'Heritage Jewellery Delivery Payment',
        image: '/jiza-logo.png',
        order_id: razorpayOrderId,
        prefill: {
          name: effectiveCustomerInfo.fullName,
          email: effectiveCustomerInfo.email,
          contact: effectiveCustomerInfo.phone
        },
        theme: {
          color: '#000000'
        },
        handler: async function (response) {
          try {
            // 3. Server-side HMAC Signature Verification & Final Order Recording
            const verifyRes = await fetch(`${API_BASE}/api/payment/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingData: { ...effectiveCustomerInfo, country: effectiveCustomerInfo.country },
                fulfillmentType,
                country: effectiveCustomerInfo.country,
                pickupDetails: {
                  ...storePickupSettings,
                  pickupPersonName: effectiveCustomerInfo.fullName,
                  pickupPersonPhone: effectiveCustomerInfo.phone,
                  notes: pickupDetails.notes
                },
                cartItems: cartItems.map(ci => ({
                  id: ci.id,
                  title: ci.title || ci.name,
                  quantity: ci.quantity || 1,
                  selectedSize: ci.selectedSize,
                  selectedColor: ci.selectedColor || ci.colour || '',
                  price: ci.price || ci.sellingPrice,
                  img: ci.img || (ci.images && ci.images[0])
                }))
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            if (onOrderSuccess) {
              await onOrderSuccess({
                id: verifyData.orderId,
                amount: `₹${Number(verifyData.amount).toLocaleString('en-IN')}`,
                rawAmount: verifyData.amount,
                customerEmail: effectiveCustomerInfo.email,
                customerName: effectiveCustomerInfo.fullName,
                fulfillmentType,
                cartItems
              });
            }

            setOrderId(verifyData.orderId);
            setStep(3);
          } catch (verifyErr) {
            setErrorMsg(verifyErr.message || 'Payment verification failed.');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setErrorMsg(`Payment Failed: ${response.error?.description || 'Transaction declined'}`);
        setIsSubmitting(false);
      });
      rzp.open();

    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-container-max mx-auto pt-6 pb-24 px-margin-mobile md:px-margin-desktop min-h-[75vh] animate-fadeIn">
      
      {/* International Shipping Notice Popup */}
      <InternationalShippingNotice
        isOpen={showIntlNotice}
        onClose={() => setShowIntlNotice(false)}
        onViewPolicy={() => {
          setShowIntlNotice(false);
          if (typeof setActiveView === 'function') setActiveView('shipping-policy');
        }}
        country={shippingData.country}
      />

      {/* Checkout Progress Stepper */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#FCDAD7] rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black rounded-full transition-all duration-500 z-0"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>

          {/* Step 1 Badge */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step >= 1 
                ? 'bg-[#FCDAD7] text-black shadow-md ring-2 ring-black/20 font-bold' 
                : 'bg-[#FCDAD7]/60 text-black border border-black/20'
            }`}>
              1
            </div>
            <span className={`font-label-sm text-[11px] mt-1.5 font-bold ${
              step >= 1 ? 'text-black' : 'text-gray-400'
            }`}>
              Delivery
            </span>
          </div>

          {/* Step 2 Badge */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step >= 2 
                ? 'bg-[#FCDAD7] text-black shadow-md ring-2 ring-black/20 font-bold' 
                : 'bg-[#FCDAD7]/60 text-black border border-black/20'
            }`}>
              2
            </div>
            <span className={`font-label-sm text-[11px] mt-1.5 font-bold ${
              step >= 2 ? 'text-black' : 'text-gray-400'
            }`}>
              Payment
            </span>
          </div>

          {/* Step 3 Badge */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step >= 3 
                ? 'bg-[#FCDAD7] text-black shadow-md ring-2 ring-black/20 font-bold' 
                : 'bg-[#FCDAD7]/60 text-black border border-black/20'
            }`}>
              3
            </div>
            <span className={`font-label-sm text-[11px] mt-1.5 font-bold ${
              step >= 3 ? 'text-black' : 'text-gray-400'
            }`}>
              Confirmation
            </span>
          </div>
        </div>
      </div>

      {/* EMPTY BAG GUARD */}
      {step !== 3 && (!cartItems || cartItems.length === 0) && (
        <div className="max-w-md mx-auto text-center py-16 bg-white border border-[#F8B3AC]/50 rounded-3xl p-8 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-5xl text-black/40 mb-3 block">shopping_bag</span>
          <h2 className="font-headline-sm text-xl font-bold text-black mb-2">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-stone-600 mb-6 leading-relaxed">Explore our handcrafted heritage collections to add items before checking out.</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => { if (typeof setActiveView === 'function') setActiveView('categories'); }}
              className="px-5 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl border border-black/20 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Explore Collections
            </button>
            <button 
              onClick={() => { if (typeof setActiveView === 'function') setActiveView('home'); }}
              className="px-5 py-2.5 bg-white hover:bg-[#FFF0F2] text-black font-bold text-xs rounded-xl border border-black/15 cursor-pointer active:scale-95 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: DELIVERY / PICKUP SELECTION */}
      {step === 1 && cartItems && cartItems.length > 0 && (
        <div className="max-w-2xl mx-auto bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(252,218,215,0.4)] space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#FCDAD7]">
            <div>
              <h2 className="font-headline-sm text-xl text-black font-bold">Delivery Method</h2>
              <p className="text-xs text-stone-800 mt-0.5">Select how you would like to receive your handcrafted jewellery</p>
            </div>
            <button 
              onClick={onBackToCart} 
              className="text-xs text-black hover:underline font-bold flex items-center gap-1 cursor-pointer bg-[#FCDAD7]/40 px-3 py-1.5 rounded-xl border border-black/15 transition-colors"
            >
              <span>← Return to Bag</span>
            </button>
          </div>

          {/* Pink Segmented Control for Ship vs Pickup */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#FCDAD7]/35 rounded-2xl border border-black/15 shadow-2xs">
            <button
              type="button"
              onClick={() => setFulfillmentType('ship')}
              className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                fulfillmentType === 'ship'
                  ? 'bg-[#FCDAD7] text-black shadow-md border border-black/20'
                  : 'bg-transparent text-stone-800 hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-lg">local_shipping</span>
              <div className="text-left">
                <span className="block font-bold">Ship to Address</span>
                <span className={`text-[10px] block ${fulfillmentType === 'ship' ? 'text-black' : 'text-gray-500'}`}>Insured Courier Delivery</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFulfillmentType('pickup')}
              className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                fulfillmentType === 'pickup'
                  ? 'bg-[#FCDAD7] text-black shadow-md border border-black/20'
                  : 'bg-transparent text-stone-800 hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              <div className="text-left">
                <span className="block font-bold">Store Pickup</span>
                <span className={`text-[10px] block ${fulfillmentType === 'pickup' ? 'text-black' : 'text-gray-500'}`}>Pune Studio (Free)</span>
              </div>
            </button>
          </div>

          {/* Pink Policy Info Notice Banner */}
          <div className="p-3.5 bg-[#FFF0F2] border border-[#F8B3AC] rounded-2xl text-xs flex items-start gap-2.5 shadow-2xs">
            <span className="material-symbols-outlined text-black text-base shrink-0 mt-0.5">timer</span>
            <div className="text-[11px] text-stone-900 leading-relaxed">
              <span className="font-bold">2-Hour Order Modification &amp; Cancellation Policy:</span> You can freely update recipient/address details, change product sizes, add items, or cancel this order within 120 minutes of placement.{' '}
              <button 
                type="button" 
                onClick={() => { if (typeof setActiveView === 'function') setActiveView('cancellation-policy'); }} 
                className="text-black font-bold underline hover:text-stone-800 cursor-pointer ml-1 inline"
              >
                Read Policy
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base text-red-600">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStep1Submit} className="space-y-4 pt-1">
            
            {/* OPTION A: SHIP TO ADDRESS FORM */}
            {fulfillmentType === 'ship' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="font-headline-sm text-sm font-bold text-black flex items-center gap-1.5 border-b border-[#FCDAD7] pb-2">
                  <span className="material-symbols-outlined text-base text-black">pin_drop</span>
                  <span>Shipping Address Details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-sm text-xs text-black block mb-1 font-bold">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={shippingData.fullName}
                      onChange={(e) => setShippingData({...shippingData, fullName: e.target.value})}
                      placeholder="Recipient Full Name"
                      className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-label-sm text-xs text-black block mb-1 font-bold">Mobile Number (10 Digits) *</label>
                    <div className="flex rounded-xl overflow-hidden border border-[#F8B3AC]/60 focus-within:border-black bg-[#FFF9F9] focus-within:bg-white shadow-xs">
                      <span className="bg-[#FCDAD7] text-black font-bold text-xs px-3 py-2.5 flex items-center border-r border-black/15 select-none font-mono">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        inputMode="numeric"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({...shippingData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                        placeholder="10-digit Mobile Number"
                        className="w-full bg-transparent px-3.5 py-2.5 text-xs text-black focus:outline-none font-semibold font-mono tracking-wider"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-label-sm text-xs text-black block mb-1 font-bold">Email Address (for Order Updates &amp; Tracking) *</label>
                  <input 
                    type="email" 
                    required
                    value={shippingData.email}
                    onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-xs text-black block mb-1 font-bold">Flat / House No / Building / Street Address *</label>
                  <input 
                    type="text" 
                    required
                    value={shippingData.address}
                    onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                    placeholder="e.g. Flat 402, Royal Residency, Suncity Road"
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-label-sm text-xs text-black block mb-1 font-bold">City *</label>
                    <input 
                      type="text" 
                      required
                      value={shippingData.city}
                      onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                      placeholder="City"
                      className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-label-sm text-xs text-black block mb-1 font-bold">State {!isInternational ? '*' : ''}</label>
                    <input 
                      type="text" 
                      required={!isInternational}
                      value={shippingData.state}
                      onChange={(e) => setShippingData({...shippingData, state: e.target.value})}
                      placeholder={isInternational ? "State / Province (optional)" : "State"}
                      className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-label-sm text-xs text-black block mb-1 font-bold">
                      {isInternational ? 'Postal Code' : 'Pincode *'}
                    </label>
                    <input 
                      type="text" 
                      required={!isInternational}
                      maxLength={isInternational ? 20 : 6}
                      value={shippingData.pincode}
                      onChange={(e) => setShippingData({...shippingData, pincode: isInternational ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 6)})}
                      placeholder={isInternational ? "Postal / ZIP Code" : "6-digit PIN"}
                      className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium font-mono"
                    />
                  </div>
                </div>

                {/* Country Selector */}
                <div>
                  <label className="font-label-sm text-xs text-black block mb-1 font-bold">Country *</label>
                  <select
                    required
                    value={shippingData.country || 'India'}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                  >
                    <option value="India">🇮🇳 India (Domestic)</option>
                    <optgroup label="─── All International Countries & Territories ───">
                      {COUNTRIES.filter(c => c.name !== 'India').map(c => (
                        <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* International Shipping Notice Banner */}
                {isInternational && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg shrink-0">🌍</span>
                      <div>
                        <div className="font-bold text-amber-900 text-xs mb-1">International Order — Shipping Charge Pending</div>
                        <p className="text-amber-800 text-[11px] leading-relaxed">
                          You will pay the product total now. After we pack your order, our team will contact you by <strong>WhatsApp or phone</strong> to confirm the final international shipping charge before dispatch.
                        </p>
                        <button
                          type="button"
                          onClick={() => typeof setActiveView === 'function' && setActiveView('shipping-policy')}
                          className="text-amber-700 font-bold underline text-[11px] mt-1.5 hover:text-amber-900"
                        >
                          View Shipping Policy ↗
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* OPTION B: STORE PICKUP CARD & CONTACT */}
            {fulfillmentType === 'pickup' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Store Pickup Location Information Card */}
                <div className="bg-[#FFF5F6] border border-[#F8B3AC] rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-black">
                      <div className="w-10 h-10 rounded-xl bg-[#FCDAD7] text-black flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">storefront</span>
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-sm font-bold text-black">
                          {storePickupSettings.storeName || "Jiza Jewellery Studio — Pune"}
                        </h4>
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full mt-0.5">
                          ✓ Ready for Pickup in 2-4 Hours
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-black space-y-1.5 bg-white/90 p-3.5 rounded-xl border border-[#F8B3AC]/40 font-medium">
                    <p className="flex items-start gap-1.5 text-stone-900">
                      <span className="material-symbols-outlined text-sm text-black shrink-0 mt-0.5">location_on</span>
                      <span>{storePickupSettings.address}, {storePickupSettings.city} – {storePickupSettings.pincode}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-700">
                      <span className="material-symbols-outlined text-sm text-black shrink-0">schedule</span>
                      <span>{storePickupSettings.timings}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-700">
                      <span className="material-symbols-outlined text-sm text-black shrink-0">call</span>
                      <span>Studio Phone: <strong className="text-black">{storePickupSettings.phone}</strong></span>
                    </p>
                  </div>

                  <div className="bg-[#FCDAD7]/40 p-3 rounded-xl text-[11px] text-black flex items-center gap-2 border border-black/15">
                    <span className="material-symbols-outlined text-base text-black shrink-0">badge</span>
                    <span>{storePickupSettings.instructions}</span>
                  </div>
                </div>

                {/* Pickup Person & Notification Contact Inputs */}
                <h3 className="font-headline-sm text-sm font-bold text-black flex items-center gap-1.5 border-b border-[#FCDAD7] pb-2 pt-2">
                  <span className="material-symbols-outlined text-base text-black">person_pin</span>
                  <span>Pickup Person &amp; Notification Contact</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-sm text-xs text-black block mb-1 font-bold">Pickup Person Name *</label>
                    <input 
                      type="text" 
                      required
                      value={pickupDetails.pickupPersonName || shippingData.fullName}
                      onChange={(e) => setPickupDetails({...pickupDetails, pickupPersonName: e.target.value})}
                      placeholder="Person who will collect order"
                      className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-label-sm text-xs text-black block mb-1 font-bold">Contact Phone Number (10 Digits) *</label>
                    <div className="flex rounded-xl overflow-hidden border border-[#F8B3AC]/60 focus-within:border-black bg-[#FFF9F9] focus-within:bg-white shadow-xs">
                      <span className="bg-[#FCDAD7] text-black font-bold text-xs px-3 py-2.5 flex items-center border-r border-black/15 select-none font-mono">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        inputMode="numeric"
                        value={pickupDetails.pickupPersonPhone || shippingData.phone}
                        onChange={(e) => setPickupDetails({...pickupDetails, pickupPersonPhone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                        placeholder="10-digit Phone Number"
                        className="w-full bg-transparent px-3.5 py-2.5 text-xs text-black focus:outline-none font-semibold font-mono tracking-wider"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-label-sm text-xs text-black block mb-1 font-bold">Email Address (for Pickup Ready Notification) *</label>
                  <input 
                    type="email" 
                    required
                    value={pickupDetails.email || shippingData.email}
                    onChange={(e) => setPickupDetails({...pickupDetails, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-label-sm text-xs text-black block mb-1 font-bold">Special Pickup Instructions / Notes (Optional)</label>
                  <input 
                    type="text" 
                    value={pickupDetails.notes}
                    onChange={(e) => setPickupDetails({...pickupDetails, notes: e.target.value})}
                    placeholder="e.g. Will arrive after 4:00 PM / Gift wrapping requested"
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black focus:bg-white font-medium"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full mt-6 py-3.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold rounded-2xl shadow-lg border border-black/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Payment Options</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: PAYMENT METHOD */}
      {step === 2 && cartItems && cartItems.length > 0 && (
        <div className="max-w-2xl mx-auto bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(252,218,215,0.4)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#FCDAD7]">
            <div>
              <h2 className="font-headline-sm text-xl text-black font-bold">Select Payment Option</h2>
              <p className="text-xs text-stone-800 mt-0.5">Secure 256-Bit Encrypted Transaction via Razorpay</p>
            </div>
            <button 
              onClick={() => setStep(1)} 
              className="text-xs text-black hover:underline font-bold cursor-pointer bg-[#FCDAD7]/40 px-3 py-1.5 rounded-xl border border-black/15 transition-colors"
            >
              ← Edit {fulfillmentType === 'pickup' ? 'Pickup' : 'Shipping'}
            </button>
          </div>

          {/* Order Price Breakdown & Total */}
          <div className="bg-[#FCDAD7]/40 p-5 rounded-2xl border border-[#F8B3AC]/60 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-800 border-b border-black/10 pb-3">
              <div className="flex justify-between font-medium">
                <span>Cart Subtotal</span>
                <span className="font-mono font-bold text-black">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-medium items-center">
                <span className="flex items-center gap-1">
                  <span>Shipping &amp; Delivery:</span>
                  <span className="text-[10px] text-stone-600">
                    {fulfillmentType === 'pickup'
                      ? '(Studio Pickup)'
                      : isInternational
                        ? '(International — Pending)'
                        : isFreeShipping
                          ? '(Free on ₹5,000+)'
                          : '(Standard Delivery)'}
                  </span>
                </span>
                {fulfillmentType === 'pickup' ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : isInternational ? (
                  <span className="text-amber-600 font-bold text-[11px]">To Be Confirmed</span>
                ) : isFreeShipping ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  <span className="font-mono font-bold text-black">₹{shippingCharge}</span>
                )}
              </div>
              {isInternational && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[10px] text-amber-800 leading-relaxed">
                  🌍 Final shipping charge confirmed after packing. Our team will contact you before dispatch.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-sm pt-1">
              <div>
                <span className="text-[11px] text-stone-700 font-semibold block uppercase tracking-wider">Total Payable Amount</span>
                <strong className="text-black text-2xl font-bold font-mono">₹{effectiveTotalPayable.toLocaleString('en-IN')}</strong>
              </div>
              <span className="text-xs bg-black text-[#FCDAD7] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm border border-black/20">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>{fulfillmentType === 'pickup' ? 'Studio Pickup (Free)' : (shippingCharge === 0 ? 'Free Delivery' : 'Standard Delivery')}</span>
              </span>
            </div>
          </div>

          {/* Fulfillment Summary Banner */}
          <div className="p-3.5 bg-[#FFF5F6] border border-[#F8B3AC]/50 rounded-2xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-800 font-bold uppercase text-[10px]">Fulfillment:</span>
              <span className="font-bold text-black flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-black">
                  {fulfillmentType === 'pickup' ? 'storefront' : 'local_shipping'}
                </span>
                {fulfillmentType === 'pickup' ? 'Studio / Store Pickup (Pune)' : 'Insured Home Delivery'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-800">
              <span>Contact:</span>
              <span>{shippingData.fullName} ({shippingData.phone})</span>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            
            {/* UPI Option */}
            <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
              paymentMethod === 'upi' ? 'border-black bg-[#FCDAD7]/30 ring-2 ring-black/20' : 'border-[#F8B3AC]/60 hover:bg-[#FFF5F6]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="accent-black"
                />
                <div>
                  <strong className="font-headline-sm text-sm text-black block font-bold">Instant UPI / QR Payment</strong>
                  <span className="text-xs text-gray-500">GPay, PhonePe, Paytm, BHIM, Cred UPI</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-black text-2xl">qr_code_2</span>
            </label>

            {/* Credit / Debit Card Option */}
            <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
              paymentMethod === 'card' ? 'border-black bg-[#FCDAD7]/30 ring-2 ring-black/20' : 'border-[#F8B3AC]/60 hover:bg-[#FFF5F6]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-black"
                />
                <div>
                  <strong className="font-headline-sm text-sm text-black block font-bold">Credit or Debit Card</strong>
                  <span className="text-xs text-gray-500">Visa, Mastercard, RuPay, Corporate Cards</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-black text-2xl">credit_card</span>
            </label>

            {errorMsg && (
              <div className="bg-red-100 border border-red-300 p-4 rounded-2xl text-red-900 text-xs font-bold flex items-start gap-2.5 mb-4 animate-shake">
                <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
                <span className="flex-grow">{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-6 py-3.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold rounded-2xl shadow-lg border border-black/20 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Inventory &amp; Payment...</span>
                </>
              ) : (
                <>
                  <span>Confirm Order &amp; Pay ₹{effectiveTotalPayable.toLocaleString('en-IN')}</span>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: ORDER CONFIRMED */}
      {step === 3 && (
        <div className="max-w-lg mx-auto text-center bg-white border border-[#F8B3AC]/60 rounded-3xl p-8 shadow-[0_12px_40px_rgba(252,218,215,0.5)] space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#FCDAD7] border border-black/20 text-black flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>

          <div>
            <span className="font-label-sm text-xs text-black uppercase tracking-[0.2em] font-bold block mb-1">
              Order Placed Successfully
            </span>
            <h2 className="font-headline-md text-2xl text-black font-bold">
              Thank You for Shopping with Jiza!
            </h2>
            <p className="font-body-md text-xs text-gray-600 mt-1.5">
              Your order reference is <strong className="text-black font-mono font-bold text-sm">{orderId}</strong>. We have sent a confirmation email &amp; SMS to {shippingData.email}.
            </p>
          </div>

          {/* 2-Hour Window Notice */}
          <div className="p-3.5 bg-[#FFF0F2] border border-[#F8B3AC] rounded-2xl text-left text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-black font-bold">
              <span className="material-symbols-outlined text-sm text-black">timer</span>
              <span>2-Hour Modification Window Active</span>
            </div>
            <p className="text-[11px] text-stone-800 leading-relaxed">
              You can modify delivery/pickup details, change product sizes, add items, or cancel this order within the next 2 hours from your <strong>Profile</strong>.
            </p>
          </div>

          {isInternational && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <span className="material-symbols-outlined text-sm text-amber-700">public</span>
                <span>International Shipping Confirmation Pending</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your order items are confirmed! Our studio team will carefully pack your jewellery, calculate exact shipment weight, and contact you on WhatsApp / Phone to confirm the final shipping charge before dispatch.
              </p>
            </div>
          )}

          <div className="bg-[#FCDAD7]/35 p-4 rounded-2xl text-left text-xs space-y-2 border border-black/15">
            <div className="flex justify-between">
              <span className="text-stone-800">Fulfillment:</span>
              <strong className="text-black font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-black">
                  {fulfillmentType === 'pickup' ? 'storefront' : isInternational ? 'public' : 'local_shipping'}
                </span>
                {fulfillmentType === 'pickup'
                  ? 'Studio Pickup (Pune)'
                  : isInternational
                    ? `International Delivery (${shippingData.country})`
                    : 'Standard Domestic Delivery'}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-800">Recipient:</span>
              <strong className="text-black font-semibold">{shippingData.fullName}</strong>
            </div>

            <div className="flex justify-between border-t border-black/10 pt-2">
              <span className="text-stone-800">Items Subtotal:</span>
              <strong className="text-black font-mono">₹{calculatedSubtotal.toLocaleString('en-IN')}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-800">Shipping Charge:</span>
              <strong className={
                fulfillmentType === 'pickup' || isFreeShipping
                  ? "text-emerald-700 font-bold"
                  : isInternational
                    ? "text-amber-700 font-bold"
                    : "text-black font-mono font-bold"
              }>
                {fulfillmentType === 'pickup'
                  ? 'FREE'
                  : isInternational
                    ? 'Pending Confirmation'
                    : isFreeShipping
                      ? 'FREE'
                      : `₹${shippingCharge}`}
              </strong>
            </div>

            <div className="flex justify-between border-t border-black/10 pt-2 font-bold text-sm text-black">
              <span>{isInternational ? 'Amount Paid Now (Items):' : 'Total Paid:'}</span>
              <span className="font-mono">₹{effectiveTotalPayable.toLocaleString('en-IN')}</span>
            </div>

            {fulfillmentType === 'pickup' ? (
              <>
                <div className="flex justify-between border-t border-black/10 pt-2">
                  <span className="text-stone-800">Pickup Location:</span>
                  <strong className="text-black font-semibold text-right max-w-[200px] truncate">
                    {storePickupSettings.storeName}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-800">Ready Time:</span>
                  <strong className="text-emerald-700 font-semibold">Ready in ~12 Hours</strong>
                </div>
              </>
            ) : isInternational ? (
              <div className="flex justify-between border-t border-black/10 pt-2">
                <span className="text-stone-800">Estimated Transit:</span>
                <strong className="text-amber-800 font-semibold">7–12 Business Days</strong>
              </div>
            ) : (
              <div className="flex justify-between border-t border-black/10 pt-2">
                <span className="text-stone-800">Estimated Courier:</span>
                <strong className="text-emerald-700 font-semibold">4–10 Business Days</strong>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-stone-800">Package Protection:</span>
              <strong className="text-black font-semibold">100% Insured Luxury Packaging</strong>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => { if (typeof setActiveView === 'function') setActiveView('profile'); else window.location.href = '/profile'; }}
              className="flex-grow py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs rounded-xl shadow border border-black/20 transition-transform active:scale-95 cursor-pointer"
            >
              View Order in Profile
            </button>
            <button 
              onClick={() => { if (typeof setActiveView === 'function') setActiveView('home'); else window.location.href = '/'; }}
              className="px-5 py-3 border border-black/20 hover:bg-[#FCDAD7]/40 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      )}

    </main>
  );
}
