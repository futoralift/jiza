import React, { useState, useEffect } from 'react';
import { API_BASE, adminFetch, isReadOnlyAdmin } from '../../../config';

const COUNTRIES_REFERENCE = [
  { region: 'SAARC (South Asia)', countries: 'Bangladesh, Sri Lanka, Nepal, Bhutan, Maldives', typicalWeight: '3–6 kg', timeline: '7–12 business days', note: 'Customs clearance required' },
  { region: 'Southeast Asia', countries: 'Singapore, Malaysia, Thailand, Indonesia, Vietnam', typicalWeight: '3–6 kg', timeline: '8–14 business days', note: 'Customs clearance required' },
  { region: 'Middle East & GCC', countries: 'UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman', typicalWeight: '3–6 kg', timeline: '7–12 business days', note: 'Customs clearance required' },
  { region: 'United Kingdom', countries: 'England, Scotland, Wales, Northern Ireland', typicalWeight: '3–6 kg', timeline: '10–16 business days', note: 'Post-Brexit UK VAT applies' },
  { region: 'Europe (EU)', countries: 'Germany, France, Netherlands, Italy, Spain', typicalWeight: '3–6 kg', timeline: '10–16 business days', note: 'EU import VAT applies' },
  { region: 'North America', countries: 'USA, Canada', typicalWeight: '3–6 kg', timeline: '12–18 business days', note: 'CBP customs clearance required' },
  { region: 'Australia & Oceania', countries: 'Australia, New Zealand', typicalWeight: '3–6 kg', timeline: '10–16 business days', note: 'AQIS & Customs clearance required' },
  { region: 'Rest of World', countries: 'All other international destinations', typicalWeight: '3–6 kg', timeline: '12–21 business days', note: 'Local customs rules apply' },
];

