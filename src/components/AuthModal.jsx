import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { COUNTRIES } from '../data/countries';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  onGuestCheckout,
  pendingActionMessage, 
  registeredCustomers = [],
  initialTab = 'signup',
  allowGuest = true
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'signup');
  
  // Update active tab whenever initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'signup');
      setErrorMsg('');
    }
  }, [isOpen, initialTab, allowGuest]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    country: 'India',
    billingSame: false,
    billingAddress: '',
    billingCity: '',
    billingPincode: '',
    termsAgreed: false
  });

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'phone') {
      const raw = value.replace(/\D/g, '');
      const numericValue = raw.length > 10 ? raw.slice(-10) : raw;
      setFormData(prev => ({ ...prev, phone: numericValue }));
    } else if (name === 'pincode' || name === 'billingPincode') {
      const numericPin = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: numericPin }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = String(formData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    // 1. CONTINUE AS GUEST
    if (activeTab === 'guest') {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
        setErrorMsg('Please complete all required fields (Name, Email, Phone, Address, City, Pincode).');
        return;
      }

      const isDomestic = !formData.country || formData.country === 'India';
      if (isDomestic && formData.pincode.length !== 6) {
        setErrorMsg('Please enter a valid 6-digit postal pincode for India.');
        return;
      }

      if (!formData.billingSame) {
        if (!formData.billingAddress.trim() || !formData.billingCity.trim() || !formData.billingPincode.trim()) {
          setErrorMsg('Please enter your Billing Address details or check "My billing address is same as shipping address".');
          return;
        }
        if (isDomestic && formData.billingPincode.length !== 6) {
          setErrorMsg('Please enter a valid 6-digit billing pincode for India.');
          return;
        }
      }

      if (!formData.termsAgreed) {
        setErrorMsg('Please read and agree to the Terms & Conditions to proceed.');
        return;
      }

      const guestPayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: cleanPhone,
        address: formData.address.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        country: formData.country || 'India',
        isGuest: true,
        termsAgreed: true,
        billingIsSame: formData.billingSame,
        billingData: formData.billingSame ? {
          address: formData.address.trim(),
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country || 'India'
        } : {
          address: formData.billingAddress.trim(),
          city: formData.billingCity.trim(),
          pincode: formData.billingPincode.trim(),
          country: formData.country || 'India'
        }
      };

      if (typeof onGuestCheckout === 'function') {
        onGuestCheckout(guestPayload);
      }
      return;
    }

    // 2. CREATE ACCOUNT LOGIC
    if (activeTab === 'signup') {
      const cleanPin = String(formData.pincode || '').trim();
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !cleanPin) {
        setErrorMsg('All fields are required to create an account.');
        return;
      }

      const isDomestic = !formData.country || formData.country === 'India';
      if (isDomestic && !/^\d{6}$/.test(cleanPin)) {
        setErrorMsg('Please enter a valid 6-digit pincode for India.');
        return;
      }

      const cleanEmail = formData.email.trim().toLowerCase();

      try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.fullName.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            address: formData.address.trim(),
            city: formData.city.trim(),
            pincode: formData.pincode.trim(),
            country: formData.country || 'India'
          })
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.alreadyExists || (data.error && data.error.toLowerCase().includes('already exist'))) {
            setErrorMsg('An account with this Email or Mobile already exists. Switching to Sign In...');
            // Keep email & phone pre-filled in formData and switch tab to signin
            setFormData(prev => ({
              ...prev,
              email: data.email || cleanEmail,
              phone: data.phone || cleanPhone
            }));
            setTimeout(() => {
              setActiveTab('signin');
              setErrorMsg('');
            }, 800);
            return;
          }
          setErrorMsg(data.error || 'Registration failed.');
          return;
        }

        onLoginSuccess(data.user, [], [], data.message || 'Account created successfully! Welcome to Jiza Jewellery Studio ✨');
      } catch (err) {
        setErrorMsg('Server connection failed. Please try again.');
      }
      return;
    }

    // 3. SIGN IN LOGIC (Requires matching BOTH Email and Mobile Number)
    if (activeTab === 'signin') {
      if (!formData.email || !formData.phone) {
        setErrorMsg('Please enter both your registered Email and Mobile Number.');
        return;
      }

      const cleanEmail = formData.email.trim().toLowerCase();

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            phone: cleanPhone
          })
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Login failed.');
          return;
        }

        onLoginSuccess(data.user, data.cartItems || [], data.wishlistIds || [], data.message || `Welcome back, ${data.user.name}! 👑`);
      } catch (err) {
        setErrorMsg('Server connection failed. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-md animate-fadeIn">
      
      {/* Pink Blush Modal Container */}
      <div className="bg-white border border-black/15 text-black rounded-2xl w-full max-w-[420px] max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Pink Blush Top Header */}
        <div className="bg-[#FCDAD7] px-4 py-3.5 text-center border-b border-black/15 relative shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-black/60 hover:text-black p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
          
          <div className="w-8 h-8 bg-black/10 border border-black/20 rounded-full flex items-center justify-center mx-auto mb-1 text-black shadow-xs">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          </div>

          <h2 className="font-headline-sm text-lg text-black font-bold tracking-tight">
            {activeTab === 'guest' ? 'Continue as Guest' : activeTab === 'signup' ? 'Create Account' : 'Customer Sign In'}
          </h2>
          <p className="font-body-md text-[11px] text-black/75 mt-0.5 leading-tight font-medium">
            {pendingActionMessage || (activeTab === 'guest' ? 'Fast & secure checkout without creating an account' : activeTab === 'signup' ? 'Register for order tracking & faster checkouts' : 'Enter registered Email & Mobile to access account')}
          </p>
        </div>

        {/* Compact Tab Selector with 3 Tabs */}
        <div className="flex border-b border-black/10 bg-[#FCDAD7]/30 shrink-0 text-center">
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-label-md font-bold transition-all cursor-pointer ${
              activeTab === 'signup' 
                ? 'text-black border-b-2 border-black bg-[#FCDAD7]' 
                : 'text-black/60 hover:text-black'
            }`}
          >
            Create Account
          </button>
          {allowGuest && (
            <button
              type="button"
              onClick={() => { setActiveTab('guest'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-label-md font-bold transition-all cursor-pointer ${
                activeTab === 'guest' 
                  ? 'text-black border-b-2 border-black bg-[#FCDAD7]' 
                  : 'text-black/60 hover:text-black'
              }`}
            >
              Continue as Guest
            </button>
          )}
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-label-md font-bold transition-all cursor-pointer ${
              activeTab === 'signin' 
                ? 'text-black border-b-2 border-black bg-[#FCDAD7]' 
                : 'text-black/60 hover:text-black'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-2.5 overflow-y-auto max-h-[75vh]">
          
          {errorMsg && (
            <div className="p-2.5 bg-red-100 border border-red-300 rounded-lg text-red-900 text-[11px] font-semibold leading-tight">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 1. GUEST CHECKOUT FORM FIELDS */}
          {activeTab === 'guest' && (
            <>
              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="guest-fullName"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Email Address * <span className="text-[9px] font-normal text-stone-500 lowercase">(for order receipt &amp; tracking)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="guest-email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Mobile Number (10 Digits) *
                </label>
                <div className="flex rounded-lg overflow-hidden border border-black/20 focus-within:border-black shadow-xs bg-white">
                  <span className="bg-[#FCDAD7] text-black font-bold text-xs px-2.5 flex items-center border-r border-black/15 select-none font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    id="guest-phone"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Mobile Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-black focus:outline-none font-semibold font-mono tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="address"
                  id="guest-address"
                  autoComplete="street-address"
                  required
                  placeholder="Flat/House No., Building, Street"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="guest-city"
                    autoComplete="address-level2"
                    required
                    placeholder="e.g. Pune"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    id="guest-pincode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    placeholder="e.g. 411051"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Country *
                </label>
                <select
                  name="country"
                  id="guest-country"
                  autoComplete="country-name"
                  required
                  value={formData.country || 'India'}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                >
                  <option value="India">🇮🇳 India (Domestic)</option>
                  <optgroup label="─── International ───">
                    {COUNTRIES.filter(c => c.name !== 'India').map(c => (
                      <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* UNCHECKED CHECKBOX 1: Billing Address same as Shipping */}
              <div className="pt-1 border-t border-black/10">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="billingSame"
                    checked={formData.billingSame}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-black/30 text-black focus:ring-0 cursor-pointer h-4 w-4"
                  />
                  <span className="text-xs text-black font-semibold leading-tight">
                    My billing address is same as shipping address
                  </span>
                </label>

                {/* If UNCHECKED, show Billing Address fields */}
                {!formData.billingSame && (
                  <div className="mt-2.5 p-2.5 bg-[#FFF0F2] border border-[#F8B3AC]/50 rounded-xl space-y-2 animate-fadeIn">
                    <p className="text-[10px] font-bold text-black uppercase tracking-wider">Separate Billing Address Details</p>
                    <div>
                      <input
                        type="text"
                        name="billingAddress"
                        id="guest-billingAddress"
                        autoComplete="billing street-address"
                        placeholder="Billing Street Address *"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        className="w-full bg-white border border-black/20 rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none font-medium shadow-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="billingCity"
                        id="guest-billingCity"
                        autoComplete="billing address-level2"
                        placeholder="Billing City *"
                        value={formData.billingCity}
                        onChange={handleChange}
                        className="w-full bg-white border border-black/20 rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none font-medium shadow-xs"
                      />
                      <input
                        type="text"
                        name="billingPincode"
                        id="guest-billingPincode"
                        autoComplete="billing postal-code"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Billing PIN *"
                        value={formData.billingPincode}
                        onChange={handleChange}
                        className="w-full bg-white border border-black/20 rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none font-medium shadow-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* UNCHECKED CHECKBOX 2: Terms and Conditions Agreement (Compulsory) */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="termsAgreed"
                    checked={formData.termsAgreed}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-black/30 text-black focus:ring-0 cursor-pointer h-4 w-4"
                  />
                  <span className="text-[11px] text-stone-800 leading-tight">
                    I have read and agree to the <strong className="text-black underline">Terms and Conditions</strong> &amp; <strong className="text-black underline">Exchange Policy</strong>.
                  </span>
                </label>
              </div>
            </>
          )}

          {/* 2. CREATE ACCOUNT FORM FIELDS */}
          {activeTab === 'signup' && (
            <>
              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="signup-fullName"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  id="signup-email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Mobile Number (10 Digits) *
                </label>
                <div className="flex rounded-lg overflow-hidden border border-black/20 focus-within:border-black shadow-xs bg-white">
                  <span className="bg-[#FCDAD7] text-black font-bold text-xs px-2.5 flex items-center border-r border-black/15 select-none font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    id="signup-phone"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Mobile Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-1.5 text-xs text-black focus:outline-none font-semibold font-mono tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="address"
                  id="signup-address"
                  autoComplete="street-address"
                  required
                  placeholder="Flat/House No., Building, Street"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="signup-city"
                    autoComplete="address-level2"
                    required
                    placeholder="e.g. Pune"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    id="signup-pincode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    placeholder="e.g. 411051"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Country *
                </label>
                <select
                  name="country"
                  id="signup-country"
                  autoComplete="country-name"
                  required
                  value={formData.country || 'India'}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                >
                  <option value="India">🇮🇳 India (Domestic)</option>
                  <optgroup label="─── International ───">
                    {COUNTRIES.filter(c => c.name !== 'India').map(c => (
                      <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Quick switch to Guest */}
              {allowGuest && (
                <div className="pt-2 text-center border-t border-black/10">
                  <p className="text-[11px] text-stone-600 font-medium">
                    Prefer a fast order without registering?{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('guest'); setErrorMsg(''); }}
                      className="text-black font-bold underline hover:text-[#B78946] transition-colors cursor-pointer"
                    >
                      Continue as Guest →
                    </button>
                  </p>
                </div>
              )}
            </>
          )}

          {/* 3. SIGN IN FORM FIELDS */}
          {activeTab === 'signin' && (
            <>
              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  id="signin-email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="Registered Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-black/20 rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-black shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Mobile Number (10 Digits) *
                </label>
                <div className="flex rounded-lg overflow-hidden border border-black/20 focus-within:border-black shadow-xs bg-white">
                  <span className="bg-[#FCDAD7] text-black font-bold text-xs px-2.5 flex items-center border-r border-black/15 select-none font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    id="signin-phone"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Mobile Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-2 text-xs text-black focus:outline-none font-semibold font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Quick switch to Create Account */}
              <div className="pt-2 text-center border-t border-black/10">
                <p className="text-[11px] text-stone-600 font-medium">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
                    className="text-black font-bold underline hover:text-[#B78946] transition-colors cursor-pointer"
                  >
                    Create Account →
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] border border-black/25 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {activeTab === 'guest' ? 'lock' : activeTab === 'signup' ? 'person_add' : 'login'}
            </span>
            <span>
              {activeTab === 'guest' ? 'Proceed to Checkout 🔒' : activeTab === 'signup' ? 'Create Account' : 'Sign In'}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
}