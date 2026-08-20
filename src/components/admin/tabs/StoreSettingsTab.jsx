import React, { useState, useEffect } from 'react';
import { adminFetch } from '../../../config';

export default function StoreSettingsTab() {
  const [pickupSettings, setPickupSettings] = useState({
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

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/store-settings/pickup');
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.storeName) {
          setPickupSettings(data);
        }
      }
    } catch (err) {
      console.log('Error fetching store settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await adminFetch('/api/admin/store-settings/pickup', {
        method: 'PUT',
        body: JSON.stringify(pickupSettings)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccessMsg('Store Pickup & Location settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-[#FCDAD7] text-black p-6 rounded-2xl border border-black/15 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-black text-[#FCDAD7] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">storefront</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-black">
              Studio Pickup &amp; Store Location Settings
            </h2>
            <p className="text-xs text-stone-800 mt-0.5">
              Manage the pickup address, timings, and collection instructions displayed at customer checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/10 px-3.5 py-2 rounded-xl border border-black/20">
          <span className="text-xs font-semibold">Store Pickup:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            pickupSettings.enabled ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-200'
          }`}>
            {pickupSettings.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Pickup Enable Switch */}
          <div className="flex items-center justify-between p-4 bg-[#FCDAD7]/30 rounded-xl border border-black/10">
            <div>
              <strong className="text-sm font-bold text-black block">Enable Studio Pickup at Checkout</strong>
              <span className="text-xs text-gray-500">Allow customers to choose "Pick Up at Studio (Pune)" during checkout</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={pickupSettings.enabled}
                onChange={(e) => setPickupSettings({...pickupSettings, enabled: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">
                Studio / Store Name *
              </label>
              <input 
                type="text" 
                required
                value={pickupSettings.storeName}
                onChange={(e) => setPickupSettings({...pickupSettings, storeName: e.target.value})}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div>
              <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">
                Studio Contact Phone *
              </label>
              <input 
                type="text" 
                required
                value={pickupSettings.phone}
                onChange={(e) => setPickupSettings({...pickupSettings, phone: e.target.value})}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">
              Store / Studio Street Address *
            </label>
            <input 
              type="text" 
              required
              value={pickupSettings.address}
              onChange={(e) => setPickupSettings({...pickupSettings, address: e.target.value})}
              className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">City *</label>
              <input 
                type="text" 
                required
                value={pickupSettings.city}
                onChange={(e) => setPickupSettings({...pickupSettings, city: e.target.value})}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div>
              <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">State *</label>
              <input 
                type="text" 
                required
                value={pickupSettings.state}
                onChange={(e) => setPickupSettings({...pickupSettings, state: e.target.value})}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div>
              <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">Postal Pincode *</label>
              <input 
                type="text" 
                required
                maxLength={6}
                value={pickupSettings.pincode}
                onChange={(e) => setPickupSettings({...pickupSettings, pincode: e.target.value})}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">
                Studio Contact Email *
              </label>
              <input 
                type="email" 
                required
                value={pickupSettings.email}
                onChange={(e) => setPickupSettings({...pickupSettings, email: e.target.value})}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div>
              <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">
                Studio Operating Hours &amp; Ready Timing *
              </label>
              <input 
                type="text" 
                required
                value={pickupSettings.timings}
                onChange={(e) => setPickupSettings({...pickupSettings, timings: e.target.value})}
                placeholder="e.g. Mon - Sat: 10:30 AM – 8:30 PM (Ready in 2-4 hours)"
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-label-sm text-xs text-gray-700 font-bold block mb-1">
              Customer Pickup Instructions &amp; Verification Notice *
            </label>
            <textarea 
              rows={2}
              required
              value={pickupSettings.instructions}
              onChange={(e) => setPickupSettings({...pickupSettings, instructions: e.target.value})}
              placeholder="e.g. Please present your Order ID and valid Government Photo ID at the studio counter upon pickup."
              className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Save Pickup Settings</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
