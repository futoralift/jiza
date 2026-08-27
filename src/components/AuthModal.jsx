import React, { useState } from 'react';
import { API_BASE } from '../config';
import { COUNTRIES } from '../data/countries';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, pendingActionMessage, registeredCustomers = [] }) {
  const [isSignUp, setIsSignUp] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    country: 'India'
  });

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
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

    if (isSignUp) {
      // CREATE ACCOUNT LOGIC
      const cleanPin = String(formData.pincode || '').trim();
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !cleanPin) {
        setErrorMsg('All fields are required.');
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
          setErrorMsg(data.error || 'Registration failed.');
          return;
        }

        onLoginSuccess(data.user, [], [], data.message || 'Account created successfully! Welcome to Jiza Jewellery Studio ✨');
      } catch (err) {
        setErrorMsg('Server connection failed. Please try again.');
      }

    } else {
      // SIGN IN LOGIC (Requires matching BOTH Email and Mobile Number)
      if (!formData.email || !formData.phone) {
        setErrorMsg('Please enter both your Email and Mobile Number.');
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
      
      {/* Compact Pink Blush Modal Container */}
      <div className="bg-white border border-black/15 text-black rounded-2xl w-full max-w-[360px] sm:max-w-[380px] overflow-hidden shadow-2xl relative">
        
        {/* Pink Blush Top Header */}
        <div className="bg-[#FCDAD7] px-4 py-3.5 text-center border-b border-black/15 relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-black/60 hover:text-black p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
          
          <div className="w-8 h-8 bg-black/10 border border-black/20 rounded-full flex items-center justify-center mx-auto mb-1 text-black shadow-xs">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          </div>

          <h2 className="font-headline-sm text-lg text-black font-bold tracking-tight">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="font-body-md text-[11px] text-black/75 mt-0.5 leading-tight font-medium">
            {pendingActionMessage || (isSignUp ? 'Sign up for fast checkout & tracking' : 'Enter Email & Mobile to log in')}
          </p>
        </div>

        {/* Pink Compact Tab Selector */}
        <div className="flex border-b border-black/10 bg-[#FCDAD7]/30">
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-label-md font-bold transition-all ${
              isSignUp 
                ? 'text-black border-b-2 border-black bg-[#FCDAD7]' 
                : 'text-black/60 hover:text-black'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-label-md font-bold transition-all ${
              !isSignUp 
                ? 'text-black border-b-2 border-black bg-[#FCDAD7]' 
                : 'text-black/60 hover:text-black'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Compact Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-2.5">
          
          {errorMsg && (
            <div className="p-2.5 bg-red-100 border border-red-300 rounded-lg text-red-900 text-[11px] font-semibold leading-tight">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* CREATE ACCOUNT FORM FIELDS */}
          {isSignUp ? (
            <>
              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
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
                    required
                    maxLength={10}
                    inputMode="numeric"
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
                  required
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
            </>
          ) : (
            /* SIGN IN FORM FIELDS */
            <>
              <div>
                <label className="block text-[10px] font-label-sm text-black font-bold mb-0.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
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
                    required
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="10-digit Mobile Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent px-3 py-2 text-xs text-black focus:outline-none font-semibold font-mono tracking-wider"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 mt-1 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] border border-black/25 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">
              {isSignUp ? 'person_add' : 'login'}
            </span>
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