export default function ShippingTab({ showToast, onRefreshOrders, ordersList = [] }) {
  const isReadOnly = isReadOnlyAdmin();
  const [subTab, setSubTab] = useState('pending-intl'); // 'pending-intl', 'settings', 'investigations', 'reference'
  const [loading, setLoading] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [shippingSettings, setShippingSettings] = useState({
    domestic: { standardFee: 99, freeThreshold: 5000, deliveryEstimate: '4–10 business days', enabled: true },
    pickup: { enabled: true, prepTime: 'approximately 12 hours', hours: '10:30 AM – 8:00 PM', collectionDeadlineDays: 15 },
    international: { enabled: true, deliveryEstimate: '7–12 business days', ddu: true, note: 'Final shipping charge confirmed after packing.' }
  });
  const [investigations, setInvestigations] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);

  // Form states
  const [confirmChargeModal, setConfirmChargeModal] = useState(null); // { order }
  const [confirmedChargeInput, setConfirmedChargeInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [isConfirmingCharge, setIsConfirmingCharge] = useState(false);

  // Investigation form modal
  const [isNewInvOpen, setIsNewInvOpen] = useState(false);
  const [newInvForm, setNewInvForm] = useState({
    orderId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    trackingNumber: '',
    courier: '',
    complaintDescription: ''
  });
  const [isSubmittingInv, setIsSubmittingInv] = useState(false);

  // Edit investigation modal
  const [selectedInv, setSelectedInv] = useState(null);
  const [invUpdateForm, setInvUpdateForm] = useState({
    investigationStatus: '',
    investigationNotes: '',
    finalOutcome: '',
    outcomeNotes: '',
    resolution: '',
    courierName: '',
    trackingNumber: ''
  });
  const [isUpdatingInv, setIsUpdatingInv] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPendingOrders();
    fetchInvestigations();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/shipping/settings`);
      if (res.ok) {
        const data = await res.json();
        setShippingSettings(data);
      }
    } catch (err) {
      console.log('Error fetching shipping settings:', err);
    }
  };

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/shipping/pending-international`);
      if (res.ok) {
        const data = await res.json();
        setPendingOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log('Error fetching pending intl orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestigations = async () => {
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/shipping/investigations`);
      if (res.ok) {
        const data = await res.json();
        setInvestigations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log('Error fetching shipping investigations:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (isReadOnly) {
      showToast?.('🛡️ Read-Only Mode: You cannot modify store settings.');
      return;
    }

    setSavingSettings(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/shipping/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingSettings)
      });
      const data = await res.json();
      if (res.ok) {
        showToast?.('✅ Shipping settings updated successfully!');
      } else {
        alert(data.error || 'Failed to update shipping settings.');
      }
    } catch (err) {
      alert('Error updating shipping settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleConfirmInternationalShipping = async (e) => {
    e.preventDefault();
    if (isReadOnly) {
      showToast?.('🛡️ Read-Only Mode: You cannot confirm charges.');
      return;
    }
    if (!confirmChargeModal || !confirmedChargeInput) {
      alert('Please enter the confirmed shipping amount in ₹.');
      return;
    }

    setIsConfirmingCharge(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/orders/${confirmChargeModal.id}/shipping/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmedCharge: Number(confirmedChargeInput),
          confirmedBy: 'Admin',
          notes: adminNotesInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast?.(`✅ International shipping confirmed at ₹${Number(confirmedChargeInput).toLocaleString('en-IN')}!`);
        setConfirmChargeModal(null);
        setConfirmedChargeInput('');
        setAdminNotesInput('');
        fetchPendingOrders();
        if (typeof onRefreshOrders === 'function') onRefreshOrders();
      } else {
        alert(data.error || 'Failed to confirm international shipping charge.');
      }
    } catch (err) {
      alert('Error confirming charge: ' + err.message);
    } finally {
      setIsConfirmingCharge(false);
    }
  };

  const handleCreateInvestigation = async (e) => {
    e.preventDefault();
    if (isReadOnly) {
      showToast?.('🛡️ Read-Only Mode: You cannot create investigations.');
      return;
    }
    if (!newInvForm.orderId) {
      alert('Please enter an Order ID.');
      return;
    }

    setIsSubmittingInv(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/shipping/investigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast?.('✅ Shipping dispute investigation opened.');
        setIsNewInvOpen(false);
        setNewInvForm({ orderId: '', customerName: '', customerEmail: '', customerPhone: '', trackingNumber: '', courier: '', complaintDescription: '' });
        fetchInvestigations();
      } else {
        alert(data.error || 'Failed to create investigation.');
      }
    } catch (err) {
      alert('Error creating investigation: ' + err.message);
    } finally {
      setIsSubmittingInv(false);
    }
  };

  const handleUpdateInvestigation = async (e) => {
    e.preventDefault();
    if (isReadOnly) {
      showToast?.('🛡️ Read-Only Mode: You cannot update investigations.');
      return;
    }
    if (!selectedInv) return;

    setIsUpdatingInv(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/shipping/investigations/${selectedInv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invUpdateForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast?.('✅ Investigation status updated.');
        setSelectedInv(null);
        fetchInvestigations();
      } else {
        alert(data.error || 'Failed to update investigation.');
      }
    } catch (err) {
      alert('Error updating investigation: ' + err.message);
    } finally {
      setIsUpdatingInv(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* Header Banner */}
      <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-stone-800 text-2xl">local_shipping</span>
            <h1 className="text-xl font-bold text-black" style={{ fontFamily: "'Playfair Display', serif" }}>
              Shipping &amp; Delivery Management
            </h1>
          </div>
          <p className="text-xs text-stone-600">
            Configure rates, confirm post-packing international shipping charges, and handle delivered-not-received disputes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { fetchPendingOrders(); fetchInvestigations(); }}
            className="px-3 py-1.5 bg-[#FFF0F2] hover:bg-[#FCDAD7] border border-[#F8B3AC] text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsNewInvOpen(true)}
            className="px-3.5 py-1.5 bg-black hover:bg-stone-900 text-[#FCDAD7] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">report_problem</span>
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('pending-intl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'pending-intl'
              ? 'bg-[#FCDAD7] text-black shadow-sm border border-black/20'
              : 'text-stone-700 hover:bg-[#FCDAD7]/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">public</span>
          <span>Pending International Orders</span>
          {pendingOrders.length > 0 && (
            <span className="bg-amber-600 text-white text-[10px] px-2 py-0.2 rounded-full font-mono font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'settings'
              ? 'bg-[#FCDAD7] text-black shadow-sm border border-black/20'
              : 'text-stone-700 hover:bg-[#FCDAD7]/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">tune</span>
          <span>Shipping Rates &amp; Policy Settings</span>
        </button>

        <button
          onClick={() => setSubTab('investigations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'investigations'
              ? 'bg-[#FCDAD7] text-black shadow-sm border border-black/20'
              : 'text-stone-700 hover:bg-[#FCDAD7]/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">gavel</span>
          <span>Delivered-Not-Received Cases</span>
          {investigations.filter(i => i.investigation_status === 'open').length > 0 && (
            <span className="bg-red-600 text-white text-[10px] px-2 py-0.2 rounded-full font-mono font-bold">
              {investigations.filter(i => i.investigation_status === 'open').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('reference')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'reference'
              ? 'bg-[#FCDAD7] text-black shadow-sm border border-black/20'
              : 'text-stone-700 hover:bg-[#FCDAD7]/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">table_chart</span>
          <span>International Reference Guide</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: PENDING INTERNATIONAL ORDERS */}
      {/* ======================================================== */}
      {subTab === 'pending-intl' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">info</span>
            <div>
              <span className="font-bold block text-sm mb-0.5">International Shipping Confirmation Workflow</span>
              <p className="leading-relaxed text-amber-800">
                1. Physically pack the jewellery order and weigh the final shipment.<br />
                2. Call / WhatsApp the customer to inform them of the final shipping charge.<br />
                3. Click <strong>"Confirm Shipping Charge"</strong> below to record the amount and update the order total in database.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-stone-500 text-xs">Loading pending orders...</div>
          ) : pendingOrders.length === 0 ? (
            <div className="bg-white border border-[#F8B3AC]/40 rounded-3xl p-12 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
              <h3 className="font-bold text-sm text-black">All Clear! No Pending International Shipping Confirmations</h3>
              <p className="text-xs text-stone-500">Every placed international order has been confirmed or dispatched.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FCDAD7] text-black font-bold border-b border-black/10">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Country</th>
                      <th className="px-4 py-3">Items Subtotal</th>
                      <th className="px-4 py-3">Shipping Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {pendingOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#FFF9F9] transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-black">{ord.id}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-stone-900">{ord.customer_name}</div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                            <span>📞 {ord.customer_phone}</span>
                            <a
                              href={`https://wa.me/${(ord.customer_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${ord.customer_name}, this is Jiza Jewellery Studio regarding your order ${ord.id}. We have packed your jewellery and the international shipping charge to ${ord.shipping_country} is: `)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 font-bold hover:underline"
                            >
                              WhatsApp ↗
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                            {ord.shipping_country || 'International'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-black">
                          ₹{Number(ord.shipping_subtotal || ord.total_amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
                            Pending Packing &amp; Confirmation
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-stone-500 text-[11px]">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setConfirmChargeModal(ord);
                              setConfirmedChargeInput('');
                              setAdminNotesInput('');
                            }}
                            className="px-3 py-1.5 bg-[#2D1B14] hover:bg-[#3D241A] text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Confirm Shipping ₹
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: SETTINGS CONFIGURATION */}
      {/* ======================================================== */}
      {subTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">

          {/* Domestic Settings */}
          <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#FCDAD7] pb-3">
              <span className="text-xl">🇮🇳</span>
              <div>
                <h3 className="font-bold text-base text-black">Domestic Shipping (India)</h3>
                <p className="text-xs text-stone-600">Standard domestic delivery fees and free threshold</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-xs text-black block mb-1">Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingSettings.domestic?.standardFee ?? 99}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    domestic: { ...shippingSettings.domestic, standardFee: Number(e.target.value) }
                  })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Applied to orders below the free threshold</span>
              </div>

              <div>
                <label className="font-bold text-xs text-black block mb-1">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingSettings.domestic?.freeThreshold ?? 5000}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    domestic: { ...shippingSettings.domestic, freeThreshold: Number(e.target.value) }
                  })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Orders at or above this get FREE delivery</span>
              </div>

              <div>
                <label className="font-bold text-xs text-black block mb-1">Delivery Estimate Display</label>
                <input
                  type="text"
                  value={shippingSettings.domestic?.deliveryEstimate || '4–10 business days'}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    domestic: { ...shippingSettings.domestic, deliveryEstimate: e.target.value }
                  })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Shown on checkout and product pages</span>
              </div>
            </div>
          </div>

          {/* Store Pickup Settings */}
          <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#FCDAD7] pb-3">
              <span className="text-xl">🏬</span>
              <div>
                <h3 className="font-bold text-base text-black">Store Pickup Configuration</h3>
                <p className="text-xs text-stone-600">Timings, preparation timelines, and collection deadlines</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-xs text-black block mb-1">Preparation Time</label>
                <input
                  type="text"
                  value={shippingSettings.pickup?.prepTime || 'approximately 12 hours'}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    pickup: { ...shippingSettings.pickup, prepTime: e.target.value }
                  })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-black block mb-1">Pickup Studio Hours</label>
                <input
                  type="text"
                  value={shippingSettings.pickup?.hours || '10:30 AM – 8:00 PM'}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    pickup: { ...shippingSettings.pickup, hours: e.target.value }
                  })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-black block mb-1">Collection Deadline (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={shippingSettings.pickup?.collectionDeadlineDays ?? 15}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    pickup: { ...shippingSettings.pickup, collectionDeadlineDays: Number(e.target.value) }
                  })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Uncollected orders auto-expire after this</span>
              </div>
            </div>
          </div>

          {/* International Settings */}
          <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#FCDAD7] pb-3">
              <span className="text-xl">🌎</span>
              <div>
                <h3 className="font-bold text-base text-black">International Shipping Policy</h3>
                <p className="text-xs text-stone-600">Worldwide shipping rules and DDU terms</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-xs text-black block mb-1">Estimated Transit Timeline</label>
                <input
                  type="text"
                  value={shippingSettings.international?.deliveryEstimate || '7–12 business days'}
                  onChange={(e) => setShippingSettings({
                    ...shippingSettings,
                    international: { ...shippingSettings.international, deliveryEstimate: e.target.value }
                  })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center">
                <span>
                  <strong>DDU Policy:</strong> All international shipments are marked Delivery Duty Unpaid. Customer is responsible for import tariffs.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings || isReadOnly}
              className="px-6 py-3 bg-[#2D1B14] hover:bg-[#3D241A] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>{savingSettings ? 'Saving Settings...' : 'Save Shipping Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: DELIVERED-NOT-RECEIVED INVESTIGATIONS */}
      {/* ======================================================== */}
      {subTab === 'investigations' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-black">Dispute Cases &amp; Courier Claims</h3>
              <p className="text-xs text-stone-500">Track 24–48h complaint investigations under the 5–7 working days resolution SLA.</p>
            </div>
            <button
              onClick={() => setIsNewInvOpen(true)}
              className="px-3.5 py-2 bg-black text-[#FCDAD7] font-bold text-xs rounded-xl shadow-xs hover:bg-stone-900 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add_alert</span>
              <span>Open Dispute Case</span>
            </button>
          </div>

          {investigations.length === 0 ? (
            <div className="bg-white border border-[#F8B3AC]/40 rounded-3xl p-12 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-stone-300">verified</span>
              <h3 className="font-bold text-sm text-black">No Active Shipping Disputes</h3>
              <p className="text-xs text-stone-500">All customer deliveries are running smoothly.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FCDAD7] text-black font-bold border-b border-black/10">
                    <tr>
                      <th className="px-4 py-3">Case ID</th>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Courier / Tracking</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Resolution</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {investigations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#FFF9F9] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-black">{inv.id}</td>
                        <td className="px-4 py-3 font-mono font-bold text-stone-700">{inv.order_id}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-stone-900">{inv.customer_name || 'N/A'}</div>
                          <div className="text-[11px] text-stone-500">{inv.customer_phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-stone-800">{inv.courier || 'Courier Pending'}</div>
                          <div className="font-mono text-[11px] text-stone-500">{inv.tracking_number || 'No AWB'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            inv.investigation_status === 'open'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : inv.investigation_status === 'in_review'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {inv.investigation_status || 'open'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-stone-600">
                          {inv.resolution || inv.final_outcome || 'Pending investigation'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedInv(inv);
                              setInvUpdateForm({
                                investigationStatus: inv.investigation_status || 'open',
                                investigationNotes: inv.investigation_notes || '',
                                finalOutcome: inv.final_outcome || '',
                                outcomeNotes: inv.outcome_notes || '',
                                resolution: inv.resolution || '',
                                courierName: inv.courier || '',
                                trackingNumber: inv.tracking_number || ''
                              });
                            }}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-black font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Update Case
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 4: REFERENCE GUIDE TABLE */}
      {/* ======================================================== */}
      {subTab === 'reference' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#F8B3AC]/60 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#FCDAD7] pb-3">
              <span className="material-symbols-outlined text-stone-800 text-xl">menu_book</span>
              <div>
                <h3 className="font-bold text-base text-black">International Shipping Policy Reference Table</h3>
                <p className="text-xs text-stone-600">Standard guidance for customer service and packing staff</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FCDAD7] text-black font-bold">
                  <tr>
                    <th className="px-3.5 py-3">Region</th>
                    <th className="px-3.5 py-3">Countries Included</th>
                    <th className="px-3.5 py-3">Typical Weight</th>
                    <th className="px-3.5 py-3">Estimated Transit</th>
                    <th className="px-3.5 py-3">Customs Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {COUNTRIES_REFERENCE.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF9F9]'}>
                      <td className="px-3.5 py-3 font-semibold text-stone-900 whitespace-nowrap">{row.region}</td>
                      <td className="px-3.5 py-3 text-stone-700">{row.countries}</td>
                      <td className="px-3.5 py-3 font-mono text-stone-600 whitespace-nowrap">{row.typicalWeight}</td>
                      <td className="px-3.5 py-3 text-stone-600 whitespace-nowrap">{row.timeline}</td>
                      <td className="px-3.5 py-3 text-stone-500 italic">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM INTERNATIONAL SHIPPING CHARGE */}
      {/* ======================================================== */}
      {confirmChargeModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#FCDAD7] pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Post-Packing Confirmation</span>
                <h3 className="font-bold text-base text-black">Confirm Shipping: {confirmChargeModal.id}</h3>
              </div>
              <button
                onClick={() => setConfirmChargeModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3.5 text-xs space-y-1.5 border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Customer:</span>
                <strong className="text-black">{confirmChargeModal.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Destination:</span>
                <strong className="text-black">{confirmChargeModal.shipping_country}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Items Subtotal:</span>
                <strong className="font-mono text-black">₹{Number(confirmChargeModal.shipping_subtotal || confirmChargeModal.total_amount).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmInternationalShipping} className="space-y-4">
              <div>
                <label className="font-bold text-xs text-black block mb-1">
                  Confirmed Packed Shipping Charge (₹) *
                </label>
                <div className="flex rounded-xl overflow-hidden border border-[#F8B3AC]/70 focus-within:border-black">
                  <span className="bg-[#FCDAD7] text-black font-bold px-3 py-2 flex items-center border-r border-black/10 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={confirmedChargeInput}
                    onChange={(e) => setConfirmedChargeInput(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none"
                  />
                </div>
                {confirmedChargeInput && !isNaN(Number(confirmedChargeInput)) && (
                  <div className="text-[11px] text-stone-600 mt-1 flex justify-between font-semibold">
                    <span>New Order Total:</span>
                    <span className="font-mono font-bold text-black">
                      ₹{(Number(confirmChargeModal.shipping_subtotal || confirmChargeModal.total_amount) + Number(confirmedChargeInput)).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-xs text-black block mb-1">
                  Packing / Weight Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="e.g. Total packed weight 1.2 kg via DHL Express. Customer approved via WhatsApp."
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl p-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmChargeModal(null)}
                  className="flex-1 py-2.5 border border-stone-300 hover:bg-stone-50 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConfirmingCharge || !confirmedChargeInput}
                  className="flex-1 py-2.5 bg-[#2D1B14] hover:bg-[#3D241A] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isConfirmingCharge ? 'Recording...' : 'Confirm Charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE SHIPPING INVESTIGATION */}
      {/* ======================================================== */}
      {isNewInvOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-stone-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#FCDAD7] pb-3">
              <div>
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Dispute Claim</span>
                <h3 className="font-bold text-base text-black">Open Delivered-Not-Received Investigation</h3>
              </div>
              <button
                onClick={() => setIsNewInvOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateInvestigation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-black block mb-1">Order ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JIZA-102934"
                  value={newInvForm.orderId}
                  onChange={(e) => setNewInvForm({ ...newInvForm, orderId: e.target.value })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3 py-2 font-mono font-bold text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-black block mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    value={newInvForm.customerName}
                    onChange={(e) => setNewInvForm({ ...newInvForm, customerName: e.target.value })}
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-black block mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={newInvForm.customerPhone}
                    onChange={(e) => setNewInvForm({ ...newInvForm, customerPhone: e.target.value })}
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-black block mb-1">Courier Partner</label>
                  <input
                    type="text"
                    placeholder="e.g. BlueDart, Delhivery, DTDC"
                    value={newInvForm.courier}
                    onChange={(e) => setNewInvForm({ ...newInvForm, courier: e.target.value })}
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3 py-2 text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-black block mb-1">Tracking Number / AWB</label>
                  <input
                    type="text"
                    placeholder="AWB Number"
                    value={newInvForm.trackingNumber}
                    onChange={(e) => setNewInvForm({ ...newInvForm, trackingNumber: e.target.value })}
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3 py-2 font-mono text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Complaint Description &amp; Customer Statement *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Customer stated delivery SMS was received at 2:30 PM but no parcel was received. Verified with security."
                  value={newInvForm.complaintDescription}
                  onChange={(e) => setNewInvForm({ ...newInvForm, complaintDescription: e.target.value })}
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl p-2.5 text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewInvOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 hover:bg-stone-50 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInv}
                  className="flex-1 py-2.5 bg-black text-[#FCDAD7] hover:bg-stone-900 font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingInv ? 'Registering...' : 'Open Investigation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: UPDATE INVESTIGATION CASE */}
      {/* ======================================================== */}
      {selectedInv && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-stone-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#FCDAD7] pb-3">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Dispute Resolution SLA (5–7 Days)</span>
                <h3 className="font-bold text-base text-black">Update Case {selectedInv.id}</h3>
              </div>
              <button
                onClick={() => setSelectedInv(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateInvestigation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-black block mb-1">Investigation Status</label>
                  <select
                    value={invUpdateForm.investigationStatus}
                    onChange={(e) => setInvUpdateForm({ ...invUpdateForm, investigationStatus: e.target.value })}
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3 py-2 font-bold text-black focus:outline-none focus:border-black"
                  >
                    <option value="open">Open (Active)</option>
                    <option value="in_review">In Review with Courier</option>
                    <option value="courier_disputed">Courier Disputed (Proof Demanded)</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed / Dismissed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-black block mb-1">Final Resolution</label>
                  <select
                    value={invUpdateForm.resolution}
                    onChange={(e) => setInvUpdateForm({ ...invUpdateForm, resolution: e.target.value })}
                    className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl px-3 py-2 font-bold text-black focus:outline-none focus:border-black"
                  >
                    <option value="">-- Select Resolution --</option>
                    <option value="Replacement Dispatched">Replacement Dispatched</option>
                    <option value="Delivery Proof Provided (Valid)">Delivery Proof Provided (Valid)</option>
                    <option value="Claim Rejected (Invalid Address)">Claim Rejected (Invalid Address)</option>
                    <option value="Claim Rejected (Out of Window)">Claim Rejected (Out of Window)</option>
                    <option value="Full Refund Approved">Full Refund Approved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-black block mb-1">Courier Dispute Notes / Proof Findings</label>
                <textarea
                  rows="3"
                  value={invUpdateForm.investigationNotes}
                  onChange={(e) => setInvUpdateForm({ ...invUpdateForm, investigationNotes: e.target.value })}
                  placeholder="e.g. Courier provided GPS dropoff stamp and signed receiver slip. Verified recipient name."
                  className="w-full bg-[#FFF9F9] border border-[#F8B3AC]/60 rounded-xl p-2.5 text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInv(null)}
                  className="flex-1 py-2.5 border border-stone-300 hover:bg-stone-50 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingInv}
                  className="flex-1 py-2.5 bg-[#2D1B14] hover:bg-[#3D241A] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingInv ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
