import React from 'react';

export default function OrderDetailsModal({
  selectedOrderDetails,
  setSelectedOrderDetails
}) {
  if (!selectedOrderDetails) return null;

  const isPickup = (selectedOrderDetails.fulfillmentType || selectedOrderDetails.fulfillment_type || 'ship').toLowerCase() === 'pickup';
  
  let pDetails = {};
  try {
    pDetails = typeof selectedOrderDetails.pickupDetails === 'string'
      ? JSON.parse(selectedOrderDetails.pickupDetails)
      : (selectedOrderDetails.pickup_details_json 
          ? (typeof selectedOrderDetails.pickup_details_json === 'string' ? JSON.parse(selectedOrderDetails.pickup_details_json) : selectedOrderDetails.pickup_details_json)
          : (selectedOrderDetails.pickupDetails || {}));
  } catch (e) {
    pDetails = {};
  }

  let modHistory = [];
  try {
    modHistory = typeof selectedOrderDetails.modificationHistory === 'string'
      ? JSON.parse(selectedOrderDetails.modificationHistory)
      : (selectedOrderDetails.modification_history_json
          ? (typeof selectedOrderDetails.modification_history_json === 'string' ? JSON.parse(selectedOrderDetails.modification_history_json) : selectedOrderDetails.modification_history_json)
          : (selectedOrderDetails.modificationHistory || []));
  } catch (e) {
    modHistory = [];
  }

  const createdTime = selectedOrderDetails.createdAt || selectedOrderDetails.created_at;
  const elapsedMs = createdTime ? (Date.now() - new Date(createdTime).getTime()) : 99999999;
  const remSec = Math.max(0, Math.floor((7200000 - elapsedMs) / 1000));
  const is2hActive = remSec > 0 && selectedOrderDetails.status !== 'Cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-onyx/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-on-surface border border-[#F7C5C0] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-black text-2xl">receipt_long</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base text-black font-bold">
                  Order {selectedOrderDetails.id}
                </h3>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                  isPickup ? 'bg-purple-50 text-purple-900 border-purple-300' : 'bg-blue-50 text-blue-900 border-blue-300'
                }`}>
                  {isPickup ? '🏪 Store Pickup' : '🚚 Home Delivery'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                Placed: {createdTime ? new Date(createdTime).toLocaleString('en-IN') : 'Recent'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedOrderDetails(null)}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          
          {/* 2-Hour Policy Status Card */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
            selectedOrderDetails.status === 'Cancelled'
              ? 'bg-red-50 text-red-900 border-red-200'
              : is2hActive
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-gray-50 text-gray-700 border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {selectedOrderDetails.status === 'Cancelled' ? 'cancel' : (is2hActive ? 'timer' : 'lock')}
              </span>
              <div>
                <span className="font-bold block text-[11px]">
                  {selectedOrderDetails.status === 'Cancelled' 
                    ? 'Order Cancelled (Inventory Restocked)' 
                    : is2hActive 
                      ? '2-Hour Modification Window Active' 
                      : 'Modification Window Expired / Locked'}
                </span>
                <span className="text-[10px] text-gray-600">
                  {selectedOrderDetails.status === 'Cancelled'
                    ? 'Payment refund initiated'
                    : is2hActive
                      ? `${Math.floor(remSec / 60)} mins remaining for customer edits`
                      : 'Changes locked for dispatch/collection'}
                </span>
              </div>
            </div>
            {is2hActive && (
              <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-mono font-bold rounded text-[10px]">
                {Math.floor(remSec / 60)}m {remSec % 60}s
              </span>
            )}
          </div>

          {/* Customer & Fulfillment Details */}
          <div className="bg-[#FFF0F2]/50 p-4 rounded-xl border border-[#F7C5C0] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Customer Name</p>
                <p className="font-bold text-black">{selectedOrderDetails.customerName || selectedOrderDetails.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Phone Number</p>
                <p className="font-mono font-semibold text-gray-800">{selectedOrderDetails.customerPhone || selectedOrderDetails.customer_phone || 'N/A'}</p>
              </div>
            </div>

            {(selectedOrderDetails.customerEmail || selectedOrderDetails.customer_email) && (
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Email</p>
                <p className="font-medium text-gray-700">{selectedOrderDetails.customerEmail || selectedOrderDetails.customer_email}</p>
              </div>
            )}

            {/* FULFILLMENT SPECIFIC DETAILS */}
            <div className="pt-2 border-t border-outline-variant/30">
              {isPickup ? (
                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-purple-200">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-purple-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-purple-700">storefront</span>
                    <span>Studio Pickup Information:</span>
                  </p>
                  <p><strong className="text-gray-700">Studio:</strong> <span className="font-semibold text-black">{pDetails.storeName || "Jiza Jewellery Studio — Pune"}</span></p>
                  <p className="text-gray-600 text-[11px] leading-relaxed">{pDetails.address || "Shop No.17, 1st Floor, Shivpushp Landmark, Anand Nagar, Pune – 411051"}</p>
                  <p className="pt-1"><strong className="text-gray-700">Pickup Person:</strong> <span className="font-bold text-on-surface">{pDetails.pickupPersonName || selectedOrderDetails.customerName}</span></p>
                  <p><strong className="text-gray-700">Pickup Phone:</strong> <span className="font-mono">{pDetails.pickupPersonPhone || selectedOrderDetails.customerPhone}</span></p>
                  {pDetails.notes && (
                    <p className="text-[11px] bg-amber-50 text-amber-900 p-1.5 rounded border border-amber-200">
                      <strong>Customer Note:</strong> {pDetails.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1 bg-white p-3 rounded-xl border border-blue-200">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-blue-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-blue-700">location_on</span>
                    <span>Home Delivery Address Snapshot:</span>
                  </p>
                  {(() => {
                    const addrStr = selectedOrderDetails.address || selectedOrderDetails.shipping_address || selectedOrderDetails.shippingAddress || '';
                    const line1 = selectedOrderDetails.shippingAddressLine1 || selectedOrderDetails.shipping_address_line1 || '';
                    const line2 = selectedOrderDetails.shippingAddressLine2 || selectedOrderDetails.shipping_address_line2 || '';
                    const city = selectedOrderDetails.shippingCity || selectedOrderDetails.shipping_city || '';
                    const state = selectedOrderDetails.shippingState || selectedOrderDetails.shipping_state || '';
                    const pin = selectedOrderDetails.shippingPincode || selectedOrderDetails.shipping_pincode || '';
                    const country = selectedOrderDetails.shippingCountry || selectedOrderDetails.shipping_country || 'India';

                    let displayAddress = '';
                    if (line1 || city || pin) {
                      const parts = [];
                      if (line1) parts.push(line1);
                      if (line2) parts.push(line2);
                      const cityStatePin = [city, state].filter(Boolean).join(', ') + (pin ? ` - ${pin}` : '');
                      if (cityStatePin) parts.push(cityStatePin);
                      if (country) parts.push(country);
                      displayAddress = parts.join('\n');
                    } else if (addrStr && addrStr.trim()) {
                      displayAddress = addrStr.trim();
                    }

                    return (
                      <p className="text-gray-800 font-mono text-[11px] whitespace-pre-line leading-relaxed">
                        {displayAddress || 'Address on file'}
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
              <p><strong className="text-on-surface-variant">Total Amount:</strong> <span className="text-black font-bold text-sm">{selectedOrderDetails.amount}</span></p>
              <p><strong className="text-on-surface-variant">Status:</strong> <span className="text-on-surface font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{selectedOrderDetails.status}</span></p>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-2">
            <p className="font-bold text-[11px] uppercase tracking-wider text-black">Ordered Items Detail:</p>
            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
              {(() => {
                let parsed = [];
                try {
                  parsed = typeof selectedOrderDetails.itemsJson === 'string'
                    ? JSON.parse(selectedOrderDetails.itemsJson)
                    : (selectedOrderDetails.items_json ? (typeof selectedOrderDetails.items_json === 'string' ? JSON.parse(selectedOrderDetails.items_json) : selectedOrderDetails.items_json) : []);
                } catch (e) {
                  parsed = [];
                }

                if (!Array.isArray(parsed) || parsed.length === 0) {
                  return (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black font-bold">
                      {selectedOrderDetails.items}
                    </div>
                  );
                }

                return parsed.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 p-2.5 bg-gray-50 border border-gray-200/80 rounded-xl items-center text-xs">
                    {item.img && (
                      <img src={item.img} alt={item.title} className="w-10 h-10 object-cover rounded-lg bg-white border border-gray-200" />
                    )}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-on-surface text-[11px] line-clamp-1">{item.title || item.name}</h4>
                      <div className="flex flex-wrap gap-1.5 items-center mt-1 text-[10px]">
                        <span className="text-on-surface-variant font-semibold">Qty: {item.quantity || 1}</span>
                        {item.selectedSize && (
                          <span className="bg-gray-200/60 px-1.5 py-0.2 rounded text-on-surface-variant font-bold">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {(item.selectedColor || item.colour) && (
                          <span className="bg-[#FFF0F2] text-black border border-[#F7C5C0] px-1.5 py-0.2 rounded font-bold">
                            Colour: {item.selectedColor || item.colour}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-bold text-black text-[11px]">
                      ₹{Number(item.price || item.sellingPrice || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Audit Trail & Modification History */}
          {modHistory.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-gray-200">
              <p className="font-bold text-[11px] uppercase tracking-wider text-black flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-black">history_toggle_off</span>
                <span>Order Audit Trail &amp; Modifications ({modHistory.length}):</span>
              </p>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {modHistory.map((hist, hIdx) => (
                  <div key={hIdx} className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-black uppercase">{hist.action?.replace(/_/g, ' ') || 'MODIFICATION'}</span>
                      <span className="text-gray-400 font-mono">
                        {hist.timestamp ? new Date(hist.timestamp).toLocaleString('en-IN') : 'Recent'}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium">
                      Actor: <strong className="capitalize">{hist.actor || 'Customer'}</strong>
                      {hist.reason && ` • Reason: ${hist.reason}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-gray-100 shrink-0">
          <button
            onClick={() => setSelectedOrderDetails(null)}
            className="w-full py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl transition-colors border border-black/20 cursor-pointer shadow"
          >
            Close Order Details
          </button>
        </div>

      </div>
    </div>
  );
}
