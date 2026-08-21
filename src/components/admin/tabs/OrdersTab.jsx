import React, { useState, useEffect } from 'react';

export default function OrdersTab({
  orderDatePreset,
  setOrderDatePreset,
  orderStartDate,
  setOrderStartDate,
  orderEndDate,
  setOrderEndDate,
  searchQuery,
  setSearchQuery,
  orderStatusFilter,
  setOrderStatusFilter,
  filteredOrders = [],
  filteredOrdersValue = 0,
  onUpdateOrderStatus,
  setSelectedOrderDetails,
  isReadOnly = false
}) {
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all'); // 'all', 'ship', 'pickup'
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 2000);
    return () => clearInterval(timer);
  }, []);

  const getOrderRemainingSeconds = (createdAt) => {
    if (!createdAt) return 0;
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const createdMs = new Date(createdAt).getTime();
    const elapsed = nowMs - createdMs;
    return Math.max(0, Math.floor((TWO_HOURS_MS - elapsed) / 1000));
  };

  const formatRemainingTime = (seconds) => {
    if (seconds <= 0) return 'Expired';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Apply fulfillment filter
  const displayedOrders = filteredOrders.filter(o => {
    if (fulfillmentFilter === 'all') return true;
    const fType = (o.fulfillmentType || o.fulfillment_type || 'ship').toLowerCase();
    return fType === fulfillmentFilter;
  });

  const displayedOrdersValue = displayedOrders.reduce((sum, o) => {
    const num = Number(String(o.amount || o.total_amount || 0).replace(/[^0-9.]/g, '')) || 0;
    return sum + num;
  }, 0);

  const shipCount = filteredOrders.filter(o => (o.fulfillmentType || o.fulfillment_type || 'ship').toLowerCase() === 'ship').length;
  const pickupCount = filteredOrders.filter(o => (o.fulfillmentType || o.fulfillment_type || 'ship').toLowerCase() === 'pickup').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Order Date Filter Bar & Controls */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-headline-sm text-base text-black font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-black">calendar_month</span>
              <span>Order Date Range</span>
            </h3>
          </div>

          {/* Date Preset Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOrderDatePreset('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all cursor-pointer ${
                orderDatePreset === 'all'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              All Dates
            </button>

            <button
              onClick={() => setOrderDatePreset('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all cursor-pointer ${
                orderDatePreset === 'today'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              Today
            </button>

            <button
              onClick={() => setOrderDatePreset('yesterday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all cursor-pointer ${
                orderDatePreset === 'yesterday'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={() => setOrderDatePreset('last7')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all cursor-pointer ${
                orderDatePreset === 'last7'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              Last 7 Days
            </button>

            <button
              onClick={() => setOrderDatePreset('thisMonth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all cursor-pointer ${
                orderDatePreset === 'thisMonth'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => setOrderDatePreset('lastMonth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all cursor-pointer ${
                orderDatePreset === 'lastMonth'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              Last Month
            </button>

            <button
              onClick={() => setOrderDatePreset('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all cursor-pointer ${
                orderDatePreset === 'custom'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              Custom Range 📅
            </button>
          </div>
        </div>

        {/* Custom Date Range Pickers */}
        {orderDatePreset === 'custom' && (
          <div className="pt-3 border-t border-outline-variant/30 flex flex-wrap items-center gap-4 bg-[#F9F6F0] p-3 rounded-xl">
            <div className="flex items-center space-x-2 text-xs">
              <label className="font-bold text-on-surface">Start Date:</label>
              <input 
                type="date"
                value={orderStartDate}
                onChange={(e) => setOrderStartDate(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-heritage-gold font-semibold"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <label className="font-bold text-on-surface">End Date:</label>
              <input 
                type="date"
                value={orderEndDate}
                onChange={(e) => setOrderEndDate(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-heritage-gold font-semibold"
              />
            </div>
          </div>
        )}
      </div>

      {/* Fulfillment Toggle Bar + Search & Status Filter Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 px-4 rounded-2xl border border-outline-variant/40 shadow-sm">
        
        {/* Fulfillment Method Segmented Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FCDAD7]/30 rounded-xl border border-black/10">
          <button
            type="button"
            onClick={() => setFulfillmentFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              fulfillmentFilter === 'all'
                ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                : 'text-gray-700 hover:bg-white/60'
            }`}
          >
            All ({filteredOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFulfillmentFilter('ship')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              fulfillmentFilter === 'ship'
                ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                : 'text-gray-700 hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
            <span>Ship ({shipCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFulfillmentFilter('pickup')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              fulfillmentFilter === 'pickup'
                ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                : 'text-gray-700 hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">storefront</span>
            <span>Pickup ({pickupCount})</span>
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-48">
            <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-outline text-[14px]">search</span>
            <input
              type="text"
              placeholder="Search ID, Customer, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 bg-[#F9F6F0] border border-outline-variant rounded-lg pl-7 pr-2 text-xs text-on-surface placeholder-gray-400 focus:outline-none focus:border-black shadow-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-on-surface-variant font-semibold">Status:</span>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="h-8 bg-[#F9F6F0] border border-outline-variant rounded-lg px-2 text-xs text-on-surface font-semibold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Filter Summary Badge */}
          <span className="text-xs font-bold text-black bg-[#FCDAD7] border border-black/15 px-3 py-1.5 rounded-xl shrink-0">
            {displayedOrders.length} Orders (₹{displayedOrdersValue.toLocaleString('en-IN')})
          </span>
        </div>
      </div>

      {/* Order List Table */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-[#FCDAD7]/60 text-black font-label-sm uppercase text-[10px] border-b border-[#F7C5C0]">
              <tr>
                <th className="p-3">ORDER NO.</th>
                <th className="p-3">FULFILLMENT</th>
                <th className="p-3">CUSTOMER &amp; PRODUCTS</th>
                <th className="p-3">PURCHASED ITEMS</th>
                <th className="p-3">TOTAL PAID</th>
                <th className="p-3">2H WINDOW</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-on-surface-variant font-medium">
                    {orderDatePreset === 'today' && 'No orders found for today.'}
                    {orderDatePreset === 'yesterday' && 'No orders found for yesterday.'}
                    {orderDatePreset === 'custom' && 'No orders found for the selected date range.'}
                    {orderDatePreset !== 'today' && orderDatePreset !== 'yesterday' && orderDatePreset !== 'custom' && 'No orders found matching active date and status filters.'}
                  </td>
                </tr>
              ) : (
                displayedOrders.map(o => {
                  let parsedItems = [];
                  try {
                    parsedItems = typeof o.itemsJson === 'string'
                      ? JSON.parse(o.itemsJson)
                      : (o.items_json ? (typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json) : []);
                  } catch (e) {
                    parsedItems = [];
                  }

                  const firstItem = parsedItems[0] || null;
                  const mainTitle = firstItem ? (firstItem.title || firstItem.name || 'Jewellery Item') : (o.items || 'Jewellery Item');
                  const extraCount = parsedItems.length > 1 ? parsedItems.length - 1 : 0;
                  
                  const isPickup = (o.fulfillmentType || o.fulfillment_type || 'ship').toLowerCase() === 'pickup';
                  const remSec = getOrderRemainingSeconds(o.createdAt || o.created_at);
                  const isModified = (o.modificationHistory && o.modificationHistory.length > 0) || (o.modifiedAt || o.modified_at);

                  return (
                    <tr key={o.id} className="hover:bg-[#FFF0F2] transition-colors">
                      
                      {/* 1. ORDER NO. & DATE */}
                      <td className="p-3 font-mono">
                        <span className="font-bold text-black block">{o.order_code || o.id}</span>
                        <span className="text-[10px] text-gray-400 font-sans block">{o.date || 'Recent'}</span>
                        {isModified && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-bold mt-0.5">
                            <span className="material-symbols-outlined text-[10px]">edit</span>
                            <span>Modified</span>
                          </span>
                        )}
                      </td>

                      {/* 2. FULFILLMENT METHOD BADGE */}
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isPickup 
                            ? 'bg-purple-50 text-purple-900 border-purple-200 shadow-2xs' 
                            : 'bg-blue-50 text-blue-900 border-blue-200 shadow-2xs'
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {isPickup ? 'storefront' : 'local_shipping'}
                          </span>
                          <span>{isPickup ? 'Store Pickup' : 'Home Delivery'}</span>
                        </span>
                      </td>

                      {/* 3. CUSTOMER & PRODUCT TITLE */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {firstItem?.img && (
                            <img src={firstItem.img} alt={mainTitle} className="w-9 h-9 object-cover rounded-lg bg-[#FFF0F2] border border-[#F7C5C0] shrink-0" />
                          )}
                          <div>
                            <p className="font-bold text-on-surface text-xs line-clamp-1">{mainTitle}</p>
                            {extraCount > 0 && (
                              <span className="text-[10px] font-semibold text-black bg-[#FCDAD7]/60 px-1.5 py-0.2 rounded border border-black/10 inline-block mt-0.5">
                                + {extraCount} more item(s)
                              </span>
                            )}
                            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                              {o.customerName || o.customer_name || 'Customer'} {o.customerPhone ? `(${o.customerPhone})` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 4. PURCHASED ITEMS */}
                      <td className="p-3">
                        {parsedItems.length > 0 ? (
                          <div className="space-y-1">
                            {parsedItems.map((it, idx) => (
                              <div key={idx} className="text-xs font-mono font-bold text-on-surface flex items-center gap-1.5">
                                <span className="text-black bg-[#FCDAD7]/60 px-1.5 py-0.5 rounded border border-black/10 text-[11px]">
                                  {it.productCode || it.product_code || 'PRD'}
                                </span>
                                <span className="text-gray-500 font-normal">×</span>
                                <span className="text-black font-extrabold">{it.quantity || 1}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant font-medium">{o.items || '1 Item'}</span>
                        )}
                      </td>

                      {/* 5. TOTAL PAID */}
                      <td className="p-3 font-bold text-black font-mono text-xs">
                        ₹{Number(String(o.amount || o.total_amount || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                      </td>

                      {/* 6. 2-HOUR POLICY WINDOW STATUS */}
                      <td className="p-3">
                        {o.status === 'Cancelled' ? (
                          <span className="text-[10px] font-semibold text-gray-400">N/A (Cancelled)</span>
                        ) : remSec > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF0F2] text-black border border-[#F8B3AC]">
                            <span className="material-symbols-outlined text-xs animate-spin text-black">timer</span>
                            <span>{formatRemainingTime(remSec)} left</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                            <span className="material-symbols-outlined text-xs text-gray-400">lock</span>
                            <span>Window Closed</span>
                          </span>
                        )}
                      </td>

                      {/* 7. STATUS DROPDOWN */}
                      <td className="p-3">
                        {isReadOnly ? (
                          <span className={`px-2.5 py-1 rounded text-[11px] font-bold border inline-block ${
                            o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            o.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            o.status === 'Processing' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            o.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-gray-100 text-gray-800 border-gray-300'
                          }`}>
                            {o.status === 'Cancelled' ? '❌ Cancelled' :
                             o.status === 'Delivered' ? (isPickup ? '✅ Collected' : '✅ Delivered') :
                             o.status === 'Shipped' ? (isPickup ? '🏬 Ready for Pickup' : '🚚 Shipped') :
                             o.status === 'Processing' ? '⚙️ Processing' : '⏳ Pending'}
                          </span>
                        ) : o.status === 'Cancelled' ? (
                          <span className="px-2.5 py-1 rounded text-[11px] font-bold border bg-red-100 text-red-800 border-red-300 inline-block">
                            ❌ Cancelled
                          </span>
                        ) : (
                          <select
                            value={o.status}
                            onChange={(e) => onUpdateOrderStatus(o.id, e.target.value)}
                            className={`px-2 py-1 rounded text-[11px] font-bold border focus:outline-none cursor-pointer ${
                              o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              o.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              o.status === 'Processing' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            <option value="Pending" className="bg-white text-on-surface">⏳ Pending</option>
                            <option value="Processing" className="bg-white text-on-surface">⚙️ Processing</option>
                            <option value="Shipped" className="bg-white text-on-surface">{isPickup ? '🏬 Ready for Pickup' : '🚚 Shipped'}</option>
                            <option value="Delivered" className="bg-white text-on-surface">{isPickup ? '✅ Collected' : '✅ Delivered'}</option>
                            <option value="Cancelled" className="bg-white text-on-surface">❌ Cancelled</option>
                          </select>
                        )}
                      </td>

                      {/* 8. INSPECT */}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedOrderDetails(o)}
                          className="px-3 py-1 bg-[#FCDAD7]/60 hover:bg-[#FCDAD7] text-black border border-black/15 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
